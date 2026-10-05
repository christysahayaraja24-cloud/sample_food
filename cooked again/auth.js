'use strict';

const AUTH_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const AUTH_PASSWORD_RE = /^(?=.{8,72}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).*$/;

function authEsc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c];
  });
}

function notify(title, message, type) {
  var wrap = document.getElementById('toasts');
  if (!wrap) return;
  var t = document.createElement('div');
  t.className = 'toast' + (type === 'error' ? ' error' : '');
  t.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-' + (type === 'error' ? 'mail' : 'check') + '"/></svg><div class="toast-body"><strong>' + authEsc(title) + '</strong><span>' + authEsc(message) + '</span></div>';
  wrap.appendChild(t);
  setTimeout(function () {
    t.classList.add('leaving');
    setTimeout(function () { t.remove(); }, 320);
  }, 4800);
}

function authReady() {
  if (window.SB_CONFIG_ERROR) return { ok:false, error:window.SB_CONFIG_ERROR };
  if (!window.sb || !window.sb.auth) return { ok:false, error:'Supabase authentication is not initialized. Check your Supabase configuration.' };
  return { ok:true };
}

function friendlyAuthError(error, action) {
  var message = error && error.message ? String(error.message) : String(error || 'Unknown error');
  var lower = message.toLowerCase();
  var status = error && error.status;
  if (lower === 'failed to fetch' || lower.indexOf('networkerror') >= 0 || lower.indexOf('load failed') >= 0 || lower.indexOf('network request failed') >= 0) {
    return 'Network/CORS connection problem: the browser could not reach Supabase. Check the Project URL in config.js, your internet connection, and that the Supabase project is not paused.';
  }
  if (lower.indexOf('invalid api key') >= 0 || lower.indexOf('invalid jwt') >= 0 || lower.indexOf('no api key') >= 0 || status === 401) {
    return 'Invalid Supabase publishable key. Copy the current Publishable key from Supabase Dashboard \u2192 Project Settings \u2192 API Keys into config.js.';
  }
  if (lower.indexOf('invalid login credentials') >= 0) return 'Incorrect email or password.';
  if (lower.indexOf('email not confirmed') >= 0) return 'Email confirmation required: please confirm your email address (check your inbox) before signing in.';
  if (lower.indexOf('already registered') >= 0 || lower.indexOf('already been registered') >= 0 || lower.indexOf('user_already_exists') >= 0) return 'Email already registered. Please use Sign In instead.';
  if (lower.indexOf('password should be at least') >= 0 || lower.indexOf('password should contain') >= 0 || lower.indexOf('weak password') >= 0 || lower.indexOf('weak_password') >= 0) return 'Invalid password: it does not meet the Supabase password policy.';
  if (lower.indexOf('unable to validate email') >= 0 || lower.indexOf('invalid format') >= 0 || lower.indexOf('is invalid') >= 0 && lower.indexOf('email') >= 0) return 'Invalid email address.';
  if (lower.indexOf('rate limit') >= 0 || status === 429) return 'Too many attempts or emails sent. Please wait a few minutes and try again.';
  if (lower.indexOf('signups not allowed') >= 0 || lower.indexOf('signup is disabled') >= 0 || lower.indexOf('signup_disabled') >= 0) return 'New account registration is disabled in Supabase. Enable email sign-ups in Supabase Dashboard \u2192 Authentication \u2192 Providers \u2192 Email.';
  if (lower.indexOf('database error') >= 0) return 'Database/profile creation failed: run the latest supabase/schema.sql in the Supabase SQL Editor, then try again. (' + message + ')';
  return message || (action + ' failed. Please try again.');
}

/* When a request fails at the network level, find out the real cause. */
async function explainAuthFailure(error, action) {
  var msg = friendlyAuthError(error, action);
  var raw = error && error.message ? String(error.message).toLowerCase() : '';
  var isNetwork = raw === 'failed to fetch' || raw.indexOf('networkerror') >= 0 || raw.indexOf('load failed') >= 0 || raw.indexOf('network request failed') >= 0;
  if (isNetwork && typeof window.sbDiagnose === 'function') {
    try {
      var d = await window.sbDiagnose();
      if (d && !d.ok && d.message) return d.message;
    } catch (e) { /* keep default message */ }
  }
  return msg;
}

var currentUserCache = null;

async function fetchProfile(authUser) {
  var ready = authReady();
  if (!ready.ok) throw new Error(ready.error);
  var meta = (authUser && authUser.user_metadata) || {};
  var email = ((authUser && authUser.email) || '').toLowerCase();
  var fallbackName = String(meta.full_name || email.split('@')[0] || 'Guest');
  var r = await window.sb.from('profiles').select('id,full_name,role,created_at').eq('id', authUser.id).maybeSingle();
  if (r.error || !r.data) {
    // The profile row is created by a database trigger. If it cannot be read, keep the user
    // signed in as a normal (non-admin) user instead of failing the whole login/registration.
    console.warn('Profile row unavailable (run the latest supabase/schema.sql):', r.error ? r.error.message : 'no row found');
    return { id:authUser.id, name:fallbackName, email:email, role:'user', createdAt:null, profileMissing:true };
  }
  return {
    id:r.data.id,
    name:r.data.full_name || fallbackName,
    email:email,
    role:r.data.role,
    createdAt:r.data.created_at
  };
}

async function getCurrentUser() {
  if (currentUserCache) return currentUserCache;
  var ready = authReady();
  if (!ready.ok) return null;
  try {
    var s = await window.sb.auth.getSession();
    if (s.error || !s.data.session) return null;
    var r = await window.sb.auth.getUser(); // verifies the session with the Auth server
    if (r.error || !r.data.user) return null;
    currentUserCache = await fetchProfile(r.data.user);
    return currentUserCache;
  } catch (e) {
    console.warn('Could not load current user:', e && e.message ? e.message : e);
    return null;
  }
}

function isAdminUser(user) { return !!user && user.role === 'admin'; }

async function registerUser(name, email, password) {
  var ready = authReady();
  if (!ready.ok) return { ok:false, error:ready.error };

  var cleanName = String(name).trim();
  var cleanEmail = String(email).trim().toLowerCase();
  if (cleanName.length < 2) return {ok:false,error:'Please enter your full name.'};
  if (!AUTH_EMAIL_RE.test(cleanEmail)) return {ok:false,error:'Invalid email address.'};
  if (!AUTH_PASSWORD_RE.test(password)) return {ok:false,error:'Invalid password: use 8\u201372 characters with at least one uppercase letter, one lowercase letter, one number, and one special character.'};

  try {
    var signupOptions = { data:{full_name:cleanName} };
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      signupOptions.emailRedirectTo = new URL('login.html', window.location.href).href;
    }
    var r = await window.sb.auth.signUp({
      email:cleanEmail,
      password:password,
      options:signupOptions
    });
    if (r.error) return {ok:false,error:await explainAuthFailure(r.error,'Registration')};
    var u = r.data && r.data.user;
    if (!u) return {ok:false,error:'Account could not be created. Please try again.'};
    // With email confirmation on, Supabase hides duplicates by returning a user with no identities.
    if (Array.isArray(u.identities) && u.identities.length === 0) {
      return {ok:false,error:'Email already registered. Please use Sign In instead.'};
    }
    if (!r.data.session) return {ok:true,pendingConfirmation:true,email:cleanEmail};
    currentUserCache = await fetchProfile(u);
    return {ok:true,user:currentUserCache,profileWarning:!!currentUserCache.profileMissing};
  } catch (e) {
    return {ok:false,error:await explainAuthFailure(e,'Registration')};
  }
}

async function loginUser(email,password) {
  var ready = authReady();
  if (!ready.ok) return {ok:false,error:ready.error};
  var cleanEmail = String(email).trim().toLowerCase();
  if (!AUTH_EMAIL_RE.test(cleanEmail)) return {ok:false,error:'Invalid email address.'};
  if (!password) return {ok:false,error:'Please enter your password.'};

  try {
    var r = await window.sb.auth.signInWithPassword({email:cleanEmail,password:password});
    if (r.error) return {ok:false,error:await explainAuthFailure(r.error,'Sign in')};
    if (!r.data.user) return {ok:false,error:'Sign in did not return a user session. Please try again.'};
    currentUserCache = await fetchProfile(r.data.user);
    return {ok:true,user:currentUserCache};
  } catch (e) {
    return {ok:false,error:await explainAuthFailure(e,'Sign in')};
  }
}

async function logoutUser() {
  currentUserCache = null;
  if (window.sb && window.sb.auth) {
    try { await window.sb.auth.signOut(); } catch (e) { console.warn('Sign out failed:', e && e.message); }
  }
}

function renderAccountArea() {
  getCurrentUser().then(function(user) {
    var desktop=document.getElementById('nav-account'),mobile=document.getElementById('mobile-nav-account');
    if(desktop)desktop.innerHTML=user?((isAdminUser(user)?'<a href="admin.html" class="account-link admin-link">Admin Panel</a>':'')+'<span class="account-name" title="'+authEsc(user.email)+'">Hi, '+authEsc(user.name.split(' ')[0])+'</span><button type="button" class="account-logout" data-logout>Logout</button>'):'<a href="login.html" class="account-link">Login</a>';
    if(mobile)mobile.innerHTML=user?('<span class="mobile-account-name">Signed in as '+authEsc(user.name)+(isAdminUser(user)?' (Admin)':'')+'</span>'+(isAdminUser(user)?'<a href="admin.html">Admin Panel</a>':'')+'<button type="button" class="mobile-logout" data-logout>Logout</button>'):'<a href="login.html">Login</a>';
    document.querySelectorAll('[data-logout]').forEach(function(btn){btn.addEventListener('click',function(){logoutUser().then(function(){window.location.reload();});});});
  }).catch(function(e){console.warn('Could not load account state',e);});
}

document.addEventListener('DOMContentLoaded',renderAccountArea);

// Keep the cached user in sync with the Supabase session (login, logout, refresh, other tabs).
if (window.sb && window.sb.auth) {
  window.sb.auth.onAuthStateChange(function (event) {
    if (event === 'SIGNED_OUT' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
      currentUserCache = null;
    }
  });
}

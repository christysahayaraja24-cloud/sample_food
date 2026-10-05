'use strict';

/* Single Supabase client for the whole site.
 * Creates window.sb (the only client) or sets window.SB_CONFIG_ERROR with a clear reason.
 * Also exposes window.sbDiagnose() which pinpoints why requests fail. */
(function () {
  var cfg = window.APP_CONFIG || {};
  var url = String(cfg.supabaseUrl || '').trim().replace(/\/+$/, '');
  var key = String(cfg.supabasePublishableKey || cfg.supabaseAnonKey || '').trim();

  window.SB_CONFIG_ERROR = '';
  window.sb = null;

  function fail(msg, err) {
    window.SB_CONFIG_ERROR = msg;
    if (err) console.error(msg, err); else console.error(msg);
  }

  function jwtRole(token) {
    try {
      var part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      while (part.length % 4) part += '=';
      return String(JSON.parse(atob(part)).role || '');
    } catch (e) { return ''; }
  }

  window.sbDiagnose = null;

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    return fail('Network problem: the Supabase JavaScript library could not be loaded from the CDN. Check your internet connection or ad-blocker.');
  }
  if (!url) {
    return fail('Supabase configuration missing: supabaseUrl is empty in config.js.');
  }
  if (!/^(https:\/\/[a-z0-9.-]+\.[a-z]{2,}|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/i.test(url)) {
    return fail('Invalid Supabase URL "' + url + '". It must look like https://YOUR-PROJECT-REF.supabase.co (no path, no trailing slash).');
  }
  if (!key || /^YOUR_/i.test(key) || /placeholder|undefined|null/i.test(key)) {
    return fail('Supabase configuration missing: the publishable key in config.js is not set. Copy it from Supabase Dashboard \u2192 Project Settings \u2192 API Keys \u2192 Publishable key, and set supabasePublishableKey in config.js.');
  }
  if (/^sb_secret_/i.test(key) || jwtRole(key) === 'service_role') {
    return fail('A secret/service-role key was detected in config.js. Remove it immediately (rotate it in Supabase) and use the publishable key instead.');
  }
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key) && !/^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(key)) {
    return fail('Invalid Supabase publishable key format. It should start with "sb_publishable_" (or be the legacy anon key starting with "eyJ").');
  }

  try {
    window.sb = window.supabase.createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    });
  } catch (e) {
    window.sb = null;
    return fail('Supabase could not be initialized. Check the Project URL and publishable key in config.js.', e);
  }

  /* Reachability check against the Auth API. Never logs keys or tokens. */
  var diagPromise = null;
  window.sbDiagnose = function () {
    if (diagPromise) return diagPromise;
    diagPromise = (async function () {
      try {
        var res = await fetch(url + '/auth/v1/settings', { headers: { apikey: key } });
        if (res.status === 401 || res.status === 403) {
          return { ok: false, kind: 'key', message: 'Invalid Supabase publishable key: the project rejected it. Copy the current Publishable key from Supabase Dashboard \u2192 Project Settings \u2192 API Keys into config.js.' };
        }
        if (res.status === 404) {
          return { ok: false, kind: 'url', message: 'Invalid Supabase URL: the project was not found at ' + url + '. Check the project reference in config.js.' };
        }
        if (!res.ok) {
          return { ok: false, kind: 'server', message: 'Supabase responded with HTTP ' + res.status + '. The project may be paused or unavailable \u2014 check the Supabase Dashboard.' };
        }
        var s = {};
        try { s = await res.json(); } catch (e) { /* ignore */ }
        return { ok: true, signupDisabled: !!s.disable_signup, settings: s };
      } catch (e) {
        return { ok: false, kind: 'network', message: 'Network/CORS connection problem: the browser could not reach ' + url + '. Check the Project URL for typos (the project reference must be exact), make sure the project is not paused, and check your internet connection, VPN or ad-blocker. If the page was opened as a file://, serve it over http(s) instead.' };
      }
    })();
    return diagPromise;
  };
})();

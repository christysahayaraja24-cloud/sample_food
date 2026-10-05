A COOKED AGAIN — Supabase-backed restaurant website

AUTHENTICATION / SUPABASE SETUP
-------------------------------
1. Supabase Dashboard -> Project Settings -> API Keys: copy the PUBLISHABLE key (sb_publishable_...).
2. Open config.js and replace YOUR_SUPABASE_PUBLISHABLE_KEY with it (Project URL is already set;
   verify it matches Project Settings -> API -> Project URL).
   Or generate config.js from env vars: SUPABASE_URL=... SUPABASE_PUBLISHABLE_KEY=... npm run configure
   (npm run build does the same on hosts like Netlify/Vercel, and keeps config.js if no vars are set).
3. Run supabase/schema.sql in the Supabase SQL Editor (creates tables, RLS policies and the
   profile trigger; safe to re-run).
4. Authentication -> Providers -> Email: keep "Enable sign ups" on. If "Confirm email" is on, add your
   site's login.html URL under Authentication -> URL Configuration (Site URL / Redirect URLs).
5. The first account created becomes Admin.

SECURITY
--------
- config.js is public: only the Project URL and publishable/anon key may be in it.
- NEVER put a service_role / sb_secret_ key in any website file (the client rejects them).
- Passwords are handled only by Supabase Auth. RLS (supabase/schema.sql) protects the data.

TROUBLESHOOTING
---------------
The login page runs a startup check and reports: configuration missing, invalid URL,
invalid publishable key, or network/CORS problem. Open the site through http(s) (not file://).

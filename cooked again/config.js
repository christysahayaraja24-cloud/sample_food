/* A COOKED AGAIN - browser-safe Supabase configuration (single source of truth).
 *
 * Only the Project URL and the PUBLISHABLE key (sb_publishable_...) belong here.
 * The legacy "anon" public key (eyJ...) also works.
 * NEVER put a secret / service_role key in this file - it is public to every visitor.
 *
 * Get the key: Supabase Dashboard -> Project Settings -> API Keys -> "Publishable key".
 * Get the URL: Supabase Dashboard -> Project Settings -> API -> Project URL.
 *
 * For production builds you can generate this file from environment variables:
 *   SUPABASE_URL=... SUPABASE_PUBLISHABLE_KEY=... npm run configure
 */
window.APP_CONFIG = {
  supabaseUrl: 'https://bhdijinbrrmwwzyzegqz.supabase.co',
  supabasePublishableKey: 'sb_publishable_iMaG-9vHK2noFDs1ENspAg_7ewypVmo'
};

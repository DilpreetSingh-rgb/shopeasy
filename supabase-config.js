// supabase-config.js

const SUPABASE_URL = "https://alarnqlietlhhuneeuik.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_YsRFmXCEGIwxT7lpwyzh-w_fq3But4d";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
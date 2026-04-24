import { createClient } from "@supabase/supabase-js";


const supabaseUrl = "https://zstlhgvvoiimcnsagexv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdGxoZ3Z2b2lpbWNuc2FnZXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNTMxMDUsImV4cCI6MjA4MjgyOTEwNX0.rBOqSWXtiwPrq1NMxkmHcLopx88RWNgPLGuf1ubM5W8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);



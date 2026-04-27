import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zstlhgvvoiimcnsagexv.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdGxoZ3Z2b2lpbWNuc2FnZXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNTMxMDUsImV4cCI6MjA4MjgyOTEwNX0.rBOqSWXtiwPrq1NMxkmHcLopx88RWNgPLGuf1ubM5W8"
)

export async function GET() {
  const { data, error } = await supabase.from("problems").select("*")

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
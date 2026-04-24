import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { problem_id } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Login necessário' }, { status: 401 });
  }

  const { error } = await supabase
    .from('confirmations')
    .insert({ user_id: user.id, problem_id });

  if (error) {
    if (error.code === '23505') { // unique constraint violation
      return NextResponse.json({ error: 'Já confirmaste este problema' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
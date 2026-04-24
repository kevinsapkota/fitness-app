// frontend/app/dashboard/components/ConfirmButton.tsx
'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ConfirmButtonProps {
  problemId: string;
}

export default function ConfirmButton({ problemId }: ConfirmButtonProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkConfirmation = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('confirmations')
        .select('*')
        .eq('user_id', user.id)
        .eq('problem_id', problemId)
        .single();

      if (data) setConfirmed(true);
    };

    checkConfirmation();
  }, [problemId]);

  const handleConfirm = async () => {
    setLoading(true);

    const res = await fetch('/api/problems', {
      method: 'POST',
      body: JSON.stringify({ problem_id: problemId }),
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await res.json();

    if (res.ok) {
      setConfirmed(true);
      alert('Confirmado 👍');
    } else {
      alert(result.error);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleConfirm}
      disabled={confirmed || loading}
      className={`px-2 py-1 rounded ${confirmed ? 'bg-gray-400' : 'bg-green-500'} text-white`}
    >
      {confirmed ? 'Confirmado' : loading ? 'A confirmar...' : 'Confirmar'}
    </button>
  );
}
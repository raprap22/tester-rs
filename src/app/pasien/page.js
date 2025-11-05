'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import PoliFilter from '@/components/PoliFilter';

export default function PasienPage() {
  const [queues, setQueues] = useState([]);
  const [selectedPoli, setSelectedPoli] = useState([]);

  async function fetchQueues() {
    const { data } = await supabase.from('queues').select('*').order('id', { ascending: true });
    setQueues(data || []);
  }

  useEffect(() => {
    fetchQueues();

    const channel = supabase
      .channel('queue-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queues' }, () =>
        fetchQueues()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const filteredQueues =
    selectedPoli.length > 0
      ? queues.filter((q) => selectedPoli.includes(q.poli.toLowerCase()))
      : queues;

  return (
    <div style={{ padding: '40px' }}>
      <PoliFilter selectedPoli={selectedPoli} setSelectedPoli={setSelectedPoli} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginTop: '30px',
        }}
      >
        {filteredQueues.map((q) => (
          <div
            key={q.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              background: '#fafafa',
            }}
          >
            <h3 style={{ textTransform: 'capitalize' }}>Poli {q.poli}</h3>
            <p style={{ fontSize: '2.5em', fontWeight: 'bold' }}>{q.current_number}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

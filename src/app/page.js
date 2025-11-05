"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Home() {
  const [poli, setPoli] = useState("Umum");
  const [inputPoli, setInputPoli] = useState("Umum");
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ambil data antrian & subscribe realtime
  useEffect(() => {
    if (!poli) return;

    setLoading(true);
    fetchQueue(poli).finally(() => setLoading(false));

    const channel = supabase
      .channel("public:queues")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queues", filter: `poli=eq.${poli}` },
        (payload) => {
          if (payload.new) setCurrent(payload.new.current_number);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [poli]);

  // Fungsi ambil data
  async function fetchQueue(poliName) {
    setError(null);
    try {
      const { data, error } = await supabase
        .from("queues")
        .select("current_number")
        .eq("poli", poliName)
        .single();

      if (error && error.code === "PGRST116") {
        setCurrent(0);
        return;
      }
      if (error) throw error;
      setCurrent(data?.current_number ?? 0);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data");
    }
  }

  // Tombol Next
  async function handleNext() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc("increment_queue", { _poli: poli });
      if (error) throw error;
      const val = Array.isArray(data) ? data[0] : data;
      setCurrent(val?.current_number ?? current + 1);
    } catch (err) {
      console.error(err);
      setError("Gagal menambah nomor");
    } finally {
      setLoading(false);
    }
  }

  // Tombol Reset
  async function handleReset() {
    const confirmed = confirm(`Reset antrian untuk poli "${poli}" menjadi 0?`);
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    try {
      const { data: existing } = await supabase
        .from("queues")
        .select("id")
        .eq("poli", poli)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("queues")
          .update({ current_number: 0 })
          .eq("poli", poli);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("queues")
          .insert([{ poli, current_number: 0 }]);
        if (error) throw error;
      }

      setCurrent(0);
    } catch (err) {
      console.error(err);
      setError("Gagal reset antrian");
    } finally {
      setLoading(false);
    }
  }

  // Ganti poli custom
  function applyPoli() {
    setPoli(inputPoli.trim() || "Umum");
  }

  return (
    <main className="container">
      <h1>Antrian Rumah Sakit</h1>

      <div className="card">
        <label>
          Nama Poli (custom):
          <input
            value={inputPoli}
            onChange={(e) => setInputPoli(e.target.value)}
          />
        </label>
        <button onClick={applyPoli}>Pilih</button>
      </div>

      <div className="card">
        <h2>Poli: {poli}</h2>
        <div className="current">
          <span className="label">Nomor Saat Ini</span>
          <span className="number">{current === null ? "-" : current}</span>
        </div>

        <div className="actions">
          <button onClick={handleNext} disabled={loading}>
            Next
          </button>
          <button onClick={handleReset} disabled={loading}>
            Reset
          </button>
        </div>

        {error && <p className="error">{error}</p>}
      </div>

      <footer>
        <small>Realtime via Supabase • Simple CSS</small>
      </footer>
    </main>
  );
}

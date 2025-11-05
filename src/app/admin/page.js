"use client"
import { useEffect, useState, useRef } from "react"
import { supabase } from "../../../lib/supabase"
import PoliFilter from "@/components/PoliFilter"

export default function AdminPage() {
  const [queues, setQueues] = useState([])
  const [selectedPoli, setSelectedPoli] = useState([])
  const isFetching = useRef(false)
console.log('selectedPoli', selectedPoli);
console.log('queues', queues);

  async function fetchQueues() {
    if (isFetching.current) return
    isFetching.current = true
    const { data, error } = await supabase.from("queues").select("*").order("id", { ascending: true })
    if (!error && data) setQueues(data)
    isFetching.current = false
  }

  useEffect(() => {
    fetchQueues()

    const channel = supabase
      .channel("queue-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "queues" }, () => {
        setTimeout(fetchQueues, 200)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function nextQueue(poli) {
    await supabase.rpc("increment_queue", { _poli: poli })
    fetchQueues()
  }

  async function resetQueue(poli) {
    await supabase.rpc("reset_queue", { _poli: poli })
    fetchQueues()
  }

  const filteredQueues = selectedPoli.length > 0
    ? queues.filter(q => selectedPoli.includes(q.poli.toLowerCase()))
    : queues

  return (
    <div style={{ padding: "40px" }}>
      <h1>Admin - Pemanggilan Antrian</h1>

      <PoliFilter selectedPoli={selectedPoli} setSelectedPoli={setSelectedPoli} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginTop: "30px"
      }}>
        {filteredQueues.map((q) => (
          <div key={q.id} style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "20px",
            textAlign: "center",
            background: "white"
          }}>
            <h3 style={{ textTransform: 'capitalize' }}>Poli {q.poli}</h3>
            <p style={{ fontSize: "2em", margin: "10px 0" }}>{q.current_number}</p>
            <button onClick={() => nextQueue(q.poli)} style={{ marginRight: "10px" }}>Next</button>
            <button onClick={() => resetQueue(q.poli)} style={{ background: "#f66", color: "white" }}>Reset</button>
          </div>
        ))}
      </div>
    </div>
  )
}

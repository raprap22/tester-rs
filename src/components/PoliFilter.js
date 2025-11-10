'use client';
import { useEffect, useRef, useState } from 'react';

const poliList = [
  ['Saraf', 'Eksekutif'],
  ['THT', 'Geriatric'],
  ['Obgyn', 'Onkologi'],
  ['Psiko', 'Mata', 'Anak'],
  ['Jiwa', 'Kulit'],
  ['Bedah Umum', 'Bedah Syaraf', 'Bedah Urologi', 'Bedah Vaskuler', 'Bedah Orthopedic'],
  ['Jantung', 'Internis', 'Paru'],
  ['Gigi Prostodonti', 'Gigi Bedah Mulut'],
];

export default function PoliFilter({ selectedPoli, setSelectedPoli }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const toggle = () => setOpen(!open);

  const handleChange = (poli) => {
    const poliArray = poli.split(' - ').map((p) => p.toLowerCase());

    const allExist = poliArray.every((p) => selectedPoli.includes(p));

    if (allExist) {
      setSelectedPoli(selectedPoli.filter((p) => !poliArray.includes(p)));
    } else {
      setSelectedPoli([...new Set([...selectedPoli, ...poliArray])]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: '20px' }}>
      {/* tampilkan selectedPoli di "input" */}
      <div
        onClick={toggle}
        style={{
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '6px',
          background: '#fff',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '38px',
        }}
      >
        <span style={{ color: selectedPoli.length ? '#000' : '#aaa' }}>
          {selectedPoli.length > 0 ? selectedPoli.join(', ') : 'Filter Poli'}
        </span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>
          ▾
        </span>
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '105%',
            left: 0,
            width: '100%',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '6px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 10,
            padding: '10px',
          }}
        >
          {poliList.map((group, groupIdx) => {
            const poliLabel = group.join(' - ');
            const groupKeys = group.map((g) => g.toLowerCase());

            const isChecked = groupKeys.every((p) => selectedPoli.includes(p));

            return (
              <label
                key={groupIdx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 0',
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleChange(poliLabel)}
                />
                {poliLabel}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

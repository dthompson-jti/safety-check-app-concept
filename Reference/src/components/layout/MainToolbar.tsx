import { useState } from 'react';

export default function MainToolbar({ onToggleAdd }: { onToggleAdd: () => void }) {
  const [active, setActive] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 8, padding: 8, borderBottom: '1px solid #eee' }}>
      <button
        aria-pressed={active}
        title="Toggle Add Panel"
        onClick={() => {
          setActive((v) => !v);
          onToggleAdd();
        }}
      >
        +
      </button>
    </div>
  );
}

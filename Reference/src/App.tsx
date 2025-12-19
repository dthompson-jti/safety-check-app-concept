import { useState } from 'react';
import MainToolbar from '@components/layout/MainToolbar';

export default function App() {
  const [showAdd, setShowAdd] = useState(true);

  return (
    <div style={{ height: '100vh', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <MainToolbar onToggleAdd={() => setShowAdd((v) => !v)} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showAdd ? '280px 1fr 320px' : '280px 1fr',
          minHeight: 0
        }}
      >
        <aside style={{ borderRight: '1px solid #eee', padding: 8 }}>Browser</aside>
        <main style={{ padding: 8 }}>Canvas</main>
        {showAdd && <aside style={{ borderLeft: '1px solid #eee', padding: 8 }}>Add Panel</aside>}
      </div>
    </div>
  );
}

// src/features/Overlays/DeveloperOverlay.tsx
import { useAtom } from 'jotai';
import { connectionStatusAtom, ConnectionStatus } from '../../data/atoms';
import { IconToggleGroup } from '../../components/IconToggleGroup';
// REORG: Updated import path for CSS module to match filename
import styles from './DeveloperOverlay.module.css';

const connectionOptions: { value: ConnectionStatus; label: string; icon: string }[] = [
  { value: 'online', label: 'Online', icon: 'cloud' },
  { value: 'offline', label: 'Offline', icon: 'cloud_off' },
];

// REORG: Renamed component to match filename
export const DeveloperOverlay = () => {
  const [connectionStatus, setConnectionStatus] = useAtom(connectionStatusAtom);

  return (
    <div className={styles.container}>
      <div className={styles.settingSection}>
        <h3 className={styles.sectionHeader}>Connectivity</h3>
        <p className={styles.sectionHelper}>Simulate the application's network connection status.</p>
        <IconToggleGroup
          options={connectionOptions}
          value={connectionStatus}
          // FIX: The `val` parameter is already correctly typed by inference.
          // The function can be passed directly for maximum simplicity.
          onValueChange={setConnectionStatus}
          id="connection-status-toggle"
        />
      </div>
    </div>
  );
};
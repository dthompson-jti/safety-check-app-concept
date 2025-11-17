// src/features/Overlays/NfcRoomListItem.tsx
import { useAtomValue } from 'jotai';
import { provisionedRoomIdsAtom } from '../../data/nfcAtoms';
import { ActionListItem } from '../../components/ActionListItem';
import styles from '../Workflow/ProvisionNfcView.module.css';

interface NfcRoomListItemProps {
  roomId: string;
  roomName: string;
  onClick: () => void;
}

export const NfcRoomListItem = ({ roomId, roomName, onClick }: NfcRoomListItemProps) => {
  const provisionedIds = useAtomValue(provisionedRoomIdsAtom);
  const isProvisioned = provisionedIds.has(roomId);

  return (
    <ActionListItem onClick={onClick}>
      <div className={styles.listItemContent}>
        {/* DEFINITIVE FIX: Wrap the icon in a container that always reserves space. */}
        <div className={styles.iconContainer}>
          {isProvisioned && (
            <span className={`material-symbols-rounded ${styles.successIcon}`}>
              check_circle
            </span>
          )}
        </div>
        <span className={styles.listItemTitle}>{roomName}</span>
      </div>
    </ActionListItem>
  );
};
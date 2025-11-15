// src/features/Overlays/NfcRoomListItem.tsx
import { useAtomValue } from 'jotai';
import { provisionedRoomIdsAtom } from '../../data/nfcAtoms';
import { ActionListItem } from '../../components/ActionListItem';
import styles from './WriteNfcTagModal.module.css'; // Re-use styles

interface NfcRoomListItemProps {
  roomId: string;
  roomName: string;
  onClick: () => void;
}

export const NfcRoomListItem = ({ roomId, roomName, onClick }: NfcRoomListItemProps) => {
  const provisionedIds = useAtomValue(provisionedRoomIdsAtom);
  const isProvisioned = provisionedIds.has(roomId);

  return (
    <ActionListItem onClick={onClick} disabled={isProvisioned}>
      <div className={styles.listItemContent}>
        <span className={styles.listItemTitle}>{roomName}</span>
        {isProvisioned && (
          <span className={`material-symbols-rounded ${styles.successIcon}`}>
            check_circle
          </span>
        )}
      </div>
    </ActionListItem>
  );
};
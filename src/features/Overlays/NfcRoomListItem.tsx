// src/features/Overlays/NfcRoomListItem.tsx
import { useAtomValue } from 'jotai';
import { provisionedRoomIdsAtom } from '../../data/nfcAtoms';
import { ActionListItem } from '../../components/ActionListItem';
import styles from './ProvisionNfcModal.module.css'; // Use styles from the new modal

interface NfcRoomListItemProps {
  roomId: string;
  roomName: string;
  onClick: () => void;
}

export const NfcRoomListItem = ({ roomId, roomName, onClick }: NfcRoomListItemProps) => {
  const provisionedIds = useAtomValue(provisionedRoomIdsAtom);
  const isProvisioned = provisionedIds.has(roomId);

  return (
    // DEFINITIVE FIX: The `disabled` prop is removed. The item remains interactive.
    <ActionListItem onClick={onClick}>
      <div className={styles.listItemContent}>
        {/* DEFINITIVE FIX: The icon is now rendered on the left. */}
        {isProvisioned && (
          <span className={`material-symbols-rounded ${styles.successIcon}`}>
            check_circle
          </span>
        )}
        <span className={styles.listItemTitle}>{roomName}</span>
      </div>
    </ActionListItem>
  );
};
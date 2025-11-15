// src/features/Overlays/NfcRoomListItem.tsx
import { useAtomValue } from 'jotai';
import { provisionedRoomIdsAtom } from '../../data/nfcAtoms';
import { ActionListItem } from '../../components/ActionListItem';
// DEFINITIVE FIX: The import path is updated to the new view's CSS module.
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
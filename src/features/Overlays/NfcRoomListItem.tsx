// src/features/Overlays/NfcRoomListItem.tsx
import { ActionListItem } from '../../components/ActionListItem';
import styles from '../Workflow/NfcWriteView.module.css';

interface NfcRoomListItemProps {
  roomId: string;
  roomName: string;
  onClick: () => void;
}

export const NfcRoomListItem = ({ roomName, onClick }: NfcRoomListItemProps) => {
  // Removed provisioned state check and icon logic.
  return (
    <ActionListItem onClick={onClick}>
      <div className={styles.listItemContent}>
        {/* 
          We keep the icon container to maintain alignment if we add icons back later,
          or we could remove it. For now, keeping it empty preserves structure.
        */}
        <div className={styles.iconContainer}>
          {/* Icon removed */}
        </div>
        <span className={styles.listItemTitle}>{roomName}</span>
      </div>
    </ActionListItem>
  );
};
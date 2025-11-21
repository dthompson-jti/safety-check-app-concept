// src/features/Overlays/NfcRoomListItem.tsx
import styles from './NfcRoomListItem.module.css';

interface NfcRoomListItemProps {
  roomId: string;
  roomName: string;
  onClick: () => void;
}

export const NfcRoomListItem = ({ roomId, roomName, onClick }: NfcRoomListItemProps) => {
  return (
    <button className={styles.listItem} onClick={onClick} type="button">
      <div className={styles.listItemContent}>
        <div className={styles.iconContainer}>
          <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>meeting_room</span>
        </div>
        <span className={styles.listItemTitle}>{roomName}</span>
      </div>
      <span className={`material-symbols-rounded ${styles.chevron}`}>chevron_right</span>
    </button>
  );
};
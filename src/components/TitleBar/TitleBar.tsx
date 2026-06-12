import { getCurrentWindow } from '@tauri-apps/api/window';
import { useSettingsStore } from '../../store/settingsStore';
import styles from './TitleBar.module.css';

function TitleBar() {
  const setMiniMode = useSettingsStore((state) => state.setMiniMode);
  const petMode = useSettingsStore((state) => state.petMode);
  const setPetMode = useSettingsStore((state) => state.setPetMode);

  return (
    <div className={styles.titlebar} data-tauri-drag-region>
      <span className={styles.title} data-tauri-drag-region>WHERE IS MY MIND?</span>
      <div className={styles.controls}>
        <button
          className={`${styles.btn} ${petMode ? styles.btnActive : ''}`}
          onClick={() => setPetMode(!petMode)}
          title={petMode ? 'Hide pet' : 'Desktop pet'}
        >
          CAT
        </button>
        <button className={styles.btn} onClick={() => setMiniMode(true)} title="Mini mode">
          ▼
        </button>
        <button className={styles.btn} onClick={() => getCurrentWindow().minimize()} title="Minimize">
          _
        </button>
        <button className={styles.btn} onClick={() => getCurrentWindow().close()} title="Close">
          X
        </button>
      </div>
    </div>
  );
}

export default TitleBar;

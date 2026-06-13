import { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { LogicalSize } from '@tauri-apps/api/dpi';
import TitleBar from './components/TitleBar/TitleBar';
import Notepad from './modules/notepad/Notepad';
import Player from './modules/player/Player';
import MiniPlayer from './modules/player/MiniPlayer';
import Pet from './modules/pet/Pet';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import { useSettingsStore } from './store/settingsStore';
import styles from './App.module.css';

function App() {
  const [activeTab, setActiveTab] = useState<'notepad' | 'player'>('notepad');
  const [showSettings, setShowSettings] = useState(false);
  const theme = useSettingsStore((state) => state.theme);
  const miniMode = useSettingsStore((state) => state.miniMode);
  const petMode = useSettingsStore((state) => state.petMode);

  // Apply theme to <html> so all CSS (including borders and box-shadows on
  // top-level elements) picks up the correct CSS variable overrides.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const updateWindowSize = async () => {
      const win = getCurrentWindow();
      if (miniMode) {
        await win.setSize(new LogicalSize(320, 145));
        await win.setResizable(false);
      } else {
        await win.setSize(new LogicalSize(420, 560));
        await win.setResizable(false);
      }
    };
    updateWindowSize();
  }, [miniMode]);

  if (miniMode) {
    return (
      <div className={styles.app}>
        <MiniPlayer />
        {petMode && <Pet />}
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <TitleBar />

      <div className={styles.content}>
        {activeTab === 'notepad' && <Notepad />}
        {activeTab === 'player' && <Player />}
      </div>

      <nav className={styles.tabbar}>
        <button
          className={`${styles.tab} ${activeTab === 'notepad' ? styles.active : ''}`}
          onClick={() => setActiveTab('notepad')}
        >
          NOTEPAD
        </button>
        <button
          className={`${styles.settingsBtn} ${showSettings ? styles.settingsBtnActive : ''}`}
          onClick={() => setShowSettings((v) => !v)}
          title="Settings"
        >
          ⚙
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'player' ? styles.active : ''}`}
          onClick={() => setActiveTab('player')}
        >
          PLAYER
        </button>
      </nav>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {petMode && <Pet />}
    </div>
  );
}

export default App;

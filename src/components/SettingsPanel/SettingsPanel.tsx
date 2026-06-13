import { useSettingsStore } from '../../store/settingsStore';
import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
  onClose: () => void;
}

type ThemeOption = {
  id: 'green' | 'amber' | 'white' | 'light';
  name: string;
  previewClass: string;
};

type PetOption = {
  id: 'cat' | 'penguin' | 'rabbit';
  name: string;
  label: string;
};

const THEMES: ThemeOption[] = [
  { id: 'green', name: 'TERMINAL', previewClass: styles.previewGreen },
  { id: 'amber', name: 'AMBER',    previewClass: styles.previewAmber },
  { id: 'white', name: 'GHOST',    previewClass: styles.previewWhite },
  { id: 'light', name: 'PAPER',    previewClass: styles.previewLight },
];

const PETS: PetOption[] = [
  { id: 'cat',     name: 'CAT',     label: '=^.^=' },
  { id: 'penguin', name: 'PENGUIN', label: '<(o_o)>' },
  { id: 'rabbit',  name: 'RABBIT',  label: '(>_<)' },
];

function SettingsPanel({ onClose }: SettingsPanelProps) {
  const theme    = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const petType    = useSettingsStore((state) => state.petType);
  const setPetType = useSettingsStore((state) => state.setPetType);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>SETTINGS</h2>
          <button className={styles.closeBtn} onClick={onClose}>X</button>
        </div>

        <div className={styles.body}>
          <div className={styles.sectionLabel}>THEME</div>
          <div className={styles.themeGrid}>
            {THEMES.map((themeOption) => (
              <button
                key={themeOption.id}
                className={`${styles.themeBtn} ${theme === themeOption.id ? styles.selected : ''}`}
                onClick={() => setTheme(themeOption.id)}
              >
                <div className={`${styles.themePreview} ${themeOption.previewClass}`} data-label="Aa" />
                <div className={styles.themeName}>{themeOption.name}</div>
              </button>
            ))}
          </div>

          <div className={`${styles.sectionLabel} ${styles.sectionLabelSpaced}`}>PET</div>
          <div className={styles.petGrid}>
            {PETS.map((pet) => (
              <button
                key={pet.id}
                className={`${styles.petBtn} ${petType === pet.id ? styles.selected : ''}`}
                onClick={() => setPetType(pet.id)}
              >
                <div className={styles.petPreview}>{pet.label}</div>
                <div className={styles.themeName}>{pet.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;

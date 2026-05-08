// Bottone toggle per alternare tema chiaro/scuro.
// Mostra un'icona sole o luna a seconda del tema corrente; al click chiama onToggle.
import styles from './ThemeToggle.module.css';

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';
  const label = isDark ? 'Passa al tema chiaro' : 'Passa al tema scuro';
  const icon = isDark ? '☀️' : '🌙';

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      <span className={styles.icon} aria-hidden="true">{icon}</span>
    </button>
  );
}

export default ThemeToggle;

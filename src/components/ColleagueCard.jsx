// Singola card cliccabile che rappresenta un collega.
// Mostra nome e cognome; evidenzia visivamente la card se il collega è già nel carrello.
import styles from './ColleagueCard.module.css';

function ColleagueCard({ colleague, onSelect, inCart }) {
  return (
    <button
      className={`${styles.card} ${inCart ? styles.inCart : ''}`}
      onClick={() => onSelect(colleague)}
      aria-label={`Seleziona ${colleague.nome} ${colleague.cognome}`}
    >
      <span className={styles.name}>
        {colleague.nome}
        {colleague.cognome ? ` ${colleague.cognome}` : ''}
      </span>
      {inCart && <span className={styles.badge}>✓ Nel carrello</span>}
    </button>
  );
}

export default ColleagueCard;

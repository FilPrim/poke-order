// Singola card cliccabile che rappresenta un collega.
// Mostra nome e cognome; evidenzia visivamente la card se il collega è già nel carrello.
// Se il collega è già nel carrello il bottone è disabilitato (niente duplicati).
import styles from './ColleagueCard.module.css';

function ColleagueCard({ colleague, onSelect, onRemove, inCart }) {
  const fullName = `${colleague.nome}${colleague.cognome ? ` ${colleague.cognome}` : ''}`;

  function handleRemove(e) {
    e.stopPropagation();
    if (window.confirm(`Sei sicuro di voler rimuovere ${fullName}?`)) {
      onRemove(colleague.id);
    }
  }

  return (
    <div className={`${styles.wrapper} ${inCart ? styles.inCart : ''}`}>
      <button
        className={styles.card}
        onClick={() => !inCart && onSelect(colleague)}
        disabled={inCart}
        aria-label={inCart ? `${fullName} già nel carrello` : `Seleziona ${fullName}`}
      >
        <span className={styles.name}>{fullName}</span>
        {inCart && <span className={styles.badge}>✓ Nel carrello</span>}
      </button>
      {onRemove && (
        <button
          className={styles.deleteBtn}
          onClick={handleRemove}
          aria-label={`Elimina ${fullName}`}
          title={`Elimina ${fullName}`}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default ColleagueCard;

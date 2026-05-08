// Griglia di card cliccabili con tutti i colleghi.
// Riceve il Set degli id già presenti nel carrello, la callback di rimozione collega
// e la callback per aprire il form di aggiunta nuovo collega.
import ColleagueCard from './ColleagueCard';
import styles from './ColleagueList.module.css';

function ColleagueList({ colleagues, onSelect, onRemove, onNewColleague, cartIds }) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Colleghi</h2>
        <button className={styles.newBtn} onClick={onNewColleague}>
          + Nuova Poké
        </button>
      </div>
      <div className={styles.grid}>
        {colleagues.map((colleague) => (
          <ColleagueCard
            key={colleague.id}
            colleague={colleague}
            onSelect={onSelect}
            onRemove={onRemove}
            inCart={cartIds.has(colleague.id)}
          />
        ))}
      </div>
    </section>
  );
}

export default ColleagueList;

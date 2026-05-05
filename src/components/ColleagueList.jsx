// Griglia di card cliccabili con tutti i colleghi.
// Riceve il Set degli id già presenti nel carrello per evidenziare le card corrispondenti.
import ColleagueCard from './ColleagueCard';
import styles from './ColleagueList.module.css';

function ColleagueList({ colleagues, onSelect, cartIds }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Colleghi</h2>
      <div className={styles.grid}>
        {colleagues.map((colleague) => (
          <ColleagueCard
            key={colleague.id}
            colleague={colleague}
            onSelect={onSelect}
            inCart={cartIds.has(colleague.id)}
          />
        ))}
      </div>
    </section>
  );
}

export default ColleagueList;

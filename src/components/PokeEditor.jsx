// Mostra la poké base di un collega e permette di modificarla prima di confermarla.
// Se il collega ha defaultPoke:true, mostra solo il nome fisso senza editor.
// Altrimenti mostra un riepilogo della poké base con possibilità di entrare in modalità modifica
// (checkbox per categoria, con quelle della base già spuntate).
import { useState } from 'react';
import styles from './PokeEditor.module.css';

const CATEGORIE = [
  { key: 'base', label: 'Base' },
  { key: 'proteine', label: 'Proteine' },
  { key: 'condimenti', label: 'Condimenti' },
  { key: 'salse', label: 'Salse' },
  { key: 'toppings', label: 'Toppings' },
];

function PokeEditor({ colleague, ingredients, onConfirm, onCancel }) {
  const isDefault = colleague.pokeBase.defaultPoke === true;

  const [isEditing, setIsEditing] = useState(false);
  const [currentPoke, setCurrentPoke] = useState({ ...colleague.pokeBase });

  function handleToggleIngredient(category, item) {
    setCurrentPoke((prev) => {
      const list = prev[category];
      const updated = list.includes(item)
        ? list.filter((i) => i !== item)
        : [...list, item];
      return { ...prev, [category]: updated };
    });
  }

  function handleConfirm() {
    onConfirm(colleague, currentPoke);
  }

  function handleReset() {
    setCurrentPoke({ ...colleague.pokeBase });
    setIsEditing(false);
  }

  const fullName = `${colleague.nome}${colleague.cognome ? ` ${colleague.cognome}` : ''}`;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>{fullName}</h2>
          <button className={styles.closeBtn} onClick={onCancel} aria-label="Chiudi">✕</button>
        </div>

        {isDefault ? (
          <div className={styles.defaultPoke}>
            <p className={styles.defaultLabel}>Ordine fisso:</p>
            <p className={styles.defaultName}>{colleague.pokeBase.nomeDefault}</p>
          </div>
        ) : (
          <>
            {!isEditing ? (
              <div className={styles.summary}>
                {CATEGORIE.map(({ key, label }) => (
                  currentPoke[key].length > 0 && (
                    <div key={key} className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>{label}:</span>
                      <span className={styles.summaryValue}>{currentPoke[key].join(', ')}</span>
                    </div>
                  )
                ))}
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Dimensione:</span>
                  <span className={styles.summaryValue}>{currentPoke.dimensione}</span>
                </div>
                <button
                  className={styles.editBtn}
                  onClick={() => setIsEditing(true)}
                >
                  Modifica
                </button>
              </div>
            ) : (
              <div className={styles.editor}>
                {CATEGORIE.map(({ key, label }) => (
                  <div key={key} className={styles.category}>
                    <h3 className={styles.categoryTitle}>{label}</h3>
                    <div className={styles.checkboxGroup}>
                      {(ingredients[key] || []).map((item) => (
                        <label key={item} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={currentPoke[key].includes(item)}
                            onChange={() => handleToggleIngredient(key, item)}
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button className={styles.resetBtn} onClick={handleReset}>
                  Ripristina originale
                </button>
              </div>
            )}
          </>
        )}

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Annulla</button>
          <button className={styles.confirmBtn} onClick={handleConfirm}>
            Aggiungi al carrello
          </button>
        </div>
      </div>
    </div>
  );
}

export default PokeEditor;

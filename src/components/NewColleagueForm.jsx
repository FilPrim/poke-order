// Form modale per aggiungere un nuovo collega con la sua poké base.
// Campi: nome, cognome, dimensione (Regular/Large) e checkbox per categoria
// identiche a quelle di PokeEditor.
import { useState } from 'react';
import styles from './NewColleagueForm.module.css';

const CATEGORIE = [
  { key: 'base', label: 'Base' },
  { key: 'proteine', label: 'Proteine' },
  { key: 'condimenti', label: 'Condimenti' },
  { key: 'salse', label: 'Salse' },
  { key: 'toppings', label: 'Toppings' },
];

const DIMENSIONI = ['regular', 'large'];

const POKE_VUOTA = {
  dimensione: 'regular',
  base: [],
  proteine: [],
  condimenti: [],
  salse: [],
  toppings: [],
};

function NewColleagueForm({ ingredients, onSave, onCancel }) {
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [poke, setPoke] = useState({ ...POKE_VUOTA });

  function handleToggleIngredient(category, item) {
    setPoke((prev) => {
      const list = prev[category];
      const updated = list.includes(item)
        ? list.filter((i) => i !== item)
        : [...list, item];
      return { ...prev, [category]: updated };
    });
  }

  function handleDimensioneChange(val) {
    setPoke((prev) => ({ ...prev, dimensione: val }));
  }

  function handleSave() {
    if (!nome.trim()) return;
    const newColleague = {
      id: Date.now(),
      nome: nome.trim(),
      cognome: cognome.trim(),
      pokeBase: { ...poke },
    };
    onSave(newColleague);
  }

  const canSave = nome.trim().length > 0;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>Nuova Poké</h2>
          <button className={styles.closeBtn} onClick={onCancel} aria-label="Chiudi">✕</button>
        </div>

        <div className={styles.fields}>
          <div className={styles.fieldRow}>
            <label className={styles.fieldLabel} htmlFor="new-nome">Nome *</label>
            <input
              id="new-nome"
              type="text"
              className={styles.fieldInput}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Es. Marco"
              autoFocus
            />
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.fieldLabel} htmlFor="new-cognome">Cognome</label>
            <input
              id="new-cognome"
              type="text"
              className={styles.fieldInput}
              value={cognome}
              onChange={(e) => setCognome(e.target.value)}
              placeholder="Es. Rossi"
            />
          </div>
        </div>

        <div className={styles.dimensioneRow}>
          <span className={styles.dimensioneLabel}>Dimensione:</span>
          <div className={styles.dimensioneOptions}>
            {DIMENSIONI.map((size) => (
              <label
                key={size}
                className={`${styles.sizeOption} ${poke.dimensione === size ? styles.sizeSelected : ''}`}
              >
                <input
                  type="radio"
                  name="new-dimensione"
                  value={size}
                  checked={poke.dimensione === size}
                  onChange={() => handleDimensioneChange(size)}
                />
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.editor}>
          {CATEGORIE.map(({ key, label }) => (
            <div key={key} className={styles.category}>
              <h3 className={styles.categoryTitle}>{label}</h3>
              <div className={styles.checkboxGroup}>
                {(ingredients[key] || []).map((item) => (
                  <label key={item} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={poke[key].includes(item)}
                      onChange={() => handleToggleIngredient(key, item)}
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Annulla</button>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={!canSave}
            title={!canSave ? 'Inserisci almeno il nome' : ''}
          >
            Salva collega
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewColleagueForm;

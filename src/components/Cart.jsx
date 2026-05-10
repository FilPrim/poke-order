// Mostra le poké confermate nel carrello con possibilità di rimozione.
// Contiene il selettore dell'orario e il bottone "Manda su WhatsApp" che costruisce
// il messaggio nel formato corretto e apre WhatsApp Web con il testo già pronto.
// Il bottone WhatsApp è disabilitato finché non viene scelto un orario.
import { useState } from 'react';
import { WHATSAPP_NUMBER } from '../config';
import styles from './Cart.module.css';

const ORARI = ['12:30', '12:45', '13:00', '13:15', '13:30'];

const CATEGORIE_LABELS = {
  base: 'Base',
  proteine: 'Proteine',
  condimenti: 'Condimenti',
  salse: 'Salse',
  toppings: 'Topping',
};

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildWhatsAppMessage(cart, orario) {
  const header = `Ciao! :) Vorrei gentilmente ordinare ${cart.length} poké per le ore ${orario}:`;

  const pokeLines = cart.map(({ colleague, poke }) => {
    const fullName = `${colleague.nome}${colleague.cognome ? ` ${colleague.cognome}` : ''}`;
    const dimensione = capitalize(poke.dimensione || 'regular');

    if (poke.defaultPoke) {
      return `${fullName} - ${dimensione}\n${poke.nomeDefault}`;
    }

    const lines = [`${fullName} - ${dimensione}`];
    ['base', 'proteine', 'condimenti', 'salse', 'toppings'].forEach((key) => {
      if (poke[key]?.length > 0) {
        lines.push(`${CATEGORIE_LABELS[key]}: ${poke[key].join(', ')}`);
      }
    });
    return lines.join('\n');
  });

  return `${header}\n\n${pokeLines.join('\n\n')}\n\nGrazie mille,\nFilippo`;
}

function Cart({ cart, onRemove, onClearCart }) {
  const [orario, setOrario] = useState('');

  function handleSendWhatsApp() {
    const message = buildWhatsAppMessage(cart, orario);
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
    if (onClearCart) onClearCart();
    setOrario('');
  }

  if (cart.length === 0) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>Carrello</h2>
        <p className={styles.empty}>Nessuna poké aggiunta. Seleziona un collega dalla lista.</p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Carrello ({cart.length})</h2>
      <ul className={styles.list}>
        {cart.map(({ id, colleague, poke }) => {
          const fullName = `${colleague.nome}${colleague.cognome ? ` ${colleague.cognome}` : ''}`;
          const dimensione = capitalize(poke.dimensione || 'regular');
          return (
            <li key={id} className={styles.item}>
              <div className={styles.itemContent}>
                <span className={styles.itemName}>
                  {fullName} <span className={styles.itemDimensione}>— {dimensione}</span>
                </span>
                {poke.defaultPoke ? (
                  <span className={styles.itemDetail}>{poke.nomeDefault}</span>
                ) : (
                  <div className={styles.itemDetails}>
                    {['base', 'proteine', 'condimenti', 'salse', 'toppings'].map((key) =>
                      poke[key]?.length > 0 ? (
                        <span key={key} className={styles.itemDetail}>
                          <strong>{CATEGORIE_LABELS[key]}:</strong> {poke[key].join(', ')}
                        </span>
                      ) : null
                    )}
                  </div>
                )}
              </div>
              <button
                className={styles.removeBtn}
                onClick={() => onRemove(id)}
                aria-label={`Rimuovi ${fullName} dal carrello`}
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>

      <div className={styles.orarioRow}>
        <label className={styles.orarioLabel} htmlFor="orario-select">
          Orario consegna:
        </label>
        <select
          id="orario-select"
          className={styles.orarioSelect}
          value={orario}
          onChange={(e) => setOrario(e.target.value)}
        >
          <option value="">Scegli orario</option>
          {ORARI.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <button
        className={styles.whatsappBtn}
        onClick={handleSendWhatsApp}
        disabled={!orario}
        title={!orario ? 'Seleziona prima un orario' : ''}
      >
        <span>Manda ordine su WhatsApp</span>
      </button>
    </section>
  );
}

export default Cart;

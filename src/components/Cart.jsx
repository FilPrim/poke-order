// Mostra le poké confermate nel carrello con possibilità di rimozione.
// Contiene il selettore dell'orario e il bottone "Manda su WhatsApp" che apre un modale
// per inserire una password di conferma prima di costruire il messaggio e aprire wa.me.
// Il bottone WhatsApp è disabilitato finché non viene scelto un orario.
import { Fragment, useState } from 'react';
import { SEND_PASSWORD, WHATSAPP_NUMBER } from '../config';
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

function openWhatsAppLink(cart, orario) {
  const message = buildWhatsAppMessage(cart, orario);
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
}

function Cart({ cart, onRemove }) {
  const [orario, setOrario] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function resetPasswordModalState() {
    setShowPasswordModal(false);
    setPasswordAttempt('');
    setPasswordError('');
  }

  function handleRequestSend() {
    if (!orario) return;
    setPasswordError('');
    setPasswordAttempt('');
    setShowPasswordModal(true);
  }

  function handleConfirmPassword() {
    if (passwordAttempt.trim() !== SEND_PASSWORD) {
      setPasswordError('Password errata');
      setPasswordAttempt('');
      return;
    }
    resetPasswordModalState();
    openWhatsAppLink(cart, orario);
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
    <Fragment>
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
          onClick={handleRequestSend}
          disabled={!orario}
          title={!orario ? 'Seleziona prima un orario' : ''}
        >
          <span>Manda ordine su WhatsApp</span>
        </button>
      </section>

      {showPasswordModal && (
        <div className={styles.pwdOverlay} role="dialog" aria-modal="true" aria-labelledby="pwd-title">
          <div className={styles.pwdPanel}>
            <h2 id="pwd-title" className={styles.pwdTitle}>Conferma invio</h2>
            <p className={styles.pwdHint}>Inserisci la password per inviare l&apos;ordine.</p>
            <label className={styles.pwdLabel} htmlFor="pwd-input">Password</label>
            <input
              id="pwd-input"
              type="password"
              className={styles.pwdInput}
              value={passwordAttempt}
              onChange={(e) => {
                setPasswordAttempt(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {passwordError ? (
              <p className={styles.pwdError} role="alert">{passwordError}</p>
            ) : null}
            <div className={styles.pwdActions}>
              <button type="button" className={styles.pwdCancelBtn} onClick={resetPasswordModalState}>
                Annulla
              </button>
              <button type="button" className={styles.pwdConfirmBtn} onClick={handleConfirmPassword}>
                Conferma e invia
              </button>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
}

export default Cart;

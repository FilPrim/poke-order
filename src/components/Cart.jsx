// Mostra le poké confermate nel carrello con possibilità di rimozione.
// Contiene il selettore dell'orario e il bottone "Manda su WhatsApp" che costruisce
// il messaggio nel formato corretto e apre WhatsApp Web con il testo già pronto.
// Prima dell'invio si apre una modale che richiede SEND_PASSWORD (src/config.js).
// Il bottone WhatsApp è disabilitato finché non viene scelto un orario.
import { useEffect, useState } from 'react';
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

function Cart({ cart, onRemove, onClearCart }) {
  const [orario, setOrario] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function closePasswordModal() {
    setShowPasswordModal(false);
    setPasswordInput('');
    setPasswordError('');
  }

  function openPasswordModal() {
    setPasswordInput('');
    setPasswordError('');
    setShowPasswordModal(true);
  }

  useEffect(() => {
    if (!showPasswordModal) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setShowPasswordModal(false);
        setPasswordInput('');
        setPasswordError('');
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showPasswordModal]);

  function handleSendWhatsApp() {
    const message = buildWhatsAppMessage(cart, orario);
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
    if (onClearCart) onClearCart();
    closePasswordModal();
    setOrario('');
  }

  function handleConfirmPassword(e) {
    e.preventDefault();
    if (passwordInput !== SEND_PASSWORD) {
      setPasswordError('Password errata. Riprova.');
      return;
    }
    handleSendWhatsApp();
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
        type="button"
        className={styles.whatsappBtn}
        onClick={openPasswordModal}
        disabled={!orario}
        title={!orario ? 'Seleziona prima un orario' : ''}
      >
        <span>Manda ordine su WhatsApp</span>
      </button>

      {showPasswordModal && (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onClick={(ev) => {
            if (ev.target === ev.currentTarget) closePasswordModal();
          }}
        >
          <div
            className={styles.modalPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-password-title"
          >
            <h3 id="cart-password-title" className={styles.modalTitle}>
              Conferma invio ordine
            </h3>
            <p className={styles.modalHint}>Inserisci la password per aprire WhatsApp con il messaggio pronto.</p>
            <form className={styles.modalForm} onSubmit={handleConfirmPassword}>
              <label className={styles.modalLabel} htmlFor="cart-send-password">
                Password
              </label>
              <input
                id="cart-send-password"
                className={styles.modalInput}
                type="password"
                autoComplete="off"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                autoFocus
              />
              {passwordError ? <p className={styles.modalError}>{passwordError}</p> : null}
              <div className={styles.modalActions}>
                <button type="button" className={styles.modalBtnSecondary} onClick={closePasswordModal}>
                  Annulla
                </button>
                <button type="submit" className={styles.modalBtnPrimary}>
                  Invia ordine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Cart;

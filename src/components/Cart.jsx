// Mostra le poké confermate nel carrello con possibilità di rimozione.
// Contiene il bottone "Manda su WhatsApp" che costruisce il messaggio formattato
// e apre WhatsApp Web con il testo già pronto.
import { WHATSAPP_NUMBER } from '../config';
import styles from './Cart.module.css';

const CATEGORIE_LABELS = {
  base: 'Base',
  proteine: 'Proteine',
  condimenti: 'Condimenti',
  salse: 'Salse',
  toppings: 'Toppings',
};

function buildPokeDescription(colleague, poke) {
  if (poke.defaultPoke) {
    return poke.nomeDefault;
  }
  const parts = ['base', 'proteine', 'condimenti', 'salse', 'toppings']
    .map((key) => poke[key]?.join(', '))
    .filter(Boolean);
  return parts.join(' | ');
}

function buildWhatsAppMessage(cart) {
  const lines = cart.map(({ colleague, poke }) => {
    const name = `${colleague.nome}${colleague.cognome ? ` ${colleague.cognome}` : ''}`;
    const description = buildPokeDescription(colleague, poke);
    return `${name}: ${description}`;
  });
  return lines.join('\n');
}

function Cart({ cart, onRemove }) {
  function handleSendWhatsApp() {
    const message = buildWhatsAppMessage(cart);
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
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
          return (
            <li key={id} className={styles.item}>
              <div className={styles.itemContent}>
                <span className={styles.itemName}>{fullName}</span>
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
      <button className={styles.whatsappBtn} onClick={handleSendWhatsApp}>
        <span>Manda ordine su WhatsApp</span>
      </button>
    </section>
  );
}

export default Cart;

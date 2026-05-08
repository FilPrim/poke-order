// Componente principale dell'app Poke Order.
// Gestisce lo stato globale: colleghi (con persistenza localStorage), collega selezionato,
// carrello e visibilità del form per aggiungere un nuovo collega.
import { useState } from 'react';
import { colleghi as colleghi_default, ingredienti } from './data/data.json';
import ColleagueList from './components/ColleagueList';
import PokeEditor from './components/PokeEditor';
import Cart from './components/Cart';
import NewColleagueForm from './components/NewColleagueForm';
import styles from './App.module.css';

const LS_KEY = 'poke_order_colleghi';

function loadColleghi() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : colleghi_default;
  } catch {
    return colleghi_default;
  }
}

function saveColleghi(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function App() {
  const [colleghi, setColleghi] = useState(loadColleghi);
  const [selectedColleague, setSelectedColleague] = useState(null);
  const [cart, setCart] = useState([]);
  const [showNewForm, setShowNewForm] = useState(false);

  const cartIds = new Set(cart.map((item) => item.colleague.id));

  function handleSelectColleague(colleague) {
    setSelectedColleague(colleague);
  }

  function handleConfirmPoke(colleague, poke) {
    setCart((prev) => [
      ...prev,
      { id: `${colleague.id}-${Date.now()}`, colleague, poke },
    ]);
    setSelectedColleague(null);
  }

  function handleRemoveFromCart(itemId) {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  }

  function handleCloseEditor() {
    setSelectedColleague(null);
  }

  function handleRemoveColleague(colleagueId) {
    setColleghi((prev) => {
      const updated = prev.filter((c) => c.id !== colleagueId);
      saveColleghi(updated);
      return updated;
    });
    setCart((prev) => prev.filter((item) => item.colleague.id !== colleagueId));
  }

  function handleAddColleague(newColleague) {
    setColleghi((prev) => {
      const updated = [...prev, newColleague];
      saveColleghi(updated);
      return updated;
    });
    setShowNewForm(false);
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>🍣 Poke Order</h1>
        <p className={styles.subtitle}>Gestisci gli ordini del tuo ufficio</p>
      </header>

      <main className={styles.main}>
        <div className={styles.left}>
          <ColleagueList
            colleagues={colleghi}
            onSelect={handleSelectColleague}
            onRemove={handleRemoveColleague}
            onNewColleague={() => setShowNewForm(true)}
            cartIds={cartIds}
          />
        </div>
        <div className={styles.right}>
          <Cart cart={cart} onRemove={handleRemoveFromCart} />
        </div>
      </main>

      {selectedColleague && (
        <PokeEditor
          colleague={selectedColleague}
          ingredients={ingredienti}
          onConfirm={handleConfirmPoke}
          onCancel={handleCloseEditor}
        />
      )}

      {showNewForm && (
        <NewColleagueForm
          ingredients={ingredienti}
          onSave={handleAddColleague}
          onCancel={() => setShowNewForm(false)}
        />
      )}
    </div>
  );
}

export default App;

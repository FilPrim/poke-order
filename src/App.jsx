// Componente principale dell'app Poke Order.
// Gestisce lo stato globale: colleghi caricati da data.json, collega selezionato e carrello.
import { useState } from 'react';
import { colleghi, ingredienti } from './data/data.json';
import ColleagueList from './components/ColleagueList';
import PokeEditor from './components/PokeEditor';
import Cart from './components/Cart';
import styles from './App.module.css';

function App() {
  const [selectedColleague, setSelectedColleague] = useState(null);
  const [cart, setCart] = useState([]);

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
    </div>
  );
}

export default App;

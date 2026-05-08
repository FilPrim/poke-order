// Componente principale dell'app Poke Order.
// Gestisce lo stato globale: colleghi (con persistenza localStorage), collega selezionato,
// carrello, visibilità del form per aggiungere un nuovo collega e tema chiaro/scuro.
import { useEffect, useState } from 'react';
import { colleghi as colleghi_default, ingredienti } from './data/data.json';
import ColleagueList from './components/ColleagueList';
import PokeEditor from './components/PokeEditor';
import Cart from './components/Cart';
import NewColleagueForm from './components/NewColleagueForm';
import ThemeToggle from './components/ThemeToggle';
import styles from './App.module.css';

const LS_KEY = 'poke_order_colleghi';
const LS_THEME_KEY = 'poke_order_theme';

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

function loadInitialTheme() {
  try {
    const saved = localStorage.getItem(LS_THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // ignora errori di accesso a localStorage
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function App() {
  const [colleghi, setColleghi] = useState(loadColleghi);
  const [selectedColleague, setSelectedColleague] = useState(null);
  const [cart, setCart] = useState([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [theme, setTheme] = useState(loadInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(LS_THEME_KEY, theme);
    } catch {
      // ignora errori di persistenza
    }
  }, [theme]);

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

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>🍣 Poke Order</h1>
        <p className={styles.subtitle}>Gestisci gli ordini del tuo ufficio</p>
        <div className={styles.headerActions}>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
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
          colleghi={colleghi}
          onSave={handleAddColleague}
          onCancel={() => setShowNewForm(false)}
        />
      )}
    </div>
  );
}

export default App;

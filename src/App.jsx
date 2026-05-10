// Componente principale dell'app Poke Order.
// Gestisce lo stato globale: colleghi (persistenza Supabase con seed da data.json),
// carrello (persistenza Supabase tabella carrello), collega selezionato,
// visibilità del form nuovo collega e tema chiaro/scuro.
import { useEffect, useState } from 'react';
import { colleghi as colleghi_seed, ingredienti } from './data/data.json';
import { supabase } from './supabase';
import ColleagueList from './components/ColleagueList';
import PokeEditor from './components/PokeEditor';
import Cart from './components/Cart';
import NewColleagueForm from './components/NewColleagueForm';
import ThemeToggle from './components/ThemeToggle';
import styles from './App.module.css';

const LS_THEME_KEY = 'poke_order_theme';

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

/** Mappa una riga Supabase `colleghi` → shape usata dal client */
function mapCollega(row) {
  return { id: row.id, nome: row.nome, cognome: row.cognome, pokeBase: row.default_poke };
}

/** Mappa una riga Supabase `carrello` → item carrello, usando l'array colleghi già caricato */
function mapCarrelloItem(row, colleghiList) {
  const colleague = colleghiList.find((c) => c.id === row.collega_id);
  if (!colleague) return null;
  return { id: String(row.id), colleague, poke: row.poke };
}

function App() {
  const [colleghi, setColleghi] = useState([]);
  const [selectedColleague, setSelectedColleague] = useState(null);
  const [cart, setCart] = useState([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [theme, setTheme] = useState(loadInitialTheme);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Applica tema e persiste in localStorage
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(LS_THEME_KEY, theme);
    } catch {
      // ignora errori di persistenza
    }
  }, [theme]);

  // Caricamento iniziale da Supabase + sottoscrizioni realtime
  useEffect(() => {
    let channel;

    async function init() {
      setLoading(true);
      setError(null);

      // 1. Carica colleghi
      const { data: colleghiRows, error: errColleghi } = await supabase
        .from('colleghi')
        .select('*')
        .order('id');

      if (errColleghi) {
        setError('Errore nel caricamento dei colleghi: ' + errColleghi.message);
        setLoading(false);
        return;
      }

      let listaColleghi;

      // 2. Seed se tabella vuota
      if (colleghiRows.length === 0) {
        const seedRows = colleghi_seed.map(({ nome, cognome, pokeBase }) => ({
          nome,
          cognome,
          default_poke: pokeBase,
        }));
        const { data: inserted, error: errSeed } = await supabase
          .from('colleghi')
          .insert(seedRows)
          .select();
        if (errSeed) {
          setError('Errore nel seed iniziale: ' + errSeed.message);
          setLoading(false);
          return;
        }
        listaColleghi = inserted.map(mapCollega);
      } else {
        listaColleghi = colleghiRows.map(mapCollega);
      }

      setColleghi(listaColleghi);

      // 3. Carica carrello
      const { data: carrelloRows, error: errCarrello } = await supabase
        .from('carrello')
        .select('*')
        .order('id');

      if (errCarrello) {
        setError('Errore nel caricamento del carrello: ' + errCarrello.message);
        setLoading(false);
        return;
      }

      const cartItems = carrelloRows
        .map((row) => mapCarrelloItem(row, listaColleghi))
        .filter(Boolean);
      setCart(cartItems);
      setLoading(false);

      // 4. Sottoscrizioni realtime
      channel = supabase
        .channel('poke-order-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'colleghi' },
          (payload) => {
            const nuovoCollega = mapCollega(payload.new);
            setColleghi((prev) => [...prev, nuovoCollega]);
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'colleghi' },
          (payload) => {
            setColleghi((prev) => prev.filter((c) => c.id !== payload.old.id));
            setCart((prev) => prev.filter((item) => item.colleague.id !== payload.old.id));
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'carrello' },
          (payload) => {
            setColleghi((currentColleghi) => {
              const item = mapCarrelloItem(payload.new, currentColleghi);
              if (item) {
                setCart((prev) => {
                  // Evita duplicati (la riga potrebbe già essere stata aggiunta ottimisticamente)
                  if (prev.some((i) => i.id === item.id)) return prev;
                  return [...prev, item];
                });
              }
              return currentColleghi;
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'carrello' },
          (payload) => {
            setCart((prev) => prev.filter((item) => item.id !== String(payload.old.id)));
          }
        )
        .subscribe();
    }

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const cartIds = new Set(cart.map((item) => item.colleague.id));

  function handleSelectColleague(colleague) {
    setSelectedColleague(colleague);
  }

  async function handleConfirmPoke(colleague, poke) {
    const { data, error: err } = await supabase
      .from('carrello')
      .insert({ collega_id: colleague.id, poke, dimensione: poke.dimensione ?? 'regular' })
      .select()
      .single();

    if (err) {
      console.error('Errore aggiunta carrello:', err.message);
      return;
    }

    // Aggiunta ottimistica (il realtime potrebbe aggiungerla di nuovo, la duplice viene filtrata)
    setCart((prev) => [...prev, { id: String(data.id), colleague, poke }]);
    setSelectedColleague(null);
  }

  async function handleRemoveFromCart(itemId) {
    const { error: err } = await supabase
      .from('carrello')
      .delete()
      .eq('id', Number(itemId));

    if (err) {
      console.error('Errore rimozione carrello:', err.message);
      return;
    }
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  }

  async function handleClearCart() {
    const { error: err } = await supabase
      .from('carrello')
      .delete()
      .neq('id', 0);

    if (err) {
      console.error('Errore svuotamento carrello:', err.message);
      return;
    }
    setCart([]);
  }

  function handleCloseEditor() {
    setSelectedColleague(null);
  }

  async function handleRemoveColleague(colleagueId) {
    const { error: err } = await supabase
      .from('colleghi')
      .delete()
      .eq('id', colleagueId);

    if (err) {
      console.error('Errore rimozione collega:', err.message);
      return;
    }
    setColleghi((prev) => prev.filter((c) => c.id !== colleagueId));
    setCart((prev) => prev.filter((item) => item.colleague.id !== colleagueId));
  }

  async function handleAddColleague(newColleague) {
    const { data, error: err } = await supabase
      .from('colleghi')
      .insert({ nome: newColleague.nome, cognome: newColleague.cognome, default_poke: newColleague.pokeBase })
      .select()
      .single();

    if (err) {
      console.error('Errore aggiunta collega:', err.message);
      return;
    }

    setColleghi((prev) => [...prev, mapCollega(data)]);
    setShowNewForm(false);
  }

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  if (loading) {
    return (
      <div className={styles.app}>
        <header className={styles.header}>
          <h1 className={styles.logo}>🍣 Poke Order</h1>
        </header>
        <p className={styles.statusMessage}>Caricamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.app}>
        <header className={styles.header}>
          <h1 className={styles.logo}>🍣 Poke Order</h1>
        </header>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    );
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
          <Cart cart={cart} onRemove={handleRemoveFromCart} onClearCart={handleClearCart} />
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

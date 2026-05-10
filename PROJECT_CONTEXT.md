# PROJECT CONTEXT — Poke Order

## Descrizione del progetto
`Poke Order` è una web app interna per gestire gli ordini poke in ufficio.
Il flusso principale è: selezione collega -> conferma/modifica poke -> carrello condiviso -> invio ordine su WhatsApp con testo precompilato.

## Stack tecnico
- **Frontend:** React `18.3.1` (functional components + hooks)
- **Bundler/dev server:** Vite `5.x`
- **Styling:** CSS Modules + `src/index.css` globale
- **Lint:** ESLint `9.x` (flat config)
- **Dati:** `src/data/data.json` (seed iniziale) + **Supabase** come backend (tabelle `colleghi` e `carrello`)
- **Backend:** [Supabase](https://supabase.com) — DB Postgres hosted, SDK JS `@supabase/supabase-js`, realtime via `postgres_changes`
- **Integrazione esterna:** URL WhatsApp `https://wa.me/...`
- **Env vars:** `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` in `.env.local`

## Struttura file e componenti

### Root
- `package.json` — script (`dev`, `build`, `lint`, `preview`) e dipendenze.
- `package-lock.json` — lockfile npm.
- `vite.config.js` — config Vite + plugin React.
- `eslint.config.js` — regole lint JS/React.
- `index.html` — pagina host con mount `#root`.
- `.gitignore` — esclusioni Git standard (include `*.local`).
- `.env.local` — variabili d'ambiente Supabase (non versionato).
- `PROJECT_CONTEXT.md` — contesto progetto aggiornato.

### Regole Cursor
- `.cursor/rules/general.mdc` — contesto progetto + regole di risposta + workflow Git con PR.
- `.cursor/rules/react.mdc` — convenzioni React/CSS Modules e commento in cima ai componenti.
- `.cursor/rules/data.mdc` — regole su `data.json` e `src/config.js`.
- `.cursor/rules/context.mdc` — regola che impone aggiornamento di questo file quando richiesto.

### App (`src`)
- `src/main.jsx` — avvio React e render di `App`.
- `src/App.jsx` — stato globale (`colleghi`, `cart`, modali, tema); fetch/seed/realtime Supabase; handler async per CRUD colleghi e carrello.
- `src/App.module.css` — layout principale app + posizionamento toggle tema nell'header; classi `.statusMessage` e `.errorMessage`.
- `src/index.css` — reset, stili globali base e custom properties (CSS variables) per light/dark theme.
- `src/App.css` — file legacy Vite non usato.
- `src/config.js` — numero WhatsApp e password invio ordine centralizzati.
- `src/supabase.js` — client Supabase inizializzato con le env var `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

### Dati
- `src/data/data.json` — elenco colleghi e catalogo ingredienti per categorie (usato solo come seed iniziale Supabase).

### Componenti
- `src/components/ColleagueList.jsx` — render lista colleghi e bottone "Nuova Poke".
- `src/components/ColleagueList.module.css` — stile lista/griglia/header.
- `src/components/ColleagueCard.jsx` — card collega, blocco duplicati in cart, azione elimina con conferma.
- `src/components/ColleagueCard.module.css` — stile card, badge, disabled, delete button.
- `src/components/PokeEditor.jsx` — modale modifica poke (ingredienti + dimensione regular/large).
- `src/components/PokeEditor.module.css` — stile modale editor.
- `src/components/Cart.jsx` — carrello, rimozione ordini, scelta orario, invio WhatsApp; chiama `onClearCart` dopo apertura link.
- `src/components/Cart.module.css` — stile carrello/select orario/bottone invio.
- `src/components/NewColleagueForm.jsx` — modale per creare nuovo collega e poke base, con validazione duplicati sulla coppia nome+cognome (case-insensitive su entrambi i campi).
- `src/components/NewColleagueForm.module.css` — stile modale creazione, incluso stato di errore sul campo nome.
- `src/components/ThemeToggle.jsx` — bottone tondo nell'header per alternare tema chiaro/scuro.
- `src/components/ThemeToggle.module.css` — stile bottone toggle tema.

### Asset/public
- `src/assets/react.svg` — asset legacy template.
- `public/vite.svg` — favicon/template asset.

### Cartelle presenti ma non applicative
- `Git/` — tooling/binari locali, non logica app.
- `nodejs/` — runtime/script locali, non logica app.

## Schema Supabase

### Tabella `colleghi`
| Colonna | Tipo | Note |
|---|---|---|
| `id` | int8 (auto-increment) | PK, generato da Supabase |
| `nome` | text | |
| `cognome` | text | |
| `default_poke` | jsonb | Shape: `{ dimensione, base, proteine, condimenti, salse, toppings }` |

### Tabella `carrello`
| Colonna | Tipo | Note |
|---|---|---|
| `id` | int8 (auto-increment) | PK |
| `collega_id` | int8 | FK -> `colleghi.id` |
| `poke` | jsonb | Shape poke completato |
| `dimensione` | text | `'regular'` o `'large'` |

**Mapping client**: `pokeBase` (locale) <-> `default_poke` (DB). L'`id` di `data.json` non viene mai scritto nel DB; Supabase genera il suo.

## Stato attuale (cosa funziona)
- Lista colleghi caricata da Supabase (tabella `colleghi`) con seed automatico da `data.json` se la tabella e vuota.
- Carrello persistito su Supabase (tabella `carrello`), sincronizzato tra schede/client grazie al realtime.
- Apertura editor poke per collega selezionato.
- Gestione poke default (`defaultPoke`) e poke personalizzabili.
- Modifica ingredienti per categorie.
- Selezione dimensione (`regular` / `large`) in editor.
- Aggiunta al carrello con blocco duplicati (INSERT async su Supabase).
- Rimozione singolo item dal carrello (DELETE su Supabase).
- Svuotamento carrello automatico dopo invio ordine su WhatsApp.
- Rimozione collega con conferma (DELETE su Supabase).
- Creazione nuovo collega con poke via modale (INSERT su Supabase).
- Selezione orario obbligatoria prima dell'invio WhatsApp.
- Messaggio WhatsApp formattato e apertura `wa.me`.
- Tema chiaro/scuro con toggle nell'header, persistito in `localStorage` (`poke_order_theme`) e fallback a `prefers-color-scheme`.
- Blocco creazione collega con coppia nome+cognome duplicata (case-insensitive) con messaggio di errore inline.
- Gestione stati `loading` e `error` nell'UI durante il caricamento iniziale da Supabase.

## Ultime modifiche (3-5 piu recenti)
- **Migrazione Supabase**: `colleghi` e `carrello` ora persistiti su Supabase con realtime; rimosso `localStorage` per i dati dei colleghi; `data.json` usato solo come seed iniziale; aggiunto `src/supabase.js`.
- **Svuotamento carrello automatico** in `Cart.jsx`: dopo apertura link WhatsApp viene chiamata `onClearCart` (DELETE su `carrello`).
- **Fix validazione duplicati** in `NewColleagueForm`: il blocco scatta sulla coppia nome+cognome (case-insensitive); reset dell'errore anche al cambio cognome.
- Introdotto **dark mode** con toggle nell'header, CSS custom properties in `src/index.css`, persistenza in `localStorage` e fallback su `prefers-color-scheme`.
- Migrati tutti i CSS Modules alle variabili semantiche; aggiunto `ThemeToggle`.

## Prossimi passi
- Aggiungere altre validazioni nel form nuovo collega (lunghezza minima, limite ingredienti).
- Pulire file legacy non usati (`src/App.css`, asset template).
- Aggiungere test (unit/integration) sui flussi chiave: cart, messaggio WhatsApp, realtime, tema.
- Verificare ed eventualmente documentare i limiti business (numero ingredienti per categoria, regole poke default).

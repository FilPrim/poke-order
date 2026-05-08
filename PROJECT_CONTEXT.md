# PROJECT CONTEXT — Poke Order

## Descrizione del progetto
`Poke Order` è una web app interna per gestire gli ordini poke in ufficio.
Il flusso principale è: selezione collega -> conferma/modifica poke -> carrello condiviso -> invio ordine su WhatsApp con testo precompilato.

## Stack tecnico
- **Frontend:** React `18.3.1` (functional components + hooks)
- **Bundler/dev server:** Vite `5.x`
- **Styling:** CSS Modules + `src/index.css` globale
- **Lint:** ESLint `9.x` (flat config)
- **Dati:** `src/data/data.json` + persistenza runtime su `localStorage`
- **Integrazione esterna:** URL WhatsApp `https://wa.me/...`

## Struttura file e componenti

### Root
- `package.json` — script (`dev`, `build`, `lint`, `preview`) e dipendenze.
- `package-lock.json` — lockfile npm.
- `vite.config.js` — config Vite + plugin React.
- `eslint.config.js` — regole lint JS/React.
- `index.html` — pagina host con mount `#root`.
- `.gitignore` — esclusioni Git standard.
- `PROJECT_CONTEXT.md` — contesto progetto aggiornato.

### Regole Cursor
- `.cursor/rules/general.mdc` — contesto progetto + regole di risposta + workflow Git con PR.
- `.cursor/rules/react.mdc` — convenzioni React/CSS Modules e commento in cima ai componenti.
- `.cursor/rules/data.mdc` — regole su `data.json` e `src/config.js`.
- `.cursor/rules/context.mdc` — regola che impone aggiornamento di questo file quando richiesto.

### App (`src`)
- `src/main.jsx` — avvio React e render di `App`.
- `src/App.jsx` — stato globale (`colleghi`, `cart`, modali, tema), persistenza localStorage, orchestrazione componenti.
- `src/App.module.css` — layout principale app + posizionamento toggle tema nell'header.
- `src/index.css` — reset, stili globali base e custom properties (CSS variables) per light/dark theme.
- `src/App.css` — file legacy Vite non usato.
- `src/config.js` — numero WhatsApp centralizzato.

### Dati
- `src/data/data.json` — elenco colleghi e catalogo ingredienti per categorie.

### Componenti
- `src/components/ColleagueList.jsx` — render lista colleghi e bottone "Nuova Poké".
- `src/components/ColleagueList.module.css` — stile lista/griglia/header.
- `src/components/ColleagueCard.jsx` — card collega, blocco duplicati in cart, azione elimina con conferma.
- `src/components/ColleagueCard.module.css` — stile card, badge, disabled, delete button.
- `src/components/PokeEditor.jsx` — modale modifica poke (ingredienti + dimensione regular/large).
- `src/components/PokeEditor.module.css` — stile modale editor.
- `src/components/Cart.jsx` — carrello, rimozione ordini, scelta orario, invio WhatsApp.
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

## Stato attuale (cosa funziona)
- Lista colleghi visualizzata correttamente.
- Apertura editor poke per collega selezionato.
- Gestione poke default (`defaultPoke`) e poke personalizzabili.
- Modifica ingredienti per categorie.
- Selezione dimensione (`regular` / `large`) in editor.
- Aggiunta al carrello con blocco duplicati.
- Rimozione item dal carrello.
- Rimozione collega con conferma.
- Creazione nuovo collega con poke via modale.
- Persistenza colleghi in `localStorage` (`poke_order_colleghi`).
- Selezione orario obbligatoria prima dell’invio WhatsApp.
- Messaggio WhatsApp formattato e apertura `wa.me`.
- Tema chiaro/scuro con toggle nell'header, persistito in `localStorage` (`poke_order_theme`) e fallback a `prefers-color-scheme`.
- Blocco creazione collega con coppia nome+cognome duplicata (case-insensitive su entrambi i campi) con messaggio di errore inline.

## Ultime modifiche (3-5 più recenti)
- **Fix validazione duplicati** in `NewColleagueForm`: il blocco scatta solo sulla coppia nome+cognome (case-insensitive), così due colleghi con stesso nome e cognome diverso possono coesistere; reset dell'errore anche al cambio del campo cognome.
- Introdotto **dark mode** con toggle nell'header, CSS custom properties in `src/index.css`, persistenza in `localStorage` (`poke_order_theme`) e fallback su `prefers-color-scheme`.
- Migrati tutti i CSS Modules dei componenti alle nuove variabili semantiche (sfondi, testi, bordi, accent, soft states).
- Aggiunto componente `ThemeToggle`.
- Implementata validazione duplicati in `NewColleagueForm` con messaggio di errore inline e stile rosso del campo.

## Prossimi passi
- Valutare sincronizzazione dati tra `data.json` e `localStorage` (seed/migrazione/reset) per evitare divergenze.
- Aggiungere altre validazioni nel form nuovo collega (lunghezza minima, limite ingredienti, controllo cognome).
- Pulire file legacy non usati (`src/App.css`, asset template) se non servono.
- Aggiungere test (unit/integration) sui flussi chiave: cart, messaggio WhatsApp, persistenza, tema.
- Verificare ed eventualmente documentare i limiti business (numero ingredienti per categoria, regole poke default).

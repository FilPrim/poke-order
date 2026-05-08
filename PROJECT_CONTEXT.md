# PROJECT CONTEXT — Poke Order

## Descrizione progetto
`Poke Order` è una web app interna (ufficio) per raccogliere e gestire ordini poke multipli in modo rapido.
L’utente seleziona i colleghi, conferma/modifica la poke, costruisce un carrello comune e invia l’ordine su WhatsApp con messaggio formattato.

## Stack tecnico
- **Frontend:** React 18 (functional components + hooks)
- **Build/Dev server:** Vite 5
- **Styling:** CSS Modules + `index.css` globale minimale
- **Linting:** ESLint (config flat)
- **Data layer:** JSON statico (`src/data/data.json`) + persistenza runtime su `localStorage`
- **Integrazione esterna:** apertura WhatsApp Web via URL `wa.me`

## Struttura file (stato attuale reale)

### Root
- `package.json` — script (`dev`, `build`, `lint`, `preview`) e dipendenze.
- `package-lock.json` — lockfile npm.
- `vite.config.js` — configurazione Vite con plugin React.
- `eslint.config.js` — regole lint JS/React.
- `index.html` — shell HTML con mount `#root`.
- `.gitignore` — esclusioni Git standard.
- `PROJECT_CONTEXT.md` — questo file di contesto.

### Regole Cursor
- `.cursor/rules/general.mdc` — contesto progetto + regole operative/risposta.
- `.cursor/rules/react.mdc` — convenzioni React/CSS Modules.
- `.cursor/rules/data.mdc` — vincoli su gestione dati/config.
- `.cursor/rules/context.mdc` — regola dedicata al file di contesto progetto.

### App (`src`)
- `src/main.jsx` — bootstrap React.
- `src/App.jsx` — orchestrazione stato globale (colleghi, carrello, modali, persistenza).
- `src/App.module.css` — layout principale app (header + colonne contenuto).
- `src/index.css` — reset/stile base globale.
- `src/App.css` — file legacy del template Vite (non usato dal rendering corrente).
- `src/config.js` — numero WhatsApp configurabile.

### Dati
- `src/data/data.json` — fonte dati di colleghi/ingredienti (con `id`, `pokeBase`, categorie ingredienti).

### Componenti
- `src/components/ColleagueList.jsx` — lista colleghi + bottone “Nuova Poké”.
- `src/components/ColleagueList.module.css` — stili lista/griglia/header.
- `src/components/ColleagueCard.jsx` — card selezione collega, stato “già nel carrello”, azione elimina.
- `src/components/ColleagueCard.module.css` — stili card/disabled/delete.
- `src/components/PokeEditor.jsx` — modale modifica poke (ingredienti + dimensione).
- `src/components/PokeEditor.module.css` — stili modale editor.
- `src/components/Cart.jsx` — carrello, rimozione ordini, selezione orario, invio WhatsApp.
- `src/components/Cart.module.css` — stili carrello/select/bottone invio.
- `src/components/NewColleagueForm.jsx` — modale creazione nuovo collega+poke.
- `src/components/NewColleagueForm.module.css` — stili modale creazione.

### Asset/public
- `src/assets/react.svg` — asset legacy template (non centrale al dominio).
- `public/vite.svg` — favicon/template asset.

### Cartelle non applicative presenti in root
- `Git/` — binari/tooling locale, non logica applicativa.
- `nodejs/` — runtime/script locali, non logica applicativa.

## Cosa funziona adesso
- Visualizzazione elenco colleghi.
- Apertura editor poke per collega selezionato.
- Gestione poke default (`defaultPoke`) e poke personalizzabili.
- Modifica ingredienti per categoria.
- Selezione dimensione (`regular` / `large`) nell’editor.
- Conferma poke e aggiunta al carrello.
- Blocco duplicati (collega già nel carrello non riaggiungibile).
- Rimozione item dal carrello.
- Rimozione collega con conferma.
- Creazione nuovo collega + poke via modale.
- Persistenza lista colleghi in `localStorage` (chiave: `poke_order_colleghi`).
- Selezione orario consegna obbligatoria prima dell’invio.
- Generazione messaggio WhatsApp formattato e apertura `wa.me`.

## Ultime modifiche introdotte (snapshot funzionale)
- Introdotto workflow poke v2 lato UI (dimensione, orario, messaggio WhatsApp strutturato).
- Aggiunta gestione CRUD leggera sui colleghi lato client (aggiunta/rimozione + persistenza locale).
- Aggiunto componente `NewColleagueForm` con categorie ingredienti.
- Aggiornati componenti principali (`App`, `Cart`, `PokeEditor`, `ColleagueList`, `ColleagueCard`) e relativi CSS Modules.
- Aggiornata struttura dati ingredienti in `data.json` coerente con le categorie usate dall’editor.

## Note operative / attenzione per altri AI
- La persistenza su `localStorage` può “coprire” aggiornamenti fatti in `data.json` fino a reset locale.
- Evitare duplicazione di dati ingredienti nei componenti: usare sempre `src/data/data.json`.
- Il numero WhatsApp va gestito solo in `src/config.js`.
- `src/App.css` è legacy: verificare prima di riusarlo/rimuoverlo.

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
- `src/config.js` — numero WhatsApp (`WHATSAPP_NUMBER`) e password invio ordine (`SEND_PASSWORD`).
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
- `src/components/Cart.jsx` — carrello, rimozione ordini, scelta orario, modale password (`SEND_PASSWORD`) prima di aprire WhatsApp; chiama `onClearCart` dopo apertura link.
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
- Modale password obbligatoria prima dell'apertura di WhatsApp (password in `src/config.js`).
- Messaggio WhatsApp formattato e apertura `wa.me`.
- Tema chiaro/scuro con toggle nell'header, persistito in `localStorage` (`poke_order_theme`) e fallback a `prefers-color-scheme`.
- Blocco creazione collega con coppia nome+cognome duplicata (case-insensitive) con messaggio di errore inline.
- Gestione stati `loading` e `error` nell'UI durante il caricamento iniziale da Supabase.

## Note deploy Vercel

### Variabili obbligatorie (progetto Vite)
Senza queste, il bundle non contiene URL/chiave Supabase e l'app fallisce all'avvio (es. `supabaseUrl is required`). Nomi **esatti**:

| Nome | Valore |
|------|--------|
| `VITE_SUPABASE_URL` | Supabase → **Project Settings** → **API** → **Project URL** |
| `VITE_SUPABASE_ANON_KEY` | Stessa pagina → chiave **anon** (public) |

In **Vercel** → progetto → **Settings** → **Environment Variables** → **Add Environment Variable**: nome, valore, spunta **Production** e **Preview** (e **Development** se serve). Salva.

**Importante:** le `VITE_*` sono lette **durante `npm run build`**. Dopo aver salvato le variabili, **Deployments** → menu **⋯** sull’ultimo deploy → **Redeploy**.

### Deployment Protection (401/403)
Percorso: **Project** → **Settings** → **Deployment Protection**. Se è attiva l’autenticazione per i deploy, gli URL `…-projects.vercel.app` possono rispondere 401/403 finché non accedi con account autorizzato. Puoi limitare la protezione ai soli ambienti Preview o escludere il dominio di produzione secondo le opzioni del piano.

### Altro
- Usa il **dominio di produzione** (`poke-order.vercel.app`) per test reali; l’iframe nel dashboard puo mostrare 403 anche se il sito va bene.

### Pagina bianca dopo aver configurato le env
Succede spesso per **cache del browser** dopo un nuovo deploy: `index.html` vecchio punta ancora a un file `.js` con hash precedente (404) → script non parte → schermo bianco. Anche se poi riclicchi da Vercel può persistere finché il browser non aggiorna il HTML.

**Cosa fare:** finestra **anonima/privata**, oppure per quel sito **Svuota dati/cancel cache** (Chrome: DevTools → Application → Storage → Clear site data per `poke-order.vercel.app`), oppure **aggiornamento forzato** (Ctrl+Shift+R). In **DevTools → Rete (Network)** ricarica con «Disabilita cache» attivo e controlla che `index-….js` e `index-….css` restituiscano **200** e non **404**.

Verifica anche su Vercel che le due variabili abbiano la spunta su **Production** e che l’ultimo deploy **Production** sia stato fatto **dopo** aver salvato le env (altrimenti il bundle in produzione è ancora senza valori).

### Checklist: chiunque apra il link deve vedere l’app
1. **Repository collegato** a Vercel e branch di produzione (spesso `main`) che fa deploy sul dominio che usi.
2. **`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`** nel progetto Vercel con ambiente **Production** selezionato.
3. **Redeploy** dell’ultimo commit dopo aver aggiunto/modificato le env (build che incorpora le stringhe).
4. **Deployment Protection**: per accesso anonimo al dominio pubblico, la produzione non deve richiedere login Vercel — regola le impostazioni in **Settings → Deployment Protection** secondo il piano.
5. **Supabase**: URL e chiave anon sono pubbliche nel frontend per design; per uso interno va bene **RLS disabilitato** come da tuo setup (non espone admin API).

## Ultime modifiche (3-5 piu recenti)
- **PROJECT_CONTEXT**: troubleshooting pagina bianca (cache vs hash asset) e checklist accesso pubblico con solo link.
- **`src/supabase.js` / `App.jsx`**: se mancano le env Supabase, niente `createClient` invalido; messaggio di errore in pagina con istruzioni Vercel.
- **Password gate invio ordine** ripristinato in `Cart.jsx`: export `SEND_PASSWORD` in `src/config.js`; click su "Manda ordine su WhatsApp" apre una modale; solo dopo password corretta si apre `wa.me` e si svuota il carrello. Stili modale in `Cart.module.css`.
- **Seed colleghi anti-duplicati** in `App.jsx`: prima del `INSERT` da `data.json` si usa `select('*', { count: 'exact', head: true })` sulla tabella `colleghi`; si inserisce il seed solo se `count === 0`, poi si caricano le righe complete con `select('*').order('id')` se il seed non serve.
- **Migrazione Supabase**: `colleghi` e `carrello` ora persistiti su Supabase con realtime; rimosso `localStorage` per i dati dei colleghi; `data.json` usato solo come seed iniziale; aggiunto `src/supabase.js`.
- **Svuotamento carrello automatico** in `Cart.jsx`: dopo apertura link WhatsApp viene chiamata `onClearCart` (DELETE su `carrello`).
- **Fix validazione duplicati** in `NewColleagueForm`: il blocco scatta sulla coppia nome+cognome (case-insensitive); reset dell'errore anche al cambio cognome.
- Introdotto **dark mode** con toggle nell'header, CSS custom properties in `src/index.css`, persistenza in `localStorage` e fallback su `prefers-color-scheme`.
- Migrati tutti i CSS Modules alle variabili semantiche; aggiunto `ThemeToggle`.

## Prossimi passi
- Su **Vercel**, verificare che `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` siano definite per **Preview** e **Production** (le PR usano Preview): altrimenti l'app in deploy puo fallire a runtime o mostrare errori Supabase.
- Aggiungere altre validazioni nel form nuovo collega (lunghezza minima, limite ingredienti).
- Pulire file legacy non usati (`src/App.css`, asset template).
- Aggiungere test (unit/integration) sui flussi chiave: cart, messaggio WhatsApp, realtime, tema.
- Verificare ed eventualmente documentare i limiti business (numero ingredienti per categoria, regole poke default).

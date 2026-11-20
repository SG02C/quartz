# Filosofia — archivio dei corsi

Un sito statico con **tre corsi completi** trascritti dalle presentazioni originali:

| Corso | Slide | Parti | Appendice |
| --- | --- | --- | --- |
| **Storia della Filosofia** — da Talete a Freud | 616 | 7 + introduzione | 42 voci di glossario · indice dei nomi |
| **Storia del Pensiero Politico** — dalla *pòlis* a Foucault | 296 | 4 + introduzione | indice dei nomi |
| **Filosofia Orientale** — India, Cina e Giappone | 44 | 3 + introduzione | 27 voci di vocabolario · indice dei nomi |

Pubblicato su **<https://sg02c.github.io/quartz/>** (GitHub Pages, project site).

## Rotte

| Rotta | Contenuto |
| --- | --- |
| `/` | biblioteca: i corsi, con descrizione e indice delle parti |
| `/<corso>/` | home del corso: parti, numeri, altri corsi |
| `/<corso>/parti/<slug>` | edizione leggibile di una parte, slide per slide |
| `/<corso>/parti/<slug>/slide?n=42` | visualizzatore slide con miniature e navigazione da tastiera |
| `/<corso>/glossario` | glossario dell’appendice con rimandi alle slide (filosofia, oriente) |
| `/<corso>/indice` | indice dei nomi e dei temi, ricavato dai titoli delle slide |
| `/<corso>/cerca` | ricerca full-text su tutte le slide del corso |

I vecchi indirizzi della prima versione (`/parti/*`, `/glossario`, `/cerca`) sono conservati come
redirect verso `/filosofia/*`, così i link già condivisi continuano a funzionare.

`<corso>` è `filosofia`, `politica` oppure `oriente`.

## Avvio rapido

```bash
npm install
npm run dev        # http://localhost:4321/quartz
npm run build      # dist/ (statico, servito sotto /quartz)
npm run preview    # serve dist/ su http://localhost:4321/quartz
```

`astro.config.mjs` configura un GitHub Pages *project site*:

```js
site: "https://sg02c.github.io",
base: "/quartz",
```

Tutti i link interni passano da `src/lib/paths.ts` (`url()` aggiunge `BASE_URL`), quindi cambiare il
nome del repository richiede solo di aggiornare `base`.

## Pipeline dei dati

Tutto ciò che si vede sul sito è generato dalle slide: niente è trascritto a mano.

```bash
npm run data              # extract + render per tutti i corsi (idempotente)
npm run extract           # PPTX → src/data/<corso>/*.json + public/media/
npm run render            # PDF  → public/renders/<corso>/ + thumbs/
npm run verify            # integrità e copertura del testo → reports/coverage.md
```

Comandi per un solo corso:

```bash
node scripts/extract.mjs politica
node scripts/render.mjs politica
node scripts/verify.mjs politica
```

L’elenco dei corsi vive in `scripts/courses.mjs`: aggiungere una nuova presentazione significa
aggiungere una voce (id, titolo, sorgente `.pptx`, PDF) e rilanciare `npm run data`.

### Che cosa viene conservato

**Dal PPTX** (`scripts/extract.mjs`):

- ogni slide nell’ordine della presentazione (`p:sldIdLst`, non l’ordine dei file);
- titoli e sottotitoli dai segnaposto;
- paragrafi con livelli di rientro, elenchi, allineamento e run formattati
  (grassetto, corsivo, sottolineato, apici, collegamenti);
- tabelle;
- ogni relazione immagine risolta al file originale, deduplicata per SHA-1, convertita in WebP
  (max 1600 px) con proporzioni native, più posizione e dimensione visualizzata;
- collegamenti ipertestuali delle slide.

**Dal PDF** (`scripts/render.mjs`):

- un render fedele a 1280 px di ogni slide (forme vettoriali, SmartArt, frecce, sfondi);
- una miniatura a 300 px per slide.

Le immagini native condivise stanno in `public/media/` (nomi hash): i corsi riusano lo stesso
file quando la sorgente è identica. I render sono separati per corso in `public/renders/<corso>/`.

**Glossario e indice.** Filosofia e Filosofia orientale hanno un’appendice “Vocabolario”: le voci
vengono lette da lì, con la definizione originale e i rimandi alle slide in cui il termine ricorre.
Nel corso orientale l’appendice è divisa per tradizione (Induismo, Buddhismo, Filosofia cinese) e i
termini evidenziati in giallo nelle slide vengono riconosciuti automaticamente. Il pensiero politico
non ha appendice, quindi per tutti i corsi il sito genera anche un *Indice dei nomi* dai titoli delle
slide (autori, scuole, temi), senza inventare definizioni.

**Controllo di copertura** (`scripts/verify.mjs`): fallisce su render mancanti, media mancanti,
buchi nella numerazione, pagine PDF disallineate, riferimenti fuori intervallo; confronta inoltre il
testo estratto con il livello testuale del PDF slide per slide (soglia di allerta al 55%).

### Perché servono sia le immagini native sia i render PDF

Le immagini native sono la fonte migliore per la lettura (nitide, risoluzione originale), ma alcune
slide sono composte di sole forme vettoriali e due JPEG di origine sono malformati per libvips
(decodificati con `sips` di macOS come ripiego). Il render PDF garantisce che ogni slide sia
disponibile anche visivamente.

## Struttura del progetto

```
sources/                  PPTX + PDF originali (immutabili)
scripts/
  courses.mjs             registro dei corsi (id, titoli, sorgenti, PDF)
  extract.mjs             PPTX → JSON + media (per corso)
  render.mjs              PDF → render WebP + miniature (per corso)
  verify.mjs              controllo di copertura → reports/coverage.md
  qa.mjs                  QA nel browser (link, ancore, interazioni)
  shots.mjs               set di screenshot → reports/shots/
src/
  data/
    courses.json          registro generato (usato dal sito)
    <corso>/              course.json, parts/*.json, glossary.json, index.json
  lib/courses.ts          accesso tipizzato ai dati, helper (parti, indice, TOC)
  lib/paths.ts            basePath + url()
  components/             layout, card, sezione slide, lightbox
  pages/                  biblioteca, corso, parti, visualizzatore, glossario, indice, ricerca
  styles/global.css       design tokens e stili (accenti per corso)
public/
  media/                  immagini native estratte (WebP, condivise)
  renders/<corso>/        render completi + thumbs/
```

## QA

Con `npm run preview` attivo in un altro terminale:

```bash
npm run qa
# oppure contro il sito pubblicato:
ORIGIN=https://sg02c.github.io BASE_PATH=/quartz npm run qa
```

Per ogni rotta di tutti i corsi controlla errori in console, richieste fallite, HTTP ≥ 400,
overflow orizzontale, attributi `alt`, un solo `h1` per pagina; verifica tutti i link interni e le
ancore `#slide-N`; esercita lightbox, filtro di glossario/indice, ricerca e navigazione da tastiera
del visualizzatore; controlla che i vecchi indirizzi redirigano ancora.

```bash
npm run shots   # screenshot (Playwright) → reports/shots/
```

## Pubblicazione

Il sito è pubblicato dal **branch `v4` di `SG02C/quartz`** come GitHub Pages *legacy*
(Pages → Source: “Deploy from a branch”, branch `v4`, cartella `/`). Il branch contiene solo
l’output compilato più `.nojekyll`, necessario perché Pages serva `_astro/` senza elaborarlo.

```bash
npm run build
# sostituire il contenuto di un clone di SG02C/quartz con dist/,
# mantenere .nojekyll, poi commit e push su v4
```

`npm run build` funziona anche su qualsiasi host statico: pubblicare `dist/` e impostare
`base: "/"` se il sito sta sulla radice del dominio. Gli asset generati sono pesanti, perciò il
branch pubblicato contiene solo il build: sorgenti e pipeline restano nella copia di lavoro.

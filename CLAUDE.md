# Progetto sito — regole per Claude

Obiettivo: un frontend con identità visiva propria, che non sembri generato da un'AI.
Prima si decide, poi si costruisce: niente codice UI finché `docs/<nome>/01-brief.md` e
`docs/<nome>/03-design-direction.md` non sono compilati e approvati.

**Ogni nuovo sito parte dallo standard** (`standard/README.md`): `python3 strumenti/nuovo_sito.py <nome> "<Nome>"`
crea documenti, generatore e base tecnica. Prima di consegnare, `standard/checklist.md` e `standard/lezioni.md`.
Quando un sito insegna qualcosa di nuovo, si aggiorna lo standard (base, modello, checklist o lezioni), non solo il sito.

## Workflow obbligatorio

0. **Raccolta contenuti** → `docs/<nome>/00-raccolta-contenuti.md` (testi, foto, dati legali, orari: veri o verosimili).
1. **Brief** → `docs/<nome>/01-brief.md` (pubblico, obiettivo, tono, 3 siti di riferimento *non* del settore).
2. **Architettura dei contenuti** → `docs/<nome>/02-ia.md` (sitemap, gerarchia, contenuti reali per ogni pagina).
3. **Direzione di design** → `docs/<nome>/03-design-direction.md` (una tesi visiva in una frase + 2 alternative scartate e perché).
4. **Design tokens** → `docs/<nome>/04-tokens.md`, poi tradotti in CSS variables in `assets/stile.css`.
5. **Componenti** → solo dopo i token. Ogni componente nasce da un bisogno di una pagina in `02-ia.md`.
6. **Verifica** a ogni pagina finita (vedi sotto).

Usa la skill `superpowers:brainstorming` per i passi 1–3 e `superpowers:writing-plans` prima del passo 5.

## Quale MCP per cosa

| Server | Quando usarlo |
|---|---|
| `context7` | Sempre prima di scrivere codice con una libreria (Next/Astro, Tailwind v4, Motion, GSAP…): API aggiornate, niente sintassi inventata. |
| `figma` | Se esiste un file Figma: leggere variabili, componenti e layout invece di indovinare. |
| `shadcn` | Cercare/aggiungere primitive accessibili (dialog, menu, tabs). **Sempre ristilizzate** con i nostri token, mai lasciate col look di default. |
| `playwright` | Screenshot a 375 / 768 / 1280 / 1920 px dopo ogni sezione; confrontarli con la direzione di design. |
| `chrome-devtools` | Performance trace, LCP/CLS/INP, rete, console. Target: LCP < 2.0s, CLS < 0.05. |

## Plugin installati (scope progetto) e quando usarli

| Plugin | Quando usarlo |
|---|---|
| `frontend-design` | Ogni volta che si scrive UI: va caricata prima di creare pagine o componenti. |
| `playground` | Passo 3–4: esplorare 2–3 direzioni visive / tipografiche / palette come pagine HTML interattive affiancate prima di scegliere. |
| `figma` | Design-to-code, lettura token e componenti, Code Connect (richiede autenticazione via `/mcp`). |
| `feature-dev` | Implementare una pagina o sezione complessa: esplora → architettura → implementa → review. |
| `pr-review-toolkit` | Review del codice prima di chiudere una pagina (tipi, errori silenziosi, semplificazione). |
| `typescript-lsp` | Diagnostica TS in tempo reale mentre Claude scrive codice. |

## Anti-slop: cose vietate senza una ragione scritta nel design doc

- Gradienti viola/blu/indaco, "glassmorphism" e glow come decorazione di default.
- Font Inter / system-ui come unica scelta tipografica. Scegli una coppia con carattere (display + testo) e motivala.
- Hero centrato con titolo + sottotitolo + due bottoni + mockup flottante.
- Griglie di 3 card identiche con icona-titolo-paragrafo ("Fast. Secure. Scalable.").
- Emoji come icone, icone Lucide sparse ovunque come riempitivo.
- `rounded-2xl` + `shadow-lg` su tutto; border-radius e ombre devono venire dai token.
- Copy generico ("Unlock your potential", "Seamless experience", "Elevate"). Testi reali o placeholder espliciti `[TESTO: …]`.
- Animazioni fade-up uguali su ogni blocco. Il motion deve avere una regola (cosa si muove, perché, durata/easing dai token) e rispettare `prefers-reduced-motion`.
- Palette senza ruolo: ogni colore ha un nome semantico (`--color-ink`, `--color-accent`…), non `blue-500`.

## Cosa invece pretendere

- Una **scala tipografica** precisa (es. modulare 1.25 o fluida con `clamp()`), interlinea e tracking per ogni livello.
- **Griglia** e ritmo verticale definiti; almeno un layout per pagina che rompa la simmetria in modo intenzionale.
- Dettagli artigianali: stati hover/focus/active curati, focus ring visibile e di brand, empty/loading/error state.
- Contenuto prima della forma: progettare con testi e immagini realistiche, mai lorem ipsum nei layout finali.
- Accessibilità WCAG 2.2 AA: contrasto verificato, navigazione da tastiera, landmark, alt text sensati.
- Dark mode solo se in brief; se c'è, progettata, non invertita.

## Smartphone prima di tutto

Google indicizza la versione mobile e la maggior parte dei clienti arriva dal telefono: si progetta a 375 px e poi si allarga.

- Testo di lettura almeno 16 px, righe sotto i 70 caratteri, contrasto AA anche in pieno sole (niente grigi chiari su bianco).
- Aree toccabili di almeno 44 × 44 px, distanziate tra loro.
- Le azioni principali dell'attività (chiamare, prenotare, ordinare, arrivare) sempre a un tocco: barra fissa in basso su telefono, che rispetta `env(safe-area-inset-bottom)`.
- Contenuti lunghi (menu, listini) con un indice di sezione che resta visibile mentre si scorre.
- Niente hover come unico modo per scoprire un'informazione; niente PDF o immagini al posto del testo.
- Moduli: `type`, `inputmode` e `autocomplete` corretti, così si apre la tastiera giusta e si compila da soli.

## Indicizzazione Google (SEO)

Obbligatoria per ogni sito di un cliente. Fonti: Google Search Central (dati strutturati LocalBusiness), Core Web Vitals.

**Ogni pagina**
- `<title>` unico di 50–60 caratteri, nella forma "Cosa | Nome attività, Città".
- `<meta name="description">` unica di 140–160 caratteri, scritta per far cliccare chi cerca.
- `<link rel="canonical">` con l'URL definitivo; `<html lang="it">` (più `hreflang` se ci sono altre lingue).
- Un solo `<h1>`, poi `h2`/`h3` senza salti di livello.
- Contenuti importanti per la ricerca (menu, prezzi, orari, indirizzo, servizi) scritti nell'HTML, non generati solo da JavaScript, mai in PDF o immagine.
- Immagini con `alt` descrittivo, `width`/`height`, WebP o AVIF, `loading="lazy"` sotto la piega.
- Open Graph per le anteprime su WhatsApp e social: `og:title`, `og:description`, `og:image` 1200 × 630 con URL assoluto, `og:locale` = `it_IT`.
- URL leggibili e in italiano (`/menu`, `/prenota`), link interni con testo descrittivo (mai "clicca qui").

**Dati strutturati (JSON-LD)**
- L'attività con il tipo più specifico (`Restaurant`, `Bakery`, `Store`, `ProfessionalService`… altrimenti `LocalBusiness`): `name`, `address` (`PostalAddress`), `geo`, `telephone` con +39, `url`, `image`, `openingHoursSpecification`, `priceRange`, `sameAs` con i profili social (gli stessi del Google Business Profile); per i ristoranti anche `servesCuisine`, `menu` (URL della pagina menu) e `acceptsReservations`.
- Nome, indirizzo e telefono identici su sito, Google Business Profile e social.
- Validare con il Rich Results Test e con il Schema Markup Validator prima della messa online.

**Sito intero**
- `sitemap.xml` (la scrive `comune.scrivi_sitemap()`, con la data dell'ultima modifica vera di ogni pagina) e `robots.txt` alla radice del dominio, senza `Disallow` sulle pagine; sitemap inviata in Google Search Console.
- Favicon SVG e icone PNG per iPhone e Android, compresa l'icona adattiva, con manifest (`comune.scrivi_icone()`), mai solo un'icona `data:` incorporata.
- HTML valido al validatore W3C.
- Chiusure, festivi e orari speciali nel generatore (`CHIUSURE`, `comune.festivi()`): avviso in cima alle pagine, stato «aperto ora» e JSON-LD con `validFrom`/`validThrough`. Gli stessi su Google Business Profile.
- CSS e JS linkati con `?v=` e l'impronta del file (`comune.con_versione()`), così dopo un aggiornamento nessun telefono usa la copia vecchia.
- Lo script del sito nel `<head>` con `comune.script()` (`defer` e `blocking="render"`): testi calcolati sull'ora e tendine sono già al loro posto quando la pagina compare, niente spostamenti (CLS).
- Google Business Profile creato e collegato al sito: per un'attività locale conta quanto il sito.
- HTTPS, nessun link interno rotto, pagina 404 personalizzata.
- Core Web Vitals sul telefono: LCP < 2,5 s (nostro obiettivo 2,0), CLS < 0,1 (nostro obiettivo 0,05), INP < 200 ms.

**Demo e bozze**
- Le proposte con attività di fantasia hanno `<meta name="robots" content="noindex">`: indirizzi e telefoni inventati non devono finire su Google. Tutto il resto della SEO si implementa lo stesso, così la demo mostra al cliente il lavoro completo.

## Legale e conformità (Italia / UE)

Da verificare con il cliente e, per i testi definitivi, con un consulente: qui ci sono i minimi che il sito deve già rispettare.

- **Partita IVA nel piede di ogni pagina** (art. 35 DPR 633/1972); per le società anche sede, REA e capitale sociale (art. 2250 c.c.). Nel piede anche un'email di contatto (D.Lgs. 70/2003, art. 7) e, per le professioni regolamentate, ordine o albo e numero di iscrizione.
- **Font serviti dal sito**, mai da `fonts.googleapis.com`: caricarli da Google invia l'IP del visitatore a terzi (sentenza LG München, 2022). Usare `strumenti/scarica_font.py`.
- **Nessuno script di terze parti senza consenso**: niente Google Analytics, pixel o mappe incorporate prima del consenso. Con soli cookie tecnici o nessun cookie non serve il banner (Linee guida cookie del Garante, 10 giugno 2021); preferire statistiche senza cookie.
- **Informativa privacy** (art. 13 GDPR) in una pagina dedicata, linkata nel piede e accanto a ogni modulo che raccoglie dati personali; la base giuridica di prenotazioni e ordini è l'art. 6.1.b, quindi niente caselle di consenso obbligatorie per inviare il modulo.
- **Prezzi con "IVA inclusa"** (Codice del consumo, artt. 13–17).
- **Ristorazione**: allergeni dei 14 gruppi del Reg. UE 1169/2011 indicati per piatto con legenda; coperto e servizio dichiarati; prezzi IVA inclusa.
- **Accessibilità**: WCAG 2.2 AA come base. Dal 28 giugno 2025 l'European Accessibility Act (D.Lgs. 82/2022) obbliga molti servizi digitali verso i consumatori; le microimprese che forniscono servizi sono esentate, ma il sito deve comunque essere accessibile.
- **Pagina 404** personalizzata e nessun link interno rotto.

## Artifact su claude.ai: sempre uguali a git

Alcuni sample hanno anche una copia come artifact su claude.ai (l'elenco è in `ARTIFACT` dentro `strumenti/prepara_artifact.py`). La fonte è **sempre** `samples/<nome>/` su git; l'artifact non si modifica mai a mano.

- Ogni modifica a un sample che ha un artifact: commit su git, poi `python3 strumenti/prepara_artifact.py <nome>` e ripubblicazione dell'artifact (pagina `.artifact/<nome>/index.html`, tutte le altre pagine e gli `assets/` in `files`, `url` dell'artifact esistente).
- Richiesta arrivata da un commento sull'artifact: si corregge il file in `samples/`, si fa commit e si ripubblica come sopra. Mai correggere solo la copia dell'artifact.
- Dopo la pubblicazione si rilegge l'artifact e si confrontano gli hash dei file con quelli su git: devono coincidere.

## Verifica di ogni pagina (Definition of Done)

1. Screenshot Playwright ai 4 breakpoint, nessuno scroll orizzontale.
2. Trace Chrome DevTools: LCP, CLS, INP entro target; nessun errore in console.
3. Skill `design:accessibility-review` sulla pagina.
4. Skill `design:design-critique` sugli screenshot, con la domanda esplicita: "cosa qui sembra generico o generato da AI?" — correggere ciò che emerge.
5. Copy rivisto con `design:ux-copy`.
6. SEO: title e description unici, canonical, Open Graph, JSON-LD validato, Lighthouse SEO 100 sulla versione mobile.
7. `python3 strumenti/controlla.py samples/<nome> --demo` senza errori (senza `--demo` per un sito vero). Gira anche nel workflow di GitHub: con un errore la pubblicazione si ferma.

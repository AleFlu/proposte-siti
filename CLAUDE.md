# Progetto sito — regole per Claude

Obiettivo: un frontend con identità visiva propria, che non sembri generato da un'AI.
Prima si decide, poi si costruisce: niente codice UI finché `docs/01-brief.md` e
`docs/03-design-direction.md` non sono compilati e approvati.

## Workflow obbligatorio

1. **Brief** → `docs/01-brief.md` (pubblico, obiettivo, tono, 3 siti di riferimento *non* del settore).
2. **Architettura dei contenuti** → `docs/02-ia.md` (sitemap, gerarchia, contenuti reali per ogni pagina).
3. **Direzione di design** → `docs/03-design-direction.md` (una tesi visiva in una frase + 2 alternative scartate e perché).
4. **Design tokens** → `docs/04-tokens.md`, poi tradotti in CSS variables / Tailwind theme.
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
- L'attività con il tipo più specifico (`Restaurant`, `Bakery`, `Store`, `ProfessionalService`… altrimenti `LocalBusiness`): `name`, `address` (`PostalAddress`), `geo`, `telephone` con +39, `url`, `image`, `openingHoursSpecification`, `priceRange`; per i ristoranti anche `servesCuisine`, `menu` (URL della pagina menu) e `acceptsReservations`.
- Nome, indirizzo e telefono identici su sito, Google Business Profile e social.
- Validare con il Rich Results Test e con il Schema Markup Validator prima della messa online.

**Sito intero**
- `sitemap.xml` e `robots.txt` alla radice del dominio; sitemap inviata in Google Search Console.
- Google Business Profile creato e collegato al sito: per un'attività locale conta quanto il sito.
- HTTPS, nessun link interno rotto, pagina 404 personalizzata.
- Core Web Vitals sul telefono: LCP < 2,5 s (nostro obiettivo 2,0), CLS < 0,1 (nostro obiettivo 0,05), INP < 200 ms.

**Demo e bozze**
- Le proposte con attività di fantasia hanno `<meta name="robots" content="noindex">`: indirizzi e telefoni inventati non devono finire su Google. Tutto il resto della SEO si implementa lo stesso, così la demo mostra al cliente il lavoro completo.

## Verifica di ogni pagina (Definition of Done)

1. Screenshot Playwright ai 4 breakpoint, nessuno scroll orizzontale.
2. Trace Chrome DevTools: LCP, CLS, INP entro target; nessun errore in console.
3. Skill `design:accessibility-review` sulla pagina.
4. Skill `design:design-critique` sugli screenshot, con la domanda esplicita: "cosa qui sembra generico o generato da AI?" — correggere ciò che emerge.
5. Copy rivisto con `design:ux-copy`.
6. SEO: title e description unici, canonical, Open Graph, JSON-LD validato, Lighthouse SEO 100 sulla versione mobile.

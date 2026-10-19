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

## Verifica di ogni pagina (Definition of Done)

1. Screenshot Playwright ai 4 breakpoint, nessuno scroll orizzontale.
2. Trace Chrome DevTools: LCP, CLS, INP entro target; nessun errore in console.
3. Skill `design:accessibility-review` sulla pagina.
4. Skill `design:design-critique` sugli screenshot, con la domanda esplicita: "cosa qui sembra generico o generato da AI?" — correggere ciò che emerge.
5. Copy rivisto con `design:ux-copy`.

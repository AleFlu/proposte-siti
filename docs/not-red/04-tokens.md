# This is not red! — 04 Design tokens

Tradotti in CSS variables in `samples/not-red/assets/stile.css`. Contrasti calcolati con la formula WCAG 2.2.
I grigi sono OKLCH a croma 0: per un grigio la luminanza è L³, quindi il valore sRGB si ricava senza approssimazioni.

## Colori, tema chiaro
| Token | OKLCH | sRGB | Ruolo | Contrasto |
|---|---|---|---|---|
| `--carta` | 0.965 0 0 | #f3f3f3 | fondo della pagina | — |
| `--carta-2` | 0.925 0 0 | #e6e6e6 | superfici, righe alternate | — |
| `--inchiostro` | 0.20 0 0 | #161616 | testo, pulsante principale, bordi dei controlli | 16,4:1 su carta, 14,5:1 su carta-2 |
| `--grafite` | 0.40 0 0 | #484848 | testo secondario | 8,3:1 su carta, 7,4:1 su carta-2 |
| `--filo` | 0.80 0 0 | #bebebe | linee di struttura (non i bordi dei campi) | decorativo |
| `--punto` | 0.55 0 0 | #717171 | puntini del titolo | 4,4:1 su carta (testo grande, ≥ 3:1) |
| `--punto-rosso` | 0.57 0.19 27 | #d03833 | puntini di «red» | luminanza 0,164 contro 0,166 dei puntini grigi |

## Colori, tema scuro
| Token | OKLCH | sRGB | Contrasto |
|---|---|---|---|
| `--carta` | 0.17 0 0 | #0f0f0f | — |
| `--carta-2` | 0.23 0 0 | #1d1d1d | — |
| `--inchiostro` | 0.94 0 0 | #ebebeb | 16,0:1 su carta, 14,2:1 su carta-2 |
| `--grafite` | 0.76 0 0 | #b1b1b1 | 8,9:1 su carta, 7,9:1 su carta-2 |
| `--filo` | 0.36 0 0 | #3d3d3d | decorativo |
| `--punto` | 0.70 0 0 | #9e9e9e | 7,2:1 su carta |
| `--punto-rosso` | 0.72 0.15 27 | #f47c70 | luminanza 0,347 contro 0,343 |

## Palco
`--palco: #141516` e `--palco-testo: #c9ccd1`, `--palco-filo: #2a2c30`, uguali all'originale e in entrambi i temi:
il fondo vero dello stimolo lo disegna lo script dalla luminanza `Y_BG`, il palco CSS è la cornice. Testo sul palco
11,7:1. Nel tema scuro il palco è separato dalla carta da un filo `--palco-filo`.

## Segnali (senza tinta)
- Fatto: quadrato pieno d'inchiostro con la spunta in carta.
- In corso: quadrato con bordo da 2 px e numero.
- Attenzione: barra d'inchiostro da 4 px a sinistra, triangolo disegnato, testo in grassetto.
- Livelli del risultato: «Nella norma» ○, «Al limite» ◐, «Elevata» ●, sempre con la parola.
- Focus: `outline: 2px solid var(--inchiostro)` più `box-shadow: 0 0 0 4px var(--carta)`, quindi un doppio anello
  visibile su qualsiasi fondo. Sul palco i colori si invertono.

## Tipografia
- `--testo`: "Atkinson Hyperlegible Next", con riserva system-ui. `--numeri`: "Atkinson Hyperlegible Mono", ui-monospace.
- Scala 1,25 e base 17 px (1.0625rem):

| Livello | Dimensione | Peso | Interlinea | Spaziatura |
|---|---|---|---|---|
| h1 nascosto (titolo vero) | — | — | — | — |
| `--t-3` (h2) | clamp(1.66rem, 1.3rem + 1.6vw, 2.6rem) | 800 | 1.08 | -0.01em |
| `--t-2` (h3, valore del risultato) | clamp(1.33rem, 1.2rem + 0.6vw, 1.66rem) | 750 | 1.15 | -0.005em |
| `--t-1` (testo) | 1.0625rem | 400 | 1.55 | 0 |
| `--t-0` (etichette, note) | 0.875rem | 500 | 1.45 | 0.01em |
| `--t-e` (etichette Mono maiuscole) | 0.75rem | 500 | 1.3 | 0.08em |

- Righe di testo al massimo di 62ch.

## Spazi, forme, movimento
- Spazi: `--s-1` 0.25rem, `--s-2` 0.5rem, `--s-3` 0.75rem, `--s-4` 1rem, `--s-5` 1.5rem, `--s-6` 2.5rem, `--s-7` 4rem.
- Angoli: `--r-controllo` 2px, superfici 0.
- Linee: `--filo-1` 1px; bordo dei controlli 1.5px d'inchiostro.
- Movimento: `--durata` 120ms su `color`, `background-color`, `border-color`; `ease-out`. Nessun movimento di posizione.
- Contenitori: testo 38rem, app 72rem, margine dei passi 13rem (da 64rem in su).

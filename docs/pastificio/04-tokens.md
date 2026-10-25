# Pastificio Carta Blu — 04 Design tokens

Valori presi da `samples/pastificio/assets/stile.css`.

| Categoria | Token | Valore | Uso |
|---|---|---|---|
| Colore | --carta | #2F4C93 | fondo principale, la carta da zucchero |
| Colore | --carta-scura | #14244F | inchiostro, testo su chiaro, menu su telefono, barra azioni |
| Colore | --semola | #F3D27C | accenti su blu, fondo della sezione d'ordine |
| Colore | --farina | #FFFFFF | testo su blu, fondo del campionario |
| Colore | --tuorlo | #F0A81C | solo segnali: anello di focus, pallino aperto, etichetta "adesso" |
| Colore | --riga | rgba(243, 210, 124, .35) | righe e bordi su blu |
| Colore | --riga-chiara | #C9D1E6 | righe su bianco |
| Colore | --tenue-chiaro | #4A5A85 | testo secondario su bianco |
| Tipo | --display | Bodoni Moda | titoli, nomi dei formati |
| Tipo | --testo | Instrument Sans | testo, interfaccia, prezzi |
| Tipo | --s-1 … --s4 | .875 / 1 / 1.333 / 1.777 / 2.369 / 3.157 rem | scala 1.333 (quarta) |
| Tipo | --hero | clamp(3rem, 7.6vw, 7.25rem) | titolo della home |
| Tipo | --titolo-pagina | clamp(2.75rem, 6.5vw, 5.5rem) | titoli delle pagine interne |
| Spazio | --gutter | clamp(1rem, 4vw, 3.5rem) | margini e colonne |
| Spazio | --max | 78rem | larghezza massima |
| Raggio | 99px | — | pillola per navigazione, schede dei giorni e barra azioni; bottone principale, campi e schede squadrati |
| Motion | --ease | cubic-bezier(.2, .7, .1, 1) | tratto dei glifi, rotazione al passaggio |

## Contrasti verificati (WCAG 2.2 AA)
| Testo | Fondo | Rapporto | Esito |
|---|---|---|---|
| farina #FFFFFF | carta #2F4C93 | 8.2:1 | AA, AAA |
| semola #F3D27C | carta #2F4C93 | 5.6:1 | AA |
| carta-scura #14244F | semola #F3D27C | 10.3:1 | AA, AAA |
| carta-scura #14244F | farina #FFFFFF | 15.1:1 | AA, AAA |
| carta #2F4C93 | farina #FFFFFF | 8.2:1 | AA, AAA (link nel campionario) |
| tenue-chiaro #4A5A85 | farina #FFFFFF | 6.8:1 | AA |
| tuorlo #F0A81C | carta #2F4C93 | 4.0:1 | solo elementi non testuali (minimo 3:1): mai per il testo |

## Interlinea per livello
- Titoli display (hero, pagine): 1,12, per le discendenti del Bodoni.
- Titoli di sezione: 1.
- Testo: 1,55.

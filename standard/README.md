# Standard per un nuovo sito

Quello che abbiamo imparato facendo il Pastificio Carta Blu e la Pizzeria La Cupola, messo in fila per
ripartire ogni volta dallo stesso punto. Le regole stanno in `CLAUDE.md`. Qui ci sono i passi, i modelli e
gli strumenti per rispettarle.

## Cosa c'è

| File | A cosa serve |
|---|---|
| `raccolta-contenuti.md` | La scheda da compilare con il cliente prima di disegnare: testi, foto, dati legali, orari. |
| `modelli/01–04` | Brief, architettura dei contenuti, direzione di design, token. Si copiano in `docs/<nome>/`. |
| `base/base.css` | La parte del CSS che non cambia tra un sito e l'altro: accessibilità, barra fissa su telefono, stampa. |
| `base/base.js` | Menu su telefono, stato "aperto ora", indice del menu che segue lo scorrimento, schede accessibili. |
| `modello_generatore.py` | Il generatore di partenza: testata, piede legale, meta SEO, JSON-LD, privacy, sitemap, icone. |
| `checklist.md` | Da spuntare prima di mostrare la proposta e prima della messa online. |
| `lezioni.md` | Gli errori che abbiamo già fatto, perché non si ripetano. |

E in `strumenti/`:

| Script | A cosa serve |
|---|---|
| `nuovo_sito.py <nome>` | Crea `docs/<nome>/`, `samples/<nome>/` e `strumenti/genera_<nome>.py` dai modelli. |
| `genera_<nome>.py` | Rigenera tutte le pagine del sito. Si modifica questo, mai gli HTML a mano. |
| `comune.py` | Condiviso da tutti i generatori: icone (favicon SVG, PNG per iPhone e Android, manifest), sitemap, link a CSS e JS con impronta, chiusure e festivi (avvisi, tabella, dati per lo script e per Google). |
| `scarica_font.py` | Scarica i font e li serve dal sito (niente richieste a Google). |
| `controlla.py` | Controllo automatico di SEO, legale, accessibilità di base, link interni, impronte di CSS e JS e chiusure. Gira anche su GitHub prima di ogni pubblicazione. |
| `prepara_artifact.py` | Copia per l'artifact su claude.ai, sempre generata da git. |

## I passi

1. **Raccolta.** Compila `raccolta-contenuti.md` con il cliente, o con dati inventati ma realistici se è una
   proposta. Niente lorem ipsum: un sito progettato su testi finti sembra finto.
2. **Avvio.**
   ```bash
   python3 strumenti/nuovo_sito.py nome-attivita
   ```
3. **Documenti** in `docs/<nome>/`, in quest'ordine: brief → architettura → direzione di design → token.
   La direzione di design ha una tesi visiva in una frase e due alternative scartate. Nessuna pagina prima
   che siano approvati.
4. **Font.** Scegli una coppia con carattere (display + testo), poi:
   ```bash
   python3 strumenti/scarica_font.py samples/<nome>/assets "https://fonts.googleapis.com/css2?family=…&display=swap"
   ```
5. **Stile.** In `samples/<nome>/assets/stile.css` vanno solo i token e l'identità del sito. `base.css` resta
   com'è. Se serve cambiarlo, il cambiamento va riportato in `standard/base/` per i prossimi siti.
6. **Pagine.** Si scrivono nel generatore, con i contenuti nell'HTML: menu, prezzi e orari non si generano in
   JavaScript. Il JavaScript aggiunge solo interazione e deve avere un ripiego sensato se non parte.
7. **Verifica.** Dopo ogni pagina:
   ```bash
   python3 strumenti/genera_<nome>.py && python3 strumenti/controlla.py samples/<nome> --demo
   ```
   Poi i passi manuali di `checklist.md`: screenshot a 320/375/768/1280 px, Lighthouse, tastiera, critica di
   design con la domanda "cosa sembra generato da un'AI?".
8. **Pubblicazione.** Commit e push su `main`: GitHub Pages ripubblica da solo, ma prima il workflow fa girare
   `controlla.py` e con un errore si ferma. Se il sito ha un artifact, rigeneralo e ripubblicalo subito (regola in
   `CLAUDE.md`).

## Da proposta a sito vero

Quando un cliente accetta, il sito di fantasia diventa reale. In `checklist.md`, sezione "Messa online",
c'è tutto quello che cambia: via il `noindex`, dati legali veri, dominio, modulo che invia davvero,
Search Console, Google Business Profile, consegna al cliente.

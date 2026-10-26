# Lezioni imparate

Errori fatti sui primi due siti, con la correzione. Prima di consegnare, rileggerle.

## Design
- **Il primo sample del commercialista non è piaciuto: era corretto ma generico.** Un sito funziona quando
  parte da una cosa che solo quell'attività ha: la carta blu del pastificio, il forno a mosaico e l'impasto
  che lievita "in diretta" della pizzeria.
- **Menu della pizzeria "troppo AI".** Era un insieme di card con chip e filtri. I menu veri sono una lista
  tipografica: nome, ingredienti sotto, prezzo allineato a destra. In più: allergeni per piatto, segni
  vegetariano/piccante con legenda, un riquadro solo per il fuori menu, indice laterale che segue lo scorrimento.
- **Mosaico con lettere disegnate a tessere: illeggibile.** Una decorazione non deve fingere di essere testo.
  Al loro posto: fascia ad arco e rosone.
- **Colonna laterale del menu sbilanciata su desktop.** Va dimensionata in `rem` (`15.5rem minmax(0, 44rem)`)
  e riempita con qualcosa di utile (legenda, nota prezzi, Prenota), non lasciata vuota.
- **Icone dei formati di pasta a dimensioni diverse.** Le icone disegnate a mano vanno normalizzate su una
  stessa scatola e poi corrette a occhio (la centrale più alta di un 22%).
- **Hub "spartano".** Una lista di link non vende. Anteprime vive, palette e campioni dei caratteri sì.

## Tipografia e CSS
- **Bodoni con interlinea 1,02: le discendenti si sovrapponevano alla riga sotto.** Display con discendenti
  lunghe: interlinea ≥ 1,12.
- **Numeri con `tabular-nums` nel testo corrente apparivano "38 . 000".** Cifre tabellari solo nelle colonne
  di prezzi e orari, `lining-nums` nel testo.
- **Griglie che sbordano a 320–640 px.** Le colonne si scrivono `minmax(0, 1fr)` e i figli flessibili hanno
  `min-width: 0`.
- **Una regola generica `section { padding }` colpiva le sezioni del menu.** Regole generiche solo sui
  contenitori di pagina. I componenti si azzerano esplicitamente.
- **Testo con `opacity` ridotta: contrasto bocciato da Lighthouse.** Il colore tenue va scritto come colore,
  non come trasparenza. Ricapitato con gli orari "pieno" della pizzeria, che compaiono solo quando un turno
  è pieno: ora `controlla.py` segnala ogni `opacity` sotto 1 nei CSS.
- **`[hidden]` annullato da un `display: grid` del componente.** Serve una regola `.componente[hidden] { display: none }`.

## Accessibilità
- **Vegetariana e piccante distinti solo dal colore** (quadratino verde e quadratino arancio): per chi non distingue
  i colori erano uguali. Ora tondo e rombo, con la legenda che usa le stesse forme.
- **La barra fissa in basso copriva in parte i campi raggiunti con la tastiera.** `scroll-padding-bottom` sull'`html`,
  dentro la media query della barra. Per misurarlo con Playwright aspettare la fine dello scorrimento animato.
- **`aria-label` diverso dal testo visibile** (label-content-name-mismatch). Per dare più contesto si usa
  testo nascosto visivamente (`.vh`) dentro il link, non `aria-label`.
- **Schede del banco senza tastiera.** Ruoli `tablist`/`tab`/`tabpanel`, frecce, Home e Fine, `tabindex` mobile.
- **Stati selezionati invisibili con i colori forzati.** L'orario scelto in Prenota e il giorno attivo al
  banco si distinguevano solo per lo sfondo, che il contrasto elevato di Windows cancella. Serve sempre un bordo
  (`Highlight`) in `@media (forced-colors: active)`.
- **Orari della pizzeria generati solo da JavaScript** in "Dove siamo": per Google non esistevano. Ora
  `controlla.py` segnala tabelle, liste e tendine vuote nell'HTML.
- **Salto di livello h1 → h3** nella pagina Formati del pastificio, trovato da `controlla.py`.

## SEO e legale
- **Nessuno dei due siti aveva un link per arrivare**, nonostante la regola «arrivare a un tocco». Ora la pagina
  Dove siamo ha il link a Google Maps e la sua barra mostra Chiama e Indicazioni.
- **Mancava l'email nel piede** (D.Lgs. 70/2003, art. 7). `controlla.py` ora la segnala.
- **«Fuori menu di ottobre»**: un testo con il mese invecchia da solo. Meglio «di stagione», oppure la data va nel
  calendario degli aggiornamenti.
- **GitHub Pages non è adatto ai siti dei clienti**: i termini lo escludono per attività commerciali e vendite.
- **Font caricati da Google.** Inviano l'IP del visitatore a terzi: font sempre locali con `scarica_font.py`.
- **Partita IVA e privacy mancanti nei primi sample.** Ora sono nel piede del generatore di partenza.
- **"Coperto incluso" senza "IVA inclusa".** I prezzi devono dire se l'IVA è inclusa.
- **Favicon incorporata come `data:`.** Google e iPhone vogliono file veri: `comune.scrivi_icone()`.
- **Contenuti generati solo da JavaScript** (orari prenotabili in home): senza JS restava una lista vuota.
  Nell'HTML ci va sempre un ripiego statico, che il JS sostituisce.
- **Anteprima social tagliata.** Lo screenshot 1200 × 630 va fatto con la pagina rimpicciolita (zoom 0,78)
  e controllato intero.

## Codice
- **«Aperto ora» calcolato sull'ora del telefono**: un turista con il telefono su un altro fuso vedeva l'orario sbagliato.
  Ora si usa l'ora di Roma (`oraItalia()` in `base.js`).
- **Il nome scritto nel modulo veniva inserito come HTML** nel messaggio di conferma. Era un rischio solo per chi lo
  scriveva, ma è una cattiva abitudine: ora passa da `esc()`.
- **Il sito avrebbe detto «Aperto ora» a Natale e in ferie.** Lo stato guardava solo la settimana tipo. Ora chiusure,
  festivi e orari speciali stanno in `CHIUSURE` nel generatore (`comune.festivi()` per le feste nazionali, Pasqua
  compresa): da lì escono l'avviso in cima alle pagine, lo stato, i giorni prenotabili, la domenica di ritiro degli
  ordini, la tabella «Prossime chiusure» e i dati per Google.
- **Dopo un aggiornamento la pagina nuova poteva arrivare con lo stile vecchio.** GitHub Pages fa tenere CSS e JS in
  cache per 10 minuti. I link portano `?v=` con l'impronta del file (`comune.con_versione()`) e `controlla.py`
  ferma la pubblicazione se l'impronta non corrisponde.
- **Le date scritte a mano sbagliano le elisioni**: si dice «dall’8», «l’11», «1° maggio». Le frasi delle chiusure
  le scrive `comune.periodo()`.

## Strumenti
- **Rich Results Test: "L'URL non è disponibile per Google" sulle demo.** Rifiuta le pagine con `noindex`.
  Per le demo: validator.schema.org con l'URL, oppure il Rich Results Test con il sorgente incollato nella scheda "Codice".
- **Playwright mostrava file vecchi dalla cache.** Disattivare la cache via CDP (`Network.setCacheDisabled`)
  prima di verificare una modifica.
- **Comandi concatenati con `&&` dopo uno script fallito.** Un `git rm` è partito anche se lo script prima
  aveva dato errore. Prima si verifica l'esito, poi si cancella.
- **Context7 con `@latest` non partiva.** Versioni MCP fissate quando `latest` non è ancora sul registro.
- **Controllo dimenticato prima del push.** `controlla.py` ora gira anche nel workflow di GitHub prima della
  pubblicazione: con un errore il sito online resta com'era.
- **Artifact rimasto indietro rispetto a git.** L'artifact si rigenera sempre da `samples/` con
  `prepara_artifact.py` e si verificano gli hash dopo ogni pubblicazione.
- **"Su git" per il cliente vuol dire online.** Le modifiche vanno committate e pushate su `main`, non
  lasciate in locale o su un branch.

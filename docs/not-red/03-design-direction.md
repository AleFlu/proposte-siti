# This is not red! — 03 Direzione di design

## Tesi visiva
L'interfaccia è grigia perché l'unico colore deve essere quello che stai misurando: un modulo d'ambulatorio stampato in
nero su carta neutra, con i numeri da strumento, e il colore solo negli stimoli, nel filtro e nelle foto.

## Perché funziona
- **Per la misura**: un'interfaccia colorata intorno al palco sposta l'adattamento dell'occhio prima di ogni prova.
  Con grigi a saturazione zero (OKLCH, croma 0) niente disturba, e il palco grigio dell'originale smette di essere
  un'eccezione.
- **Per chi la usa**: il pubblico è daltonico. Se nessuna parte dell'interfaccia usa la tinta, nessuno resta escluso,
  e la regola «mai solo il colore» si rispetta per costruzione.
- **Per l'identità**: tutti i siti sul daltonismo sono arcobaleni e tavole Ishihara. Quello grigio, stampato come un
  modulo, si ricorda, e rende serio un nome ironico come «This is not red!».

## Alternative scartate
1. **Rivista scientifica** (serif editoriale, colonne, figure numerate): autorevole, ma trasforma il test in una lettura.
   È proprio il muro di testo che togliamo dal percorso. Resta un'eco solo nella pagina Come funziona.
2. **Puntini colorati ovunque**, come nelle tavole Ishihara: è il cliché del tema. In più i colori intorno al palco
   disturbano la misura.

## Tipografia
- **Atkinson Hyperlegible Next** per titoli e testo. L'ha disegnata il Braille Institute per chi vede poco, con lettere
  che non si confondono (I/l/1, O/0): è il carattere giusto per un sito sulla vista, ed è la ragione della scelta, non
  la moda. Titoli a 800 con interlinea stretta, testo a 400.
- **Atkinson Hyperlegible Mono** per valori, unità, soglie, numeri dei passi e codice: i numeri da strumento.
- Scala modulare 1,25 con `clamp()`, testo da 17 px su telefono. Valori e dettagli nei token.
- Una sola famiglia è una scelta, non un ripiego: la leggibilità è la tesi, e il contrasto lo danno i pesi e la versione Mono.

## Colore (ruoli)
Tutti i colori dell'interfaccia hanno croma 0: grigi veri, né caldi né freddi.
- **carta**: fondo della pagina.
- **carta-2**: superfici (pannello dei controlli, righe alternate della tabella).
- **inchiostro**: testo e pulsante principale.
- **grafite**: testo secondario, almeno 7:1 sulla carta, perché si legge anche in piena luce.
- **filo**: linee e bordi di struttura.
- **palco**: il fondo del test e del tremolio, quello dell'originale, che non cambia.
- Segnali senza tinta: «fatto» è un quadrato pieno con la spunta, «attenzione» è una barra nera spessa con il
  triangolo, un errore dice cosa fare. Il focus è un doppio anello nero e bianco, visibile su qualsiasi fondo, palco
  compreso.
- **Colore vero solo in**: stimoli, righe della calibrazione, campo del tremolio, immagine del simulatore, la parola
  «red» del titolo.
- **Tema scuro**: c'era e resta, progettato e non invertito. Carta quasi nera, inchiostro quasi bianco, il palco
  separato dalla pagina con un filo perché non ci si fonda.

## Forme
Angoli a 2 px per i controlli, come i tasti di uno strumento; 0 per le superfici. Niente ombre: la struttura la danno i
fili da 1 px. Il pulsante principale è un rettangolo pieno d'inchiostro, quello secondario ha solo il bordo.
Niente pillole.

## Layout e griglia
- Si parte dal telefono a 375 px. Testo in colonna di massimo 38rem; l'app si allarga fino a 72rem.
- **Il percorso del test come un modulo**: su desktop i 5 passi sono numerati nel margine sinistro, in una colonna
  stretta che resta visibile mentre si scorre; il passo in corso occupa la colonna larga. È l'asimmetria voluta della
  pagina. Su telefono il margine diventa una riga in alto, «2/5 Calibra», che resta visibile.
- **Il palco** è quadrato, al centro di un campo grigio scuro, a tutta larghezza sul telefono. I tasti direzionali
  stanno sotto, a croce, raggiungibili con il pollice.
- **Il simulatore**: controlli in una colonna da 20rem a sinistra, immagine grande a destra. Su telefono prima
  l'immagine, poi i controlli.
- **Il risultato** come una scheda: la frase con tipo e intensità in grande, poi il diagramma e la tabella delle soglie
  in colonne da strumento.

## Motion (regola unica)
Si muove solo ciò che si misura: gli stimoli del test e il campo del tremolio. L'interfaccia cambia stato al massimo in
120 ms, solo su colore e opacità; niente entrate animate, niente titoli che si disegnano. Con
`prefers-reduced-motion` il tremolio non parte da solo e l'avviso dice che la prova è fatta di luce intermittente.

## Immagini e iconografia
Nessuna foto e nessuna emoji. Poche icone disegnate per il sito, a tratto da 2 px in `currentColor`: le quattro frecce
dell'apertura della C, la spunta, il triangolo di attenzione, il mezzo cerchio del tema. Le lingue si scrivono con le
sigle (IT, EN, DE, FR, ES, PT), senza bandiere: una lingua non è un paese.

## Il dettaglio memorabile
Il titolo fatto di puntini grigi, come una tavola, in cui solo la parola **red** è di puntini rossi della stessa
luminosità del fondo: chi vede i colori la legge in rosso, chi è daltonico capisce in un secondo di cosa parla il sito.
Perché nessuno resti fuori, i puntini di «red» sono anche più piccoli e fitti, quindi la parola si legge comunque dalla
forma. Il testo vero del titolo resta nell'HTML.

## Proposte di funzioni piccole, da approvare
- **Scheda stampabile del risultato** (`@media print`): tipo, intensità, soglie e data su un foglio da portare
  all'oculista.
- **«Cancella i miei dati»** nella pagina Privacy: svuota calibrazione, sessioni e preferenze salvate nel browser.

## Revisione del 2026-11-03 (dopo la prima versione)
L'utente ha trovato il frontend «pigro»: grigio e pulito era diventato spoglio. Sei interventi, ognuno in un commit
separato perché si possa tornare indietro su uno solo:
1. **Apertura con un palco di prova**: accanto al titolo una prova vera (C di puntini) disegnata con lo stesso calcolo
   del test, così si capisce cosa si farà prima di iniziare.
2. **Preparazione come modulo stampato**: righe numerate con il filo, casella grande a destra, contatore
   «4 di 6 condizioni pronte».
3. **Risultato come scheda**: intestazione con la data, esito grande, intensità in cifre da strumento accanto.
4. **Simulatore con l'immagine protagonista**: foto a tutta larghezza, controlli in una barra sotto.
5. **Testata su una riga sul telefono**: marchio e «Menu»; dentro pagine, tema e lingua.
6. **Come funziona con uno schema**: le tre linee di confusione disegnate a tratto, senza colore.
Nelle prove di pratica il test non dice più se la risposta era giusta (scelta dell'utente).

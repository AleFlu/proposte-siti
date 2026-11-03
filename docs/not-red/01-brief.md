# This is not red! — 01 Brief

Rifacimento come sito dell'artifact «This is not red!»: stesse funzioni, senza l'aspetto da AI.
Non è un'attività locale, quindi dello standard si usa il processo (documenti, generatore, controlli, verifiche)
ma non le parti da negozio (orari, chiusure, partita IVA, `LocalBusiness`).

## Il sito in una frase
Un test dei colori da fare a casa davanti allo schermo, che stima tipo e intensità del daltonismo e poi lo trasforma
in un filtro per far vedere agli altri come vedi.

## Pubblico
- Primario: chi sospetta di essere daltonico, o lo sa e vuole capire quanto e di che tipo.
- Secondario: chi riceve un link al profilo di qualcuno (partner, collega, genitore di un bambino daltonico) e vuole
  vedere le foto «con i suoi occhi»; grafici e designer che controllano un'immagine.
- Nei primi 10 secondi vogliono sapere: cosa misura, quanto ci vuole, cosa devo preparare, è affidabile?

## Obiettivo
Arrivare in fondo al test con condizioni buone (schermo calibrato, stanza giusta) e un risultato comprensibile.
Seconda azione: aprire il simulatore e condividere il proprio profilo.

## Tono
- Siamo: un ambulatorio serio ma a casa propria. Precisi sui numeri, onesti sui limiti («è una stima»),
  brevi nelle istruzioni: si legge una cosa alla volta, quando serve.
- Non siamo: un'app «divertente» con colori e pillole, un quiz da social, un dispositivo medico.

## Riferimenti fuori settore
1. Tavole e moduli stampati degli ambulatori oculistici: carta grigia, inchiostro nero, numeri in colonna.
2. Strumenti di misura da laboratorio e i loro manuali (fotometri, colorimetri): etichette piccole, valori grandi.
3. Cartelli di sicurezza e segnaletica acromatica: si capiscono senza distinguere i colori.

## Anti-riferimenti
- L'artifact stesso: indaco e giallo, pillole, riquadri azzurrini, testi lunghi prima di poter fare qualcosa.
- I test online di daltonismo con le tavole Ishihara ovunque e i bottoni arcobaleno.

## Vincoli
- HTML/CSS/JS statico, nessuna libreria, generato da `strumenti/genera_notred.py` come gli altri siti.
- **Il calcolo non cambia**: procedure a scala, soglie di normalità, analisi, matrici di Machado, colorimetria e
  calibrazione si copiano dall'originale senza modifiche. Si cambiano aspetto, struttura e testi.
- **Nessuna informazione affidata al colore** in tutta l'interfaccia: il pubblico è daltonico per definizione.
- Tutto resta sul dispositivo: risposte, calibrazione e foto non lasciano il browser (`localStorage`, nessun server).
- **Non è un dispositivo medico** (Reg. UE 2017/745): i testi parlano di stima e di autovalutazione, mai di diagnosi,
  e rimandano all'oculista. Da far rivedere a un consulente prima di una messa online vera.
- Avviso per l'epilessia fotosensibile prima del tremolio, che resta facoltativo.

## Lingue
Le 6 lingue restano. Ogni lingua ha le sue pagine in HTML (`/not-red/`, `/not-red/en/`, …) con `hreflang`, così i testi
sono nell'HTML e non solo nello script. I testi che riscrivo li traduco io; prima della messa online vanno rivisti da
madrelingua.

## Da proporre prima di toccare lo standard
Lo standard è pensato per le attività locali. Per una web app servono tre cose nuove, da approvare:
1. **Pagine per lingua** generate dallo stesso generatore, con `hreflang` e un `controlla.py` che le capisca.
2. **JSON-LD `WebApplication`** (gratuita, `inLanguage`, `applicationCategory`) al posto di `LocalBusiness`.
3. **Funzionamento senza rete**: un service worker che salva pagine e file alla prima visita, così il test si
   installa sul telefono e funziona offline.
Se le approvi, entrano nello standard come «variante web app»; altrimenti restano solo in questo sito.

## Da decidere
- `noindex`: il contenuto non è inventato, ma il sito vive tra le demo. Proposta: `noindex` finché non decidi dove
  va online davvero.
- Email di contatto e nome dell'autore nel piede (vedi raccolta contenuti).

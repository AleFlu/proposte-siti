"""Genera le pagine statiche del Pastificio Carta Blu (testata e piede condivisi)."""
import pathlib, sys

OUT = pathlib.Path(sys.argv[1])

FAVICON = "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 fill=%27%232F4C93%27/%3E%3Ccircle cx=%2716%27 cy=%2716%27 r=%279%27 fill=%27none%27 stroke=%27%23F3D27C%27 stroke-width=%273%27/%3E%3C/svg%3E"

CUR = ' aria-current="page"'
NAV = [("formati.html", "Formati"), ("banco.html", "Al banco"), ("bottega.html", "La bottega")]


def pagina(file, titolo, descrizione, chiave, corpo):
    voci = "\n".join(
        f'    <a href="{h}"{CUR if h == file else ""}>{t}</a>' for h, t in NAV
    )
    ordina_cur = ' aria-current="page"' if file == "ordina.html" else ""
    titolo_completo = "Pastificio Carta Blu" if file == "index.html" else f"{titolo} | Pastificio Carta Blu"
    html = f"""<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titolo_completo}</title>
<meta name="description" content="{descrizione}">
<link rel="icon" href="{FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..800;1,6..96,400..700&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/stile.css">
</head>
<body data-pagina="{chiave}">
<a class="salta" href="#contenuto">Vai al contenuto</a>

<header class="wrap testata">
  <a class="marchio" href="index.html"{CUR if file == "index.html" else ""}>Pastificio <span>Carta Blu</span></a>
  <button class="menu-apri" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
  <nav class="nav" id="nav" aria-label="Principale">
{voci}
    <a class="nav-ordina" href="ordina.html"{ordina_cur}>Ordina per domenica</a>
  </nav>
</header>

<main id="contenuto">
{corpo.strip()}
</main>

<footer>
  <div class="wrap">
    <div class="piede">
      <div>
        <h2>Pastificio Carta Blu</h2>
        <p>Borgo Riccio 14, 43121 Parma</p>
        <p>Telefono 0521 000 000</p>
      </div>
      <div>
        <h2>Orari</h2>
        <p data-orari-oggi>Dal martedì al sabato dalle 7:30</p>
        <p><a href="banco.html#orari-settimana">Orari di tutta la settimana</a></p>
      </div>
      <div>
        <h2>Pagine</h2>
        <ul>
          <li><a href="formati.html">Formati</a></li>
          <li><a href="banco.html">Al banco</a></li>
          <li><a href="bottega.html">La bottega e dove siamo</a></li>
          <li><a href="ordina.html">Ordina per domenica</a></li>
        </ul>
      </div>
    </div>
    <p class="nota-demo">Proposta grafica dimostrativa: attività, persone, indirizzo e recapiti sono di fantasia.</p>
  </div>
</footer>

<script src="assets/sito.js"></script>
</body>
</html>
"""
    (OUT / file).write_text(html)


STATO = """
  <div class="stato">
    <div class="wrap">
      <span data-stato><span class="pallino"></span><strong>Orari</strong> dal martedì al sabato</span>
      <span>Borgo Riccio 14, Parma</span>
      <span>0521 000 000</span>
    </div>
  </div>
"""

pagina("index.html", "Home",
  "Pasta fresca tirata a mano ogni mattina in Borgo Riccio, Parma. Banco del giorno, formati e ordini per la domenica.",
  "home", f"""
  <div class="wrap apertura">
    <div>
      <h1>La sfoglia di oggi l’abbiamo tirata alle sei.</h1>
      <p>Pasta fresca all’uovo e ripiena, fatta a mano in Borgo Riccio dal 1962. Si compra al banco, a peso, incartata nella carta blu.</p>
    </div>
    <div class="tris disegna" aria-hidden="true">
      <svg viewBox="0 0 120 120"><use href="#g-tortellini"/></svg>
      <svg viewBox="0 0 120 120"><use href="#g-tagliatelle"/></svg>
      <svg viewBox="0 0 120 120"><use href="#g-strichetti"/></svg>
    </div>
  </div>
{STATO}
  <section aria-labelledby="banco-oggi-titolo">
    <div class="wrap">
      <div class="titolo-sezione">
        <h2 id="banco-oggi-titolo">Oggi al banco</h2>
        <p>Prezzi al chilo. Le tagliatelle ci sono tutti i giorni, il resto gira con la settimana.</p>
      </div>
      <div id="banco-oggi"></div>
      <a class="rimando" href="banco.html">Il banco di tutta la settimana</a>
    </div>
  </section>

  <section class="campionario" aria-labelledby="t-striscia">
    <div class="wrap">
      <div class="titolo-sezione">
        <h2 id="t-striscia">Otto formati, nessun sacchetto di plastica</h2>
        <p>Ogni formato ha il suo giorno: lo facciamo quando la farina e il ripieno sono giusti, non per riempire il banco.</p>
      </div>
      <ul class="striscia" id="striscia"></ul>
      <a class="rimando" href="formati.html">Come si cuoce ogni formato</a>
    </div>
  </section>

  <section class="ordina" aria-labelledby="t-domenica">
    <div class="wrap">
      <div class="titolo-sezione">
        <h2 id="t-domenica">Il pranzo della domenica</h2>
        <p>La domenica apriamo solo per gli ordini. Prenota entro venerdì alle 19 e ritira tra le 8 e le 12: tortellini e anolini sono già pronti da buttare.</p>
      </div>
      <a class="bottone" href="ordina.html">Ordina per domenica</a>
    </div>
  </section>
""")

pagina("formati.html", "Formati",
  "Gli otto formati del Pastificio Carta Blu: come si cuociono, con cosa si condiscono e in che giorno si trovano al banco.",
  "formati", """
  <div class="wrap testa-pagina">
    <h1>Formati</h1>
    <p>Otto formati della tradizione emiliana. Tocca un formato per sapere come cuocerlo, con cosa condirlo e in che giorno lo trovi.</p>
  </div>

  <section class="campionario" aria-label="Campionario dei formati">
    <div class="wrap">
      <ul class="formati" id="lista-formati"></ul>
      <div class="scheda" id="scheda" hidden aria-live="polite"></div>
    </div>
  </section>

  <section aria-labelledby="t-conserva">
    <div class="wrap">
      <div class="titolo-sezione">
        <h2 id="t-conserva">Come si conserva</h2>
        <p>La pasta fresca non ha conservanti: trattala come il pane buono.</p>
      </div>
      <dl class="conserva">
        <div><dt>In frigo</dt><dd>Fino a due giorni, nella sua carta blu. Le tagliatelle si asciugano un po’ e cuociono meglio.</dd></div>
        <div><dt>In freezer</dt><dd>Crudi, stesi su un vassoio infarinato, poi in un sacchetto. Si buttano nell’acqua senza scongelarli.</dd></div>
        <div><dt>I ripieni</dt><dd>Tortellini, anolini e tortelli vanno cotti entro il giorno dopo, o congelati il giorno stesso.</dd></div>
      </dl>
    </div>
  </section>
""")

pagina("banco.html", "Al banco",
  "Cosa trovi al banco del Pastificio Carta Blu giorno per giorno, con i prezzi al chilo e gli orari.",
  "banco", f"""
  <div class="wrap testa-pagina">
    <h1>Al banco</h1>
    <p>Le tagliatelle ci sono tutti i giorni. Il resto gira con la settimana: i tortellini il giovedì e il sabato.</p>
  </div>
{STATO}
  <section aria-label="Banco giorno per giorno">
    <div class="wrap">
      <div class="giorni" role="tablist" aria-label="Giorno della settimana" id="giorni"></div>
      <div id="banco-giorno" role="tabpanel" aria-live="polite"></div>
    </div>
  </section>

  <section class="campionario" aria-labelledby="orari-settimana">
    <div class="wrap due-colonne">
      <div>
        <h2 class="sottotitolo" id="orari-settimana">Orari</h2>
        <table class="orari orari-chiari" aria-labelledby="orari-settimana"><tbody id="orari"></tbody></table>
      </div>
      <div>
        <h2 class="sottotitolo">Buono a sapersi</h2>
        <ul class="buono buono-chiaro">
          <li>Si paga anche con carta e bancomat, pure per un etto di tagliatelle.</li>
          <li>Se porti il tuo contenitore, la pasta va lì e la carta resta a noi.</li>
          <li>Il sabato alle 11 i tortellini spesso sono finiti: chiama prima, li mettiamo da parte.</li>
        </ul>
      </div>
    </div>
  </section>
""")

pagina("bottega.html", "La bottega",
  "La storia del Pastificio Carta Blu, la giornata del laboratorio e come arrivare in Borgo Riccio a Parma.",
  "bottega", """
  <div class="wrap testa-pagina">
    <h1>La bottega</h1>
    <p>Dal 1962 in Borgo Riccio, con la stessa spianatoia di faggio.</p>
  </div>

  <section aria-label="La storia">
    <div class="wrap storia">
      <p class="citazione">“La sfoglia si capisce con le mani: quando la vedi in controluce, è pronta.”</p>
      <div class="testo">
        <p>Ada Riva ha aperto il banco nel 1962, con un mattarello lungo un metro e mezzo e una spianatoia di faggio comprata da un falegname di Langhirano. È la stessa su cui oggi chiudiamo i tortellini.</p>
        <p>Adesso la sfoglia la tira sua nipote Marta, con altre tre sfogline. Niente macchine per stendere: solo mattarello, uova di un allevamento di Collecchio e farina macinata a pietra.</p>
        <p>La carta blu è quella di sempre. Si usava perché non lascia odori e tiene la pasta asciutta. Noi la usiamo anche perché i clienti la riconoscono dall’altra parte della strada.</p>
      </div>
    </div>
  </section>

  <section class="campionario" aria-labelledby="t-giornata">
    <div class="wrap">
      <div class="titolo-sezione">
        <h2 id="t-giornata">La giornata del laboratorio</h2>
        <p>Dal martedì al sabato, sempre con lo stesso ordine. Il lunedì si riposa e si lava tutto.</p>
      </div>
      <ol class="giornata">
        <li data-ore="5.5"><time>5:30</time><div><h3>L’impasto</h3><p>Un uovo ogni cento grammi di farina, a mano sulla spianatoia. Poi riposa coperto per mezz’ora.</p></div></li>
        <li data-ore="6"><time>6:00</time><div><h3>La sfoglia</h3><p>Si tira al mattarello finché si vede la venatura del legno attraverso la pasta.</p></div></li>
        <li data-ore="6.75"><time>6:45</time><div><h3>I ripieni</h3><p>Tortellini, anolini e tortelli si chiudono uno a uno. Un chilo di tortellini sono circa mille pieghe.</p></div></li>
        <li data-ore="7.5"><time>7:30</time><div><h3>Apre il banco</h3><p>La pasta del mattino è pronta e si comincia a incartare.</p></div></li>
        <li data-ore="11"><time>11:00</time><div><h3>La seconda sfoglia</h3><p>Le tagliatelle per il pomeriggio, così la sera sono fresche come al mattino.</p></div></li>
        <li data-ore="19.5"><time>19:30</time><div><h3>Si chiude</h3><p>La spianatoia si pulisce solo con il raschietto e un panno asciutto. Mai acqua sul faggio.</p></div></li>
      </ol>
    </div>
  </section>

  <section id="dove" aria-labelledby="t-dove">
    <div class="wrap dove-griglia">
      <div>
        <h2 class="indirizzo" id="t-dove">Borgo Riccio 14,<br>Parma</h2>
        <p>A due passi da piazza Garibaldi. Si parcheggia in viale Toschi, poi sono tre minuti a piedi.</p>
        <p>Telefono 0521 000 000</p>
      </div>
      <table class="orari" aria-label="Orari di apertura"><tbody id="orari"></tbody></table>
    </div>
  </section>
""")

pagina("ordina.html", "Ordina per domenica",
  "Prenota la pasta fresca per la domenica al Pastificio Carta Blu: tortellini, anolini e tortelli da ritirare tra le 8 e le 12.",
  "ordina", """
  <div class="wrap testa-pagina">
    <h1>Ordina per domenica</h1>
    <p>Prenota entro venerdì alle 19, ritira domenica tra le 8 e le 12.</p>
  </div>

  <section class="ordina" aria-label="Modulo di prenotazione">
    <div class="wrap due-colonne">
      <form id="modulo" novalidate>
        <div class="campo">
          <label for="f-nome">Nome</label>
          <input id="f-nome" name="nome" autocomplete="name" required>
        </div>
        <div class="campo">
          <label for="f-tel">Telefono</label>
          <input id="f-tel" name="tel" type="tel" autocomplete="tel" required>
        </div>
        <div class="campo">
          <label for="f-formato">Formato</label>
          <select id="f-formato" name="formato"></select>
        </div>
        <div class="campo">
          <label for="f-peso">Quantità</label>
          <select id="f-peso" name="peso">
            <option value="0.5">500 g, per 4 persone</option>
            <option value="1" selected>1 kg, per 8 persone</option>
            <option value="1.5">1,5 kg, per 12 persone</option>
            <option value="2">2 kg, per 16 persone</option>
          </select>
        </div>
        <div class="campo largo">
          <label for="f-note">Note</label>
          <input id="f-note" name="note" placeholder="Per esempio: metà tortellini e metà anolini">
        </div>
        <p class="aiuto campo largo" id="stima" aria-live="polite"></p>
        <button class="bottone" type="submit">Prenota il ritiro</button>
        <p class="conferma" id="conferma" hidden aria-live="polite"></p>
      </form>

      <div>
        <h2 class="sottotitolo">Come funziona</h2>
        <ol class="passi-ordine">
          <li><div><h3>Prenoti entro venerdì alle 19</h3><p>Da qui o al telefono. Il sabato ci serve per tirare la sfoglia della domenica.</p></div></li>
          <li><div><h3>Ti chiamiamo solo se serve</h3><p>Se un formato finisce o manca qualcosa, ti telefoniamo il sabato mattina.</p></div></li>
          <li><div><h3>Ritiri domenica tra le 8 e le 12</h3><p>Paghi al banco. La pasta è incartata e pronta: non serve fare la fila.</p></div></li>
        </ol>
      </div>
    </div>
  </section>
""")
print("ok")

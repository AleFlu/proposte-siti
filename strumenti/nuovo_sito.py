"""Crea un nuovo sito partendo dallo standard (vedi standard/README.md).

Uso: python3 strumenti/nuovo_sito.py nome-attivita "Nome Attività"

Crea:
- docs/<nome>/01–04 dai modelli e la scheda raccolta-contenuti.md;
- strumenti/genera_<nome>.py dal modello di generatore;
- samples/<nome>/assets/ con stile.css (solo i token da compilare) e sito.js vuoto;
poi genera le prime pagine. Non sovrascrive niente che esista già.
"""
import pathlib
import re
import shutil
import subprocess
import sys

radice = pathlib.Path(__file__).resolve().parent.parent
if len(sys.argv) < 3 or not re.fullmatch(r"[a-z0-9-]+", sys.argv[1]):
    sys.exit('Uso: python3 strumenti/nuovo_sito.py nome-attivita "Nome Attività"  (nome: minuscole, cifre e trattini)')
sito, nome = sys.argv[1], sys.argv[2]
modulo = sito.replace("-", "_")

docs = radice / "docs" / sito
assets = radice / "samples" / sito / "assets"
generatore = radice / "strumenti" / f"genera_{modulo}.py"
for percorso in (docs, assets.parent, generatore):
    if percorso.exists():
        sys.exit(f"Esiste già: {percorso.relative_to(radice)}. Non sovrascrivo.")

docs.mkdir(parents=True)
for modello in sorted((radice / "standard" / "modelli").glob("*.md")):
    testo = modello.read_text()
    (docs / modello.name).write_text(re.sub(r"^# (\d\d) — ", rf"# {nome} — \1 ", testo, count=1, flags=re.M))
shutil.copy(radice / "standard" / "raccolta-contenuti.md", docs / "00-raccolta-contenuti.md")

assets.mkdir(parents=True)
(assets / "stile.css").write_text(f"""/* {nome} — identità del sito. Prima compilare docs/{sito}/03 e 04, poi i token qui.
   La base comune (accessibilità, telefono, stampa) è in base.css: non ripeterla qui. */
:root {{
  --ink: #1A1A1A;          /* [TOKEN] testo */
  --paper: #FFFFFF;        /* [TOKEN] fondo */
  --accent: #1A1A1A;       /* [TOKEN] una sola funzione: le azioni */
  --accent-ink: #FFFFFF;   /* testo sopra l'accento, contrasto ≥ 4.5:1 */
  --focus: #1A1A1A;        /* anello di focus, di brand e ben visibile */
  --muted: #555555;        /* testo secondario, contrasto ≥ 4.5:1 sul fondo */
  --line: #D0D0D0;         /* righe e bordi */

  --font-display: Georgia, serif;   /* [TOKEN] dopo strumenti/scarica_font.py */
  --font-text: system-ui, sans-serif;

  --gutter: clamp(1rem, 4vw, 3rem);
  --max: 72rem;
  --radius-control: 4px;
}}
""")
(assets / "sito.js").write_text(f"// {nome} — interazioni proprie del sito. Le comuni sono in base.js.\n")
(assets / "font.css").write_text("/* Generato da strumenti/scarica_font.py */\n")

generatore.write_text((radice / "standard" / "modello_generatore.py").read_text()
                      .replace("genera___SITO__", f"genera_{modulo}")
                      .replace("__SITO__", sito).replace("__NOME__", nome))
subprocess.run([sys.executable, str(generatore)], check=True)

print(f"""
Creato {nome}:
  docs/{sito}/                  documenti da compilare, in ordine (00 → 04)
  strumenti/genera_{modulo}.py   dati, pagine, SEO: si lavora qui
  samples/{sito}/               le pagine generate
Prossimi passi: standard/README.md, dal punto 3.""")

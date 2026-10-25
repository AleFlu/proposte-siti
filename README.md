# Proposte siti

Siti dimostrativi da mostrare ai clienti. Ogni cartella in `samples/` è un sito statico su più pagine, con stile e script comuni in `assets/`.

- Online: https://aleflu.github.io/proposte-siti/
- Ogni push su `main` che tocca `samples/` ripubblica il sito (vedi `.github/workflows/pages.yml`).
- Nuovo sito: `python3 strumenti/nuovo_sito.py <nome> "<Nome>"`, poi segui `standard/README.md`. Aggiungi il link in `samples/index.html`.

Regole di design e workflow: `CLAUDE.md`. Standard di partenza, checklist e lezioni imparate: `standard/`. Documenti di ogni sito: `docs/<nome>/`.

## Modificare i sample

Le pagine HTML si generano dagli script in `strumenti/` (menu, testata, piede, meta SEO):

```bash
python3 strumenti/genera_cupola.py
```

Modifica lo script e rigenera, invece di toccare a mano gli HTML.

Prima di pubblicare, il controllo automatico:

```bash
python3 strumenti/controlla.py samples --demo
```

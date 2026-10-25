# Checklist

`python3 strumenti/controlla.py samples/<nome> --demo` verifica da solo le voci segnate con ⚙.
Le altre si controllano a mano o con gli MCP (Playwright, Chrome DevTools).

## 1. Prima di disegnare
- [ ] `raccolta-contenuti.md` compilata, con testi e numeri veri (o verosimili per una proposta)
- [ ] Brief, architettura, direzione di design e token in `docs/<nome>/`, approvati
- [ ] Coppia di font scelta e motivata, scaricata con `scarica_font.py`
- [ ] Tre riferimenti fuori dal settore, un anti-riferimento

## 2. Anti-slop (critica di design su screenshot, prima di mostrare)
- [ ] Domanda esplicita: "cosa sembra generico o generato da un'AI?". Correggere ciò che emerge.
- [ ] Nessuna griglia di 3 card uguali con icona, nessun hero centrato con due bottoni e mockup
- [ ] Nessuna emoji come icona, nessuna icona di riempimento. Le icone sono disegnate per il sito.
- [ ] Numeri e fatti nel testo, in una frase, non in caselle con il numero gigante
- [ ] Almeno un layout per pagina che rompe la simmetria di proposito
- [ ] Un dettaglio memorabile e funzionale (il mosaico, i formati disegnati, lo stato dell'impasto)
- [ ] Motion con una regola sola, disattivata con `prefers-reduced-motion`
- [ ] Copy rivisto: niente "scopri", "esperienza unica", "eccellenza". Frasi che solo questa attività può dire.

## 3. Telefono (si progetta a 375 px)
- [ ] Screenshot a 320, 375, 768, 1280 px: niente scroll orizzontale
- [ ] Testo di lettura ≥ 16 px, righe sotto i 70 caratteri
- [ ] Aree toccabili ≥ 44 × 44 px
- [ ] Barra fissa in basso con le 1–2 azioni principali e `env(safe-area-inset-bottom)`
- [ ] Contenuti lunghi con indice che resta visibile
- [ ] Moduli: `type`, `inputmode`, `autocomplete` giusti ⚙ (in parte)
- [ ] Nessuna informazione raggiungibile solo con l'hover

## 4. Accessibilità (WCAG 2.2 AA)
- [ ] Lighthouse accessibilità 100 su ogni pagina
- [ ] Tutto raggiungibile e usabile da tastiera, focus visibile e di brand
- [ ] Schede (tab) con frecce, Home e Fine. Menu chiudibile con Esc.
- [ ] Contrasti verificati e annotati in `04-tokens.md`, niente opacità sul testo
- [ ] Un solo h1, nessun salto di livello ⚙
- [ ] `<main>`, link "Vai al contenuto", campi con `<label>`, pulsanti e link con testo ⚙
- [ ] Il nome accessibile contiene il testo visibile (niente `aria-label` che lo sostituisce)
- [ ] Reflow a 320 px e zoom al 200% senza perdita di contenuto

## 5. SEO
- [ ] Title 50–60 e description 140–160 caratteri, unici ⚙
- [ ] Canonical assoluto, Open Graph completo, `og:locale` it_IT ⚙
- [ ] Anteprima `anteprima.jpg` 1200 × 630, controllata intera (non tagliata)
- [ ] JSON-LD valido con il tipo più specifico ⚙. Validato con Schema Markup Validator (validator.schema.org,
      funziona anche con il `noindex`) e con il Rich Results Test di Google: sulle demo con `noindex` risponde
      "URL non disponibile per Google", quindi si usa la scheda "Codice" incollando il sorgente della pagina.
- [ ] Menu, prezzi, orari, indirizzo nell'HTML, non solo in JavaScript, mai in PDF o immagine
- [ ] Favicon SVG e icone PNG (iPhone 180, Android 192/512), manifest ⚙
- [ ] `sitemap.xml` generata ⚙. `robots.txt` alla radice del dominio, senza bloccare le pagine.
- [ ] Link interni senza errori, ancore esistenti ⚙
- [ ] HTML valido al validatore W3C (validator.w3.org/nu)

## 6. Prestazioni (Chrome DevTools, profilo telefono)
- [ ] LCP < 2,0 s, CLS < 0,05, INP < 200 ms, nessun errore in console
- [ ] Foto in WebP/AVIF, più misure con `srcset`, `width`/`height`, `loading="lazy"` sotto la piega,
      `fetchpriority="high"` sulla foto principale
- [ ] Font solo latin e latin-ext, `font-display: swap`

## 7. Legale (Italia / UE)
- [ ] Partita IVA nel piede di ogni pagina (società: anche sede, REA, capitale) ⚙
- [ ] Informativa privacy dedicata, nel piede e vicino a ogni modulo ⚙
- [ ] Nessuna risorsa di terze parti senza consenso: font, mappe, video, statistiche ⚙
- [ ] Mappa come link a Google Maps o immagine statica. Se incorporata, solo dopo un clic.
- [ ] Prezzi con "IVA inclusa" ⚙. Ristorazione: coperto e servizio dichiarati, allergeni per piatto con legenda.
- [ ] Nessuna casella di consenso obbligatoria per prenotare o ordinare (base giuridica art. 6.1.b)
- [ ] Senza cookie o con soli cookie tecnici non serve il banner. Statistiche solo senza cookie.
- [ ] Stampa: il menu o il listino si stampano puliti (`@media print` in `base.css`)

## 8. Proposta per il cliente
- [ ] `noindex` presente (attività di fantasia) ⚙
- [ ] Nota "proposta dimostrativa" nel piede
- [ ] Link aggiunto all'hub `samples/index.html`, con anteprima, palette e campioni dei caratteri
- [ ] Se c'è un artifact: rigenerato con `prepara_artifact.py`, ripubblicato, hash verificati

## 9. Messa online (quando il cliente accetta)
- [ ] Via `noindex` e nota demo. `controlla.py` senza `--demo` deve passare.
- [ ] Dati veri: ragione sociale, P.IVA, indirizzo, telefono identici a Google Business Profile
- [ ] Informativa privacy completata con titolare e fornitori, rivista da un consulente
- [ ] Modulo che invia davvero. Scegli uno di questi:
      - link WhatsApp (`https://wa.me/39…?text=…`): nessun dato passa dal sito;
      - servizio di moduli con server in UE e contratto di trattamento dati, citato nell'informativa;
      - gestionale di prenotazione già usato dal cliente, linkato e non incorporato.
- [ ] Dominio intestato al cliente, HTTPS attivo, pagina 404 personalizzata alla radice
- [ ] Hosting: GitHub Pages va bene. Per intestazioni di sicurezza, redirect o moduli integrati, Netlify o Cloudflare Pages.
- [ ] Google Search Console: proprietà verificata, sitemap inviata
- [ ] Google Business Profile collegato al sito
- [ ] Dichiarazione di accessibilità, se il cliente non è una microimpresa (European Accessibility Act)
- [ ] Consegna: chi aggiorna menu e orari, come, con che tempi. Credenziali intestate al cliente.

# V2 — teksten beheren

Start vanuit deze map: `python3 server.py`.
Open http://127.0.0.1:4174/v2/ en klik direct op een tekst om op die plek te typen. Bewerkmodus staat standaard aan. Wissel van avatar of klap een begrip open om de betreffende tekst te wijzigen. Klik op het lege deel van een begrippenrij om deze open te klappen; de tekst zelf is bewerkbaar. **Opslaan** (of Cmd/Ctrl+S) bewaart op schijf. De knop **Bewerken aan** schakelt naar een normaal klikbaar voorbeeld. Alleen onzichtbare labels, alt-teksten en metadata staan onder **Paginagegevens**. V1 blijft beschikbaar op http://127.0.0.1:4174/.

## Bewaren over versies heen

- `content/copy.json` is de vaste bron voor opgeslagen redactie, onafhankelijk van HTML/CSS.
- `content/backups/` bevat een herstelkopie van elke vorige opgeslagen versie.
- `dist/v2/defaults.json` bevat de oorspronkelijke v2-teksten en vaste veld-ID’s.
- De server combineert bestaande waarden met nieuwe velden. Opgeslagen waarden hebben altijd voorrang; onbekende oude ID’s blijven bewaard.
- Bij v3/v4: behoud dezelfde ID’s voor dezelfde tekst, blijf `/api/content` gebruiken en behoud de hele `content/`-map. Nieuwe velden krijgen nieuwe ID’s. **Nooit opnieuw nummeren of opgeslagen waarden vervangen door defaults.**
- Neem de `content/`-map mee in back-ups en toekomstige migraties. Met **Exporteer kopie** kan ook een losse JSON-kopie worden gedownload en later geïmporteerd.
- Alle teksten zijn gewone tekst: HTML wordt niet uitgevoerd. Links en opmaak blijven in de template; linklabels zijn bewerkbaar, bestemmingen niet.
- Twee vensters kunnen elkaar niet ongemerkt overschrijven: een verouderde opslag krijgt een conflictmelding. Exporteer eerst, herlaad daarna en neem wijzigingen opnieuw over.

## Grenzen en veiligheid

Dit is een lokale editor, geen publiek CMS. De server luistert uitsluitend op 127.0.0.1, controleert Host/Origin en gebruikt een sessietoken voor writes. Gebruik geen publieke proxy/tunnel om deze editor bloot te stellen. Voor online redactie zijn login en duurzame serveropslag nodig. Een statische hosting van alleen `dist/` toont de standaardteksten; daarbij werkt Opslaan niet. De editor meldt dit expliciet.

V1-bronbestanden blijven ongewijzigd. De v2-teksten zijn gebaseerd op de journalistieke voorstellen van 14 oktober 2026; dit is geen externe inhoudelijke goedkeuring.

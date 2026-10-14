# Wie speelt er met je kind? — V2

Website met inline teksteditor. Klik direct op tekst om te herschrijven en klik **Opslaan**. De repository is privé.

## Lokaal starten (ook voor Stefan)

1. Accepteer de GitHub-uitnodiging en clone deze repository.
2. Installeer Python 3 als dat nog ontbreekt. Geen extra Python-pakketten nodig.
3. Open een terminal in deze repository en voer `python3 server.py` uit (Windows: `py server.py`).
4. Open http://127.0.0.1:4174/v2/.

V1 staat op http://127.0.0.1:4174/. Bewaar de terminal tijdens het bewerken.

## Samenwerken

- Haal vóór het werken de laatste wijzigingen van GitHub op.
- Werk bij voorkeur op een eigen branch en deel wijzigingen via een pull request.
- **Opslaan** in de website schrijft naar `content/copy.json`, niet rechtstreeks naar GitHub. Commit en push dat bestand om tekstwijzigingen te delen.
- Bewerk niet gelijktijdig dezelfde tekst op afzonderlijke computers zonder afstemming. GitHub is hier versiebeheer, geen live gezamenlijke teksteditor. Los eventuele mergeconflicten bewust op; kies niet blind één compleet tekstbestand.
- De automatische herstelkopieën in `content/backups/` blijven lokaal. Maak daarvan zelf een back-up waar nodig.
- Behoud vaste tekst-ID’s en opgeslagen teksten bij toekomstige versies. Zie [EDITOR.md](EDITOR.md) en [AGENTS.md](AGENTS.md).

## Controle

`python3 -m unittest test_editor.py`

## Nog niet online

De editor werkt alleen lokaal. Deze push maakt geen publieke website en regelt geen online gezamenlijke opslag. Stel de lokale server niet publiek beschikbaar. Voor online bewerken zijn authenticatie en duurzame serveropslag nodig.

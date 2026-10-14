"""Local-only v2 editor. Run: python3 server.py (no dependencies)."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import json, os, secrets, hashlib, threading, tempfile
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent
DATA = ROOT / 'content' / 'copy.json'
LOCK = threading.Lock()
TOKEN = secrets.token_urlsafe(32)

def read():
    return json.loads(DATA.read_text()) if DATA.exists() else {'schema': 1, 'values': {}}

def revision(data):
    return hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT / 'dist'), **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def valid_host(self):
        return self.headers.get('Host') in {'127.0.0.1:4174', 'localhost:4174'}

    def reply(self, status, data):
        raw = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self):
        if not self.valid_host():
            return self.reply(403, {'error': 'Ongeldige host'})
        if self.path == '/api/content':
            try:
                with LOCK:
                    data = read()
                return self.reply(200, {**data, 'revision': revision(data), 'token': TOKEN})
            except (ValueError, OSError):
                return self.reply(500, {'error': 'Tekstbestand onleesbaar. Niet overschreven; controleer de herstelkopie.'})
        return super().do_GET()

    def do_POST(self):
        origin = self.headers.get('Origin')
        if not self.valid_host() or origin != 'http://' + self.headers.get('Host', '') or self.headers.get('X-Editor-Token') != TOKEN:
            return self.reply(403, {'error': 'Opslaan is alleen toegestaan vanuit deze lokale editor.'})
        if self.path != '/api/content':
            return self.reply(404, {'error': 'Niet gevonden'})
        try:
            length = int(self.headers.get('Content-Length', 0))
            if not 0 < length <= 2000000:
                return self.reply(413, {'error': 'Bestand te groot'})
            incoming = json.loads(self.rfile.read(length))
            values = incoming['values']
            if not isinstance(values, dict) or any(not isinstance(k, str) or not isinstance(v, str) or len(k) > 180 or len(v) > 20000 for k,v in values.items()):
                raise ValueError('Invalid values')
            with LOCK:
                previous = read()
                if incoming.get('revision') != revision(previous):
                    return self.reply(409, {'error': 'Er is in een ander venster opgeslagen. Exporteer je wijzigingen en herlaad eerst.'})
                DATA.parent.mkdir(exist_ok=True)
                stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
                backups = DATA.parent / 'backups'
                backups.mkdir(exist_ok=True)
                if DATA.exists():
                    (backups / (stamp + '.json')).write_bytes(DATA.read_bytes())
                updated = {'schema': 1, 'updatedAt': stamp, 'values': {**previous['values'], **values}}
                fd, path = tempfile.mkstemp(dir=DATA.parent, prefix='.copy-', suffix='.tmp')
                try:
                    with os.fdopen(fd, 'w') as f:
                        json.dump(updated, f, ensure_ascii=False, indent=2)
                        f.flush()
                        os.fsync(f.fileno())
                    os.replace(path, DATA)
                finally:
                    if os.path.exists(path): os.unlink(path)
                return self.reply(200, {'revision': revision(updated), 'updatedAt': stamp})
        except (KeyError, ValueError, TypeError):
            return self.reply(400, {'error': 'Ongeldig tekstbestand'})
        except OSError:
            return self.reply(500, {'error': 'Opslaan op schijf is mislukt. Exporteer een kopie en probeer opnieuw.'})

if __name__ == '__main__':
    print('V2 + editor: http://127.0.0.1:4174/v2/', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 4174), Handler).serve_forever()

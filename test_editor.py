import unittest, tempfile, threading, json, urllib.request, urllib.error
from pathlib import Path
import server

class StorageTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.original = server.DATA
        server.DATA = Path(self.temp.name) / 'content' / 'copy.json'
        self.http = server.ThreadingHTTPServer(('127.0.0.1', 0), server.Handler)
        threading.Thread(target=self.http.serve_forever, daemon=True).start()
        self.url = 'http://127.0.0.1:%d/api/content' % self.http.server_port

    def tearDown(self):
        self.http.shutdown(); self.http.server_close()
        server.DATA = self.original; self.temp.cleanup()

    def request(self, payload=None, origin='http://127.0.0.1:4174', token=server.TOKEN):
        headers={'Host':'127.0.0.1:4174','Origin':origin,'X-Editor-Token':token}
        req=urllib.request.Request(self.url, data=json.dumps(payload).encode() if payload is not None else None, headers=headers)
        try:
            with urllib.request.urlopen(req) as r: return r.status,json.load(r)
        except urllib.error.HTTPError as e: return e.code,json.load(e)

    def test_save_reload_conflict_and_backup(self):
        _, initial=self.request()
        status, first=self.request({'revision':initial['revision'],'values':{'hero.title':'Eigen titel'}})
        self.assertEqual(status,200)
        self.assertEqual(json.loads(server.DATA.read_text())['values']['hero.title'],'Eigen titel')
        _, reload=self.request()
        self.assertEqual(reload['values']['hero.title'],'Eigen titel')
        self.assertEqual(self.request({'revision':initial['revision'],'values':{}})[0],409)
        self.assertEqual(self.request({'revision':first['revision'],'values':{'new.field':'Nieuwe versie'}})[0],200)
        _, latest=self.request()
        self.assertEqual(latest['values']['hero.title'],'Eigen titel')
        self.assertEqual(len(list((server.DATA.parent/'backups').glob('*.json'))),1)

    def test_rejects_bad_writes(self):
        _, initial=self.request()
        payload={'revision':initial['revision'],'values':{'x':'value'}}
        self.assertEqual(self.request(payload,origin='https://example.com')[0],403)
        self.assertEqual(self.request(payload,token='wrong')[0],403)
        payload['values']={'x':{'html':'bad'}}
        self.assertEqual(self.request(payload)[0],400)
        self.assertFalse(server.DATA.exists())

if __name__=='__main__': unittest.main()

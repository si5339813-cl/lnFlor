from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
os.chdir(Path(__file__).parent)
print('Флора Ленских столбов: http://localhost:8000')
ThreadingHTTPServer(('0.0.0.0',8000),SimpleHTTPRequestHandler).serve_forever()

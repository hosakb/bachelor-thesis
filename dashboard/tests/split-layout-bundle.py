from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json

folder = Path(__file__).resolve().parents[1] / 'qa/layout-corrections'
parts = {'source-handoff': [], 'evidence-before': [], 'evidence-after': []}
with ZipFile(folder / 'pr3-local-corrections.zip') as source:
    for name in source.namelist():
        part = 'evidence-before' if '/layout-corrections/before/' in name else 'evidence-after' if '/layout-corrections/after/' in name else 'source-handoff'
        parts[part].append(name)
    for part, names in parts.items():
        target = folder / (part + '.zip')
        with ZipFile(target, 'w', ZIP_DEFLATED) as out:
            for name in names:
                out.writestr(name, source.read(name))
        with ZipFile(target) as out:
            assert out.testzip() is None
            assert not any(name.endswith('server.log') for name in out.namelist())
        assert target.stat().st_size <= 25 * 1024 * 1024
        print(json.dumps({'path': str(target), 'bytes': target.stat().st_size, 'entries': len(names)}))

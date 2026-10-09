"""Build an explicit publisher bundle; never include legacy QA or server logs."""
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[2]
evidence = root / 'dashboard/qa/layout-corrections'
source_files = [
    'dashboard/public/css/theme.css', 'dashboard/public/js/chart-theme.js',
    'dashboard/src/views/index.ejs', 'dashboard/src/views/dashboard/startup/index.ejs',
    'dashboard/tests/visual-capture.cjs', 'dashboard/tests/layout-geometry.cjs',
    'dashboard/tests/layout-matrix.cjs', 'dashboard/tests/layout-model-fixture.cjs',
    'dashboard/tests/summarize-layout.cjs', 'dashboard/tests/run-layout-verification.cjs',
    'dashboard/tests/build-layout-evidence.cjs', 'dashboard/tests/bundle-layout-evidence.py',
    'scraper/tests/tsconfig-contract.json',
]
summary = json.loads((evidence / 'summary.json').read_text())
assert summary['after']['cases'] == 159 and summary['after']['failing_cases'] == 0
files = [root / name for name in source_files]
files += [p for p in evidence.rglob('*') if p.is_file() and p.suffix != '.zip' and p.name != 'server.log']
archive = evidence / 'pr3-local-corrections.zip'
with ZipFile(archive, 'w', ZIP_DEFLATED) as z:
    for p in files:
        z.write(p, p.relative_to(root))
with ZipFile(archive) as z:
    assert z.testzip() is None
    assert not any(p.endswith('server.log') for p in z.namelist())
    assert sum(p.startswith('dashboard/qa/layout-corrections/after/') and p.endswith('.png') for p in z.namelist()) == 159
print(json.dumps({'archive':str(archive),'bytes':archive.stat().st_size,'entries':len(files),'source_files':source_files},indent=2))

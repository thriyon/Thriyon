import json
from pathlib import Path

try:
    from graphify.cache import check_semantic_cache
    detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text())
    all_files = [f for files in detect['files'].values() for f in files]
    cached_nodes, cached_edges, cached_hyperedges, uncached = check_semantic_cache(all_files)
    if cached_nodes or cached_edges or cached_hyperedges:
        Path('graphify-out/.graphify_cached.json').write_text(json.dumps({'nodes': cached_nodes, 'edges': cached_edges, 'hyperedges': cached_hyperedges}))
    Path('graphify-out/.graphify_uncached.txt').write_text('\n'.join(uncached))
    print(f'Cache: {len(all_files)-len(uncached)} files hit, {len(uncached)} files need extraction')
    for f in uncached:
        print(f'  UNCACHED: {f}')
except Exception as e:
    # fallback: treat all non-code files as uncached
    detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text())
    non_code = []
    for ftype, files in detect['files'].items():
        if ftype != 'code':
            non_code.extend(files)
    Path('graphify-out/.graphify_uncached.txt').write_text('\n'.join(non_code))
    print(f'Cache check failed ({e}), treating {len(non_code)} non-code files as uncached')

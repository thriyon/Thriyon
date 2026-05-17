import json
from pathlib import Path

# Merge cached + new semantic results
cached = json.loads(Path('graphify-out/.graphify_cached.json').read_text()) if Path('graphify-out/.graphify_cached.json').exists() else {'nodes':[],'edges':[],'hyperedges':[]}
new_sem = json.loads(Path('graphify-out/.graphify_semantic_new.json').read_text()) if Path('graphify-out/.graphify_semantic_new.json').exists() else {'nodes':[],'edges':[],'hyperedges':[]}

all_nodes = cached.get('nodes',[]) + new_sem.get('nodes',[])
all_edges = cached.get('edges',[]) + new_sem.get('edges',[])
all_hyperedges = cached.get('hyperedges',[]) + new_sem.get('hyperedges',[])

seen = set()
deduped = []
for n in all_nodes:
    if n['id'] not in seen:
        seen.add(n['id'])
        deduped.append(n)

merged = {'nodes': deduped, 'edges': all_edges, 'hyperedges': all_hyperedges}
Path('graphify-out/.graphify_semantic.json').write_text(json.dumps(merged, indent=2))
print(f'Semantic: {len(deduped)} nodes, {len(all_edges)} edges, {len(all_hyperedges)} hyperedges')

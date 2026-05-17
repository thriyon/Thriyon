if __name__ == '__main__':
    import json
    from pathlib import Path
    from graphify.graph import build_graph, detect_communities, merge_graphs
    from graphify.visualize import render_html
    from graphify.report import generate_report

    ast = json.loads(Path('graphify-out/.graphify_ast.json').read_text())
    sem = json.loads(Path('graphify-out/.graphify_semantic.json').read_text())

    print(f"AST:      {len(ast['nodes'])} nodes, {len(ast['edges'])} edges")
    print(f"Semantic: {len(sem['nodes'])} nodes, {len(sem['edges'])} edges, {len(sem.get('hyperedges',[]))} hyperedges")

    # Merge
    merged = merge_graphs(ast, sem)
    print(f"Merged:   {len(merged['nodes'])} nodes, {len(merged['edges'])} edges")

    # Build networkx graph + detect communities
    G = build_graph(merged)
    G = detect_communities(G)
    print(f"Graph built: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

    # Save graph JSON
    from graphify.io import save_graph_json
    save_graph_json(G, Path('graphify-out/graph.json'))
    print("Saved: graphify-out/graph.json")

    # Generate HTML visualization
    html_path = Path('graphify-out/graph.html')
    render_html(G, html_path)
    print(f"Saved: {html_path}")

    # Generate report
    report = generate_report(G, merged)
    Path('graphify-out/GRAPH_REPORT.md').write_text(report)
    print("Saved: graphify-out/GRAPH_REPORT.md")

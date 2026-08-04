#!/usr/bin/env python3
"""Generate the decorative homophilic-network SVG used in the hero section.

Run:  python3 tools/make_hero_svg.py > assets/img/hero-network.svg
Then paste the <svg> block into index.html (or reference the file).
Deterministic: same seed -> same figure.
"""
import networkx as nx
import numpy as np

SEED = 20260804
N = 46
MINORITY = 0.3
H = 0.85          # in-group attachment preference
M0 = 2            # edges per new node

rng = np.random.default_rng(SEED)


def homophilic_ba(n, minority, h, m):
    """Barabasi-Albert growth with group-homophilic preferential attachment."""
    groups = (rng.random(n) < minority).astype(int)
    G = nx.Graph()
    for i in range(m):
        G.add_node(i, g=int(groups[i]))
    for i in range(m):
        for j in range(i + 1, m):
            G.add_edge(i, j)

    for v in range(m, n):
        G.add_node(v, g=int(groups[v]))
        targets = np.array(list(G.nodes()))
        targets = targets[targets != v]
        deg = np.array([G.degree(t) + 1 for t in targets], dtype=float)
        same = np.array([G.nodes[t]["g"] == groups[v] for t in targets], dtype=float)
        w = deg * np.where(same > 0, h, 1 - h)
        w = w / w.sum()
        chosen = rng.choice(targets, size=min(m, len(targets)), replace=False, p=w)
        for t in chosen:
            G.add_edge(v, int(t))
    return G, groups


G, groups = homophilic_ba(N, MINORITY, H, M0)
pos = nx.spring_layout(G, seed=SEED, k=0.42, iterations=400)

xy = np.array([pos[n] for n in G.nodes()])
xy -= xy.min(axis=0)
xy /= xy.max()
W, Hh, PAD = 520.0, 420.0, 26.0
xy[:, 0] = xy[:, 0] * (W - 2 * PAD) + PAD
xy[:, 1] = xy[:, 1] * (Hh - 2 * PAD) + PAD
P = {n: xy[i] for i, n in enumerate(G.nodes())}

deg = dict(G.degree())
dmax = max(deg.values())

lines = [
    f'<svg class="netfig" viewBox="0 0 {int(W)} {int(Hh)}" '
    'xmlns="http://www.w3.org/2000/svg" role="img" '
    'aria-label="A network in which two groups attach preferentially within group">',
    "  <g>",
]
for u, v in G.edges():
    x1, y1 = P[u]
    x2, y2 = P[v]
    lines.append(f'    <line class="edge" x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}"/>')
lines.append("  </g>")
lines.append("  <g>")
for n in sorted(G.nodes(), key=lambda n: deg[n]):
    x, y = P[n]
    r = 2.6 + 5.4 * (deg[n] / dmax) ** 0.75
    cls = "node-b" if G.nodes[n]["g"] == 1 else "node-a"
    if deg[n] >= 0.55 * dmax:
        lines.append(f'    <circle class="halo" cx="{x:.1f}" cy="{y:.1f}" r="{r*2.3:.1f}"/>')
    lines.append(f'    <circle class="{cls}" cx="{x:.1f}" cy="{y:.1f}" r="{r:.2f}"/>')
lines.append("  </g>")
lines.append("</svg>")

print("\n".join(lines))

#!/usr/bin/env python3
"""One-off migration: writes data/publications.bib from the old site's content.

Kept in the repo only as a record of how the initial .bib was produced.
Day-to-day you just edit data/publications.bib by hand.
"""
from pathlib import Path

E = []


def add(key, etype, **f):
    E.append((key, etype, f))


# ---------------------------------------------------------------- 2025
add("lee2025layers", "article",
    author="Lee, Eun and Stanoi, Ovidia and He, Xie and Kang, Yoona and Jovanova, Mia and "
           "McGowan, Amanda L. and Lydon-Staley, David M. and Bassett, Dani S. and "
           "Ochsner, Kevin N. and Boyd, Zachary M. and Falk, Emily B. and Mucha, Peter J.",
    title="Functional and structural clustering of social relationship layers among college "
          "students for link prediction with applications to perceived drinking networks",
    journal="Scientific Reports", volume="15", pages="41772", year="2025",
    doi="10.1038/s41598-025-24049-w",
    keywords="Perception Bias, Algorithm, Social Systems",
    selected="true")

add("park2025healthcare", "article",
    author="Park, Jiyu and Jeon, Byeongyun and Lee, Eun",
    title="Regional disparities in the distribution of public and private healthcare "
          "facilities in {South} {Korea}",
    journal="PLOS ONE", volume="20", number="9", pages="e0330090", year="2025",
    doi="10.1371/journal.pone.0330090",
    keywords="Health Information, Social Systems",
    selected="true")

# ---------------------------------------------------------------- 2024
add("lee2024climate", "article",
    author="Lee, Daekyung and Park, Jong-Min and Kim, Heetae and Lee, Eun",
    title="Network science approaches for analyzing regional interactions of sea surface temperature",
    journal="Journal of the Geological Society of Korea", volume="60", number="4",
    year="2024",
    doi="10.14770/jgsk.2024.044",
    keywords="Climate System, Network Science")

add("lee2024internet", "article",
    author="Lee, Eun and Kim, Heejun and Esener, Yildiz and McCall, Terika",
    title="Internet-Based Social Connections of Black American College Students in "
          "Pre--{COVID}-19 and Peri--{COVID}-19 Pandemic Periods: Network Analysis",
    journal="Journal of Medical Internet Research", volume="26", pages="e55531", year="2024",
    doi="10.2196/55531",
    keywords="Health Information, Social Systems")

add("he2024linkpred", "article",
    author="He, Xie and Ghasemian, Amir and Lee, Eun and Schwarze, Alice C. and "
           "Clauset, Aaron and Mucha, Peter J.",
    title="Link prediction accuracy on real-world networks under non-uniform missing-edge patterns",
    journal="PLOS ONE", volume="19", number="7", pages="e0306883", year="2024",
    doi="10.1371/journal.pone.0306883",
    keywords="Algorithm, Network Science")

add("lee2024coleman", "article",
    author="Lee, Eun and Kang, Jiyoung",
    title="A comparison between the {Coleman} homophily index and {BA}-homophily metric "
          "with a random network of unequal group sizes",
    journal="Journal of the Korean Physical Society", volume="84", number="6",
    pages="470--478", year="2024",
    doi="10.1007/s40042-024-01013-x",
    keywords="Perception Bias, Measurement",
    selected="true")

add("he2024stacking", "article",
    author="He, Xie and Ghasemian, Amir and Lee, Eun and Clauset, Aaron and Mucha, Peter J.",
    title="Sequential stacking link prediction algorithms for temporal networks",
    journal="Nature Communications", volume="15", pages="1364", year="2024",
    doi="10.1038/s41467-024-45598-0",
    keywords="Algorithm, Network Science",
    selected="true")

# ---------------------------------------------------------------- 2023
add("kim2023entropy", "article",
    author="Kim, Donghyeok and Lee, Eun and Kang, Jiyoung",
    title="A comprehensive evaluation of entropy-based directionality estimation method",
    journal="Journal of the Korean Physical Society", volume="83", number="6",
    pages="499--510", year="2023",
    doi="10.1007/s40042-023-00903-w",
    keywords="Brain Network, Algorithm")

add("herrera2023ballet", "article",
    author="Herrera-Guzm{\\'a}n, Yessica and Lee, Eun and Kim, Heetae",
    title="Structural gender imbalances in ballet collaboration networks",
    journal="EPJ Data Science", volume="12", number="1", pages="53", year="2023",
    doi="10.1140/epjds/s13688-023-00428-z",
    keywords="Social Systems, Inequality",
    selected="true")

add("galesic2023adaptation", "article",
    author="Galesic, Mirta and Barkoczi, Daniel and Berdahl, Andrew M. and Biro, Dora and "
           "Carbone, Giuseppe and Giannoccaro, Ilaria and Goldstone, Robert L. and "
           "Gonzalez, Cleotilde and Kandler, Anne and Kao, Albert B. and Kendal, Rachel and "
           "Kline, Michelle and Lee, Eun and Massari, Giovanni Francesco and Mesoudi, Alex and "
           "Olsson, Henrik and Pescetelli, Niccolo and Sloman, Sabina J. and "
           "Smaldino, Paul E. and Stein, Daniel L.",
    title="Beyond collective intelligence: Collective adaptation",
    journal="Journal of the Royal Society Interface", volume="20", number="200",
    pages="20220736", year="2023",
    doi="10.1098/rsif.2022.0736",
    keywords="Perception Bias, Social Systems")

# ---------------------------------------------------------------- 2022
add("jo2022copula", "article",
    author="Jo, Hang-Hyun and Lee, Eun and Eom, Young-Ho",
    title="Copula-based analysis of the generalized friendship paradox in clustered networks",
    journal="Chaos: An Interdisciplinary Journal of Nonlinear Science",
    volume="32", number="12", pages="123139", year="2022",
    doi="10.1063/5.0122351",
    keywords="Friendship Paradox, Network Science")

# ---------------------------------------------------------------- 2021
add("lee2021entropy", "article",
    author="Lee, Mi Jin and Lee, Eun and Lee, Byunghwee and Jeong, Hawoong and "
           "Lee, Deok-Sun and Lee, Sang Hoon",
    title="Uncovering hidden dependency in weighted networks via information entropy",
    journal="Physical Review Research", volume="3", number="4", pages="043136", year="2021",
    doi="10.1103/PhysRevResearch.3.043136",
    keywords="Network Science")

add("jo2021analytical", "article",
    author="Jo, Hang-Hyun and Lee, Eun and Eom, Young-Ho",
    title="Analytical approach to the generalized friendship paradox in networks with "
          "correlated attributes",
    journal="Physical Review E", volume="104", number="5", pages="054301", year="2021",
    doi="10.1103/PhysRevE.104.054301",
    arxiv="2107.05838",
    keywords="Friendship Paradox, Network Science")

add("lee2021faculty", "article",
    author="Lee, Eun and Clauset, Aaron and Larremore, Daniel B.",
    title="The dynamics of faculty hiring networks",
    journal="EPJ Data Science", volume="10", pages="48", year="2021",
    doi="10.1140/epjds/s13688-021-00303-9",
    keywords="Science of Science, Inequality",
    selected="true")

add("mccall2021tweets", "inproceedings",
    author="McCall, Terika and Kim, Heejun and Lee, Eun and Lakdawala, Adnan and "
           "Bolton III, Clinton S.",
    title="Content and Social Network Analyses of Depression-related Tweets of "
          "African American College Students",
    booktitle="Proceedings of the 54th Hawaii International Conference on System Sciences",
    pages="2597", year="2021",
    url="https://scholarspace.manoa.hawaii.edu/items/950a8660-0e77-4d58-be17-3b6bd2257ffc",
    keywords="Health Information, Social Systems")

# ---------------------------------------------------------------- 2019
add("lee2019concurrency", "article",
    author="Lee, Eun and Emmons, Scott and Gibson, Ryan and Moody, James and Mucha, Peter J.",
    title="Concurrency and reachability in treelike temporal networks",
    journal="Physical Review E", volume="100", number="6", pages="062305", year="2019",
    doi="10.1103/PhysRevE.100.062305",
    keywords="Network Science")

add("lee2019homophily", "article",
    author="Lee, Eun and Karimi, Fariba and Wagner, Claudia and Jo, Hang-Hyun and "
           "Strohmaier, Markus and Galesic, Mirta",
    title="Homophily and minority-group size explain perception biases in social networks",
    journal="Nature Human Behaviour", volume="3", number="10", pages="1078--1087", year="2019",
    doi="10.1038/s41562-019-0677-4",
    keywords="Perception Bias, Network Science",
    selected="true")

add("lee2019perception", "article",
    author="Lee, Eun and Lee, Sungmin and Eom, Young-Ho and Holme, Petter and Jo, Hang-Hyun",
    title="Impact of perception models on friendship paradox and opinion formation",
    journal="Physical Review E", volume="99", number="5", pages="052302", year="2019",
    doi="10.1103/PhysRevE.99.052302",
    keywords="Friendship Paradox, Perception Bias")

add("lee2023chapter", "incollection",
    author="Lee, Eun and Moody, James and Mucha, Peter J.",
    title="Exploring concurrency and reachability in the presence of high temporal resolution",
    booktitle="Temporal Network Theory", publisher="Springer",
    pages="131--147", year="2023",
    doi="10.1007/978-3-031-30399-9_7",
    keywords="Network Science")

# ---------------------------------------------------------------- 2017 and earlier
add("lee2017dissent", "article",
    author="Lee, Eun and Holme, Petter and Lee, Sang Hoon",
    title="Modeling the dynamics of dissent",
    journal="Physica A: Statistical Mechanics and its Applications",
    volume="486", pages="262--272", year="2017",
    doi="10.1016/j.physa.2017.05.047",
    keywords="Network Science, Social Systems")

add("lee2017contagion", "article",
    author="Lee, Eun and Holme, Petter",
    title="Social contagion with degree-dependent thresholds",
    journal="Physical Review E", volume="96", number="1", pages="012315", year="2017",
    doi="10.1103/PhysRevE.96.012315",
    keywords="Network Science")

add("lee2016mobility", "article",
    author="Lee, Eun and Holme, Petter",
    title="Impact of mobility structure on optimization of small-world networks of mobile agents",
    journal="The European Physical Journal B", volume="89", number="6", pages="143", year="2016",
    doi="10.1140/epjb/e2016-60711-9",
    keywords="Network Science")

add("lee2013photosystem", "article",
    author="Lee, Eun and Holme, Petter",
    title="Network characteristics of individual pigments in cyanobacterial photosystem {II} "
          "core complexes",
    journal="Journal of the Korean Physical Society", volume="63", number="11",
    pages="2255--2261", year="2013",
    doi="10.3938/jkps.63.2255",
    keywords="Network Science")


HEADER = """% =====================================================================
%  publications.bib — the ONLY file you edit to update the publication list.
%  Everything on publications.html is generated from here at page load.
%
%  Standard fields: author, title, journal / booktitle, year, volume,
%                   number, pages, doi, url
%
%  Extra fields this site understands (all optional):
%    keywords = {Perception Bias, Network Science}  -> topic chips + #tags
%    selected = {true}          -> "Selected" badge, pinned on the home page
%    arxiv    = {2501.01234}    -> arXiv button
%    pdf / code / data / slides / video / press     -> one button each
%    award    = {Best Paper}    -> highlighted badge
%    abstract = {...}           -> expandable abstract
%    note     = {In preparation}
%
%  Entry type decides the Type filter:
%    @article -> journal        @inproceedings -> conference
%    @incollection -> chapter   @misc / @unpublished -> preprint
% =====================================================================

"""

ORDER = ["author", "title", "journal", "booktitle", "publisher", "volume",
         "number", "pages", "year", "doi", "url", "arxiv", "pdf", "code",
         "data", "keywords", "selected", "award", "note", "abstract"]


def fmt(key, etype, f):
    keys = [k for k in ORDER if k in f] + [k for k in f if k not in ORDER]
    w = max(len(k) for k in keys)
    lines = [f"@{etype}{{{key},"]
    for k in keys:
        lines.append(f"  {k.ljust(w)} = {{{f[k]}}},")
    lines[-1] = lines[-1][:-1]
    lines.append("}")
    return "\n".join(lines)


out = HEADER + "\n\n".join(fmt(*e) for e in E) + "\n"
p = Path(__file__).resolve().parent.parent / "data" / "publications.bib"
p.write_text(out, encoding="utf-8")
print(f"wrote {len(E)} entries -> {p}")

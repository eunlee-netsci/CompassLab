/* ============================================================
   bibtex.js — dependency-free BibTeX parser
   Exposes window.BibTeX = { parse, formatAuthors, toRaw }
   ------------------------------------------------------------
   Handles: @string macros, # concatenation, {braced} / "quoted" /
   bare values, nested braces, `and`-separated author lists in both
   "Last, First" and "First Last" order, and the common LaTeX
   escapes that show up in exported .bib files.
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------- LaTeX → Unicode ---------- */
  var ACCENTS = {
    "`": { a: "à", e: "è", i: "ì", o: "ò", u: "ù", A: "À", E: "È", I: "Ì", O: "Ò", U: "Ù", n: "ǹ" },
    "'": { a: "á", e: "é", i: "í", o: "ó", u: "ú", y: "ý", c: "ć", n: "ń", s: "ś", z: "ź", A: "Á", E: "É", I: "Í", O: "Ó", U: "Ú", C: "Ć", N: "Ń", S: "Ś", Z: "Ź" },
    '"': { a: "ä", e: "ë", i: "ï", o: "ö", u: "ü", y: "ÿ", A: "Ä", E: "Ë", I: "Ï", O: "Ö", U: "Ü" },
    "^": { a: "â", e: "ê", i: "î", o: "ô", u: "û", A: "Â", E: "Ê", I: "Î", O: "Ô", U: "Û" },
    "~": { a: "ã", n: "ñ", o: "õ", A: "Ã", N: "Ñ", O: "Õ" },
    c: { c: "ç", s: "ş", C: "Ç", S: "Ş", e: "ę", a: "ą" },
    v: { c: "č", s: "š", z: "ž", r: "ř", e: "ě", n: "ň", d: "ď", t: "ť", C: "Č", S: "Š", Z: "Ž", R: "Ř", E: "Ě", N: "Ň" },
    ".": { z: "ż", e: "ė", c: "ċ", g: "ġ", Z: "Ż", E: "Ė" },
    "=": { a: "ā", e: "ē", i: "ī", o: "ō", u: "ū", A: "Ā", E: "Ē", I: "Ī", O: "Ō", U: "Ū" },
    u: { a: "ă", e: "ĕ", g: "ğ", u: "ŭ", A: "Ă", G: "Ğ" },
    H: { o: "ő", u: "ű", O: "Ő", U: "Ű" },
    k: { a: "ą", e: "ę", A: "Ą", E: "Ę" },
    r: { a: "å", u: "ů", A: "Å", U: "Ů" }
  };

  var SPECIALS = {
    "\\ss": "ß", "\\o": "ø", "\\O": "Ø", "\\ae": "æ", "\\AE": "Æ",
    "\\oe": "œ", "\\OE": "Œ", "\\aa": "å", "\\AA": "Å", "\\l": "ł",
    "\\L": "Ł", "\\i": "ı", "\\j": "ȷ", "\\&": "&", "\\%": "%",
    "\\$": "$", "\\#": "#", "\\_": "_", "\\{": "{", "\\}": "}",
    "\\textendash": "–", "\\textemdash": "—", "\\textquotesingle": "'",
    "\\textasciitilde": "~", "\\ldots": "…", "\\dots": "…",
    "\\copyright": "©", "\\degree": "°", "\\textdegree": "°"
  };

  function deLatex(s) {
    if (!s) return "";
    var out = s;

    // \'{e}  \"{o}  \v{s}  ...
    out = out.replace(/\\([`'"^~=.]|[cvuHkr])\s*\{\\?([A-Za-z])\}/g, function (m, acc, ch) {
      var t = ACCENTS[acc];
      return (t && t[ch]) || ch;
    });
    // {\'e}  {\"o}
    out = out.replace(/\{\\([`'"^~=.]|[cvuHkr])\s*([A-Za-z])\}/g, function (m, acc, ch) {
      var t = ACCENTS[acc];
      return (t && t[ch]) || ch;
    });
    // \'e  \"o (no braces)
    out = out.replace(/\\([`'"^~=.])\s*([A-Za-z])/g, function (m, acc, ch) {
      var t = ACCENTS[acc];
      return (t && t[ch]) || ch;
    });

    // longest control sequences first, else "\o" would eat "\oe" / "\l" would eat "\ldots"
    Object.keys(SPECIALS)
      .sort(function (a, b) { return b.length - a.length; })
      .forEach(function (k) {
        out = out.split("{" + k + "}").join(SPECIALS[k]);
        out = out.split(k + "{}").join(SPECIALS[k]);
        out = out.split(k + " ").join(SPECIALS[k]);
        out = out.split(k).join(SPECIALS[k]);
      });

    out = out.replace(/\$([^$]*)\$/g, "$1");        // strip inline math delimiters
    out = out.replace(/\\text(?:it|bf|rm|sc)\s*/g, "");
    out = out.replace(/\\emph\s*/g, "");
    out = out.replace(/\{|\}/g, "");                 // drop remaining case-protection braces
    out = out.replace(/---/g, "—").replace(/--/g, "–");
    out = out.replace(/~/g, " ");
    out = out.replace(/\\\\/g, " ").replace(/\s+/g, " ");
    return out.trim();
  }

  /* ---------- Tokenizer / parser ---------- */

  /* Remove "%" comments, but only outside entries (depth 0) so that
     percent signs inside field values and URLs survive untouched. */
  function stripComments(src) {
    var out = "", depth = 0, i = 0, n = src.length;
    while (i < n) {
      var c = src[i];
      if (c === "\\") { out += c + (src[i + 1] || ""); i += 2; continue; }
      if (c === "%" && depth === 0) {
        while (i < n && src[i] !== "\n") i++;
        continue;
      }
      if (c === "{") depth++;
      else if (c === "}") depth = depth > 0 ? depth - 1 : 0;
      out += c; i++;
    }
    return out;
  }

  function parse(rawText) {
    var text = stripComments(String(rawText || ""));
    var entries = [];
    var macros = {
      jan: "January", feb: "February", mar: "March", apr: "April",
      may: "May", jun: "June", jul: "July", aug: "August",
      sep: "September", oct: "October", nov: "November", dec: "December"
    };
    var i = 0;
    var n = text.length;

    function skipWs() { while (i < n && /\s/.test(text[i])) i++; }

    function readBalanced(open, close) {
      // assumes text[i] === open
      var depth = 0, start = i;
      while (i < n) {
        var c = text[i];
        if (c === "\\") { i += 2; continue; }
        if (c === open) depth++;
        else if (c === close) { depth--; if (depth === 0) { i++; return text.slice(start + 1, i - 1); } }
        i++;
      }
      return text.slice(start + 1);
    }

    function readValue() {
      var parts = [];
      for (;;) {
        skipWs();
        if (i >= n) break;
        var c = text[i];
        if (c === "{") {
          parts.push(readBalanced("{", "}"));
        } else if (c === '"') {
          var depth = 0, start = i;
          i++;
          while (i < n) {
            var d = text[i];
            if (d === "\\") { i += 2; continue; }
            if (d === "{") depth++;
            else if (d === "}") depth--;
            else if (d === '"' && depth === 0) { i++; break; }
            i++;
          }
          parts.push(text.slice(start + 1, i - 1));
        } else {
          var s = i;
          while (i < n && !/[,}\s#]/.test(text[i])) i++;
          var bare = text.slice(s, i);
          if (!bare) { i++; break; }
          parts.push(Object.prototype.hasOwnProperty.call(macros, bare.toLowerCase())
            ? macros[bare.toLowerCase()] : bare);
        }
        skipWs();
        if (text[i] === "#") { i++; continue; }
        break;
      }
      return parts.join("");
    }

    while (i < n) {
      var at = text.indexOf("@", i);
      if (at === -1) break;
      i = at + 1;
      skipWs();
      var ts = i;
      while (i < n && /[A-Za-z]/.test(text[i])) i++;
      var type = text.slice(ts, i).toLowerCase();
      skipWs();
      if (text[i] !== "{" && text[i] !== "(") continue;

      if (type === "comment") { readBalanced(text[i], text[i] === "{" ? "}" : ")"); continue; }

      var bodyStart = i;
      var body = readBalanced(text[i], text[i] === "{" ? "}" : ")");
      var rawEntry = text.slice(at, i);

      if (type === "string") {
        var m = /^\s*([^=\s]+)\s*=\s*(.*)$/s.exec(body);
        if (m) {
          var sub = new Parser(m[2]);
          macros[m[1].toLowerCase()] = sub.value();
        }
        continue;
      }
      if (type === "preamble") continue;

      // --- parse the entry body with a sub-cursor ---
      var save = { i: i, n: n, text: text };
      var e = parseBody(body, type, rawEntry, macros);
      if (e) entries.push(e);
      i = save.i; n = save.n; text = save.text;
      void bodyStart;
    }

    return entries;

    // small helper object so @string can reuse readValue
    function Parser(src) {
      this.value = function () {
        var savedText = text, savedI = i, savedN = n;
        text = src; i = 0; n = src.length;
        var v = readValue();
        text = savedText; i = savedI; n = savedN;
        return v;
      };
    }

    function parseBody(body, type, rawEntry, macroTable) {
      var savedText = text, savedI = i, savedN = n;
      text = body; i = 0; n = body.length;

      skipWs();
      var ks = i;
      while (i < n && text[i] !== "," ) i++;
      var key = text.slice(ks, i).trim();
      var fields = {};

      while (i < n) {
        if (text[i] === ",") i++;
        skipWs();
        if (i >= n) break;
        var fs = i;
        while (i < n && !/[=\s,]/.test(text[i])) i++;
        var name = text.slice(fs, i).trim().toLowerCase();
        skipWs();
        if (text[i] !== "=") { if (text[i] === ",") continue; else break; }
        i++;
        var val = readValue();
        if (name) fields[name] = val;
      }

      text = savedText; i = savedI; n = savedN;
      void macroTable;
      if (!key && !Object.keys(fields).length) return null;

      return buildEntry(type, key, fields, rawEntry);
    }
  }

  /* ---------- Entry normalisation ---------- */
  var TYPE_LABEL = {
    article: "journal",
    inproceedings: "conference",
    conference: "conference",
    incollection: "chapter",
    inbook: "chapter",
    book: "book",
    phdthesis: "thesis",
    mastersthesis: "thesis",
    techreport: "preprint",
    unpublished: "preprint",
    misc: "preprint"
  };

  function buildEntry(type, key, f, raw) {
    var year = parseInt((f.year || "").replace(/\D/g, ""), 10);
    var venue = f.journal || f.booktitle || f.publisher || f.school ||
      f.institution || f.howpublished || f.series || "";
    var kind = TYPE_LABEL[type] || "other";

    // arXiv-only records exported as @article often carry journal = {arXiv...}
    var venueLc = venue.toLowerCase();
    if (/arxiv|preprint|biorxiv|socarxiv|ssrn|osf/.test(venueLc)) kind = "preprint";
    if (f.status && /preprint|submitted|under review/i.test(f.status)) kind = "preprint";

    var arxivId = f.arxiv || f.eprint || "";
    if (!arxivId && /arxiv/i.test(venue)) {
      var am = /(\d{4}\.\d{4,5})/.exec(venue);
      if (am) arxivId = am[1];
    }

    var doi = (f.doi || "").replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
    var tags = (f.keywords || f.tags || "")
      .split(/[;,]/).map(function (t) { return t.trim(); }).filter(Boolean);

    return {
      key: key,
      type: type,
      kind: kind,
      title: deLatex(f.title || "(untitled)"),
      authors: splitAuthors(f.author || f.editor || ""),
      authorRaw: deLatex(f.author || ""),
      year: isNaN(year) ? null : year,
      month: f.month || "",
      venue: deLatex(venue),
      volume: f.volume || "",
      number: f.number || "",
      pages: (f.pages || "").replace(/--/g, "–"),
      doi: doi,
      url: f.url || (doi ? "https://doi.org/" + doi : ""),
      pdf: f.pdf || "",
      code: f.code || f.github || "",
      data: f.data || f.dataset || "",
      slides: f.slides || "",
      video: f.video || f.talk || "",
      press: f.press || f.media || "",
      arxiv: arxivId,
      abstract: deLatex(f.abstract || ""),
      note: deLatex(f.note || ""),
      award: deLatex(f.award || f.honor || ""),
      selected: /^(true|yes|1)$/i.test(f.selected || ""),
      image: f.image || "",
      tags: tags,
      raw: raw.trim(),
      fields: f
    };
  }

  function splitAuthors(s) {
    if (!s) return [];
    s = s.replace(/\s+/g, " ").trim();      // normalise line-wrapped author lists
    var parts = [], depth = 0, buf = "";
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === "{") depth++;
      if (c === "}") depth--;
      if (depth === 0 && /\s/.test(c) && /\sand\s/i.test(s.slice(i, i + 5))) {
        parts.push(buf); buf = ""; i += 4; continue;
      }
      buf += c;
    }
    if (buf.trim()) parts.push(buf);

    return parts.map(function (p) {
      var raw = p.trim().replace(/,$/, "");
      var last, first;
      if (raw.indexOf(",") > -1) {
        var seg = raw.split(",");
        last = seg[0].trim();
        first = seg.slice(1).join(",").trim();
      } else {
        var w = raw.split(/\s+/);
        last = w.length > 1 ? w[w.length - 1] : raw;
        first = w.slice(0, -1).join(" ");
      }
      return {
        first: deLatex(first),
        last: deLatex(last),
        full: deLatex(first ? first + " " + last : last)
      };
    }).filter(function (a) { return a.full; });
  }

  /* ---------- Display helpers ---------- */
  function initials(first) {
    return first.split(/[\s-]+/).filter(Boolean)
      .map(function (t) { return t[0].toUpperCase() + "."; }).join(" ");
  }

  /**
   * formatAuthors(entry, opts)
   *   opts.style   "full" | "initials"
   *   opts.highlight  array of surname strings to bold
   *   opts.max     collapse to "et al." past this count (0 = never)
   * Returns HTML.
   */
  /* ---- author highlighting -------------------------------------------
     Matching is on the FULL given name, not just its initial:
     "Jiyu Park" must not light up "Jong-Min Park". Initials are only
     accepted when the .bib itself abbreviates ("Lee, E."), because then
     there is nothing more specific to compare against.                  */

  function letters(s) { return String(s || "").toLowerCase().replace(/[^a-z]/g, ""); }

  /* "E.", "E", "H.-H." -> true ; "Eun", "Jong-Min" -> false */
  function isAbbrev(first) {
    var toks = String(first || "").split(/[\s.\-]+/).filter(Boolean);
    return toks.length > 0 && toks.every(function (t) { return t.length === 1; });
  }

  function splitName(raw) {
    var t = String(raw).trim();
    if (!t) return null;
    if (t.indexOf(",") > -1) {
      var seg = t.split(",");
      return { last: seg[0].trim(), first: seg.slice(1).join(",").trim() };
    }
    var w = t.split(/\s+/);
    return { last: w[w.length - 1], first: w.slice(0, -1).join(" ") };
  }

  function parseHighlight(list) {
    var H = { full: {}, init: {}, lastOnly: {} };
    (list || []).forEach(function (raw) {
      var n = splitName(raw);
      if (!n) return;
      var l = letters(n.last), f = letters(n.first);
      if (!f) { H.lastOnly[l] = true; return; }          // "Lee" -> any Lee
      H.full[l + "|" + f] = true;
      H.init[l + "|" + f[0]] = true;                      // for abbreviated .bib entries
    });
    return H;
  }

  function isHighlighted(H, first, last) {
    var l = letters(last), f = letters(first);
    if (H.lastOnly[l]) return true;
    if (!f) return false;
    if (H.full[l + "|" + f]) return true;
    return isAbbrev(first) ? !!H.init[l + "|" + f[0]] : false;
  }

  function formatAuthors(entry, opts) {
    opts = opts || {};
    var hi = parseHighlight(opts.highlight);
    var list = entry.authors;
    var max = opts.max || 0;
    var shown = max && list.length > max ? list.slice(0, max) : list;

    var html = shown.map(function (a) {
      var name = opts.style === "initials" && a.first
        ? initials(a.first) + " " + a.last
        : a.full;
      var esc = escapeHtml(name);
      return isHighlighted(hi, a.first, a.last)
        ? '<span class="me">' + esc + "</span>" : esc;
    }).join(", ");

    if (max && list.length > max) html += ", et al.";
    return html;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  global.BibTeX = {
    parse: parse,
    formatAuthors: formatAuthors,
    deLatex: deLatex,
    escapeHtml: escapeHtml
  };
})(window);

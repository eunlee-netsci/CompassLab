/* ============================================================
   publications.js — renders data/publications.bib
   ------------------------------------------------------------
   Pub.mount(rootSelector)      full publications page
   Pub.recent(sel, n)           short list for the home page
   ============================================================ */
(function (global) {
  "use strict";

  var CFG = global.SITE || {};
  var S = global.Site;
  var T = function (k) { return global.I18n ? I18n.t(k) : k; };

  var state = {
    all: [],
    q: "",
    type: "all",
    tag: "all",
    sort: "newest",
    selectedOnly: false
  };

  var ICON = {
    doi: "DOI", pdf: "PDF", arxiv: "arXiv", code: "Code",
    data: "Data", slides: "Slides", video: "Talk", press: "Press"
  };

  /* ---------- load ---------- */
  var loaded = null;
  function load() {
    if (loaded) return loaded;
    loaded = S.fetchText(CFG.bibPath || "data/publications.bib").then(function (txt) {
      var list = global.BibTeX.parse(txt);
      list.forEach(function (e, i) { e._i = i; });
      state.all = list;
      state.rawBib = txt;
      return list;
    });
    return loaded;
  }

  /* ---------- filtering ---------- */
  function haystack(e) {
    if (e._hay) return e._hay;
    e._hay = [e.title, e.authorRaw, e.venue, e.tags.join(" "), e.year, e.abstract, e.key]
      .join(" ").toLowerCase();
    return e._hay;
  }

  function filtered() {
    var terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    var out = state.all.filter(function (e) {
      if (state.selectedOnly && !e.selected) return false;
      if (state.type !== "all" && e.kind !== state.type) return false;
      if (state.tag !== "all" && e.tags.map(lc).indexOf(state.tag) === -1) return false;
      if (!terms.length) return true;
      var h = haystack(e);
      return terms.every(function (t) { return h.indexOf(t) > -1; });
    });
    out.sort(function (a, b) {
      var d = (b.year || 0) - (a.year || 0);
      if (state.sort === "oldest") d = -d;
      return d || a.title.localeCompare(b.title);
    });
    return out;
  }

  function lc(s) { return String(s).toLowerCase(); }

  /* ---------- rendering ---------- */
  function highlight(text) {
    var terms = state.q.split(/\s+/).filter(function (t) { return t.length > 1; });
    var html = S.escape(text);
    terms.forEach(function (t) {
      var re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      html = html.replace(re, "<mark>$1</mark>");
    });
    return html;
  }

  function venueLine(e) {
    var bits = [];
    if (e.venue) bits.push("<em>" + S.escape(e.venue) + "</em>");
    else if (e.note) bits.push("<em>" + S.escape(e.note) + "</em>");
    if (e.volume) bits.push(S.escape(e.volume) + (e.number ? "(" + S.escape(e.number) + ")" : ""));
    if (e.pages) bits.push(S.escape(e.pages));
    if (e.year) bits.push('<span class="yr">' + e.year + "</span>");
    if (e.venue && e.note) bits.push(S.escape(e.note));
    return bits.join(", ");
  }

  function linkList(e) {
    var out = [];
    if (e.doi) out.push(a("https://doi.org/" + e.doi, ICON.doi));
    else if (e.url) out.push(a(e.url, "Link"));
    if (e.pdf) out.push(a(e.pdf, ICON.pdf));
    if (e.arxiv) out.push(a(/^https?:/.test(e.arxiv) ? e.arxiv : "https://arxiv.org/abs/" + e.arxiv, ICON.arxiv));
    if (e.code) out.push(a(e.code, ICON.code));
    if (e.data) out.push(a(e.data, ICON.data));
    if (e.slides) out.push(a(e.slides, ICON.slides));
    if (e.video) out.push(a(e.video, ICON.video));
    if (e.press) out.push(a(e.press, ICON.press));
    if (e.abstract) out.push(btn("abstract", T("pub.abstract")));
    out.push(btn("bibtex", T("pub.bibtex")));
    return out.join("");

    function a(href, label) {
      return '<a class="plink" href="' + S.escape(href) + '" target="_blank" rel="noopener">' +
        S.escape(label) + "</a>";
    }
    function btn(kind, label) {
      return '<button class="plink" type="button" data-drawer="' + kind +
        '" data-key="' + S.escape(e.key) + '">' + S.escape(label) + "</button>";
    }
  }

  function entryNode(e, idx) {
    var node = S.el("article", { class: "pub", "data-key": e.key });

    var flags = "";
    if (e.selected) flags += '<span class="flag flag--sel">Selected</span>';
    if (e.kind === "preprint") flags += '<span class="flag flag--pre">Preprint</span>';
    if (e.award) flags += '<span class="flag flag--award">' + S.escape(e.award) + "</span>";

    var titleHtml = highlight(e.title);
    var href = e.doi ? "https://doi.org/" + e.doi : (e.url || e.pdf || "");
    var title = href
      ? '<a href="' + S.escape(href) + '" target="_blank" rel="noopener">' + titleHtml + "</a>"
      : titleHtml;

    var tagHtml = e.tags.length
      ? '<div class="pub__tags">' + e.tags.map(function (t) {
          return '<button class="ptag" type="button" data-tag="' + S.escape(lc(t)) + '">' +
            S.escape(t) + "</button>";
        }).join("") + "</div>"
      : "";

    node.innerHTML =
      '<div class="pub__idx">' + idx + "</div>" +
      "<div>" +
        '<h3 class="pub__title">' + title +
          (flags ? '<span class="pub__flags">' + flags + "</span>" : "") + "</h3>" +
        '<p class="pub__authors">' +
          global.BibTeX.formatAuthors(e, {
            style: CFG.authorStyle, highlight: CFG.labAuthors, max: CFG.authorMax
          }) + "</p>" +
        '<p class="pub__venue">' + venueLine(e) + "</p>" +
        '<div class="pub__links">' + linkList(e) + "</div>" +
        tagHtml +
        '<div class="pub__drawer" data-drawer-abstract hidden><p>' + S.escape(e.abstract) + "</p></div>" +
        '<div class="pub__drawer" data-drawer-bibtex hidden>' +
          "<pre>" + S.escape(e.raw) + "</pre>" +
          '<button class="btn btn--sm" type="button" data-copy-bib style="margin-top:.5rem">Copy</button>' +
        "</div>" +
      "</div>";
    return node;
  }

  function render(root) {
    var listEl = S.$("[data-pub-list]", root);
    var statEl = S.$("[data-pub-stats]", root);
    var rows = filtered();

    if (statEl) {
      statEl.innerHTML = "<strong>" + rows.length + "</strong> / " + state.all.length + " " +
        S.escape(T("pub.items"));
    }

    listEl.innerHTML = "";
    if (!rows.length) {
      listEl.appendChild(S.el("div", { class: "empty" }, S.escape(T("pub.empty"))));
      return;
    }

    var groups = [];
    var byYear = {};
    rows.forEach(function (e) {
      var y = e.year || "—";
      if (!byYear[y]) { byYear[y] = []; groups.push(y); }
      byYear[y].push(e);
    });

    var counter = rows.length;
    groups.forEach(function (y) {
      var block = S.el("section", { class: "year-block" });
      block.innerHTML =
        '<div class="year-block__head"><h2 id="y' + y + '">' + y + "</h2>" +
        '<span class="n">' + byYear[y].length + "</span></div>";
      byYear[y].forEach(function (e) {
        block.appendChild(entryNode(e, state.sort === "oldest" ? (rows.length - counter + 1) : counter));
        counter--;
      });
      listEl.appendChild(block);
    });
  }

  /* ---------- chips ---------- */
  var tagsExpanded = false;

  function buildChips(root) {
    var typeWrap = S.$("[data-chip-types]", root);
    var tagWrap = S.$("[data-chip-tags]", root);

    if (typeWrap) {
      var counts = {};
      state.all.forEach(function (e) { counts[e.kind] = (counts[e.kind] || 0) + 1; });
      var order = (CFG.types || []).filter(function (k) { return counts[k]; });
      Object.keys(counts).forEach(function (k) { if (order.indexOf(k) === -1) order.push(k); });
      typeWrap.innerHTML =
        chip("all", T("pub.all"), state.all.length, "type") +
        order.map(function (k) {
          return chip(k, T("pub." + k) === "pub." + k ? k : T("pub." + k), counts[k], "type");
        }).join("");
    }

    if (tagWrap) {
      var tc = {};
      state.all.forEach(function (e) {
        e.tags.forEach(function (t) {
          var k = lc(t);
          if (!tc[k]) tc[k] = { label: t, n: 0 };
          tc[k].n++;
        });
      });
      var keys = Object.keys(tc).sort(function (a, b) {
        return tc[b].n - tc[a].n || a.localeCompare(b);
      });
      if (CFG.topics && CFG.topics !== "auto") {
        keys = CFG.topics.map(lc).filter(function (k) { return tc[k]; });
      }
      // keep the toolbar short: show the most common topics, hide the tail
      var CAP = 12;
      var head = tagsExpanded ? keys : keys.slice(0, CAP);
      var hiddenN = keys.length - head.length;
      // an active tag must always be visible
      if (state.tag !== "all" && head.indexOf(state.tag) === -1 && keys.indexOf(state.tag) > -1) {
        head = head.concat([state.tag]);
        hiddenN--;
      }

      tagWrap.innerHTML = keys.length
        ? chip("all", T("pub.all"), state.all.length, "tag") +
          head.map(function (k) { return chip(k, tc[k].label, tc[k].n, "tag"); }).join("") +
          (hiddenN > 0
            ? '<button class="chip" type="button" data-more-tags>+' + hiddenN + "</button>"
            : (tagsExpanded && keys.length > CAP
                ? '<button class="chip" type="button" data-more-tags>−</button>' : ""))
        : "";
      var group = tagWrap.closest(".filter-group");
      if (group) group.hidden = !keys.length;
    }

    function chip(val, label, n, kind) {
      return '<button class="chip" type="button" data-' + kind + '="' + S.escape(val) + '" ' +
        'aria-pressed="' + (state[kind] === val) + '">' + S.escape(label) +
        (n != null ? ' <span class="count">' + n + "</span>" : "") + "</button>";
    }
  }

  function syncChips(root) {
    S.$$("[data-type]", root).forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.type === state.type));
    });
    S.$$("[data-chip-tags] [data-tag]", root).forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.tag === state.tag));
    });
    var sel = S.$("[data-selected-only]", root);
    if (sel) sel.setAttribute("aria-pressed", String(state.selectedOnly));
    var sortBtn = S.$("[data-sort]", root);
    if (sortBtn) sortBtn.textContent = T(state.sort === "newest" ? "pub.newest" : "pub.oldest");
  }

  /* ---------- URL state ---------- */
  function readURL() {
    var p = new URLSearchParams(location.search);
    state.q = p.get("q") || "";
    state.type = p.get("type") || "all";
    state.tag = p.get("tag") || "all";
    state.sort = p.get("sort") === "oldest" ? "oldest" : "newest";
    state.selectedOnly = p.get("selected") === "1";
  }
  function writeURL() {
    var p = new URLSearchParams(location.search);
    ["q", "type", "tag", "sort", "selected"].forEach(function (k) { p.delete(k); });
    if (state.q) p.set("q", state.q);
    if (state.type !== "all") p.set("type", state.type);
    if (state.tag !== "all") p.set("tag", state.tag);
    if (state.sort !== "newest") p.set("sort", state.sort);
    if (state.selectedOnly) p.set("selected", "1");
    var qs = p.toString();
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
  }

  /* ---------- mount ---------- */
  function mount(rootSel) {
    var root = S.$(rootSel);
    if (!root) return;
    var listEl = S.$("[data-pub-list]", root);
    listEl.innerHTML = '<div class="empty">' + S.escape(T("pub.loading")) + "</div>";

    readURL();

    load().then(function () {
      var input = S.$("[data-pub-search]", root);
      if (input) input.value = state.q;
      buildChips(root);
      syncChips(root);
      render(root);
      wire(root);
    }).catch(function (err) {
      console.error(err);
      S.loadError(listEl, err);
    });

    if (global.I18n) I18n.onChange(function () {
      if (!state.all.length) return;
      buildChips(root);
      syncChips(root);
      render(root);
    });
  }

  function wire(root) {
    var input = S.$("[data-pub-search]", root);
    if (input) {
      var timer;
      input.addEventListener("input", function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          state.q = input.value.trim();
          writeURL(); render(root);
        }, 120);
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "/" && document.activeElement !== input &&
            !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
          e.preventDefault(); input.focus(); input.select();
        }
        if (e.key === "Escape" && document.activeElement === input) {
          input.value = ""; state.q = ""; writeURL(); render(root); input.blur();
        }
      });
    }

    root.addEventListener("click", function (ev) {
      var t = ev.target;

      var typeBtn = t.closest("[data-type]");
      if (typeBtn) { state.type = typeBtn.dataset.type; return update(); }

      if (t.closest("[data-more-tags]")) {
        tagsExpanded = !tagsExpanded;
        buildChips(root); syncChips(root);
        return;
      }

      var tagBtn = t.closest("[data-tag]");
      if (tagBtn) {
        var v = tagBtn.dataset.tag;
        var inline = tagBtn.classList.contains("ptag");
        state.tag = (inline && state.tag === v) ? "all" : v;
        if (inline) window.scrollTo({ top: root.offsetTop - 80, behavior: "smooth" });
        return update();
      }

      if (t.closest("[data-selected-only]")) {
        state.selectedOnly = !state.selectedOnly; return update();
      }
      if (t.closest("[data-sort]")) {
        state.sort = state.sort === "newest" ? "oldest" : "newest"; return update();
      }
      if (t.closest("[data-reset]")) {
        state.q = ""; state.type = "all"; state.tag = "all";
        state.sort = "newest"; state.selectedOnly = false;
        if (input) input.value = "";
        return update();
      }

      var drawerBtn = t.closest("[data-drawer]");
      if (drawerBtn) {
        var art = drawerBtn.closest(".pub");
        var which = drawerBtn.dataset.drawer;
        var box = S.$("[data-drawer-" + which + "]", art);
        var open = box.hidden;
        S.$$("[data-drawer-abstract],[data-drawer-bibtex]", art).forEach(function (b) { b.hidden = true; });
        S.$$("[data-drawer]", art).forEach(function (b) { b.classList.remove("is-on"); });
        box.hidden = !open;
        drawerBtn.classList.toggle("is-on", open);
        return;
      }

      if (t.closest("[data-copy-bib]")) {
        var pre = S.$("pre", t.closest(".pub__drawer"));
        S.copy(pre.textContent, T("pub.copied"));
        return;
      }

      if (t.closest("[data-copy-all]")) {
        S.copy(filtered().map(function (e) { return e.raw; }).join("\n\n"), T("pub.copied"));
        return;
      }

      if (t.closest("[data-download-bib]")) {
        var blob = new Blob([state.rawBib || ""], { type: "text/plain;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = S.el("a", { href: url, download: "publications.bib" });
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        return;
      }
    });

    function update() { writeURL(); buildChips(root); syncChips(root); render(root); }
  }

  /* ---------- compact list for the home page ---------- */
  function recent(sel, n) {
    var box = S.$(sel);
    if (!box) return;
    load().then(function (list) {
      var picks = list.slice().sort(function (a, b) {
        return (b.selected - a.selected) || ((b.year || 0) - (a.year || 0));
      }).slice(0, n || 5);

      function paint() {
        box.innerHTML = "";
        picks.forEach(function (e) {
          var node = S.el("article", { class: "pub" });
          var href = e.doi ? "https://doi.org/" + e.doi : (e.url || e.pdf || "");
          node.innerHTML =
            '<div class="pub__idx">' + (e.year || "") + "</div><div>" +
            '<h3 class="pub__title">' +
              (href ? '<a href="' + S.escape(href) + '" target="_blank" rel="noopener">' +
                S.escape(e.title) + "</a>" : S.escape(e.title)) +
              (e.selected ? '<span class="pub__flags"><span class="flag flag--sel">Selected</span></span>' : "") +
            "</h3>" +
            '<p class="pub__authors">' + global.BibTeX.formatAuthors(e, {
              style: CFG.authorStyle, highlight: CFG.labAuthors, max: 6
            }) + "</p>" +
            '<p class="pub__venue">' + venueLine(e) + "</p></div>";
          box.appendChild(node);
        });
      }
      paint();
      if (global.I18n) I18n.onChange(paint);
    }).catch(function (err) { S.loadError(box, err); });
  }

  /* ---------- publications for one theme (research page) ---------- */
  function byTag(sel, tag, max) {
    var box = S.$(sel);
    if (!box) return;
    load().then(function (list) {
      var rows = list.filter(function (e) {
        return e.tags.map(lc).indexOf(lc(tag)) > -1;
      }).sort(function (a, b) { return (b.year || 0) - (a.year || 0); });
      if (max) rows = rows.slice(0, max);

      function paint() {
        box.innerHTML = "";
        if (!rows.length) {
          box.innerHTML = '<p class="muted" style="font-size:var(--fs-sm)">—</p>';
          return;
        }
        rows.forEach(function (e) {
          var node = S.el("article", { class: "pub pub--compact" });
          var href = e.doi ? "https://doi.org/" + e.doi : (e.url || e.pdf || "");
          node.innerHTML =
            '<div class="pub__idx">' + (e.year || "") + "</div><div>" +
            '<h3 class="pub__title">' +
              (href ? '<a href="' + S.escape(href) + '" target="_blank" rel="noopener">' +
                S.escape(e.title) + "</a>" : S.escape(e.title)) + "</h3>" +
            '<p class="pub__authors">' + global.BibTeX.formatAuthors(e, {
              style: CFG.authorStyle, highlight: CFG.labAuthors, max: 8
            }) + "</p>" +
            '<p class="pub__venue">' + venueLine(e) + "</p></div>";
          box.appendChild(node);
        });
      }
      paint();
      if (global.I18n) I18n.onChange(paint);
    }).catch(function (err) { S.loadError(box, err); });
  }

  global.Pub = { mount: mount, recent: recent, byTag: byTag, load: load };
})(window);

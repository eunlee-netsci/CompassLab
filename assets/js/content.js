/* ============================================================
   content.js — renders data/news.json and data/people.json
   Bilingual fields use { "en": "…", "ko": "…" }; plain strings work too.
   ============================================================ */
(function (global) {
  "use strict";

  var S = global.Site;
  var T = function (k) { return global.I18n ? I18n.t(k) : k; };

  /* ---------- News ---------- */
  function news(sel, limit, full) {
    var box = S.$(sel);
    if (!box) return;
    S.fetchJSON("data/news.json").then(function (items) {
      items.sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
      var rows = limit ? items.slice(0, limit) : items;

      function paint() {
        var lang = global.I18n ? I18n.lang : "en";
        box.innerHTML = "";
        rows.forEach(function (it) {
          var li = S.el("li");
          var head = S.escape(S.pick(it.title, lang) || S.pick(it.text, lang));
          if (it.link) {
            head = '<a href="' + S.escape(it.link) + '" target="_blank" rel="noopener">' + head + "</a>";
          }
          var body = it.title ? S.escape(S.pick(it.text, lang)) : "";
          var fig = (full && it.image)
            ? '<figure><img src="' + S.escape(it.image) + '" alt="" loading="lazy"></figure>'
            : "";
          li.innerHTML =
            '<time datetime="' + S.escape(it.date || "") + '">' +
              S.escape(fmtDate(it.date, lang)) + "</time>" +
            "<div><p><strong>" + head + "</strong></p>" +
              (body ? '<p class="muted" style="font-size:var(--fs-sm)">' + body + "</p>" : "") +
              fig +
            "</div>";
          box.appendChild(li);
        });
      }
      paint();
      if (global.I18n) I18n.onChange(paint);
    }).catch(function (e) { S.loadError(box, e); });
  }

  function fmtDate(iso, lang) {
    if (!iso) return "";
    var p = iso.split("-");
    var y = p[0], m = parseInt(p[1] || "0", 10), d = parseInt(p[2] || "0", 10);
    var MON = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (lang === "ko") {
      return y + (m ? "." + String(m).padStart(2, "0") : "") + (d ? "." + String(d).padStart(2, "0") : "");
    }
    return (m ? MON[m] + " " : "") + (d ? d + ", " : "") + y;
  }

  /* ---------- People ---------- */
  function people(rootSel) {
    var root = S.$(rootSel);
    if (!root) return;
    S.fetchJSON("data/people.json").then(function (data) {
      function paint() {
        var lang = global.I18n ? I18n.lang : "en";
        root.innerHTML = "";
        (data.groups || []).forEach(function (g, gi) {
          if (!(g.people || []).length) return;
          var sec = S.el("section", {
            class: "section" + (gi % 2 === 1 ? " section--soft" : "") +
                   (gi === 0 ? " section--tight" : "")
          });
          var inner = S.el("div", { class: "wrap" });

          inner.appendChild(S.el("div", { class: "section-head" },
            "<h2" + (gi === 0 ? ' style="font-size:var(--fs-2xl)"' : "") + ">" +
            S.escape(S.pick(g.title, lang)) + "</h2>" +
            '<span class="muted" style="font-size:var(--fs-xs)">' + g.people.length + "</span>"));

          if (g.layout === "list") {
            var ul = S.el("ul", { class: "alumni" });
            g.people.forEach(function (p) { ul.appendChild(listRow(p, lang)); });
            inner.appendChild(ul);
          } else {
            var grid = S.el("div", { class: "people-grid" });
            g.people.forEach(function (p) {
              grid.appendChild(personNode(p, lang, g.layout === "lead"));
            });
            inner.appendChild(grid);
          }
          sec.appendChild(inner);
          root.appendChild(sec);
        });
      }
      paint();
      if (global.I18n) I18n.onChange(paint);
    }).catch(function (e) { S.loadError(root, e); });
  }

  function fullName(p, lang) {
    var n = S.pick(p.name, lang);
    if (p.nameKo && lang === "ko") return p.nameKo + " (" + n + ")";
    if (p.nameKo) return n + " (" + p.nameKo + ")";
    return n;
  }

  function linksHtml(p) {
    var out = (p.links || []).filter(function (l) { return l && l.url; }).map(function (l) {
      return '<a href="' + S.escape(l.url) + '" target="_blank" rel="noopener">' +
        S.escape(l.label || "link") + "</a>";
    });
    if (p.email) out.unshift('<a href="mailto:' + S.escape(p.email) + '">Email</a>');
    return out.length ? '<div class="links">' + out.join("") + "</div>" : "";
  }

  function personNode(p, lang, isLead) {
    var node = S.el("div", { class: "person" + (isLead ? " person--lead" : "") });
    var name = fullName(p, lang);
    var photo = p.photo
      ? '<img class="person__photo" src="' + S.escape(p.photo) + '" alt="' +
        S.escape(name) + '" loading="lazy" width="600" height="600">'
      : '<div class="person__photo">' + S.escape(initials(S.pick(p.name, "en"))) + "</div>";

    var meta = "";
    if (p.interests) {
      meta += '<p class="bio"><span class="k">' + S.escape(T("people.interests")) + "</span> " +
        S.escape(S.pick(p.interests, lang)) + "</p>";
    }
    if (p.hobby) {
      meta += '<p class="bio"><span class="k">' + S.escape(T("people.hobby")) + "</span> " +
        S.escape(S.pick(p.hobby, lang)) + "</p>";
    }

    node.innerHTML = photo + "<div>" +
      "<h3>" + S.escape(name) +
        (p.note ? ' <span class="muted" style="font-weight:400;font-size:var(--fs-xs)">· ' +
          S.escape(S.pick(p.note, lang)) + "</span>" : "") +
      "</h3>" +
      '<div class="role">' + S.escape(S.pick(p.role, lang)) + "</div>" +
      (p.bio ? '<p class="bio">' + S.escape(S.pick(p.bio, lang)) + "</p>" : "") +
      meta +
      (p.office ? '<p class="bio muted">' + S.escape(S.pick(p.office, lang)) + "</p>" : "") +
      linksHtml(p) +
      "</div>";
    return node;
  }

  function listRow(p, lang) {
    var li = S.el("li");
    li.innerHTML =
      "<span>" + S.escape(fullName(p, lang)) +
        (p.note ? ' <span class="muted">· ' + S.escape(S.pick(p.note, lang)) + "</span>" : "") +
        (p.interests ? '<br><span class="muted" style="font-size:var(--fs-xs)">' +
          S.escape(S.pick(p.interests, lang)) + "</span>" : "") +
      "</span>" +
      '<span class="then">' + S.escape(S.pick(p.role, lang) || "") +
        (p.years ? " · " + S.escape(p.years) : "") + "</span>";
    return li;
  }

  function initials(name) {
    return String(name).split(/\s+/).slice(0, 2)
      .map(function (w) { return w[0] || ""; }).join("").toUpperCase();
  }

  /* ---------- Teaching ---------- */
  function teaching(sel) {
    var box = S.$(sel);
    if (!box) return;
    var cfg = (global.SITE && global.SITE.teaching) || {};
    function paint() {
      var lang = global.I18n ? I18n.lang : "en";
      box.innerHTML = "";
      [["teaching.spring", cfg.spring], ["teaching.fall", cfg.fall]].forEach(function (pair) {
        if (!(pair[1] || []).length) return;
        var col = S.el("div");
        col.innerHTML = "<h3 style=\"font-size:var(--fs-md);margin-bottom:.6rem\">" +
          S.escape(T(pair[0])) + "</h3><ol class=\"course-list\">" +
          pair[1].map(function (c) { return "<li>" + S.escape(S.pick(c, lang)) + "</li>"; }).join("") +
          "</ol>";
        box.appendChild(col);
      });
    }
    paint();
    if (global.I18n) I18n.onChange(paint);
  }



  /* ---------- Activities ---------- */
  function activities(sel) {
    var box = S.$(sel);
    if (!box) return;
    S.fetchJSON("data/activities.json").then(function (items) {
      function paint() {
        var lang = global.I18n ? I18n.lang : "en";
        box.innerHTML = "";
        if (!items.length) {
          box.innerHTML = '<p class="muted">—</p>';
          return;
        }
        items.forEach(function (a) {
          var meta = [];
          if (a.role) meta.push([T("act.role"), S.pick(a.role, lang)]);
          if (a.when) {                                   // one-off event
            meta.push([T("act.when"), S.pick(a.when, lang)]);
          } else if (a.since) {                           // recurring / ongoing
            meta.push([T("act.since"), fmtDate(a.since, lang) +
              (a.ongoing ? " – " + T("act.ongoing") : "")]);
          }
          if (a.cadence) meta.push([T("act.cadence"), S.pick(a.cadence, lang)]);
          if (a.where) meta.push([T("act.where"), S.pick(a.where, lang)]);
          if (a.host) meta.push([T("act.host"), S.pick(a.host, lang)]);
          if (a.with) meta.push([T("act.with"), a.with]);

          var node = S.el("article", { class: "activity" });
          node.innerHTML =
            '<div class="activity__head">' +
              "<h2>" + S.escape(S.pick(a.name, lang)) + "</h2>" +
              (a.kind ? '<p class="activity__kind">' + S.escape(S.pick(a.kind, lang)) + "</p>" : "") +
            "</div>" +
            '<dl class="activity__meta">' +
              meta.map(function (m) {
                return "<dt>" + S.escape(m[0]) + "</dt><dd>" + S.escape(m[1]) + "</dd>";
              }).join("") +
            "</dl>" +
            (a.text ? '<p class="activity__text">' + S.escape(S.pick(a.text, lang)) + "</p>" : "") +
            (a.link ? '<p style="margin:0"><a class="btn btn--sm" href="' + S.escape(a.link) +
              '" target="_blank" rel="noopener">' +
              S.escape(S.pick(a.linkLabel, lang) || T("act.visit")) + " ↗</a></p>" : "");
          box.appendChild(node);
        });
      }
      paint();
      if (global.I18n) I18n.onChange(paint);
    }).catch(function (e) { S.loadError(box, e); });
  }

  /* ---------- Research themes (from config.js + publications.bib) ---------- */
  function themeList() { return (global.SITE && global.SITE.themes) || []; }

  function themeCounts() {
    if (!global.Pub) return Promise.resolve({});
    return global.Pub.load().then(function (list) {
      var c = {};
      list.forEach(function (e) {
        e.tags.forEach(function (t) {
          var k = String(t).toLowerCase();
          c[k] = (c[k] || 0) + 1;
        });
      });
      return c;
    }).catch(function () { return {}; });
  }

  /* Compact card grid, e.g. on the home page. `max` limits how many show. */
  function themes(sel, max) {
    var box = S.$(sel);
    if (!box) return;
    var items = themeList();
    themeCounts().then(function (counts) {
      function paint() {
        var lang = global.I18n ? I18n.lang : "en";
        var rows = items.slice();
        rows.sort(function (a, b) {
          return (counts[b.tag.toLowerCase()] || 0) - (counts[a.tag.toLowerCase()] || 0);
        });
        if (max) rows = rows.slice(0, max);
        box.innerHTML = "";
        rows.forEach(function (t) {
          var n = counts[t.tag.toLowerCase()] || 0;
          var a = S.el("a", {
            class: "theme-card",
            href: "publications.html?tag=" + encodeURIComponent(t.tag.toLowerCase())
          });
          a.innerHTML =
            '<span class="n">' + (n ? n + (lang === "ko" ? "편" : n === 1 ? " paper" : " papers") : "") + "</span>" +
            "<h3>" + S.escape(lang === "ko" ? t.ko : t.en) + "</h3>" +
            "<p>" + S.escape(lang === "ko" ? t.descKo : t.descEn) + "</p>";
          box.appendChild(a);
        });
      }
      paint();
      if (global.I18n) I18n.onChange(paint);
    });
  }

  /* Full theme sections with their own publication lists (research page). */
  function themeBlocks(sel) {
    var box = S.$(sel);
    if (!box) return;
    var items = themeList();

    function paint() {
      var lang = global.I18n ? I18n.lang : "en";
      box.innerHTML = "";
      items.forEach(function (t, i) {
        var id = "theme-" + t.tag.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        var sec = S.el("section", { class: "theme-block", id: id });
        sec.innerHTML =
          '<div class="theme-block__head">' +
            '<span class="card__num">' + String(i + 1).padStart(2, "0") + "</span>" +
            "<h2>" + S.escape(lang === "ko" ? t.ko : t.en) + "</h2>" +
            '<p class="muted prose" style="margin:0;font-size:var(--fs-sm)">' +
              S.escape(lang === "ko" ? t.descKo : t.descEn) + "</p>" +
          "</div>" +
          '<div data-theme-pubs="' + S.escape(t.tag) + '"></div>' +
          '<p style="margin-top:.75rem"><a class="btn btn--sm" href="publications.html?tag=' +
            encodeURIComponent(t.tag.toLowerCase()) + '">' +
            S.escape(lang === "ko" ? "이 주제 논문 전체 →" : "All papers in this theme →") + "</a></p>";
        box.appendChild(sec);
        if (global.Pub) global.Pub.byTag('[data-theme-pubs="' + t.tag + '"]', t.tag, 6);
      });
    }
    paint();
    if (global.I18n) I18n.onChange(paint);
  }

  global.Content = { news: news, people: people, teaching: teaching,
                     activities: activities,
                     themes: themes, themeBlocks: themeBlocks };
})(window);

/* ============================================================
   site.js — shared behaviour: nav, language boot, small helpers
   ============================================================ */
(function (global) {
  "use strict";

  var Site = {};

  /* ---------- DOM helpers ---------- */
  Site.$ = function (sel, root) { return (root || document).querySelector(sel); };
  Site.$$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };
  Site.el = function (tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") n.className = attrs[k];
      else if (k.slice(0, 5) === "data-") n.setAttribute(k, attrs[k]);
      else if (k in n) n[k] = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    if (html != null) n.innerHTML = html;
    return n;
  };

  /* ---------- Data loading ---------- */
  Site.fetchText = function (path) {
    return fetch(path, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(path + " → HTTP " + r.status);
      return r.text();
    });
  };
  Site.fetchJSON = function (path) {
    return Site.fetchText(path).then(function (t) { return JSON.parse(t); });
  };

  /* Shows a readable message instead of a blank page when the site is
     opened straight from the filesystem (file://), where fetch is blocked. */
  Site.loadError = function (target, err) {
    if (!target) return;
    var isFile = location.protocol === "file:";
    target.innerHTML =
      '<div class="notice">' +
      (isFile
        ? '<strong>Local preview needs a web server.</strong><br>' +
          'Data files cannot be read over <code>file://</code>. In the project folder run ' +
          '<code>python3 -m http.server 8000</code> and open <code>http://localhost:8000</code>.' +
          '<br><span style="opacity:.7">GitHub Pages에 올리면 그대로 동작합니다.</span>'
        : '<strong>Could not load data.</strong><br>' + Site.escape(String(err && err.message || err))) +
      "</div>";
  };

  Site.escape = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* Pick { en, ko } objects, or return a plain string as-is. */
  Site.pick = function (v, lang) {
    if (v == null) return "";
    if (typeof v === "string") return v;
    return v[lang || (global.I18n ? I18n.lang : "en")] || v.en || v.ko || "";
  };

  /* ---------- Toast ---------- */
  var toastEl = null, toastTimer = null;
  Site.toast = function (msg) {
    if (!toastEl) {
      toastEl = Site.el("div", { class: "toast", role: "status", "aria-live": "polite" });
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 1800);
  };

  Site.copy = function (text, okMsg) {
    var done = function () { Site.toast(okMsg || "Copied"); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else fallback();
    function fallback() {
      var ta = Site.el("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { Site.toast("Copy failed"); }
      document.body.removeChild(ta);
    }
  };

  /* ---------- Header ---------- */
  function initNav() {
    var here = location.pathname.split("/").pop() || "index.html";
    Site.$$(".site-nav a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === here || (here === "index.html" && href === "./")) {
        a.setAttribute("aria-current", "page");
      }
    });

    var toggle = Site.$(".nav-toggle");
    var nav = Site.$(".site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      nav.addEventListener("click", function (e) {
        if (e.target.tagName === "A") {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }
  }

  /* ---------- Footer contact block ---------- */
  function initFooter() {
    var cfg = global.SITE || {};
    Site.$$("[data-site-email]").forEach(function (mail) {
      if (cfg.contact && cfg.contact.email) {
        mail.textContent = cfg.contact.email;
        mail.href = "mailto:" + cfg.contact.email;
      }
    });
    Site.$$("[data-site-link]").forEach(function (a) {
      var key = a.getAttribute("data-site-link");
      var url = cfg.contact && cfg.contact[key];
      if (url) a.href = url; else a.closest("li") && (a.closest("li").hidden = true);
    });
    Site.$$("[data-site-phone]").forEach(function (ph) {
      if (cfg.contact) ph.textContent = cfg.contact.phone || "";
    });

    function paintAddr(lang) {
      if (!cfg.address) return;
      Site.$$("[data-site-address]").forEach(function (addr) {
        addr.textContent = Site.pick(cfg.address, lang);
      });
    }
    paintAddr(global.I18n ? I18n.lang : "en");
    if (global.I18n) I18n.onChange(paintAddr);

    var yr = Site.$("[data-year]");
    if (yr) yr.textContent = new Date().getFullYear();
  }

  Site.init = function () {
    if (global.I18n) I18n.init();
    initNav();
    initFooter();
  };

  global.Site = Site;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", Site.init);
  } else {
    Site.init();
  }
})(window);

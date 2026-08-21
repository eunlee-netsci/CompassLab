/* ============================================================
   i18n.js — Korean / English toggle
   ------------------------------------------------------------
   Two mechanisms, use whichever is convenient:

   1. Short UI strings → dictionary lookup
        <a data-i18n="nav.research">Research</a>
        <input data-i18n-placeholder="pub.searchPh">

   2. Longer prose → keep both versions in the HTML
        <p data-lang="en">We study ...</p>
        <p data-lang="ko">우리는 ...</p>

   Language is remembered per browser and can be forced with ?lang=ko
   ============================================================ */
(function (global) {
  "use strict";

  var DICT = {
    en: {
      "site.name": "COMPASS Lab",
      "site.tagline": "Computational Modeling of Patterns And Social Systems",

      "nav.home": "Home",
      "nav.research": "Research",
      "nav.publications": "Publications",
      "nav.people": "People",
      "nav.join": "Join",
      "nav.menu": "Menu",
      "nav.teaching": "Teaching",
      "nav.activities": "Activities",
      "act.title": "Activities",
      "act.role": "Role",
      "act.since": "Since",
      "act.when": "When",
      "act.where": "Venue",
      "act.host": "Host",
      "act.cadence": "Frequency",
      "act.with": "Organizers",
      "act.ongoing": "ongoing",
      "act.visit": "Visit site",
      "nav.contact": "Contact",
      "people.interests": "Interests",
      "people.hobby": "Hobby",
      "teaching.title": "Teaching",
      "teaching.spring": "Spring semester",
      "teaching.fall": "Fall semester",
      "contact.title": "Contact",
      "contact.office": "Office",
      "contact.phone": "Phone",
      "contact.map": "Show map",
      "home.themesTitle": "Research themes",
      "research.papers": "Papers in this theme",

      "cta.publications": "Publications",
      "cta.join": "Join the lab",
      "cta.email": "Email",
      "cta.scholar": "Google Scholar",
      "cta.github": "GitHub",
      "cta.more": "See all →",

      "home.newsTitle": "News",
      "home.researchTitle": "Research themes",
      "home.recentTitle": "Recent publications",
      "home.joinTitle": "Work with us",

      "pub.title": "Publications",
      "pub.searchPh": "Search title, author, venue, keyword…",
      "pub.type": "Type",
      "pub.topic": "Topic",
      "pub.sort": "Sort",
      "pub.all": "All",
      "pub.journal": "Journal",
      "pub.conference": "Conference",
      "pub.preprint": "Preprint",
      "pub.chapter": "Chapter",
      "pub.book": "Book",
      "pub.thesis": "Thesis",
      "pub.other": "Other",
      "pub.selectedOnly": "Selected only",
      "pub.newest": "Newest first",
      "pub.oldest": "Oldest first",
      "pub.reset": "Reset",
      "pub.downloadBib": "Download .bib",
      "pub.copyAll": "Copy all BibTeX",
      "pub.abstract": "Abstract",
      "pub.bibtex": "BibTeX",
      "pub.empty": "No publications match these filters.",
      "pub.loading": "Loading publications…",
      "pub.copied": "Copied to clipboard",
      "pub.showing": "Showing",
      "pub.of": "of",
      "pub.items": "publications",


      "footer.contact": "Contact",
      "footer.links": "Links",
      "footer.address": "Address",
      "footer.built": "Built with plain HTML, CSS and JavaScript. Hosted on GitHub Pages.",
      "footer.source": "Site source"
    },

    ko: {
      "site.name": "COMPASS 연구실",
      "site.tagline": "패턴과 사회 시스템의 계산 모형화",

      "nav.home": "홈",
      "nav.research": "연구",
      "nav.publications": "논문",
      "nav.people": "구성원",
      "nav.join": "합류",
      "nav.menu": "메뉴",
      "nav.teaching": "강의",
      "nav.activities": "활동",
      "act.title": "활동",
      "act.role": "역할",
      "act.since": "시작",
      "act.when": "일시",
      "act.where": "장소",
      "act.host": "주최",
      "act.cadence": "주기",
      "act.with": "주관진",
      "act.ongoing": "진행 중",
      "act.visit": "홈페이지 보기",
      "nav.contact": "연락처",
      "people.interests": "관심 분야",
      "people.hobby": "취미",
      "teaching.title": "강의",
      "teaching.spring": "1학기",
      "teaching.fall": "2학기",
      "contact.title": "연락처",
      "contact.office": "연구실",
      "contact.phone": "전화",
      "contact.map": "지도 보기",
      "home.themesTitle": "연구 주제",
      "research.papers": "이 주제의 논문",

      "cta.publications": "논문 보기",
      "cta.join": "연구실 합류",
      "cta.email": "이메일",
      "cta.scholar": "구글 스칼라",
      "cta.github": "깃허브",
      "cta.more": "전체 보기 →",

      "home.newsTitle": "소식",
      "home.researchTitle": "연구 주제",
      "home.recentTitle": "최근 논문",
      "home.joinTitle": "함께 연구할 사람",

      "pub.title": "논문",
      "pub.searchPh": "제목, 저자, 저널, 키워드 검색…",
      "pub.type": "유형",
      "pub.topic": "주제",
      "pub.sort": "정렬",
      "pub.all": "전체",
      "pub.journal": "저널",
      "pub.conference": "학회",
      "pub.preprint": "프리프린트",
      "pub.chapter": "챕터",
      "pub.book": "단행본",
      "pub.thesis": "학위논문",
      "pub.other": "기타",
      "pub.selectedOnly": "대표 논문만",
      "pub.newest": "최신순",
      "pub.oldest": "오래된순",
      "pub.reset": "초기화",
      "pub.downloadBib": ".bib 내려받기",
      "pub.copyAll": "전체 BibTeX 복사",
      "pub.abstract": "초록",
      "pub.bibtex": "BibTeX",
      "pub.empty": "조건에 맞는 논문이 없습니다.",
      "pub.loading": "논문 목록 불러오는 중…",
      "pub.copied": "클립보드에 복사했습니다",
      "pub.showing": "전체",
      "pub.of": "편 중",
      "pub.items": "편 표시",


      "footer.contact": "연락처",
      "footer.links": "링크",
      "footer.address": "주소",
      "footer.built": "빌드 도구 없이 HTML·CSS·JS로 제작. GitHub Pages 호스팅.",
      "footer.source": "사이트 소스"
    }
  };

  var STORE_KEY = "compass-lang";
  var listeners = [];
  var current = "en";

  function safeGet() {
    try { return global.localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }
  function safeSet(v) {
    try { global.localStorage.setItem(STORE_KEY, v); } catch (e) { /* private mode */ }
  }

  function detect() {
    var qs = new URLSearchParams(global.location.search).get("lang");
    if (qs === "ko" || qs === "en") return qs;
    var saved = safeGet();
    if (saved === "ko" || saved === "en") return saved;
    return /^ko\b/i.test(global.navigator.language || "") ? "ko" : "en";
  }

  function t(key, lang) {
    var l = lang || current;
    return (DICT[l] && DICT[l][key]) || (DICT.en && DICT.en[key]) || key;
  }

  function apply(lang) {
    current = lang;
    document.documentElement.lang = lang === "ko" ? "ko" : "en";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"), lang);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder"), lang));
    });
    document.querySelectorAll("[data-i18n-label]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-label"), lang));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.setAttribute("title", t(el.getAttribute("data-i18n-title"), lang));
    });
    document.querySelectorAll("[data-lang]").forEach(function (el) {
      el.hidden = el.getAttribute("data-lang") !== lang;
    });
    document.querySelectorAll(".lang-toggle button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.setLang === lang));
    });

    listeners.forEach(function (fn) { try { fn(lang); } catch (e) { console.error(e); } });
  }

  function set(lang) {
    if (lang !== "ko" && lang !== "en") return;
    safeSet(lang);
    apply(lang);
  }

  function init() {
    apply(detect());
    document.addEventListener("click", function (ev) {
      var btn = ev.target.closest(".lang-toggle button");
      if (btn) set(btn.dataset.setLang);
    });
  }

  global.I18n = {
    init: init,
    set: set,
    t: t,
    get lang() { return current; },
    onChange: function (fn) { listeners.push(fn); },
    dict: DICT
  };
})(window);

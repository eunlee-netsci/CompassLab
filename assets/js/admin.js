/* ============================================================
   admin.js — browser-only editor for data/people.json, data/news.json
   and data/publications.bib.

   Nothing is written automatically. You either
     (a) download / copy the file and commit it yourself, or
     (b) paste a GitHub token once and press "GitHub에 저장",
         which commits straight to the repo through the REST API.

   The token never leaves the browser. It is kept in sessionStorage
   (cleared when the tab closes) unless you tick "이 브라우저에 기억".
   ============================================================ */
(function (global) {
  "use strict";

  var S = global.Site;
  var CFG = global.SITE || {};
  var $ = S.$, $$ = S.$$, el = S.el;

  var STATE = {
    people: null,
    news: null,
    bib: "",
    dirty: {},
    tab: "people"
  };

  var FILES = {
    people: "data/people.json",
    news: "data/news.json",
    bib: "data/publications.bib"
  };

  /* ------------------------------------------------ token handling */
  var TOKEN_KEY = "compass-gh-token";
  function getToken() {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || "";
    } catch (e) { return ""; }
  }
  function setToken(v, remember) {
    try {
      sessionStorage.setItem(TOKEN_KEY, v);
      if (remember) localStorage.setItem(TOKEN_KEY, v);
      else localStorage.removeItem(TOKEN_KEY);
    } catch (e) { /* ignore */ }
  }
  function clearToken() {
    try { sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY); } catch (e) {}
  }

  /* ------------------------------------------------ GitHub REST */
  function repoInfo() {
    var r = CFG.repo || {};
    return {
      owner: ($("#gh-owner") && $("#gh-owner").value) || r.owner || "",
      name: ($("#gh-repo") && $("#gh-repo").value) || r.name || "",
      branch: ($("#gh-branch") && $("#gh-branch").value) || r.branch || "main"
    };
  }

  function ghHeaders() {
    return {
      "Authorization": "Bearer " + getToken(),
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
  }

  function b64(str) {
    return btoa(String.fromCharCode.apply(null, new TextEncoder().encode(str)));
  }

  function ghGetSha(path) {
    var r = repoInfo();
    var url = "https://api.github.com/repos/" + r.owner + "/" + r.name +
      "/contents/" + path + "?ref=" + encodeURIComponent(r.branch);
    return fetch(url, { headers: ghHeaders() }).then(function (res) {
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("GitHub GET " + res.status + " — " + res.statusText);
      return res.json().then(function (j) { return j.sha; });
    });
  }

  function ghPut(path, contentB64, message) {
    var r = repoInfo();
    return ghGetSha(path).then(function (sha) {
      var url = "https://api.github.com/repos/" + r.owner + "/" + r.name + "/contents/" + path;
      var body = { message: message, content: contentB64, branch: r.branch };
      if (sha) body.sha = sha;
      return fetch(url, {
        method: "PUT", headers: ghHeaders(), body: JSON.stringify(body)
      }).then(function (res) {
        return res.json().then(function (j) {
          if (!res.ok) throw new Error("GitHub PUT " + res.status + " — " + (j.message || res.statusText));
          return j;
        });
      });
    });
  }

  function saveToGitHub(which) {
    if (!getToken()) { alert("GitHub 토큰을 먼저 입력하세요."); return; }
    var path = FILES[which];
    var text = which === "bib" ? STATE.bib : JSON.stringify(cleanFor(which), null, 2) + "\n";
    var msg = ($("#gh-msg") && $("#gh-msg").value) || ("Update " + path + " via admin");
    setBusy(true, "저장 중…");
    ghPut(path, b64(text), msg).then(function (j) {
      setBusy(false);
      STATE.dirty[which] = false;
      renderStatus();
      S.toast("커밋 완료: " + (j.commit && j.commit.sha || "").slice(0, 7));
    }).catch(function (e) {
      setBusy(false);
      alert("저장 실패\n\n" + e.message +
        "\n\n토큰 권한(Contents: Read and write)과 저장소 이름을 확인하세요.");
    });
  }

  function setBusy(on, label) {
    $$(".admin-bar button").forEach(function (b) { b.disabled = !!on; });
    var s = $("#busy");
    if (s) s.textContent = on ? (label || "…") : "";
  }

  /* ------------------------------------------------ helpers */
  function bi(v) {                       // normalise to {en, ko}
    if (v == null) return { en: "", ko: "" };
    if (typeof v === "string") return { en: v, ko: v };
    return { en: v.en || "", ko: v.ko || "" };
  }
  function clean(o) {                     // drop empty fields before saving
    if (Array.isArray(o)) return o.map(clean).filter(function (x) {
      return x != null && !(typeof x === "object" && !Object.keys(x).length);
    });
    if (o && typeof o === "object") {
      var out = {};
      Object.keys(o).forEach(function (k) {
        var v = clean(o[k]);
        if (v === "" || v == null) return;
        if (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) return;
        if (Array.isArray(v) && !v.length) return;
        out[k] = v;
      });
      return out;
    }
    return o;
  }

  function markDirty(which) {
    STATE.dirty[which] = true;
    renderStatus();
  }

  function renderStatus() {
    var n = Object.keys(STATE.dirty).filter(function (k) { return STATE.dirty[k]; });
    var s = $("#dirty");
    if (s) s.textContent = n.length ? "저장하지 않은 변경: " + n.join(", ") : "변경 없음";
  }

  function download(name, text, type) {
    var blob = new Blob([text], { type: (type || "text/plain") + ";charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = el("a", { href: url, download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ------------------------------------------------ PEOPLE tab */
  function renderPeople() {
    var box = $("#panel-people");
    box.innerHTML = "";
    var data = STATE.people;
    if (!data) { box.innerHTML = '<p class="muted">불러오는 중…</p>'; return; }

    (data.groups || []).forEach(function (g, gi) {
      var card = el("div", { class: "grp" });

      var head = el("div", { class: "grp__head" });
      head.innerHTML =
        '<strong style="font-size:var(--fs-sm)">그룹 ' + (gi + 1) + "</strong>" +
        '<input data-g="' + gi + '" data-f="title.en" placeholder="Group name (EN)" value="' +
          S.escape(bi(g.title).en) + '">' +
        '<input data-g="' + gi + '" data-f="title.ko" placeholder="그룹 이름 (KO)" value="' +
          S.escape(bi(g.title).ko) + '">' +
        '<select data-g="' + gi + '" data-f="layout" style="flex:0 0 auto">' +
          ["lead", "grid", "list"].map(function (o) {
            return '<option value="' + o + '"' + (g.layout === o ? " selected" : "") + ">" + o + "</option>";
          }).join("") +
        "</select>" +
        '<span class="muted" style="font-size:var(--fs-xs)">' + (g.people || []).length + "명</span>" +
        '<span style="flex:1"></span>' +
        '<button class="iconbtn" data-op="gup" data-g="' + gi + '" title="위로">↑</button>' +
        '<button class="iconbtn" data-op="gdown" data-g="' + gi + '" title="아래로">↓</button>' +
        '<button class="iconbtn iconbtn--danger" data-op="gdel" data-g="' + gi + '" title="그룹 삭제">✕</button>';
      card.appendChild(head);

      var body = el("div", { class: "grp__body" });
      (g.people || []).forEach(function (p, pi) {
        body.appendChild(personCard(g, gi, p, pi, data));
      });
      var addRow = el("div");
      addRow.innerHTML = '<button class="btn btn--sm" data-op="padd" data-g="' + gi + '">＋ 구성원 추가</button>';
      body.appendChild(addRow);
      card.appendChild(body);
      box.appendChild(card);
    });

    var foot = el("div", { style: "margin-top:1rem" });
    foot.innerHTML = '<button class="btn btn--sm" data-op="gadd">＋ 그룹 추가</button>';
    box.appendChild(foot);
  }

  function personCard(g, gi, p, pi, data) {
    var open = p.__open;
    var node = el("div", { class: "pcard" + (open ? " is-open" : "") });
    var name = typeof p.name === "string" ? p.name : bi(p.name).en;

    var thumb = p.photo
      ? '<img class="pcard__thumb" src="' + S.escape(p.photo) + '" alt="">'
      : '<div class="pcard__thumb">' + S.escape((name || "?").slice(0, 1).toUpperCase()) + "</div>";

    var ops =
      '<div class="pcard__ops">' +
        '<button class="iconbtn" data-op="pedit" data-g="' + gi + '" data-p="' + pi + '" title="편집">' +
          (open ? "▲" : "✎") + "</button>" +
        '<button class="iconbtn" data-op="pup" data-g="' + gi + '" data-p="' + pi + '" title="위로">↑</button>' +
        '<button class="iconbtn" data-op="pdown" data-g="' + gi + '" data-p="' + pi + '" title="아래로">↓</button>' +
        '<select class="iconbtn" style="width:auto;padding:0 .3rem" data-op="pmove" data-g="' + gi +
          '" data-p="' + pi + '" title="다른 그룹으로 이동">' +
          '<option value="">→</option>' +
          (data.groups || []).map(function (gg, ggi) {
            return ggi === gi ? "" :
              '<option value="' + ggi + '">' + S.escape(bi(gg.title).ko || bi(gg.title).en) + "</option>";
          }).join("") +
        "</select>" +
        '<button class="iconbtn iconbtn--danger" data-op="pdel" data-g="' + gi + '" data-p="' + pi +
          '" title="삭제">🗑</button>' +
      "</div>";

    if (!open) {
      node.innerHTML = thumb +
        '<div><div class="pcard__name">' + S.escape(name || "(이름 없음)") +
        (p.nameKo ? ' <span class="muted" style="font-weight:400">' + S.escape(p.nameKo) + "</span>" : "") +
        '</div><div class="pcard__role">' + S.escape(bi(p.role).ko || bi(p.role).en) + "</div></div>" +
        ops;
      return node;
    }

    node.innerHTML =
      '<div style="display:flex;gap:.85rem;align-items:center">' + thumb +
        '<div style="flex:1"><div class="pcard__name">' + S.escape(name || "(이름 없음)") + "</div></div>" +
        ops + "</div>" +
      '<div class="fields">' +
        f(gi, pi, "name", "Name (EN)", name) +
        f(gi, pi, "nameKo", "이름 (KO)", p.nameKo || "") +
        f(gi, pi, "role.en", "Role (EN)", bi(p.role).en) +
        f(gi, pi, "role.ko", "역할 (KO)", bi(p.role).ko) +
        f(gi, pi, "email", "Email", p.email || "") +
        f(gi, pi, "photo", "Photo path", p.photo || "", "assets/img/people/name.jpg") +
        ta(gi, pi, "interests.en", "Interests (EN)", bi(p.interests).en) +
        ta(gi, pi, "interests.ko", "관심 분야 (KO)", bi(p.interests).ko) +
        f(gi, pi, "hobby.en", "Hobby (EN)", bi(p.hobby).en) +
        f(gi, pi, "hobby.ko", "취미 (KO)", bi(p.hobby).ko) +
        f(gi, pi, "note.en", "Note (EN)", bi(p.note).en) +
        f(gi, pi, "note.ko", "비고 (KO)", bi(p.note).ko) +
        ta(gi, pi, "bio.en", "Bio (EN)", bi(p.bio).en) +
        ta(gi, pi, "bio.ko", "소개 (KO)", bi(p.bio).ko) +
        '<div class="field field--wide"><label>Links (한 줄에 <code>Label | URL</code>)</label>' +
          '<textarea data-g="' + gi + '" data-p="' + pi + '" data-f="links">' +
          S.escape((p.links || []).map(function (l) {
            return (l.label || "") + " | " + (l.url || "");
          }).join("\n")) + "</textarea></div>" +
        '<div class="field field--wide"><label>사진 업로드 (GitHub 토큰 필요 — assets/img/people/ 에 커밋됩니다)</label>' +
          '<input type="file" accept="image/*" data-op="pphoto" data-g="' + gi + '" data-p="' + pi + '"></div>' +
      "</div>";
    return node;

    function f(gi, pi, key, label, val, ph) {
      return '<div class="field"><label>' + label + "</label>" +
        '<input data-g="' + gi + '" data-p="' + pi + '" data-f="' + key + '" value="' +
        S.escape(val || "") + '" placeholder="' + S.escape(ph || "") + '"></div>';
    }
    function ta(gi, pi, key, label, val) {
      return '<div class="field field--wide"><label>' + label + "</label>" +
        '<textarea data-g="' + gi + '" data-p="' + pi + '" data-f="' + key + '">' +
        S.escape(val || "") + "</textarea></div>";
    }
  }

  function setField(obj, path, value) {
    var parts = path.split(".");
    if (parts.length === 1) { obj[parts[0]] = value; return; }
    if (typeof obj[parts[0]] === "string") obj[parts[0]] = { en: obj[parts[0]], ko: obj[parts[0]] };
    if (!obj[parts[0]] || typeof obj[parts[0]] !== "object") obj[parts[0]] = {};
    obj[parts[0]][parts[1]] = value;
  }

  function move(arr, i, d) {
    var j = i + d;
    if (j < 0 || j >= arr.length) return false;
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    return true;
  }

  /* ------------------------------------------------ NEWS tab */
  function renderNews() {
    var box = $("#panel-news");
    box.innerHTML = "";
    var items = STATE.news || [];
    items.forEach(function (it, i) {
      var card = el("div", { class: "grp" });
      card.innerHTML =
        '<div class="grp__head"><strong style="font-size:var(--fs-sm)">' + (i + 1) + "</strong>" +
          '<input data-n="' + i + '" data-f="date" placeholder="YYYY-MM-DD" value="' +
            S.escape(it.date || "") + '" style="max-width:9rem">' +
          '<input data-n="' + i + '" data-f="title.ko" placeholder="제목 (KO)" value="' +
            S.escape(bi(it.title).ko) + '">' +
          '<span style="flex:1"></span>' +
          '<button class="iconbtn" data-op="nup" data-n="' + i + '">↑</button>' +
          '<button class="iconbtn" data-op="ndown" data-n="' + i + '">↓</button>' +
          '<button class="iconbtn iconbtn--danger" data-op="ndel" data-n="' + i + '">🗑</button>' +
        "</div>" +
        '<div class="grp__body"><div class="fields">' +
          '<div class="field"><label>Title (EN)</label><input data-n="' + i +
            '" data-f="title.en" value="' + S.escape(bi(it.title).en) + '"></div>' +
          '<div class="field"><label>Link</label><input data-n="' + i +
            '" data-f="link" value="' + S.escape(it.link || "") + '"></div>' +
          '<div class="field field--wide"><label>Body (EN)</label><textarea data-n="' + i +
            '" data-f="text.en">' + S.escape(bi(it.text).en) + "</textarea></div>" +
          '<div class="field field--wide"><label>본문 (KO)</label><textarea data-n="' + i +
            '" data-f="text.ko">' + S.escape(bi(it.text).ko) + "</textarea></div>" +
          '<div class="field field--wide"><label>Image path</label><input data-n="' + i +
            '" data-f="image" value="' + S.escape(it.image || "") +
            '" placeholder="assets/img/photos/xxx.jpg"></div>' +
        "</div></div>";
      box.appendChild(card);
    });
    var foot = el("div", { style: "margin-top:1rem" });
    foot.innerHTML = '<button class="btn btn--sm" data-op="nadd">＋ 소식 추가</button>';
    box.appendChild(foot);
  }

  /* ------------------------------------------------ BIB tab */
  function renderBib() {
    var box = $("#panel-bib");
    var n = 0;
    try { n = (global.BibTeX.parse(STATE.bib) || []).length; } catch (e) { n = -1; }
    box.innerHTML =
      '<p class="admin-note" style="margin-bottom:.75rem">파싱된 논문 <strong>' +
        (n < 0 ? "오류" : n) + '</strong>편. 새 논문은 맨 위에 붙여 넣으면 됩니다.</p>' +
      '<textarea class="admin-json" id="bib-area" style="min-height:32rem"></textarea>';
    $("#bib-area").value = STATE.bib;
  }

  /* ------------------------------------------------ tabs */
  function showTab(name) {
    STATE.tab = name;
    $$(".admin-tabs button").forEach(function (b) {
      b.setAttribute("aria-selected", String(b.dataset.tab === name));
    });
    $$("[id^=panel-]").forEach(function (p) { p.hidden = p.id !== "panel-" + name; });
    $$("[data-panel]").forEach(function (b) { b.hidden = b.dataset.panel !== name; });
    if (name === "people") renderPeople();
    if (name === "news") renderNews();
    if (name === "bib") renderBib();
  }

  /* ------------------------------------------------ boot */
  function boot() {
    Promise.all([
      S.fetchJSON(FILES.people).catch(function () { return { groups: [] }; }),
      S.fetchJSON(FILES.news).catch(function () { return []; }),
      S.fetchText(FILES.bib).catch(function () { return ""; })
    ]).then(function (r) {
      STATE.people = r[0]; STATE.news = r[1]; STATE.bib = r[2];
      showTab("people");
      renderStatus();
    }).catch(function (e) { S.loadError($("#panel-people"), e); });

    var r = CFG.repo || {};
    if ($("#gh-owner")) $("#gh-owner").value = r.owner || "";
    if ($("#gh-repo")) $("#gh-repo").value = r.name || "";
    if ($("#gh-branch")) $("#gh-branch").value = r.branch || "main";
    if (getToken() && $("#gh-token")) $("#gh-token").value = getToken();

    document.addEventListener("click", onClick);
    document.addEventListener("input", onInput);
    document.addEventListener("change", onChange);
    window.addEventListener("beforeunload", function (e) {
      if (Object.keys(STATE.dirty).some(function (k) { return STATE.dirty[k]; })) {
        e.preventDefault(); e.returnValue = "";
      }
    });
  }

  function onClick(ev) {
    var t = ev.target.closest("[data-op],[data-tab],[data-save],[data-download],[data-copy]");
    if (!t) return;

    if (t.dataset.tab) { showTab(t.dataset.tab); return; }

    if (t.dataset.save) { saveToGitHub(t.dataset.save); return; }

    if (t.dataset.download) {
      var w = t.dataset.download;
      if (w === "bib") download("publications.bib", STATE.bib);
      else download(w === "people" ? "people.json" : "news.json",
        JSON.stringify(cleanFor(w), null, 2) + "\n", "application/json");
      return;
    }
    if (t.dataset.copy) {
      var k = t.dataset.copy;
      S.copy(k === "bib" ? STATE.bib : JSON.stringify(cleanFor(k), null, 2), "복사했습니다");
      return;
    }

    var op = t.dataset.op;
    var gi = +t.dataset.g, pi = +t.dataset.p, ni = +t.dataset.n;
    var groups = STATE.people && STATE.people.groups;

    if (op === "gadd") {
      groups.push({ id: "group" + (groups.length + 1),
        title: { en: "New group", ko: "새 그룹" }, layout: "grid", people: [] });
      markDirty("people"); renderPeople(); return;
    }
    if (op === "gdel") {
      if (!confirm("그룹 “" + (bi(groups[gi].title).ko || bi(groups[gi].title).en) +
          "” 과 그 안의 " + (groups[gi].people || []).length + "명을 모두 삭제할까요?")) return;
      groups.splice(gi, 1); markDirty("people"); renderPeople(); return;
    }
    if (op === "gup" || op === "gdown") {
      if (move(groups, gi, op === "gup" ? -1 : 1)) { markDirty("people"); renderPeople(); }
      return;
    }
    if (op === "padd") {
      groups[gi].people.push({ name: "", nameKo: "", role: { en: "", ko: "" }, __open: true });
      markDirty("people"); renderPeople(); return;
    }
    if (op === "pdel") {
      var p = groups[gi].people[pi];
      var nm = (typeof p.name === "string" ? p.name : bi(p.name).en) || p.nameKo || "이 구성원";
      if (!confirm(nm + " 을(를) 삭제할까요?")) return;
      groups[gi].people.splice(pi, 1); markDirty("people"); renderPeople(); return;
    }
    if (op === "pup" || op === "pdown") {
      if (move(groups[gi].people, pi, op === "pup" ? -1 : 1)) { markDirty("people"); renderPeople(); }
      return;
    }
    if (op === "pedit") {
      var per = groups[gi].people[pi];
      per.__open = !per.__open;
      renderPeople(); return;
    }
    if (op === "nadd") {
      STATE.news.unshift({ date: new Date().toISOString().slice(0, 10),
        title: { en: "", ko: "" }, text: { en: "", ko: "" } });
      markDirty("news"); renderNews(); return;
    }
    if (op === "ndel") {
      if (!confirm("이 소식을 삭제할까요?")) return;
      STATE.news.splice(ni, 1); markDirty("news"); renderNews(); return;
    }
    if (op === "nup" || op === "ndown") {
      if (move(STATE.news, ni, op === "nup" ? -1 : 1)) { markDirty("news"); renderNews(); }
      return;
    }
    if (t.id === "gh-forget") { clearToken(); $("#gh-token").value = ""; S.toast("토큰을 지웠습니다"); return; }
  }

  function onInput(ev) {
    var t = ev.target;

    if (t.id === "bib-area") { STATE.bib = t.value; markDirty("bib"); return; }
    if (t.id === "gh-token") { setToken(t.value.trim(), $("#gh-remember").checked); return; }

    if (t.dataset.g !== undefined && t.dataset.f) {
      var groups = STATE.people.groups;
      if (t.dataset.p === undefined) {                       // group-level field
        setField(groups[+t.dataset.g], t.dataset.f, t.value);
      } else {
        var p = groups[+t.dataset.g].people[+t.dataset.p];
        if (t.dataset.f === "links") {
          p.links = t.value.split("\n").map(function (line) {
            var m = line.split("|");
            return { label: (m[0] || "").trim(), url: (m[1] || "").trim() };
          }).filter(function (l) { return l.label || l.url; });
        } else {
          setField(p, t.dataset.f, t.value);
        }
      }
      markDirty("people");
      return;
    }

    if (t.dataset.n !== undefined && t.dataset.f) {
      setField(STATE.news[+t.dataset.n], t.dataset.f, t.value);
      markDirty("news");
    }
  }

  function onChange(ev) {
    var t = ev.target;
    if (t.dataset.op === "pmove" && t.value !== "") {
      var groups = STATE.people.groups;
      var from = +t.dataset.g, pi = +t.dataset.p, to = +t.value;
      var moved = groups[from].people.splice(pi, 1)[0];
      groups[to].people.push(moved);
      markDirty("people"); renderPeople(); return;
    }
    if (t.dataset.op === "pphoto" && t.files && t.files[0]) {
      uploadPhoto(t.files[0], +t.dataset.g, +t.dataset.p);
    }
    if ($("#gh-remember") && t === $("#gh-remember")) {
      setToken($("#gh-token").value.trim(), t.checked);
    }
  }

  function uploadPhoto(file, gi, pi) {
    if (!getToken()) {
      alert("사진을 자동 업로드하려면 GitHub 토큰이 필요합니다.\n" +
            "토큰 없이 하려면 파일을 assets/img/people/ 에 직접 넣고 경로만 적어 주세요.");
      return;
    }
    var safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    var path = "assets/img/people/" + safe;
    var reader = new FileReader();
    reader.onload = function () {
      var base64 = String(reader.result).split(",")[1];
      setBusy(true, "사진 업로드 중…");
      ghPut(path, base64, "Add photo " + safe + " via admin").then(function () {
        setBusy(false);
        setField(STATE.people.groups[gi].people[pi], "photo", path);
        markDirty("people"); renderPeople();
        S.toast("업로드 완료: " + path);
      }).catch(function (e) { setBusy(false); alert("업로드 실패\n\n" + e.message); });
    };
    reader.readAsDataURL(file);
  }

  function cleanFor(which) {
    if (which !== "people") return STATE[which];
    var copy = JSON.parse(JSON.stringify(STATE.people, function (k, v) {
      return k === "__open" ? undefined : v;
    }));
    return clean(copy);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);

# COMPASS Lab website

빌드 도구 없는 정적 사이트. HTML + CSS + 바닐라 JS만 씁니다. GitHub Pages에 그대로 올리면 동작합니다.

핵심 아이디어는 **콘텐츠와 화면의 분리**입니다.

| 콘텐츠 | 파일 | 어디에 나타나나 |
|---|---|---|
| 논문 | `data/publications.bib` | 논문 페이지 전체, 홈 최근 논문, 연구 주제별 목록 |
| 구성원 | `data/people.json` | 구성원 페이지 |
| 소식 | `data/news.json` | 홈·소식 페이지 |
| 활동 | `data/activities.json` | 활동 페이지 |
| 연구 주제, 연락처, 강의 | `assets/js/config.js` | 홈·연구·강의·연락처·푸터 |

같은 정보를 두 곳에 적을 일이 없습니다. 논문을 `.bib`에 한 번 추가하면 목록·필터·연구 주제 페이지가 모두 갱신됩니다.

---

## 1. 관리자 화면 (`admin.html`)

JSON을 직접 건드리지 않고 **구성원 추가·삭제·순서 변경**을 하려면 `admin.html`을 여세요.

```
https://eunlee-netsci.github.io/CompassLab/admin.html
```

- 구성원 탭 — 그룹(책임교수 / 대학원생 / 학부연구생 / 이전 구성원) 단위로 관리
  - `✎` 편집 · `↑ ↓` 순서 · `→` 다른 그룹으로 이동 · `🗑` 삭제(확인창)
  - `＋ 구성원 추가`, `＋ 그룹 추가`
  - 사진 업로드 → `assets/img/people/` 에 자동 커밋 (토큰 필요)
- 소식 탭 — 소식 추가·삭제·순서 변경
- 활동 탭 — 세미나·모임 추가·삭제·순서 변경
- 논문 탭 — `.bib` 전체를 편집, 파싱된 논문 수를 실시간 표시
- GitHub 연결 탭 — 토큰·저장소 설정

### 저장하는 두 가지 방법

**(a) 토큰 없이** — 하단 `people.json 내려받기` → 받은 파일을 리포지토리 `data/` 에 덮어쓰고 커밋.

**(b) GitHub에 바로 저장** — Fine-grained personal access token을 한 번 넣어두면
`GitHub에 저장` 버튼이 REST API로 직접 커밋합니다.

토큰 만드는 법: GitHub → Settings → Developer settings → Personal access tokens →
**Fine-grained tokens** → Repository access는 `CompassLab` 하나만 → Permissions →
Repository permissions → **Contents: Read and write** (그 외 권한 불필요).

> **보안.** `admin.html`은 GitHub Pages에 올라가면 누구나 열 수 있지만, 토큰 없이는 아무것도
> 저장되지 않습니다(편집 화면만 보임). 토큰은 브라우저에만 저장되고 GitHub API 외에는
> 어디로도 전송되지 않습니다. 기본은 세션 저장(탭 닫으면 소멸)이고, 체크박스를 켜야 브라우저에
> 남습니다. 그래도 마음에 걸리면 `admin.html`과 `assets/js/admin.js`를 커밋하지 말고
> 로컬에서만 실행하세요 — 기능은 동일합니다.

---

## 2. 논문 추가하기

`data/publications.bib` 맨 위에 항목을 붙여넣고 커밋하면 끝입니다.

```bibtex
@article{lee2026newpaper,
  author   = {Lee, Eun and Someone, Else},
  title    = {A title with {BibTeX} case protection},
  journal  = {Nature Human Behaviour},
  volume   = {10},
  pages    = {1--12},
  year     = {2026},
  doi      = {10.1038/xxxxx},
  keywords = {Perception Bias, Network Science},
  selected = {true},
  code     = {https://github.com/…},
  abstract = {…}
}
```

Zotero / Mendeley / Google Scholar에서 내보낸 `.bib`를 통째로 덮어써도 됩니다.

### 추가로 이해하는 필드 (전부 선택)

| 필드 | 효과 |
|---|---|
| `keywords = {Perception Bias, Network Science}` | 주제 필터 칩 + `#태그` + **연구 페이지의 주제별 목록** |
| `selected = {true}` | `Selected` 배지, 홈 화면 상단 고정 |
| `arxiv = {2501.01234}` | arXiv 버튼 |
| `pdf`, `code`, `data`, `slides`, `video`, `press` | 각각 버튼 하나 |
| `award = {Best Paper}` | 강조 배지 |
| `abstract = {…}` | 펼쳐보기 버튼 |
| `note = {In preparation}` | 저널이 없을 때 그 자리에 표시 |

`keywords` 값은 `assets/js/config.js`의 `themes[].tag`와 맞춰 주세요. 그래야 연구 페이지의
해당 주제 아래에 자동으로 들어갑니다.

### 유형(Type) 분류 규칙

`@article` → journal · `@inproceedings`/`@conference` → conference ·
`@incollection`/`@inbook` → chapter · `@book` → book ·
`@phdthesis`/`@mastersthesis` → thesis · `@misc`/`@unpublished`/`@techreport` → preprint

`journal` 값에 `arXiv`, `preprint`, `bioRxiv`, `SSRN` 등이 있으면 `@article`이라도 preprint로 봅니다.

### 논문 페이지 기능

- 제목·저자·저널·초록·키워드 통합 검색 (`/` 로 검색창 이동, `Esc` 로 초기화)
- 유형·주제 필터, 대표 논문만 보기, 최신순/오래된순
- 필터 상태가 URL에 남아 링크 공유 가능 — 예: `publications.html?tag=perception%20bias`
- 항목별 BibTeX 복사, 필터된 목록 전체 복사, `.bib` 내려받기
- 저자 이름 자동 굵게 — 현재 `Eun Lee`만 (`config.js`의 `labAuthors`)
  - 성 + **이름 전체**가 같아야 굵어집니다. 구성원을 더 넣고 싶으면 배열에 추가하세요.
  - `.bib`에 이름이 약자로 적힌 경우(`Lee, E.`)에만 첫 글자 매칭을 허용합니다.
  - 성만 적으면(`"Lee"`) 그 성을 가진 모든 저자가 굵어집니다.

---

## 3. 나머지 콘텐츠

| 무엇을 | 어디서 |
|---|---|
| 이메일·전화·Scholar/LinkedIn/GitHub·주소·지도 | `assets/js/config.js` → `contact`, `address` |
| 연구 주제(제목·설명·연결 키워드) | `assets/js/config.js` → `themes` |
| 강의 과목 | `assets/js/config.js` → `teaching` |
| 구성원 | `data/people.json` 또는 `admin.html` |
| 인물 초상 | `assets/img/people/*.png` — `tools/sketchify.py`로 생성 |
| 소식 | `data/news.json` 또는 `admin.html` |
| 활동(세미나·모임) | `data/activities.json` 또는 `admin.html` |
| 홈 문구, 모집 안내 | `index.html`, `contact.html` 직접 수정 |
| 색·글꼴·여백 | `assets/css/site.css` 최상단 `:root` 변수 |

### 한/영 토글

두 방식을 섞어 씁니다.

```html
<!-- 1. 짧은 UI 문자열: 사전 조회 (assets/js/i18n.js) -->
<a data-i18n="nav.research">Research</a>

<!-- 2. 긴 문장: 두 벌을 HTML에 그대로 -->
<p data-lang="en">We study …</p>
<p data-lang="ko" hidden>우리는 …</p>
```

`data/*.json`과 `config.js`에서는 `{"en": "…", "ko": "…"}` 형태를 쓰면 됩니다.
`?lang=ko` 로 강제할 수 있고, 선택한 언어는 브라우저에 기억됩니다.

### assets/ 를 고쳤을 때 — 캐시 토큰 갱신

GitHub Pages가 CSS/JS에 캐시 헤더를 붙이기 때문에, 파일을 고쳐도 브라우저가 옛 파일을
계속 쓸 수 있습니다. 커밋 전에 한 줄 실행하면 모든 HTML의 `?v=` 토큰이 갱신되어
브라우저가 무조건 새로 받아옵니다.

```bash
python3 tools/bump_cache.py
```

`data/*.json`과 `.bib`는 매번 새로 읽으므로 이 작업이 필요 없습니다.

### 메뉴를 바꿀 때

헤더·푸터는 빌드 단계가 없으므로 각 HTML 파일에 그대로 들어 있습니다.
`index.html`에서 한 번 고친 뒤

```bash
python3 tools/sync_shell.py
```

를 실행하면 나머지 페이지에 그대로 복사됩니다.

---

## 4. 로컬에서 보기

`.bib`/`.json`을 `fetch()`로 읽기 때문에 **파일을 더블클릭해 여는 방식(`file://`)으로는
목록이 비어 보입니다.** 간단한 서버를 띄우세요.

```bash
cd CompassLab
python3 -m http.server 8000
# → http://localhost:8000
```

(또는 `npx serve`, VS Code Live Server)

---

## 5. GitHub Pages 배포

1. 이 폴더 내용을 리포지토리 루트에 넣고 push
2. Settings → Pages → Source: `Deploy from a branch`, Branch: `main` / `(root)`
3. 몇 분 뒤 `https://eunlee-netsci.github.io/CompassLab/`

`.nojekyll`이 있어 Jekyll 처리를 건너뜁니다(밑줄 시작 파일명이 무시되는 문제 방지).
커스텀 도메인은 루트에 `CNAME` 파일을 만들고 도메인 한 줄만 적으면 됩니다.

---

## 6. 파일 구조

```
.
├── index.html            홈
├── research.html         연구 주제 (주제별 논문 자동 나열)
├── publications.html     논문 (검색·필터)
├── people.html           구성원
├── teaching.html         강의
├── activities.html       활동 (세미나·모임)
├── news.html             소식
├── contact.html          연락처 + 모집
├── admin.html            ← 관리자 편집 화면
├── 404.html
├── assets/
│   ├── css/site.css      디자인 토큰 + 전체 스타일
│   ├── js/config.js      ← 연구실 설정은 여기 한 곳
│   ├── js/i18n.js        한/영 토글
│   ├── js/site.js        공통 동작 (내비, 토스트, 로딩)
│   ├── js/bibtex.js      BibTeX 파서 (의존성 없음)
│   ├── js/publications.js 논문 렌더링·검색·필터
│   ├── js/content.js     people/news/themes/teaching 렌더링
│   ├── js/admin.js       관리자 화면 로직
│   └── img/              히어로 그림, 인물 사진, 사진
├── data/
│   ├── publications.bib  ← 논문
│   ├── activities.json   ← 활동
│   ├── people.json       ← 구성원
│   └── news.json         ← 소식
└── tools/
    ├── sync_shell.py     헤더·푸터 일괄 반영
    ├── bump_cache.py     ?v= 캐시 토큰 갱신
    ├── make_hero_svg.py  히어로 네트워크 그림 재생성
    └── build_bib.py      (기록용) 기존 사이트에서 .bib를 만든 스크립트
```

---

## 7. 알아둘 점

- 논문·구성원 목록이 JS로 그려지므로 검색엔진 색인은 정적 HTML보다 약간 불리합니다. 구글은
  JS를 실행해 색인하지만, 색인이 중요해지면 나중에 `.bib` → HTML을 만드는 GitHub Actions
  한 단계를 추가하면 됩니다.
- 다크 모드는 OS 설정을 따릅니다(`prefers-color-scheme`).
- 인쇄 스타일이 있어 논문 페이지를 그대로 인쇄하면 목록만 깔끔하게 나옵니다.
- 외부 의존성은 Pretendard 웹폰트 CDN 하나뿐입니다. 오프라인/폐쇄망이면 각 HTML의
  해당 `<link>` 한 줄만 지우면 시스템 글꼴로 대체됩니다.
- 인물 초상은 실사 사진이 아니라 **선화(line-art) 초상**입니다. 배경을 지우고, 얼굴을 기준으로
  정사각형으로 자른 뒤, 색번짐(color-dodge) 연필 스케치를 입히고, 기존 PI 초상과 같은 농도로
  톤을 맞춘 600×600 투명 PNG입니다. 흰 배경이 투명해서 밝은/어두운 배경 어디에나 얹히고,
  다크 모드에서는 CSS가 반전시켜 흰 선으로 보입니다.
- 새 구성원이 오면: 사진을 `photos-original/`에 넣고 `tools/sketchify.py`의 `JOBS`에 한 줄 추가한 뒤
  `python3 tools/sketchify.py <이름>` — 나머지(배경 제거·크롭·톤 매칭)는 자동입니다.
  필요한 패키지: `pip install rembg onnxruntime opencv-python-headless pillow numpy`

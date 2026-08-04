# 배포 방법

기존 리포 `eunlee-netsci/CompassLab`의 내용을 이 사이트로 교체합니다.
GitHub Pages 설정은 이미 켜져 있으므로 **push만 하면** 몇 분 뒤 반영됩니다.

---

## 0. 먼저 로컬에서 눈으로 확인

```bash
cd compass-lab-site
python3 -m http.server 8000
# → http://localhost:8000  (파일 더블클릭으로는 목록이 비어 보입니다)
```

논문 23편, 구성원 9명, 한/영 토글이 정상인지 확인한 뒤 아래로 넘어가세요.

---

## 1. 안전장치 — 기존 사이트를 브랜치로 보존

```bash
cd ~/경로/CompassLab          # 기존 리포
git checkout main
git pull
git checkout -b old-site      # 지금 상태를 통째로 저장
git push -u origin old-site
git checkout main
```

되돌리고 싶으면 나중에 `git checkout old-site -- .` 한 줄이면 됩니다.

---

## 2. 옛 파일 정리

새 사이트는 `assets/`, `data/`, `tools/`를 쓰므로 예전 폴더는 지워야 합니다.
안 지우면 `css/`, `js/`, `thumbs/`가 그대로 남아 리포만 지저분해집니다.

```bash
git rm -r --quiet css js img thumbs images
git rm --quiet index.html research.html publications.html news.html teaching.html contact.html team.html
git rm -r --quiet publications
```

`LICENSE`는 그대로 두세요.

---

## 3. 새 파일 복사

```bash
cp -R ~/Downloads/compass-lab-site/. .
```

끝에 `/.` 을 꼭 붙이세요. `.nojekyll` 같은 숨김 파일까지 복사됩니다.

복사되는 것: `index.html` `research.html` `publications.html` `people.html`
`teaching.html` `news.html` `contact.html` `admin.html` `404.html` `team.html`(리다이렉트)
`publications/`(리다이렉트 20개) `assets/` `data/` `tools/` `.nojekyll` `README.md` `DEPLOY.md`

---

## 4. 커밋 & 푸시

```bash
git add -A
git status          # 지워진 것/추가된 것 눈으로 확인
git commit -m "Redesign site: BibTeX-driven publications, KR/EN toggle, admin editor"
git push
```

2~5분 뒤 <https://eunlee-netsci.github.io/CompassLab/> 에 반영됩니다.
안 바뀌면 브라우저 강력 새로고침(⌘⇧R).

---

## 5. 배포 후 확인 목록

- [ ] `/` 홈 — 연구 주제 카드에 논문 편수가 찍히는지
- [ ] `/publications.html` — 23편, 검색·필터 동작
- [ ] `/people.html` — 초상 9명
- [ ] `/team.html` — 자동으로 `/people.html` 로 넘어가는지 (옛 링크 보존)
- [ ] `/admin.html` — 구성원 목록이 뜨는지
- [ ] 휴대폰에서 한 번

---

## 기존 URL은 어떻게 되나

| 옛 주소 | 지금 |
|---|---|
| `/index.html` `/research.html` `/publications.html` `/news.html` `/teaching.html` `/contact.html` | 그대로 (내용만 새로) |
| `/team.html` | → `/people.html` 자동 이동 |
| `/publications/<논문>.html` (20개) | → `/publications.html` 자동 이동 |

구글 검색결과나 다른 사이트에 걸린 링크가 깨지지 않습니다.

---

## admin.html 을 공개하기 싫다면

토큰 없이는 아무것도 저장되지 않으므로 그대로 올려도 위험하지 않지만,
편집 화면 자체를 감추고 싶으면 3~4단계 사이에 이렇게 하세요.

```bash
echo -e "admin.html\nassets/js/admin.js" >> .gitignore
git rm --cached admin.html assets/js/admin.js
```

그러면 로컬(`python3 -m http.server`)에서만 열립니다. 기능은 동일합니다.

---

## 되돌리기

```bash
git revert HEAD          # 방금 커밋만 취소
# 또는 통째로
git checkout old-site -- .
git commit -m "Roll back to the previous site"
git push
```

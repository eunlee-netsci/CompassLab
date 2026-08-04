/* ============================================================
   config.js — the one file to edit for lab-wide settings.
   ============================================================ */
window.SITE = {
  /* Where the publication list comes from. Keep a single .bib. */
  bibPath: "data/publications.bib",

  /* Surnames rendered in bold in every author list.
     Add every current and former lab member. */
  labAuthors: [
    "Eun Lee",
    "Chihyun Park", "Jin Gyeong Won",
    "Jiyu Park", "Sunmin Lim", "Yoona Jang", "Sangheon Park", "Jaewon Lee",
    "Hyeonmin Roh", "Eun Seo Lee"
  ],

  /* Author name style in publication lists: "full" or "initials" */
  authorStyle: "full",

  /* Collapse author lists longer than this to "et al." (0 = never) */
  authorMax: 12,

  /* Topic chips on the publications page.
     "auto" derives them from the keywords used in publications.bib. */
  topics: "auto",

  /* Publication types offered as filter chips, in order. */
  types: ["journal", "conference", "chapter", "preprint", "book", "thesis"],

  /* Research themes. `tag` must match a keyword used in publications.bib —
     each theme then lists its own papers automatically. */
  themes: [
    { tag: "Network Science", en: "Network Science", ko: "네트워크 과학",
      descEn: "Structure, dynamics and temporal resolution of networks — dependency, reachability, contagion and the geometry of mobile agents.",
      descKo: "네트워크의 구조·동역학·시간 해상도. 의존성, 도달성, 사회적 전염, 이동하는 개체들의 연결 구조를 다룹니다." },
    { tag: "Perception Bias", en: "Perception Bias", ko: "인식 편향",
      descEn: "What a node can observe is not what the network is. How homophily and minority size set the direction and size of the error.",
      descKo: "노드가 관측하는 것은 네트워크의 실제 모습이 아닙니다. 동종선호와 소수집단 크기가 오차의 방향과 크기를 어떻게 정하는지 봅니다." },
    { tag: "Science of Science", en: "Science of Science", ko: "과학의 과학",
      descEn: "Faculty hiring networks, prestige hierarchies, and how academic careers are constrained by structure.",
      descKo: "교수 채용 네트워크, 명성 위계, 그리고 학계 경력이 구조에 의해 제약되는 방식." },
    { tag: "Friendship Paradox", en: "Friendship Paradox", ko: "친구 관계 역설",
      descEn: "Why your friends have more friends than you do — generalized to arbitrary attributes and correlated, clustered networks.",
      descKo: "내 친구가 나보다 친구가 많은 이유. 임의의 속성과 상관·군집 네트워크로 일반화합니다." },
    { tag: "Social Systems", en: "Social Systems", ko: "사회 시스템",
      descEn: "Collaboration, dissent and gender imbalance in real social systems, from ballet to online discourse.",
      descKo: "발레 협업망부터 온라인 담론까지, 실제 사회 시스템의 협업·이견·성별 불균형." },
    { tag: "Health Information", en: "Health Information", ko: "건강 정보",
      descEn: "Online social connection and health communication, with a focus on underserved student populations.",
      descKo: "온라인 사회적 연결과 건강 커뮤니케이션. 소외된 학생 집단에 초점을 둡니다." },
    { tag: "Algorithm", en: "Algorithm", ko: "알고리즘",
      descEn: "Link prediction under realistic missing-data patterns, and stacking methods for temporal networks.",
      descKo: "현실적인 결측 패턴에서의 링크 예측, 그리고 시간 네트워크를 위한 스태킹 기법." },
    { tag: "Brain Network", en: "Brain Network", ko: "뇌 네트워크",
      descEn: "Entropy-based estimation of directionality in brain connectivity data.",
      descKo: "엔트로피 기반 뇌 연결성 방향성 추정." },
    { tag: "Climate System", en: "Climate System", ko: "기후 시스템",
      descEn: "Network approaches to regional interactions in sea surface temperature.",
      descKo: "해수면 온도의 지역 간 상호작용에 대한 네트워크 접근." }
  ],

  /* Contact + external profiles (used in header, footer, contact page) */
  contact: {
    email: "eunlee@pknu.ac.kr",
    phone: "(+82) 51-629-4515",
    ext: "4515",
    scholar: "https://scholar.google.com/citations?user=kXggWVUAAAAJ",
    linkedin: "https://www.linkedin.com/in/eun-lee-8956aa53/",
    github: "https://github.com/eunlee-netsci",
    repo: "https://github.com/eunlee-netsci/CompassLab",
    map: "https://map.naver.com/p/search/부경대학교%20자연과학2관"
  },

  address: {
    en: "COMPASS Lab · Dept. of Scientific Computing, Pukyong National University\nC24 room 7413, Yongso-ro 45, Nam-gu, Busan 48513, Republic of Korea",
    ko: "COMPASS 연구실 · 부경대학교 과학컴퓨팅학과\n부산광역시 남구 용소로 45 자연과학2관(C24) 7413호 (48513)"
  },

  /* Courses shown on the Teaching page */
  teaching: {
    spring: [
      { en: "Basic Programming I", ko: "기초 프로그래밍 I" },
      { en: "Discrete Mathematics I", ko: "이산수학 I" }
    ],
    fall: [
      { en: "Basic Programming II", ko: "기초 프로그래밍 II" },
      { en: "Discrete Mathematics II", ko: "이산수학 II" }
    ]
  },

  /* Used by admin.html when saving straight to GitHub */
  repo: { owner: "eunlee-netsci", name: "CompassLab", branch: "main" }
};

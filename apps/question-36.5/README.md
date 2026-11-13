# question-36.5

이용호(호몽) 장편소설 『질문의 온도 36.5도』의 인터랙티브 북 사이트.

- 공개 주소: https://homong-app.com/question-36.5/
- HTML/CSS/JavaScript 기반 정적 사이트. 빌드와 서버 환경변수가 필요하지 않습니다.
- 18초, 1280×720, 24fps, H.264 무음 모션 필름. 한국어 VTT 자막과 재생 컨트롤 제공.
- 키보드로 조작하는 주제 탭, 질문 온도 슬라이더, 질문 전환·복사, 모션 줄이기 지원.
- 실제 책 제목과 저자·ISBN·서지 정보를 HTML 및 Book JSON-LD에 포함.
- 서점 링크 순서: 교보문고 → 예스24 → 알라딘 → 영풍문고.

## 소스와 이미지

소개 문구·서지·서점 링크는 사용자가 제공한 `book-intro-365.html`을 기준으로 작성했습니다.
책 표지는 예스24 상품 199841152의 표지 이미지를 사용했고, 저자 사진은 기존 아카이브의 `profile-lee-yongho.jpg`입니다. 표지·초상·책 소개의 권리는 각 권리자에게 있습니다.
폰트: Google Fonts Noto Sans KR / Noto Serif KR, 로드 실패 시 기기 기본 글꼴로 표시.
온도 체험 문구와 모션 필름 문구는 책의 주제를 바탕으로 제작한 소개 콘텐츠이며 소설 본문의 인용문이 아닙니다.

## 미리보기와 영상 재생성

이 디렉터리에서 `python -m http.server 8080`을 실행하고 브라우저로 확인합니다.
영상 재생성: Pillow와 FFmpeg, Noto CJK 글꼴을 설치한 Linux에서 `python scripts/render_film.py`.

## 배포

Vercel 프로젝트 `question-36.5`의 Root Directory는 `apps/question-36.5`입니다. Framework는 Other, Build/Install/Output 설정은 기본값입니다.
메인 아카이브에서는 `vercel.json`의 페이지 및 assets 재작성 경로로 동일 파일을 제공합니다.

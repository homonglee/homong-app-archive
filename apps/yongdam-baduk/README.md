# 용담바둑 v2.0.1

한국어 반응형 오프라인 바둑 PWA. 상위3단계에 실제 KataGo 신경망+B6/B10학습 모델과 MCTS 탐색을 탑재했습니다. 9/13/19줄, 접바둑, 착수 확인, 패스, 무르기, 도움 한 수, 중국식 면적 계가(사석 직접 표시), 자동 저장, 최근30국, 복기, SGF 내려받기.

## 버전 / 사용자 지침
기능 업데이트마다 package.json 버전을 올리고 헤더·사용 설명서·변경 이력·오프라인 캐시를 함께 갱신합니다. AGENTS.md가 지속 지침입니다. 헤더 오른쪽 사용 설명서: dist/manual.html. 대국 상대 이름은 용담입니다.

## 실행 및 빌드
정적 배포 dist/. 런타임 외부 서버/API키/원격 AI 없음. HTTPS 또는 localhost 필요.

```
npm ci
npm run build
npm test
```

npm run build:neural은 보관된 TypeScript 소스를 minified worker로 번들합니다. scripts/build-shell.mjs는 package.json 버전으로 변경된 앱 자산 파일명을 만들고 모든 배포 자산을 서비스 워커 캐시에 등록합니다. check:release가 헤더·설명서·캐시·버전·명칭·파비콘·OG 크기의 일치를 검사합니다.

## 엔진 / 규칙
0–3단계는 가벼운 기존 휴리스틱 연습. 4단계 B6/32탐색/2.2초, 5단계 B6/96탐색/5.5초, 6단계 B10/256탐색/12초 목표. 탐색 횟수와 시간 중 먼저 제한에 도달하면 반환하며, 모델 초기 로드·초기 추론은 별도 시간이 필요합니다. 모바일 호환을 위해 WASM을 우선 사용하고 JS CPU에서도 같은 신경망 모델로 동작합니다. 실패시 약한 엔진으로 몰래 대체하지 않습니다.

공인급수/Elo를 검증하지 않았습니다. 최강 표시를 1–3급이라고 단정하지 않습니다.

자충수 금지, 동형반복(위치적 초패) 금지, 두 번 연속 패스로 계가. 중국식 면적: 살아있는 돌+둘러싼 빈자리+백덤; 잡은돌 별도 가산 없음. 접바둑 추가 보너스 없음, 기본덤0.5. 호선 기본6.5. 사석은 사용자가 확인.

## 검증
규칙14개, 오프라인자산9개, neural adapter3개, 실제 신경망 회귀7개를 검사합니다. 보드사이즈9/13/19, 접바둑, 패/합법수, 덤, 착수이력, 축/따내기 회귀 포함.

실제 B10 WASM으로 기존 최고단계와9줄 흑백교대2국(24탐색/1초) 대결: 신경망 흑61.5집, 백54.5집 승. tests/strength-results.json에 관측값과 한계. 이는 개선근거이며 급수 보증은 아닙니다. 재실행: node tests/strength-match.mjs.

원본 초기버전은 브라우저에서 서버정지 후 다시 열고 AI응수까지 검증했으며 강화판 역시 배포전 UI와 새 모델의 오프라인 대국을 점검합니다.

## 출처 및 라이선스
Web KatRain MIT 신경망/탐색 소스, KataGo 공식 학습 모델, TensorFlow.js Apache2, pako MIT. dist/neural/NOTICE.txt 및 해당 LICENSE 문서/모델 SHA256 참조. 모델 원본과 SHA256 일치 확인.

OG 이미지는 내장 이미지 생성으로 제작한 1200×630 원본 디자인: 아이보리·딥그린, 용담바둑·한 수에 마음을 담다, 목재 바둑판과 흑백돌. 파비콘 SVG/PNG/ICO 포함.

### v2.0.1
Sites의 index.html→루트 및 manual.html→manual 정규화 리다이렉트를 검증한 뒤 캐시에 저장합니다. 원치 않는 로그인/외부 리다이렉트는 거부하고, 확장자 없는 설명서 주소도 오프라인 캐시에 연결합니다.


## v2.1.0
- Default large reading mode, persistent junior option.
- Local KataGo review, score-loss estimates, validated PV playback and mistake quizzes. No external LLM or server required. Existing vendored Web KaTrain neural runtime and installed TensorFlow.js dependencies are reused; no OpenClaw/Python runtime is added to the PWA.
- Reports cached per exact game signature; original game state remains untouched.


## v2.2.0 — human-rank practice
- 18 kyu through 1 kyu, shodan through 9 dan; exact `rank_*` profiles of KataGo Human SL humanv0. Korean server ranks and professional ranks are not certified equivalents.
- Official 99,066,230-byte human model sharded into 16 MiB static parts, concatenated in worker; SHA256/size recorded in human-model.json. Offline first setup ~120 MB.
- Legal moves sampled from human policy probabilities; strong analysis retained for pass judgement and review. No silent fallback if the human model fails.
- 18k/1k/1d/5d/9d real WASM profile inference tested with differing distributions. CPU test opening inference 1.4–5.1 seconds; mobile devices may be slower.

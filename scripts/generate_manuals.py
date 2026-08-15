import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APPS = {a['slug']: a for a in json.loads((ROOT / 'apps_static.json').read_text(encoding='utf-8'))['apps']}

MANUALS = {
'youtube-timeline-summarizer': {
 'purpose':'YouTube 영상 링크를 분석해 핵심 요약과 주제별 타임라인을 만들고 복사하거나 Markdown으로 저장합니다.',
 'steps':['YouTube 링크 입력란에 분석할 영상 주소를 붙여넣습니다.','3줄·5줄·회의록 중 원하는 요약 밀도를 선택합니다.','핵심성 기준과 관심 주제 필터를 필요에 맞게 조절합니다.','분석 실행을 누르고 영상 요약 결과와 타임라인이 나타날 때까지 기다립니다.','타임라인 검색으로 필요한 주제를 찾고 요약 복사 또는 MD 내보내기를 사용합니다.'],
 'output':'영상 핵심 요약, 주제별 타임스탬프·챕터, 복사용 텍스트와 Markdown 파일',
 'cautions':['공개적으로 접근 가능한 정상적인 YouTube 영상 URL을 사용하세요.','영상 길이와 자막 상태에 따라 분석 시간과 결과 품질이 달라질 수 있습니다.']},
'got-interactive-light': {
 'purpose':'왕좌의 게임 시즌별 줄거리, 등장인물과 가문·동맹·적대 관계를 탐색합니다.',
 'steps':['상단에서 확인할 시즌을 선택합니다.','시즌 요약에서 핵심 흐름을 읽거나 요약 복사를 누릅니다.','등장인물 탭에서 이름을 검색하고 인물 카드를 선택합니다.','관계도 이미지에서 전체 관계 또는 가족·동맹·적대 등 관계 유형을 고릅니다.','필요하면 PNG 저장으로 현재 관계도를 보관합니다.'],
 'output':'선택 시즌의 핵심 줄거리, 등장인물 정보와 필터링된 관계도 이미지',
 'cautions':['작품의 주요 사건과 결말에 관한 스포일러가 포함될 수 있습니다.','시즌을 바꾸면 인물과 관계도 내용도 함께 바뀌는지 확인하세요.']},
'schedule-share-link-generator': {
 'purpose':'Google Calendar의 바쁜 시간을 제외한 미팅 후보를 계산하고 공유 링크를 만듭니다.',
 'steps':['연결 가이드를 읽고 Google Calendar 연결을 진행합니다.','미팅 목적, 조회 기간, 소요 시간, 업무 시간과 일정 전후 버퍼를 설정합니다.','실제 가능 시간 계산을 눌러 후보 시간을 불러옵니다.','추천 후보 또는 직접 공유할 시간을 선택하고 공유 문구를 복사합니다.','원하는 주소 이름을 확인한 뒤 공개 링크 생성을 누릅니다.'],
 'output':'캘린더 일정과 조건을 반영한 가능 시간 후보, 공유 문구와 공개 일정 링크',
 'cautions':['Google Calendar 연결 전에는 데모 흐름만 제공될 수 있습니다.','공유 전에 타임존과 선택한 가능 시간이 실제 일정과 맞는지 확인하세요.']},
'coffee-chat-icebreaker': {
 'purpose':'커피챗 상대와 목적에 맞는 첫 질문, 꼬리질문과 5분 대화 아젠다를 추천합니다.',
 'steps':['상대방의 직무, 산업군과 경력 수준을 선택합니다.','커피챗 목적과 원하는 대화 톤을 정합니다.','AI·팀 문화 등 넣고 싶은 키워드와 질문 스타일을 입력합니다.','추천 조합 만들기 또는 질문 추천 업데이트를 누릅니다.','첫 5분 흐름과 질문·주제·꼬리질문을 살펴보고 아젠다를 복사합니다.'],
 'output':'맞춤형 첫 질문, 꼬리질문, 대화 주제와 5분 커피챗 아젠다',
 'cautions':['추천 문구는 상대방의 실제 배경에 맞게 자연스럽게 수정하세요.','개인정보나 민감한 질문은 상대방의 동의 없이 사용하지 마세요.']},
'60sec-speech-timer': {
 'purpose':'키워드를 바탕으로 60초 발표문을 만들고 타이머와 문장 진행 표시로 연습합니다.',
 'steps':['발표 핵심 키워드를 쉼표로 구분해 입력합니다.','발표 상황, 톤, 청중, 마무리 요청과 한 문장 목표를 설정합니다.','필요하면 분당 글자 수 기준의 발표 속도를 조절합니다.','60초 스크립트 생성을 눌러 발표문을 만듭니다.','연습 시작을 누르고 타이머와 하이라이트에 맞춰 말한 뒤 복사로 보관합니다.'],
 'output':'상황별 60초 피치 스크립트와 발표 연습용 타이머·진행 표시',
 'cautions':['생성된 시간은 설정한 발표 속도에 따른 추정치입니다.','이름·수치·회사 정보는 발표 전에 사실 여부를 직접 검토하세요.']},
'clipboard-pin-board': {
 'purpose':'자주 사용하는 업무 문구와 회사 정보를 카드로 저장해 검색하고 빠르게 복사합니다.',
 'steps':['새 항목 등록을 누르고 제목, 카테고리, 복사할 내용과 태그를 입력합니다.','저장하기를 눌러 클립 카드를 추가합니다.','검색창이나 카테고리로 필요한 카드를 찾습니다.','카드의 복사 기능을 사용하고 최근 복사 기록을 확인합니다.','고정 우선·최근 복사순·이름순으로 정렬하거나 입력 비우기로 작성란을 초기화합니다.'],
 'output':'카테고리와 태그가 지정된 재사용 문구 카드 및 최근 복사 기록',
 'cautions':['계좌번호 등 민감정보를 공용 PC에 저장하지 마세요.','브라우저 데이터 삭제 또는 다른 기기 사용 시 저장 항목이 유지되지 않을 수 있습니다.']},
'batch-renamer-dropzone': {
 'purpose':'여러 파일의 새 이름을 날짜·프로젝트명·일련번호 규칙으로 미리 계산합니다.',
 'steps':['파일을 드롭존에 놓거나 파일 선택으로 불러옵니다.','날짜 표기, 프로젝트명, 시작 번호와 번호 자릿수를 설정합니다.','파일명 또는 확장자 기준 정렬과 확장자 유지·소문자 옵션을 선택합니다.','변경 미리보기에서 원본명과 새 이름을 확인하고 검색으로 오류를 찾습니다.','CSV 내보내기 또는 목록 복사로 변경 계획을 저장합니다.'],
 'output':'원본 파일명과 예정 파일명을 비교한 미리보기 및 CSV 변경 계획',
 'cautions':['이 앱은 변경 계획을 만들며 브라우저 보안상 원본 파일을 직접 일괄 변경하지 않을 수 있습니다.','같은 새 이름이 중복되거나 확장자가 잘못 바뀌지 않는지 확인하세요.']},
'ocr-translator-app': {
 'purpose':'스크린샷이나 이미지의 글자를 OCR로 추출하고 선택한 언어로 번역합니다.',
 'steps':['이미지 업로드 영역에서 스크린샷 파일을 선택합니다.','OCR 인식 언어와 번역할 대상 언어를 선택합니다.','OCR 추출 및 번역 시작을 누릅니다.','추출 텍스트와 번역 결과를 비교하고 필요한 내용을 복사합니다.','새 작업은 초기화를 눌러 이미지와 결과를 지운 후 시작합니다.'],
 'output':'이미지에서 추출된 원문 텍스트와 선택 언어의 번역 결과',
 'cautions':['작거나 흐린 글자, 손글씨와 복잡한 배경은 오인식될 수 있습니다.','개인정보가 포함된 이미지는 외부 번역 처리 가능성을 고려해 업로드하세요.']},
'messenger-summary-tool': {
 'purpose':'메신저 대화를 참여자·핵심 요약·결정사항·할 일로 정리해 문서로 저장합니다.',
 'steps':['원본 메신저 텍스트를 붙여넣거나 파일 업로드를 사용합니다.','핵심 브리핑·회의록·상급자 보고 등 문서 형식을 선택합니다.','요약 상세도, 문서 제목과 말투를 설정합니다.','내용 정리하기를 눌러 정리된 문서를 생성합니다.','프리뷰를 확인하고 결과 복사 또는 TXT·MD·DOCX 저장을 선택합니다.'],
 'output':'참여자, 키워드, 핵심 요약, 결정사항과 할 일이 포함된 문서 및 다운로드 파일',
 'cautions':['대화 속 담당자와 기한이 정확히 인식됐는지 원문과 대조하세요.','회사 기밀이나 개인정보가 포함된 대화는 취급 정책을 확인하세요.']},
'receipt-expense-scanner': {
 'purpose':'영수증 이미지에서 날짜·금액·가맹점을 추출해 지출결의서 초안을 만듭니다.',
 'steps':['업로드 또는 촬영으로 영수증 이미지를 추가합니다.','선택한 영수증 연속 OCR을 눌러 정보를 추출합니다.','사용 일자, 금액, 가맹점명과 지출 항목을 확인·수정합니다.','결제 수단, 작성자와 지출 목적을 입력해 초안을 완성합니다.','초안을 복사·TXT 다운로드하거나 누적한 뒤 XLSX 저장을 사용합니다.'],
 'output':'영수증 OCR 결과, 지출결의서 초안과 누적 지출 XLSX 파일',
 'cautions':['OCR 금액·일자·가맹점은 원본 영수증과 반드시 대조하세요.','회계 제출 전 증빙 요건과 지출 항목 분류를 담당 규정에 맞게 확인하세요.']},
'meeting-secretary-app': {
 'purpose':'간단히 적은 회의 메모를 요약·결정사항·할 일·리스크 구조로 정리합니다.',
 'steps':['낙서·회의록·채팅 로그 중 입력 형태를 선택합니다.','회의 중 적은 메모를 입력란에 붙여넣습니다.','담당자·기한·결정·보류 사항이 드러나도록 원문을 한 번 점검합니다.','원클릭 정리를 눌러 구조화된 회의록을 만듭니다.','결과의 담당자와 일정이 맞는지 확인한 뒤 필요한 곳에 복사해 사용합니다.'],
 'output':'핵심 요약, 결정 사항, Todo List, 리스크와 보류 항목이 구분된 회의록',
 'cautions':['모호한 메모는 담당자나 기한이 잘못 분류될 수 있습니다.','정리 결과를 공식 회의록으로 배포하기 전에 참석자가 검토해야 합니다.']},
'mood-playlist-linker': {
 'purpose':'현재 기분·날씨·에너지·상황에 맞는 YouTube 플레이리스트를 추천합니다.',
 'steps':['현재 감정 상태와 날씨를 선택합니다.','에너지 수준과 음악을 들을 상황을 설정합니다.','추천 다시 만들기를 눌러 맞춤 무드 믹스를 생성합니다.','추천 플레이리스트의 설명과 링크를 확인합니다.','다른 분위기를 원하면 조건을 바꾸거나 랜덤 무드를 사용합니다.'],
 'output':'선택한 상태에 어울리는 무드 설명과 YouTube 플레이리스트 링크',
 'cautions':['YouTube 영상은 업로더에 의해 삭제되거나 재생 제한될 수 있습니다.','운전·업무 중에는 소리 크기와 화면 조작에 주의하세요.']},
'url-qr-shortener-onepage': {
 'purpose':'긴 URL을 짧은 표시 링크와 다운로드 가능한 QR 코드로 변환합니다.',
 'steps':['긴 주소 입력란에 원본 URL을 붙여넣습니다.','표시용 별칭과 포스터·명함 등 사용 목적을 선택합니다.','필요하면 UTM 소스·캠페인과 QR 색상·이미지 크기를 설정합니다.','짧은 링크 + QR 만들기를 누릅니다.','생성 링크를 복사·열기로 검사하고 QR을 PNG 또는 SVG로 다운로드합니다.'],
 'output':'짧은 링크, 캠페인 파라미터가 적용된 연결 주소와 PNG·SVG QR 코드',
 'cautions':['배포 전 QR을 실제 휴대전화로 스캔해 최종 목적지를 확인하세요.','중요 링크는 단축 서비스의 운영 기간과 리디렉션 정책을 확인하세요.']},
'markdown-lite-editor': {
 'purpose':'Markdown 문서를 작성하면서 웹 미리보기를 보고 HTML 또는 PDF로 내보냅니다.',
 'steps':['빈 문서에 Markdown을 입력하거나 템플릿을 선택해 적용합니다.','제목·목록·표·링크 문법은 문법 도움말에서 확인합니다.','실시간 미리보기로 문서 모양을 점검합니다.','다크 모드와 미리보기 넓게로 작업 화면을 조절합니다.','HTML 복사·HTML 내보내기 또는 PDF 내보내기를 사용합니다.'],
 'output':'실시간 렌더링된 문서, HTML 소스·파일 또는 인쇄용 PDF',
 'cautions':['PDF 내보내기는 브라우저 인쇄 설정에 따라 여백과 줄바꿈이 달라질 수 있습니다.','초기화를 누르기 전에 필요한 원문을 별도로 저장하세요.']},
'voice-memo-mindmap': {
 'purpose':'말하거나 입력한 아이디어에서 핵심어를 뽑아 마인드맵과 다음 행동으로 구조화합니다.',
 'steps':['녹음 시작을 누르거나 아이디어를 텍스트로 직접 입력합니다.','말하기를 마친 뒤 정지를 누르고 변환된 텍스트를 확인합니다.','핵심어와 마인드맵 생성을 누릅니다.','방사형·클러스터·흐름 배치를 바꿔 관계를 살펴봅니다.','노드를 선택해 구조 인사이트와 다음 행동을 읽고 요약을 복사합니다.'],
 'output':'음성·입력 텍스트, 핵심어 마인드맵, 선택 노드 인사이트와 행동 제안',
 'cautions':['마이크 권한을 허용해야 녹음 기능을 사용할 수 있습니다.','음성 인식 오류가 있으면 텍스트를 수정한 뒤 다시 생성하세요.']},
'subscription-dashboard': {
 'purpose':'구독 서비스의 결제일·월 지출·활성·중지·해지 상태와 변경 이력을 관리합니다.',
 'steps':['구독 추가를 눌러 서비스명, 카테고리, 금액과 다음 결제일을 입력합니다.','메모를 적고 대시보드에 추가합니다.','검색·상태 필터와 결제일·금액·이름 정렬로 구독을 찾습니다.','다가오는 결제와 6개월 지출 추이를 확인합니다.','사용하지 않는 구독은 중지·해지로 바꾸고 절약 추천을 참고합니다.'],
 'output':'월 구독 지출 요약, 결제 예정 목록, 상태별 구독 카드와 변경 타임라인',
 'cautions':['앱의 상태 변경은 실제 서비스의 결제를 자동 해지하지 않습니다.','결제 금액과 갱신일은 각 서비스 청구서에서 다시 확인하세요.']},
'micro-mood-journal': {
 'purpose':'하루를 세 문장과 감정 점수·무드로 간단히 기록합니다.',
 'steps':['가장 남은 순간, 지친 이유, 고마운 것 등 오늘의 작성 주제를 선택합니다.','세 개 입력란에 오늘을 정리하는 문장을 한 줄씩 씁니다.','예시가 필요하면 예시 채우기를 누르고 자신의 경험에 맞게 수정합니다.','오늘 무드 기록하기를 눌러 문장 기반 감정 분석 결과를 만듭니다.','감정 점수·무드·태그를 확인하고 최근 무드 로그에서 지난 기록을 돌아봅니다.'],
 'output':'날짜별 세 문장 일기, 문장 분석으로 계산된 감정 점수·무드와 최근 10건의 로그',
 'cautions':['감정 점수는 문장 표현을 이용한 참고용 결과이며 전문적인 심리 평가가 아닙니다.','로그 삭제나 브라우저 데이터 삭제 후에는 기록을 복구하기 어렵습니다.']},
'lunch-roulette': {
 'purpose':'팀원 선호와 제외 메뉴, 주변 식당 후보를 반영해 점심 식당을 룰렛으로 결정합니다.',
 'steps':['팀원 이름을 추가하고 각자 선호·제외 메뉴를 투표합니다.','내 주변 맛집 불러오기 또는 샘플 데이터로 후보를 준비합니다.','거리, 가격대와 정렬 기준으로 식당 후보를 좁힙니다.','필요하면 새 후보 식당의 이름과 메뉴를 직접 추가합니다.','룰렛 돌리기로 최종 식당을 정하고 결과 복사하기로 공유합니다.'],
 'output':'팀 선호도가 반영된 식당 후보와 룰렛 최종 선택 결과',
 'cautions':['주변 식당 조회에는 브라우저 위치 권한과 OpenStreetMap API 연결이 필요합니다.','룰렛은 적합도 가중치를 반영한 무작위 선택이므로 같은 조건에서도 결과가 달라질 수 있습니다.']},
'mastermind-page': {
 'purpose':'리더·창업자 대상 Mastermind 프로그램의 대상, 방식, 코치와 FAQ를 탐색합니다.',
 'steps':['첫 화면에서 프로그램이 해결하려는 문제와 대상 설명을 읽습니다.','Who This Is For에서 본인의 역할과 적합성을 확인합니다.','How This Works에서 두 Mastermind 운영 구조를 살펴봅니다.','Coach와 Monthly VIP Guests 섹션에서 진행 방식과 네트워크를 확인합니다.','FAQ를 펼쳐 일정·장소·비용을 확인하고 Apply Now를 눌러 외부 Typeform에서 신청을 계속합니다.'],
 'output':'Mastermind 프로그램의 대상·운영 방식·FAQ 정보와 외부 Typeform 신청 페이지',
 'cautions':['이 페이지 자체에서는 신청이 완료되지 않으며 외부 Typeform으로 이동합니다.','하단 Terms·Privacy·Contact 링크는 현재 별도 문서가 열리지 않을 수 있습니다.']},
'namecard-memo-indexer': {
 'purpose':'명함을 촬영·업로드해 연락처를 추출하고 만남 메모와 키워드로 인맥을 관리합니다.',
 'steps':['명함 찍기 시작 또는 사진 찍기/업로드를 눌러 이미지를 넣습니다.','추출된 이름, 직함·회사, 이메일과 전화번호를 확인·수정합니다.','만난 장소·시점과 대화 메모를 작성하고 키워드를 선택합니다.','저장/수정 저장을 눌러 인맥 카드로 보관합니다.','저장된 인맥에서 검색하고 필요한 카드를 편집하거나 삭제합니다.'],
 'output':'연락처, 만남 맥락, 대화 메모와 키워드가 연결된 인맥 카드',
 'cautions':['현재 명함 OCR은 프로토타입 시뮬레이션으로 업로드 이미지 대신 샘플 연락처가 표시될 수 있습니다.','기록은 새로고침 후 초기 상태로 돌아갈 수 있으므로 중요한 연락처는 별도로 보관하세요.']},
'eisenhower-prioritizer': {
 'purpose':'할 일을 긴급도와 중요도 기준의 아이젠하워 4분면으로 자동 분류합니다.',
 'steps':['오늘 할 일을 입력란에 한 줄에 하나씩 작성합니다.','긴급한 기한이나 중요한 목적이 드러나도록 문장을 구체적으로 씁니다.','자동 분류하기를 눌러 4분면 결과를 만듭니다.','결과 검색으로 특정 업무를 찾고 추천 실행 순서를 확인합니다.','분류가 맞지 않으면 원문을 수정해 다시 분류하거나 초기화합니다.'],
 'output':'긴급·중요 조합의 4개 업무 분류와 추천 실행 순서',
 'cautions':['자동 분류는 문장 표현을 기준으로 한 제안이므로 최종 우선순위는 직접 판단하세요.','기한과 영향도가 빠진 모호한 업무는 의도와 다르게 분류될 수 있습니다.']},
'hermes-agent-interactive-page': {
 'purpose':'Hermes Agent의 도구 실행, 멀티채널, 기억, 모델과 예약 작업 개념을 체험합니다.',
 'steps':['상단 예시 작업 버튼을 눌러 에이전트 사용 사례를 살펴봅니다.','일반 AI와 Hermes 비교 탭으로 작업 방식 차이를 확인합니다.','목적 선택 영역에서 제공 모델과 워크플로우 구성을 탐색합니다.','예약 작업 시뮬레이터에서 할 일, 주기와 전달 채널을 선택합니다.','Preview Output을 눌러 예상 결과를 보고 필요한 명령이나 내용을 복사합니다.'],
 'output':'Hermes 기능 설명, 일반 AI 비교, 예약 작업·도구 스택의 인터랙티브 미리보기',
 'cautions':['소개 페이지의 시뮬레이션은 실제 Hermes 설치나 예약 작업을 자동 생성하지 않습니다.','실제 기능과 설정 방법은 최신 Hermes 공식 문서를 기준으로 확인하세요.']},
'font-preview-board': {
 'purpose':'무료 한글 폰트를 같은 문장으로 비교하고 크기·굵기·행간·자간을 조정합니다.',
 'steps':['미리보기 문장을 직접 쓰거나 추천 문장을 선택합니다.','폰트 이름 검색으로 후보를 좁힙니다.','글자 크기, 행간, 자간과 Light·Regular·Bold 굵기를 조절합니다.','폭과 정렬 옵션을 바꾸며 여러 폰트 카드를 비교합니다.','마음에 드는 폰트를 찜하고 카드에서 제공하는 CSS 정보를 복사합니다.'],
 'output':'동일 문장의 폰트별 시각 비교, 즐겨찾기 목록과 적용용 CSS 정보',
 'cautions':['실제 사용 전 각 폰트의 최신 라이선스와 허용 범위를 확인하세요.','기기에 폰트가 로드되지 않으면 대체 글꼴로 보일 수 있습니다.']},
'moa-ai-bookmark-manager': {
 'purpose':'YouTube 링크를 분석해 제목·요약·태그·컬렉션 정보로 정리합니다.',
 'steps':['링크 저장을 눌러 YouTube URL을 입력합니다.','AI로 분석을 눌러 제목, 요약과 태그를 생성합니다.','분석 내용을 확인하고 필요하면 다시 분석합니다.','추천 컬렉션을 확인한 뒤 보관함에 저장합니다.','검색·카테고리·YouTube 유형·즐겨찾기 필터로 저장한 자료를 다시 찾습니다.'],
 'output':'링크 원문 정보, AI 요약·태그, 컬렉션별 북마크 카드',
 'cautions':['현재 분석 흐름은 YouTube URL 중심이므로 일반 웹 문서는 처리되지 않을 수 있습니다.','새 북마크와 즐겨찾기 변경은 새로고침 후 유지되지 않을 수 있습니다.']},
'downdoc': {
 'purpose':'다운로드 폴더의 문서·이미지·설치 파일·중복 파일을 진단하고 정리 계획을 미리 봅니다.',
 'steps':['정리할 폴더 경로를 입력합니다.','원하는 자동 분류 규칙을 켜거나 모두 켜기를 선택합니다.','폴더 스캔을 눌러 진단 리포트가 생성될 때까지 기다립니다.','분류·이름 표준화·중복 처리 등 정리 전후 계획을 검토합니다.','정리 적용하기를 누른 뒤 확인 창에서 안전하게 정리를 선택합니다.'],
 'output':'파일 유형·중복·이름 상태 진단과 정리 전후 미리보기(현재 공개 배포본은 데모 결과)',
 'cautions':['현재 공개 배포본은 preview 모드이며 실제 파일 제어가 차단되어 있습니다.','로컬 에이전트 모드에서 적용할 때는 이동 계획과 중복 판정을 검토하고 중요한 파일을 백업하세요.']},
'newsletter-webzine': {
 'purpose':'원고와 여러 장의 사진을 자동 편집해 제목·소개·본문과 이미지 레이아웃이 갖춰진 뉴스레터를 만듭니다.',
 'steps':['자동 제작하기를 누르고 원고를 직접 입력하거나 TXT·MD 파일을 첨부합니다.','필요한 사진을 최대 8장까지 추가하고 순서를 조정합니다.','이미지 구성 방식을 선택하거나 자동 추천을 유지한 뒤 자동 편집 초안 만들기를 누릅니다.','생성된 제목·소개·본문과 레이아웃을 확인하고 필요한 내용을 수정합니다.','발행하고 링크 만들기를 눌러 뉴스레터를 저장한 뒤 공유 링크를 복사합니다.'],
 'output':'자동 편집된 뉴스레터 초안, 이미지가 배치된 웹진 화면과 공유 가능한 개별 링크',
 'cautions':['뉴스레터와 과거 발행 목록은 현재 사용 중인 브라우저에 저장되므로 다른 기기와 자동 동기화되지 않습니다.','발행 전에 자동 구성된 제목·본문과 사진 순서가 의도와 맞는지 확인하세요.']},
'memory-companion': {
 'purpose':'대화 속 사람·프로젝트·할 일·날짜를 기억으로 구조화하고 실제 기록 검색과 미완료 약속 후속 확인을 체험합니다.',
 'steps':['하단 입력창에 기억할 약속이나 할 일을 평소 말하듯 입력합니다.','자동 분류 결과에서 사람·프로젝트·날짜·중요도와 후속 확인 여부를 검토하고 필요하면 수정합니다.','기억에 저장을 눌러 열린 약속 목록에 추가합니다.','기억 검색에서 사람·프로젝트·행동 키워드 또는 자연어 질문으로 실제 기록을 찾습니다.','완료한 약속은 체크하고, Hermes에서 사용하려면 앱 카드의 Skill ZIP을 내려받아 스킬 폴더에 설치합니다.'],
 'output':'구조화된 기억 카드, 사람·프로젝트별 검색 결과, 미완료 약속 후속 확인 목록과 설치 가능한 Hermes 스킬 ZIP',
 'cautions':['현재 공개 앱은 프런트엔드 프로토타입이라 새로고침하면 입력·수정한 데이터가 초기화됩니다.','스킬을 실제 자동화에 연결할 때는 영구 저장소와 개인정보 보관 정책을 별도로 설정하세요.']}
}

STYLE = '''
:root{--bg:#070914;--panel:#111629;--line:rgba(255,255,255,.15);--text:#f7f8ff;--muted:#aab0c7;--brand:#8b5cf6;--brand2:#22d3ee}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at top left,rgba(139,92,246,.35),transparent 34rem),linear-gradient(180deg,#070914,#0d1020);color:var(--text);font-family:Inter,system-ui,-apple-system,"Noto Sans KR",sans-serif;line-height:1.7;min-height:100vh}.wrap{width:min(860px,calc(100% - 32px));margin:auto}.nav{border-bottom:1px solid var(--line);background:rgba(7,9,20,.82);position:sticky;top:0;backdrop-filter:blur(14px);z-index:10}.nav .wrap{display:flex;justify-content:space-between;align-items:center;padding:14px 0;gap:12px}.brand{font-weight:900;color:#fff;text-decoration:none}.back{color:#a5f3fc;text-decoration:none;font-weight:800}.hero{padding:54px 0 28px}.eyebrow{color:#67e8f9;font-weight:900;letter-spacing:.1em;font-size:12px}.hero h1{font-size:clamp(32px,7vw,55px);line-height:1.12;letter-spacing:-.05em;margin:8px 0 14px}.lead{color:var(--muted);font-size:18px;margin:0}.panel{background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:26px;padding:clamp(20px,5vw,34px);margin:18px 0}.panel h2{margin:0 0 16px;font-size:23px}.steps{list-style:none;padding:0;margin:0;counter-reset:step;display:grid;gap:12px}.steps li{counter-increment:step;position:relative;padding:15px 16px 15px 54px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);border-radius:16px}.steps li:before{content:counter(step);position:absolute;left:15px;top:15px;width:25px;height:25px;display:grid;place-items:center;border-radius:8px;background:linear-gradient(135deg,var(--brand),var(--brand2));font-weight:900}.result{color:#dbeafe}.cautions{margin:0;padding-left:22px;color:#fef3c7}.actions{display:flex;gap:10px;flex-wrap:wrap;margin:28px 0 54px}.btn{display:inline-flex;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:900;border:1px solid var(--line);color:#fff}.btn.primary{border:0;background:linear-gradient(135deg,var(--brand),var(--brand2))}footer{color:var(--muted);font-size:12px;padding:20px 0 40px}@media(max-width:520px){.nav .wrap{align-items:flex-start}.hero{padding-top:36px}.panel{border-radius:20px}.actions{display:grid}.btn{justify-content:center}}
'''.strip()

def page(slug, app, manual):
    steps = ''.join(f'<li>{html.escape(step)}</li>' for step in manual['steps'])
    cautions = ''.join(f'<li>{html.escape(item)}</li>' for item in manual['cautions'])
    name = html.escape(app['name'])
    purpose = html.escape(manual['purpose'])
    output = html.escape(manual['output'])
    app_url = f'/{slug}'
    return f'''<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{name} 사용설명서 | Homong's App Archive</title><meta name="description" content="{name} 사용 방법과 결과물, 주의사항을 안내합니다."><link rel="stylesheet" href="/assets/manual.css"></head>
<body><header class="nav"><div class="wrap"><a class="brand" href="/">⌘ Homong's App Archive</a><a class="back" href="/#apps">← 앱 목록</a></div></header><main class="wrap"><section class="hero"><div class="eyebrow">APP USER GUIDE · {html.escape(slug)}</div><h1>{html.escape(app.get('icon','✨'))} {name}<br>사용설명서</h1><p class="lead">{purpose}</p></section><section class="panel"><h2>사용 순서</h2><ol class="steps">{steps}</ol></section><section class="panel"><h2>만들어지는 결과</h2><p class="result">{output}</p></section><section class="panel"><h2>사용 전 확인</h2><ul class="cautions">{cautions}</ul></section><div class="actions"><a class="btn primary" href="{app_url}" target="_blank" rel="noopener">{name} 실행 ↗</a><a class="btn" href="/#apps">다른 앱 보기</a></div></main><footer class="wrap">© Homong's App Archive · 화면과 기능은 업데이트에 따라 달라질 수 있습니다.</footer></body></html>'''

missing = sorted(set(APPS) - set(MANUALS))
extra = sorted(set(MANUALS) - set(APPS))
if missing or extra:
    raise SystemExit(f'manual mismatch: missing={missing}, extra={extra}')
(ROOT / 'assets' / 'manual.css').write_text(STYLE + '\n', encoding='utf-8')
out = ROOT / 'manuals'
out.mkdir(exist_ok=True)
for slug, app in APPS.items():
    (out / f'{slug}.html').write_text(page(slug, app, MANUALS[slug]) + '\n', encoding='utf-8')
print(f'generated {len(MANUALS)} manuals')

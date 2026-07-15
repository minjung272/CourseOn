# CourseOn

바이브코딩 팀프로젝트

## 실행 방법

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경변수 설정

챗봇까지 사용하려면 `.env.example`을 복사하여 프로젝트 루트에 `.env`를 만들고 OpenAI API 키를 입력합니다.
여행코스 상세페이지는 API 키 없이도 사용할 수 있습니다.

```bash
cp .env.example .env
```

```dotenv
OPENAI_API_KEY=발급받은_API_키
OPENAI_MODEL=gpt-5-mini
PORT=3000
```

> `.env`에는 실제 API 키가 들어가므로 Git에 커밋하지 않습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

위 명령은 Vue 개발 서버와 Express API 서버를 함께 실행합니다.

- 웹 화면: `http://localhost:5173`
- API 서버: `http://127.0.0.1:3000`

프로덕션 빌드 확인은 다음 명령을 사용합니다.

```bash
npm run build
```

## 여행코스 상세페이지 사용 방법

### 상세페이지 열기

1. 상단 메뉴에서 **여행코스**를 선택합니다.
2. 원하는 코스 카드의 **상세보기** 버튼을 누릅니다.
3. `/courses/:courseId` 주소의 상세페이지로 이동합니다.

다음 주소로 직접 확인할 수도 있습니다.

```text
http://localhost:5173/courses/demo-bukchon
http://localhost:5173/courses/demo-hangang
http://localhost:5173/courses/demo-namsan
http://localhost:5173/courses/1952971
```

### 제공 기능

- **코스 기본정보**: 대표 이미지, 지역, 태그, 소요시간, 추천 이동수단과 테마를 확인합니다.
- **저장하기**: 버튼을 누르면 브라우저 `localStorage`에 코스 ID가 저장됩니다. 다시 누르면 저장이 해제됩니다.
- **이 코스 추천받기**: 현재 코스 ID와 대표 테마를 포함해 맞춤추천 페이지로 이동합니다.
- **코스 소개**: 코스 설명, 특징과 여행 분류 정보를 확인합니다.
- **코스 일정**: 소개 영역의 `코스 일정` 탭을 누르면 추천 이동 순서를 확인할 수 있습니다.
- **코스 위치**: Leaflet과 OpenStreetMap으로 코스 중심 위치를 표시합니다. 지도 타일을 불러오려면 인터넷 연결이 필요합니다.
- **전체 지도 보기**: 지도 페이지로 이동하여 서울의 다른 구와 코스를 함께 확인합니다.
- **연관 코스**: 같은 구 또는 공통 태그가 있는 코스를 우선하여 최대 3개까지 표시합니다.

저장한 코스 ID는 다음 키에 배열 형태로 보관됩니다.

```text
course-on:saved-course-ids
```

브라우저별로 별도 저장되며 캐시와 사이트 데이터를 삭제하면 저장 목록도 초기화됩니다.

### 상세페이지 데이터 연결 방법

상세페이지는 다음 두 데이터 소스를 함께 사용합니다.

- `src/shared/data/demoContent.js`: 디자인 확인용 대표 코스
- `public/data/courses/seoul.json`: 서울 여행코스 공공데이터

목록과 상세페이지에서 사용할 코스 객체의 주요 필드는 다음과 같습니다.

```js
{
  id: 'course-id',
  title: '코스 이름',
  description: '코스 설명',
  region: {
    name: '서울',
    districtCode: '종로구',
    legalDistrictCode: '110',
  },
  tags: ['산책', '문화'],
  imageUrl: '/images/course.jpg',
  duration: '약 3시간',
  transport: '도보 중심',
  latitude: 37.5826,
  longitude: 126.9831,
}
```

- `districtCode`가 실제 구 이름이면 그대로 표시합니다.
- 공공데이터처럼 숫자 코드만 있는 경우 `legalDistrictCode`를 서울 25개 구 이름으로 변환합니다.
- 이미지가 없거나 로딩에 실패하면 서울 기본 이미지가 표시됩니다.
- 설명, 소요시간, 이동수단, 분류가 빠진 데이터는 `courseService.js`에서 기본값을 생성합니다.
- 원본 JSON에는 코스별 실제 경유지 목록이 없으므로 현재 일정은 구와 태그를 이용한 안내형 일정입니다. 실제 일정 데이터가 추가되면 코스 객체의 `itinerary` 배열로 교체할 수 있습니다.

`itinerary`를 직접 지정할 때는 다음 형식을 사용합니다.

```js
itinerary: [
  {
    time: "START",
    title: "출발 장소",
    description: "출발 장소에 대한 안내",
  },
  {
    time: "1시간",
    title: "첫 번째 방문 장소",
    description: "방문 장소에 대한 안내",
  },
];
```

### 관련 파일

- `src/features/courses/views/CourseDetailView.vue`: 상세 화면과 사용자 상호작용
- `src/features/courses/services/courseService.js`: 데이터 정규화, 상세 조회와 연관 코스 계산
- `src/app/router/index.js`: `/courses/:courseId` 상세 경로

## 프로젝트 디렉터리 구조

기능별 작업 영역을 분리하여 팀원이 동시에 개발할 때 발생하는 파일 충돌을 줄이도록 구성했습니다.

```text
CourseOn/
├─ public/                          # 웹에서 직접 접근하는 정적 파일
│  ├─ data/
│  │  └─ courses/                  # 정제 완료된 여행코스 JSON
│  └─ images/                      # 기본 이미지 등 공용 이미지
│
├─ src/                             # Vue 애플리케이션 소스 코드
│  ├─ app/                          # 앱 전체 설정
│  │  ├─ layouts/                  # Header·Navigation 등 공통 화면 틀
│  │  └─ router/                   # 페이지 경로 설정
│  │
│  ├─ assets/                       # 코드에서 import하는 이미지·폰트
│  │
│  ├─ features/                     # 기능별 독립 작업 영역
│  │  ├─ home/
│  │  │  ├─ components/            # 홈 화면 내부 UI
│  │  │  └─ views/                 # 홈 전체 화면
│  │  ├─ courses/
│  │  │  ├─ components/            # 여행코스 카드·목록·검색 UI
│  │  │  ├─ views/                 # 여행코스 목록·상세 화면
│  │  │  └─ services/              # 여행코스 JSON 로딩·검색
│  │  ├─ statistics/
│  │  │  ├─ components/            # Chart.js 통계 UI
│  │  │  └─ views/                 # 인기 코스 통계 화면
│  │  ├─ community/
│  │  │  ├─ components/            # 게시글·작성 폼·비밀번호 UI
│  │  │  ├─ views/                 # 게시판 목록·작성·상세 화면
│  │  │  └─ services/              # localStorage 게시글 CRUD
│  │  ├─ recommendation/
│  │  │  ├─ components/            # 추천 조건 선택·결과 UI
│  │  │  └─ services/              # 태그 매칭·추천 점수 계산
│  │  ├─ chatbot/
│  │  │  ├─ components/            # 챗봇 버튼·대화창 UI
│  │  │  └─ services/              # OpenAI API 호출
│  │  └─ map/
│  │     ├─ components/            # Leaflet 지도·마커·팝업 UI
│  │     └─ views/                 # 지도 전체 화면
│  │
│  └─ shared/                       # 여러 기능에서 함께 사용하는 코드
│     ├─ components/               # 버튼·모달·로딩 등 공통 UI
│     ├─ styles/                   # 전역 스타일·색상·레이아웃
│     └─ utils/                    # 공통 데이터 변환·검증 함수
│
├─ data/
│  └─ raw/                         # 수정하지 않은 원본 여행코스 JSON
│
└─ scripts/
   └─ data/                        # JSON 정제·검증 Python 코드
```

### 작업 기준

- 실제 페이지 화면은 각 기능의 `views/`에서 구현합니다.
- 페이지 내부에서 사용하는 UI는 해당 기능의 `components/`에 작성합니다.
- 여러 기능에서 공통으로 사용하는 UI와 함수만 `shared/`에 작성합니다.
- 제공받은 원본 JSON은 `data/raw/`에서 수정하지 않고 보존합니다.
- 정제 완료된 JSON은 `public/data/courses/`에 저장합니다.
- 데이터 정제 및 검증 코드는 `scripts/data/`에서 관리합니다.
- 공용 영역인 `app/`과 `shared/`를 변경할 때는 팀원에게 먼저 공유합니다.

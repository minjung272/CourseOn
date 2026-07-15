# CourseOn
바이브코딩 팀프로젝트

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

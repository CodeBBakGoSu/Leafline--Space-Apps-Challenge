# 🌿 Leafline
### AI-Powered Beekeeping Assistant for Maximizing Honey Harvests

**Leafline**은 현대 양봉업자들이 마주하는 도전 과제들을 해결하기 위해 탄생한 AI 기반 서비스입니다. 저희는 개화 시기 예측의 불확실성과 전 세계적인 꿀벌 군집 붕괴 현상에 주목하여, 데이터와 기술을 통해 양봉업의 지속 가능성을 높이고자 합니다.

## 🌱 저희의 이야기 (Our Story)

저희 LEAFLINE 팀은 NASA의 "BloomWatch: 지구 개화 현상 관측 애플리케이션" 프로젝트를 탐구하며 자연의 순환과 꿀벌의 중요성에 깊은 관심을 갖게 되었습니다. 최근 급격한 기후 변화로 인한 **개화 시기 예측 실패**와 **집단 꿀벌 실종 사태(Colony Collapse Disorder)**가 양봉 농가에 큰 위협이 되고 있다는 사실을 알게 되었습니다.

이러한 문제에 공감하며, 저희는 양봉업자들을 위한 실질적인 해결책을 제공하고자 Leafline 서비스를 개발하게 되었습니다. Leafline은 **AI 기반 개화 시기 예측**을 통해 꿀벌의 활동을 최적화하고, 궁극적으로 **꿀 수확량을 극대화**할 수 있도록 돕는 든든한 파트너입니다.

## ✨ 주요 기능 (Key Features)

- 🌸 **AI 기반 개화 예측 (Bloom Prediction)**: 위성 데이터와 기상 정보를 분석하여 주요 밀원 식물의 개화 시기를 예측하고, 최적의 벌통 배치 시기와 장소를 제안합니다.
- 🍯 **꿀 수확량 예측 (Honey Yield Forecast)**: 개화 예측 데이터와 벌통의 상태를 종합하여 예상 꿀 수확량을 예측함으로써 농가의 수익 계획 수립을 돕습니다.
- ✅ **AI 할 일 추천 (Smart To-Do Planner)**: 각 벌통의 상태, 날씨, 개화 예측 정보를 바탕으로 **오늘의 할 일**과 **월간 관리 계획**을 AI가 자동으로 추천하여 체계적인 양봉 관리를 지원합니다.
- 📝 **사용자 맞춤 관리 (Customizable Tasks)**: AI 추천 외에도 사용자 스스로 필요한 작업을 추가하고 관리하며 각 벌통의 이력을 추적할 수 있습니다.
- 💬 **커뮤니티 (Community)**: 다른 양봉업자들과 지식과 경험을 나누고 소통할 수 있는 공간입니다. 함께 배우고 성장하며 좋은 영향을 주고받기를 바랍니다.

## 🛠️ 기술 스택 (Tech Stack)

- **Backend**: Python (FastAPI)
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Modeling**: Scikit-learn, TensorFlow
- **Deployment**: AWS EC2 (Backend), Vercel (Frontend)

## 🏆 팀 소개 (Meet the Team)
저희는 NASA Space Apps Challenge에서 만나 이 프로젝트를 시작했습니다.

| Name | GitHub | Role |
| :--- | :--- | :--- |
| **홍기현** | [CodeBBackGoSu](https://github.com/CodeBBackGoSu) | Backend, Product Owner |
| **조은서** | [theeunseojo](https://github.com/theeunseojo) | Backend |
| **오유성** | [Emma10003](https://github.com/Emma10003) | Frontend |
| **은영** | [euny802](https://github.com/euny802) | Frontend |
| **윤세휘** | [thw-hwistle](https://github.com/thw-hwistle) | Data Analyst, Modeling |

---

## 🚀 시작하기 (Backend)

FastAPI 기반의 백엔드 서버입니다.

### 필수 요구사항

- Python 3.11 이상
- [uv](https://github.com/astral-sh/uv) 패키지 관리자

### UV 설치

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### UV로 가상환경 세팅하기

#### 1. 프로젝트 초기화 및 의존성 설치

```bash
# 프로젝트 디렉토리로 이동
cd BackEnd

# uv를 사용하여 가상환경 생성 및 의존성 설치
uv sync
```

#### 2. 개발 서버 실행

```bash
# uv를 사용하여 직접 실행
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

서버가 시작되면 다음 주소로 접속할 수 있습니다:
- **API**: `http://localhost:8000`
- **API 문서 (Swagger)**: `http://localhost:8000/docs`
- **API 문서 (ReDoc)**: `http://localhost:8000/redoc`

## 📁 프로젝트 구조

```
BackEnd/
│
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 애플리케이션 진입점
│   │
│   ├── routers/             # API 라우터 (도메인별)
│   ├── services/            # 비즈니스 로직 (도메인별)
│   └── core/                # 핵심 설정 (환경변수, 보안)
│
├── tests/                   # 테스트 코드
├── .env.example             # 환경 변수 예시
├── pyproject.toml           # 프로젝트 의존성 및 설정
└── README.md
```

## 🛠️ UV 패키지 관리

UV는 `npm`이나 `yarn`처럼 **자동으로 `pyproject.toml`에 의존성을 추가/제거**합니다.

### 패키지 추가

```bash
# 프로덕션 의존성 추가
uv add fastapi

# 개발용 의존성 추가
uv add --dev pytest
```

### 패키지 제거

```bash
uv remove fastapi
```

### 의존성 동기화

`pyproject.toml` 파일 기준으로 가상환경을 최신 상태로 맞춥니다.
```bash
uv sync
```

## 🔧 개발 가이드

### 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 필요한 값을 설정하세요.

```bash
cp .env.example .env
```

### 코드 스타일 및 테스트

```bash
# 코드 포맷팅 (Black)
uv run black app

# 린트 검사 (Ruff)
uv run ruff check app

# 테스트 실행 (Pytest)
uv run pytest
```

## 🤝 기여하기

1. 브랜치 생성 (`git checkout -b feature/amazing-feature`)
2. 변경사항     커밋 (`git commit -m 'Add some amazing feature'`)
3. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
4. Pull Request 생성
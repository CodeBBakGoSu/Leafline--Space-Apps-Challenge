# Leafline BackEnd

FastAPI 기반의 백엔드 서버입니다.

## 🚀 시작하기

### 필수 요구사항

- Python 3.11 이상
- [uv](https://github.com/astral-sh/uv) 패키지 관리자

### UV 설치

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Homebrew (macOS)
brew install uv

# pip를 통한 설치
pip install uv
```

### UV로 가상환경 세팅하기

#### 1. 프로젝트 초기화

```bash
cd BackEnd

# uv를 사용하여 프로젝트 초기화
uv init
```

#### 2. 가상환경 생성 및 활성화

```bash
# 가상환경은 자동으로 .venv 디렉토리에 생성됩니다
# uv가 자동으로 가상환경을 관리하므로 별도 활성화가 필요 없습니다

# 만약 수동으로 활성화하고 싶다면:
# macOS/Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

#### 3. 의존성 설치

```bash
# pyproject.toml에 정의된 의존성 설치
uv sync

# 또는 개별 패키지 설치
uv pip install fastapi uvicorn[standard] python-dotenv pydantic-settings
```

#### 4. 개발 서버 실행

```bash
# uv를 사용하여 직접 실행
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 또는 가상환경 활성화 후
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

서버가 시작되면 다음 주소로 접속할 수 있습니다:
- API: http://localhost:8000
- API 문서 (Swagger): http://localhost:8000/docs
- API 문서 (ReDoc): http://localhost:8000/redoc

## 📁 프로젝트 구조

```
BackEnd/
│
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 애플리케이션 진입점
│   │
│   ├── routers/             # API 라우터 (도메인별)
│   │   ├── __init__.py
│   │   ├── health.py        # 헬스 체크
│   │   ├── users.py         # 사용자 관련 API (예시)
│   │   └── posts.py         # 게시글 관련 API (예시)
│   │
│   ├── services/            # 비즈니스 로직 (도메인별)
│   │   ├── __init__.py
│   │   ├── health_service.py
│   │   ├── user_service.py  # 사용자 비즈니스 로직 (예시)
│   │   └── post_service.py  # 게시글 비즈니스 로직 (예시)
│   │
│   └── core/                # 핵심 설정
│       ├── __init__.py
│       ├── config.py        # 환경 설정
│       └── security.py      # 보안 관련 (JWT 등)
│
├── tests/                   # 테스트 코드
│   ├── __init__.py
│   ├── conftest.py
│   └── test_api/
│       └── test_items.py
│
├── .env.example             # 환경 변수 예시
├── pyproject.toml           # 프로젝트 의존성 및 설정
└── README.md
```

### 📂 프로젝트 구조 설명

이 프로젝트는 **간단하고 명확한 레이어 구조**를 따릅니다:

#### 🔹 **routers/** - API 엔드포인트
- HTTP 요청/응답 처리
- 라우팅 및 입력 검증
- 서비스 계층 호출

#### 🔹 **services/** - 비즈니스 로직
- 핵심 비즈니스 로직 구현
- 데이터 처리 및 변환
- 외부 API 호출
- 복잡한 계산 및 검증

#### 🔹 **core/** - 설정 및 보안
- 환경 설정 관리
- JWT, 인증 등 보안 유틸리티

### 💡 도메인 추가 예시

**예시: Users 도메인**
```
1. app/routers/users.py       → API 엔드포인트 정의
2. app/services/user_service.py → 비즈니스 로직 구현
3. app/main.py                → 라우터 등록
```

**코드 흐름:**
```
Client → Router → Service → Response
         (API)    (로직)
```

## 📦 주요 의존성

- **FastAPI**: 현대적이고 빠른 웹 프레임워크
- **Uvicorn**: ASGI 서버
- **Pydantic**: 데이터 검증 및 설정 관리
- **SQLAlchemy**: ORM (Optional)
- **Alembic**: 데이터베이스 마이그레이션 (Optional)

## 🛠️ UV 패키지 관리 (자동으로 pyproject.toml 업데이트)

UV는 **자동으로 `pyproject.toml`에 의존성을 추가/제거**합니다!

### 📦 패키지 추가 (프로덕션 의존성)

```bash
# 일반 패키지 추가 - pyproject.toml의 dependencies에 자동 추가
uv add sqlalchemy
uv add alembic
uv add python-jose[cryptography]
uv add passlib[bcrypt]

# 여러 패키지 한 번에 추가
uv add sqlalchemy alembic python-jose passlib
```

**실행 결과:**
- ✅ `pyproject.toml`의 `dependencies` 배열에 자동 추가
- ✅ `uv.lock` 파일 자동 업데이트
- ✅ 가상환경에 즉시 설치

### 🔧 개발 의존성 추가

```bash
# 개발용 패키지 - pyproject.toml의 dev dependencies에 추가
uv add --dev pytest-asyncio
uv add --dev black ruff
uv add --dev ipython

# 또는 --group dev 옵션 사용
uv add --group dev pytest-asyncio
```

**실행 결과:**
- ✅ `pyproject.toml`의 `[project.optional-dependencies] dev` 배열에 추가

### 🗑️ 패키지 제거

```bash
# 패키지 제거 - pyproject.toml에서도 자동 삭제
uv remove sqlalchemy

# 개발 의존성 제거
uv remove --dev pytest-asyncio
```

### 🔄 기타 유용한 명령어

```bash
# 의존성 동기화 (pyproject.toml 기준으로 재설치)
uv sync

# 개발 의존성 제외하고 동기화
uv sync --no-dev

# Python 스크립트 실행
uv run python script.py

# 가상환경에서 명령 실행
uv run <command>

# 특정 버전 지정하여 추가
uv add "fastapi>=0.100.0,<1.0.0"
uv add "sqlalchemy==2.0.23"

# 의존성 업데이트
uv lock --upgrade          # 모든 패키지 최신 버전으로
uv lock --upgrade fastapi  # 특정 패키지만 업데이트

# 설치된 패키지 목록 확인
uv pip list

# 패키지 정보 확인
uv pip show fastapi
```

### 💡 실제 사용 예시

```bash
# 데이터베이스 관련 패키지 추가
uv add sqlalchemy alembic psycopg2-binary

# 인증 관련 패키지 추가
uv add "python-jose[cryptography]" "passlib[bcrypt]"

# 개발 도구 추가
uv add --dev pytest pytest-asyncio pytest-cov httpx

# 서버 실행
uv run uvicorn app.main:app --reload
```

**중요:** UV는 `npm`이나 `yarn`처럼 자동으로 `pyproject.toml`을 관리하므로, 수동으로 파일을 편집할 필요가 없습니다!

## 🔧 개발 가이드

### 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 필요한 값을 설정하세요.

```bash
cp .env.example .env
```

### 코드 스타일

```bash
# Black (포맷터)
uv run black app

# Ruff (린터)
uv run ruff check app

# MyPy (타입 체크)
uv run mypy app
```

### 테스트 실행

```bash
# pytest로 테스트 실행
uv run pytest

# 커버리지와 함께 테스트
uv run pytest --cov=app tests/
```

## 📝 API 문서

FastAPI는 자동으로 API 문서를 생성합니다:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI Schema: http://localhost:8000/openapi.json

## 🤝 기여하기

1. 브랜치 생성 (`git checkout -b feature/amazing-feature`)
2. 변경사항 커밋 (`git commit -m 'Add some amazing feature'`)
3. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
4. Pull Request 생성


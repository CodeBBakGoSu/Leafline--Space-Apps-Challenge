"""FastAPI 애플리케이션 진입점"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.todo.router import router as todo_router
from app.dashBord.weather_router import router as weather_router
from app.data.profile_router import router as profile_router
from app.chart.chart_router import router as chart_router
from app.chat.chat_router import router as chat_router
from app.calendar.calendar_router import router as calendar_router
from app.community.community_router import router as community_router


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Leafline Backend API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)
#####
# CORS 설정
origins = [
    "http://127.0.0.1:5502",
    "http://localhost:3000",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    # Vite/CRA 개발 포트 사용 시
    "http://127.0.0.1:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # 배포 시에는 정확한 도메인만 남기세요
    allow_credentials=True,         # 쿠키/인증 필요 없다면 False로
    allow_methods=["*"],            # 필요한 메서드만 명시해도 됨
    allow_headers=["*"],            # Authorization, Content-Type 등
)

# 라우터 등록
app.include_router(profile_router, prefix="/api")
app.include_router(todo_router, prefix="/api")
app.include_router(weather_router, prefix="/api")
app.include_router(chart_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(calendar_router)
app.include_router(community_router, prefix="/api")


@app.get("/", tags=["Root"])
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Welcome to Leafline API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }

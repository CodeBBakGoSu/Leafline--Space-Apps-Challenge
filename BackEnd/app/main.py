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
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

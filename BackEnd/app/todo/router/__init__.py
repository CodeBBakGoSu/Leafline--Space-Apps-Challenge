"""Todo 라우터 통합"""

from fastapi import APIRouter
from . import get_todos_router, add_todo_router, ai_get_todo_router, update_todo_router

# 통합 라우터 생성
router = APIRouter(prefix="/todolist", tags=["todolist"])

# 각 라우터의 엔드포인트들을 통합 라우터에 추가
router.include_router(get_todos_router.router, prefix="")
router.include_router(add_todo_router.router, prefix="")
router.include_router(update_todo_router.router, prefix="")
router.include_router(ai_get_todo_router.router, prefix="")



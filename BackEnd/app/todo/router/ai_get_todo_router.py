"""AI 기반 TODO 추천 라우터"""

from fastapi import APIRouter, Query
from typing import List, Optional
from ..schema.todo_schema import Todo
from ..service.ai_get_todo_service import get_ai_recommended_todos

router = APIRouter()

@router.get("/ai-todos", response_model=List[Todo])
def get_ai_todos(
    context: Optional[str] = Query(
        None,
        description="추가 컨텍스트 정보 (예: '봄철 작업', '여름철 관리', '겨울 준비' 등)"
    )
):
    """
    Gemini AI를 통해 양봉업자를 위한 TODO 리스트를 추천받습니다.
    
    - **context**: 선택적 컨텍스트 (계절, 날씨, 특별 작업 등)
    - 반환: Todo 스키마 형식의 JSON 리스트
    """
    return get_ai_recommended_todos(context or "")


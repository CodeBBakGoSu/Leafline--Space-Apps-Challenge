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
        description="사용자가 입력한 할 일 관련 텍스트 (예: 'honey', 'queen bee', 'winter' 등)"
    )
):
    """
    Gemini AI를 통해 양봉업자를 위한 TODO 3가지를 추천받습니다.
    
    - **context**: 사용자가 입력한 텍스트 (선택적)
    - 반환: 3개의 Todo 스키마 형식의 JSON 리스트
    
    사용자가 입력한 context를 기반으로 관련된 양봉 작업 3가지를 추천합니다.
    context가 없으면 일반적인 양봉 작업을 추천합니다.
    """
    return get_ai_recommended_todos(context or "")


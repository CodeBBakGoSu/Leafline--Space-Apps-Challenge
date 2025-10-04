from fastapi import APIRouter
from typing import List
from ..service.get_todos_service import get_all_todos
from ..schema.todo_schema import Todo

router = APIRouter()

@router.get("/todos", response_model=List[Todo])
def get_todos_router():
    """모든 할 일 목록을 반환"""
    return get_all_todos()



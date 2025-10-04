from fastapi import APIRouter, status
from ..schema.todo_schema import Todo, TodoCreate
from ..service.add_todo_service import add_todo as add_todo_service

router = APIRouter()

@router.post("/todos", response_model=Todo, status_code=status.HTTP_201_CREATED)
def add_todo(todo_create: TodoCreate):
    """새로운 할 일 추가"""
    return add_todo_service(todo_create)

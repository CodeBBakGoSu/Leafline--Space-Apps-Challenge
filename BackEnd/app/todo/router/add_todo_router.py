from fastapi import APIRouter, status
from typing import List
from ..service.get_todos_service import add_todo
from ..schema.todo_schema import Todo, TodoCreate

router = APIRouter(prefix = "/todos", tags = ["Todos"])

@router.post(response_model=Todo, status_code=status.HTTP_201_CREATED)

def add_todo(todo_create : TodoCreate):
    return add_todo(todo_create)
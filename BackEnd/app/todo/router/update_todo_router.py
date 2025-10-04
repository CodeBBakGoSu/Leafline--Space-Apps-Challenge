from fastapi import APIRouter
from app.todo.service.update_todo_service import update_todo
from app.todo.schema.todo_schema import Todo, TodoUpdate
from app.todo.service.update_todo_service import update_todo as update_todo_service

router = APIRouter()


@router.patch("/todos/{todo_id}", response_model=Todo, tags=["Todos"])
def update_todo_route(todo_id: int, todo_update: TodoUpdate):
    """
    URL 경로에서 todo_id를, 요청 본문(body)에서 변경할 상태 정보를 받아
    서비스 함수를 호출합니다.
    """
    return update_todo_service(todo_id=todo_id, todo_update=todo_update)
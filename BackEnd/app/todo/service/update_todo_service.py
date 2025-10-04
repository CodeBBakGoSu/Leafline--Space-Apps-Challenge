
from fastapi import HTTPException
from app.todo.schema import todo_schema

def update_todo(todo_id: int, todo_update: todo_schema.TodoUpdate)->todo_schema.Todo:
    """
        지정된 ID의 할 일을 찾아 완료 상태를 변경하고,
        변경된 할 일 정보를 반환합니다.
        할 일이 존재하지 않으면 404 오류를 발생시킵니다.
        일단 완료 상태만 변경가능하나, 원래 기존의 데이터는 변경되지 않음.
    """
    for todo in todo_schema.todos:
        if todo.id == todo_id:
            if todo_update.completed is not None:
                todo.completed = todo_update.completed
            return todo
        
    raise HTTPException(status_code=404, detail=f"Todo with ID {todo_id} not found")

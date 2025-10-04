from ..schema import todo_schema

def add_todo(todo_create: todo_schema.TodoCreate) -> todo_schema.Todo:
    """새로운 할 일을 생성하고, 생성된 할 일을 반환"""
    # 새 ID 생성
    todo_schema.latest_todo_id += 1
    
    # 새 Todo 생성
    new_todo = todo_schema.Todo(
        id=todo_schema.latest_todo_id,
        content=todo_create.content,
        completed=False
    )
    
    # 리스트에 추가
    todo_schema.todos.append(new_todo)
    
    return new_todo
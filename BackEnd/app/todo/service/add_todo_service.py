from ..schema import TodoCreate, todos

def add_todo(todo_create: TodoCreate):
    """새로운 할 일을 생성하고, 생성된 할 일을 반환"""
    # global 키워드를 사용해 파일 외부의 latest_todo_id 변수를 수정
    global latest_todo_id
    latest_todo_id += 1
    
    new_todo = {
        "id": latest_todo_id,
        "content": todo_create.content,
        "duration": todo_create.duration,
        "completed": False  # 새로 추가된 할 일은 항상 '미완료' 상태
    }
    
    todos.append(new_todo)
    return new_todo
from typing import List
from ..schema import todo_schema

def get_all_todos() -> List[todo_schema.Todo]:
    """모든 할 일 목록을 반환"""
    return todo_schema.todos
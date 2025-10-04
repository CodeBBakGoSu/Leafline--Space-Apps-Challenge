from pydantic import BaseModel
from typing import List

class Todo(BaseModel):
    id: int
    content: str
    completed: bool

todos: List[Todo] = [
    Todo(id=1, content="Hive Inspection", completed=True),
    Todo(id=2, content="Pollen Patty Feeding", completed=False),
    Todo(id=3, content="Check Queen Bee Status and Egg Laying Pattern", completed=False),
]

latest_todo_id = 3

class TodoCreate(BaseModel):
    content: str

class TodoUpdate(BaseModel):
    id: str
    completed: bool


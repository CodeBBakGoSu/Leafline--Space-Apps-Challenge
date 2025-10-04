from pydantic import BaseModel
from typing import List

class Todo(BaseModel):
    id: int
    title: str
    completed: bool

todos: List[Todo] = [
    Todo(id=1, title="FastAPI", completed=False),
    Todo(id=2, title="React", completed=True),
]

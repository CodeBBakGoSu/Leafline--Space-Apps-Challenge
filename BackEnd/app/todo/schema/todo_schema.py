from pydantic import BaseModel
from typing import List

class Todo(BaseModel):
    id: int
    content: str
    duration: str
    completed: bool

todos: List[Todo] = [
    Todo(id=1, content= "Hive Inspection", duration= "about 1 hours", completed=True),
    Todo(id=2, content="Pollen Patty Feeding", duration="about 2 hours", completed=False),
]

latest_todo_id = 2

class TodoCreate(BaseModel):
    content : str
    duration : str



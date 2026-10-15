from datetime import datetime
from typing import Annotated
from pydantic import BaseModel, StringConstraints

# Название коллекции: пробелы по краям обрезаются, длина 1–40 симв.
CollectionName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=40)]

class CollectionCreate(BaseModel):
    name: CollectionName

class CollectionUpdate(BaseModel):
    name: CollectionName

class CollectionOut(BaseModel):
    id: int
    name: str
    created_at: datetime
    link_count: int

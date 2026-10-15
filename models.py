from datetime import datetime
from typing import Annotated
from pydantic import BaseModel, ConfigDict, StringConstraints, field_validator
from normalize import normalize_tags, validate_url

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

# Ссылки
LinkTitle = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
LinkDescription = Annotated[str, StringConstraints(strip_whitespace=True, max_length=500)]
LinkUrl = Annotated[str, StringConstraints(max_length=2048)]

# Проверки для создания и изменения ссылки (пустое описание = null)
class LinkFields(BaseModel):
    @field_validator("description", check_fields=False)
    @classmethod
    def empty_description_to_none(cls, value):
        return value or None

    @field_validator("tags", check_fields=False)
    @classmethod
    def clean_tags(cls, value):
        return normalize_tags(value) if value is not None else value

class LinkCreate(LinkFields):
    url: LinkUrl
    title: LinkTitle
    description: LinkDescription | None = None
    collection_id: int
    tags: list[str] = []
    favorite: bool = False

    @field_validator("url")
    @classmethod
    def check_url(cls, value):
        return validate_url(value)

class LinkUpdate(LinkFields):
    model_config = ConfigDict(extra="forbid") # extra="forbid": неизвестные поля (в т. ч. url) дают 422 — url после создания не меняется
    title: LinkTitle = None
    description: LinkDescription | None = None
    collection_id: int = None
    tags: list[str] = None
    favorite: bool = None

class LinkOut(BaseModel):
    id: int
    url: str
    domain: str
    title: str
    description: str | None
    collection_id: int
    tags: list[str]
    favorite: bool
    created_at: datetime
    updated_at: datetime

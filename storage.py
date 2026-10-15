import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated
from fastapi import Depends, Request

logger = logging.getLogger("linkspace")

class JsonTable:
    def __init__(self, path: Path):
        self.path = path
        if not path.exists():
            path.parent.mkdir(parents=True, exist_ok=True)
            self._write({"next_id": 1, "items": []})
            logger.info("Data file not found, created empty: %s", path)

        data = json.loads(path.read_text(encoding="utf-8"))
        self.next_id = data["next_id"]
        self.items = data["items"]

    # Присвоение следующего свободного номера
    def new_id(self) -> int:
        item_id = self.next_id
        self.next_id += 1
        return item_id

    def get(self, item_id: int):
        return next((item for item in self.items if item["id"] == item_id), None)

    def save(self):
        self._write({"next_id": self.next_id, "items": self.items})

    # Сначала пишем во временный файл, потом меняем основной (если программа упадет посреди записи, старый файл останется целым)
    def _write(self, data: dict):
        tmp_path = self.path.with_suffix(".tmp")
        tmp_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp_path.replace(self.path)

# Все данные приложения (коллекции + ссылки)
class Storage:
    def __init__(self, data_dir: Path):
        self.collections = JsonTable(data_dir / "collections.json")
        self.links = JsonTable(data_dir / "links.json")

def get_storage(request: Request) -> Storage:
    return request.app.state.storage

StorageDep = Annotated[Storage, Depends(get_storage)]
def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()

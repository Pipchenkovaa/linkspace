# LinkSpace: персональная библиотека полезных ссылок
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from routers import collections, library, links
from storage import Storage

VERSION = "1.0.0"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").strip().upper()

logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
)
logger = logging.getLogger("linkspace")

@asynccontextmanager
async def lifespan(app: FastAPI):
    data_dir = Path(os.getenv("DATA_DIR", "data"))
    app.state.storage = Storage(data_dir)
    logger.info("Application started: version=%s, data_dir=%s", VERSION, data_dir)
    yield
    logger.info("Application stopped")

app = FastAPI(
    title="LinkSpace",
    description="Персональная библиотека полезных ссылок: коллекции, теги, избранное и поиск.",
    version=VERSION,
    lifespan=lifespan,
)

@app.get("/health", tags=["system"])
def health():
    return {"status": "ok"}

@app.get("/version", tags=["system"])
def version():
    return {"version": VERSION}

# Подключение маршрутов из /routers
app.include_router(collections.router)
app.include_router(links.router)
app.include_router(library.router)

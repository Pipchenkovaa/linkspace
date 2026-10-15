# LinkSpace: персональная библиотека полезных ссылок
import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI

VERSION = "1.0.0"
DATA_DIR = os.getenv("DATA_DIR", "data")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").strip().upper()

logging.basicConfig(
    level=LOG_LEVEL,
    format = "%(asctime)s %(levelname)-8s %(name)s: %(message)s",
)
logger = logging.getLogger("linkspace")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application started: version = %s, data_dir = %s", VERSION, DATA_DIR)
    yield
    logger.info("Application stopped")


app = FastAPI(
    title="LinkSpace",
    description = "Персональная библиотека полезных ссылок: коллекции, теги, избранное и поиск.",
    version = VERSION,
    lifespan = lifespan,
)


@app.get("/health")
def health():
    # Cервис жив?
    return {"status": "ok"}


@app.get("/version")
def version():
    return {"version": VERSION}

import logging
from fastapi import APIRouter, HTTPException, Response
from models import LinkCreate, LinkOut, LinkUpdate
from normalize import extract_domain, normalize_url
from routers.collections import find_collection
from storage import Storage, StorageDep, utc_now

logger = logging.getLogger("linkspace")
router = APIRouter(prefix="/links", tags=["links"])

def link_out(link: dict) -> LinkOut:
    return LinkOut(**{key: value for key, value in link.items() if key != "normalized_url"})

def find_link(storage: Storage, link_id: int) -> dict:
    link = storage.links.get(link_id)
    if link is None:
        logger.warning("Link not found: id=%s", link_id)
        raise HTTPException(status_code=404, detail="Link not found")
    return link

# 1 url = 1 ссылка в библиотеке (на дубликат будет ответ 409 с данными существующей ссылки + чтобы фронт мог показать «уже есть в коллекции X» и предложить перенести)
def ensure_url_is_new(storage: Storage, normalized_url: str):
    for link in storage.links.items:
        if link["normalized_url"] == normalized_url:
            collection = storage.collections.get(link["collection_id"])
            logger.warning("Duplicate link: existing_id=%s", link["id"])
            raise HTTPException(
                status_code=409,
                detail={
                    "message": "Link already exists",
                    "existing_link_id": link["id"],
                    "collection_id": link["collection_id"],
                    "collection_name": collection["name"] if collection else None,
                },
            )

# Поиск: подстрока без учета регистра в названии, описании, url, тегах
def matches_search(link: dict, query: str) -> bool:
    fields = [link["title"], link["description"] or "", link["url"], *link["tags"]]
    return any(query in field.lower() for field in fields)

# Все ссылки, новые первыми; фильтры необязательные и складываются через &/и
@router.get("", response_model=list[LinkOut])
def list_links(
    storage: StorageDep,
    search: str | None = None,
    tag: str | None = None,
    collection_id: int | None = None,
    favorite: bool | None = None,
):
    links = storage.links.items
    if collection_id is not None:
        find_collection(storage, collection_id)
        links = [link for link in links if link["collection_id"] == collection_id]
    if favorite is not None:
        links = [link for link in links if link["favorite"] == favorite]
    if tag and tag.strip():
        tag = tag.strip().lower()
        links = [link for link in links if tag in link["tags"]]
    if search and search.strip():
        query = search.strip().lower()
        links = [link for link in links if matches_search(link, query)]
        logger.info("Search: query=%r, results=%s", query, len(links))
    links = sorted(links, key=lambda link: link["id"], reverse=True)
    return [link_out(link) for link in links]

@router.post("", response_model=LinkOut, status_code=201)
def create_link(data: LinkCreate, storage: StorageDep):
    find_collection(storage, data.collection_id)
    normalized = normalize_url(data.url)
    ensure_url_is_new(storage, normalized)

    table = storage.links
    now = utc_now()
    link = {
        "id": table.new_id(),
        "url": data.url,
        "normalized_url": normalized,
        "domain": extract_domain(data.url),
        "title": data.title,
        "description": data.description,
        "collection_id": data.collection_id,
        "tags": data.tags,
        "favorite": data.favorite,
        "created_at": now,
        "updated_at": now,
    }
    table.items.append(link)
    table.save()
    logger.info("Link created: id=%s, collection_id=%s", link["id"], link["collection_id"])
    return link_out(link)

@router.get("/{link_id}", response_model=LinkOut)
def get_link(link_id: int, storage: StorageDep):
    return link_out(find_link(storage, link_id))

@router.patch("/{link_id}", response_model=LinkOut)
def update_link(link_id: int, data: LinkUpdate, storage: StorageDep):
    link = find_link(storage, link_id)
    changes = data.model_dump(exclude_unset=True)
    if "collection_id" in changes:
        find_collection(storage, changes["collection_id"])
        if changes["collection_id"] != link["collection_id"]:
            logger.info("Link moved: id=%s, collection_id=%s", link_id, changes["collection_id"])
    link.update(changes)
    link["updated_at"] = utc_now()
    storage.links.save()
    logger.info("Link updated: id=%s, fields=%s", link_id, sorted(changes))
    return link_out(link)

@router.delete("/{link_id}", status_code=204)
def delete_link(link_id: int, storage: StorageDep):
    link = find_link(storage, link_id)
    storage.links.items.remove(link)
    storage.links.save()
    logger.info("Link deleted: id=%s", link_id)
    return Response(status_code=204)

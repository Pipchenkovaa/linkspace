import logging
from fastapi import APIRouter, HTTPException, Response
from models import CollectionCreate, CollectionOut, CollectionUpdate
from storage import Storage, StorageDep, utc_now

logger = logging.getLogger("linkspace")
router = APIRouter(prefix="/collections", tags=["collections"])

# Добавление к коллекции вычисляемого поля link_count
def collection_out(storage: Storage, collection: dict) -> CollectionOut:
    link_count = sum(1 for link in storage.links.items if link["collection_id"] == collection["id"])
    return CollectionOut(**collection, link_count=link_count)

def find_collection(storage: Storage, collection_id: int) -> dict:
    collection = storage.collections.get(collection_id)
    if collection is None:
        logger.warning("Collection not found: id=%s", collection_id)
        raise HTTPException(status_code=404, detail="Collection not found")
    return collection

# Названия коллекций уникальны без учета регистра; повтор — 409
def ensure_name_is_free(storage: Storage, name: str, except_id: int | None = None):
    for collection in storage.collections.items:
        if collection["name"].casefold() == name.casefold() and collection["id"] != except_id:
            logger.warning("Duplicate collection name: %r, existing_id=%s", name, collection["id"])
            raise HTTPException(status_code=409, detail="Collection with this name already exists")

@router.get("", response_model=list[CollectionOut])
def list_collections(storage: StorageDep):
    return [collection_out(storage, c) for c in storage.collections.items]

# Создание коллекции (название уникально, регистр не учитывается)
@router.post("", response_model=CollectionOut, status_code=201)
def create_collection(data: CollectionCreate, storage: StorageDep):
    ensure_name_is_free(storage, data.name)
    table = storage.collections
    collection = {"id": table.new_id(), "name": data.name, "created_at": utc_now()}
    table.items.append(collection)
    table.save()
    logger.info("Collection created: id=%s, name=%r", collection["id"], collection["name"])
    return collection_out(storage, collection)

@router.get("/{collection_id}", response_model=CollectionOut)
def get_collection(collection_id: int, storage: StorageDep):
    return collection_out(storage, find_collection(storage, collection_id))

@router.patch("/{collection_id}", response_model=CollectionOut)
def rename_collection(collection_id: int, data: CollectionUpdate, storage: StorageDep):
    collection = find_collection(storage, collection_id)
    ensure_name_is_free(storage, data.name, except_id=collection_id)
    collection["name"] = data.name
    storage.collections.save()
    logger.info("Collection renamed: id=%s, name=%r", collection_id, data.name)
    return collection_out(storage, collection)

@router.delete("/{collection_id}", status_code=204)
def delete_collection(collection_id: int, storage: StorageDep, move_to: int | None = None):
    collection = find_collection(storage, collection_id)
    links = [link for link in storage.links.items if link["collection_id"] == collection_id]
    if move_to is not None:
        if move_to == collection_id:
            raise HTTPException(status_code=400, detail="Cannot move links into the collection being deleted")
        find_collection(storage, move_to)
    elif links:
        logger.warning("Collection not empty: id=%s, links=%s", collection_id, len(links))
        raise HTTPException(
            status_code=409,
            detail={"message": "Collection is not empty", "link_count": len(links)},
        )
    
    for link in links:
        link["collection_id"] = move_to
        link["updated_at"] = utc_now()
    if links:
        storage.links.save()
    storage.collections.items.remove(collection)
    storage.collections.save()
    logger.info("Collection deleted: id=%s, moved_links=%s, to=%s", collection_id, len(links), move_to)
    return Response(status_code=204)

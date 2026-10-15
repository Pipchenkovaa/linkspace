from fastapi import APIRouter
from models import StatsOut, TagOut
from storage import Storage, StorageDep

router = APIRouter(tags=["library"])

def count_tags(storage: Storage) -> dict[str, int]:
    counts = {}
    for link in storage.links.items:
        for tag in link["tags"]:
            counts[tag] = counts.get(tag, 0) + 1
    return counts

@router.get("/tags", response_model=list[TagOut])
def list_tags(storage: StorageDep):
    counts = count_tags(storage)
    ordered = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    return [TagOut(name=name, count=count) for name, count in ordered]

@router.get("/stats", response_model=StatsOut)
def get_stats(storage: StorageDep):
    links = storage.links.items
    return StatsOut(
        total_links=len(links),
        favorite_links=sum(1 for link in links if link["favorite"]),
        total_collections=len(storage.collections.items),
        total_tags=len(count_tags(storage)),
    )

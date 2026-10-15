# Автотесты: запуск командой "python -m pytest -v"
# Каждый тест проверяет 1 правило из docs/mvp.md
# Тесты не зависят друг от друга и от порядка запуска
import pytest
from fastapi.testclient import TestClient
import app_final

@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("DATA_DIR", str(tmp_path))
    with TestClient(app_final.app) as test_client:
        yield test_client

def create_collection(client, name="Development"):
    response = client.post("/collections", json={"name": name})
    assert response.status_code == 201, response.text
    return response.json()

def create_link(client, collection_id, url="https://react.dev/learn", **fields):
    payload = {"url": url, "title": "React Learn", "collection_id": collection_id, **fields}
    response = client.post("/links", json=payload)
    assert response.status_code == 201, response.text
    return response.json()

def test_health_returns_ok(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_version_returns_app_version(client):
    response = client.get("/version")
    assert response.status_code == 200
    assert response.json() == {"version": "1.0.0"}

def test_data_survives_restart(tmp_path, monkeypatch):
    monkeypatch.setenv("DATA_DIR", str(tmp_path))
    with TestClient(app_final.app) as first_run:
        collection = create_collection(first_run, "Design")
        create_link(first_run, collection["id"])
    with TestClient(app_final.app) as second_run:
        assert [c["name"] for c in second_run.get("/collections").json()] == ["Design"]
        assert len(second_run.get("/links").json()) == 1

# Коллекции
def test_link_in_missing_collection_returns_404(client):
    response = client.post("/links", json={"url": "https://react.dev", "title": "React", "collection_id": 99})
    assert response.status_code == 404
    assert client.get("/links").json() == []

def test_duplicate_collection_name_ignores_case(client):
    create_collection(client, "Design")
    response = client.post("/collections", json={"name": " design "})
    assert response.status_code == 409
    assert len(client.get("/collections").json()) == 1

def test_rename_to_taken_name_returns_409(client):
    create_collection(client, "Design")
    other = create_collection(client, "Development")
    response = client.patch(f"/collections/{other['id']}", json={"name": "DESIGN"})
    assert response.status_code == 409
    assert client.get(f"/collections/{other['id']}").json()["name"] == "Development"

# Удаление коллекции
def test_delete_non_empty_collection_without_move_to_returns_409(client):
    collection = create_collection(client)
    create_link(client, collection["id"])
    response = client.delete(f"/collections/{collection['id']}")
    assert response.status_code == 409
    assert response.json()["detail"]["link_count"] == 1
    assert client.get(f"/collections/{collection['id']}").status_code == 200

def test_delete_collection_with_move_to_moves_links(client):
    source = create_collection(client, "Old")
    target = create_collection(client, "New")
    link = create_link(client, source["id"])
    response = client.delete(f"/collections/{source['id']}?move_to={target['id']}")
    assert response.status_code == 204
    assert client.get(f"/collections/{source['id']}").status_code == 404
    assert client.get(f"/links/{link['id']}").json()["collection_id"] == target["id"]

@pytest.mark.parametrize("move_to, expected_status", [(99, 404), ("self", 400)])
def test_delete_collection_with_bad_move_to_changes_nothing(client, move_to, expected_status):
    collection = create_collection(client)
    link = create_link(client, collection["id"])
    target = collection["id"] if move_to == "self" else move_to
    response = client.delete(f"/collections/{collection['id']}?move_to={target}")
    assert response.status_code == expected_status
    assert client.get(f"/collections/{collection['id']}").status_code == 200
    assert client.get(f"/links/{link['id']}").json()["collection_id"] == collection["id"]

# Дубликаты
def test_duplicate_url_returns_409_with_existing_link(client):
    design = create_collection(client, "Design")
    other = create_collection(client, "Other")
    existing = create_link(client, design["id"], url="https://react.dev/learn")
    response = client.post(
        "/links", json={"url": "https://react.dev/learn", "title": "Again", "collection_id": other["id"]}
    )
    assert response.status_code == 409
    assert response.json()["detail"] == {
        "message": "Link already exists",
        "existing_link_id": existing["id"],
        "collection_id": design["id"],
        "collection_name": "Design",
    }
    assert len(client.get("/links").json()) == 1

@pytest.mark.parametrize(
    "variant",
    [
        "https://React.DEV/learn",
        "https://react.dev/learn/",
        "https://react.dev/learn#hooks",
        "https://react.dev/learn?utm_source=telegram",
    ],
)
def test_duplicate_detection_normalizes_url(client, variant):
    collection = create_collection(client)
    create_link(client, collection["id"], url="https://react.dev/learn")
    response = client.post("/links", json={"url": variant, "title": "Again", "collection_id": collection["id"]})
    assert response.status_code == 409

@pytest.mark.parametrize("different_url", ["https://react.dev/Learn", "https://react.dev/learn?lang=ru"])
def test_different_urls_are_not_duplicates(client, different_url):
    collection = create_collection(client)
    create_link(client, collection["id"], url="https://react.dev/learn")
    create_link(client, collection["id"], url=different_url)
    assert len(client.get("/links").json()) == 2

# Изменение ссылки, url,  теги
def test_patch_moves_link_and_keeps_other_fields(client):
    source = create_collection(client, "Source")
    target = create_collection(client, "Target")
    link = create_link(client, source["id"], tags=["react"], favorite=True)
    response = client.patch(f"/links/{link['id']}", json={"collection_id": target["id"]})
    assert response.status_code == 200
    moved = response.json()
    assert moved["collection_id"] == target["id"]
    assert (moved["title"], moved["tags"], moved["favorite"]) == (link["title"], ["react"], True)

def test_patch_with_url_returns_422(client):
    collection = create_collection(client)
    link = create_link(client, collection["id"], url="https://react.dev/learn")
    response = client.patch(f"/links/{link['id']}", json={"url": "https://other.dev"})
    assert response.status_code == 422
    assert client.get(f"/links/{link['id']}").json()["url"] == "https://react.dev/learn"

def test_create_link_normalizes_tags_and_fills_domain(client):
    collection = create_collection(client)
    link = create_link(
        client, collection["id"], url="https://www.react.dev/learn", description="", tags=[" React", "react", "", "Docs "]
    )
    assert link["tags"] == ["react", "docs"]
    assert link["domain"] == "react.dev"
    assert link["description"] is None
    assert "normalized_url" not in link

# Поиск + фильтры + сортировка
@pytest.fixture
def library(client):
    dev = create_collection(client, "Development")
    design = create_collection(client, "Design")
    create_link(client, dev["id"], url="https://react.dev/learn", title="React Learn",
                description="Official docs", tags=["react", "docs"], favorite=True)
    create_link(client, dev["id"], url="https://python.org", title="Python", tags=["python", "docs"])
    create_link(client, design["id"], url="https://21st.dev", title="UI components",
                description="React UI kit", tags=["design", "ui"], favorite=True)
    create_link(client, dev["id"], url="https://fastapi.tiangolo.com", title="FastAPI",
                description="Python web framework", tags=["python", "backend"], favorite=True)
    return {"dev": dev, "design": design}

def link_ids(response):
    assert response.status_code == 200, response.text
    return [link["id"] for link in response.json()]

def test_search_ignores_case_and_looks_beyond_title(client, library):
    assert link_ids(client.get("/links", params={"search": "PYTHON"})) == [4, 2]

def test_filters_combine_with_and(client, library):
    params = {"search": "react", "favorite": "true", "collection_id": library["dev"]["id"]}
    assert link_ids(client.get("/links", params=params)) == [1]

def test_filter_by_missing_collection_returns_404(client, library):
    assert client.get("/links", params={"collection_id": 99}).status_code == 404

def test_links_are_sorted_newest_first(client, library):
    assert link_ids(client.get("/links")) == [4, 3, 2, 1]

# Удаление ссылки + номера
def test_delete_link(client):
    collection = create_collection(client)
    link = create_link(client, collection["id"])
    assert client.delete(f"/links/{link['id']}").status_code == 204
    assert client.get(f"/links/{link['id']}").status_code == 404

def test_ids_are_not_reused_after_delete(client):
    collection = create_collection(client)
    first = create_link(client, collection["id"], url="https://a.dev")
    client.delete(f"/links/{first['id']}")
    second = create_link(client, collection["id"], url="https://b.dev")
    assert second["id"] == 2

# Теги + статистика
def test_tags_are_counted_and_sorted(client, library):
    assert client.get("/tags").json() == [
        {"name": "docs", "count": 2},
        {"name": "python", "count": 2},
        {"name": "backend", "count": 1},
        {"name": "design", "count": 1},
        {"name": "react", "count": 1},
        {"name": "ui", "count": 1},
    ]

def test_stats(client, library):
    assert client.get("/stats").json() == {
        "total_links": 4,
        "favorite_links": 3,
        "total_collections": 2,
        "total_tags": 6,
    }

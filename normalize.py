from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

TAG_MAX_LENGTH = 30

def validate_url(url: str) -> str:
    url = url.strip()
    parts = urlsplit(url)
    if parts.scheme.lower() not in ("http", "https") or not parts.hostname:
        raise ValueError("URL must start with http:// or https:// and contain a domain")
    return url

def normalize_url(url: str) -> str:
    parts = urlsplit(url.strip())
    query = [
        (key, value)
        for key, value in parse_qsl(parts.query, keep_blank_values=True)
        if not key.lower().startswith("utm_")
    ]
    return urlunsplit((
        parts.scheme.lower(),
        parts.netloc.lower(),
        parts.path.rstrip("/"),
        urlencode(query),
        "",
    ))

def extract_domain(url: str) -> str:
    hostname = urlsplit(url.strip()).hostname or ""
    return hostname.removeprefix("www.")

def normalize_tags(tags: list[str]) -> list[str]:
    result = []
    for tag in tags:
        tag = tag.strip().lower()
        if not tag or tag in result:
            continue
        if len(tag) > TAG_MAX_LENGTH:
            raise ValueError(f"Tag is longer than {TAG_MAX_LENGTH} characters: {tag!r}")
        result.append(tag)
    return result

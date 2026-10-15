import type {
	Collection,
	CollectionNotEmptyDetail,
	DuplicateLinkDetail,
	Link,
	LinkCreate,
	LinkFilters,
	LinkUpdate,
	Stats,
	Tag,
	ValidationErrorItem,
} from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"

// detail бывает строкой (404, 400), объектом (409) или списком ошибок полей (422)
export type ErrorDetail = string | DuplicateLinkDetail | CollectionNotEmptyDetail | ValidationErrorItem[]

export class ApiError extends Error {
	status: number
	detail: ErrorDetail | null

	constructor(status: number, detail: ErrorDetail | null) {
		super(typeof detail === "string" ? detail : `API error ${status}`)
		this.status = status
		this.detail = detail
	}
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
	let response: Response
	try {
		response = await fetch(`${API_URL}${path}`, {
			...init,
			// заголовок только для запросов с телом: GET без него обходится без лишнего CORS-запроса OPTIONS
			headers: init.body ? { "Content-Type": "application/json" } : undefined,
		})
	} catch {
		throw new ApiError(0, "Сервер не отвечает") // API не запущен или другой адрес
	}
	if (response.status === 204) return undefined as T
	const body = await response.json().catch(() => null)
	if (!response.ok) throw new ApiError(response.status, body?.detail ?? null)
	return body as T
}

// {collection_id: 2, search: ""} → "?collection_id=2"; пустые значения не отправляем
function query(params: Record<string, string | number | boolean | undefined>) {
	const search = new URLSearchParams()
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== "") search.set(key, String(value))
	}
	const text = search.toString()
	return text ? `?${text}` : ""
}

const json = (method: string, data: unknown): RequestInit => ({ method, body: JSON.stringify(data) })

export const api = {
	health: () => request<{ status: string }>("/health"),
	version: () => request<{ version: string }>("/version"),
	stats: () => request<Stats>("/stats"),
	tags: () => request<Tag[]>("/tags"),

	collections: () => request<Collection[]>("/collections"),
	createCollection: (name: string) => request<Collection>("/collections", json("POST", { name })),
	renameCollection: (id: number, name: string) => request<Collection>(`/collections/${id}`, json("PATCH", { name })),
	deleteCollection: (id: number, moveTo?: number) =>
		request<void>(`/collections/${id}${query({ move_to: moveTo })}`, { method: "DELETE" }),

	links: (filters: LinkFilters = {}) => request<Link[]>(`/links${query(filters)}`),
	createLink: (data: LinkCreate) => request<Link>("/links", json("POST", data)),
	updateLink: (id: number, data: LinkUpdate) => request<Link>(`/links/${id}`, json("PATCH", data)),
	deleteLink: (id: number) => request<void>(`/links/${id}`, { method: "DELETE" }),
}

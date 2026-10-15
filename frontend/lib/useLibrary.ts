import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { api, ApiError } from "./api"
import type { Collection, Link, Stats } from "./types"
export type Filters = {
	collectionId: number | null
	favorite: boolean
	tag: string | null
	search: string
}
export type LibraryStatus = "loading" | "ready" | "offline"
export type TagCount = { name: string; count: number }

const NO_FILTERS: Filters = {
	collectionId: null,
	favorite: false,
	tag: null,
	search: "",
}
const SERVER_ERROR =
	"Что-то пошло не так. Не удалось выполнить действие. Попробуй еще раз."
const isOffline = (error: unknown) =>
	error instanceof ApiError && error.status === 0

export function useLibrary(onError: (message: string) => void) {
	const [status, setStatus] = useState<LibraryStatus>("loading")
	const [online, setOnline] = useState(true)
	const [collections, setCollections] = useState<Collection[]>([])
	const [allLinks, setAllLinks] = useState<Link[]>([])
	const [stats, setStats] = useState<Stats | null>(null)
	const [links, setLinks] = useState<Link[] | null>(null)
	const [filters, setFilters] = useState<Filters>(NO_FILTERS)
	const [version, setVersion] = useState(0) // +1 (загрузить библиотеку заново)
	const statusRef = useRef(status)

	useEffect(() => {
		statusRef.current = status
	}, [status])

	const reload = () => setVersion((v) => v + 1)
	const fail = useCallback(
		(error: unknown) => {
			if (isOffline(error)) {
				setStatus("offline")
				setOnline(false)
			} else {
				onError(SERVER_ERROR)
			}
		},
		[onError],
	)

	useEffect(() => {
		let cancelled = false
		Promise.all([api.collections(), api.links(), api.stats()])
			.then(([nextCollections, nextLinks, nextStats]) => {
				if (cancelled) return
				setCollections(nextCollections)
				setAllLinks(nextLinks)
				setStats(nextStats)
				setStatus("ready")
				setOnline(true)
			})
			.catch((error) => {
				if (!cancelled) fail(error)
			})
		return () => {
			cancelled = true
		}
	}, [version, fail])

	useEffect(() => {
		if (status !== "ready") return
		let cancelled = false
		const timer = setTimeout(
			() => {
				api
					.links({
						collection_id: filters.collectionId ?? undefined,
						favorite: filters.favorite || undefined,
						tag: filters.tag ?? undefined,
						search: filters.search.trim() || undefined,
					})
					.then((result) => {
						if (!cancelled) setLinks(result)
					})
					.catch((error) => {
						if (!cancelled) fail(error)
					})
			},
			filters.search ? 250 : 0,
		)
		return () => {
			cancelled = true
			clearTimeout(timer)
		}
	}, [filters, status, version, fail])

	useEffect(() => {
		const timer = setInterval(() => {
			api
				.health()
				.then(() => {
					setOnline(true)
					if (statusRef.current === "offline") setVersion((v) => v + 1)
				})
				.catch(() => setOnline(false))
		}, 30_000)
		return () => clearInterval(timer)
	}, [])

	const retry = () => {
		setStatus("loading")
		reload()
	}
	const run = async (action: () => Promise<unknown>) => {
		try {
			await action()
			reload()
			return true
		} catch (error) {
			fail(error)
			return false
		}
	}

	const toggleFavorite = (link: Link) =>
		run(() => api.updateLink(link.id, { favorite: !link.favorite }))
	const deleteLink = (link: Link) => run(() => api.deleteLink(link.id))
	const selectedCollection =
		collections.find((c) => c.id === filters.collectionId) ?? null
	const scopeLinks = useMemo(
		() =>
			filters.collectionId == null
				? allLinks
				: allLinks.filter((l) => l.collection_id === filters.collectionId),
		[allLinks, filters.collectionId],
	)
	const tags = useMemo(() => {
		const counts = new Map<string, number>()
		for (const link of scopeLinks) {
			if (filters.favorite && !link.favorite) continue
			for (const tag of link.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
		}
		if (filters.tag && !counts.has(filters.tag)) counts.set(filters.tag, 0) // выбранный тег не пропадает
		return [...counts]
			.map(([name, count]): TagCount => ({ name, count }))
			.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
	}, [scopeLinks, filters.favorite, filters.tag])

	return {
		status,
		online,
		collections,
		allLinks,
		stats,
		links,
		filters,
		tags,
		selectedCollection,
		scopeCount: scopeLinks.length,
		hasFilters:
			filters.favorite || filters.tag !== null || filters.search.trim() !== "",

		selectCollection: (id: number) =>
			setFilters((f) => ({
				...f,
				collectionId: f.collectionId === id ? null : id,
			})),
		showAllCollections: () => setFilters((f) => ({ ...f, collectionId: null })),
		setFavorite: (favorite: boolean) => setFilters((f) => ({ ...f, favorite })),
		toggleTag: (tag: string) =>
			setFilters((f) => ({ ...f, tag: f.tag === tag ? null : tag })),
		setSearch: (search: string) => setFilters((f) => ({ ...f, search })),
		resetFilters: () =>
			setFilters((f) => ({ ...NO_FILTERS, collectionId: f.collectionId })),
		openCollection: (id: number) =>
			setFilters({ ...NO_FILTERS, collectionId: id }),

		refresh: reload,
		retry,
		toggleFavorite,
		deleteLink,
	}
}

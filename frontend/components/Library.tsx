"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { Link } from "@/lib/types"
import { useLibrary } from "@/lib/useLibrary"
import Filters from "./Filters"
import Header from "./Header"
import Hero from "./Hero"
import LinkForm, { type FormMode } from "./LinkForm"
import LinkList from "./LinkList"
import Shelf from "./Shelf"
import Toast from "./Toast"

export default function Library() {
	const [toast, setToast] = useState({ text: "", visible: false })
	const showToast = useCallback(
		(text: string) => setToast({ text, visible: true }),
		[],
	)

	useEffect(() => {
		if (!toast.visible) return
		const timer = setTimeout(
			() => setToast((current) => ({ ...current, visible: false })),
			2600,
		)
		return () => clearTimeout(timer)
	}, [toast])

	const library = useLibrary(showToast)
	const { filters, collections } = library
	const [form, setForm] = useState<FormMode | null>(null)
	const [highlightId, setHighlightId] = useState<number | null>(null)

	useEffect(() => {
		if (highlightId === null) return
		const timer = setTimeout(() => setHighlightId(null), 3200)
		return () => clearTimeout(timer)
	}, [highlightId])

	const openForm =
		library.status === "offline"
			? undefined
			: () => setForm({ kind: "create", collectionId: filters.collectionId })

	const saved = (link: Link, message: string) => {
		setForm(null)
		library.refresh()
		showToast(message)
		setHighlightId(link.id)
	}

	// «Показать ссылку» из поп-апа дубликата: открываем ее коллекцию и подсвечиваем карточку
	const showExisting = (linkId: number, collectionId: number) => {
		setForm(null)
		library.openCollection(collectionId)
		setHighlightId(linkId)
	}
	const collectionNames = useMemo(
		() => new Map(collections.map((c) => [c.id, c.name])),
		[collections],
	)

	const toggleFavorite = async (link: Link) => {
		if (await library.toggleFavorite(link))
			showToast(
				link.favorite ? "Убрано из избранного" : "Добавлено в избранное",
			)
	}

	const deleteLink = async (link: Link) => {
		if (await library.deleteLink(link)) showToast("Ссылка удалена")
	}

	const showLibrary = library.status === "ready" && collections.length > 0

	return (
		<div className="mx-auto w-full max-w-[1520px] px-(--page-pad) pt-4 pb-16 [--page-pad:20px] md:[--page-pad:48px]">
			<Header
				online={library.online}
				search={filters.search}
				onSearch={library.setSearch}
				onAdd={openForm}
			/>

			<Hero
				status={library.status}
				stats={library.stats}
				selected={library.selectedCollection}
				onShowAll={library.showAllCollections}
			/>

			{showLibrary && (
				<>
					<Shelf
						collections={collections}
						links={library.allLinks}
						selectedId={filters.collectionId}
						onSelect={library.selectCollection}
					/>
					<Filters
						favorite={filters.favorite}
						onFavorite={library.setFavorite}
						tags={library.tags}
						activeTag={filters.tag}
						onTag={library.toggleTag}
						found={library.links?.length ?? null}
						total={library.scopeCount}
						hasFilters={library.hasFilters}
						onReset={library.resetFilters}
					/>
				</>
			)}

			<LinkList
				status={library.status}
				links={library.links}
				collectionNames={collectionNames}
				filters={filters}
				scopeCount={library.scopeCount}
				highlightId={highlightId}
				onAdd={openForm}
				onEdit={(link) => setForm({ kind: "edit", link })}
				onRetry={library.retry}
				onReset={library.resetFilters}
				onToggleFavorite={toggleFavorite}
				onDelete={deleteLink}
				onTag={library.toggleTag}
			/>

			{form && (
				<LinkForm
					mode={form}
					collections={collections}
					links={library.allLinks}
					onClose={() => setForm(null)}
					onSaved={saved}
					onShowExisting={showExisting}
				/>
			)}

			<Toast {...toast} />
		</div>
	)
}

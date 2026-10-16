"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { Collection, Link } from "@/lib/types"
import { useLibrary } from "@/lib/useLibrary"
import DeleteCollectionDialog from "./DeleteCollectionDialog"
import Filters from "./Filters"
import Header from "./Header"
import LibrarySkeleton from "./LibrarySkeleton"
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
		library.status === "ready"
			? () => setForm({ kind: "create", collectionId: filters.collectionId })
			: undefined

	const saved = (link: Link, message: string) => {
		setForm(null)
		library.refresh()
		showToast(message)
		setHighlightId(link.id)
	}
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
	const [deletingId, setDeletingId] = useState<number | null>(null)
	const deleting = collections.find((c) => c.id === deletingId) ?? null
	const createCollection = async (name: string) => {
		const created = await library.createCollection(name)
		showToast(`Коллекция «${created.name}» создана`)
		return created
	}

	const renameCollection = async (id: number, name: string) => {
		const renamed = await library.renameCollection(id, name)
		showToast("Коллекция переименована")
		return renamed
	}

	const deleteCollection = async (collection: Collection, moveTo?: number) => {
		await library.deleteCollection(collection.id, moveTo)
		setDeletingId(null)
		const target = collections.find((c) => c.id === moveTo)
		const moved =
			collection.link_count === 1 ? "ссылка перенесена" : "ссылки перенесены"
		showToast(
			target
				? `Коллекция удалена, ${moved} в «${target.name}»`
				: `Коллекция «${collection.name}» удалена`,
		)
	}
	const retry = async () => {
		if (!(await library.retry())) showToast("Сервер все еще не отвечает")
	}
	const ready = library.status === "ready"

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

			{library.status === "loading" && <LibrarySkeleton />}

			{ready && (
				<Shelf
					collections={collections}
					links={library.allLinks}
					selectedId={filters.collectionId}
					onSelect={library.selectCollection}
					onCreate={createCollection}
					onRename={renameCollection}
					onDelete={(collection) => setDeletingId(collection.id)}
				/>
			)}
			{ready && library.scopeCount > 0 && (
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
				onRetry={retry}
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

			{deleting && (
				<DeleteCollectionDialog
					collection={deleting}
					collections={collections}
					onClose={() => setDeletingId(null)}
					onDelete={(moveTo) => deleteCollection(deleting, moveTo)}
					onRefresh={library.refresh}
				/>
			)}

			<Toast {...toast} />
		</div>
	)
}

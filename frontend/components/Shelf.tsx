"use client"

import { useEffect, useRef, useState } from "react"
import { ApiError } from "@/lib/api"
import type { Collection, Link } from "@/lib/types"
import Folder, { type FolderEdit } from "./Folder"
import FolderMenu, { MENU_SIZE } from "./FolderMenu"
import { ChevronLeftIcon, ChevronRightIcon } from "./icons"
import "./Shelf.css"

type Props = {
	collections: Collection[]
	links: Link[]
	selectedId: number | null
	onSelect: (id: number) => void
	onCreate: (name: string) => Promise<Collection>
	onRename: (id: number, name: string) => Promise<Collection>
	onDelete: (collection: Collection) => void
}

type Draft = {
	id: number | null // null — новая коллекция
	value: string
	error: string
	busy?: boolean
	saved?: Collection
}

const SCROLL_STEP = 532 // 2 папки за нажатие стрелки
const measure = (el: HTMLElement) => ({
	left: el.scrollLeft > 4,
	right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
})

const NAME_ERRORS: Record<number, string> = {
	0: "Сервер не отвечает",
	409: "Такая коллекция уже есть",
	422: "Название — от 1 до 40 символов",
}
const nameError = (error: unknown) =>
	(error instanceof ApiError && NAME_ERRORS[error.status]) ||
	"Не получилось, попробуй еще раз"

export default function Shelf({
	collections,
	links,
	selectedId,
	onSelect,
	onCreate,
	onRename,
	onDelete,
}: Props) {
	const shelf = useRef<HTMLDivElement>(null)
	const [edges, setEdges] = useState({ left: false, right: false })
	const [draft, setDraft] = useState<Draft | null>(null)
	const [menu, setMenu] = useState<{
		id: number
		left: number
		top: number
	} | null>(null)

	// черновик закрываем, только когда коллекция пришла с сервера, — так папка не мигает
	const saved = draft?.saved
	if (
		saved &&
		collections.some((c) => c.id === saved.id && c.name === saved.name)
	)
		setDraft(null)
	const creating = draft?.id === null
	const editing = draft !== null

	useEffect(() => {
		const el = shelf.current
		if (!el) return
		const observer = new ResizeObserver(() => setEdges(measure(el)))
		observer.observe(el)
		return () => observer.disconnect()
	}, [collections.length, creating])

	// клик мимо папки с полем отменяет создание или переименование
	useEffect(() => {
		if (!editing) return
		const onMouseDown = (event: MouseEvent) => {
			const target = event.target as Element
			if (!target.closest(".folder.is-editing, [data-new-collection]"))
				setDraft(null)
		}
		document.addEventListener("mousedown", onMouseDown)
		return () => document.removeEventListener("mousedown", onMouseDown)
	}, [editing])

	const latest = new Map<number, Link[]>()
	for (const link of links) {
		const list = latest.get(link.collection_id) ?? []
		if (list.length < 3) latest.set(link.collection_id, [...list, link])
	}
	const scroll = (direction: 1 | -1) =>
		shelf.current?.scrollBy({ left: direction * SCROLL_STEP })

	const startEdit = (next: Draft) => {
		setMenu(null)
		setDraft(next)
		requestAnimationFrame(() => {
			const folder = shelf.current?.querySelector(".folder.is-editing")
			folder?.scrollIntoView({ block: "nearest", inline: "nearest" })
			folder?.querySelector("input")?.focus({ preventScroll: true })
		})
	}
	const startNew = () =>
		startEdit(draft?.id === null ? draft : { id: null, value: "", error: "" })

	const submit = async () => {
		if (!draft || draft.busy) return
		const name = draft.value.trim()
		const current =
			draft.id === null ? null : collections.find((c) => c.id === draft.id)
		if (current === undefined) return setDraft(null)

		const taken = collections.some(
			(c) => c.id !== draft.id && c.name.toLowerCase() === name.toLowerCase(),
		)
		const problem = !name ? "Введи название" : taken ? NAME_ERRORS[409] : ""
		if (problem) return setDraft({ ...draft, error: problem })
		if (current?.name === name) return setDraft(null)

		const pending = { ...draft, busy: true }
		setDraft(pending)
		try {
			const result = current
				? await onRename(current.id, name)
				: await onCreate(name)
			setDraft((d) => (d === pending ? { ...d, saved: result } : d))
		} catch (error) {
			setDraft((d) =>
				d === pending ? { ...d, busy: false, error: nameError(error) } : d,
			)
		}
	}

	const edit: FolderEdit | undefined = draft
		? {
				label: draft.id === null ? "Новая коллекция" : "Переименовать",
				value: draft.value,
				error: draft.error,
				busy: !!draft.busy,
				onChange: (value) => setDraft({ ...draft, value, error: "" }),
				onSubmit: submit,
				onCancel: () => setDraft(null),
			}
		: undefined

	const toggleMenu = (id: number, button: HTMLElement) => {
		if (menu?.id === id) return setMenu(null)
		const rect = button.getBoundingClientRect()
		const below = rect.bottom + 8
		const fitsBelow = below + MENU_SIZE.height < window.innerHeight - 12
		setMenu({
			id,
			left: Math.max(
				12,
				Math.min(
					rect.right - MENU_SIZE.width,
					window.innerWidth - MENU_SIZE.width - 12,
				),
			),
			top: fitsBelow ? below : rect.top - 8 - MENU_SIZE.height,
		})
	}
	const menuCollection = collections.find((c) => c.id === menu?.id)
	const nextId = Math.max(0, ...collections.map((c) => c.id)) + 1

	const arrow =
		"glass grid size-9 place-items-center rounded-full text-ink transition-opacity disabled:cursor-default disabled:opacity-30"

	return (
		<section>
			<svg width="0" height="0" className="absolute" aria-hidden>
				<defs>
					<linearGradient id="folder-rim" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#fff" stopOpacity=".95" />
						<stop offset=".6" stopColor="#fff" stopOpacity=".35" />
						<stop offset="1" stopColor="#fff" stopOpacity=".6" />
					</linearGradient>
				</defs>
			</svg>

			<div className="flex min-h-9 items-center gap-2">
				<h2 className="text-[15px] font-semibold">
					Коллекции
					<span className="ml-1 font-normal text-muted">
						{collections.length}
					</span>
				</h2>
				<button
					type="button"
					data-new-collection
					onClick={startNew}
					className="ml-auto h-9 rounded-full px-3.5 text-sm font-medium whitespace-nowrap text-soft transition-colors hover:bg-black/5 hover:text-ink"
				>
					+ Новая коллекция
				</button>
				{(edges.left || edges.right) && (
					<div className="hidden gap-2 md:flex">
						<button
							className={arrow}
							disabled={!edges.left}
							onClick={() => scroll(-1)}
							aria-label="Прокрутить влево"
						>
							<ChevronLeftIcon />
						</button>
						<button
							className={arrow}
							disabled={!edges.right}
							onClick={() => scroll(1)}
							aria-label="Прокрутить вправо"
						>
							<ChevronRightIcon />
						</button>
					</div>
				)}
			</div>

			<div
				ref={shelf}
				onScroll={(event) => setEdges(measure(event.currentTarget))}
				className={`shelf ${edges.left ? "shelf-fade-left" : ""} ${edges.right ? "shelf-fade-right" : ""}`}
			>
				{collections.map((collection) => (
					<Folder
						key={collection.id}
						collection={collection}
						latest={latest.get(collection.id) ?? []}
						selected={collection.id === selectedId}
						onSelect={() => onSelect(collection.id)}
						menuOpen={collection.id === menu?.id}
						onMenu={(button) => toggleMenu(collection.id, button)}
						edit={draft?.id === collection.id ? edit : undefined}
					/>
				))}
				{creating && (
					<Folder
						key="new"
						collection={{ id: nextId, name: "", created_at: "", link_count: 0 }}
						latest={[]}
						edit={edit}
					/>
				)}
			</div>

			{menu && menuCollection && (
				<FolderMenu
					left={menu.left}
					top={menu.top}
					onClose={() => setMenu(null)}
					onRename={() =>
						startEdit({
							id: menuCollection.id,
							value: menuCollection.name,
							error: "",
						})
					}
					onDelete={() => {
						setMenu(null)
						onDelete(menuCollection)
					}}
				/>
			)}
		</section>
	)
}

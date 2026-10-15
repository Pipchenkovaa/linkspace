"use client"

import { useEffect, useRef, useState } from "react"
import type { Collection, Link } from "@/lib/types"
import Folder from "./Folder"
import { ChevronLeftIcon, ChevronRightIcon } from "./icons"
import "./Shelf.css"

type Props = {
	collections: Collection[]
	links: Link[]
	selectedId: number | null
	onSelect: (id: number) => void
}

const SCROLL_STEP = 532 // 2 папки за нажатие стрелки
const measure = (el: HTMLElement) => ({
	left: el.scrollLeft > 4,
	right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
})

export default function Shelf({
	collections,
	links,
	selectedId,
	onSelect,
}: Props) {
	const shelf = useRef<HTMLDivElement>(null)
	const [edges, setEdges] = useState({ left: false, right: false })

	useEffect(() => {
		const el = shelf.current
		if (!el) return
		const observer = new ResizeObserver(() => setEdges(measure(el)))
		observer.observe(el)
		return () => observer.disconnect()
	}, [collections.length])

	const latest = new Map<number, Link[]>()
	for (const link of links) {
		const list = latest.get(link.collection_id) ?? []
		if (list.length < 3) latest.set(link.collection_id, [...list, link])
	}
	const scroll = (direction: 1 | -1) =>
		shelf.current?.scrollBy({ left: direction * SCROLL_STEP })
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
				{(edges.left || edges.right) && (
					<div className="ml-auto hidden gap-2 md:flex">
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
					/>
				))}
			</div>
		</section>
	)
}

"use client"

import { useState } from "react"
import { nLinks } from "@/lib/plural"
import type { TagCount } from "@/lib/useLibrary"
import { StarIcon } from "./icons"

type Props = {
	favorite: boolean
	onFavorite: (value: boolean) => void
	tags: TagCount[]
	activeTag: string | null
	onTag: (tag: string) => void
	found: number | null
	total: number
	hasFilters: boolean
	onReset: () => void
}

const VISIBLE_TAGS = 8

const segment =
	"relative z-10 inline-flex h-[34px] items-center justify-center gap-1.5 rounded-full px-3.5 text-[13.5px] font-medium transition-colors duration-300"
const chip =
	"inline-flex h-[34px] items-center rounded-full px-3.5 text-[13px] font-medium transition-colors"
const chipIdle =
	"bg-white/[0.66] text-soft shadow-[inset_0_0_0_1px_var(--line)] backdrop-blur-[8px] hover:bg-white hover:text-ink"

export default function Filters({
	favorite,
	onFavorite,
	tags,
	activeTag,
	onTag,
	found,
	total,
	hasFilters,
	onReset,
}: Props) {
	const [expanded, setExpanded] = useState(false)

	let shown = expanded ? tags : tags.slice(0, VISIBLE_TAGS)
	const active = tags.find((tag) => tag.name === activeTag)
	if (active && !shown.includes(active)) shown = [...shown, active]
	const hidden = tags.length - shown.length

	return (
		<section className="mb-[18px] flex flex-wrap items-center gap-2">
			<div className="glass relative grid grid-cols-2 rounded-full p-1">
				<span
					className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.1),0_6px_14px_-8px_rgb(0_0_0/0.3)] transition-transform duration-[400ms] ease-spring ${favorite ? "translate-x-full" : ""}`}
				/>
				<button
					className={`${segment} ${favorite ? "text-soft" : "text-ink"}`}
					aria-pressed={!favorite}
					onClick={() => onFavorite(false)}
				>
					Все
				</button>
				<button
					className={`${segment} ${favorite ? "text-ink" : "text-soft"}`}
					aria-pressed={favorite}
					onClick={() => onFavorite(true)}
				>
					<StarIcon size={13} />
					Избранное
				</button>
			</div>

			{tags.length > 0 && <span className="mx-1.5 h-[22px] w-px bg-black/10" />}

			{shown.map((tag) => (
				<button
					key={tag.name}
					onClick={() => onTag(tag.name)}
					aria-pressed={tag.name === activeTag}
					className={`${chip} ${tag.name === activeTag ? "bg-ink text-white" : chipIdle}`}
				>
					{tag.name}
					<span
						className={`ml-[5px] font-normal ${tag.name === activeTag ? "text-[#9c9c9c]" : "text-muted"}`}
					>
						{tag.count}
					</span>
				</button>
			))}
			{hidden > 0 && (
				<button
					className={`${chip} ${chipIdle} text-ink`}
					onClick={() => setExpanded(true)}
				>
					Еще {hidden}
				</button>
			)}
			{expanded && tags.length > VISIBLE_TAGS && (
				<button
					className={`${chip} ${chipIdle} text-ink`}
					onClick={() => setExpanded(false)}
				>
					Свернуть
				</button>
			)}

			<div className="ml-auto flex items-center gap-2.5 text-[13px] text-soft">
				{hasFilters ? (
					<>
						Найдено {found ?? "…"} из {total}
						<button
							onClick={onReset}
							className="font-medium text-ink underline decoration-black/25 underline-offset-[3px]"
						>
							Сбросить
						</button>
					</>
				) : (
					`${nLinks(total)} [сначала новые]`
				)}
			</div>
		</section>
	)
}

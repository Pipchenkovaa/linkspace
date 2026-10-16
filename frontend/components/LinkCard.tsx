"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { accent } from "@/lib/colors"
import { shortUrl } from "@/lib/display"
import type { Link } from "@/lib/types"
import LinkTile from "./LinkTile"
import { PencilIcon, StarIcon, StarOutlineIcon, TrashIcon } from "./icons"

type Props = {
	link: Link
	collectionName: string | null // null — не показывать: коллекция и так открыта
	activeTag: string | null
	highlighted: boolean
	onEdit: () => void
	onToggleFavorite: () => void
	onDelete: () => void
	onTag: (tag: string) => void
}

const iconButton =
	"grid h-[34px] flex-none place-items-center overflow-hidden rounded-full transition-[opacity,width,margin,color,background-color] duration-200"
const iconIdle =
	"bg-white/70 text-[#b3b3b3] shadow-[inset_0_0_0_1px_var(--line)] hover:bg-white hover:text-ink"
const hoverOnly =
	"w-0 -ml-1.5 opacity-0 group-hover:ml-0 group-hover:w-[34px] group-hover:opacity-100 group-focus-within:ml-0 group-focus-within:w-[34px] group-focus-within:opacity-100 pointer-coarse:ml-0 pointer-coarse:w-[34px] pointer-coarse:opacity-100"

export default function LinkCard({
	link,
	collectionName,
	activeTag,
	highlighted,
	onEdit,
	onToggleFavorite,
	onDelete,
	onTag,
}: Props) {
	const [confirming, setConfirming] = useState(false)
	const card = useRef<HTMLElement>(null)

	useEffect(() => {
		if (highlighted)
			card.current?.scrollIntoView({ block: "center", behavior: "smooth" })
	}, [highlighted])

	return (
		<article
			ref={card}
			className={`group relative flex min-w-0 flex-col rounded-3xl bg-white/80 px-5 pt-[18px] pb-4 shadow-[inset_0_1px_0_#fff,inset_0_0_0_1px_rgb(255_255_255/0.7),var(--lift)] backdrop-blur-[14px] ${highlighted ? "link-flash" : ""}`}
			style={{ "--a": accent(link.collection_id) } as CSSProperties}
		>
			<div className="flex items-center gap-3">
				<LinkTile domain={link.domain} />
				<div className="min-w-0">
					<a
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						className="block truncate text-[15.5px] font-semibold tracking-[-0.01em] after:absolute after:inset-0 after:rounded-3xl"
					>
						{link.title}
					</a>
					<span
						className="block truncate text-[13px] text-muted"
						title={link.url}
					>
						{shortUrl(link.url)}
					</span>
				</div>
				<div className="relative z-10 ml-auto flex gap-1.5">
					<button
						className={`${iconButton} ${iconIdle} ${hoverOnly}`}
						onClick={onEdit}
						title="Изменить"
						aria-label="Изменить"
					>
						<PencilIcon size={15} />
					</button>
					<button
						className={`${iconButton} ${iconIdle} ${hoverOnly}`}
						onClick={() => setConfirming(true)}
						title="Удалить"
						aria-label="Удалить"
					>
						<TrashIcon size={15} />
					</button>
					<button
						className={`${iconButton} w-[34px] ${link.favorite ? "bg-linear-to-b from-[#303030] to-[#131313] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_6px_12px_-6px_rgb(0_0_0/0.5)]" : iconIdle}`}
						onClick={onToggleFavorite}
						title={link.favorite ? "Убрать из избранного" : "В избранное"}
						aria-pressed={link.favorite}
					>
						{link.favorite ? (
							<StarIcon size={15} />
						) : (
							<StarOutlineIcon size={15} />
						)}
					</button>
				</div>
			</div>

			{link.description && (
				<p className="mt-3 line-clamp-2 text-sm/normal text-soft">
					{link.description}
				</p>
			)}

			<div className="relative z-10 mt-auto flex flex-wrap items-center gap-1.5 pt-3.5">
				{confirming ? (
					<div className="flex w-full items-center gap-1.5 text-[13.5px] font-medium">
						<span className="mr-auto">Удалить ссылку?</span>
						<button
							onClick={() => setConfirming(false)}
							className="h-8 rounded-full px-3 text-[13px] text-soft hover:bg-black/5 hover:text-ink"
						>
							Отмена
						</button>
						<button
							onClick={onDelete}
							className="h-8 rounded-full bg-danger px-3 text-[13px] text-white"
						>
							Удалить
						</button>
					</div>
				) : (
					<>
						{link.tags.map((tag) => (
							<button
								key={tag}
								onClick={() => onTag(tag)}
								className={`inline-flex h-[26px] items-center rounded-full px-2.5 text-xs font-medium ${tag === activeTag ? "bg-ink text-white" : "bg-black/[0.045] text-soft hover:bg-black/[0.09] hover:text-ink"}`}
							>
								{tag}
							</button>
						))}
						{collectionName && (
							<span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted">
								<i className="size-[7px] rounded-full bg-(--a)" />
								{collectionName}
							</span>
						)}
					</>
				)}
			</div>
		</article>
	)
}

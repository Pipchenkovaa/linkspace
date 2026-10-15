import type { CSSProperties, KeyboardEvent } from "react"
import { accent } from "@/lib/colors"
import { domainMark } from "@/lib/display"
import { nLinks } from "@/lib/plural"
import type { Collection, Link } from "@/lib/types"
import "./Folder.css"

const FRONT_PATH =
	"M0 24 Q0 0 24 0 H96 Q106 0 114 8 L124 18 Q130 26 142 26 H224 Q248 26 248 50 V100 Q248 124 224 124 H24 Q0 124 0 100 Z"

type Props = {
	collection: Collection
	latest: Link[]
	selected: boolean
	onSelect: () => void
}

export default function Folder({
	collection,
	latest,
	selected,
	onSelect,
}: Props) {
	const [newest, second, third] = latest
	const onKeyDown = (event: KeyboardEvent) => {
		if (
			event.target === event.currentTarget &&
			(event.key === "Enter" || event.key === " ")
		) {
			event.preventDefault()
			onSelect()
		}
	}

	return (
		<div
			role="button"
			tabIndex={0}
			aria-pressed={selected}
			onClick={onSelect}
			onKeyDown={onKeyDown}
			className={`folder ${selected ? "is-selected" : ""}`}
			style={{ "--a": accent(collection.id) } as CSSProperties}
		>
			<div className="folder-back" />
			<div className="folder-shade" />

			{newest ? (
				<>
					{second && (
						<div className="folder-sheet sheet-left">
							{domainMark(second.domain)}
						</div>
					)}
					<div className="folder-sheet sheet-middle">
						{domainMark(newest.domain)}
					</div>
					{third && (
						<div className="folder-sheet sheet-right">
							{domainMark(third.domain)}
						</div>
					)}
				</>
			) : (
				<div className="folder-sheet sheet-middle sheet-blank" />
			)}

			<div className="folder-front">
				<svg className="folder-rim" viewBox="0 0 248 124" aria-hidden>
					<path d={FRONT_PATH} />
				</svg>
				<span className="folder-count">{nLinks(collection.link_count)}</span>
				<b className="folder-name" title={collection.name}>
					{collection.name}
				</b>
				<span className="folder-recent">
					{latest.length
						? latest
								.slice(0, 2)
								.map((link) => link.title)
								.join(" · ")
						: "Пока пусто"}
				</span>
			</div>
		</div>
	)
}

import type { CSSProperties, KeyboardEvent } from "react"
import { accent } from "@/lib/colors"
import { domainMark } from "@/lib/display"
import { nLinks } from "@/lib/plural"
import type { Collection, Link } from "@/lib/types"
import { DotsIcon } from "./icons"
import "./Folder.css"

const FRONT_PATH =
	"M0 24 Q0 0 24 0 H96 Q106 0 114 8 L124 18 Q130 26 142 26 H224 Q248 26 248 50 V100 Q248 124 224 124 H24 Q0 124 0 100 Z"

export type FolderEdit = {
	label: string
	value: string
	error: string
	busy: boolean
	onChange: (value: string) => void
	onSubmit: () => void
	onCancel: () => void
}

type Props = {
	collection: Collection
	latest: Link[]
	selected?: boolean
	onSelect?: () => void
	menuOpen?: boolean
	onMenu?: (button: HTMLButtonElement) => void
	edit?: FolderEdit // папка => поле для названия
}

export default function Folder({
	collection,
	latest,
	selected = false,
	onSelect,
	menuOpen = false,
	onMenu,
	edit,
}: Props) {
	const [newest, second, third] = latest
	const onKeyDown = (event: KeyboardEvent) => {
		if (
			event.target === event.currentTarget &&
			(event.key === "Enter" || event.key === " ")
		) {
			event.preventDefault()
			onSelect?.()
		}
	}
	const button = edit
		? {}
		: {
				role: "button",
				tabIndex: 0,
				"aria-pressed": selected,
				onClick: onSelect,
				onKeyDown,
			}

	return (
		<div
			{...button}
			className={`folder ${edit ? "is-editing" : selected ? "is-selected" : ""}`}
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

				{edit ? (
					<>
						<span className="folder-count">{edit.label}</span>
						<input
							className="folder-input"
							value={edit.value}
							readOnly={edit.busy}
							autoFocus
							onFocus={(event) => event.currentTarget.select()}
							maxLength={40}
							autoComplete="off"
							placeholder="Название"
							aria-label="Название коллекции"
							onChange={(event) => edit.onChange(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") edit.onSubmit()
								if (event.key === "Escape") edit.onCancel()
							}}
						/>
						<span
							className={`folder-hint ${edit.error ? "is-error" : ""}`}
							aria-live="polite"
						>
							{edit.error ||
								(edit.busy ? "Сохраняю…" : "Enter — сохранить, Esc — отмена")}
						</span>
					</>
				) : (
					<>
						<span className="folder-count">
							{nLinks(collection.link_count)}
						</span>
						<b className="folder-name" title={collection.name}>
							{collection.name}
						</b>
						<div className="folder-bottom">
							<span className="folder-recent">
								{latest.length
									? latest
											.slice(0, 2)
											.map((link) => link.title)
											.join(" · ")
									: "Пока пусто"}
							</span>
							{onMenu && (
								<button
									type="button"
									className="folder-more"
									aria-label={`Действия с коллекцией ${collection.name}`}
									aria-haspopup="menu"
									aria-expanded={menuOpen}
									onClick={(event) => {
										event.stopPropagation()
										onMenu(event.currentTarget)
									}}
								>
									<DotsIcon />
								</button>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	)
}

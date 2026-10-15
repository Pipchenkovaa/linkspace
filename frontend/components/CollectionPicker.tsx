import type { CSSProperties } from "react"
import { accent } from "@/lib/colors"
import type { Collection } from "@/lib/types"
import { CheckIcon } from "./icons"

export type CollectionChoice =
	| { kind: "existing"; id: number }
	| { kind: "new"; name: string }
	| null

type Props = {
	collections: Collection[]
	createdId: number | null
	choice: CollectionChoice
	draft: string | null // null — поле для новой коллекции закрыто
	newColor: string
	onPick: (id: number) => void
	onStartNew: () => void
	onDraft: (value: string) => void
	onCommit: () => void
	onCancel: () => void
}

const color = (value: string) => ({ "--a": value }) as CSSProperties

export default function CollectionPicker({
	collections,
	createdId,
	choice,
	draft,
	newColor,
	onPick,
	onStartNew,
	onDraft,
	onCommit,
	onCancel,
}: Props) {
	return (
		<div className="flex flex-wrap gap-1.5">
			{collections.map((collection) => {
				const on = choice?.kind === "existing" && choice.id === collection.id
				return (
					<button
						type="button"
						key={collection.id}
						className={`pill ${on ? "is-on" : ""}`}
						style={color(accent(collection.id))}
						aria-pressed={on}
						onClick={() => onPick(collection.id)}
					>
						<i />
						{collection.name}
						{collection.id === createdId && <em>новая</em>}
					</button>
				)
			})}

			{draft !== null ? (
				<span className="pill-input" style={color(newColor)}>
					<i />
					<input
						autoFocus
						value={draft}
						maxLength={40}
						placeholder="Название коллекции"
						aria-label="Название новой коллекции"
						onChange={(event) => onDraft(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault()
								onCommit()
							}
							if (event.key === "Escape") {
								event.stopPropagation()
								onCancel()
							}
						}}
					/>
					<button type="button" onClick={onCommit} aria-label="Готово">
						<CheckIcon size={13} />
					</button>
				</span>
			) : choice?.kind === "new" ? (
				<button
					type="button"
					className="pill is-on"
					style={color(newColor)}
					onClick={onStartNew}
					title="Изменить название"
				>
					<i />
					{choice.name}
					<em>новая</em>
				</button>
			) : (
				<button type="button" className="pill pill-new" onClick={onStartNew}>
					+ Новая коллекция
				</button>
			)}
		</div>
	)
}

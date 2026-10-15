type Props = {
	id: string
	tags: string[]
	draft: string
	invalid: boolean
	onDraft: (value: string) => void
	onAdd: (raw: string, rest: string) => void
	onRemove: (tag: string) => void
}

export default function TagInput({
	id,
	tags,
	draft,
	invalid,
	onDraft,
	onAdd,
	onRemove,
}: Props) {
	return (
		<label className={`form-input tag-box ${invalid ? "is-bad" : ""}`}>
			{tags.map((tag) => (
				<span key={tag} className="tag-chip">
					{tag}
					<button
						type="button"
						aria-label={`Убрать тег ${tag}`}
						onClick={() => onRemove(tag)}
					>
						×
					</button>
				</span>
			))}
			<input
				id={id}
				value={draft}
				placeholder={tags.length ? "" : "react, docs"}
				autoComplete="off"
				onChange={(event) => {
					const value = event.target.value
					if (!value.includes(",")) return onDraft(value)
					const parts = value.split(",")
					const rest = parts.pop() ?? ""
					onAdd(parts.join(","), rest)
				}}
				onKeyDown={(event) => {
					if (event.key === "Enter" && draft.trim()) {
						event.preventDefault()
						onAdd(draft, "")
					}
					if (event.key === "Backspace" && !draft && tags.length)
						onRemove(tags[tags.length - 1])
				}}
			/>
		</label>
	)
}

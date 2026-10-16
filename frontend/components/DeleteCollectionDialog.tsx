"use client"

import { useState, type CSSProperties } from "react"
import { ApiError } from "@/lib/api"
import { accent } from "@/lib/colors"
import { nLinks } from "@/lib/plural"
import type { Collection } from "@/lib/types"
import Modal from "./Modal"
import "./LinkForm.css"

type Props = {
	collection: Collection
	collections: Collection[]
	onClose: () => void
	onDelete: (moveTo?: number) => Promise<void>
	onRefresh: () => void
}

const ERRORS: Record<number, string> = {
	0: "Сервер не отвечает. Проверь, что API запущен.",
	404: "Коллекция уже удалена или не найдена.",
	409: "Пока окно было открыто, в коллекции появились ссылки.",
}

export default function DeleteCollectionDialog({
	collection,
	collections,
	onClose,
	onDelete,
	onRefresh,
}: Props) {
	const [target, setTarget] = useState<number | null>(null)
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState("")

	const count = collection.link_count
	const others = collections.filter((c) => c.id !== collection.id)
	const moveTo = others.find((c) => c.id === target)?.id
	const ready = count === 0 || moveTo !== undefined

	const remove = async () => {
		setBusy(true)
		setError("")
		try {
			await onDelete(count ? moveTo : undefined)
		} catch (problem) {
			const status = problem instanceof ApiError ? problem.status : -1
			setBusy(false)
			setError(ERRORS[status] ?? "Не получилось удалить. Попробуй еще раз.")
			if (status === 404 || status === 409) onRefresh() // подтянуть свежие данные
		}
	}

	return (
		<Modal
			onClose={onClose}
			size="sm"
			role="alertdialog"
			labelledBy="delete-collection-title"
		>
			<h3
				id="delete-collection-title"
				className="text-[22px] font-semibold tracking-[-0.02em] [overflow-wrap:anywhere]"
			>
				{count
					? `Удалить «${collection.name}»?`
					: `Удалить коллекцию «${collection.name}»?`}
			</h3>
			<p className="mt-2 text-[14.5px] text-soft">
				{count
					? `В коллекции ${nLinks(count)}. Выбери, куда ${count === 1 ? "ее" : "их"} перенести перед удалением.`
					: "Это действие нельзя отменить."}
			</p>

			{count > 0 && (
				<div className="form-field">
					<span className="form-label">Перенести в</span>
					{others.length ? (
						<div className="flex flex-wrap gap-1.5">
							{others.map((other) => (
								<button
									type="button"
									key={other.id}
									className={`pill ${other.id === target ? "is-on" : ""}`}
									style={{ "--a": accent(other.id) } as CSSProperties}
									aria-pressed={other.id === target}
									onClick={() => setTarget(other.id)}
								>
									<i />
									{other.name}
								</button>
							))}
						</div>
					) : (
						<p className="form-hint">
							Других коллекций нет. Сначала создай еще одну, чтобы было куда
							перенести ссылки
						</p>
					)}
				</div>
			)}

			{error && <p className="form-error mt-4">{error}</p>}

			<div className="mt-6 flex flex-wrap justify-end gap-2">
				<button type="button" className="btn-ghost" autoFocus onClick={onClose}>
					Отмена
				</button>
				<button
					type="button"
					className="btn-dark btn-danger"
					disabled={!ready || busy}
					onClick={remove}
				>
					{busy ? "Удаляю…" : count ? "Перенести и удалить" : "Удалить"}
				</button>
			</div>
		</Modal>
	)
}

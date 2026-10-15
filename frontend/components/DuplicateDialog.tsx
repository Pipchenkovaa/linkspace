import type { CSSProperties } from "react"
import { accent } from "@/lib/colors"
import { shortUrl } from "@/lib/display"
import type { DuplicateLinkDetail, Link } from "@/lib/types"
import LinkTile from "./LinkTile"
import Modal from "./Modal"
import { CopyIcon } from "./icons"

type Props = {
	detail: DuplicateLinkDetail
	existing: Link | null
	targetName: string
	same: boolean
	busy: boolean
	onShow: () => void
	onKeep: () => void
	onMove: () => void
	onBack: () => void
}

export default function DuplicateDialog({
	detail,
	existing,
	targetName,
	same,
	busy,
	onShow,
	onKeep,
	onMove,
	onBack,
}: Props) {
	const where = detail.collection_name ?? "другой"

	return (
		<Modal
			onClose={onBack}
			size="sm"
			layer="top"
			role="alertdialog"
			labelledBy="duplicate-title"
		>
			<div
				className="dup-icon"
				style={{ "--a": accent(detail.collection_id) } as CSSProperties}
			>
				<CopyIcon size={22} />
			</div>
			<h3
				id="duplicate-title"
				className="text-[22px] font-semibold tracking-[-0.02em]"
			>
				Опа, такая ссылка уже есть
			</h3>
			<p className="mt-2 text-[14.5px] text-soft">
				Эта ссылка уже сохранена в коллекции «{where}».
				{!same &&
					` Можно оставить ее там или перенести в «${targetName}». Данные из формы не сохранятся.`}
			</p>

			{existing && (
				<div
					className="dup-link"
					style={{ "--a": accent(existing.collection_id) } as CSSProperties}
				>
					<LinkTile domain={existing.domain} />
					<div className="min-w-0">
						<b className="block truncate text-[15px] font-semibold">
							{existing.title}
						</b>
						<span className="block truncate text-[13px] text-muted">
							{shortUrl(existing.url)}
						</span>
					</div>
				</div>
			)}

			<div className="mt-6 flex flex-wrap justify-end gap-2">
				{same ? (
					<>
						<button type="button" className="btn-ghost" onClick={onBack}>
							Закрыть
						</button>
						<button
							type="button"
							className="btn-dark"
							autoFocus
							onClick={onShow}
						>
							Показать ссылку
						</button>
					</>
				) : (
					<>
						<button type="button" className="btn-ghost" onClick={onKeep}>
							Оставить там
						</button>
						<button
							type="button"
							className="btn-dark"
							autoFocus
							disabled={busy}
							onClick={onMove}
						>
							Перенести в «{targetName}»
						</button>
					</>
				)}
			</div>
		</Modal>
	)
}

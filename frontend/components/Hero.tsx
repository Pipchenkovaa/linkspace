import type { ReactNode } from "react"
import { inCollections, nLinks } from "@/lib/plural"
import type { Collection, Stats } from "@/lib/types"
import type { LibraryStatus } from "@/lib/useLibrary"

type Props = {
	status: LibraryStatus
	stats: Stats | null
	selected: Collection | null
	onShowAll: () => void
}

export default function Hero({ status, stats, selected, onShowAll }: Props) {
	let title: ReactNode = <span className="text-faint">Загрузка…</span>
	if (status === "offline") title = "Эх, сервер не отвечает..."
	else if (stats && stats.total_collections === 0) title = "Пока пусто"
	else if (selected)
		title = (
			<>
				{selected.name}
				<span className="text-faint"> {nLinks(selected.link_count)}</span>
			</>
		)
	else if (stats)
		title = `${nLinks(stats.total_links)} ${inCollections(stats.total_collections)}`

	return (
		<section className="mt-12 mb-9 md:mt-[58px]">
			<h1 className="text-[34px] leading-[1.04] font-semibold tracking-[-0.04em] md:text-[44px] lg:text-[58px]">
				{selected && status === "ready" ? (
					<button
						onClick={onShowAll}
						title="Показать все коллекции"
						className="block text-left text-faint transition-colors hover:text-ink"
					>
						&lt; Моя библиотека
					</button>
				) : (
					<span className="block text-faint">Моя библиотека</span>
				)}
				{title}
			</h1>
		</section>
	)
}

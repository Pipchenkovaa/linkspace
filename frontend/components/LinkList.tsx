import type { Link } from "@/lib/types"
import type { Filters, LibraryStatus } from "@/lib/useLibrary"
import EmptyState from "./EmptyState"
import LinkCard from "./LinkCard"

type Props = {
	status: LibraryStatus
	links: Link[] | null
	collectionNames: Map<number, string>
	filters: Filters
	scopeCount: number
	onRetry: () => void
	onReset: () => void
	onToggleFavorite: (link: Link) => void
	onDelete: (link: Link) => void
	onTag: (tag: string) => void
}

export default function LinkList({
	status,
	links,
	collectionNames,
	filters,
	scopeCount,
	onRetry,
	onReset,
	onToggleFavorite,
	onDelete,
	onTag,
}: Props) {
	if (status === "offline")
		return (
			<EmptyState
				kind="offline"
				title="Сервер не отвечает"
				action={
					<button className="btn-dark" onClick={onRetry}>
						Повторить
					</button>
				}
			>
				Не удалось загрузить библиотеку. Проверь, что API запущен:{" "}
				<code className="rounded-lg bg-black/5 px-2 py-0.5 font-mono text-[12.5px] text-ink">
					uvicorn app_final:app --env-file .env
				</code>
			</EmptyState>
		)

	if (status === "loading" || links === null) return null

	if (collectionNames.size === 0)
		return (
			<EmptyState title="У вас пока нет коллекций">
				Создай первую, чтобы начать сохранять ссылки.
			</EmptyState>
		)

	if (links.length === 0) {
		if (scopeCount === 0 && filters.collectionId !== null)
			return (
				<EmptyState title="В этой коллекции пока ничего нет">
					Добавь сюда первую ссылку.
				</EmptyState>
			)
		if (scopeCount === 0)
			return (
				<EmptyState title="Здесь пока нет ссылок">
					Сохрани первый полезный ресурс.
				</EmptyState>
			)
		if (filters.favorite && !filters.tag && !filters.search.trim())
			return (
				<EmptyState title="В избранном пусто">
					Отмечай важные ссылки звездочкой, чтобы быстро находить их здесь.
				</EmptyState>
			)
		return (
			<EmptyState
				title="Ничего не найдено"
				action={
					<button className="btn-dark" onClick={onReset}>
						Сбросить фильтры
					</button>
				}
			>
				Измени запрос или сбрось фильтры.
			</EmptyState>
		)
	}

	return (
		<section className="grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-[18px]">
			{links.map((link) => (
				<LinkCard
					key={link.id}
					link={link}
					collectionName={
						filters.collectionId === null
							? (collectionNames.get(link.collection_id) ?? null)
							: null
					}
					activeTag={filters.tag}
					onToggleFavorite={() => onToggleFavorite(link)}
					onDelete={() => onDelete(link)}
					onTag={onTag}
				/>
			))}
		</section>
	)
}

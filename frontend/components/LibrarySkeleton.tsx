import "./LibrarySkeleton.css"
import "./Shelf.css"

const FOLDERS = 5
const CARDS = 6

export default function LibrarySkeleton() {
	return (
		<div className="skeleton" aria-busy="true" aria-label="Загрузка библиотеки">
			<div className="flex min-h-9 items-center">
				<i className="skeleton-bar h-5 w-[110px] rounded-md" />
			</div>
			<div className="shelf">
				{Array.from({ length: FOLDERS }, (_, i) => (
					<i key={i} className="skeleton-folder" />
				))}
			</div>

			<div className="mb-[18px] flex gap-2">
				<i className="skeleton-bar h-[42px] w-[190px] rounded-full" />
				<i className="skeleton-bar h-[42px] w-[76px] rounded-full" />
				<i className="skeleton-bar h-[42px] w-[64px] rounded-full" />
			</div>

			<CardsSkeleton />
		</div>
	)
}

export function CardsSkeleton() {
	return (
		<div className="skeleton grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-[18px]">
			{Array.from({ length: CARDS }, (_, i) => (
				<div key={i} className="skeleton-card">
					<div className="flex items-center gap-3">
						<i className="skeleton-bar size-11 rounded-[11px]" />
						<div className="grid flex-1 gap-2">
							<i className="skeleton-bar h-3.5 w-3/5 rounded-md" />
							<i className="skeleton-bar h-3 w-2/5 rounded-md" />
						</div>
					</div>
					<i className="skeleton-bar mt-4 h-3 w-11/12 rounded-md" />
					<div className="mt-auto flex gap-1.5 pt-3.5">
						<i className="skeleton-bar h-[26px] w-14 rounded-full" />
						<i className="skeleton-bar h-[26px] w-[72px] rounded-full" />
					</div>
				</div>
			))}
		</div>
	)
}

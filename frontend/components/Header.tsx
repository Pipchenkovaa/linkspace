"use client"

import { useEffect, useRef } from "react"
import { LinkIcon, PlusIcon, SearchIcon } from "./icons"
type Props = {
	online: boolean
	search: string
	onSearch: (value: string) => void
	onAdd?: () => void
}

export default function Header({ online, search, onSearch, onAdd }: Props) {
	const input = useRef<HTMLInputElement>(null)

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement
			const dialogOpen = document.querySelector("[aria-modal=true]")
			if (
				event.key === "/" &&
				!dialogOpen &&
				!target.closest("input, textarea")
			) {
				event.preventDefault()
				input.current?.focus()
			}
		}
		window.addEventListener("keydown", onKeyDown)
		return () => window.removeEventListener("keydown", onKeyDown)
	}, [])

	return (
		<header className="glass sticky top-3 z-20 flex flex-wrap items-center gap-3.5 rounded-[28px] py-2.5 pr-2.5 pl-[18px]">
			<div className="flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.01em]">
				<span className="grid size-8 place-items-center rounded-[11px] bg-linear-to-b from-[#333] to-[#121212] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_6px_14px_-6px_rgb(0_0_0/0.6)]">
					<LinkIcon />
				</span>
				LinkSpace
			</div>

			<span
				title="GET /health раз в 30 секунд"
				className={`ml-1.5 hidden h-8 items-center gap-2 rounded-full bg-white/70 px-3 text-[12.5px] font-medium shadow-[inset_0_0_0_1px_var(--line)] md:inline-flex ${online ? "text-soft" : "text-danger"}`}
			>
				<b
					className={`size-2 rounded-full transition-colors ${online ? "bg-online shadow-[0_0_0_3px_rgb(47_191_91/0.18)]" : "bg-danger shadow-[0_0_0_3px_rgb(217_68_58/0.18)]"}`}
				/>
				{online ? "API работает" : "API недоступен"}
			</span>

			<div className="flex-1" />

			<label className="order-last flex h-11 w-full items-center gap-2.5 rounded-full bg-white/[0.72] pr-2 pl-4 text-muted shadow-[inset_0_0_0_1px_var(--line)] transition focus-within:bg-white focus-within:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.14),0_0_0_4px_rgb(0_0_0/0.04)] md:order-none md:w-[340px]">
				<SearchIcon />
				<input
					ref={input}
					type="search"
					value={search}
					onChange={(event) => onSearch(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Escape") onSearch("")
					}}
					placeholder="Поиск по ссылкам и тегам"
					aria-label="Поиск"
					className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
				/>
				<kbd className="hidden rounded-[7px] border border-line px-[7px] py-0.5 font-sans text-[11px] font-medium text-muted md:block">
					/
				</kbd>
			</label>

			<button
				className="btn-dark"
				onClick={onAdd}
				disabled={!onAdd}
				aria-label="Добавить ссылку"
				title={onAdd ? undefined : "Сервер не отвечает"}
			>
				<PlusIcon size={14} />
				<span className="hidden md:inline">Добавить ссылку</span>
			</button>
		</header>
	)
}

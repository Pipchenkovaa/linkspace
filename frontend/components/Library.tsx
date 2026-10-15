"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { inCollections, nLinks } from "@/lib/plural"
import type { Stats } from "@/lib/types"

// Главный экран. Пока только заголовок — он показывает, что фронт получает данные из API
export default function Library() {
	const [stats, setStats] = useState<Stats | null>(null)
	const [failed, setFailed] = useState(false)

	useEffect(() => {
		api.stats().then(setStats).catch(() => setFailed(true))
	}, [])

	let title = "Загрузка…"
	if (failed) title = "Нет связи с сервером"
	else if (stats) title = `${nLinks(stats.total_links)} ${inCollections(stats.total_collections)}`

	return (
		<main className="mx-auto w-full max-w-[1520px] px-12 pt-[74px]">
			<h1 className="text-[58px] leading-[1.04] font-semibold tracking-[-0.04em]">
				<span className="block text-faint">Ваша библиотека</span>
				{title}
			</h1>
		</main>
	)
}

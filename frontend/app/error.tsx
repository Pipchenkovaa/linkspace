"use client"

import { useEffect } from "react"

type Props = {
	error: Error & { digest?: string }
	retry: () => void
}

export default function ErrorPage({ error, retry }: Props) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<main className="grid flex-1 place-content-center justify-items-center px-5 py-16 text-center">
			<h1 className="text-[34px] leading-[1.04] font-semibold tracking-[-0.04em] md:text-[44px]">
				Что-то сломалось
			</h1>
			<p className="mt-3 max-w-[400px] text-soft">
				Эх, страница упала с ошибкой. Попробуй еще раз, а если не поможет, обнови
				страницу!
			</p>
			<button className="btn-dark mt-7" onClick={() => retry()}>
				Попробовать еще раз
			</button>
		</main>
	)
}

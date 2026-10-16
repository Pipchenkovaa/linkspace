import Link from "next/link"

export default function NotFound() {
	return (
		<main className="grid flex-1 place-content-center justify-items-center px-5 py-16 text-center">
			<span className="text-[15px] font-semibold text-faint">404</span>
			<h1 className="mt-2 text-[34px] leading-[1.04] font-semibold tracking-[-0.04em] md:text-[44px]">
				Такой страницы нет
			</h1>
			<p className="mt-3 max-w-[400px] text-soft">
				Пупупу, возможно, в адресе опечатка или страница больше не существует...
			</p>
			<Link href="/" className="btn-dark mt-7">
				В библиотеку
			</Link>
		</main>
	)
}

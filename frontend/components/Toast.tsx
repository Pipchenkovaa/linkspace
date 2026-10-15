export default function Toast({
	text,
	visible,
}: {
	text: string
	visible: boolean
}) {
	return (
		<div
			role="status"
			aria-live="polite"
			className={`pointer-events-none fixed bottom-7 left-1/2 z-[80] max-w-[calc(100vw-40px)] -translate-x-1/2 rounded-full bg-[rgb(24_24_24/0.86)] px-[18px] py-3 text-sm font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_16px_30px_-12px_rgb(0_0_0/0.5)] backdrop-blur-[16px] transition-[opacity,translate] duration-300 ease-spring ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
		>
			{text}
		</div>
	)
}

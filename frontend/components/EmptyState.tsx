import type { ReactNode } from "react"

type Props = {
	kind?: "folder" | "offline"
	title: string
	children: ReactNode
	action?: ReactNode
}

const FolderPicture = () => (
	<svg width="92" height="72" viewBox="0 0 92 72" fill="none" className="mb-[18px]" aria-hidden>
		<path d="M6 20a8 8 0 0 1 8-8h18l6 6h40a8 8 0 0 1 8 8v32a8 8 0 0 1-8 8H14a8 8 0 0 1-8-8V20z" fill="rgb(0 0 0 / .05)" stroke="rgb(0 0 0 / .14)" strokeWidth="1.5" />
		<path d="M6 30a8 8 0 0 1 8-8h64a8 8 0 0 1 8 8v28a8 8 0 0 1-8 8H14a8 8 0 0 1-8-8V30z" fill="rgb(255 255 255 / .8)" stroke="rgb(0 0 0 / .14)" strokeWidth="1.5" />
	</svg>
)

const OfflinePicture = () => (
	<svg width="92" height="72" viewBox="0 0 92 72" fill="none" stroke="rgb(217 68 58 / .75)" strokeWidth="2.2" strokeLinecap="round" className="mb-[18px]" aria-hidden>
		<path d="M28 50h36a12 12 0 0 0 1-24 18 18 0 0 0-34-4 14 14 0 0 0-3 28z" fill="rgb(217 68 58 / .06)" />
		<path d="M20 14l52 46" />
	</svg>
)

export default function EmptyState({ kind = "folder", title, children, action }: Props) {
	return (
		<div className="glass grid justify-items-center rounded-[28px] px-6 pt-14 pb-[60px] text-center">
			{kind === "offline" ? <OfflinePicture /> : <FolderPicture />}
			<b className="text-lg font-semibold tracking-[-0.01em]">{title}</b>
			<p className="mt-1.5 mb-5 max-w-[440px] text-soft">{children}</p>
			{action}
		</div>
	)
}

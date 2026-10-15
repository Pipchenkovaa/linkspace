"use client"

import { useEffect, useRef, type ReactNode } from "react"
import "./Modal.css"

type Props = {
	onClose: () => void
	children: ReactNode
	size?: "md" | "sm"
	layer?: "base" | "top" // top — окно поверх другого окна
	role?: "dialog" | "alertdialog"
	labelledBy?: string
}

const openModals: number[] = []
let lastId = 0

export default function Modal({
	onClose,
	children,
	size = "md",
	layer = "base",
	role = "dialog",
	labelledBy,
}: Props) {
	const close = useRef(onClose)

	useEffect(() => {
		close.current = onClose
	})

	useEffect(() => {
		const id = ++lastId
		openModals.push(id)
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && openModals.at(-1) === id) close.current()
		}
		window.addEventListener("keydown", onKeyDown)
		return () => {
			window.removeEventListener("keydown", onKeyDown)
			openModals.splice(openModals.indexOf(id), 1)
		}
	}, [])

	return (
		<div
			className={`modal-overlay ${layer === "top" ? "is-top" : ""}`}
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) onClose()
			}}
		>
			<div
				role={role}
				aria-modal="true"
				aria-labelledby={labelledBy}
				className={`modal-dialog ${size === "sm" ? "is-small" : ""}`}
			>
				{children}
			</div>
		</div>
	)
}

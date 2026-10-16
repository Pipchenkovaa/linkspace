"use client"

import { useEffect, useRef } from "react"
import { PencilIcon, TrashIcon } from "./icons"

type Props = {
	left: number
	top: number
	onRename: () => void
	onDelete: () => void
	onClose: () => void
}

export const MENU_SIZE = { width: 210, height: 96 }

export default function FolderMenu({
	left,
	top,
	onRename,
	onDelete,
	onClose,
}: Props) {
	const close = useRef(onClose)

	useEffect(() => {
		close.current = onClose
	})

	useEffect(() => {
		const onMouseDown = (event: MouseEvent) => {
			const target = event.target as Element
			if (!target.closest(".folder-menu, .folder-more")) close.current()
		}
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") close.current()
		}
		const onMove = () => close.current()

		document.addEventListener("mousedown", onMouseDown)
		window.addEventListener("keydown", onKeyDown)
		window.addEventListener("scroll", onMove, true) // и прокрутка полки тоже
		window.addEventListener("resize", onMove)
		return () => {
			document.removeEventListener("mousedown", onMouseDown)
			window.removeEventListener("keydown", onKeyDown)
			window.removeEventListener("scroll", onMove, true)
			window.removeEventListener("resize", onMove)
		}
	}, [])

	return (
		<div role="menu" className="folder-menu" style={{ left, top }}>
			<button type="button" role="menuitem" autoFocus onClick={onRename}>
				<PencilIcon />
				Переименовать
			</button>
			<button
				type="button"
				role="menuitem"
				className="is-danger"
				onClick={onDelete}
			>
				<TrashIcon />
				Удалить коллекцию
			</button>
		</div>
	)
}

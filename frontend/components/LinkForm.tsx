"use client"

import { useState, type ReactNode } from "react"
import { api, ApiError, invalidFields, isDuplicate } from "@/lib/api"
import { accent } from "@/lib/colors"
import type { Collection, DuplicateLinkDetail, Link } from "@/lib/types"
import CollectionPicker, { type CollectionChoice } from "./CollectionPicker"
import DuplicateDialog from "./DuplicateDialog"
import Modal from "./Modal"
import TagInput from "./TagInput"
import { CloseIcon, StarIcon } from "./icons"
import "./LinkForm.css"

export type FormMode =
	| { kind: "create"; collectionId: number | null }
	| { kind: "edit"; link: Link }

type Props = {
	mode: FormMode
	collections: Collection[]
	links: Link[]
	onClose: () => void
	onSaved: (link: Link, message: string) => void
	onShowExisting: (linkId: number, collectionId: number) => void
}

type Errors = Partial<
	Record<"url" | "title" | "collection" | "tags" | "form", string>
>

const TEXT = {
	url: "Адрес должен начинаться с http:// или https:// и содержать домен",
	title: "Название — от 1 до 120 символов",
	tags: "Тег — до 30 символов",
	collection: "Название коллекции — от 1 до 40 символов",
	server:
		"Что-то пошло не так. Не удалось выполнить действие. Попробуй еще раз.",
	offline: "Сервер не отвечает. Проверь, что API запущен.",
}

function isValidUrl(value: string) {
	try {
		const url = new URL(value.trim())
		return (
			(url.protocol === "http:" || url.protocol === "https:") && !!url.hostname
		)
	} catch {
		return false
	}
}

export default function LinkForm({
	mode,
	collections,
	links,
	onClose,
	onSaved,
	onShowExisting,
}: Props) {
	const editing = mode.kind === "edit" ? mode.link : null
	const onlyCollection = collections.length === 1 ? collections[0].id : null
	const initialId =
		mode.kind === "edit"
			? mode.link.collection_id
			: (mode.collectionId ?? onlyCollection)

	const [url, setUrl] = useState(editing?.url ?? "")
	const [title, setTitle] = useState(editing?.title ?? "")
	const [description, setDescription] = useState(editing?.description ?? "")
	const [tags, setTags] = useState<string[]>(editing?.tags ?? [])
	const [tagDraft, setTagDraft] = useState("")
	const [favorite, setFavorite] = useState(editing?.favorite ?? false)
	const [choice, setChoice] = useState<CollectionChoice>(
		initialId === null ? null : { kind: "existing", id: initialId },
	)
	const [newDraft, setNewDraft] = useState<string | null>(
		collections.length ? null : "",
	)
	const [created, setCreated] = useState<Collection | null>(null)
	const [errors, setErrors] = useState<Errors>({})
	const [note, setNote] = useState<string | null>(null)
	const [saving, setSaving] = useState(false)
	const [duplicate, setDuplicate] = useState<{
		detail: DuplicateLinkDetail
		target: Collection
	} | null>(null)

	const allCollections =
		created && !collections.some((c) => c.id === created.id)
			? [...collections, created]
			: collections
	const newColor = accent(Math.max(0, ...allCollections.map((c) => c.id)) + 1)

	const clearError = (field: keyof Errors) =>
		setErrors((current) => ({ ...current, [field]: undefined }))

	// Теги: без пробелов по краям, в нижнем регистре, без повторов (normalize_tags)
	const addTags = (raw: string) => {
		const next = [...tags]
		for (const part of raw.split(",")) {
			const tag = part.trim().toLowerCase()
			if (!tag) continue
			if (tag.length > 30) {
				setErrors((current) => ({ ...current, tags: TEXT.tags }))
				return null
			}
			if (!next.includes(tag)) next.push(tag)
		}
		setTags(next)
		clearError("tags")
		return next
	}

	const commitDraft = (): CollectionChoice => {
		if (newDraft === null) return choice
		const name = newDraft.trim()
		setNewDraft(null)
		if (!name) return choice
		const taken = allCollections.find(
			(c) => c.name.toLowerCase() === name.toLowerCase(),
		)
		const next: CollectionChoice = taken
			? { kind: "existing", id: taken.id }
			: { kind: "new", name }
		setNote(taken ? `Коллекция «${taken.name}» уже есть, выбрали ее` : null)
		setChoice(next)
		clearError("collection")
		return next
	}

	const cleanup = (keepId?: number) => {
		if (created && created.id !== keepId)
			api.deleteCollection(created.id).catch(() => {})
	}

	const close = () => {
		cleanup()
		onClose()
	}

	const finish = (link: Link, message: string) => {
		cleanup(link.collection_id)
		onSaved(link, message)
	}

	const fail = (error: unknown, target: Collection | null) => {
		if (!(error instanceof ApiError)) return setErrors({ form: TEXT.server })
		if (error.status === 409 && isDuplicate(error.detail) && target)
			return setDuplicate({ detail: error.detail, target })
		if (error.status === 409)
			return setErrors({ collection: "Такая коллекция уже есть" })
		if (error.status === 404)
			return setErrors({ collection: "Коллекция не найдена. Обнови страницу" })
		if (error.status === 0) return setErrors({ form: TEXT.offline })
		if (error.status === 422) {
			const fields = invalidFields(error)
			const next: Errors = {}
			if (fields.includes("url")) next.url = TEXT.url
			if (fields.includes("title")) next.title = TEXT.title
			if (fields.includes("tags")) next.tags = TEXT.tags
			if (fields.includes("name")) next.collection = TEXT.collection
			return setErrors(Object.keys(next).length ? next : { form: TEXT.server })
		}
		setErrors({ form: TEXT.server })
	}

	const submit = async () => {
		if (saving) return
		const picked = commitDraft()
		const finalTags = tagDraft.trim() ? addTags(tagDraft) : tags
		if (tagDraft.trim() && finalTags) setTagDraft("")

		const next: Errors = {}
		if (!editing && !isValidUrl(url))
			next.url = url.trim() ? TEXT.url : "Введи адрес"
		if (!title.trim()) next.title = "Введи название"
		if (!picked) next.collection = "Выбери коллекцию или создай новую"
		if (!finalTags) next.tags = TEXT.tags
		setErrors(next)
		if (Object.keys(next).length || !picked || !finalTags) return

		setSaving(true)
		let target: Collection | null = null
		try {
			if (picked.kind === "new") {
				target = await api.createCollection(picked.name)
				setCreated(target)
				setChoice({ kind: "existing", id: target.id })
			} else {
				target = allCollections.find((c) => c.id === picked.id) ?? null
			}
			if (!target)
				return setErrors({
					collection: "Коллекция не найдена. Обнови страницу",
				})

			const isNew = picked.kind === "new" || target.id === created?.id
			const where = `${isNew ? "в новую коллекцию" : "в"} «${target.name}»`
			const data = {
				title: title.trim(),
				description: description.trim() || null,
				collection_id: target.id,
				tags: finalTags,
				favorite,
			}

			if (editing) {
				const saved = await api.updateLink(editing.id, data)
				finish(
					saved,
					saved.collection_id === editing.collection_id
						? "Изменения сохранены"
						: `Ссылка перенесена ${where}`,
				)
			} else {
				const saved = await api.createLink({ url: url.trim(), ...data })
				finish(saved, `Ссылка добавлена ${where}`)
			}
		} catch (error) {
			fail(error, target)
		} finally {
			setSaving(false)
		}
	}

	const moveDuplicate = async () => {
		if (!duplicate) return
		setSaving(true)
		try {
			const saved = await api.updateLink(duplicate.detail.existing_link_id, {
				collection_id: duplicate.target.id,
			})
			finish(saved, `Ссылка перенесена в «${duplicate.target.name}»`)
		} catch (error) {
			setDuplicate(null)
			fail(error, null)
		} finally {
			setSaving(false)
		}
	}

	const showDuplicate = () => {
		if (!duplicate) return
		cleanup()
		onShowExisting(
			duplicate.detail.existing_link_id,
			duplicate.detail.collection_id,
		)
	}

	return (
		<>
			<Modal onClose={close} labelledBy="link-form-title">
				<form
					noValidate
					onSubmit={(event) => {
						event.preventDefault()
						submit()
					}}
				>
					<div className="flex items-center justify-between">
						<h3
							id="link-form-title"
							className="text-[22px] font-semibold tracking-[-0.02em]"
						>
							{editing ? "Изменить ссылку" : "Новая ссылка"}
						</h3>
						<button
							type="button"
							className="modal-close"
							onClick={close}
							aria-label="Закрыть"
						>
							<CloseIcon />
						</button>
					</div>

					<Field
						label="Адрес"
						required
						htmlFor="link-url"
						error={errors.url}
						hint={
							editing
								? "Адрес не меняется. Чтобы сохранить другой, добавь новую ссылку."
								: undefined
						}
					>
						<input
							id="link-url"
							className={`form-input ${errors.url ? "is-bad" : ""}`}
							value={url}
							onChange={(event) => {
								setUrl(event.target.value)
								clearError("url")
							}}
							readOnly={!!editing}
							autoFocus={!editing}
							inputMode="url"
							autoComplete="off"
							placeholder="https://"
						/>
					</Field>

					<Field
						label="Название"
						required
						htmlFor="link-title"
						error={errors.title}
					>
						<input
							id="link-title"
							className={`form-input ${errors.title ? "is-bad" : ""}`}
							value={title}
							onChange={(event) => {
								setTitle(event.target.value)
								clearError("title")
							}}
							autoFocus={!!editing}
							maxLength={120}
							autoComplete="off"
							placeholder="Например, React Learn"
						/>
					</Field>

					<Field label="Описание" htmlFor="link-description">
						<textarea
							id="link-description"
							className="form-input"
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							maxLength={500}
							placeholder="Чем полезна ссылка"
						/>
					</Field>

					<Field
						label="Коллекция"
						required
						error={errors.collection}
						hint={note ?? undefined}
					>
						<CollectionPicker
							collections={allCollections}
							createdId={created?.id ?? null}
							choice={choice}
							draft={newDraft}
							newColor={newColor}
							onPick={(id) => {
								setChoice({ kind: "existing", id })
								setNewDraft(null)
								setNote(null)
								clearError("collection")
							}}
							onStartNew={() => {
								setNewDraft(choice?.kind === "new" ? choice.name : "")
								setNote(null)
							}}
							onDraft={setNewDraft}
							onCommit={commitDraft}
							onCancel={() => setNewDraft(null)}
						/>
					</Field>

					<Field
						label="Теги"
						htmlFor="link-tags"
						error={errors.tags}
						hint="Enter или запятая — добавить тег. Регистр не важен: React и react — один тег."
					>
						<TagInput
							id="link-tags"
							tags={tags}
							draft={tagDraft}
							invalid={!!errors.tags}
							onDraft={(value) => {
								setTagDraft(value)
								clearError("tags")
							}}
							onAdd={(raw, rest) => {
								if (addTags(raw)) setTagDraft(rest)
							}}
							onRemove={(tag) => setTags(tags.filter((t) => t !== tag))}
						/>
					</Field>

					<div className="form-switch-row">
						<span>
							<StarIcon size={15} className="text-star" />В избранное
						</span>
						<button
							type="button"
							role="switch"
							aria-checked={favorite}
							aria-label="В избранное"
							className={`switch ${favorite ? "is-on" : ""}`}
							onClick={() => setFavorite((value) => !value)}
						/>
					</div>

					{errors.form && <p className="form-error mt-4">{errors.form}</p>}

					<div className="mt-6 flex items-center justify-end gap-2">
						<button type="button" className="btn-ghost" onClick={close}>
							Отмена
						</button>
						<button type="submit" className="btn-dark" disabled={saving}>
							{saving ? "Сохраняю…" : editing ? "Сохранить" : "Добавить"}
						</button>
					</div>
				</form>
			</Modal>

			{duplicate && (
				<DuplicateDialog
					detail={duplicate.detail}
					existing={
						links.find(
							(link) => link.id === duplicate.detail.existing_link_id,
						) ?? null
					}
					targetName={duplicate.target.name}
					same={duplicate.detail.collection_id === duplicate.target.id}
					busy={saving}
					onShow={showDuplicate}
					onKeep={close}
					onMove={moveDuplicate}
					onBack={() => setDuplicate(null)}
				/>
			)}
		</>
	)
}

type FieldProps = {
	label: string
	required?: boolean
	htmlFor?: string
	error?: string
	hint?: string
	children: ReactNode
}

function Field({
	label,
	required,
	htmlFor,
	error,
	hint,
	children,
}: FieldProps) {
	return (
		<div className="form-field">
			<label className="form-label" htmlFor={htmlFor}>
				{label} {required && <i>*</i>}
			</label>
			{children}
			{error ? (
				<p className="form-error">{error}</p>
			) : (
				hint && <p className="form-hint">{hint}</p>
			)}
		</div>
	)
}

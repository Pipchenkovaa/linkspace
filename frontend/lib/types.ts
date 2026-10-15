export type Collection = {
	id: number
	name: string
	created_at: string
	link_count: number
}

export type Link = {
	id: number
	url: string
	domain: string
	title: string
	description: string | null
	collection_id: number
	tags: string[]
	favorite: boolean
	created_at: string
	updated_at: string
}

export type Tag = { name: string; count: number }

export type Stats = {
	total_links: number
	favorite_links: number
	total_collections: number
	total_tags: number
}

export type LinkCreate = {
	url: string
	title: string
	description?: string | null
	collection_id: number
	tags?: string[]
	favorite?: boolean
}

export type LinkUpdate = Partial<Omit<LinkCreate, "url">>

export type LinkFilters = {
	search?: string
	tag?: string
	collection_id?: number
	favorite?: boolean
}

export type DuplicateLinkDetail = {
	message: string
	existing_link_id: number
	collection_id: number
	collection_name: string | null
}

export type CollectionNotEmptyDetail = { message: string; link_count: number }

export type ValidationErrorItem = {
	loc: (string | number)[]
	msg: string
	type: string
}

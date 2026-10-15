const PALETTE = [
	"#2F8F80",
	"#6A5AD4",
	"#E07A55",
	"#3F6FE0",
	"#D49A2E",
	"#C75A8A",
	"#56627A",
]

export const accent = (collectionId: number) =>
	PALETTE[(collectionId - 1) % PALETTE.length]

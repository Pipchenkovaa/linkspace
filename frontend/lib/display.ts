export const shortUrl = (url: string) =>
	url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/+$/, "")

export const domainMark = (domain: string) =>
	domain.match(/^\d{1,2}/)?.[0] ?? domain.charAt(0).toUpperCase()

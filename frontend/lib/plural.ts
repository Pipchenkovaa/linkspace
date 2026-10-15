// Русские окончания: 1 ссылка, 2 ссылки, 5 ссылок, 11 ссылок, 21 ссылка
export function plural(n: number, one: string, few: string, many: string) {
	const lastDigit = n % 10
	const lastTwo = n % 100
	if (lastDigit === 1 && lastTwo !== 11) return one
	if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return few
	return many
}

export const nLinks = (n: number) => `${n} ${plural(n, "ссылка", "ссылки", "ссылок")}`
export const inCollections = (n: number) => `в ${n} ${plural(n, "коллекции", "коллекциях", "коллекциях")}`

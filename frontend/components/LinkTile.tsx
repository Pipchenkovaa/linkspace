import { domainMark } from "@/lib/display"
import "./LinkTile.css"

export default function LinkTile({ domain }: { domain: string }) {
	return (
		<span className="link-tile" aria-hidden>
			<i className="link-tile-sheet" />
			<b className="link-tile-glass">{domainMark(domain)}</b>
		</span>
	)
}

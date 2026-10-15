import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const STAR =
	"M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"

function Icon({ size = 16, strokeWidth = 2, children, ...props }: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden
			{...props}
		>
			{children}
		</svg>
	)
}

export const LinkIcon = (props: IconProps) => (
	<Icon strokeWidth={2.2} {...props}>
		<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
		<path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
	</Icon>
)

export const SearchIcon = (props: IconProps) => (
	<Icon {...props}>
		<circle cx="11" cy="11" r="7" />
		<path d="m20 20-3.5-3.5" />
	</Icon>
)

export const PlusIcon = (props: IconProps) => (
	<Icon strokeWidth={2.4} {...props}>
		<path d="M12 5v14M5 12h14" />
	</Icon>
)

export const StarIcon = (props: IconProps) => (
	<Icon fill="currentColor" stroke="none" {...props}>
		<path d={STAR} />
	</Icon>
)

export const StarOutlineIcon = (props: IconProps) => (
	<Icon strokeWidth={1.8} {...props}>
		<path d={STAR} />
	</Icon>
)

export const TrashIcon = (props: IconProps) => (
	<Icon strokeWidth={1.9} {...props}>
		<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
	</Icon>
)

export const ChevronLeftIcon = (props: IconProps) => (
	<Icon strokeWidth={2.2} {...props}>
		<path d="m15 18-6-6 6-6" />
	</Icon>
)

export const ChevronRightIcon = (props: IconProps) => (
	<Icon strokeWidth={2.2} {...props}>
		<path d="m9 18 6-6-6-6" />
	</Icon>
)

export const PencilIcon = (props: IconProps) => (
	<Icon strokeWidth={1.9} {...props}>
		<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
		<path d="m13.5 6.5 4 4" />
	</Icon>
)

export const CloseIcon = (props: IconProps) => (
	<Icon {...props}>
		<path d="M6 6l12 12M18 6 6 18" />
	</Icon>
)

export const CheckIcon = (props: IconProps) => (
	<Icon strokeWidth={2.8} {...props}>
		<path d="m5 12 5 5 9-10" />
	</Icon>
)

export const CopyIcon = (props: IconProps) => (
	<Icon {...props}>
		<rect x="8" y="8" width="12" height="12" rx="3" />
		<path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
	</Icon>
)

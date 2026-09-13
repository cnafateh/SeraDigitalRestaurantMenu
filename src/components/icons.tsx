import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export function ArrowRightIcon(props: IconProps) { return <svg {...common} {...props}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>; }
export function ArrowLeftIcon(props: IconProps) { return <svg {...common} {...props}><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>; }
export function ChevronIcon(props: IconProps) { return <svg {...common} {...props}><path d="m6 9 6 6 6-6"/></svg>; }
export function ClockIcon(props: IconProps) { return <svg {...common} {...props}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>; }
export function LeafIcon(props: IconProps) { return <svg {...common} {...props}><path d="M20 4.5C11 4.5 5.5 8.2 5.5 14c0 3.1 2.1 5.5 5.1 5.5 6.2 0 8.7-7.1 9.4-15Z"/><path d="M4 20c2.6-4.7 6.7-8 11.6-10.2"/></svg>; }
export function FlameIcon(props: IconProps) { return <svg {...common} {...props}><path d="M13.5 3.5c.7 3.4-2.5 4.5-1.6 7.4.5 1.6 2.1 1.9 2.8.7.5-.9.4-1.9.2-2.8 2.7 1.8 4.1 4.1 3.5 6.9-.6 3-3.1 5-6.4 5-3.7 0-6.5-2.5-6.5-6 0-2.8 1.6-5.1 4.8-7.6-.2 2.3.6 3.4 1.4 3.4 1.1 0 1.6-2.1 1.8-7Z"/></svg>; }
export function SearchIcon(props: IconProps) { return <svg {...common} {...props}><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>; }
export function CloseIcon(props: IconProps) { return <svg {...common} {...props}><path d="m6 6 12 12M18 6 6 18"/></svg>; }
export function WheatIcon(props: IconProps) { return <svg {...common} {...props}><path d="M12 21V7"/><path d="M8.5 5.5C10.3 5.7 12 7 12 9c-1.8-.2-3.5-1.5-3.5-3.5Z"/><path d="M15.5 8.5C13.7 8.7 12 10 12 12c1.8-.2 3.5-1.5 3.5-3.5Z"/><path d="M8.5 11.5C10.3 11.7 12 13 12 15c-1.8-.2-3.5-1.5-3.5-3.5Z"/></svg>; }
export function SparkIcon(props: IconProps) { return <svg {...common} {...props}><path d="m12 3 1.2 4.1L17 9l-3.8 1.9L12 15l-1.2-4.1L7 9l3.8-1.9L12 3Z"/><path d="m18.5 14 .6 2.1 1.9.9-1.9.9-.6 2.1-.6-2.1-1.9-.9 1.9-.9.6-2.1Z"/></svg>; }
export function MenuIcon(props: IconProps) { return <svg {...common} {...props}><path d="M4 7h16M4 12h16M4 17h16"/></svg>; }

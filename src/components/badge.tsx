import type { BadgeType } from "../types/menu";
import { FlameIcon, LeafIcon, SparkIcon, WheatIcon } from "./icons";

const badgeIcons = {
  vegetarian: LeafIcon,
  spicy: FlameIcon,
  "gluten-free": WheatIcon,
  signature: SparkIcon,
};

export function DietaryBadge({ type, label }: { type: BadgeType; label: string }) {
  const Icon = badgeIcons[type];
  return <span className={`dietary-badge dietary-badge--${type}`}><Icon />{label}</span>;
}

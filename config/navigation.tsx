import { Flame, BookOpen, Server } from 'lucide-react';

export type NavItem = { label: string; href: string; icon: any; };

export const ANIME_NAV: NavItem[] = [
  { label: 'Discover', href: '/anime', icon: Flame },
];

export const ANIME_EXTRAS: NavItem[] = [];

export const MANGA_NAV: NavItem[] = [
  { label: 'Library', href: '/manga', icon: BookOpen },
];

export const MANGA_EXTRAS: NavItem[] = [
  { label: 'Browse & Search', href: '/manga/search', icon: Server },
];

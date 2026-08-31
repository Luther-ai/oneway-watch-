import { Flame, Search, BookOpen, Server } from 'lucide-react';

export type NavItem = { label: string; href: string; icon: any; };

// Keep navigation aligned with routes that actually exist. Feature pages can be added later
// without leaving users on dead links.
export const ANIME_NAV: NavItem[] = [
  { label: 'Discover', href: '/anime', icon: Flame },
  { label: 'Search', href: '/anime?search=', icon: Search },
];

export const ANIME_EXTRAS: NavItem[] = [];

export const MANGA_NAV: NavItem[] = [
  { label: 'Library', href: '/manga', icon: BookOpen },
  { label: 'Search', href: '/manga/search', icon: Search },
];

export const MANGA_EXTRAS: NavItem[] = [
  { label: 'Sources', href: '/manga/sources', icon: Server },
];

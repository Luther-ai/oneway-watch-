import { 
  Flame, Search, Star, Save, Calendar, Layers, 
  Globe, MessageCircle, Settings, 
  BookOpen, Heart, Book, Clock, Lightbulb, Server
} from 'lucide-react';

export type NavItem = { label: string; href: string; icon: any; };

export const ANIME_NAV: NavItem[] = [
  { label: 'Trending', href: '/anime', icon: Flame },
  { label: 'Search', href: '/anime/search', icon: Search },
  { label: 'Watchlist', href: '/anime/watchlist', icon: Star },
  { label: 'Offline', href: '/anime/downloads', icon: Save },
  { label: 'Schedule', href: '/anime/schedule', icon: Calendar },
  { label: 'Genres', href: '/anime/genres', icon: Layers },
];

export const ANIME_EXTRAS: NavItem[] = [
  { label: 'Sources', href: '/anime/sources', icon: Globe },
  { label: 'Community', href: '/anime/community', icon: MessageCircle },
];

export const MANGA_NAV: NavItem[] = [
  { label: 'Library', href: '/manga', icon: BookOpen },
  { label: 'Search', href: '/manga/search', icon: Search },
  { label: 'Favorites', href: '/manga/favorites', icon: Heart },
  { label: 'Offline', href: '/manga/downloads', icon: Save },
  { label: 'History', href: '/manga/history', icon: Book },
];

export const MANGA_EXTRAS: NavItem[] = [
  { label: 'Schedule', href: '/manga/schedule', icon: Clock },
  { label: 'Extensions', href: '/manga/sources', icon: Server },
  { label: 'Community', href: '/manga/community', icon: Lightbulb },
];
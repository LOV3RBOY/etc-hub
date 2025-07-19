export interface MediaItem {
  id: number;
  type: 'video' | 'photo';
  title: string;
  thumbnail: string;
  url: string; // URL for the full media, for downloading
  duration?: string;
  size?: string;
  category: 'recent' | 'favorite' | string;
}

export interface User {
  name: string;
  avatar: string; // URL to the avatar image
}

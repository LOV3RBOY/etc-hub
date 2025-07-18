import { MOCK_MEDIA } from '../constants';
import type { MediaItem, User } from '../types';

// --- In-memory "database" ---
let media: MediaItem[] = [...MOCK_MEDIA];
let user: User = { name: 'EBC Staff', avatar: 'https://picsum.photos/seed/avatar/40/40' };
let nextId = Math.max(...media.map(m => m.id)) + 1;

// --- Helper to simulate network delay ---
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API ---
export const backendService = {
  async login(email?: string, password?: string): Promise<{ success: boolean }> {
    await wait(500);
    // In a real app, you'd validate credentials against a database here
    console.log(`Simulating login for email: ${email}`);
    return { success: true };
  },

  async getMedia(): Promise<MediaItem[]> {
    await wait(800);
    console.log("Fetched media from backend.");
    return [...media]; // Return a copy to prevent direct mutation
  },

  async getUser(): Promise<User> {
    await wait(300);
    console.log("Fetched user from backend.");
    return { ...user }; // Return a copy
  },

  async uploadMedia(title: string, file: File): Promise<MediaItem> {
    await wait(1500); // Simulate upload time

    const fileUrl = URL.createObjectURL(file);
    const newMediaItem: MediaItem = {
      title,
      type: file.type.startsWith('video') ? 'video' : 'photo',
      thumbnail: file.type.startsWith('image') ? fileUrl : 'https://placehold.co/400x300/000000/00F5D4?text=Video',
      url: fileUrl,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      id: nextId++,
      category: 'recent' // All new uploads are recent
    };
    
    media.unshift(newMediaItem); // Add to the start of the array
    console.log("Uploaded new media item to backend:", newMediaItem);
    return newMediaItem;
  },

  async deleteMedia(id: number): Promise<{ success: boolean }> {
    await wait(500);
    const itemIndex = media.findIndex(item => item.id === id);
    if (itemIndex > -1) {
      const itemToDelete = media[itemIndex];
       // Clean up blob URLs for uploaded files to prevent memory leaks
      if (itemToDelete.url.startsWith('blob:')) {
        URL.revokeObjectURL(itemToDelete.url);
      }
      if (itemToDelete.thumbnail !== itemToDelete.url && itemToDelete.thumbnail.startsWith('blob:')) {
          URL.revokeObjectURL(itemToDelete.thumbnail);
      }
      media.splice(itemIndex, 1);
      console.log(`Deleted media item with id: ${id} from backend.`);
      return { success: true };
    }
    return { success: false };
  },

  async updateUser(updatedUserInfo: Partial<User>, newAvatarFile?: File): Promise<User> {
    await wait(700);
    let newAvatarUrl = updatedUserInfo.avatar;

    if (newAvatarFile) {
      // Clean up old blob avatar URL if it exists
      if (user.avatar.startsWith('blob:')) {
          URL.revokeObjectURL(user.avatar);
      }
      newAvatarUrl = URL.createObjectURL(newAvatarFile);
    }

    user = {
      ...user,
      ...updatedUserInfo,
      avatar: newAvatarUrl || user.avatar,
    };
    
    console.log("Updated user in backend:", user);
    return { ...user };
  }
};

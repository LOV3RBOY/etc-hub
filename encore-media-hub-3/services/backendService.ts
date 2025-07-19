
import { MOCK_MEDIA } from '../constants';
import type { MediaItem, User } from '../types';

const EBC_MEDIA_KEY = 'ebc_media_data';
const EBC_USER_KEY = 'ebc_user_data';
const EBC_NEXT_ID_KEY = 'ebc_next_id';

// --- Helper to simulate network delay ---
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Video Thumbnail Generation ---
const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const reader = new FileReader();

        reader.onload = (e) => {
            if (typeof e.target?.result !== 'string') {
                return reject(new Error('Failed to read video file.'));
            }
            video.src = e.target.result;
        };
        reader.onerror = reject;

        video.onloadeddata = () => {
            video.currentTime = 1; // Seek to 1 second
        };

        video.onseeked = () => {
            // Set canvas dimensions
            const videoRatio = video.videoWidth / video.videoHeight;
            canvas.width = 400;
            canvas.height = 400 / videoRatio;

            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Could not get canvas context'));

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg'));
            video.src = ''; // Clean up
        };
        
        video.onerror = (e) => reject(new Error('Video loading error'));

        reader.readAsDataURL(file);
    });
};

// --- File to Data URL ---
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

class BackendService {
  private media: MediaItem[] = [];
  private user: User = { name: 'EBC Staff', avatar: 'https://picsum.photos/seed/avatar/40/40' };
  private nextId: number = 1;

  constructor() {
    this._loadState();
  }

  private _loadState() {
    try {
      const storedMedia = localStorage.getItem(EBC_MEDIA_KEY);
      const storedUser = localStorage.getItem(EBC_USER_KEY);
      const storedNextId = localStorage.getItem(EBC_NEXT_ID_KEY);

      if (storedMedia && storedUser && storedNextId) {
        this.media = JSON.parse(storedMedia);
        this.user = JSON.parse(storedUser);
        this.nextId = JSON.parse(storedNextId);
        console.log("Loaded state from localStorage.");
      } else {
        // Initialize with mock data if nothing is stored
        this.media = [...MOCK_MEDIA];
        this.nextId = Math.max(...this.media.map(m => m.id)) + 1;
        this._saveState();
      }
    } catch (error) {
      console.error("Could not load state from localStorage, initializing with defaults.", error);
      this.media = [...MOCK_MEDIA];
      this.nextId = Math.max(...this.media.map(m => m.id)) + 1;
    }
  }

  private _saveState() {
    try {
      localStorage.setItem(EBC_MEDIA_KEY, JSON.stringify(this.media));
      localStorage.setItem(EBC_USER_KEY, JSON.stringify(this.user));
      localStorage.setItem(EBC_NEXT_ID_KEY, JSON.stringify(this.nextId));
    } catch (error) {
      console.error("Could not save state to localStorage.", error);
    }
  }

  async login(email?: string, password?: string): Promise<{ success: boolean }> {
    await wait(500);
    console.log(`Simulating login for email: ${email}`);
    return { success: true };
  }

  async getMedia(): Promise<MediaItem[]> {
    await wait(300);
    return [...this.media];
  }

  async getUser(): Promise<User> {
    await wait(100);
    return { ...this.user };
  }

  async uploadMedia(title: string, file: File): Promise<MediaItem> {
    await wait(1500); // Simulate upload time

    const isVideo = file.type.startsWith('video');
    const url = await fileToDataUrl(file);
    const thumbnail = isVideo ? await generateVideoThumbnail(file) : url;

    const newMediaItem: MediaItem = {
      title,
      type: isVideo ? 'video' : 'photo',
      thumbnail,
      url,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      id: this.nextId++,
      category: 'recent'
    };
    
    this.media.unshift(newMediaItem);
    this._saveState();
    console.log("Uploaded and saved new media item:", newMediaItem);
    return newMediaItem;
  }

  async deleteMedia(id: number): Promise<{ success: boolean }> {
    await wait(500);
    const itemIndex = this.media.findIndex(item => item.id === id);
    if (itemIndex > -1) {
      this.media.splice(itemIndex, 1);
      this._saveState();
      console.log(`Deleted media item with id: ${id}.`);
      return { success: true };
    }
    return { success: false };
  }

  async updateUser(updatedUserInfo: Partial<User>, newAvatarFile?: File): Promise<User> {
    await wait(700);
    let newAvatarUrl = this.user.avatar;

    if (newAvatarFile) {
        newAvatarUrl = await fileToDataUrl(newAvatarFile);
    }

    this.user = {
      ...this.user,
      ...updatedUserInfo,
      avatar: newAvatarUrl || this.user.avatar,
    };
    
    this._saveState();
    console.log("Updated and saved user:", this.user);
    return { ...this.user };
  }
}

// Export a singleton instance
export const backendService = new BackendService();

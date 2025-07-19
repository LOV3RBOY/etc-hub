
import React, { useState, useMemo, useEffect } from 'react';
import type { MediaItem, User } from './types';
import { IconHome, IconVideos, IconPhotos, IconTools, IconSettings, IconSearch, IconPlus, IconVideoCamera, IconPhoto, IconDownload, IconTrash } from './constants';
import { UploadModal } from './components/UploadModal';
import { SocialPostTool } from './components/SocialPostTool';
import { SettingsPage } from './components/SettingsPage';
import { MediaPreviewModal } from './components/MediaPreviewModal';
import { backendService } from './services/backendService';

type Page = 'home' | 'videos' | 'photos' | 'tools' | 'settings';
type Tab = 'recent' | 'favorites';

// --- Reusable Components ---

const MediaCard: React.FC<{ item: MediaItem, onDelete: (id: number) => void, onDownload: (url: string, title: string) => void, onPreview: (item: MediaItem) => void }> = ({ item, onDelete, onDownload, onPreview }) => (
    <div className="group relative transition-all duration-300">
        <div 
            className="aspect-[4/3] bg-neutral-900 rounded-lg overflow-hidden relative cursor-pointer border border-neutral-800 group-hover:border-[var(--color-border-hover)] group-hover:shadow-[0_0_20px_rgba(0,245,212,0.15)] transition-all duration-300 transform group-hover:-translate-y-1"
            onClick={() => onPreview(item)}
        >
            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                <button 
                    onClick={(e) => { e.stopPropagation(); onDownload(item.url, item.title); }} 
                    className="p-3 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full text-white hover:bg-[var(--color-accent)] hover:text-black hover:border-transparent transition-all duration-300 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                    aria-label="Download"
                >
                    <IconDownload className="w-5 h-5" />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
                    className="p-3 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full text-white hover:bg-[var(--color-danger)] hover:border-transparent transition-all duration-300 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 [transition-delay:0.05s]"
                    aria-label="Delete"
                >
                    <IconTrash className="w-5 h-5" />
                </button>
            </div>
             {(item.duration || item.size) &&
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {item.type === 'video' && !item.duration ? 'Video' : item.duration || item.size}
                </div>
            }
        </div>
        <div className="mt-3">
            <h3 className="font-semibold text-[var(--color-text-primary)] truncate">{item.title}</h3>
            <div className="flex items-center text-[var(--color-text-secondary)] text-sm mt-1">
                {item.type === 'video' ? <IconVideoCamera className="w-4 h-4 mr-1.5" /> : <IconPhoto className="w-4 h-4 mr-1.5" />}
                <span>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
            </div>
        </div>
    </div>
);

const MediaGrid: React.FC<{ items: MediaItem[], onDelete: (id: number) => void, onDownload: (url: string, title: string) => void, onPreview: (item: MediaItem) => void }> = ({ items, onDelete, onDownload, onPreview }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10">
        {items.map(item => <MediaCard key={item.id} item={item} onDelete={onDelete} onDownload={onDownload} onPreview={onPreview} />)}
    </div>
);


// --- Main App Component ---

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
    const [page, setPage] = useState<Page>('home');
    const [activeTab, setActiveTab] = useState<Tab>('recent');
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const [mediaData, userData] = await Promise.all([
                        backendService.getMedia(),
                        backendService.getUser()
                    ]);
                    setMediaItems(mediaData);
                    setUser(userData);
                } catch (error) {
                    console.error("Failed to fetch initial data", error);
                    alert("Failed to load app data. Please try again later.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [isAuthenticated]);

    // Memory management: clean up blob URLs on unmount
    useEffect(() => {
        return () => {
            mediaItems.forEach(item => {
                if (item.url.startsWith('blob:')) URL.revokeObjectURL(item.url);
                if (item.thumbnail.startsWith('blob:')) URL.revokeObjectURL(item.thumbnail);
            });
        };
    }, [mediaItems]);

    const handleLogin = async (email?: string, password?: string) => {
        setIsLoggingIn(true);
        try {
            const { success } = await backendService.login(email, password);
            if (success) {
                setIsAuthenticated(true);
            } else {
                alert("Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("Login failed", error);
            alert("An error occurred during login.");
        } finally {
            setIsLoggingIn(false);
        }
    };
    
    const handleLogout = () => {
        setIsAuthenticated(false);
        setPage('home');
        setUser(null);
        setMediaItems([]);
    }

    const handleUpdateUser = async (updatedUser: Partial<User>, newAvatarFile?: File) => {
        if (!user) return;
        try {
            const updatedUserData = await backendService.updateUser(updatedUser, newAvatarFile);
            setUser(updatedUserData);
        } catch (error) {
            console.error("Failed to update user", error);
            alert("Could not update profile.");
        }
    };

    const handleUpload = async (files: File[]) => {
        if (files.length === 0) return;
        try {
            const uploadPromises = files.map(file => {
                const title = file.name.split('.').slice(0, -1).join('.') || file.name;
                return backendService.uploadMedia(title, file);
            });

            const newMediaItems = await Promise.all(uploadPromises);
            setMediaItems(prev => [...newMediaItems.reverse(), ...prev]);
        } catch (error) {
            console.error("Upload failed", error);
            alert("One or more files could not be uploaded. Please try again.");
        }
    };


    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this media? This action cannot be undone.')) {
            try {
                const { success } = await backendService.deleteMedia(id);
                if(success) {
                    setMediaItems(items => items.filter(item => item.id !== id));
                } else {
                    alert("Failed to delete media from the server.");
                }
            } catch(error) {
                console.error("Delete failed", error);
                alert("An error occurred while deleting the media.");
            }
        }
    };
    
    const handleDownload = async (url: string, title: string) => {
        try {
            const link = document.createElement('a');
            link.href = url;
            const fileExtension = title.split('.').pop() || 'file';
            link.download = `${title.replace(/ /g, '_')}`;
            if (!title.includes('.')) {
              link.download += `.${fileExtension}`;
            }

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Could not download the file.");
        }
    };
    
    const filteredMedia = useMemo(() => {
        let items = mediaItems.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
        
        if (page === 'videos') {
            items = items.filter(i => i.type === 'video');
        } else if (page === 'photos') {
            items = items.filter(i => i.type === 'photo');
        }

        if (page === 'home') {
            return items.filter(i => i.category === activeTab);
        }
        
        return items;
    }, [mediaItems, page, activeTab, searchQuery]);

    if (!isAuthenticated) {
        return <LoginPage onLogin={handleLogin} isLoggingIn={isLoggingIn} />;
    }

    if (isLoading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)]"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-black text-[var(--color-text-primary)]">
            {previewItem && <MediaPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />}
            <UploadModal isOpen={isUploadModalOpen} onClose={() => setUploadModalOpen(false)} onUpload={handleUpload} />
            <Sidebar currentPage={page} setPage={setPage} user={user} />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header user={user} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onUpload={() => setUploadModalOpen(true)} />
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {page === 'home' && (
                        <>
                             <div className="flex justify-between items-center mb-8">
                                <div className="flex space-x-1 border-b border-[var(--color-border)]">
                                    <TabButton text="Recent" isActive={activeTab === 'recent'} onClick={() => setActiveTab('recent')} />
                                    <TabButton text="Favorites" isActive={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} />
                                </div>
                            </div>
                             {filteredMedia.length > 0 ? (
                                <MediaGrid items={filteredMedia} onDelete={handleDelete} onDownload={handleDownload} onPreview={setPreviewItem} />
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-[var(--color-text-secondary)]">No media found.</p>
                                </div>
                            )}
                        </>
                    )}
                    {(page === 'videos' || page === 'photos') && (
                        <>
                            <h1 className="text-4xl font-bold mb-8 capitalize tracking-tight">{page}</h1>
                             {filteredMedia.length > 0 ? (
                                <MediaGrid items={filteredMedia} onDelete={handleDelete} onDownload={handleDownload} onPreview={setPreviewItem} />
                             ) : (
                                 <div className="text-center py-20">
                                     <p className="text-[var(--color-text-secondary)]">No {page} found.</p>
                                 </div>
                             )}
                        </>
                    )}
                     {page === 'tools' && (
                        <SocialPostTool />
                    )}
                    {page === 'settings' && (
                       <SettingsPage 
                            currentUser={user}
                            onUpdateUser={handleUpdateUser}
                            onLogout={handleLogout}
                       />
                    )}
                </div>
            </main>
        </div>
    );
}

// --- Sub-components for UI structure ---

const NavItem: React.FC<{ name: string, icon: React.FC<{className?: string}>, isActive: boolean, onClick: () => void }> = ({ name, icon: Icon, isActive, onClick }) => (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }}
        className={`flex items-center space-x-4 px-3 py-3 rounded-lg text-sm font-semibold transition-colors duration-200 ${isActive ? 'text-glow-accent' : 'text-[var(--color-text-secondary)] hover:text-white'}`}>
        <Icon className={`w-5 h-5 transition-all ${isActive ? 'drop-shadow-[var(--glow-accent)]' : ''}`} />
        <span>{name}</span>
    </a>
);

const TabButton: React.FC<{ text: string, isActive: boolean, onClick: () => void }> = ({ text, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2.5 font-semibold text-sm transition-colors duration-200 border-b-2 ${isActive ? 'text-glow-accent border-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]'}`}>
        {text}
    </button>
);

const Sidebar: React.FC<{ currentPage: Page, setPage: (page: Page) => void, user: User }> = ({ currentPage, setPage, user }) => {
    const navItems = [
        { name: 'Home', icon: IconHome, page: 'home' as Page },
        { name: 'Videos', icon: IconVideos, page: 'videos' as Page },
        { name: 'Photos', icon: IconPhotos, page: 'photos' as Page },
        { name: 'Tools', icon: IconTools, page: 'tools' as Page },
    ];

    return (
        <aside className="w-60 bg-black flex-shrink-0 p-6 flex flex-col justify-between border-r border-[var(--color-border)]">
            <div>
                <div className="mb-12">
                     <h1 className="text-2xl font-bold text-white tracking-widest">EBC</h1>
                </div>
                <nav className="space-y-2">
                    {navItems.map(item => (
                        <NavItem key={item.name} name={item.name} icon={item.icon} isActive={currentPage === item.page} onClick={() => setPage(item.page)} />
                    ))}
                </nav>
            </div>
            <div className="space-y-2">
                <NavItem name="Settings" icon={IconSettings} isActive={currentPage === 'settings'} onClick={() => setPage('settings')} />
                <a href="#" onClick={(e) => { e.preventDefault(); setPage('settings'); }} className="flex items-center space-x-3 group p-2 rounded-lg hover:bg-[var(--color-bg-surface-2)] transition-colors">
                    <img src={user.avatar} alt="User avatar" className="w-9 h-9 rounded-full object-cover ring-2 ring-[var(--color-border)] group-hover:ring-[var(--color-accent)] transition-all" />
                    <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">{user.name}</p>
                    </div>
                </a>
            </div>
        </aside>
    );
};

const Header: React.FC<{ user: User, searchQuery: string, setSearchQuery: (query: string) => void, onUpload: () => void }> = ({ user, searchQuery, setSearchQuery, onUpload }) => {
    return (
        <header className="flex-shrink-0 h-24 px-8 flex items-center justify-between border-b border-[var(--color-border)] bg-black/50">
            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
            <div className="flex items-center space-x-6">
                <div className="relative">
                    <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                    <input 
                        type="text" 
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-base w-72 rounded-full pl-11 pr-4 py-2.5" />
                </div>
                <button onClick={onUpload} className="flex items-center space-x-2 bg-[var(--color-accent)] text-black px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[var(--color-accent-dark)] transition-all duration-200 transform hover:scale-105">
                    <IconPlus className="w-5 h-5" />
                    <span>New Upload</span>
                </button>
            </div>
        </header>
    );
};

const LoginPage: React.FC<{ onLogin: (email?: string, password?: string) => void, isLoggingIn: boolean }> = ({ onLogin, isLoggingIn }) => {
    const [email, setEmail] = useState('demo@ebc.com');
    const [password, setPassword] = useState('password');

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-dot-pattern p-4">
             <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                     <h1 className="text-5xl font-extrabold text-white tracking-widest">EBC</h1>
                     <h2 className="text-lg font-light text-[var(--color-accent)] tracking-[0.4em] text-glow-accent">MEDIA HUB</h2>
                </div>
                <div className="glass-surface rounded-2xl p-10 shadow-2xl shadow-black/30 animate-fade-in">
                    <h3 className="text-xl font-bold text-center text-white mb-8">Staff Sign In</h3>
                    <form onSubmit={(e) => { e.preventDefault(); onLogin(email, password); }}>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2" htmlFor="email">
                                    Email Address
                                </label>
                                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-base w-full rounded-md px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2" htmlFor="password">
                                    Password
                                </label>
                                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-base w-full rounded-md px-3 py-2" />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoggingIn}
                            className="w-full mt-10 bg-[var(--color-accent)] text-black font-semibold py-3 rounded-md hover:bg-[var(--color-accent-dark)] transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black focus:ring-[var(--color-accent)] disabled:bg-neutral-700 disabled:cursor-not-allowed disabled:text-neutral-500 flex items-center justify-center"
                        >
                            {isLoggingIn ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div> : 'Sign In'}
                        </button>
                    </form>
                </div>
                <p className="text-center text-[var(--color-text-secondary)] text-xs mt-8">
                    This is a demo. Use any credentials and click Sign In.
                </p>
            </div>
        </div>
    );
};

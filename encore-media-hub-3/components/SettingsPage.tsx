import React, { useState, useEffect } from 'react';
import type { User } from '../types';

interface SettingsPageProps {
    currentUser: User;
    onUpdateUser: (updatedUser: Partial<User>, newAvatarFile?: File) => void;
    onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, onUpdateUser, onLogout }) => {
    const [name, setName] = useState(currentUser.name);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setName(currentUser.name);
        setAvatarFile(null);
        setAvatarPreview(null);
    }, [currentUser]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
            setAvatarPreview(URL.createObjectURL(file));
            setIsSaved(false);
        }
    };
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        setIsSaved(false);
    }

    const handleSave = () => {
        onUpdateUser({ name }, avatarFile || undefined);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000); // Hide message after 3 seconds
    };
    
    const hasChanges = name !== currentUser.name || avatarFile !== null;

    return (
        <div>
            <h1 className="text-4xl font-bold mb-8 tracking-tight">Settings</h1>
            <div className="glass-surface p-6 sm:p-8 rounded-xl max-w-2xl">
                <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>

                <div className="space-y-6">
                    <div className="flex items-center space-x-6">
                         <div className="flex flex-col items-center space-y-2">
                             <img 
                                src={avatarPreview || currentUser.avatar} 
                                alt="Current Avatar" 
                                className="w-24 h-24 rounded-full object-cover ring-2 ring-[var(--color-border)]" 
                            />
                         </div>
                        <div className='flex-1'>
                            <p className="text-lg text-[var(--color-text-primary)] font-semibold truncate">{name}</p>
                            <label 
                                htmlFor="avatarUpload"
                                className="inline-block mt-2 cursor-pointer bg-[var(--color-bg-surface-2)] text-white px-4 py-2 rounded-md hover:bg-opacity-80 transition-colors text-sm font-medium"
                            >
                                Upload new picture
                            </label>
                            <input 
                                type="file" 
                                id="avatarUpload" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <p className="text-xs text-[var(--color-text-secondary)] mt-2">PNG, JPG up to 5MB.</p>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Display Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={handleNameChange}
                            className="input-base w-full rounded-md px-3 py-2"
                            placeholder="Enter your display name"
                        />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex items-center justify-between">
                     <button 
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className="px-6 py-2 rounded-md bg-[var(--color-accent)] text-black font-semibold hover:bg-[var(--color-accent-dark)] transition-colors disabled:bg-neutral-700 disabled:cursor-not-allowed disabled:text-neutral-500"
                    >
                        Save Changes
                    </button>
                    {isSaved && <p className="text-green-400 text-sm animate-fade-in">Profile updated successfully!</p>}
                </div>

                <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
                     <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
                     <button onClick={onLogout} className="w-full text-left bg-transparent text-[var(--color-danger)] border border-[var(--color-danger)] px-4 py-2 rounded-md hover:bg-[var(--color-danger-dark)] hover:text-white transition-colors font-semibold">
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};
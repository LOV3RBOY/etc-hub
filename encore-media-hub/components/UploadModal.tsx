import React, { useState, useCallback, useEffect } from 'react';
import { IconVideoCamera } from '../constants';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (title: string, file: File) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile) {
            setFile(selectedFile);
            setTitle(selectedFile.name.split('.').slice(0, -1).join('.'));
            
            if (preview) {
                URL.revokeObjectURL(preview);
                setPreview(null);
            }

            if (selectedFile.type.startsWith('image/')) {
                setPreview(URL.createObjectURL(selectedFile));
            }
        }
    };

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.remove('border-[var(--color-accent)]', 'bg-[var(--color-bg-surface-2)]');
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            handleFileChange(event.dataTransfer.files[0]);
        }
    }, []);

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.add('border-[var(--color-accent)]', 'bg-[var(--color-bg-surface-2)]');
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.remove('border-[var(--color-accent)]', 'bg-[var(--color-bg-surface-2)]');
    };
    
    const handleClose = useCallback(() => {
        setFile(null);
        setTitle('');
        if(preview) {
            URL.revokeObjectURL(preview);
        }
        setPreview(null);
        onClose();
    }, [preview, onClose]);

    const handleSubmit = () => {
        if (file && title) {
            onUpload(title, file);
            handleClose();
        }
    };

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass-surface rounded-xl p-8 w-full max-w-2xl text-[var(--color-text-primary)] shadow-2xl shadow-black/40">
                <h2 className="text-2xl font-bold mb-6">New Upload</h2>
                
                <div 
                    className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-8 text-center cursor-pointer transition-colors"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById('fileInput')?.click()}
                >
                    {!file ? (
                        <div className="flex flex-col items-center">
                             <p className="text-[var(--color-text-secondary)]">Drag & drop a file here, or click to select</p>
                             <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Supports videos and images</p>
                        </div>
                    ) : file.type.startsWith('image/') && preview ? (
                        <img src={preview} alt="Preview" className="max-h-64 w-full object-contain rounded-md" />
                    ) : (
                         <div className="flex flex-col items-center justify-center h-48">
                            <IconVideoCamera className="w-16 h-16 text-[var(--color-accent)] mb-4" />
                            <p className="text-[var(--color-text-primary)] font-medium truncate max-w-full">{file.name}</p>
                            <p className="text-sm text-[var(--color-text-secondary)]">{`${(file.size / 1024 / 1024).toFixed(2)} MB`}</p>
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                />

                {file && (
                    <div className="mt-6">
                        <label htmlFor="title" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input-base w-full rounded-md px-3 py-2"
                            placeholder="Enter a title for your media"
                        />
                    </div>
                )}
                
                <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={handleClose} className="px-6 py-2 rounded-md bg-[var(--color-bg-surface-2)] hover:bg-opacity-80 transition-colors font-semibold">Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!file || !title}
                        className="px-6 py-2 rounded-md bg-[var(--color-accent)] text-black font-semibold hover:bg-[var(--color-accent-dark)] transition-colors disabled:bg-neutral-700 disabled:cursor-not-allowed disabled:text-neutral-500"
                    >
                        Upload
                    </button>
                </div>
            </div>
        </div>
    );
};
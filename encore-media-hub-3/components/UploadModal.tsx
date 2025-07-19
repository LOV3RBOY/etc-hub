import React, { useState, useCallback, useEffect } from 'react';
import { IconVideoCamera } from '../constants';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (files: File[]) => void;
}

interface FileWithPreview {
    file: File;
    previewUrl: string | null;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
    const [filesWithPreviews, setFilesWithPreviews] = useState<FileWithPreview[]>([]);

    const cleanupPreviews = useCallback(() => {
        filesWithPreviews.forEach(fp => {
            if (fp.previewUrl) {
                URL.revokeObjectURL(fp.previewUrl);
            }
        });
    }, [filesWithPreviews]);

    const handleFilesSelected = (selectedFiles: FileList | null) => {
        if (selectedFiles && selectedFiles.length > 0) {
            cleanupPreviews();
            
            const newFilesWithPreviews = Array.from(selectedFiles).map(file => ({
                file,
                previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
            }));
            setFilesWithPreviews(newFilesWithPreviews);
        }
    };
    
    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.remove('border-[var(--color-accent)]', 'bg-[var(--color-bg-surface-2)]');
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            handleFilesSelected(event.dataTransfer.files);
        }
    }, [cleanupPreviews]);

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
        cleanupPreviews();
        setFilesWithPreviews([]);
        onClose();
    }, [cleanupPreviews, onClose]);

    const handleSubmit = () => {
        if (filesWithPreviews.length > 0) {
            onUpload(filesWithPreviews.map(fp => fp.file));
            handleClose();
        }
    };

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            cleanupPreviews();
        };
    }, [cleanupPreviews]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass-surface rounded-xl p-8 w-full max-w-2xl text-[var(--color-text-primary)] shadow-2xl shadow-black/40 flex flex-col" style={{maxHeight: '90vh'}}>
                <h2 className="text-2xl font-bold mb-6 flex-shrink-0">New Upload</h2>
                
                <div className="flex-grow overflow-hidden flex flex-col">
                    {filesWithPreviews.length === 0 ? (
                        <div 
                            className="flex-grow border-2 border-dashed border-[var(--color-border)] rounded-lg p-8 text-center cursor-pointer transition-colors flex flex-col justify-center items-center"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => document.getElementById('fileInput')?.click()}
                        >
                            <p className="text-[var(--color-text-secondary)]">Drag & drop files here, or click to select</p>
                            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Supports multiple videos and images</p>
                        </div>
                    ) : (
                         <div className="space-y-3 pr-2 -mr-2 overflow-y-auto">
                            {filesWithPreviews.map(({ file, previewUrl }, index) => (
                                <div key={`${file.name}-${index}`} className="flex items-center bg-[var(--color-bg-surface-2)] p-2 rounded-lg">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-16 h-12 object-cover rounded-md mr-4 flex-shrink-0" />
                                    ) : (
                                        <div className="w-16 h-12 flex items-center justify-center bg-black rounded-md mr-4 flex-shrink-0">
                                            <IconVideoCamera className="w-6 h-6 text-[var(--color-accent)]" />
                                        </div>
                                    )}
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-medium truncate text-sm">{file.name}</p>
                                        <p className="text-xs text-[var(--color-text-secondary)]">{`${(file.size / 1024 / 1024).toFixed(2)} MB`}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => handleFilesSelected(e.target.files)}
                />

                <div className="mt-8 flex justify-end space-x-4 flex-shrink-0">
                    <button onClick={handleClose} className="px-6 py-2 rounded-md bg-[var(--color-bg-surface-2)] hover:bg-opacity-80 transition-colors font-semibold">Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={filesWithPreviews.length === 0}
                        className="px-6 py-2 rounded-md bg-[var(--color-accent)] text-black font-semibold hover:bg-[var(--color-accent-dark)] transition-colors disabled:bg-neutral-700 disabled:cursor-not-allowed disabled:text-neutral-500"
                    >
                        {`Upload ${filesWithPreviews.length || ''} File${filesWithPreviews.length !== 1 ? 's' : ''}`.trim()}
                    </button>
                </div>
            </div>
        </div>
    );
};
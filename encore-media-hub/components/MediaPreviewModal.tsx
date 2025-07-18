import React, { useEffect } from 'react';
import type { MediaItem } from '../types';

interface MediaPreviewModalProps {
    item: MediaItem;
    onClose: () => void;
}

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({ item, onClose }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
           window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={`Preview of ${item.title}`}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 text-5xl font-light hover:text-[var(--color-accent)] transition-colors z-10"
                aria-label="Close preview"
            >
                &times;
            </button>
            <div className="relative max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
                {item.type === 'photo' ? (
                    <img src={item.url} alt={item.title} className="w-full h-full object-contain rounded-lg shadow-2xl shadow-black/50" />
                ) : (
                    <video src={item.url} controls autoPlay className="w-full h-full object-contain rounded-lg shadow-2xl shadow-black/50">
                        Your browser does not support the video tag.
                    </video>
                )}
                 <div className="absolute -bottom-10 left-0 text-white text-lg p-2 w-full text-center truncate">
                    {item.title}
                </div>
            </div>
        </div>
    );
};
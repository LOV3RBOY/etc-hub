import React, { useState, useCallback } from 'react';
import { generateSocialPost } from '../services/geminiService';

const Spinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
);

export const SocialPostTool: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [generatedPost, setGeneratedPost] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile) {
            setError('');
            setImageFile(selectedFile);
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            handleFileChange(event.dataTransfer.files[0]);
        }
    }, []);

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleSubmit = async () => {
        if (!prompt && !imageFile) {
            setError('Please provide a prompt or an image.');
            return;
        }
        setError('');
        setIsLoading(true);
        setGeneratedPost('');
        
        const fullPrompt = `Based on the following keywords/description: "${prompt}", and the provided image (if any), generate social media post captions.`;
        
        try {
            const result = await generateSocialPost(fullPrompt, imageFile || undefined);
            setGeneratedPost(result);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedPost);
    };

    return (
        <div className="text-white max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-2 tracking-tight">Social Post Generator</h1>
            <p className="text-[var(--color-text-secondary)] mb-8">Create engaging social media content for EBC with AI assistance.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Column */}
                <div className="space-y-6 glass-surface p-6 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Image (Optional)</label>
                        <div 
                            className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-6 text-center cursor-pointer hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-surface-2)] transition-colors h-48 flex items-center justify-center"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={() => document.getElementById('imageUpload')?.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
                            ) : (
                                <p className="text-[var(--color-text-secondary)]">Drop an image or click to upload</p>
                            )}
                        </div>
                        <input type="file" id="imageUpload" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} />
                    </div>
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Keywords / Description</label>
                        <textarea
                            id="prompt"
                            rows={4}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="input-base w-full rounded-md px-3 py-2"
                            placeholder="e.g., 'epic DJ set by night', 'sunny vibes by the pool'"
                        />
                    </div>
                    <button 
                        onClick={handleSubmit} 
                        disabled={isLoading}
                        className="w-full flex items-center justify-center px-6 py-3 rounded-md bg-[var(--color-accent)] text-black font-semibold hover:bg-[var(--color-accent-dark)] transition-colors disabled:bg-neutral-700 disabled:cursor-not-allowed disabled:text-neutral-500"
                    >
                        {isLoading ? <Spinner /> : 'Generate Post Ideas'}
                    </button>
                    {error && <p className="text-[var(--color-danger)] text-sm mt-2">{error}</p>}
                </div>

                {/* Output Column */}
                <div className="glass-surface rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]">Generated Content</h3>
                    {isLoading ? (
                         <div className="flex items-center space-x-3 text-[var(--color-text-secondary)]">
                             <Spinner/>
                             <span>Generating...</span>
                         </div>
                    ) : generatedPost ? (
                        <div className="relative">
                            <pre className="whitespace-pre-wrap font-sans text-[var(--color-text-primary)] text-sm bg-black/50 p-4 rounded-md">{generatedPost}</pre>
                            <button onClick={handleCopyToClipboard} title="Copy to clipboard" className="absolute top-2 right-2 p-1.5 bg-[var(--color-bg-surface-2)] rounded-md hover:bg-opacity-80">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                        </div>
                    ) : (
                        <p className="text-[var(--color-text-secondary)]">Your generated social media posts will appear here.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

import React, { useState, useCallback, useRef } from 'react';
import { analyzeImage } from '../services/geminiService';
import { Icon } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });

export const PlantIdentifier: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>("What plant is this and how do I care for it?");
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                setError("Image size should be less than 4MB.");
                return;
            }
            setError(null);
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setAnalysis('');
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (!imageFile || isLoading) return;

        setIsLoading(true);
        setError(null);
        setAnalysis('');
        
        try {
            const base64Image = await fileToBase64(imageFile);
            const result = await analyzeImage(base64Image, imageFile.type, prompt);
            setAnalysis(result);
        } catch (err) {
            console.error(err);
            setError("Failed to analyze the image. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, prompt, isLoading]);

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };
    
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div 
                className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition-colors"
                onClick={triggerFileInput}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                />
                {imagePreview ? (
                    <img src={imagePreview} alt="Plant preview" className="mx-auto max-h-64 rounded-lg" />
                ) : (
                    <div className="flex flex-col items-center text-gray-400">
                        <Icon name="upload" className="w-12 h-12 mb-2" />
                        <p className="font-semibold">Click to upload an image</p>
                        <p className="text-sm">PNG, JPG, or WEBP (max 4MB)</p>
                    </div>
                )}
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}
            
            {imageFile && (
                <div className="space-y-4">
                     <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., What plant is this and how do I care for it?"
                        rows={2}
                        className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-shadow"
                    />
                    <button 
                        onClick={handleAnalyze} 
                        disabled={isLoading || !imageFile}
                        className="w-full flex justify-center items-center gap-2 p-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? <LoadingSpinner /> : <Icon name="sparkles" className="w-6 h-6" />}
                        <span>{isLoading ? 'Analyzing...' : 'Identify Plant'}</span>
                    </button>
                </div>
            )}
            
            {analysis && (
                <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-bold text-green-400 mb-3">Analysis Result</h3>
                    <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-gray-100 prose-strong:text-green-300">
                        {analysis.split('\n').map((line, i) => (
                           <p key={i}>{line}</p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

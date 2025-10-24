
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Loader } from './components/Loader';
import { DownloadIcon, SparklesIcon } from './components/icons';
import { generateImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';

type ImageState = {
  file: File | null;
  previewUrl: string | null;
};

export default function App() {
  const [image1, setImage1] = useState<ImageState>({ file: null, previewUrl: null });
  const [image2, setImage2] = useState<ImageState>({ file: null, previewUrl: null });
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImage1Upload = useCallback((file: File | null) => {
    if (file) {
      setImage1({ file, previewUrl: URL.createObjectURL(file) });
    } else {
      setImage1({ file: null, previewUrl: null });
    }
  }, []);

  const handleImage2Upload = useCallback((file: File | null) => {
    if (file) {
      setImage2({ file, previewUrl: URL.createObjectURL(file) });
    } else {
      setImage2({ file: null, previewUrl: null });
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt || (!image1.file && !image2.file)) {
      setError('Please provide a prompt and at least one image.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const images: { data: string; mimeType: string }[] = [];
      if (image1.file) {
        const base64Data = await fileToBase64(image1.file);
        images.push({ data: base64Data, mimeType: image1.file.type });
      }
      if (image2.file) {
        const base64Data = await fileToBase64(image2.file);
        images.push({ data: base64Data, mimeType: image2.file.type });
      }

      const result = await generateImage(prompt, images);
      setGeneratedImage(`data:image/png;base64,${result}`);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <div className="bg-gray-800/50 rounded-2xl p-6 shadow-2xl border border-gray-700 backdrop-blur-sm">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-teal-300 mb-3">1. Upload Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageUploader onImageChange={handleImage1Upload} previewUrl={image1.previewUrl} />
                  <ImageUploader onImageChange={handleImage2Upload} previewUrl={image2.previewUrl} />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-teal-300 mb-3">2. Describe Your Vision</h2>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Combine these images into a surreal space scene' or 'Change the background to a tropical beach at sunset'"
                  className="w-full h-32 p-3 bg-gray-700/50 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-300 text-gray-200 placeholder-gray-400"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt || (!image1.file && !image2.file)}
                  className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center transition-all duration-300 text-lg shadow-lg hover:shadow-teal-500/30 transform hover:-translate-y-1"
                >
                  {isLoading ? (
                    <Loader />
                  ) : (
                    <>
                      <SparklesIcon className="w-6 h-6 mr-3" />
                      Generate Masterpiece
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-gray-800/50 rounded-2xl p-6 shadow-2xl border border-gray-700 backdrop-blur-sm flex flex-col items-center justify-center min-h-[400px] lg:min-h-0">
            {isLoading && (
              <div className="text-center">
                <Loader large={true} />
                <p className="mt-4 text-lg text-teal-300 animate-pulse">Summoning creative spirits...</p>
                <p className="text-sm text-gray-400">This can take a few moments.</p>
              </div>
            )}
            {error && !isLoading && (
                <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
                    <h3 className="font-bold">Generation Failed</h3>
                    <p>{error}</p>
                </div>
            )}
            {!isLoading && generatedImage && (
              <div className="w-full h-full flex flex-col items-center">
                <img src={generatedImage} alt="AI Generated Output" className="rounded-lg shadow-2xl object-contain max-w-full max-h-[80vh] lg:max-h-full" />
                <a
                  href={generatedImage}
                  download="teotlan-creation.png"
                  className="mt-6 bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-indigo-500/30"
                >
                  <DownloadIcon className="w-5 h-5 mr-2" />
                  Download Image
                </a>
              </div>
            )}
            {!isLoading && !generatedImage && !error && (
              <div className="text-center text-gray-500">
                <SparklesIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-semibold">Your creation will appear here</h3>
                <p className="max-w-xs mx-auto">Upload your images, write a prompt, and watch the magic happen.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

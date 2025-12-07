import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ImageSectionProps {
  illustrationUrl: string | null;
  diagramUrl: string | null;
  isIllustrationLoading: boolean;
  isDiagramLoading: boolean;
  topic: string;
}

const ImageSection: React.FC<ImageSectionProps> = ({ 
  illustrationUrl, 
  diagramUrl, 
  isIllustrationLoading, 
  isDiagramLoading,
  topic 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  // Disable body scroll when preview is open
  useEffect(() => {
    if (previewUrl) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup function to ensure scrolling is restored
    return () => {
      document.body.style.overflow = '';
    };
  }, [previewUrl]);

  const handleDownload = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = `${topic}_ailearn_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    try {
      let blob: Blob;

      // Handle Data URLs manually to avoid fetch limitations/issues with large base64 strings
      if (url.startsWith('data:')) {
        const arr = url.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        blob = new Blob([u8arr], { type: mime });
      } else {
        // Fallback for regular URLs
        const response = await fetch(url);
        blob = await response.blob();
      }

      // Write to clipboard
      // Note: Browser support for writing non-PNG images varies.
      // However, modern browsers support writing Blob to clipboard.
      if (typeof ClipboardItem !== 'undefined') {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
          ]);
      } else {
          // Fallback for very old browsers (unlikely to work with modern APIs anyway)
          throw new Error("ClipboardItem not supported");
      }

      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error("Copy failed", err);
      alert("复制失败，请尝试右键点击图片选择“复制图片”");
    }
  };

  const openPreview = (url: string) => {
    setPreviewUrl(url);
    setCopyStatus('idle');
  };

  const closePreview = () => {
    setPreviewUrl(null);
  };

  const renderImage = (title: string, url: string | null, isLoading: boolean) => (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider pl-1 border-l-4 border-rose-200">
        {title}
      </h3>
      <div 
        className={`w-full aspect-video bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative flex items-center justify-center shadow-inner ${url ? 'group cursor-zoom-in' : ''}`}
        onClick={() => url && openPreview(url)}
      >
         {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 font-medium animate-pulse">图片生成中...</p>
          </div>
        ) : url ? (
          <>
            <img 
                src={url} 
                alt={`${title} of ${topic}`} 
                className="w-full h-full object-contain bg-white transition-transform duration-500 group-hover:scale-105"
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    点击预览
                </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 opacity-50 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">等待生成</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-auto">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              图片说明
            </h2>
        </div>

        <div className="p-6 grid gap-8">
          {renderImage('生活实例', illustrationUrl, isIllustrationLoading)}
          {renderImage('原理图解', diagramUrl, isDiagramLoading)}
        </div>
      </div>

      {/* Fullscreen Preview Modal - Portal to Body */}
      {previewUrl && createPortal(
        <div 
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-[fadeIn_0.2s_ease-out]"
            onClick={closePreview}
        >
            <div 
                className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image Container */}
                <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
                    <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-w-full max-h-full object-contain rounded shadow-2xl"
                    />
                </div>

                {/* Toolbar */}
                <div className="mt-6 flex items-center gap-2 sm:gap-4 bg-white/10 border border-white/10 backdrop-blur-md px-6 py-3 rounded-full shadow-xl">
                     {/* Download */}
                    <button 
                        onClick={(e) => handleDownload(e, previewUrl)}
                        className="flex items-center gap-2 text-white/90 hover:text-white hover:bg-white/20 px-4 py-2 rounded-full transition-all text-sm font-medium"
                        title="下载图片"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="hidden sm:inline">下载</span>
                    </button>
                    
                    <div className="w-px h-5 bg-white/20"></div>

                    {/* Copy */}
                    <button 
                        onClick={(e) => handleCopy(e, previewUrl)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium ${copyStatus === 'copied' ? 'bg-emerald-500/80 text-white' : 'text-white/90 hover:text-white hover:bg-white/20'}`}
                        title="复制到剪贴板"
                    >
                        {copyStatus === 'copied' ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="hidden sm:inline">已复制</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="hidden sm:inline">复制</span>
                            </>
                        )}
                    </button>

                    <div className="w-px h-5 bg-white/20"></div>

                    {/* Close */}
                    <button 
                        onClick={closePreview}
                        className="flex items-center gap-2 text-white/90 hover:text-white hover:bg-white/20 px-4 py-2 rounded-full transition-all text-sm font-medium"
                        title="关闭预览"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="hidden sm:inline">关闭</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ImageSection;
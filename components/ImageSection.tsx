import React from 'react';

interface ImageSectionProps {
  imageUrl: string | null;
  isLoading: boolean;
  topic: string;
}

const ImageSection: React.FC<ImageSectionProps> = ({ imageUrl, isLoading, topic }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
         <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            图片说明
          </h2>
      </div>

      <div className="flex-1 relative bg-slate-100 flex items-center justify-center min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 animate-pulse">图片生成中...</p>
          </div>
        ) : imageUrl ? (
          <div className="w-full h-full p-2">
            <img 
              src={imageUrl} 
              alt={`Examples of ${topic}`} 
              className="w-full h-full object-contain rounded-lg shadow-sm"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 opacity-50 p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>等待生成图片...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSection;
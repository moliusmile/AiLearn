import React from 'react';

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

  const renderImage = (title: string, url: string | null, isLoading: boolean) => (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider pl-1 border-l-4 border-rose-200">
        {title}
      </h3>
      <div className="w-full aspect-video bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative flex items-center justify-center shadow-inner">
         {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 font-medium animate-pulse">图片生成中...</p>
          </div>
        ) : url ? (
          <img 
            src={url} 
            alt={`${title} of ${topic}`} 
            className="w-full h-full object-contain bg-white transition-opacity duration-500"
          />
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
  );
};

export default ImageSection;
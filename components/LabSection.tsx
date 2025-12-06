import React, { useState } from 'react';

interface LabSectionProps {
  labUrl: string;
}

const LabSection: React.FC<LabSectionProps> = ({ labUrl }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col w-full animate-fade-in-up mt-8">
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
           </svg>
           互动实验
        </h2>
      </div>
      <div className="w-full h-[650px] bg-slate-100 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
             <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm">加载实验资源...</p>
             </div>
          </div>
        )}
        <iframe 
            key={labUrl}
            src={labUrl} 
            className="w-full h-full border-0" 
            title="Interactive Lab"
            onLoad={() => setIsLoading(false)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
};

export default LabSection;
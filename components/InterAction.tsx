import React from 'react';

interface InterActionSectionProps {
  imageUrl: string | null;
  isLoading: boolean;
  topic: string;
}

const InterActionSection: React.FC<InterActionSectionProps> = ({  }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
         <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            实验室
          </h2>
      </div>

      <div className="flex-1 relative bg-slate-100 flex items-center justify-center min-h-[300px]">
         <iframe src="/mocali.html" className="h-full w-full" frameborder="0"></iframe>
      </div>
    </div>
  );
};

export default InterActionSection;
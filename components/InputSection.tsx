import React, { useState } from 'react';

interface InputSectionProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
  compact?: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onSubmit, isLoading, compact = false }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSubmit(inputValue.trim());
    }
  };

  return (
    <div className={`w-full mx-auto text-center transition-all duration-500 ease-in-out ${compact ? 'max-w-4xl' : 'max-w-2xl py-10 px-4'}`}>
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${compact ? 'max-h-0 opacity-0 mb-0' : 'max-h-40 opacity-100 mb-8'}`}>
        <h1 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">
          您的智能学习好伙伴，全方位帮您掌握知识点
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className={`relative w-full shadow-lg rounded-full overflow-hidden transition-all duration-300 focus-within:ring-4 focus-within:ring-indigo-100 focus-within:shadow-xl bg-white border border-slate-200`}>
          <input
            type="text"
            className="w-full h-14 pl-6 pr-20 text-lg bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none"
            placeholder={compact ? "输入想学习的内容..." : "输入您想学习的内容，例如：光合作用、摩擦力、龟兔赛跑..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white w-10 h-10 rounded-full transition-colors duration-200 flex items-center justify-center shadow-md"
            aria-label="Search"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputSection;
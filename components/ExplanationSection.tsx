import React, { useEffect, useRef, useState } from 'react';
// import ReactMarkdown from 'react-markdown';
import MarkdownLatex  from '../utils/markdown-latex';
interface ExplanationSectionProps {
  text: string;
  isComplete: boolean;
}

const ExplanationSection: React.FC<ExplanationSectionProps> = ({ text, isComplete }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const htmlContainer = useRef<HTMLDivElement>(null);
  const markdownLatexRef = useRef<any>(null);
  const bufferContainer = useRef<HTMLDivElement>(null);
  
  // Initialize MarkdownLatex and handle streaming
  useEffect(() => {
    if (text) {
      if (!markdownLatexRef.current) {
        // Create new instance with callback
        markdownLatexRef.current = new MarkdownLatex(
          text,
          (curHtmlFull: string,curHtmlSegment: string,htmlFull: string, htmlSegment: string,) => {
            // Combine committed HTML and current segment
            htmlContainer.current.insertAdjacentHTML('beforeend', curHtmlFull);
            bufferContainer.current.innerHTML = curHtmlSegment || '';
          }
        );
      } else {
        // Add new content to existing instance
        markdownLatexRef.current.add(text,true);
      }
    }else{
      markdownLatexRef.current?.reset();
      
    }
  }, [text]);

  // Auto-scroll to bottom while streaming
  useEffect(() => {
    if (!isComplete && scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        // Scroll if user is near bottom
        if (scrollHeight - scrollTop - clientHeight < 150) {
            scrollRef.current.scrollTop = scrollHeight;
        }
    }
    if(isComplete){
      markdownLatexRef.current?.finish();
    }
  }, [text, isComplete]);


  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[400px]">
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          概念讲解
        </h2>
        {!isComplete && (
          <span className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full animate-pulse">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            AI 生成中...
          </span>
        )}
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 p-8 overflow-y-auto"
      >
        {text ? (
          <div>
            <div ref={htmlContainer} className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-li:marker:text-indigo-500 prose-a:text-indigo-600">
            </div>
            <div ref={bufferContainer}></div>
          </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-50">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
               </svg>
               <p>等待开始...</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ExplanationSection;
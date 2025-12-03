import React, { useState, useEffect } from 'react';
import { QuizData } from '../types';

interface QuizSectionProps {
  quizData: QuizData | null;
  isLoading: boolean;
}

const QuizSection: React.FC<QuizSectionProps> = ({ quizData, isLoading }) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  // Track user answers for each question index (null means not answered yet)
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);

  // Reset state when new quiz data arrives
  useEffect(() => {
    if (quizData) {
      setUserAnswers(new Array(quizData.questions.length).fill(null));
      setCurrentQuestionIdx(0);
    }
  }, [quizData]);

  const handleOptionSelect = (idx: number) => {
    // If already answered, prevent changing to keep the feedback static
    if (userAnswers[currentQuestionIdx] !== null) return;
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIdx] = idx;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (quizData && currentQuestionIdx < quizData.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full min-h-[400px]">
         <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
             <h2 className="text-xl font-bold text-slate-800">小测验</h2>
         </div>
        <div className="flex flex-col items-center justify-center h-64 gap-4 p-8">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 animate-pulse">正在出题中...</p>
        </div>
      </div>
    );
  }

  if (!quizData) {
     return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full min-h-[400px] flex items-center justify-center text-slate-400 opacity-50">
             <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>等待生成测验...</p>
             </div>
        </div>
     )
  }

  const question = quizData.questions[currentQuestionIdx];
  const userAnswer = userAnswers[currentQuestionIdx];
  const isAnswered = userAnswer !== null;
  const isCorrect = isAnswered && userAnswer === question.correctAnswerIndex;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center shrink-0">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
           </svg>
           小测验
        </h2>
        <span className="text-sm font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
          {currentQuestionIdx + 1} / {quizData.questions.length}
        </span>
      </div>

      <div className="flex-1 p-6 flex flex-col overflow-y-auto">
        <h3 className="text-lg font-medium text-slate-800 mb-6 leading-snug">
          {question.question}
        </h3>

        <div className="space-y-3 mb-6">
          {question.options.map((opt, idx) => {
            let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ";
            
            if (isAnswered) {
               if (idx === question.correctAnswerIndex) {
                   btnClass += "border-emerald-500 bg-emerald-50 text-emerald-700 font-medium";
               } else if (idx === userAnswer) {
                   btnClass += "border-rose-500 bg-rose-50 text-rose-700";
               } else {
                   btnClass += "border-slate-100 text-slate-400 opacity-60";
               }
            } else {
               btnClass += "border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700 cursor-pointer";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                className={btnClass}
                disabled={isAnswered}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                    isAnswered && idx === question.correctAnswerIndex ? 'bg-emerald-500 text-white border-emerald-500' :
                    isAnswered && idx === userAnswer ? 'bg-rose-500 text-white border-rose-500' :
                    'bg-white text-slate-500 border-slate-300'
                } shrink-0`}>
                    {String.fromCharCode(65 + idx)}
                </span>
                <span className="break-words">{opt}</span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={`p-4 rounded-xl mb-4 animate-fade-in-up ${isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
            <p className="font-bold mb-1 flex items-center gap-2">
                {isCorrect ? (
                    <><span className="text-xl">🎉</span> 回答正确！</>
                ) : (
                    <><span className="text-xl">😅</span> 回答错误</>
                )}
            </p>
            <p className="text-sm opacity-90 mt-2 leading-relaxed border-t border-black/5 pt-2">
                <strong>解析：</strong> {question.explanation}
            </p>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center shrink-0">
             <button
                onClick={handlePrev}
                disabled={currentQuestionIdx === 0}
                className="text-slate-600 hover:text-indigo-600 disabled:text-slate-300 disabled:cursor-not-allowed font-medium px-4 py-2 transition-colors flex items-center gap-1"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                上一题
             </button>

             <button
                onClick={handleNext}
                disabled={currentQuestionIdx >= quizData.questions.length - 1}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
             >
                下一题
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
             </button>
        </div>
      </div>
    </div>
  );
};

export default QuizSection;
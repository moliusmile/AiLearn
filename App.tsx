import React, { useState, useEffect } from 'react';
import InputSection from './components/InputSection';
import ExplanationSection from './components/ExplanationSection';
import ImageSection from './components/ImageSection';
import QuizSection from './components/QuizSection';
import LabSection from './components/LabSection';
import { ExplanationState, ImageState, QuizState, AppState } from './types';
import { streamExplanation, generateIllustration, generateDiagram, generateQuiz } from './services/geminiService';

// Mapping keywords to lab files
// Using absolute paths ensures correct resolution relative to the web root
const LAB_MAPPINGS: Record<string, string> = {
  '摩擦': '/labs/friction.html',
  'friction': '/labs/friction.html',
  '力': '/labs/friction.html', 
  'force': '/labs/friction.html'
};

function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [hasCheckedKey, setHasCheckedKey] = useState(false);

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  
  // State for different sections
  const [explanation, setExplanation] = useState<ExplanationState>({ text: '', isComplete: false });
  const [image, setImage] = useState<ImageState>({ 
    illustrationUrl: null, 
    diagramUrl: null,
    isIllustrationLoading: false,
    isDiagramLoading: false 
  });
  const [quiz, setQuiz] = useState<QuizState>({ data: null, isLoading: false });
  const [labUrl, setLabUrl] = useState<string | null>(null);

  // Check for API Key on mount
  useEffect(() => {
    async function checkKey() {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // Fallback for environments without the wrapper (e.g. local dev)
        setHasApiKey(true);
      }
      setHasCheckedKey(true);
    }
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success to avoid race condition
      setHasApiKey(true);
    }
  };

  const handleStartLearning = async (topic: string) => {
    // Reset states
    setAppState(AppState.GENERATING);
    setCurrentTopic(topic);
    setExplanation({ text: '', isComplete: false });
    setImage({ 
      illustrationUrl: null, 
      diagramUrl: null,
      isIllustrationLoading: true, 
      isDiagramLoading: true 
    });
    setQuiz({ data: null, isLoading: true });
    setLabUrl(null);

    // Check for matching labs
    const normalizedTopic = topic.toLowerCase();
    const foundLabKey = Object.keys(LAB_MAPPINGS).find(key => normalizedTopic.includes(key));
    
    // Set lab URL immediately if found
    if (foundLabKey) {
      console.log(`Found lab for topic "${topic}": ${LAB_MAPPINGS[foundLabKey]}`);
      setLabUrl(LAB_MAPPINGS[foundLabKey]);
    } else {
      console.log(`No lab found for topic "${topic}"`);
    }

    // 1. Start Text Stream
    const textPromise = streamExplanation(topic, (textChunk) => {
      setExplanation(prev => ({ ...prev, text: prev.text + textChunk }));
    }).then(() => {
        setExplanation(prev => ({ ...prev, isComplete: true }));
    }).catch(err => {
        console.error("Text error", err);
        setExplanation(prev => ({ ...prev, text: prev.text + "\n\n[出错了: 无法生成解释]", isComplete: true }));
    });

    // 2. Start Illustration Generation
    const illustrationPromise = generateIllustration(topic)
      .then(url => setImage(prev => ({ ...prev, illustrationUrl: url, isIllustrationLoading: false })))
      .catch(err => {
         console.error("Illustration error", err);
         setImage(prev => ({ ...prev, illustrationUrl: null, isIllustrationLoading: false }));
      });

    // 3. Start Diagram Generation
    const diagramPromise = generateDiagram(topic)
      .then(url => setImage(prev => ({ ...prev, diagramUrl: url, isDiagramLoading: false })))
      .catch(err => {
         console.error("Diagram error", err);
         setImage(prev => ({ ...prev, diagramUrl: null, isDiagramLoading: false }));
      });

    // 4. Start Quiz Generation
    const quizPromise = generateQuiz(topic)
      .then(data => setQuiz({ data, isLoading: false }))
      .catch(err => {
         console.error("Quiz error", err);
         setQuiz({ data: null, isLoading: false });
      });

    
    await Promise.allSettled([textPromise, illustrationPromise, diagramPromise, quizPromise]);
    setAppState(AppState.COMPLETED);
  };

  if (!hasCheckedKey) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>;
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="mb-6 bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">需要 API 密钥</h1>
          <p className="text-slate-500 mb-6 leading-relaxed">
            本应用使用 <strong>Gemini 3 Pro Image</strong> 模型生成高质量教学配图。请连接您的 Google Cloud 项目并选择一个付费 API 密钥以继续。
          </p>
          <button 
            onClick={handleSelectKey}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5"
          >
            选择 API 密钥
          </button>
          <p className="mt-6 text-xs text-slate-400">
            了解更多关于 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-500">计费与定价</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header/Nav */}
      <header className="bg-white border-b border-slate-200 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => {
                 setAppState(AppState.IDLE);
                 setCurrentTopic('');
              }}
            >
                <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg">A</div>
                <span className="font-bold text-xl tracking-tight text-slate-800">AiLearn</span>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Input Area - Persistent but moves/transforms */}
        <div className={`transition-all duration-500 ease-in-out ${appState === AppState.IDLE ? 'min-h-[60vh] flex flex-col justify-center' : 'py-6'}`}>
            <InputSection 
              onSubmit={handleStartLearning} 
              isLoading={appState === AppState.GENERATING}
              compact={appState !== AppState.IDLE}
            />
        </div>

        {/* Content Grid */}
        {appState !== AppState.IDLE && (
          <div className="space-y-8 animate-fade-in-up pb-10">
            
            {/* Main Content Layout */}
            {/* By default grid items stretch to match the tallest item's height */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left: Explanation (Main Content) */}
                {/* 
                   min-h-0 is CRITICAL here. 
                   It prevents the grid item from expanding to fit its content (text),
                   forcing it to respect the height determined by the Right column.
                   This makes the internal scrollbar in ExplanationSection work correctly.
                */}
                <div className="flex flex-col h-full min-h-0">
                    <ExplanationSection text={explanation.text} isComplete={explanation.isComplete} />
                </div>

                {/* Right: Visuals & Context - This column determines the height */}
                <div className="flex flex-col gap-8 w-full h-full">
                    {/* Image Section - Flexible height */}
                    <div>
                        <ImageSection 
                          topic={currentTopic} 
                          illustrationUrl={image.illustrationUrl} 
                          diagramUrl={image.diagramUrl}
                          isIllustrationLoading={image.isIllustrationLoading}
                          isDiagramLoading={image.isDiagramLoading}
                        />
                    </div>
                    {/* Quiz Section - Fixed height */}
                    <div className="h-[600px] shrink-0">
                         <QuizSection quizData={quiz.data} isLoading={quiz.isLoading} />
                    </div>
                </div>
            </div>

            {/* Interactive Lab Section (Full Width if matches) */}
            {labUrl && (
              <div className="w-full">
                <LabSection labUrl={labUrl} />
              </div>
            )}

          </div>
        )}
      </main>
      
      {/* Footer - Only show when IDLE to avoid clutter or always show at bottom? Let's keep it but push it down. */}
      {appState === AppState.IDLE && (
        <footer className="fixed bottom-0 w-full border-t border-slate-200 py-6 text-center text-slate-400 text-sm bg-slate-50">
          <p>Powered by Google Gemini API • Created with React & Tailwind</p>
        </footer>
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default App;
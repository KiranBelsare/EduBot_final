import { useState, useEffect } from 'react';
import { BookOpen, FileText, Brain, Layers, History, Loader2 } from 'lucide-react';
import { supabase, StudySession } from './lib/supabase';

type Mode = 'explain' | 'summarize' | 'quiz' | 'flashcard';

function App() {
  const [mode, setMode] = useState<Mode>('explain');
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const { data } = await supabase
      .from('study_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setSessions(data);
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResponse('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/study-buddy-ai`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ mode, content: input }),
      });

      const data = await res.json();
      setResponse(data.response);

      await supabase.from('study_sessions').insert({
        title: input.slice(0, 100),
        session_type: mode,
        input_content: input,
        ai_response: data.response,
      });

      await loadSessions();
    } catch {
      setResponse('Error: Unable to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSession = (session: StudySession) => {
    setMode(session.session_type);
    setInput(session.input_content);
    setResponse(session.ai_response);
    setShowHistory(false);
  };

  const modes = [
    { id: 'explain', label: 'Explain Topic', icon: Brain, color: 'bg-blue-500' },
    { id: 'summarize', label: 'Summarize Notes', icon: FileText, color: 'bg-green-500' },
    { id: 'quiz', label: 'Generate Quiz', icon: Layers, color: 'bg-purple-500' },
    { id: 'flashcard', label: 'Create Flashcards', icon: BookOpen, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-800">AI Study Buddy</h1>
          </div>
          <p className="text-slate-600 text-lg">Your intelligent learning companion for better understanding</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Choose Your Learning Mode</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {modes.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id as Mode)}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        mode === m.id
                          ? `${m.color} text-white border-transparent`
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Enter Your Content</h2>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter the ${mode === 'explain' ? 'topic you want to understand' : mode === 'summarize' ? 'notes you want to summarize' : mode === 'quiz' ? 'topic for quiz generation' : 'content for flashcards'}...`}
                className="w-full h-32 p-4 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              />
              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Generate'
                )}
              </button>
            </div>

            {response && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-slate-800">AI Response</h2>
                <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700">
                  {response}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-lg font-semibold mb-4 text-slate-800 hover:text-blue-600 transition-colors"
              >
                <History className="w-5 h-5" />
                Recent Sessions
              </button>

              {showHistory && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sessions.length === 0 ? (
                    <p className="text-slate-500 text-sm">No sessions yet</p>
                  ) : (
                    sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => loadSession(session)}
                        className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            session.session_type === 'explain' ? 'bg-blue-100 text-blue-700' :
                            session.session_type === 'summarize' ? 'bg-green-100 text-green-700' :
                            session.session_type === 'quiz' ? 'bg-purple-100 text-purple-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {session.session_type}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 truncate">{session.title}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
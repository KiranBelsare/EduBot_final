import { useState, useEffect } from 'react';
import { BookOpen, FileText, Brain, Layers, History, Loader2, Trash2 } from 'lucide-react';
import { supabase, StudySession } from './lib/supabase';

type Mode = 'explain' | 'summarize' | 'quiz' | 'flashcard';

function App() {
  const [mode, setMode] = useState<Mode>('explain');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<StudySession[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setOutput('');

    try {
      const { data, error } = await supabase.functions.invoke('study-buddy-ai', {
        body: { mode, content: input }
      });

      if (error) throw error;

      const aiResponse = data.response;
      setOutput(aiResponse);

      // Save to database
      const { error: saveError } = await supabase
        .from('study_sessions')
        .insert({
          title: input.substring(0, 100),
          session_type: mode,
          input_content: input,
          ai_response: aiResponse
        });

      if (saveError) throw saveError;

      // Reload history
      await loadHistory();
    } catch (error) {
      console.error('Error:', error);
      setOutput('❌ An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSession = (session: StudySession) => {
    setInput(session.input_content);
    setOutput(session.ai_response);
    setMode(session.session_type as Mode);
    setShowHistory(false);
  };

  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadHistory();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
  };

  const modes = [
    { id: 'explain' as Mode, icon: BookOpen, label: 'Explain', color: 'blue' },
    { id: 'summarize' as Mode, icon: FileText, label: 'Summarize', color: 'green' },
    { id: 'quiz' as Mode, icon: Brain, label: 'Quiz', color: 'purple' },
    { id: 'flashcard' as Mode, icon: Layers, label: 'Flashcards', color: 'orange' }
  ];

  const getColorClasses = (color: string, active: boolean) => {
    const colors = {
      blue: active ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      green: active ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100',
      purple: active ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100',
      orange: active ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">EduBot</h1>
                <p className="text-slate-600 text-sm">Your AI Study Companion</p>
              </div>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <History className="w-5 h-5" />
              <span className="font-medium">History</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mode Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Choose Your Study Mode</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${getColorClasses(m.color, mode === m.id)}`}
                  >
                    <m.icon className="w-6 h-6" />
                    <span className="font-semibold text-sm">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What would you like to learn about?
                  </label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter your topic, notes, or question here..."
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                    rows={6}
                    disabled={loading}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Generate {modes.find(m => m.id === mode)?.label}</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {/* Output */}
            {output && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Result</h2>
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {output}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-3">💡 Quick Tips</h3>
              <ul className="space-y-2 text-sm">
                <li>• Be specific with your questions</li>
                <li>• Use Explain for detailed understanding</li>
                <li>• Summarize helps condense long notes</li>
                <li>• Quiz tests your knowledge</li>
                <li>• Flashcards for memorization</li>
              </ul>
            </div>

            {/* History Panel */}
            {showHistory && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Recent Sessions</h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">No history yet</p>
                  ) : (
                    history.map((session) => (
                      <div
                        key={session.id}
                        className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => loadSession(session)}
                            className="flex-1 text-left"
                          >
                            <p className="font-medium text-slate-800 text-sm line-clamp-2">
                              {session.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {session.session_type} • {new Date(session.created_at).toLocaleDateString()}
                            </p>
                          </button>
                          <button
                            onClick={() => deleteSession(session.id)}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">📊 Your Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Sessions</span>
                  <span className="font-bold text-blue-600">{history.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Favorite Mode</span>
                  <span className="font-bold text-purple-600">
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-slate-600 text-sm">
            Made with ❤️ for students everywhere
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
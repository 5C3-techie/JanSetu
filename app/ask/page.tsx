'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUnifiedProfile, CitizenProfile } from '@/lib/storage';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { MessageSquare, Send, Sparkles, Loader2, Bot, User, ShieldCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function AskJanSetuPage() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      const current = await getUnifiedProfile(user?.uid);
      setProfile(current);
      setMessages([
        {
          id: 'msg_welcome',
          sender: 'assistant',
          text: `Hello ${current.name || 'Citizen'}! I am Ask Jan-Setu, your grounded AI assistant. I answer questions strictly using our 30 verified scheme knowledge base records. How can I help you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    };
    loadProfileData();
  }, [user]);

  const sampleQuestions = [
    "Which Telangana schemes can help me with housing?",
    "I am a farmer in Telangana. What benefits are available?",
    "What documents do I need for Rythu Bharosa / Rythu Bandhu?",
    "What health insurance cover is available under Aarogyasri / PM-JAY?",
    "What schemes provide monthly pension in Telangana?"
  ];

  const handleSend = async (questionText?: string) => {
    const query = questionText || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ask-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, profile, lang: language }),
      });
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: data.answer || "I don't have verified information about that requirement in the Jan-Setu knowledge base. Please check the official scheme source.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Ask assistant error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-700" />
            <span>Grounded Ask Jan-Setu Assistant</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Grounded Q&A using verified Telangana and Central government scheme knowledge base data.
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Grounded Gemini Layer</span>
        </span>
      </div>

      {/* SAMPLE QUESTIONS PILLS */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Suggested Questions</span>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left shadow-2xs"
            >
              "{sq}"
            </button>
          ))}
        </div>
      </div>

      {/* CHAT MESSAGES WINDOW */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs h-[420px] flex flex-col overflow-hidden">
        
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs ${
                msg.sender === 'user' ? 'bg-emerald-700' : 'bg-slate-900'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-none'
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
              }`}>
                <p className="whitespace-pre-line">{msg.text}</p>
                <span className={`text-[10px] block mt-1.5 font-medium ${
                  msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                }`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Jan-Setu is querying verified scheme records...</span>
            </div>
          )}
        </div>

        {/* INPUT BAR */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about scheme eligibility, documents, or benefits..."
              className="flex-1 p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium text-slate-900"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

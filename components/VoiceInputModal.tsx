'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Loader2, X, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtractedProfile: (extracted: any, rawText: string) => void;
}

export default function VoiceInputModal({ isOpen, onClose, onExtractedProfile }: VoiceInputModalProps) {
  const { t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = true;
        reco.interimResults = true;
        reco.lang = 'en-IN'; // Default to Indian English context

        reco.onresult = (event: any) => {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setTranscript(current);
        };

        reco.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
        };

        reco.onend = () => {
          setIsListening(false);
        };

        setRecognition(reco);
      }
    }
  }, []);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not natively supported in this browser. You can type your description directly below.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognition.start();
      setIsListening(true);
    }
  };

  const handleProcessText = async () => {
    if (!transcript.trim()) return;
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/parse-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript }),
      });
      const data = await res.json();
      onExtractedProfile(data.profile || {}, transcript);
      onClose();
    } catch (err) {
      console.error('Failed to parse voice intake:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto shadow-inner">
            <Mic className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Tell Us About Yourself</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Speak naturally about your age, location, occupation, income, and land details. Gemini AI will convert it into a structured profile for your review.
          </p>
        </div>

        {/* Mic Control Button */}
        <div className="my-6 text-center">
          <button
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all transform active:scale-95 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-lg ring-4 ring-rose-200'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <span className="text-xs font-semibold text-slate-500 block mt-2">
            {isListening ? 'Listening... Speak now' : 'Click microphone to start speaking'}
          </span>
        </div>

        {/* Speech / Text Box */}
        <div className="space-y-2">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="e.g., I am a 42 year old agricultural labourer from a village in Telangana. My annual income is 1.2 lakh and I don't own land."
            className="w-full h-28 p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleProcessText}
            disabled={!transcript.trim() || isAnalyzing}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 transition-all"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Parsing with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract Structured Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

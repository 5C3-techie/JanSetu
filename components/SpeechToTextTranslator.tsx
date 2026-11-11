'use client';

import React, { useState, useEffect } from 'react';
import { useSpeechRecognition, SpeechLanguage } from '@/lib/hooks/useSpeechRecognition';
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Globe,
  Loader2,
  AlertCircle,
  ArrowRightLeft,
  Languages,
  CheckCircle2,
  X
} from 'lucide-react';

export interface SpeechToTextTranslatorProps {
  initialSpeechLang?: SpeechLanguage;
  initialTargetLang?: 'en' | 'te';
  onTranslated?: (translatedText: string, originalText: string) => void;
  onTranscriptChange?: (text: string) => void;
  title?: string;
  subtitle?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export default function SpeechToTextTranslator({
  initialSpeechLang = 'te-IN',
  initialTargetLang = 'en',
  onTranslated,
  onTranscriptChange,
  title = 'Voice Speech-to-Text & Translation',
  subtitle = 'Powered by Web Speech API and Gemini 3.1 Flash Lite',
  isModal = false,
  onClose,
}: SpeechToTextTranslatorProps) {
  // Speech & Target Language States
  const [speechLang, setSpeechLang] = useState<SpeechLanguage>(initialSpeechLang);
  const [targetLang, setTargetLang] = useState<'en' | 'te'>(initialTargetLang);

  // Translation States
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  // UI States
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedTranslated, setCopiedTranslated] = useState(false);
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);

  // Web Speech API Hook
  const {
    isSupported,
    isListening,
    transcript,
    recordingDuration,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    defaultLang: speechLang,
    continuous: true,
    interimResults: true,
    maxDurationSeconds: 60,
    onSpeechEnd: (finalText) => {
      // Auto-trigger Gemini 3.1 Flash Lite translation on speech completion
      if (finalText && finalText.trim().length > 0) {
        handleTranslate(finalText);
      }
    },
  });

  // Keep parent notified of transcript changes
  useEffect(() => {
    if (onTranscriptChange) {
      onTranscriptChange(transcript);
    }
  }, [transcript, onTranscriptChange]);

  // Handle switching speech input language
  const handleSelectSpeechLang = (newLang: SpeechLanguage) => {
    if (isListening) {
      stopListening();
    }
    setSpeechLang(newLang);
    // Sensible default target language
    if (newLang === 'te-IN') {
      setTargetLang('en');
    } else {
      setTargetLang('te');
    }
    resetTranscript();
    setTranslatedText('');
    setTranslationError(null);
  };

  // Switch source & target
  const handleSwapLanguages = () => {
    if (isListening) {
      stopListening();
    }
    const nextSpeechLang: SpeechLanguage = speechLang === 'te-IN' ? 'en-IN' : 'te-IN';
    const nextTargetLang: 'en' | 'te' = targetLang === 'en' ? 'te' : 'en';
    setSpeechLang(nextSpeechLang);
    setTargetLang(nextTargetLang);
    resetTranscript();
    setTranslatedText('');
  };

  // Toggle recording
  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setTranslatedText('');
      setTranslationError(null);
      startListening(speechLang);
    }
  };

  // Translate with Gemini 3.1 Flash Lite
  const handleTranslate = async (textToTranslate?: string) => {
    const rawText = textToTranslate || transcript;
    if (!rawText || rawText.trim() === '') {
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);

    const sourceLangCode = speechLang === 'te-IN' ? 'te' : 'en';

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawText.trim(),
          sourceLang: sourceLangCode,
          targetLang: targetLang,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gemini translation request failed');
      }

      const result = data.translatedText || '';
      setTranslatedText(result);

      if (onTranslated) {
        onTranslated(result, rawText);
      }
    } catch (err: any) {
      console.error('Translation error:', err);
      setTranslationError(err?.message || 'Failed to translate speech with Gemini');
    } finally {
      setIsTranslating(false);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, type: 'original' | 'translated') => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'original') {
        setCopiedOriginal(true);
        setTimeout(() => setCopiedOriginal(false), 2000);
      } else {
        setCopiedTranslated(true);
        setTimeout(() => setCopiedTranslated(false), 2000);
      }
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }
  };

  // Text-To-Speech playback for translated text
  const handlePlayTts = () => {
    if (!translatedText || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (isSpeakingTts) {
      window.speechSynthesis.cancel();
      setIsSpeakingTts(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLang === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeakingTts(true);
    utterance.onend = () => setIsSpeakingTts(false);
    utterance.onerror = () => setIsSpeakingTts(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleResetAll = () => {
    if (isListening) stopListening();
    if (isSpeakingTts && typeof window !== 'undefined') window.speechSynthesis.cancel();
    resetTranscript();
    setTranslatedText('');
    setTranslationError(null);
  };

  const content = (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-7 space-y-6">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Gemini 3.1 Flash Lite</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Browser Support Check */}
      {!isSupported && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Web Speech API Not Detected in this Browser</strong>
            <span>
              Speech recognition requires Google Chrome, Microsoft Edge, or a Chromium-based browser supporting the Web Speech API (`SpeechRecognition`).
            </span>
          </div>
        </div>
      )}

      {/* Language Selector Toolbar */}
      <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Spoken Language Selection */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-600 font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span>Spoken Speech:</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSelectSpeechLang('te-IN')}
              disabled={isListening}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
                speechLang === 'te-IN'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>తెలుగు (te-IN)</span>
            </button>
            <button
              onClick={() => handleSelectSpeechLang('en-IN')}
              disabled={isListening}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
                speechLang === 'en-IN'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>English (en-IN)</span>
            </button>
          </div>
        </div>

        {/* Swap Direction */}
        <button
          onClick={handleSwapLanguages}
          disabled={isListening}
          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
          title="Swap speech and translation languages"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        {/* Target Translation Language */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-slate-600 font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider">
            <Languages className="w-3.5 h-3.5 text-blue-600" />
            <span>Translate To:</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTargetLang('en')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                targetLang === 'en'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>English</span>
            </button>
            <button
              onClick={() => setTargetLang('te')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                targetLang === 'te'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>తెలుగు (Telugu)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Microphone Interaction Zone */}
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 text-white text-center overflow-hidden shadow-inner">
        
        {/* Active Ambient Glow */}
        {isListening && (
          <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none animate-pulse" />
        )}

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          
          {/* Circular Mic Button */}
          <div className="relative">
            {isListening && (
              <>
                <span className="absolute -inset-2.5 rounded-full bg-emerald-500/25 animate-ping pointer-events-none" />
                <span className="absolute -inset-5 rounded-full bg-emerald-500/15 animate-pulse pointer-events-none" />
              </>
            )}

            <button
              onClick={handleToggleListening}
              disabled={!isSupported}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white scale-105'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white hover:scale-105'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? 'Click to Stop' : 'Click to Speak'}
            >
              {isListening ? (
                <Square className="w-8 h-8 fill-white" />
              ) : (
                <Mic className="w-9 h-9" />
              )}
            </button>
          </div>

          {/* Status Label & Timer */}
          <div>
            {isListening ? (
              <div className="space-y-1">
                <span className="inline-flex items-center gap-2 text-rose-400 font-bold text-sm tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span>Listening ({speechLang === 'te-IN' ? 'Telugu' : 'English'})...</span>
                </span>
                <p className="font-mono text-xs text-slate-400">
                  00:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration} / 01:00
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-200 block">
                  {transcript ? 'Click to speak again or edit below' : 'Click microphone to start speaking'}
                </span>
                <p className="text-xs text-slate-400">
                  {speechLang === 'te-IN'
                    ? 'తెలుగులో స్పష్టంగా మాట్లాడండి (e.g. నా పేరు రాములు, నేను రైతును...)'
                    : 'Speak naturally in English (e.g. I am a farmer looking for PM-KISAN...)'}
                </p>
              </div>
            )}
          </div>

          {/* Audio Wave Visualizer Simulation while Recording */}
          {isListening && (
            <div className="flex items-center gap-1.5 h-7">
              {[40, 70, 95, 60, 85, 100, 75, 45, 90, 65, 80, 50].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full animate-pulse"
                  style={{
                    height: `${Math.max(20, (h * (recordingDuration % 3 + 1)) / 3)}%`,
                    animationDelay: `${i * 75}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Errors (Speech recognition or translation) */}
      {(speechError || translationError) && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Error Occurred:</span>
            <span>{speechError || translationError}</span>
          </div>
        </div>
      )}

      {/* Transcripts and Translation Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. Speech-to-Text Raw Output (Web Speech API) */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-emerald-700" />
                <span>1. Speech-to-Text ({speechLang === 'te-IN' ? 'Telugu' : 'English'})</span>
              </span>
              {transcript && (
                <button
                  onClick={() => copyToClipboard(transcript, 'original')}
                  className="text-slate-400 hover:text-slate-700 text-xs flex items-center gap-1 transition-colors"
                  title="Copy Original Transcript"
                >
                  {copiedOriginal ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px] font-medium">{copiedOriginal ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            <div className="min-h-[110px] bg-white p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 leading-relaxed font-normal">
              {transcript ? (
                <p className="whitespace-pre-wrap">{transcript}</p>
              ) : isListening ? (
                <p className="text-slate-400 italic">Listening to your voice...</p>
              ) : (
                <p className="text-slate-400 italic">Speech transcript will appear here in real-time...</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-500 font-medium">Source: Web Speech API</span>
            {transcript && !isListening && (
              <button
                onClick={() => handleTranslate()}
                disabled={isTranslating}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shadow-xs flex items-center gap-1 disabled:opacity-50 transition-all"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Translating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>Translate Again</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 2. Translated Text (Gemini 3.1 Flash Lite) */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>2. Gemini 3.1 Flash Lite Translation ({targetLang === 'en' ? 'English' : 'Telugu'})</span>
              </span>
              {translatedText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlayTts}
                    className={`text-slate-500 hover:text-blue-600 text-xs flex items-center gap-1 transition-colors ${
                      isSpeakingTts ? 'text-blue-600 font-bold' : ''
                    }`}
                    title="Listen with Speech Synthesis"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">{isSpeakingTts ? 'Stop' : 'Listen'}</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(translatedText, 'translated')}
                    className="text-slate-400 hover:text-slate-700 text-xs flex items-center gap-1 transition-colors"
                    title="Copy Translated Text"
                  >
                    {copiedTranslated ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[11px] font-medium">{copiedTranslated ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="min-h-[110px] bg-white p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 leading-relaxed font-normal">
              {isTranslating ? (
                <div className="flex flex-col items-center justify-center h-full py-6 space-y-2 text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-xs font-semibold">Gemini 3.1 Flash Lite translating...</span>
                </div>
              ) : translatedText ? (
                <p className="whitespace-pre-wrap">{translatedText}</p>
              ) : (
                <p className="text-slate-400 italic">
                  Translated text will appear here automatically using Gemini 3.1 Flash Lite.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-500 font-medium">Model: gemini-3.1-flash-lite</span>
            {translatedText && (
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Translation Ready</span>
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Footer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <button
          onClick={handleResetAll}
          disabled={!transcript && !translatedText && !isListening}
          className="px-3.5 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear & Start Over</span>
        </button>

        <div className="flex items-center gap-2">
          {onTranslated && translatedText && (
            <button
              onClick={() => onTranslated(translatedText, transcript)}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Use Translation</span>
            </button>
          )}

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-all"
            >
              Done
            </button>
          )}
        </div>
      </div>

    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
        <div className="max-w-3xl w-full my-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
}


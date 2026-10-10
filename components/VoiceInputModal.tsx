'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { CitizenProfile } from '@/lib/storage';
import {
  Mic,
  Square,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Globe,
  Loader2,
  X
} from 'lucide-react';

interface JanSetuSpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
  };
}

interface JanSetuSpeechRecognitionResultList {
  length: number;
  [index: number]: JanSetuSpeechRecognitionResult;
}

interface JanSetuSpeechRecognitionEvent extends Event {
  results: JanSetuSpeechRecognitionResultList;
  resultIndex: number;
}

interface JanSetuSpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface JanSetuSpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;

  start(): void;
  stop(): void;
  abort(): void;

  onstart: (() => void) | null;
  onresult: ((event: JanSetuSpeechRecognitionEvent) => void) | null;
  onerror: ((event: JanSetuSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface JanSetuSpeechRecognitionConstructor {
  new(): JanSetuSpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: JanSetuSpeechRecognitionConstructor;
    webkitSpeechRecognition?: JanSetuSpeechRecognitionConstructor;
  }
}

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParsed: (profileData: Partial<CitizenProfile>, textInput?: string) => void;
}

type UIState = 'IDLE' | 'RECORDING' | 'TRANSCRIBING' | 'PARSING' | 'TRANSCRIBED' | 'ERROR';

export default function VoiceInputModal({ isOpen, onClose, onParsed }: VoiceInputModalProps) {
  const [uiState, setUiState] = useState<UIState>('IDLE');
  const [language, setLanguage] = useState<'te-IN' | 'en-IN'>('te-IN');
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [extractedProfile, setExtractedProfile] = useState<Partial<CitizenProfile>>({});
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef<JanSetuSpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef('');
  const recognitionErrorRef = useRef(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    stopTimer();

    const recognition = recognitionRef.current;
    recognitionRef.current = null;

    if (recognition) {
      try {
        recognition.abort();
      } catch {
        // Recognition may already be stopped
      }
    }

    finalTranscriptRef.current = '';
    recognitionErrorRef.current = true;

    setUiState('IDLE');
    setRecordingTime(0);
    setTranscript('');
    setExtractedProfile({});
    setErrorMessage('');
  };

  const startTimer = () => {
    stopTimer();
    setRecordingTime(0);

    timerIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        const next = prev + 1;

        if (next >= 60) {
          setTimeout(() => stopRecording(), 0);
          return 60;
        }

        return next;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startRecording = () => {
    setErrorMessage('');
    setTranscript('');
    setExtractedProfile({});
    finalTranscriptRef.current = '';
    recognitionErrorRef.current = false;

    if (typeof window === 'undefined') {
      return;
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setErrorMessage(
        'Voice input is not supported in this browser. Please use Google Chrome.'
      );
      setUiState('ERROR');
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();

      recognition.lang = language;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;

      recognition.onstart = () => {
        console.log('Speech recognition started:', language);
        setUiState('RECORDING');
        startTimer();
      };

      recognition.onresult = (event: JanSetuSpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = finalTranscriptRef.current;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';

          if (result.isFinal) {
            finalTranscript += text + ' ';
          } else {
            interimTranscript += text;
          }
        }

        finalTranscriptRef.current = finalTranscript;

        setTranscript(
          (finalTranscript + interimTranscript).trim()
        );
      };

      recognition.onerror = (event: JanSetuSpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);

        stopTimer();

        if (event.error !== 'aborted') {
          recognitionErrorRef.current = true;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage(
            'Microphone permission was denied. Please allow microphone access in Chrome and try again.'
          );
        } else if (event.error === 'no-speech') {
          setErrorMessage(
            'No speech detected. Please speak clearly and try again.'
          );
        } else if (event.error === 'network') {
          setErrorMessage(
            'Speech recognition service is unavailable. Please check your internet connection and try again.'
          );
        } else if (event.error === 'language-not-supported') {
          setErrorMessage(
            `The selected language (${language}) is not supported by this browser.`
          );
        } else if (event.error !== 'aborted') {
          setErrorMessage(
            'Voice recognition failed. Please try again.'
          );
        }

        if (event.error !== 'aborted') {
          setUiState('ERROR');
        }
      };

      recognition.onend = async () => {
        stopTimer();

        const finalText = finalTranscriptRef.current.trim();

        console.log('Speech recognition ended.');
        console.log('Final transcript:', finalText);

        recognitionRef.current = null;

        if (recognitionErrorRef.current) {
          return;
        }

        if (!finalText) {
          setErrorMessage(
            'No speech was detected. Please speak clearly into your microphone.'
          );
          setUiState('ERROR');
          return;
        }

        setTranscript(finalText);
        await parseTranscript(finalText);
      };

      recognition.start();

    } catch (error) {
      console.error('Could not start speech recognition:', error);

      stopTimer();
      recognitionRef.current = null;

      setErrorMessage(
        'Could not start voice recognition. Please use Google Chrome and allow microphone access.'
      );

      setUiState('ERROR');
    }
  };

  const stopRecording = () => {
    stopTimer();

    const recognition = recognitionRef.current;

    if (recognition) {
      setUiState('TRANSCRIBING');

      try {
        recognition.stop();
      } catch {
        // Recognition may already have stopped
      }
    }
  };

  const parseTranscript = async (text: string) => {
    setUiState('PARSING');
    try {
      const parseRes = await fetch('/api/parse-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const parseData = await parseRes.json();
      if (!parseRes.ok || !parseData.profile) {
        throw new Error('Could not parse profile attributes from transcript.');
      }

      const extracted = parseData.profile;
      setExtractedProfile(extracted);
      setUiState('TRANSCRIBED');

      // AUTOMATIC FORM AUTO-FILL TRIGGER
      onParsed(extracted, text);
    } catch (err: any) {
      console.error('Transcript parsing error:', err);
      setErrorMessage('Could not extract profile attributes from transcript.');
      setUiState('ERROR');
    }
  };

  const handleApplyConfirm = () => {
    // Profile data is already applied when parsing succeeds.
    // Do not call onParsed again here, otherwise auto-filled fields are duplicated.
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>🎙️ Voice Profile Intake</span>
                <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                  Browser Voice
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Speak naturally in Telugu or English. Your speech is transcribed and automatically used to populate your citizen profile.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LANGUAGE SELECTOR BAR */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
          <div className="flex items-center space-x-2 text-slate-700 font-bold">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Select Speech Language:</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLanguage('te-IN')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all text-xs ${language === 'te-IN'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
            >
              తెలుగు (te-IN)
            </button>
            <button
              onClick={() => setLanguage('en-IN')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all text-xs ${language === 'en-IN'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
            >
              English (en-IN)
            </button>
          </div>
        </div>

        {/* RECORDING / PROCESSING DISPLAY */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white text-center space-y-4 relative overflow-hidden shadow-inner">
          {uiState === 'IDLE' && (
            <div className="space-y-3 py-2">
              <button
                onClick={startRecording}
                className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center mx-auto shadow-lg hover:scale-105 transition-all group"
              >
                <Mic className="w-7 h-7 group-hover:scale-110 transition-transform" />
              </button>
              <span className="block text-xs font-bold text-slate-300">
                Click microphone to start speaking
              </span>
            </div>
          )}

          {uiState === 'RECORDING' && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-center space-x-3">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-xl font-mono font-bold text-rose-400">
                  Listening... 00:{recordingTime < 10 ? `0${recordingTime}` : recordingTime} / 01:00
                </span>
              </div>

              <div className="w-48 h-2 bg-slate-800 rounded-full mx-auto overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${(recordingTime / 60) * 100}%` }}
                ></div>
              </div>

              <button
                onClick={stopRecording}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 mx-auto shadow-md transition-all"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop Recording</span>
              </button>
            </div>
          )}

          {uiState === 'TRANSCRIBING' && (
            <div className="py-6 space-y-3">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-300">
                Finalizing your speech transcript…
              </p>
            </div>
          )}

          {uiState === 'PARSING' && (
            <div className="py-6 space-y-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-300">
                Understanding your profile…
              </p>
            </div>
          )}

          {uiState === 'TRANSCRIBED' && (
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile details extracted & auto-filled!</span>
              </span>

              <button
                onClick={startRecording}
                className="text-slate-300 hover:text-white flex items-center gap-1 font-semibold underline text-[11px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Record Again</span>
              </button>
            </div>
          )}

          {uiState === 'ERROR' && (
            <div className="py-3 space-y-2 text-rose-300 text-xs">
              <AlertCircle className="w-6 h-6 mx-auto text-rose-400" />
              <p className="font-semibold">{errorMessage}</p>
              <button
                onClick={startRecording}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px]"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* TRANSCRIPT & EXTRACTION PREVIEW */}
        {(transcript || uiState === 'TRANSCRIBED') && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                1. Verbatim Speech Transcript:
              </span>
              <p className="text-xs text-slate-900 font-medium bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                "{transcript}"
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                2. Auto-Populated Profile Fields:
              </span>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <div className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl">
                  <span className="text-slate-500 block text-[11px]">Age</span>
                  <strong className="text-slate-900">
                    {extractedProfile.age ? `${extractedProfile.age} Years` : 'Unchanged / null'}
                  </strong>
                </div>

                <div className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl">
                  <span className="text-slate-500 block text-[11px]">Annual Income</span>
                  <strong className="text-slate-900">
                    {extractedProfile.annualIncome ? `₹${extractedProfile.annualIncome.toLocaleString('en-IN')}` : 'Unchanged / null'}
                  </strong>
                </div>

                <div className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl">
                  <span className="text-slate-500 block text-[11px]">State</span>
                  <strong className="text-slate-900">
                    {extractedProfile.state || 'Unchanged / null'}
                  </strong>
                </div>

                <div className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl">
                  <span className="text-slate-500 block text-[11px]">Occupation</span>
                  <strong className="text-slate-900">
                    {extractedProfile.occupation ? extractedProfile.occupation.replace(/_/g, ' ') : 'Unchanged / null'}
                  </strong>
                </div>

                <div className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl">
                  <span className="text-slate-500 block text-[11px]">Land Ownership</span>
                  <strong className="text-slate-900">
                    {extractedProfile.landOwnership === true ? 'Owns Land' : extractedProfile.landOwnership === false ? 'Landless' : 'Unchanged / null'}
                  </strong>
                </div>

                <div className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl">
                  <span className="text-slate-500 block text-[11px]">Residential Status</span>
                  <strong className="text-slate-900">
                    {extractedProfile.isRural === true ? 'Rural / Village' : extractedProfile.isRural === false ? 'Urban / City' : 'Unchanged / null'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all"
          >
            Close Window
          </button>

          <button
            onClick={handleApplyConfirm}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Confirm & Return to Profile</span>
          </button>
        </div>

      </div>
    </div>
  );
}

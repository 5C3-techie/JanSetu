'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Web Speech API Types
export interface WebSpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
    confidence: number;
  };
}

export interface WebSpeechRecognitionResultList {
  length: number;
  [index: number]: WebSpeechRecognitionResult;
}

export interface WebSpeechRecognitionEvent extends Event {
  results: WebSpeechRecognitionResultList;
  resultIndex: number;
}

export interface WebSpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

export interface WebSpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onresult: ((event: WebSpeechRecognitionEvent) => void) | null;
  onerror: ((event: WebSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

export interface WebSpeechRecognitionConstructor {
  new (): WebSpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: WebSpeechRecognitionConstructor;
    webkitSpeechRecognition?: WebSpeechRecognitionConstructor;
  }
}

export type SpeechLanguage = 'te-IN' | 'en-IN';

export interface UseSpeechRecognitionOptions {
  defaultLang?: SpeechLanguage;
  continuous?: boolean;
  interimResults?: boolean;
  maxDurationSeconds?: number;
  onSpeechEnd?: (finalTranscript: string) => void;
}

export function useSpeechRecognition({
  defaultLang = 'te-IN',
  continuous = true,
  interimResults = true,
  maxDurationSeconds = 60,
  onSpeechEnd,
}: UseSpeechRecognitionOptions = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<SpeechLanguage>(defaultLang);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<WebSpeechRecognitionInstance | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalAccumulatorRef = useRef('');
  const hasErrorRef = useRef(false);
  const onSpeechEndRef = useRef(onSpeechEnd);

  useEffect(() => {
    onSpeechEndRef.current = onSpeechEnd;
  }, [onSpeechEnd]);

  // Check browser compatibility on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAvailable = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
      setIsSupported(isAvailable);
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    clearTimer();
    const recognition = recognitionRef.current;
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        // Recognition may already be inactive
      }
    }
    setIsListening(false);
  }, [clearTimer]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setFinalTranscript('');
    finalAccumulatorRef.current = '';
    setRecordingDuration(0);
    setError(null);
  }, []);

  const startListening = useCallback(
    (langOverride?: SpeechLanguage) => {
      setError(null);
      resetTranscript();
      hasErrorRef.current = false;

      if (typeof window === 'undefined') return;

      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognitionAPI) {
        setError('Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
        return;
      }

      const activeLang = langOverride || language;
      setLanguage(activeLang);

      try {
        // Clean up previous instance if still hanging
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {
            // Ignored
          }
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.lang = activeLang;
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.maxAlternatives = 1;

        recognitionRef.current = recognition;

        recognition.onstart = () => {
          setIsListening(true);
          setRecordingDuration(0);

          clearTimer();
          timerRef.current = setInterval(() => {
            setRecordingDuration((prev) => {
              const next = prev + 1;
              if (next >= maxDurationSeconds) {
                stopListening();
                return maxDurationSeconds;
              }
              return next;
            });
          }, 1000);
        };

        recognition.onresult = (event: WebSpeechRecognitionEvent) => {
          let currentInterim = '';
          let currentFinal = finalAccumulatorRef.current;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            const text = res[0]?.transcript || '';

            if (res.isFinal) {
              currentFinal += (currentFinal ? ' ' : '') + text.trim();
            } else {
              currentInterim += text;
            }
          }

          finalAccumulatorRef.current = currentFinal;
          setFinalTranscript(currentFinal);
          setInterimTranscript(currentInterim);
          const combined = (currentFinal + (currentInterim ? ' ' + currentInterim : '')).trim();
          setTranscript(combined);
        };

        recognition.onerror = (event: WebSpeechRecognitionErrorEvent) => {
          console.warn('Speech Recognition error event:', event.error);
          clearTimer();

          if (event.error !== 'aborted') {
            hasErrorRef.current = true;
          }

          switch (event.error) {
            case 'not-allowed':
            case 'service-not-allowed':
              setError('Microphone permission was denied. Please allow microphone access in your browser settings and try again.');
              break;
            case 'no-speech':
              setError('No speech was detected. Please speak clearly into your microphone.');
              break;
            case 'network':
              setError('Speech service connection error. Please verify your internet connection.');
              break;
            case 'language-not-supported':
              setError(`The selected language (${activeLang}) is not supported on this browser.`);
              break;
            case 'aborted':
              // User aborted or stopped; don't set as error
              break;
            default:
              setError(`Voice recognition error: ${event.error}. Please try again.`);
          }

          setIsListening(false);
        };

        recognition.onend = () => {
          clearTimer();
          setIsListening(false);
          recognitionRef.current = null;

          const completeText = finalAccumulatorRef.current.trim();
          if (completeText) {
            setTranscript(completeText);
            setInterimTranscript('');
            if (onSpeechEndRef.current && !hasErrorRef.current) {
              onSpeechEndRef.current(completeText);
            }
          }
        };

        recognition.start();
      } catch (err: any) {
        console.error('Failed to start speech recognition:', err);
        clearTimer();
        setError('Could not start microphone. Please check your browser permissions.');
        setIsListening(false);
      }
    },
    [continuous, interimResults, language, maxDurationSeconds, resetTranscript, stopListening, clearTimer]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignored
        }
      }
    };
  }, [clearTimer]);

  return {
    isSupported,
    isListening,
    language,
    transcript,
    finalTranscript,
    interimTranscript,
    recordingDuration,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setLanguage,
  };
}


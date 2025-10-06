import { useState, useRef, useCallback } from 'react';
import useReCaptcha from './useReCaptcha';

interface UseVoiceToTextOptions {
  maxRecordingTime?: number; // Maximum recording time in milliseconds
  language?: string; // Language code for transcription (e.g., 'en', 'fr', etc.)
  onTranscriptionStart?: () => void; // Callback when transcription starts
  onTranscriptionComplete?: (text: string) => void; // Callback when transcription is complete
  onError?: (error: Error) => void; // Callback when an error occurs
}

interface UseVoiceToTextReturn {
  isRecording: boolean; // Whether recording is currently active
  isProcessing: boolean; // Whether audio is being processed
  transcribedText: string; // The transcribed text
  startRecording: () => Promise<void>; // Function to start recording
  stopRecording: () => void; // Function to stop recording
  error: Error | null; // Any error that occurred
}

/**
 * A hook for recording audio and transcribing it to text using OpenAI Whisper
 * 
 * @param options Configuration options for the voice-to-text functionality
 * @returns Object containing recording state and control functions
 */
export function useVoiceToText(options: UseVoiceToTextOptions = {}): UseVoiceToTextReturn {
  const {
    maxRecordingTime = 10000, // Default to 10 seconds
    language = 'en', // Default to English
    onTranscriptionStart,
    onTranscriptionComplete,
    onError
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [error, setError] = useState<Error | null>(null);

  // Refs for voice input
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Get reCAPTCHA token generator
  const { getReCaptchaToken } = useReCaptcha();

  // Check if audio recording is available
  const audioAvailable = typeof window !== 'undefined' && 
    'mediaDevices' in navigator && 
    'getUserMedia' in navigator.mediaDevices;

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async () => {
    // Reset state
    setError(null);
    setTranscribedText('');
    setIsProcessing(true);
    
    if (!audioAvailable) {
      const error = new Error('Microphone access is not available in this browser');
      setError(error);
      setIsProcessing(false);
      if (onError) onError(error);
      return;
    }

    try {
      // Use MediaRecorder to capture audio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        
        if (onTranscriptionStart) onTranscriptionStart();
        
        try {
          // Create form data to send to API
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');
          formData.append('model', 'whisper-1');
          formData.append('language', language);
          
          // Get reCAPTCHA token
          const recaptchaToken = await getReCaptchaToken('transcribe_audio');
          
          // Send to our proxy endpoint
          const response = await fetch('/.netlify/functions/openai-proxy', {
            method: 'POST',
            body: formData,
            headers: {
              'X-ReCaptcha-Token': recaptchaToken || '',
              'X-Request-Type': 'whisper' // Indicate this is a Whisper API request
            }
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.text) {
            setTranscribedText(data.text);
            if (onTranscriptionComplete) onTranscriptionComplete(data.text);
          } else {
            throw new Error('No transcription returned');
          }
        } catch (error) {
          console.error('Error processing audio:', error);
          const errorObj = error instanceof Error ? error : new Error('Error processing audio');
          setError(errorObj);
          if (onError) onError(errorObj);
        } finally {
          setIsRecording(false);
          setIsProcessing(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Automatically stop after maxRecordingTime
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, maxRecordingTime);
      
    } catch (error) {
      console.error('Error starting audio recording:', error);
      const errorObj = error instanceof Error ? error : new Error('Error accessing microphone');
      setError(errorObj);
      setIsRecording(false);
      setIsProcessing(false);
      if (onError) onError(errorObj);
    }
  }, [audioAvailable, getReCaptchaToken, language, maxRecordingTime, onError, onTranscriptionComplete, onTranscriptionStart]);

  /**
   * Stop recording audio
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return {
    isRecording,
    isProcessing,
    transcribedText,
    startRecording,
    stopRecording,
    error
  };
}

export default useVoiceToText;
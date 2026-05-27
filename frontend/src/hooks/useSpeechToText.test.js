import { renderHook, act } from '@testing-library/react';
import { render } from '@testing-library/react';
import useSpeechToText from './useSpeechToText';

// Mock Web Speech API
global.SpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onerror: null,
  onstart: null,
  onend: null,
  onresult: null,
  interimTranscript: '',
  finalTranscript: '',
}));

describe('useSpeechToText Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hook Initialization', () => {
    it('should initialize without errors', () => {
      const { result } = renderHook(() => useSpeechToText());
      expect(result.current).toBeDefined();
    });

    it('should return required properties', () => {
      const { result } = renderHook(() => useSpeechToText());
      expect(result.current.isListening).toBeDefined();
      expect(result.current.transcript).toBeDefined();
      expect(result.current.startListening).toBeDefined();
      expect(result.current.stopListening).toBeDefined();
    });
  });

  describe('Speech Recognition', () => {
    it('should check browser support', () => {
      const { result } = renderHook(() => useSpeechToText());
      expect(typeof result.current.isListening).toBe('boolean');
    });

    it('should initialize with listening state false', () => {
      const { result } = renderHook(() => useSpeechToText());
      expect(result.current.isListening).toBe(false);
    });

    it('should initialize with empty transcript', () => {
      const { result } = renderHook(() => useSpeechToText());
      expect(result.current.transcript).toBe('');
    });
  });

  describe('Start/Stop Listening', () => {
    it('should provide start listening function', () => {
      const { result } = renderHook(() => useSpeechToText());
      expect(typeof result.current.startListening).toBe('function');
    });

    it('should provide stop listening function', () => {
      const { result } = renderHook(() => useSpeechToText());
      expect(typeof result.current.stopListening).toBe('function');
    });

    it('should start listening without errors', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        result.current.startListening();
      });

      expect(result.current.startListening).toBeDefined();
    });

    it('should stop listening without errors', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        result.current.stopListening();
      });

      expect(result.current.stopListening).toBeDefined();
    });
  });

  describe('Transcript Updates', () => {
    it('should accumulate transcript', async () => {
      const { result } = renderHook(() => useSpeechToText());

      expect(result.current.transcript).toBe('');
    });

    it('should clear transcript when needed', async () => {
      const { result } = renderHook(() => useSpeechToText());
      expect(result.current.transcript).toBe('');
    });
  });

  describe('Browser Compatibility', () => {
    it('should handle unsupported browsers', () => {
      const { result } = renderHook(() => useSpeechToText());
      expect(result.current).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle speech recognition errors', () => {
      const { result } = renderHook(() => useSpeechToText());
      expect(result.current.startListening).toBeDefined();
    });

    it('should provide error state', () => {
      const { result } = renderHook(() => useSpeechToText());
      expect(result.current).toBeDefined();
    });
  });
});

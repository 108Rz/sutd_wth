import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, X } from 'lucide-react'
import { useMessages } from 'utils/useMessages'

// Extend the existing interfaces
interface AudioRecorderProps {
  selectedModel: string
  activeTabId: string
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  selectedModel, 
  activeTabId 
}) => {
  const { addMessage } = useMessages()
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])

  // Speech recognition
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check for browser support of Web Speech API
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      // Configuration
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      // Event handlers
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        setTranscript(finalTranscript || interimTranscript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
      }
    }

    return () => {
      // Cleanup
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    audioChunksRef.current = []
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
      }

      // Start audio recording
      mediaRecorderRef.current.start()
      setIsRecording(true)

      // Start speech recognition if available
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    setIsRecording(false)
  }

  const submitAudioTranscript = async () => {
    if (transcript.trim()) {
      // Send transcript as message
      await addMessage(
        transcript, 
        undefined, 
        undefined, 
        selectedModel, 
        activeTabId
      )

      // Reset transcript and audio blob
      setTranscript('')
      setAudioBlob(null)
    }
  }

  const clearAudio = () => {
    setAudioBlob(null)
    setTranscript('')
  }

  return (
    <div className="flex items-center space-x-2">
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="p-2 rounded-full bg-blue-500 text-white 
                     hover:bg-blue-600 focus:outline-none 
                     focus:ring-2 focus:ring-blue-300"
          aria-label="Start audio recording"
        >
          <Mic className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="p-2 rounded-full bg-red-500 text-white 
                     hover:bg-red-600 focus:outline-none 
                     focus:ring-2 focus:ring-red-300"
          aria-label="Stop audio recording"
        >
          <MicOff className="w-5 h-5" />
        </button>
      )}

      {audioBlob && (
        <div className="flex items-center space-x-2">
          <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {transcript || 'Transcribing...'}
            </p>
          </div>
          <button
            onClick={submitAudioTranscript}
            className="px-3 py-2 bg-green-500 text-white rounded-lg 
                       hover:bg-green-600 focus:outline-none 
                       focus:ring-2 focus:ring-green-300"
          >
            Send
          </button>
          <button
            onClick={clearAudio}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
            aria-label="Clear audio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default AudioRecorder
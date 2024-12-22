import React, { useState, useRef, useEffect } from 'react'
import { Send, Image, FileText, X, File as FileIcon } from 'lucide-react'
import { useMessages } from 'utils/useMessages'
import AudioRecorder from './AudioRecorder'

interface MessageFormProps {
  selectedModel: string
  activeTabId: string
}

const MessageForm: React.FC<MessageFormProps> = ({ 
  selectedModel, 
  activeTabId 
}) => {
  const [message, setMessage] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [documentFiles, setDocumentFiles] = useState<File[]>([])
  const [isComposing, setIsComposing] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const { 
    addMessage, 
    uploadImage, 
    isLoadingAnswer,
    tabs
  } = useMessages()

  // Auto-resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'inherit'
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
    }
  }, [message])

  const activeTab = tabs?.find(tab => tab.id === activeTabId)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    const trimmedMessage = message.trim()
    if ((!trimmedMessage && !imageFile) || isLoadingAnswer) return

    try {
      let base64Image: string | undefined
      if (imageFile) {
        base64Image = await uploadImage(imageFile)
      }

      await addMessage(
        trimmedMessage, 
        imageFile, 
        base64Image, 
        selectedModel, 
        activeTabId
      )

      // Reset form
      setMessage('')
      setImageFile(null)
      if (imageInputRef.current) imageInputRef.current.value = ''
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'inherit'
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    const files = e.target.files
    if (!files) return

    if (isImage) {
      setImageFile(files[0])
    } else {
      setDocumentFiles(Array.from(files))
    }
  }

  const removeFile = (fileToRemove: File, isImage: boolean) => {
    if (isImage) {
      setImageFile(null)
      if (imageInputRef.current) imageInputRef.current.value = ''
    } else {
      setDocumentFiles(prev => prev.filter(file => file !== fileToRemove))
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* File Previews */}
        {(imageFile || documentFiles.length > 0) && (
          <div className="mb-3 flex flex-wrap gap-2">
            {imageFile && (
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg 
                           text-gray-700 dark:text-gray-300 group hover:bg-gray-200 dark:hover:bg-gray-700
                           transition-colors">
                <Image className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-sm font-medium">{imageFile.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(imageFile, true)}
                  className="ml-2 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40
                           text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {documentFiles.map((file, index) => (
              <div 
                key={index}
                className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg
                         text-gray-700 dark:text-gray-300 group hover:bg-gray-200 dark:hover:bg-gray-700
                         transition-colors"
              >
                <FileIcon className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-sm font-medium">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(file, false)}
                  className="ml-2 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40
                           text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Container */}
        <div className="flex items-end space-x-2 bg-gray-50 dark:bg-gray-800 rounded-lg 
                     border border-gray-200 dark:border-gray-700 p-2">
          {/* File Upload Buttons */}
          <div className="flex space-x-1 pt-1">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
                       hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Upload image"
            >
              <Image className="w-5 h-5" />
            </button>
            <input
              type="file"
              ref={imageInputRef}
              onChange={(e) => handleFileUpload(e, true)}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
                       hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Upload document"
            >
              <FileText className="w-5 h-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e, false)}
              multiple
              className="hidden"
            />
          </div>

          {/* Message Input */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textAreaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={`Ask about ${activeTab?.subject || 'your subject'}... (Press Enter to send)`}
              className="w-full bg-transparent border-0 resize-none max-h-32 focus:ring-0 
                       text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              rows={1}
              disabled={isLoadingAnswer}
            />
          </div>

          {/* Audio and Send Buttons */}
          <div className="flex items-center space-x-2 pt-1">
            <AudioRecorder 
              selectedModel={selectedModel} 
              activeTabId={activeTabId} 
            />
            
            <button
              type="submit"
              disabled={isLoadingAnswer || (!message.trim() && !imageFile)}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Typing Indicator */}
        {isLoadingAnswer && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
            TutorMe is typing...
          </div>
        )}
      </form>
    </div>
  )
}

export default MessageForm
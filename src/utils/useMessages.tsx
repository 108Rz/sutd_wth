// utils/useMessages.ts
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { useToast } from '@apideck/components'

interface GeminiMessage {
  role: 'user' | 'model' | 'system'
  content: string
  image?: string
  pdf?: string
  tabId: string
}

interface FileData {
  inlineData: {
    data: string
    mimeType: string
  }
}
interface ChatTab {
  id: string
  name: string
  messages: GeminiMessage[]
  model: string
  lastUpdated: Date
  educationLevel: 'PSLE' | 'OLEVEL'  // Add this
  subject: string                     // Add this
}

interface ContextProps {
  messages: GeminiMessage[]
  activeTabId: string
  tabs: ChatTab[]
  addMessage: (content: string, image?: File, imageBase64?: string, model?: string, tabId?: string) => Promise<void>
  isLoadingAnswer: boolean
  uploadImage: (file: File) => Promise<string>
  createNewTab: (educationLevel: 'PSLE' | 'OLEVEL', subject: string) => void
  switchTab: (tabId: string) => void
  deleteTab: (tabId: string) => void
  renameTab: (tabId: string, newName: string) => void
}

const ChatsContext = createContext<Partial<ContextProps>>({})

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

async function sendMessage(messages: GeminiMessage[], model?: string, educationLevel?: string, subject?: string) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      messages, 
      model,
      educationLevel,
      subject
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to send message')
  }

  return response.json()
}

const createInitialMessages = (tabId: string, educationLevel: string, subject: string): GeminiMessage[] => {
  return [
    {
      role: 'system',
      content: `You are an expert, approachable, and supportive AI assistant designed to help students 
               in the Singapore ${educationLevel} education system, specifically with ${subject}.`,
      tabId: tabId
    },
    {
      role: 'model',
      content: `Hi there! I'm ready to help you with your ${educationLevel} ${subject}. What topic or question are you working on today? Don't hesitate to ask even if it seems simple; it's important to have a strong foundation. Let me know how I can support you!`,
      tabId: tabId
    }
  ]
}

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { addToast } = useToast()
  const [tabs, setTabs] = useState<ChatTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string>('')
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false)

  // Initialize or load from localStorage
  useEffect(() => {
    const savedTabs = localStorage.getItem('chatTabs')
    if (savedTabs) {
      try {
        const parsedTabs = JSON.parse(savedTabs)
        setTabs(parsedTabs.map((tab: any) => ({
          ...tab,
          lastUpdated: new Date(tab.lastUpdated)
        })))
        setActiveTabId(parsedTabs[0].id)
      } catch (error) {
        console.error('Error loading saved tabs:', error)
        createFirstTab()
      }
    } else {
      createFirstTab()
    }
  }, [])

  const createFirstTab = () => {
    const newTabId = Date.now().toString()
    const initialTab: ChatTab = {
      id: newTabId,
      name: 'PSLE Mathematics',
      messages: createInitialMessages(newTabId, 'PSLE', 'Mathematics'),
      model: 'gemini-1.5-pro',
      lastUpdated: new Date(),
      educationLevel: 'PSLE',
      subject: 'Mathematics'
    }
    setTabs([initialTab])
    setActiveTabId(newTabId)
  }

  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem('chatTabs', JSON.stringify(tabs))
    }
  }, [tabs])

  const createNewTab = (educationLevel: 'PSLE' | 'OLEVEL', subject: string) => {
    const newTabId = Date.now().toString()
    const newTab: ChatTab = {
      id: newTabId,
      name: `${educationLevel} ${subject}`,
      messages: createInitialMessages(newTabId, educationLevel, subject),
      model: 'gemini-1.5-pro',
      lastUpdated: new Date(),
      educationLevel,
      subject
    }
    setTabs(prev => [newTab, ...prev])
    setActiveTabId(newTabId)
  }

  const switchTab = (tabId: string) => {
    setActiveTabId(tabId)
  }

  const deleteTab = (tabId: string) => {
    if (tabs.length === 1) {
      createNewTab('PSLE', 'Mathematics') // Default values
      return
    }
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId)
      if (activeTabId === tabId) {
        setActiveTabId(newTabs[0].id)
      }
      return newTabs
    })
  }

  const renameTab = (tabId: string, newName: string) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId
        ? { ...tab, name: newName, lastUpdated: new Date() }
        : tab
    ))
  }

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const base64Image = await fileToBase64(file)
      return base64Image
    } catch (error) {
      addToast({ 
        title: 'Failed to process image', 
        type: 'error' 
      })
      throw error
    }
  }

  const addMessage = async (
    content: string,
    image?: File,
    imageBase64?: string,
    model?: string,
    tabId: string = activeTabId
  ) => {
    setIsLoadingAnswer(true)
    try {
      const currentTab = tabs.find(tab => tab.id === tabId)
      if (!currentTab) return

      const newMessage: GeminiMessage = {
        role: 'user',
        content,
        image: imageBase64,
        tabId
      }

      // Create a new array of messages for this tab only
      const currentTabMessages = currentTab.messages.filter(msg => msg.tabId === tabId)
      const updatedMessages = [...currentTabMessages, newMessage]

      // Update the tab's messages
      setTabs(prev => prev.map(tab => {
        if (tab.id === tabId) {
          return {
            ...tab,
            messages: updatedMessages,
            lastUpdated: new Date()
          }
        }
        return tab
      }))

      // Send only this tab's messages to the API
      const response = await sendMessage(
        updatedMessages, 
        model,
        currentTab.educationLevel,
        currentTab.subject
      )

      const reply: GeminiMessage = {
        role: 'model',
        content: response.text,
        tabId
      }

      // Update with the AI reply
      setTabs(prev => prev.map(tab => {
        if (tab.id === tabId) {
          return {
            ...tab,
            messages: [...updatedMessages, reply],
            lastUpdated: new Date()
          }
        }
        return tab
      }))
    } catch (error) {
      addToast({ 
        title: 'An error occurred', 
        type: 'error' 
      })
    } finally {
      setIsLoadingAnswer(false)
    }
  }

  // Get only the messages for the current tab
  const currentTab = tabs.find(tab => tab.id === activeTabId)
  const currentMessages = currentTab?.messages.filter(msg => msg.tabId === activeTabId) || []

  return (
    <ChatsContext.Provider value={{
      messages: currentMessages,
      activeTabId,
      tabs,
      addMessage,
      isLoadingAnswer,
      uploadImage,
      createNewTab,
      switchTab,
      deleteTab,
      renameTab
    }}>
      {children}
    </ChatsContext.Provider>
  )
}

export const useMessages = () => {
  return useContext(ChatsContext) as ContextProps
}
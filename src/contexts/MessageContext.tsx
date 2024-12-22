// contexts/MessagesContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { useToast } from '@apideck/components'

// contexts/MessagesContext.tsx
interface GeminiMessage {
    role: 'user' | 'model' | 'system'
    content: string
    image?: string
    tabId: string
  }
  

interface ChatTab {
  id: string
  name: string
  messages: GeminiMessage[]
  model: string
}

interface MessagesContextProps {
  tabs: ChatTab[]
  activeTabId: string
  setActiveTabId: (id: string) => void
  addMessage: (content: string, image?: File, imageBase64?: string, model?: string) => Promise<void>
  isLoadingAnswer: boolean
  createNewTab: () => void
  closeTab: (id: string) => void
  renameTab: (id: string, name: string) => void
}

const MessagesContext = createContext<MessagesContextProps | undefined>(undefined)

async function sendMessage(messages: GeminiMessage[], model: string, tabId: string) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, model, tabId }),
  })

  if (!response.ok) {
    throw new Error('Failed to send message')
  }

  return response.json()
}

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const { addToast } = useToast()
  const [tabs, setTabs] = useState<ChatTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string>('')
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false)

  // Initialize with first tab or load from localStorage
  useEffect(() => {
    const savedTabs = localStorage.getItem('chatTabs')
    if (savedTabs) {
      const parsedTabs = JSON.parse(savedTabs)
      setTabs(parsedTabs)
      setActiveTabId(parsedTabs[0].id)
    } else {
      const initialTab: ChatTab = {
        id: Date.now().toString(),
        name: 'New Chat',
        messages: [],
        model: 'gemini-1.5-pro'
      }
      setTabs([initialTab])
      setActiveTabId(initialTab.id)
    }
  }, [])

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem('chatTabs', JSON.stringify(tabs))
    }
  }, [tabs])

  // In your MessagesProvider component, update the addMessage function:
  const addMessage = async (
    content: string,
    image?: File,
    imageBase64?: string,
    model: string = 'gemini-1.5-pro'
  ) => {
    setIsLoadingAnswer(true)
    try {
      const newMessage: GeminiMessage = {
        role: 'user',
        content,
        image: imageBase64, // Store the base64 image data
        tabId: activeTabId
      }
  
      const currentTab = tabs.find(tab => tab.id === activeTabId)
      if (!currentTab) return
  
      const updatedMessages = [...currentTab.messages, newMessage]
      
      // Update the current tab's messages
      const updatedTabs = tabs.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, messages: updatedMessages, model } 
          : tab
      )
      setTabs(updatedTabs)
  
      // Get AI response
      const response = await sendMessage(updatedMessages, model, activeTabId)
      
      // Add AI response to messages
      const aiMessage: GeminiMessage = {
        role: 'model',
        content: response.text,
        tabId: activeTabId
      }
  
      // Update tabs with AI response
      const finalTabs = updatedTabs.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, messages: [...updatedMessages, aiMessage] }
          : tab
      )
      setTabs(finalTabs)
  
    } catch (error) {
      addToast({ 
        title: 'Error sending message', 
        type: 'error' 
      })
    } finally {
      setIsLoadingAnswer(false)
    }
  }

  const createNewTab = () => {
    const newTab: ChatTab = {
      id: Date.now().toString(),
      name: 'New Chat',
      messages: [],
      model: 'gemini-1.5-pro'
    }
    setTabs([...tabs, newTab])
    setActiveTabId(newTab.id)
  }

  const closeTab = (id: string) => {
    if (tabs.length === 1) return
    const newTabs = tabs.filter(tab => tab.id !== id)
    setTabs(newTabs)
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id)
    }
  }

  const renameTab = (id: string, name: string) => {
    const updatedTabs = tabs.map(tab =>
      tab.id === id ? { ...tab, name } : tab
    )
    setTabs(updatedTabs)
  }

  return (
    <MessagesContext.Provider value={{
      tabs,
      activeTabId,
      setActiveTabId,
      addMessage,
      isLoadingAnswer,
      createNewTab,
      closeTab,
      renameTab
    }}>
      {children}
    </MessagesContext.Provider>
  )
}

export const useMessages = () => {
  const context = useContext(MessagesContext)
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider')
  }
  return context
}
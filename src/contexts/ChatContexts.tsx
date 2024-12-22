// contexts/ChatContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { useToast } from '@apideck/components'

interface ChatMessage {
  role: 'user' | 'model' | 'system'
  content: string
  image?: string
}

interface ChatTab {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  lastUpdated: Date
}

interface ChatContextType {
  tabs: ChatTab[]
  activeTabId: string
  messages: ChatMessage[]
  isLoadingAnswer: boolean
  addMessage: (content: string, image?: File, imageBase64?: string, model?: string) => Promise<void>
  createNewChat: () => void
  switchTab: (tabId: string) => void
  deleteTab: (tabId: string) => void
  renameTab: (tabId: string, title: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { addToast } = useToast()
  const [tabs, setTabs] = useState<ChatTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string>('')
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false)

  // Initialize from localStorage or create first tab
  useEffect(() => {
    const savedTabs = localStorage.getItem('chatTabs')
    if (savedTabs) {
      const parsedTabs = JSON.parse(savedTabs)
      setTabs(parsedTabs.map((tab: ChatTab) => ({
        ...tab,
        createdAt: new Date(tab.createdAt),
        lastUpdated: new Date(tab.lastUpdated)
      })))
      setActiveTabId(parsedTabs[0].id)
    } else {
      createNewChat()
    }
  }, [])

  // Save to localStorage whenever tabs change
  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem('chatTabs', JSON.stringify(tabs))
    }
  }, [tabs])

  const createNewChat = () => {
    const newTab: ChatTab = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      lastUpdated: new Date()
    }
    setTabs(prev => [newTab, ...prev])
    setActiveTabId(newTab.id)
  }

  const switchTab = (tabId: string) => {
    setActiveTabId(tabId)
  }

  const deleteTab = (tabId: string) => {
    if (tabs.length === 1) {
      createNewChat()
      return
    }
    
    setTabs(prev => prev.filter(tab => tab.id !== tabId))
    if (activeTabId === tabId) {
      setActiveTabId(tabs[0].id)
    }
  }

  const renameTab = (tabId: string, title: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, title, lastUpdated: new Date() }
        : tab
    ))
  }

  const addMessage = async (
    content: string, 
    image?: File, 
    imageBase64?: string,
    model?: string
  ) => {
    setIsLoadingAnswer(true)
    try {
      const newMessage: ChatMessage = {
        role: 'user',
        content,
        image: imageBase64
      }

      // Update the current tab's messages
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? {
              ...tab,
              messages: [...tab.messages, newMessage],
              lastUpdated: new Date()
            }
          : tab
      ))

      // Get current tab's messages
      const currentTab = tabs.find(tab => tab.id === activeTabId)
      if (!currentTab) return

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...currentTab.messages, newMessage],
          model,
          tabId: activeTabId
        })
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()
      
      // Add AI response
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? {
              ...tab,
              messages: [
                ...tab.messages,
                newMessage,
                { role: 'model', content: data.text }
              ],
              lastUpdated: new Date()
            }
          : tab
      ))

    } catch (error) {
      addToast({ 
        title: 'Error sending message', 
        type: 'error' 
      })
    } finally {
      setIsLoadingAnswer(false)
    }
  }

  const activeMessages = tabs.find(tab => tab.id === activeTabId)?.messages || []

  return (
    <ChatContext.Provider value={{
      tabs,
      activeTabId,
      messages: activeMessages,
      isLoadingAnswer,
      addMessage,
      createNewChat,
      switchTab,
      deleteTab,
      renameTab
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
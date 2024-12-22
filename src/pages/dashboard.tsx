// pages/dashboard.tsx
import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { getSession, signOut } from 'next-auth/react'
import {
  Plus,
  Grid,
  List,
  LogOut,
  X,
  BookOpen,
  Sun,
  Moon,
  Upload,
} from 'lucide-react'
import Head from 'next/head'
import Link from 'next/link'
import { ThemeProvider, useTheme } from '../contexts/ThemeContext'
import ChatGridLayout from '../components/ChatGridLayout'
import Papa from 'papaparse'

interface ChatTab {
  id: string
  name: string
  messages: any[]
  model: string
  lastUpdated: Date
  educationLevel: string
  subject: string
  uploadedContent?: string // Add a field to store uploaded content
}

const defaultModel = 'gemini-2.0-flash-exp'

const subjects = {
  PSLE: ['English', 'Mathematics', 'Science', 'Mother Tongue'],
  OLEVEL: [
    'English Language',
    'Elementary Mathematics',
    'Additional Mathematics',
    'Combined Science (Physics/Chemistry)',
    'Combined Science (Chemistry/Biology)',
    'Pure Physics',
    'Pure Chemistry',
    'Pure Biology',
    'Combined Humanities',
    'History',
    'Geography',
    'Literature',
    'Mother Tongue',
  ],
}

interface AddChatModalProps {
  onClose: () => void
  onAddChat: (config: {
    educationLevel: string
    subject: string
    uploadedContent?: string
  }) => void
  maxChatsReached: boolean
}

const AddChatModal: React.FC<AddChatModalProps> = ({
  onClose,
  onAddChat,
  maxChatsReached,
}) => {
  const [educationLevel, setEducationLevel] = useState<'PSLE' | 'OLEVEL'>('PSLE')
  const [subject, setSubject] = useState('')
  const [uploadedContent, setUploadedContent] = useState<string | undefined>(
    undefined
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type === 'text/csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          // Assuming CSV has a specific format that can be mapped to a string
          const content = JSON.stringify(results.data)
          setUploadedContent(content)
        },
        error: (error) => {
          console.error('CSV parsing error:', error)
          alert('Error parsing CSV file.')
        },
      })
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setUploadedContent(text)
      }
      reader.onerror = () => {
        console.error('File reading error')
        alert('Error reading file.')
      }
      reader.readAsText(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject) {
      alert('Please select a subject')
      return
    }
    onAddChat({ educationLevel, subject, uploadedContent })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Create New Chat
        </h2>

        {maxChatsReached ? (
          <p className="text-red-500">Maximum number of chats reached</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Education Level
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setEducationLevel('PSLE')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    educationLevel === 'PSLE'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  PSLE
                </button>
                <button
                  type="button"
                  onClick={() => setEducationLevel('OLEVEL')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    educationLevel === 'OLEVEL'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  O-Level
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select a subject</option>
                {subjects[educationLevel].map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload Subject Content (Optional)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full"
                accept=".txt,.csv"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                       disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!subject}
            >
              Create Chat
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const DashboardContent = ({ user }: { user: any }) => {
  const [chats, setChats] = useState<ChatTab[]>([])
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [maxChats, setMaxChats] = useState(8)
  const { theme, toggleTheme } = useTheme()

  // Load chats from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem(`user_chats_${user.id}`)
    if (savedChats) {
      setChats(JSON.parse(savedChats))
    }
  }, [user.id])

  // Save chats to localStorage
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem(`user_chats_${user.id}`, JSON.stringify(chats))
    }
  }, [chats, user.id])

  const handleAddChat = (config: {
    educationLevel: string
    subject: string
    uploadedContent?: string
  }) => {
    if (chats.length >= maxChats) {
      alert(`Maximum of ${maxChats} chats reached`)
      return
    }

    const newChat: ChatTab = {
      id: Date.now().toString(),
      name: `${config.educationLevel} - ${config.subject}`,
      messages: [],
      model: defaultModel,
      lastUpdated: new Date(),
      educationLevel: config.educationLevel,
      subject: config.subject,
      uploadedContent: config.uploadedContent,
    }

    setChats((prevChats) => [newChat, ...prevChats])
    setIsAddModalOpen(false)
  }

  const handleDeleteChat = (chatId: string) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId))
  }

  const handleMaxChatsChange = (number: number) => {
    setMaxChats(number)
  }

  const handleSelectChat = (selectedChat: ChatTab) => {
    const existingTabsStr = localStorage.getItem('chatTabs')
    const existingTabs = existingTabsStr ? JSON.parse(existingTabsStr) : []

    const existingTab = existingTabs.find(
      (tab: ChatTab) =>
        tab.educationLevel === selectedChat.educationLevel &&
        tab.subject === selectedChat.subject
    )

    if (existingTab) {
      window.location.href = '/'
      return
    }

    const newTab = {
      id: selectedChat.id,
      name: selectedChat.name,
      messages: selectedChat.messages,
      model: selectedChat.model,
      lastUpdated: new Date(),
      educationLevel: selectedChat.educationLevel,
      subject: selectedChat.subject,
      uploadedContent: selectedChat.uploadedContent,
    }

    const updatedTabs = [newTab, ...existingTabs]
    localStorage.setItem('chatTabs', JSON.stringify(updatedTabs))
    window.location.href = '/'
  }

  return (
    <>
      <Head>
        <title>TutorMe Dashboard</title>
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              {/* Logo and Title */}
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  TutorMe
                </h1>
              </div>

              {/* Layout Toggle Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setLayout('grid')}
                  className={`p-2 rounded ${
                    layout === 'grid'
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setLayout('list')}
                  className={`p-2 rounded ${
                    layout === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Max Chats Input */}

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>

              {/* Add Chat Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                disabled={chats.length >= maxChats}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg 
                         hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                <span>Add Chat</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Chat Grid */}
          <ChatGridLayout
            chats={chats}
            layout={layout}
            onDeleteChat={handleDeleteChat}
            onSelectChat={handleSelectChat}
          />

          {/* Add Chat Modal */}
          {isAddModalOpen && (
            <AddChatModal
              onClose={() => setIsAddModalOpen(false)}
              onAddChat={handleAddChat}
              maxChatsReached={chats.length >= maxChats}
            />
          )}
        </div>
      </div>
    </>
  )
}

// Main Dashboard component with ThemeProvider
const Dashboard = ({ user }: { user: any }) => {
  return (
    <ThemeProvider>
      <DashboardContent user={user} />
    </ThemeProvider>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return {
    props: {
      user: session.user,
    },
  }
}

export default Dashboard
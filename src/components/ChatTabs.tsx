import { useState } from 'react'
import { useChat } from '../contexts/ChatContext'
import { Plus, X, Edit2, Check, MessageSquare } from 'lucide-react'

// Define the education levels and subjects
const EDUCATION_LEVELS = ['PSLE', 'OLEVEL'] as const

const SUBJECTS = {
  PSLE: [
    'English',
    'Mathematics',
    'Science',
    'Mother Tongue'
  ],
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
    'Mother Tongue'
  ]
}

interface NewChatModalProps {
  onClose: () => void
  onCreate: (educationLevel: string, subject: string) => void
}

const NewChatModal: React.FC<NewChatModalProps> = ({ onClose, onCreate }) => {
  const [educationLevel, setEducationLevel] = useState<'PSLE' | 'OLEVEL'>('PSLE')
  const [subject, setSubject] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject) return
    onCreate(educationLevel, subject)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Create New Chat
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Education Level Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Education Level
            </label>
            <div className="flex space-x-4">
              {EDUCATION_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    setEducationLevel(level)
                    setSubject('')  // Reset subject when level changes
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    educationLevel === level
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="">Select a subject</option>
              {SUBJECTS[educationLevel].map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!subject}
              className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ChatTabs() {
  const { tabs, activeTabId, createNewChat, switchTab, deleteTab, renameTab } = useChat()
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)

  // Keep track of unique tab IDs
  useEffect(() => {
    const savedTabs = localStorage.getItem('chatTabs')
    if (savedTabs) {
      const parsedTabs = JSON.parse(savedTabs)
      const existingIds = new Set(tabs.map(tab => tab.id))
      
      // Remove any duplicates from localStorage
      const uniqueTabs = parsedTabs.filter((tab: any) => !existingIds.has(tab.id))
      if (uniqueTabs.length > 0) {
        localStorage.setItem('chatTabs', JSON.stringify(uniqueTabs))
      }
    }
  }, [tabs])

  const handleEdit = (tabId: string, currentTitle: string) => {
    setEditingTabId(tabId)
    setEditTitle(currentTitle)
  }

  const handleSave = (tabId: string) => {
    if (editTitle.trim()) {
      renameTab(tabId, editTitle.trim())
    }
    setEditingTabId(null)
  }

  const handleCreateNewChat = (educationLevel: string, subject: string) => {
    // Check if a tab with the same education level and subject already exists
    const existingTab = tabs.find(
      tab => tab.educationLevel === educationLevel && tab.subject === subject
    )

    if (existingTab) {
      // If tab exists, just switch to it
      switchTab(existingTab.id)
    } else {
      // If it's a new combination, create a new tab
      createNewChat(educationLevel, subject)
    }
    setIsNewChatModalOpen(false)
  }

  return (
    <div className="flex items-center space-x-1 overflow-x-auto p-2 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`group flex items-center min-w-[200px] max-w-[300px] px-3 py-2 rounded-lg cursor-pointer
            ${activeTabId === tab.id
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          onClick={() => switchTab(tab.id)}
        >
          <MessageSquare className="w-4 h-4 flex-shrink-0 mr-2" />
          
          <div className="flex-1 min-w-0">
            {editingTabId === tab.id ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave(tab.id)
                  if (e.key === 'Escape') setEditingTabId(null)
                }}
                className="w-full bg-transparent border-none outline-none p-0"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <div className="truncate font-medium">{tab.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {tab.educationLevel} • {tab.subject}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center ml-2 opacity-0 group-hover:opacity-100">
            {editingTabId === tab.id ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSave(tab.id)
                }}
                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded"
              >
                <Check className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit(tab.id, tab.title)
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteTab(tab.id)
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={() => setIsNewChatModalOpen(true)}
        className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400
                  hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
      >
        <Plus className="w-4 h-4" />
      </button>

      {isNewChatModalOpen && (
        <NewChatModal
          onClose={() => setIsNewChatModalOpen(false)}
          onCreate={handleCreateNewChat}
        />
      )}
    </div>
  )
}
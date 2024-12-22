import { Trash2, MessageSquare } from 'lucide-react'
import { formatDistance } from 'date-fns'

interface ChatTab {
  id: string
  name: string
  messages: any[]
  model: string
  lastUpdated: string | Date
}

interface ChatGridLayoutProps {
  chats?: ChatTab[]
  layout?: 'grid' | 'list'
  onDeleteChat?: (chatId: string) => void
  onSelectChat?: (chat: ChatTab) => void
}

const ChatGridLayout: React.FC<ChatGridLayoutProps> = ({
  chats = [],
  layout = 'grid',
  onDeleteChat = () => {},
  onSelectChat = () => {}
}) => {
  // Helper function to safely format dates
  const formatLastUpdated = (date: string | Date) => {
    try {
      const dateObject = typeof date === 'string' ? new Date(date) : date
      return formatDistance(dateObject, new Date(), { addSuffix: true })
    } catch (error) {
      return 'Unknown date'
    }
  }

  // Render empty state if no chats
  if (chats.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
        <MessageSquare className="mx-auto w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-300">
          No chats yet. Click "Add Chat" to get started!
        </p>
      </div>
    )
  }

  // Determine grid or list layout classes
  const layoutClasses = {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
    list: 'space-y-4'
  }

  return (
    <div className={layoutClasses[layout]}>
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`
            bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden 
            ${layout === 'grid' ? 'transform transition hover:scale-105' : 'flex items-center'}
            group relative cursor-pointer
          `}
          onClick={() => onSelectChat(chat)}
        >
          <div
            className={`
              block p-4 flex-grow 
              ${layout === 'grid' ? 'text-center' : 'flex items-center'}
            `}
          >
            <div className={layout === 'grid' ? 'space-y-2' : 'flex items-center space-x-4'}>
              <MessageSquare 
                className={`
                  mx-auto text-blue-500 
                  ${layout === 'grid' ? 'w-12 h-12' : 'w-8 h-8'}
                `}
              />
              <div>
                <h3 className={`
                  font-semibold text-gray-800 dark:text-white
                  ${layout === 'grid' ? 'text-center' : ''}
                `}>
                  {chat.name}
                </h3>
                {layout !== 'grid' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    {chat.model} • Last updated {formatLastUpdated(chat.lastUpdated)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {layout === 'grid' && (
            <div className="p-2 text-center border-t dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {chat.model}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Last updated {formatLastUpdated(chat.lastUpdated)}
              </p>
            </div>
          )}

          {onDeleteChat !== null && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteChat(chat.id)
              }}
              className="
                absolute top-2 right-2 p-1 rounded-full 
                hover:bg-red-100 dark:hover:bg-red-900
                text-red-500 dark:text-red-400
                opacity-0 group-hover:opacity-100 transition-opacity
              "
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default ChatGridLayout
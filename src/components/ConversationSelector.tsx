// src/components/ConversationSelector.tsx
import { useEffect, useState } from 'react'
import { getConversations } from '../lib/db'
import { useMessages } from '../utils/useMessages'

export function ConversationSelector() {
  const [conversations, setConversations] = useState<Array<{ id: number, created_at: string }>>([])
  const { startNewConversation, loadConversation, conversationId } = useMessages()

  useEffect(() => {
    const loadConversations = async () => {
      const convs = await getConversations()
      setConversations(convs)
    }
    loadConversations()
  }, [conversationId])

  return (
    <div className="mb-4">
      <button
        onClick={() => startNewConversation()}
        className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        New Conversation
      </button>
      
      <div className="space-y-2">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => loadConversation(conv.id)}
            className={`w-full px-4 py-2 text-left rounded ${
              conv.id === conversationId
                ? 'bg-blue-100 text-blue-800'
                : 'hover:bg-gray-100'
            }`}
          >
            Conversation {conv.id} - {new Date(conv.created_at).toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  )
}
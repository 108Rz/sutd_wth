import { useMessages } from 'utils/useMessages'
import Image from 'next/image'

const MessagesList = () => {
  const { messages, isLoadingAnswer } = useMessages()

  return (
    <div className="max-w-3xl mx-auto pt-8 pb-4 space-y-6">
      {messages?.map((message, i) => {
        const isUser = message.role === 'user'
        if (message.role === 'system') return null

        return (
          <div
            key={`${message.content}-${i}`}
            className={`flex mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!isUser && (
              <div className="flex-shrink-0">
                <img
                  src="https://www.teamsmart.ai/next-assets/team/ai.jpg"
                  className="w-8 h-8 rounded-full"
                  alt="AI"
                />
              </div>
            )}

            <div
              className={`relative px-4 py-3 rounded-lg ${
                isUser 
                  ? 'mr-2 bg-blue-600 text-white'
                  : 'ml-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              } ${message.image ? 'max-w-2xl' : 'max-w-xl'}`}
            >
              {message.image && (
                <div className="mb-3 rounded-lg overflow-hidden">
                  <Image
                    src={message.image}
                    alt="Uploaded image"
                    width={400}
                    height={300}
                    className="object-contain"
                  />
                </div>
              )}

              <div
                className={`
                  ${isUser ? 'text-white' : 'text-gray-800 dark:text-gray-200'}
                  [&_.math-response]:space-y-4
                  [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-3
                  [&_p]:leading-relaxed [&_p]:mb-3
                  [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
                  [&_code]:bg-opacity-20 [&_code]:backdrop-blur-sm
                  ${
                    isUser 
                      ? '[&_code]:bg-white [&_code]:text-blue-600'
                      : '[&_code]:bg-gray-200 dark:[&_code]:bg-gray-700'
                  }
                  [&_.calculation-block]:rounded-lg [&_.calculation-block]:p-3 [&_.calculation-block]:mb-4
                  [&_.answer-block]:rounded-lg [&_.answer-block]:p-3 [&_.answer-block]:mb-4
                  [&_.note-block]:rounded-lg [&_.note-block]:p-3 [&_.note-block]:mt-4
                  ${
                    isUser
                      ? '[&_.calculation-block]:bg-blue-500 [&_.answer-block]:bg-blue-500 [&_.note-block]:bg-blue-500'
                      : '[&_.calculation-block]:bg-blue-50 [&_.answer-block]:bg-green-50 [&_.note-block]:bg-yellow-50 dark:[&_.calculation-block]:bg-blue-900/20 dark:[&_.answer-block]:bg-green-900/20 dark:[&_.note-block]:bg-yellow-900/20'
                  }
                  [&_li]:ml-4 [&_ul]:list-disc [&_ol]:list-decimal
                `}
                dangerouslySetInnerHTML={{ 
                  __html: message.content 
                }}
              />
            </div>

            {isUser && (
              <div className="flex-shrink-0">
                <img
                  src="https://www.teamsmart.ai/next-assets/profile-image.png"
                  className="w-8 h-8 rounded-full"
                  alt="User"
                />
              </div>
            )}
          </div>
        )
      })}

      {isLoadingAnswer && (
        <div className="flex items-center justify-start mb-6">
          <div className="flex-shrink-0">
            <img
              src="https://www.teamsmart.ai/next-assets/team/ai.jpg"
              className="w-8 h-8 rounded-full"
              alt="AI"
            />
          </div>
          <div className="ml-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessagesList

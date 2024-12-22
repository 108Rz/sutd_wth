import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface AddChatModalProps {
  onClose: () => void;
  onAddChat: (chatConfig: { name: string; model: string }) => void;
  maxChatsReached: boolean;
}

const AddChatModal: React.FC<AddChatModalProps> = ({
  onClose,
  onAddChat,
  maxChatsReached,
}) => {
  const [name, setName] = useState('');
  const [model, setModel] = useState('gpt-4');
  const { theme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddChat({ name: name.trim(), model });
  };

  const models = [
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    { id: 'claude-3', name: 'Claude 3' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 relative ${
          theme === 'light'
            ? 'text-gray-900'
            : 'text-gray-200'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${
            theme === 'light'
              ? 'text-gray-500 hover:text-gray-700'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          Create New Chat
        </h2>

        {maxChatsReached ? (
          <p className={`text-red-500 dark:text-red-400 mb-4`}>
            Maximum number of chats reached. Please delete some chats before creating new ones.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="chat-name"
                className={`block text-sm font-medium mb-1 ${
                  theme === 'light'
                    ? 'text-gray-700'
                    : 'text-gray-300'
                }`}
              >
                Chat Name
              </label>
              <input
                id="chat-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter chat name"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  theme === 'light'
                    ? 'bg-white border-gray-200 text-gray-900'
                    : 'bg-gray-700 border-gray-600 text-white'
                }`}
                required
              />
            </div>

            <div>
              <label
                htmlFor="model-select"
                className={`block text-sm font-medium mb-1 ${
                  theme === 'light'
                    ? 'text-gray-700'
                    : 'text-gray-300'
                }`}
              >
                Select Model
              </label>
              <select
                id="model-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  theme === 'light'
                    ? 'bg-white border-gray-200 text-gray-900'
                    : 'bg-gray-700 border-gray-600 text-white'
                }`}
              >
                {models.map((modelOption) => (
                  <option key={modelOption.id} value={modelOption.id}>
                    {modelOption.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg hover:opacity-80 transition-opacity ${
                  theme === 'light'
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg hover:opacity-80 transition-opacity ${
                  theme === 'light'
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
                disabled={!name.trim()}
              >
                Create Chat
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddChatModal;
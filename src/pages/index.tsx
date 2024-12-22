// pages/index.tsx
import MessageForm from 'components/MessageForm';
import MessagesList from 'components/MessageList';
import { NextPage } from 'next';
import { MessagesProvider, useMessages } from 'utils/useMessages';
import Layout from '../components/Layout';
import { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  ChevronDown,
  Sun,
  Moon,
  Plus,
  X,
  Edit2,
  LayoutDashboard,
  Lightbulb,
} from 'lucide-react';

import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

import { ChevronUp } from 'lucide-react';

const ScrollButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');

    const toggleVisibility = () => {
      if (!chatContainer) return;
      setIsVisible(chatContainer.scrollTop > 100);
    };

    chatContainer?.addEventListener('scroll', toggleVisibility);
    return () => chatContainer?.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const chatContainer = document.getElementById('chat-container');
    chatContainer?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 right-4 p-3 bg-gradient-to-r from-sky-500 to-indigo-500
                 text-white rounded-full shadow-2xl hover:shadow-lg hover:scale-105
                 transition-all duration-300 ease-in-out z-50
                 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
                 active:scale-95 transform-gpu active:brightness-90"
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  );
};

interface ChatTab {
  id: string;
  name: string;
  messages: any[];
  model: string;
  lastUpdated: Date;
  educationLevel?: string; // Add educationLevel
  subject?: string; // Add subject
}

const models = [
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
];

const Header = ({
  selectedModel,
  setSelectedModel,
  isDropdownOpen,
  setIsDropdownOpen,
}: {
  selectedModel: typeof models[0];
  setSelectedModel: (model: typeof models[0]) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
}) => {
  const { theme, toggleTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, setIsDropdownOpen]);

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b dark:bg-gray-900 dark:border-gray-700 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            TutorMe
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Dashboard Link */}
          <a
            href="/dashboard"
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300
                     hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg
                     transition-colors duration-150 ease-in-out"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </a>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 border rounded-lg
                       hover:bg-gray-50 dark:hover:bg-gray-800 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                       dark:bg-gray-800 dark:border-gray-700"
            >
              <span className="text-gray-700 dark:text-gray-300">
                {selectedModel.name}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 
                          rounded-lg shadow-2xl border dark:border-gray-700 py-1 
                          z-[9999] origin-top-right"
                style={{
                  animationName: 'dropdown-animation',
                  animationDuration: '0.2s',
                  animationTimingFunction: 'ease-out',
                }}
              >
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300
                             hover:bg-gray-50 dark:hover:bg-gray-700
                             focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700"
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ChatTabs = ({
  tabs,
  activeTabId,
  onTabChange,
  onNewTab,
  onCloseTab,
  onRenameTab,
}: {
  tabs: ChatTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onNewTab: () => void;
  onCloseTab: (tabId: string) => void;
  onRenameTab: (tabId: string, newName: string) => void;
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const { theme } = useTheme();

  const handleStartEdit = (tabId: string, currentName: string) => {
    setEditingTabId(tabId);
    setEditName(currentName);
  };

  const handleFinishEdit = (tabId: string) => {
    if (editName.trim()) {
      onRenameTab(tabId, editName.trim());
    }
    setEditingTabId(null);
  };

  return (
    <div className="flex items-center space-x-1 overflow-x-auto bg-white dark:bg-gray-900 px-4 py-2 border-b dark:border-gray-700">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`group relative flex items-center min-w-[150px] px-4 py-2 cursor-pointer rounded-lg
                    ${
                      activeTabId === tab.id
                        ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
          onClick={() => onTabChange(tab.id)}
        >
          {editingTabId === tab.id ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => handleFinishEdit(tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishEdit(tab.id);
                if (e.key === 'Escape') setEditingTabId(null);
              }}
              className="flex-1 bg-transparent border-none focus:ring-0 p-0 dark:text-gray-300"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <span className="truncate flex-1">{tab.name}</span>
              <div className="flex items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit(tab.id, tab.name);
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ))}
      <button
        onClick={onNewTab}
        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 
                 rounded-lg transition-colors flex-shrink-0"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};

const IndexPageContent = () => {
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tabs, setTabs] = useState<ChatTab[]>([]);
  const [activeTabId, setActiveTabId] = useState('');
  const [showFeedbackSummary, setShowFeedbackSummary] = useState(false);
  const [feedbackSummaryContent, setFeedbackSummaryContent] = useState('');

  // Load tabs from localStorage
  useEffect(() => {
    const savedTabs = localStorage.getItem('chatTabs');
    if (savedTabs) {
      const parsedTabs = JSON.parse(savedTabs);
      setTabs(parsedTabs);
      setActiveTabId(parsedTabs[0].id);
    } else {
      handleNewTab();
    }
  }, []);

  // Save tabs to localStorage
  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem('chatTabs', JSON.stringify(tabs));
    }
  }, [tabs]);

  const handleNewTab = () => {
    const newTab: ChatTab = {
      id: Date.now().toString(),
      name: 'New Chat',
      messages: [],
      model: selectedModel.id,
      lastUpdated: new Date(),
      educationLevel: 'OLEVEL', // Default value
      subject: 'English', // Default value
    };
    setTabs((prev) => [newTab, ...prev]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (tabId: string) => {
    if (tabs.length === 1) {
      handleNewTab();
      return;
    }
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const handleRenameTab = (tabId: string, newName: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId ? { ...tab, name: newName, lastUpdated: new Date() } : tab
      )
    );
  };

  const getFeedbackSummary = async () => {
    setShowFeedbackSummary(true);
    setFeedbackSummaryContent('Loading feedback summary...');

    // Get the messages for the active tab
    const activeTabMessages =
      tabs.find((tab) => tab.id === activeTabId)?.messages || [];

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: activeTabMessages.map((m) => ({
            role: m.role,
            parts: m.parts, // Assuming your messages have this structure
          })),
          model: selectedModel.id,
          tabId: activeTabId,
          educationLevel:
            tabs.find((tab) => tab.id === activeTabId)?.educationLevel ||
            'OLEVEL',
          subject:
            tabs.find((tab) => tab.id === activeTabId)?.subject || 'English',
          requestType: 'feedbackSummary',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedbackSummaryContent(data.text); // Update the state for the modal content
      } else {
        console.error('Error fetching feedback summary');
        setFeedbackSummaryContent(
          "Sorry, I couldn't generate a feedback summary right now. Please try again later."
        );
      }
    } catch (error) {
      console.error('Network error:', error);
      setFeedbackSummaryContent(
        "Sorry, I couldn't generate a feedback summary right now. Please try again later."
      );
    }
  };

  return (
    <MessagesProvider>
      <Layout>
        <Header
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
        />

        <div className="fixed top-16 left-0 right-0 z-10">
          <ChatTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onTabChange={setActiveTabId}
            onNewTab={handleNewTab}
            onCloseTab={handleCloseTab}
            onRenameTab={handleRenameTab}
          />
        </div>

        <div
          id="chat-container"
          className="pt-28 pb-20 h-[calc(100vh-8rem)] overflow-y-auto scroll-smooth"
        >
          <MessagesList activeTabId={activeTabId} />

          {/* Feedback Summary Modal */}
          {showFeedbackSummary && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black opacity-50"
                onClick={() => setShowFeedbackSummary(false)}
              ></div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-2/3 z-50 max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">
                  Feedback Summary
                </h3>
                <div
                  className="text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: feedbackSummaryContent }}
                />
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowFeedbackSummary(false)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <ScrollButton />

        <div className="fixed bottom-0 right-0 left-0 bg-white dark:bg-gray-900 border-t dark:border-gray-700">
          <div className="max-w-6xl mx-auto">
            <MessageForm
              selectedModel={selectedModel.id}
              activeTabId={activeTabId}
            />
          </div>
          <div className="flex justify-center pb-2 pt-2">
            <button
              onClick={getFeedbackSummary}
              className="px-4 py-2 bg-yellow-200 dark:bg-yellow-700 text-gray-700 dark:text-gray-200
                         rounded-lg hover:bg-yellow-300 dark:hover:bg-yellow-600
                         focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
            >
              <Lightbulb className="w-5 h-5 inline-block mr-2" />
              Get Feedback Summary
            </button>
          </div>
        </div>
      </Layout>
    </MessagesProvider>
  );
};

const IndexPage: NextPage = () => {
  return (
    <ThemeProvider>
      <style jsx global>{`
        @keyframes dropdown-animation {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      <IndexPageContent />
    </ThemeProvider>
  );
};

export default IndexPage;
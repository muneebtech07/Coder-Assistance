import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, History } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Chat } from './components/Chat';
import { ChatHistory } from './components/ChatHistory';
import { Login } from './components/Login';
import { TextAnalyzer } from './components/TextAnalyzer';
import { CodeFormatting } from './components/CodeFormatting';
import { chatService } from './services/api';
import type { Message, ChatSession, User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'chat';
  });

  const [showChatHistory, setShowChatHistory] = useState(false);

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedMessages = localStorage.getItem('currentChatMessages');
      if (savedMessages) {
        return JSON.parse(savedMessages, (key, value) => {
          if (key === 'timestamp') {
            return new Date(value);
          }
          return value;
        });
      }
    } catch (error) {
      console.error('Error loading messages from localStorage:', error);
    }
    return [];
  });

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('chatSessions');
      if (saved) {
        return JSON.parse(saved, (key, value) => {
          if (key === 'timestamp' || key === 'createdAt' || key === 'lastMessageAt') {
            return new Date(value);
          }
          return value;
        });
      }
    } catch (error) {
      console.error('Error loading chat sessions from localStorage:', error);
    }
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('currentSessionId') || null;
    } catch (error) {
      console.error('Error loading currentSessionId from localStorage:', error);
      return null;
    }
  });

  useEffect(() => {
    // Apply theme when component mounts and when theme changes
    if (user?.preferences?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user?.preferences?.theme]);

  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem('currentChatMessages', JSON.stringify(messages));
      } else {
        localStorage.removeItem('currentChatMessages');
      }
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  }, [messages]);

  useEffect(() => {
    try {
      if (currentSessionId) {
        localStorage.setItem('currentSessionId', currentSessionId);
      } else {
        localStorage.removeItem('currentSessionId');
      }
    } catch (error) {
      console.error('Error saving currentSessionId to localStorage:', error);
    }
  }, [currentSessionId]);

  useEffect(() => {
    try {
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    } catch (error) {
      console.error('Error saving chatSessions to localStorage:', error);
    }
  }, [chatSessions]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messages.length > 0) {
        saveCurrentChat();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages]);

  const createNewChat = () => {
    if (messages.length > 0) {
      saveCurrentChat();
    }
    setMessages([]);
    setCurrentSessionId(null);
    try {
      localStorage.removeItem('currentChatMessages');
      localStorage.removeItem('currentSessionId');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  const saveCurrentChat = () => {
    if (messages.length === 0) return;

    const firstUserMessage = messages.find(m => m.sender === 'user')?.content || 'New Chat';
    const sessionId = currentSessionId || Date.now().toString();

    const newSession: ChatSession = {
      id: sessionId,
      title: firstUserMessage.slice(0, 50) + (firstUserMessage.length > 50 ? '...' : ''),
      messages: messages,
      createdAt: new Date(),
      lastMessageAt: new Date(),
    };

    setChatSessions(prev => {
      const existingSessionIndex = prev.findIndex(session => session.id === sessionId);
      if (existingSessionIndex !== -1) {
        const existingSession = prev[existingSessionIndex];
        if (JSON.stringify(existingSession.messages) === JSON.stringify(messages)) {
          return prev;
        }
        const updatedSessions = [...prev];
        updatedSessions[existingSessionIndex] = newSession;
        return updatedSessions;
      }
      return [newSession, ...prev];
    });
  };

  const handleTabChange = (newTab: string) => {
    if (activeTab === 'chat' && messages.length > 0) {
      saveCurrentChat();
    }
    setActiveTab(newTab);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    // Apply theme immediately after login
    if (loggedInUser.preferences?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    if (activeTab === 'chat' && messages.length > 0) {
      saveCurrentChat();
    }
    setUser(null);
    localStorage.removeItem('user');
    setActiveTab('chat');
    // Reset theme to light on logout
    document.documentElement.classList.remove('dark');
  };

  const handleSendMessage = async (content: string, context: Message[]) => {
    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        sender: 'user',
        timestamp: new Date(),
        username: user?.username
      };

      setMessages(prevMessages => {
        const newMessages = [...prevMessages, userMessage];
        try {
          localStorage.setItem('currentChatMessages', JSON.stringify(newMessages));
        } catch (error) {
          console.error('Error saving messages to localStorage:', error);
        }
        return newMessages;
      });

      const response = await chatService.sendMessage(content, context);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prevMessages => {
        const newMessages = [...prevMessages, botMessage];
        try {
          localStorage.setItem('currentChatMessages', JSON.stringify(newMessages));
        } catch (error) {
          console.error('Error saving messages to localStorage:', error);
        }
        return newMessages;
      });

      if (!currentSessionId) {
        const sessionId = Date.now().toString();
        setCurrentSessionId(sessionId);
        try {
          localStorage.setItem('currentSessionId', sessionId);
        } catch (error) {
          console.error('Error saving currentSessionId to localStorage:', error);
        }
      }
    } catch (error) {
      console.error('Error getting bot response:', error);
      throw error;
    }
  };

  const handleSelectSession = (session: ChatSession) => {
    if (messages.length > 0) {
      saveCurrentChat();
    }
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    try {
      localStorage.setItem('currentChatMessages', JSON.stringify(session.messages));
      localStorage.setItem('currentSessionId', session.id);
    } catch (error) {
      console.error('Error saving session data to localStorage:', error);
    }
    setShowChatHistory(false);
    setActiveTab('chat');
  };

  const handleDeleteSession = (sessionId: string) => {
    setChatSessions(prev => prev.filter(session => session.id !== sessionId));
    if (currentSessionId === sessionId) {
      setMessages([]);
      setCurrentSessionId(null);
      try {
        localStorage.removeItem('currentChatMessages');
        localStorage.removeItem('currentSessionId');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className={`flex min-h-screen bg-gray-100 dark:bg-gray-900`}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onShowHistory={() => setShowChatHistory(true)}
        showChatHistory={showChatHistory}
        onCloseChatHistory={() => setShowChatHistory(false)}
      />

      <main className="flex-1 flex flex-col lg:ml-20 w-full max-w-[100vw] overflow-x-hidden">
        <div className="p-4 bg-white dark:bg-gray-800 border-b shadow-sm flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4 ml-12 lg:ml-0">
            <span className="text-2xl">{user.avatar}</span>
            <span className="font-medium dark:text-white">{user.username}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <button
              onClick={createNewChat}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-md text-sm sm:text-base"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm sm:text-base"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {showChatHistory ? (
            <ChatHistory
              sessions={chatSessions}
              onSelectSession={handleSelectSession}
              onDeleteSession={handleDeleteSession}
              onClose={() => setShowChatHistory(false)}
            />
          ) : activeTab === 'chat' ? (
            <Chat
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          ) : activeTab === 'code-format' ? (
            <CodeFormatting />
          ) : activeTab === 'text-analyzer' ? (
            <TextAnalyzer />
          ) : activeTab === 'settings' ? (
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6 dark:text-white">Settings</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={user.preferences?.theme || 'light'}
                      onChange={(e) => {
                        const newTheme = e.target.value as 'light' | 'dark';
                        const updatedUser = {
                          ...user,
                          preferences: {
                            ...user.preferences,
                            theme: newTheme
                          }
                        };
                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        if (newTheme === 'dark') {
                          document.documentElement.classList.add('dark');
                        } else {
                          document.documentElement.classList.remove('dark');
                        }
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Feature coming soon!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
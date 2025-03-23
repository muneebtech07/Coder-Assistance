import React, { useState, useEffect, useRef } from 'react';
import { Send, User2, Bot, ChevronDown, ChevronUp, Copy, CheckCircle2 } from 'lucide-react';
import type { Message } from '../types';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

interface ChatProps {
  messages: Message[];
  onSendMessage: (content: string, context: Message[]) => void;
}

interface TruncatedMessageProps {
  content: string;
  maxLength?: number;
}

const TruncatedMessage: React.FC<TruncatedMessageProps> = ({ content, maxLength = 300 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const shouldTruncate = content.length > maxLength;
  const displayText = shouldTruncate && !isExpanded ? `${content.slice(0, maxLength)}...` : content;

  useEffect(() => {
    Prism.highlightAll();
  }, [displayText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const formatCodeBlocks = (text: string) => {
    return text.split('```').map((block, index) => {
      if (index % 2 === 1) {
        const [language, ...code] = block.split('\n');
        const codeContent = code.join('\n');
        return (
          <div key={index} className="relative my-4">
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => navigator.clipboard.writeText(codeContent)}
                className="p-1.5 bg-gray-700 dark:bg-gray-600 text-gray-300 hover:text-white rounded-md transition-colors"
                title="Copy code"
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <div className="bg-gray-800 dark:bg-gray-900 rounded-t-lg py-2 px-4 text-xs text-gray-400 border-b border-gray-700">
              {language}
            </div>
            <pre className="rounded-t-none rounded-b-lg bg-gray-800 dark:bg-gray-900 p-4 overflow-x-auto group font-mono text-[0.95rem] leading-relaxed">
              <code className={`language-${language} font-mono`}>
                {codeContent}
              </code>
            </pre>
          </div>
        );
      }
      return formatTextContent(block, index);
    });
  };

  const formatTextContent = (text: string, key: number) => {
    text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-700 dark:bg-gray-800 text-gray-200 px-2 py-0.5 rounded font-mono text-[0.9rem]">$1</code>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    const formattedText = text.split('\n').map((line, i) => {
      if (/^\d+\.\s/.test(line)) {
        return `<div class="ml-6 my-1 text-[0.95rem]">${line}</div>`;
      }
      if (/^\*\s/.test(line)) {
        return `<div class="ml-6 my-1 text-[0.95rem]">• ${line.substring(2)}</div>`;
      }
      if (/^#+\s/.test(line)) {
        const level = line.match(/^#+/)[0].length;
        const text = line.replace(/^#+\s/, '');
        return `<div class="font-semibold text-${level === 1 ? 'xl' : 'lg'} mt-4 mb-2">${text}</div>`;
      }
      return line;
    }).join('\n');

    return (
      <div 
        key={key} 
        className="message-content leading-relaxed whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ 
          __html: formattedText
            .split('\n')
            .filter(line => line.trim())
            .join('<br />')
        }}
      />
    );
  };

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-1.5 bg-gray-700 dark:bg-gray-600 text-gray-300 hover:text-white rounded-md transition-colors"
          title="Copy message"
        >
          {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <div className="whitespace-pre-wrap break-words">
        {formatCodeBlocks(displayText)}
      </div>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm mt-2 text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp size={16} />
            </>
          ) : (
            <>
              Show More <ChevronDown size={16} />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export function Chat({ messages, onSendMessage }: ChatProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setError(null);
    setIsLoading(true);

    try {
      const userInput = input;
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      await onSendMessage(userInput, messages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Chat error:', errorMessage);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  return (
    <div className="flex flex-col h-full font-mono">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-900">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start gap-3 max-w-[85%] ${
              message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}>
              {message.sender === 'bot' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 shadow-md flex items-center justify-center">
                  <Bot size={20} className="text-blue-500" />
                </div>
              )}
              <div
                className={`p-4 shadow-md ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-none'
                }`}
              >
                <TruncatedMessage content={message.content} />
                <div className={`text-xs mt-3 ${
                  message.sender === 'user' ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </div>
              </div>
              {message.sender === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 shadow-md flex items-center justify-center">
                  <User2 size={20} className="text-blue-500" />
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 shadow-md flex items-center justify-center">
                <Bot size={20} className="text-blue-500" />
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none shadow-md">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="text-center p-3 text-red-600 bg-red-100 dark:bg-red-900/20 rounded-lg">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a coding question... (Shift + Enter for new line)"
            className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[44px] max-h-[200px] overflow-y-auto placeholder-gray-500 dark:placeholder-gray-400 font-mono"
            disabled={isLoading}
            rows={1}
          />
          <button
            type="submit"
            className={`p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md flex-shrink-0 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center font-mono">
          Press Enter to send, Shift + Enter for new line
        </div>
      </form>
    </div>
  );
}
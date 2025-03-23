export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  username?: string;
  language?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastMessageAt: Date;
  language?: string;
  topic?: string;
}

export interface User {
  username: string;
  password: string;
  avatar: string;
  preferences?: {
    defaultLanguage?: string;
    theme?: 'light' | 'dark';
    codeStyle?: string;
  };
}

export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  description: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Language {
  id: string;
  name: string;
  extension: string;
  icon?: string;
}

export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
  { id: 'csharp', name: 'C#', extension: 'cs' },
  { id: 'go', name: 'Go', extension: 'go' },
  { id: 'rust', name: 'Rust', extension: 'rs' },
  { id: 'php', name: 'PHP', extension: 'php' },
  { id: 'ruby', name: 'Ruby', extension: 'rb' },
  { id: 'swift', name: 'Swift', extension: 'swift' },
  { id: 'kotlin', name: 'Kotlin', extension: 'kt' },
];
import { User } from '../types';

export const dummyUsers: User[] = [
  {
    username: 'developer1',
    password: 'password1',
    avatar: '👨‍💻',
    preferences: {
      defaultLanguage: 'javascript',
      theme: 'dark',
      codeStyle: 'github'
    }
  },
  {
    username: 'coder',
    password: 'password2',
    avatar: '👩‍💻',
    preferences: {
      defaultLanguage: 'python',
      theme: 'light',
      codeStyle: 'vscode'
    }
  },
  {
    username: 'programmer3',
    password: 'password3',
    avatar: '🧑‍💻',
    preferences: {
      defaultLanguage: 'typescript',
      theme: 'dark',
      codeStyle: 'dracula'
    }
  }
];
import React, { useState } from 'react';
import { Plus, Search, Code, Tag, Clock, Edit2, Trash2 } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import type { CodeSnippet, Language } from '../types';
import { SUPPORTED_LANGUAGES } from '../types';

interface CodeSnippetsProps {
  snippets: CodeSnippet[];
  onAddSnippet: (snippet: Omit<CodeSnippet, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSnippet: (snippet: CodeSnippet) => void;
  onDeleteSnippet: (id: string) => void;
}

export function CodeSnippets({ snippets, onAddSnippet, onUpdateSnippet, onDeleteSnippet }: CodeSnippetsProps) {
  const [showNewSnippet, setShowNewSnippet] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [editingSnippet, setEditingSnippet] = useState<CodeSnippet | null>(null);
  const [newSnippet, setNewSnippet] = useState({
    title: '',
    code: '',
    language: 'javascript',
    description: '',
    tags: [] as string[],
    userId: ''
  });

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLanguage = selectedLanguage === 'all' || snippet.language === selectedLanguage;
    
    return matchesSearch && matchesLanguage;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSnippet) {
      onUpdateSnippet({
        ...editingSnippet,
        ...newSnippet,
        updatedAt: new Date()
      });
    } else {
      onAddSnippet(newSnippet);
    }
    setShowNewSnippet(false);
    setEditingSnippet(null);
    setNewSnippet({
      title: '',
      code: '',
      language: 'javascript',
      description: '',
      tags: [],
      userId: ''
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Code Snippets</h2>
        <button
          onClick={() => {
            setEditingSnippet(null);
            setNewSnippet({
              title: '',
              code: '',
              language: 'javascript',
              description: '',
              tags: [],
              userId: ''
            });
            setShowNewSnippet(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={20} />
          Add Snippet
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search snippets..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Languages</option>
          {SUPPORTED_LANGUAGES.map(lang => (
            <option key={lang.id} value={lang.id}>{lang.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSnippets.map((snippet) => (
          <div key={snippet.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{snippet.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingSnippet(snippet);
                      setNewSnippet(snippet);
                      setShowNewSnippet(true);
                    }}
                    className="p-1 text-gray-600 hover:text-indigo-600"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteSnippet(snippet.id)}
                    className="p-1 text-gray-600 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <Code size={16} />
                <span>{SUPPORTED_LANGUAGES.find(lang => lang.id === snippet.language)?.name}</span>
                <span className="mx-2">•</span>
                <Clock size={16} />
                <span>{new Date(snippet.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="p-4">
              <CodeEditor
                code={snippet.code}
                language={snippet.language}
                onChange={() => {}}
                readOnly
                height="200px"
              />
              <p className="mt-4 text-gray-600">{snippet.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {snippet.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                  >
                    <Tag size={14} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showNewSnippet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {editingSnippet ? 'Edit Snippet' : 'New Snippet'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newSnippet.title}
                    onChange={(e) => setNewSnippet({ ...newSnippet, title: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    value={newSnippet.language}
                    onChange={(e) => setNewSnippet({ ...newSnippet, language: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.id} value={lang.id}>{lang.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code
                  </label>
                  <CodeEditor
                    code={newSnippet.code}
                    language={newSnippet.language}
                    onChange={(value) => setNewSnippet({ ...newSnippet, code: value })}
                    height="300px"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newSnippet.description}
                    onChange={(e) => setNewSnippet({ ...newSnippet, description: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newSnippet.tags.join(', ')}
                    onChange={(e) => setNewSnippet({
                      ...newSnippet,
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="react, hooks, typescript"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewSnippet(false);
                      setEditingSnippet(null);
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {editingSnippet ? 'Update Snippet' : 'Add Snippet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
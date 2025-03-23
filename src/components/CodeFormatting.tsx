import React, { useState } from 'react';
import { Code, RefreshCw, AlertTriangle } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import parserTypeScript from 'prettier/parser-typescript';
import parserHtml from 'prettier/parser-html';
import parserCss from 'prettier/parser-postcss';
import parserMarkdown from 'prettier/parser-markdown';
import { SUPPORTED_LANGUAGES } from '../types';

interface CodeFormattingProps {
  onFormat?: (formattedCode: string) => void;
}

interface LanguageConfig {
  id: string;
  name: string;
  parser: string;
  plugins: any[];
}

export function CodeFormatting({ onFormat }: CodeFormattingProps) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [formattedCode, setFormattedCode] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const languageConfigs: Record<string, LanguageConfig> = {
    javascript: {
      id: 'javascript',
      name: 'JavaScript',
      parser: 'babel',
      plugins: [parserBabel]
    },
    typescript: {
      id: 'typescript',
      name: 'TypeScript',
      parser: 'typescript',
      plugins: [parserTypeScript]
    },
    jsx: {
      id: 'jsx',
      name: 'JSX',
      parser: 'babel',
      plugins: [parserBabel]
    },
    tsx: {
      id: 'tsx',
      name: 'TSX',
      parser: 'typescript',
      plugins: [parserTypeScript]
    },
    html: {
      id: 'html',
      name: 'HTML',
      parser: 'html',
      plugins: [parserHtml]
    },
    css: {
      id: 'css',
      name: 'CSS',
      parser: 'css',
      plugins: [parserCss]
    },
    markdown: {
      id: 'markdown',
      name: 'Markdown',
      parser: 'markdown',
      plugins: [parserMarkdown]
    }
  };

  const formatCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to format');
      return;
    }

    try {
      setIsFormatting(true);
      setError(null);

      const config = languageConfigs[language];
      
      if (!config) {
        setFormattedCode(code);
        setError(`Formatting for ${language} is not supported yet`);
        return;
      }

      const formatted = await prettier.format(code, {
        parser: config.parser,
        plugins: config.plugins,
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 80,
        tabWidth: 2
      });

      setFormattedCode(formatted);
      if (onFormat) {
        onFormat(formatted);
      }
    } catch (err) {
      console.error('Formatting error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while formatting');
      setFormattedCode(code);
    } finally {
      setIsFormatting(false);
    }
  };

  const supportedFormatters = Object.values(languageConfigs);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 dark:text-white">Code Formatting</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {supportedFormatters.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>

            <button
              onClick={formatCode}
              disabled={isFormatting || !code}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFormatting ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <Code size={20} />
              )}
              Format Code
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Input Code
            </label>
            <CodeEditor
              code={code}
              language={language}
              onChange={setCode}
              height="400px"
            />
          </div>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg flex items-start gap-2">
              <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Formatted Code
            </label>
            <CodeEditor
              code={formattedCode}
              language={language}
              onChange={setFormattedCode}
              height="400px"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}
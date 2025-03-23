import React, { useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { SUPPORTED_LANGUAGES } from '../types';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

export function CodeEditor({ code, language, onChange, readOnly = false, height = '300px' }: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure editor settings
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: false,
      readOnly: readOnly,
      cursorStyle: 'line',
      automaticLayout: true,
      theme: 'vs-dark'
    });
  };

  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current?.editor.setModelLanguage(model, language.toLowerCase());
      }
    }
  }, [language]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-800 text-gray-300 px-4 py-2 flex justify-between items-center">
        <span className="text-sm">
          {SUPPORTED_LANGUAGES.find(lang => lang.id === language)?.name || language}
        </span>
        {!readOnly && (
          <div className="text-xs text-gray-400">
            Press Ctrl + Space for suggestions
          </div>
        )}
      </div>
      <Editor
        height={height}
        defaultLanguage={language.toLowerCase()}
        defaultValue={code}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          scrollBeyondLastLine: false,
          minimap: { enabled: false }
        }}
      />
    </div>
  );
}
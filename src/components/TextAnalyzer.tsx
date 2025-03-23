import React, { useState } from 'react';
import { Upload, RefreshCw, Download, Copy, CheckCircle2 } from 'lucide-react';
import { XMLParser } from 'fast-xml-parser';
import pako from 'pako';
import { diffLines, diffChars } from 'diff';
import levenshtein from 'js-levenshtein';

interface TextAnalyzerProps {
  onAnalyze?: (result: AnalysisResult) => void;
}

interface AnalysisResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  differences?: string[];
  similarity?: number;
  messageType?: string;
  xmlContent?: any;
}

export function TextAnalyzer({ onAnalyze }: TextAnalyzerProps) {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  // 1. Compress text for analysis
  const compressText = (text: string): Uint8Array => {
    const data = new TextEncoder().encode(text);
    return pako.deflate(data);
  };

  // 2. Detect message type by content
  const detectMessageType = (text: string): string => {
    if (text.includes('pacs.008')) return 'PACS.008';
    if (text.includes('pacs.002')) return 'PACS.002';
    if (text.includes('camt.053')) return 'CAMT.053';
    if (text.includes('pain.001')) return 'PAIN.001';
    return 'Unknown';
  };

  // 3. Parse XML for display in JSON format
  const parseXML = (text: string) => {
    try {
      const parser = new XMLParser();
      return parser.parse(text);
    } catch (error) {
      console.error('XML parsing error:', error);
      return null;
    }
  };

  // 4. Calculate text similarity using Levenshtein distance
  const calculateSimilarity = (str1: string, str2: string): number => {
    const distance = levenshtein(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return ((maxLength - distance) / maxLength) * 100;
  };

  // 5. Decide which diff to use:
  //    - If both inputs start with "<" and contain NO newlines => single-line XML => diffChars
  //    - Otherwise => diffLines (preserves layout, including whitespace)
  const getDifferences = (input1: string, input2: string): string[] => {
    const trimmed1 = input1.trimStart().trimEnd();
    const trimmed2 = input2.trimStart().trimEnd();
    const isXML = trimmed1.startsWith('<') && trimmed2.startsWith('<');
    const isSingleLine = !trimmed1.includes('\n') && !trimmed2.includes('\n');

    if (isXML && isSingleLine) {
      // Single-line XML => character-level diff
      const diffs = diffChars(trimmed1, trimmed2);
      let diffResult = '';
      diffs.forEach((part) => {
        if (part.added) {
          diffResult += `<span class="text-green-600">${part.value}</span>`;
        } else if (part.removed) {
          diffResult += `<span class="text-red-600">${part.value}</span>`;
        } else {
          diffResult += part.value;
        }
      });
      return [diffResult];
    } else {
      // Multi-line or non-XML => line-based diff (preserves original layout)
      const differences = diffLines(input1, input2);
      return differences.map((part) => {
        if (part.added) {
          return `<span class="text-green-600">${part.value}</span>`;
        } else if (part.removed) {
          return `<span class="text-red-600">${part.value}</span>`;
        }
        return part.value;
      });
    }
  };

  // 6. Handle the Analyze button click
  const handleAnalyze = () => {
    const compressed1 = compressText(text1);
    const analysis: AnalysisResult = {
      originalSize: text1.length,
      compressedSize: compressed1.length,
      compressionRatio: (compressed1.length / text1.length) * 100,
      messageType: detectMessageType(text1),
      xmlContent: parseXML(text1)
    };

    if (text2) {
      analysis.differences = getDifferences(text1, text2);
      analysis.similarity = calculateSimilarity(text1, text2);
    }

    setResult(analysis);
    if (onAnalyze) {
      onAnalyze(analysis);
    }
  };

  // 7. Copy JSON result to clipboard
  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 8. Safely render diff results using dangerouslySetInnerHTML
  const renderDifference = (diff: string) => {
    if (diff.includes('<span class="text-')) {
      return <span dangerouslySetInnerHTML={{ __html: diff }} />;
    }
    return (
      <span className="text-gray-700">
        {diff}
      </span>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Text Analyzer</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left side: text inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Text
            </label>
            <textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              className="w-full h-64 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Paste your primary text here (e.g., single-line XML)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comparison Text (Optional)
            </label>
            <textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              className="w-full h-64 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Paste text to compare (optional)"
            />
          </div>
        </div>

        {/* Right side: results & actions */}
        <div className="space-y-6">
          <div className="flex gap-4">
            <button
              onClick={handleAnalyze}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <RefreshCw size={20} />
              Analyze
            </button>
            <button
              onClick={() => {
                setText1('');
                setText2('');
                setResult(null);
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          </div>

          {result && (
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Analysis Results</h3>
                <button
                  onClick={() => handleCopy(JSON.stringify(result, null, 2))}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                >
                  {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Original Size</p>
                  <p className="font-medium">{result.originalSize} bytes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Compressed Size</p>
                  <p className="font-medium">{result.compressedSize} bytes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Compression Ratio</p>
                  <p className="font-medium">
                    {result.compressionRatio.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Message Type</p>
                  <p className="font-medium">{result.messageType}</p>
                </div>
              </div>

              {result.similarity !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Text Similarity</p>
                  <div className="mt-1 relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: `${result.similarity}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                      />
                    </div>
                    <p className="mt-1 text-sm font-medium">
                      {result.similarity.toFixed(2)}% similar
                    </p>
                  </div>
                </div>
              )}

              {result.differences && result.differences.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Differences</p>
                  <div className="max-h-96 overflow-y-auto bg-gray-50 p-3 rounded text-sm font-mono whitespace-pre-wrap">
                    {result.differences.map((diff, index) => (
                      <div key={index} className="mb-1">
                        {renderDifference(diff)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.xmlContent && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">XML Structure</p>
                  <pre className="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded text-sm">
                    {JSON.stringify(result.xmlContent, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

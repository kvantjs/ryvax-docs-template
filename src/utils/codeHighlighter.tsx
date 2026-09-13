import React from 'react';
import Prism from 'prismjs';

// Import essential Prism language definitions
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-go.js';
import 'prismjs/components/prism-rust.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-json.js';

export interface TokenProps {
  type: 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'punctuation' | 'operator' | 'property' | 'type' | 'plain';
  text: string;
}

// Convert Prism's native token types into our sleek, high-contrast palette types
function mapPrismType(type: string): TokenProps['type'] {
  switch (type) {
    case 'keyword':
    case 'builtin':
    case 'boolean':
      return 'keyword';
    case 'string':
    case 'char':
    case 'regex':
    case 'attr-value':
      return 'string';
    case 'number':
      return 'number';
    case 'comment':
      return 'comment';
    case 'function':
    case 'class-name':
      return 'function';
    case 'type':
    case 'class':
      return 'type';
    case 'property':
    case 'attr-name':
      return 'property';
    case 'punctuation':
      return 'punctuation';
    case 'operator':
      return 'operator';
    default:
      return 'plain';
  }
}

// Map requested languages to official Prism grammars
function getGrammar(language: string): Prism.Grammar {
  const lang = language ? language.toLowerCase() : '';
  if (lang === 'typescript' || lang === 'ts' || lang === 'tsx') {
    return Prism.languages.typescript || Prism.languages.javascript;
  }
  if (lang === 'python' || lang === 'py') {
    return Prism.languages.python || Prism.languages.javascript;
  }
  if (lang === 'go' || lang === 'golang') {
    return Prism.languages.go || Prism.languages.javascript;
  }
  if (lang === 'rust' || lang === 'rs') {
    return Prism.languages.rust || Prism.languages.javascript;
  }
  if (lang === 'bash' || lang === 'sh' || lang === 'curl' || lang === 'shell') {
    return Prism.languages.bash || Prism.languages.javascript;
  }
  if (lang === 'json') {
    return Prism.languages.json || Prism.languages.javascript;
  }
  return Prism.languages.javascript;
}

// Recursively flatten Prism tokens into our flat TokenProps list
function flattenTokens(tokens: (string | Prism.Token)[], parentType?: string): TokenProps[] {
  const result: TokenProps[] = [];

  for (const token of tokens) {
    if (typeof token === 'string') {
      result.push({
        type: parentType ? mapPrismType(parentType) : 'plain',
        text: token,
      });
    } else {
      const type = token.type;
      if (Array.isArray(token.content)) {
        result.push(...flattenTokens(token.content, type));
      } else if (typeof token.content === 'object') {
        result.push(...flattenTokens([token.content as Prism.Token], type));
      } else {
        result.push({
          type: mapPrismType(type),
          text: String(token.content),
        });
      }
    }
  }

  return result;
}

// Tokenize a code line using Prism's actual language specifications
export function tokenizeLine(line: string, language: string): TokenProps[] {
  if (!line) {
    return [{ type: 'plain', text: ' ' }];
  }
  const grammar = getGrammar(language);
  const prismTokens = Prism.tokenize(line, grammar);
  return flattenTokens(prismTokens);
}

export function formatTokenColor(type: TokenProps['type'], _isDark: boolean = true): string {
  switch (type) {
    case 'keyword':
      return 'text-[#c084fc] font-semibold'; // Radiant purple/lavender for keywords
    case 'string':
      return 'text-[#34d399]'; // Minty emerald for string literals
    case 'number':
      return 'text-[#fbbf24] font-mono'; // Amber gold for numbers
    case 'comment':
      return 'text-[#525252] italic font-light'; // Highly muted gray for comments
    case 'function':
      return 'text-[#60a5fa] font-semibold'; // Sky blue for function calls
    case 'type':
      return 'text-[#2dd4bf]'; // Crisp turquoise teal for type definitions
    case 'property':
      return 'text-[#e2e8f0]'; // Cool off-white/gray for attributes
    case 'punctuation':
      return 'text-[#71717a]'; // Muted slate gray for braces and delimiters
    case 'operator':
      return 'text-[#f43f5e]'; // Soft coral/rose for operators
    default:
      return 'text-[#e4e4e7]';
  }
}

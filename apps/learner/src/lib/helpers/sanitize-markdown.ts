import { marked, type Token, type TokensList } from 'marked';

function isURLsafe(url: string): boolean {
  return /^https:/.test(url);
}

function sanitizeTokens(tokens: TokensList | Token[]): Token[] {
  return tokens.map((token) => {
    switch (token.type) {
      case 'html':
        return { ...token, text: '' };
      case 'link':
        if (!isURLsafe(token.href)) {
          token.href = '#';
        }

        return token;
      case 'image':
        if (!isURLsafe(token.href)) {
          token.href = '';
        }

        return token;
      default:
        if ('tokens' in token && token.tokens && token.tokens.length > 0) {
          token.tokens = sanitizeTokens(token.tokens);
        }

        return token;
    }
  });
}

/**
 * Sanitize markdown to prevent XSS attacks.
 *
 * @param markdown - The content.
 * @returns The sanitized HTML.
 */
export function safeMarkdown(markdown: string): string {
  return marked.parser(sanitizeTokens(marked.lexer(markdown)));
}

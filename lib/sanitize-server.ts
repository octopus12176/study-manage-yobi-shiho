import DOMPurify from 'isomorphic-dompurify';

/**
 * サーバーサイド（Node.js Server Actions）でTipTap生成HTMLをサニタイズ
 * スクリプト、イベントハンドラー、危険な属性を除去する
 *
 * @param html - サニタイズ前のHTML文字列
 * @returns サニタイズ後のHTML、またはnull
 */
export function sanitizeHtmlServer(html: string | null | undefined): string | null {
  if (!html) return null;

  // TipTapが使うタグ（b, i, u, strong, em, p, ul, ol, li等）を許可
  // スクリプト関連とイベントハンドラーは自動除去される
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'blockquote',
      'code',
      'pre',
      'span',
      'div',
    ],
    ALLOWED_ATTR: ['style', 'class'],
    FORCE_BODY: false,
  });

  return clean || null;
}

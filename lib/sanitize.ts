import DOMPurify from 'dompurify';

/**
 * TipTap 生成 HTML をサニタイズして XSS を防ぐ
 * サーバー側 (sanitize-server.ts) と同じ許可タグ・属性を設定
 * @param html - サニタイズする HTML 文字列
 * @returns サニタイズ済み HTML
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's',
      'ul', 'ol', 'li',
      'h1', 'h2', 'h3',
      'blockquote', 'code', 'pre',
      'span', 'div',
    ],
    ALLOWED_ATTR: ['style', 'class'],
    FORCE_BODY: false,
  });
}

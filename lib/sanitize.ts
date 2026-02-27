import DOMPurify from 'dompurify';

/**
 * TipTap 生成 HTML をサニタイズして XSS を防ぐ
 * @param html - サニタイズする HTML 文字列
 * @returns サニタイズ済み HTML
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

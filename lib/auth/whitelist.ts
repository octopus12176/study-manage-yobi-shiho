/**
 * メールアドレスのホワイトリスト機能
 * WHITELIST_EMAILS 環境変数で許可されたメールアドレスを管理
 */

/**
 * メールアドレスがホワイトリストに含まれているか確認
 * @param email チェック対象のメールアドレス
 * @returns ホワイトリストに含まれている場合は true
 */
export function isEmailWhitelisted(email: string): boolean {
  const whitelistEnv = process.env.WHITELIST_EMAILS;

  // 環境変数が設定されていない場合はすべてのメールを許可
  if (!whitelistEnv) {
    return true;
  }

  const whitelistedEmails = whitelistEnv
    .split(',')
    .map((e) => e.trim().toLowerCase());

  return whitelistedEmails.includes(email.toLowerCase());
}

/**
 * ホワイトリストが有効か確認
 * @returns ホワイトリストが設定されている場合は true
 */
export function isWhitelistEnabled(): boolean {
  return !!process.env.WHITELIST_EMAILS;
}

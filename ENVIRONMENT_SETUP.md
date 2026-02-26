# 環境変数セットアップガイド

このプロジェクトは開発環境（ローカル Supabase）と本番環境（Vercel + 本番 Supabase）を自動で切り替えます。

## 環境変数の優先度

Next.js は以下の優先度で環境変数を読み込みます：

1. **開発環境**: `.env.development.local` → `.env.local`
2. **本番環境**: `.env.production.local` → `.env.local`

## セットアップ手順

### 1. ローカル開発環境（Supabase ローカル）

#### Supabase CLI のセットアップ

```bash
# Supabase CLI をインストール
brew install supabase/tap/supabase

# または npm で
npm install -g supabase@latest

# Supabase ローカルプロジェクトを初期化（初回のみ）
supabase init
```

#### Supabase ローカルサーバーの起動

```bash
# ローカル Supabase を起動（Docker 必須）
supabase start

# ローカルサーバーの情報を確認
supabase status
```

出力例：
```
service_role_key: eyJ...
anon_key:        eyJ...
API URL:         http://127.0.0.1:54321
S3 URL:          http://127.0.0.1:54321/storage/v1/s3
```

#### `.env.development.local` の設定

出力された **API URL** と **anon_key** を `.env.development.local` に設定：

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<出力された anon_key>
OPENAI_API_KEY=<オプション - ローカル開発時は不要>
```

#### 開発サーバーの起動

```bash
npm run dev
# http://localhost:3000 で起動
```

### 2. 本番環境（Vercel + Supabase）

#### `.env.production.local` の設定

ローカルテスト用（必須ではありません）：

```bash
NEXT_PUBLIC_SUPABASE_URL=<本番 Supabase のプロジェクト URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<本番 Supabase の anon_key>
OPENAI_API_KEY=<OpenAI API キー>
```

#### Vercel での環境変数設定

1. [Vercel ダッシュボード](https://vercel.com/dashboard) にアクセス
2. プロジェクトを選択 → **Settings** → **Environment Variables**
3. 以下の変数を追加：

| 環境変数名 | 値 | 環境 |
|-----------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 本番 Supabase プロジェクト URL | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 本番 Supabase anon key | Production |
| `OPENAI_API_KEY` | OpenAI API キー | Production |

### 3. ビルド・デプロイ確認

```bash
# 本番ビルドのテスト（ローカル）
npm run build
npm start

# Vercel への自動デプロイ
git push  # GitHub に push すると自動デプロイ開始
```

## ファイル構成

```
.env.example              # テンプレート（Git トラッキング）
.env.development.local    # ローカル開発用（.gitignore）
.env.production.local     # 本番テスト用（.gitignore）
```

すべての `.env.*.local` ファイルは `.gitignore` に含まれており、Git にはコミットされません。

## トラブルシューティング

### ローカル Supabase が起動しない場合

```bash
# Docker が起動しているか確認
docker ps

# Supabase をリセット（初期化）
supabase stop --no-backup
supabase start
```

### 環境変数が反映されていない場合

```bash
# Next.js 開発サーバーを再起動
# (npm run dev を Ctrl+C で停止して再度実行)
```

### Vercel でのデプロイエラー

1. Vercel ダッシュボードで環境変数が正しく設定されているか確認
2. Production 環境を選択しているか確認
3. デプロイを再実行（**Redeploy** ボタン）

## 参考リンク

- [Supabase CLI ドキュメント](https://supabase.com/docs/guides/local-development)
- [Next.js 環境変数](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel 環境変数](https://vercel.com/docs/projects/environment-variables)

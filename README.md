# 司法試験・予備試験学習管理アプリケーション

日本の司法試験・予備試験向けの学習時間管理アプリケーションです。ユーザーが学習時間を記録し、週単位での目標を計画し、詳細なメタデータを持つ学習セッションをログし、学習パターンに対するAIフィードバックを受け取ることができます。

## 🌟 主な機能

- **学習時間記録**: 科目、試験種別、活動タイプ、信頼度などのメタデータ付きで学習セッションをログ
- **週間計画**: 各科目の学習時間を計画し、目標設定・進捗管理
- **ダッシュボード**: 週単位の統計情報とヒートマップで学習パターンを可視化
- **ポモドーロタイマー**: 集中力を高めるタイマー機能
- **AIフィードバック**: OpenAIを活用した学習パターン分析と改善提案
- **ダークモード対応**: ライト/ダークモードの自動切り替え

## 🛠️ 技術スタック

| カテゴリ | 技術 |
|---------|------|
| **フロントエンド** | Next.js 15、React 19、TypeScript |
| **スタイリング** | Tailwind CSS、カスタムテーマ変数 |
| **データベース・認証** | Supabase（PostgreSQL + Auth） |
| **AI連携** | OpenAI API |
| **UIコンポーネント** | Radix UI パターン + カスタムコンポーネント |

## 🚀 クイックスタート

### 前提条件
- Node.js 18以上
- npm または yarn
- Supabaseアカウント
- OpenAI APIキー

### セットアップ

1. **リポジトリをクローン**
```bash
git clone <repository-url>
cd study-manage-yobi-shiho
```

2. **依存関係をインストール**
```bash
npm install
```

3. **環境変数を設定**
`.env.local` ファイルを作成し、以下の変数を設定します：

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
OPENAI_API_KEY=<your-openai-api-key>
OPENAI_MODEL=gpt-4o-mini
OPENAI_API_BASE=<optional-api-base-url>
```

4. **開発サーバーを起動**
```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスしてください。

## 📋 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番向けビルド
npm run build

# 本番サーバー起動
npm start

# ESLint実行
npm run lint
```

## 📁 プロジェクト構造

```
/app                    # Next.js App Router
├── layout.tsx          # ルートレイアウト
├── page.tsx            # ダッシュボード
├── login/              # ログインページ
├── log/                # 学習セッションログ
├── timer/              # ポモドーロタイマー
├── plan/               # 週単位の計画
├── review/             # 復習・フィードバック
└── globals.css         # グローバルスタイル

/components             # Reactコンポーネント
├── app/                # アプリケーション枠組み
├── dashboard/          # ダッシュボード機能
├── log/                # ログ機能
├── timer/              # タイマー機能
├── plan/               # 計画機能
├── review/             # 復習機能
└── ui/                 # 再利用可能なUI

/lib                    # ユーティリティとビジネスロジック
├── supabase/           # Supabase関連
│   ├── server.ts       # SSRクライアント
│   ├── client.ts       # ブラウザクライアント
│   ├── queries.ts      # データベースクエリ
│   └── types.ts        # 自動生成型定義
├── constants.ts        # ドメイン定数
├── types.ts            # アプリケーション型定義
├── dashboard.ts        # ダッシュボード計算
├── date.ts             # 日付ユーティリティ
├── openai.ts           # OpenAI APIラッパー
└── review/             # 復習機能ユーティリティ
```

## 🔑 主要機能の実装

### 学習セッションの記録
- `/app/log/page.tsx` でフォームUI
- `/app/log/actions.ts` でサーバーアクション処理
- `StudySession` 型で科目、時間、試験種別などを記録

### 週間計画
- `/components/plan/plan-view.tsx` で科目配分を設定
- `/lib/dashboard.ts` で目標達成度を計算
- 「今週のフォーカス科目」で優先順位を設定可能

### ダッシュボード統計
- 週単位の学習時間合計
- 科目ごとの時間配分
- 連続学習日数
- 学習パターンのヒートマップ

### AIフィードバック
- 学習セッションから洞察を抽出（`/lib/review/insights.ts`）
- OpenAI APIで学習パターン分析
- 改善提案の自動生成

## 📊 主要なデータモデル

詳細は `/lib/types.ts` を参照：

- **StudySession**: 学習活動（科目、時間、試験種別、活動タイプ、信頼度、メモ、原因カテゴリ）
- **WeeklyPlan**: 週単位の学習目標と科目配分
- **PomodoroRun**: ポモドーロセッションの追跡
- **DashboardStats**: 計算済みの週単位統計

## 🎨 テーマ・スタイリング

- Tailwind CSS with カスタムカラー変数（`/app/globals.css`）
- テーマ変数：`--bg`、`--card`、`--text`、`--accent`、`--success`、`--warn`、`--danger`
- ダークモード対応（`darkMode: ['class']`）
- カスタムフォント：「Zen Kaku Gothic New」（sans）、「DM Mono」（mono）

## 🔐 認証とセッション

- Supabase SSRクライアントがクッキーで認証処理を実行
- ミドルウェアがリクエストごとにセッションを更新
- 未認証時は自動的に認証ページにリダイレクト

## 📚 開発ガイド

詳細な開発ガイドは [CLAUDE.md](./CLAUDE.md) を参照してください：
- 新しい学習セッションフィールドの追加方法
- 新機能ページの作成方法
- ダッシュボード計算の修正方法

## 📝 ドメイン定数

すべてのドメイン固有オプションは `/lib/constants.ts` に定義：
- **SUBJECTS**: 8つの法律科目（憲法、行政法、民法等）
- **EXAM_OPTIONS**: 予備試験（yobi）、司法試験（shiho）、両方
- **TRACK_OPTIONS**: 短答、論文、復習、模試、その他
- **ACTIVITY_OPTIONS**: インプット、演習、復習、答案作成
- **CAUSE_CATEGORIES**: 練習での失敗理由カテゴリ

## 🤝 貢献

詳細は [CLAUDE.md](./CLAUDE.md) のプロジェクトガイドを参照してください。

## 📄 ライセンス

このプロジェクトはプライベートリポジトリです。

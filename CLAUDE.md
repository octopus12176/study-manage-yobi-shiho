# CLAUDE.md

このファイルは、Claude Code がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

日本の司法試験・予備試験向けの学習時間管理アプリケーション。ユーザーが学習時間を記録し、週単位での目標を計画し、詳細なメタデータを持つ学習セッションをログし、学習パターンに対する AI フィードバックを受け取るのを支援します。

## 技術スタック

- **フロントエンド**: Next.js 15、React 19、TypeScript
- **スタイリング**: Tailwind CSS、カスタムテーマ変数（ライト/ダークモード対応）
- **データベース・認証**: Supabase（PostgreSQL + Auth）
- **AI 連携**: OpenAI API（フィードバック生成）
- **UI コンポーネント**: Radix UI パターン + カスタムコンポーネント

## 開発コマンド

```bash
# 開発
npm run dev                 # Next.js dev サーバー起動（http://localhost:3000）

# ビルド・本番
npm run build              # 本番向けビルド
npm start                  # 本番サーバー起動

# コード品質
npm run lint              # ESLint 実行
```

## アーキテクチャ概要

### ディレクトリ構成（Next.js App Router）

```
/app
├── layout.tsx            # ルートレイアウト、AppShell ラッパー、ユーザーの連続学習日数を計算
├── page.tsx              # ダッシュボードページ（メインビュー）
├── login/                # ログインページ
├── auth/                 # 認証コールバック処理
├── log/                  # 学習セッションログ
│   ├── page.tsx          # ログフォーム UI
│   └── actions.ts        # サーバーアクション: createStudySessionAction
├── timer/                # ポモドーロタイマー
│   ├── page.tsx
│   └── actions.ts
├── plan/                 # 週単位の計画
│   ├── page.tsx
│   └── actions.ts
├── review/               # 復習・フィードバック表示
│   └── page.tsx
└── globals.css           # グローバルスタイル（CSS 変数）

/components               # React コンポーネント（機能ベース構成）
├── app/                  # アプリケーション枠組みコンポーネント
│   ├── app-shell.tsx     # サイドバー・ボトムナビゲーション含むラッパー
│   ├── sidebar.tsx
│   └── bottom-nav.tsx
├── dashboard/            # ダッシュボード機能コンポーネント
│   └── dashboard-view.tsx
├── log/                  # ログ機能コンポーネント
├── timer/                # タイマー機能コンポーネント
├── plan/                 # 計画機能コンポーネント
├── review/               # 復習機能コンポーネント
└── ui/                   # 再利用可能な UI コンポーネント（button、card、input など）

/lib
├── supabase/
│   ├── server.ts         # Supabase SSR クライアントファクトリ
│   ├── client.ts         # Supabase ブラウザクライアント
│   ├── middleware.ts     # セッション更新用の認証ミドルウェア
│   ├── queries.ts        # 全データベースクエリ（CRUD 操作）
│   └── types.ts          # Supabase の自動生成型定義
├── constants.ts          # ドメイン定数（科目、試験種別、活動タイプ等）
├── types.ts              # アプリケーション型定義（StudySession など）
├── dashboard.ts          # ダッシュボードデータの計算（統計、ヒートマップ）
├── date.ts               # 日付ユーティリティ
├── openai.ts             # OpenAI API ラッパー
├── utils.ts              # 汎用ユーティリティ
└── review/               # 復習機能用ユーティリティ
    ├── insights.ts       # セッションから洞察を生成
    └── fallback.ts       # フォールバック復習データ
```

### 主要データモデル

詳細は `/lib/types.ts` を参照：

- **StudySession**: 記録された学習活動（科目、時間、試験種別、活動タイプ、信頼度、メモ、原因カテゴリ）
- **WeeklyPlan**: 週単位の学習目標と科目配分
- **PomodoroRun**: ポモドーロセッションの追跡
- **DashboardStats**: 計算済みの週単位統計

### データベースレイヤーのパターン

1. **Queries**: `/lib/supabase/queries.ts` がすべてのデータベース操作をエクスポート
2. **Server Actions**: `/app/*/actions.ts` でクエリを使用してデータ更新
3. **Server Components**: `/app/*/page.tsx` でレンダリング時にデータ取得
4. **キャッシュ無効化**: Server Actions から `revalidatePath()` を呼び出してキャッシュ無効化

主要関数：
- `getUserOrThrow()` - 認証ユーザーを取得、失敗時は例外
- `createStudySession()` - 学習セッションを挿入
- `createWeeklyPlan()` - 週計画を挿入または更新
- `listStudySessionsInRange()` - 日付範囲内のセッションを取得

## 重要な実装詳細

### 定数・ドメイン知識

`/lib/constants.ts` にすべてのドメイン固有オプションを定義：
- `SUBJECTS`: 8 つの法律科目（憲法、行政法、民法等）
- `EXAM_OPTIONS`: 予備試験（yobi）、司法試験（shiho）、両方
- `TRACK_OPTIONS`: 短答（tantou）、論文（ronbun）、復習（review）、模試（mock）、その他
- `ACTIVITY_OPTIONS`: インプット、演習、復習、答案作成
- `CAUSE_CATEGORIES`: 練習での失敗理由カテゴリ
- `DEFAULT_WEEKLY_PLAN`: デフォルト学習時間と科目配分
- `DEFAULT_WEEKLY_TARGET_MIN`: 週学習目標（デフォルト: 2100 分）

### テーマ・スタイリング

- Tailwind CSS with `/app/globals.css` 内のカスタムカラー変数
- テーマ変数: `--bg`、`--card`、`--text`、`--accent`、`--success`、`--warn`、`--danger` など
- ダークモード対応（tailwind.config.ts の `darkMode: ['class']`）
- カスタムフォント: "Zen Kaku Gothic New"（sans）、"DM Mono"（mono）

### 認証・セッション

- Supabase SSR クライアントがクッキーで認証処理を実行
- ミドルウェアが毎リクエストでセッションを更新
- 未認証時は認証ページにリダイレクト
- サーバーコンテキストで `getUserOrThrow()` を使用してユーザー情報を取得

### 外部 API 連携

**OpenAI**: カスタムエンドポイント（`OPENAI_API_BASE`）を Bearer トークンで使用
- 環境変数: `OPENAI_API_KEY`、`OPENAI_MODEL`（デフォルト: gpt-4o-mini）、`OPENAI_API_BASE`
- 復習機能で学習パターンに関する AI フィードバック生成に使用

### 環境変数

`.env.local` に必要な設定：
```
NEXT_PUBLIC_SUPABASE_URL        # Supabase プロジェクトの公開 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase の匿名キー
OPENAI_API_KEY                  # OpenAI API キー
OPENAI_MODEL                    # OpenAI モデル（オプション、デフォルト: gpt-4o-mini）
OPENAI_API_BASE                 # OpenAI API ベース URL（オプション）
```

## 一般的な開発タスク

### 新しい学習セッションフィールドを追加する

1. Supabase テーブル定義に追加
2. `/lib/supabase/types.ts` を更新（自動生成、必要に応じて Supabase CLI で再生成）
3. `/lib/types.ts` の StudySession 型を更新
4. `/components/log/` のフォームと `/app/log/actions.ts` の LogFormInput を更新
5. フィルタリング・ソート用に `/lib/supabase/queries.ts` を更新

### 新機能ページを作成する

1. `/app/[feature]/page.tsx` を作成（サーバーコンポーネント）
2. データ更新が必要な場合は `/app/[feature]/actions.ts` で Server Actions を定義
3. `/components/[feature]/` に機能コンポーネントを作成
4. `/components/app/app-shell.tsx` にナビゲーションリンクを追加
5. `listStudySessionsInRange()` などのクエリを使用してデータ取得

### ダッシュボード計算を修正する

- ダッシュボード処理: `/lib/dashboard.ts`（週統計、ヒートマップデータ）
- `/app/page.tsx` から呼び出し
- データ取得ではなく計算関数を編集

## パターンに関する注釈

- **サーバーサイドレンダリング**: ページは async サーバーコンポーネントを使用、クエリからのクライアント側データ取得なし
- **フォーム処理**: Server Actions がフォーム送信、検証、キャッシュ無効化を処理
- **日付処理**: `date-fns` で日付操作、ISO 形式文字列を一貫して使用
- **型安全性**: strict モード有効の完全な TypeScript、Supabase から自動生成される型
- **コンポーネント構成**: 機能ごとに専用フォルダ、共有 UI は `/components/ui/` に配置

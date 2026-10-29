# ベースラインの実施状況（Band Stem Mixer）

基準: WEBAPP_BASELINE.md（最終更新 2026-10-29 版、12-14 まで）
状態: ✅ 実装済み / ⚠️ 一部 / ❌ 未実装 / 👤 待ち（人間の作業） / — 対象外
最終更新: 2026-10-29（記事 6 本を追加。2026-10-28 初版）

## 0. 変数

| 変数 | 値 |
|---|---|
| アプリ名 | Band Stem Mixer |
| スラッグ | `bandstemmixer` |
| ドメイン | `ktkwmr.com`（§0 の A: 別 Worker + Route `ktkwmr.com/bandstemmixer*`） |
| リポジトリ | `ktkwmr/BandStemMixer`（公開） |
| 運営者・問い合わせ | ktkwmr / GitHub Issues |
| 言語 | en（既定）+ ja（`/ja/`） |
| Web Analytics token | ほかのアプリと同じ |
| 初回の Artifact（§12-12） | https://claude.ai/artifact/WKcH9zekqECd2nY5L7MUL2 （画面の確認用。Artifact の中ではモデルのダウンロードや WAV 保存が制限される可能性あり） |

## 項目

| # | 項目 | 状態 | メモ |
|---|---|---|---|
| 1-4 | Claude の GitHub App | ✅ | このセッションで push できた |
| 1-8 | Cloudflare の GitHub App | 👤 | 「Only select repositories」なら BandStemMixer を追加 |
| 2-1 | wrangler.jsonc | ✅ | `routes`・`workers_dev: false`・`preview_urls: true`・`previews: {}` |
| 2-2 | `/` の転送 | — | ドメイン直下は `ktkwmr/ktkwmr.com` |
| 2-3 | 404.html | ✅ | |
| 2-4〜2-10 | .gitignore・LF・`--check`・README・LICENSE・CLAUDE.md・バージョンなし | ✅ | |
| 2-11 | Cloudflare に接続 | 👤 | Project name は `bandstemmixer`、Production branch は `main` |
| 2-13 | 自動デプロイの確認 | 👤 | |
| 2-14 | 2 つ目以降のアプリの Worker 設定 | ✅ | sitemap は `/bandstemmixer/sitemap.xml` |
| 2-16 | トップページへの追加 | ✅ | ktkwmr/ktkwmr.com#9（`APPS`・`ICON`・`PREVIEW`、`robots.txt` の `Sitemap:` 行）。アプリ名・説明・アイコン・画面を変えたら、そちらも直す |
| 3-1〜3-5 | manifest・アイコン・meta・sw.js・SW 登録 | ✅ | |
| 3-6 | `file://` の注意 | ✅ | README |
| 3-7 | インストールの案内 | ❌ | 任意 |
| 3-8 | アイコンの生成 | ✅ | `scripts/render-icons.mjs` |
| 3-9 | COEP とワーカーのスクリプト | ✅ | SW はネットワークの応答（元のヘッダー付き）をそのままキャッシュするので、2 回目以降も `separator.js`・`mixer.js` に COEP が付く。E2E で SW が制御する 2 回目の分離を確認 |
| 3-10 | CDN のオフライン対応 | ✅ | `sw.js` の `CDN` に ONNX Runtime Web 1.30.0 の 6 ファイルと demucs-web 1.0.2 の 3 ファイル。AI モデルは `separator.js` が `bandstemmixer-model-v2` に保存（`KEEP` で activate 時に消さない） |
| 4-1〜4-3 | I18N・言語の決め方・日本語ページの生成 | ✅ | |
| 4-4 | 日本語の検索用タイトル・説明 | 👤 | `scripts/build-ja.mjs` 冒頭の案を確認 |
| 4-7 | `<base>` と URL | ✅ | Worker・AudioWorklet・ライセンスはすべて相対 URL（`<base>` で解決）。E2E で `/ja/` の分離を確認 |
| 5-1〜5-8 | title・canonical・hreflang・OGP・og-image・JSON-LD・h1・説明 | ✅ | |
| 5-10 | sitemap はアプリごと | ✅ | |
| 5-11 | スマホでスクロールを止めない | ✅ | |
| 6-1〜6-4 | セキュリティヘッダー・CSP | ✅ | 加えて COOP / COEP require-corp（ONNX Runtime の複数スレッドと SharedArrayBuffer のため）。ローカルの E2E で CSP 違反・コンソールエラー 0 件 |
| 7-1〜7-3 | プライバシー（アプリ内・ポリシー）・運営者情報 | ✅ | 外部送信に Hugging Face・jsDelivr を記載 |
| 7-7 | ポリシーの外部リンクの確認 | 👤 | |
| 7-8 | AI モデルの重みのライセンス | ✅ | Demucs の重みは科学研究目的のみ。非営利のまま運営（`CLAUDE.md`・README・`THIRD_PARTY_LICENSES.md`） |
| 8-1〜8-3 | THIRD_PARTY_LICENSES・Actions・About | ✅ | Demucs（重みは MIT 対象外・科学研究目的のみ、と明記）は手書き。demucs-web と ONNX Runtime はスクリプトが追加 |
| 8-4 | CDN のバージョン固定・遅延読み込み | ✅ | `onnxruntime-web@1.30.0`・`demucs-web@1.0.2`、分離を押したときだけ読む |
| 9-1〜9-2 | 設定メニュー・使い方 | ✅ | ⚙ の「ガイド・記事」と、使い方ダイアログの「詳しい使い方ガイドを読む」 |
| 9-3 | 状態の保存 | ✅ | ソロは保存しない（危ない状態） |
| 9-4・9-5 | スマホ対応・`accept` | ✅ | |
| 9-7 | 保存 | ✅ | `a[download]`。Artifact の中は `downloads` capability（WAV は許可リスト外のため保存できない旨を表示） |
| 9-8 | アクセシビリティ | ✅ | |
| 9-9 | 自動テスト | ⚠️ | 偽モデルを使った Playwright の E2E をセッション内で実施（リポジトリには未収録） |
| 9-10・9-11 | ボタンの反応・ダイアログのフォーカス | ✅ | |
| 9-12 | iOS 26 のステータスバーのにじみ | ⚠️ | `.topbar`・`.site-head` を sticky・不透明に。iPhone 実機では未確認 |
| 9-13 | 大きなダウンロードの前の通信の確認 | ✅ | `connectionRisk()`・`askNetwork()` |
| 10-1〜10-5 | 記事（生成・最初の記事・計算した値・画面写真・導線） | ✅ | 6 本（`guide`・`minus-one`・`learn-by-ear`・`how-it-works`・`better-results`・`faq`）。値は `scripts/pages/app.mjs`、画面写真は `scripts/render-guide-images.mjs`。アプリの説明の下と ⚙ と使い方から記事へ |
| 10-6 | 公開前の UX レビュー | ✅ | 390px で全 12 ページ（横スクロールなし・画像の欠けなし・リンク切れなし・エラー 0 件） |
| 10-7 | 記事の人間確認 | 👤 | `docs/article-review.md`。PR のプレビューで確認してからマージ |
| 10-8 | 再生成できる画面写真と値 | ✅ | 架空の曲（`scripts/guide-song.mjs`）、値はアプリのファイルから |
| 10-9 | 一般知識の校閲 | ✅ | Demucs の README・#327 で確認（`docs/article-review.md` の表） |
| 11-1〜11-3 | Web Analytics | ✅ | |
| 11-4 | beacon の本番確認 | 👤 | COEP require-corp でも beacon（CORS のモジュールスクリプト）が 200 か確認 |
| 12-1・12-2 | Actions | ✅ | |
| 12-12 | Artifact で見せる | ✅ | 上の URL |
| 12-13 | 人間がやる動作確認の方法 | ✅ | PC（`npx.cmd wrangler dev`）とスマホ（プレビュー URL）の手順と確認項目の表を、セッションで提示（ktkwmr/webapp-baseline#12 で追加した項目） |
| 12-14 | 大きな AI モデルの確かめ方 | ✅ | 入出力が同じ偽モデルと `context.route`。`dsp.js` は demucs-web の関数と差 0 |
| 13・14 | 公開時・公開後 | 👤 | |
| 15 | 広告（AdSense） | — | 載せない。AI モデル（Demucs）の重みが科学研究目的のみのため。収益化するなら先に商用利用できる重みのモデルに替える |

## 未確認（この環境から届かないもの）

- 実際の htdemucs モデル（timcsy/demucs-web-onnx）での分離。この環境から huggingface.co に届かないため、同じ入出力の偽モデルで動作（チャンクの重ね合わせ・ミュート・ソロ・保存・再生、GPU と CPU の両方）を確かめた。同じモデルとライブラリ（ONNX Runtime 1.30.0・demucs-web 1.0.2）のプロトタイプが、ユーザーの PC で動くことは確認済み。
- WebGPU の動作（試験的、既定はオフ）。
- iPhone 実機（AudioWorklet・メモリ・画面ロック・ファイル選択）。

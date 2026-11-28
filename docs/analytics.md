# 利用状況の計測（Cloudflare Zaraz + Google Analytics 4）

ページの滞在時間・ボタンのタップ・設定の変更・主な機能の結果を、Cloudflare Zaraz 経由で GA4 に送る（ベースライン §17）。
**同意バナーで「すべて同意」を選んだ人だけ**が GA4 に送られる。閲覧数は今までどおり Cloudflare Web Analytics（Cookie なし）でも数える。
同意の Cookie（`zaraz-consent`）は ktkwmr.com のすべてのアプリで共通。

## しくみ

- `index.html`・記事のページ（`scripts/pages/layout.mjs`）・`public/404.html` の `<head>` で `/cdn-cgi/zaraz/i.js`（Zaraz）と `/bandstemmixer/usage-events.js` を読む。
  Zaraz の「Auto-inject script」は切ってあるので、Zaraz が動くのはこのタグを書いたページだけ。
- `usage-events.js`（ベースラインの `templates/public/__slug__/usage-events.js` のコピー。違うのは `PREFIX` だけ）: すべてのボタン・リンクのタップ（`bsm_tap`）、設定の変更（`bsm_change`）、ページが見えていた時間（`bsm_engaged`）を送る。`window.usage.track(name, params)`（→ `bsm_<name>`）と `window.usage.playing(on)`（音が鳴っている時間）をアプリに渡す。フッターの「Cookie の設定」（`.cookie-settings`）で `zaraz.showConsentModal()` を開く。
- アプリの主な機能のイベントは `index.html` の `chooseFile()`・`run()`・`attempt()`（Vocal Harmony Maker の `vhm_open`・`vhm_separate` と同じ）・`rebuild()`（キー）・`saveMp3()`（`track()` → `window.usage.track`）。
- Zaraz がないとき（`wrangler dev`、workers.dev のプレビュー、ブラウザがブロック）は何も送らない。`i.js` が 404 になるだけで、アプリは動く。
- 同じオリジン（`/cdn-cgi/zaraz/…`）なので CSP・COEP は変えていない。Zaraz が GA4 に送るのは Cloudflare のサーバーからで、ブラウザは Google に直接つながない。
- `sw.js` は `/cdn-cgi/` をキャッシュしない（Zaraz のスクリプトはリクエストごとに作られる）。

**ファイル名・曲の音は送らない（種類・長さ・数・結果だけ）。** イベントを足すときもこれを守り、プライバシーの説明（`scripts/pages/privacy.mjs`、`index.html` の `privacy.body`、README）に書いた範囲に収める。範囲を広げるときは説明も同じ PR で直す。
利用者が名前を付けたもの（曲・セット・トラックなど）が選択肢になる `<select>` には `data-track-value="off"` を付ける（変えたことだけを送り、値は送らない）。文字の入力欄の中身は送らない。

## イベント

すべてのイベントに `ui_lang`（`en` / `ja`）が付く。

| イベント | パラメーター | いつ |
|---|---|---|
| `bsm_tap` | `button` | ボタン・リンク・タブを押したとき。名前は `data-track`、要素の `id`、`data-i18n`（`data-i18n-attr`）のキー（上にある id を `id:キー` の形で前に付ける）、リンクは `link:/bandstemmixer/guide/` や `link:github.com`、「Cookie の設定」は `cookie-settings`、それ以外は「上にある id:クラス名」。アプリが自分で起こすクリック（ダウンロードなど）は数えない |
| `bsm_change` | `control`, `value`, `files` | セレクト・スライダー（離したとき）・数値・チェックボックス（`on`/`off`）・ラジオを変えたとき。ファイルを選んだときは `value` が拡張子（複数は `+`）・`files` が数。名前の付け方は `bsm_tap` と同じ |
| `bsm_engaged` | `seconds`, `play_seconds` | ページが隠れたとき・閉じたとき。前回から、ページが見えていた秒数と音が鳴っていた秒数 |
| `bsm_open` | `kind`（拡張子）, `result`（ok / too-long / decode-error）, `minutes` | 曲のファイルを選んだとき |
| `bsm_separate` | `result`（ok / cancel / later / offline / worker / エラーのコード）, `mode`, `backend`, `tries`, `model_cached`, `seconds`, `minutes`, `stage` | 分離が終わったとき（失敗・中止を含む） |
| `bsm_key` | `result`（ok / error）, `semis` | キーを変えた音ができたとき |
| `bsm_mp3` | `part`（mix / vocals / drums / bass / other）, `result`（ok / error）, `semis`, `minutes` | MP3 で保存したとき |

イベント名を足すときは `bsm_` で始める（GA4 はドメインで 1 つなので、アプリで分けるため）。パラメーターの名前はほかのアプリと同じものを使い回す（GA4 のカスタム定義はディメンション・指標それぞれ 50 個まで）。

## 設定（Cloudflare・GA4）

ドメインで 1 回だけの設定（GA4 のプロパティ `ktkwmr.com`・測定 ID `G-HM6P805V7F`、Zaraz のツール・同意バナー）は Sheet Music Player の `docs/analytics.md` とベースライン §17-1〜17-6。
全アプリに入れたので、Zaraz を一部のページで止めていた Configuration Rule は消す（2026-11-28 の計画。消したかどうかは `docs/baseline-status.md` の 17-13）。

## GA4 で登録するカスタム定義

GA4 → 管理 → カスタム定義。登録しないとレポートに出ない（さかのぼっても出ない）。ほかのアプリで登録済みの名前は登録し直さなくてよい（同じ名前のパラメーターは共通）。

| 種類 | 名前（パラメーター） | 範囲・単位 |
|---|---|---|
| カスタムディメンション | `button`, `control`, `value`, `ui_lang`, `kind`, `result`, `mode`, `backend`, `model_cached`, `stage`, `part` | イベント |
| カスタム指標 | `seconds` | イベント・秒 |
| カスタム指標 | `play_seconds` | イベント・秒 |
| カスタム指標 | `files` | イベント・標準 |
| カスタム指標 | `minutes` | イベント・標準 |
| カスタム指標 | `tries` | イベント・標準 |
| カスタム指標 | `semis` | イベント・標準 |

## 確かめ方

- ローカル: Playwright の `context.route("**/cdn-cgi/zaraz/i.js")` に `window.zaraz = { track() {…}, showConsentModal() {…} }` の代わりを返させ、送られるイベントを見る（ベースライン §17-12）。Playwright の `selectOption` などは `isTrusted` でないイベントを起こすので数えられない。キーボード（`focus` → `ArrowDown`）かクリックで操作する。
- 本番: ブラウザのコンソールで `zaraz.debug("<Debug key>")` を実行して再読み込みすると、Zaraz の送信内容が表示される。GA4 の「リアルタイム」・DebugView にも出る。

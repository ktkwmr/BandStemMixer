# Band Stem Mixer

バンドの曲を AI（Demucs htdemucs、ONNX Runtime Web、STFT は demucs-web）でブラウザの中で 4 パート（ボーカル・ドラム・ベース・その他）に分離し、ミュート・ソロ・フェーダーでミックスして練習できる Web アプリ。各パートとミックスは WAV で保存できる。公開 URL: https://ktkwmr.com/bandstemmixer/ （日本語: /bandstemmixer/ja/）
構成・開発・デプロイの詳細は README.md を参照。

## 共通ベースライン
- 独自機能以外の共通項目は ktkwmr/webapp-baseline（非公開）の WEBAPP_BASELINE.md に従う。
  セッションに無ければ add_repo（read。更新するときは push）で追加して読む。
- 各項目の状態は docs/baseline-status.md に記録する。
- どのアプリにも当てはまる新しい作業・設定・落とし穴が出てきたら、作業の最後に
  ベースラインへの追記案を出す（ユーザーが了承したらベースラインのリポジトリに PR）。
- 独自機能（分離・ミキサー・WAV 保存）の変更だけなら追記は不要。

## このアプリの値
- スラッグ: `bandstemmixer` / ドメイン: `ktkwmr.com` / 言語: en（既定）+ ja（`/ja/`）
- 運営者: ktkwmr / 問い合わせ: GitHub Issues
- Cloudflare Web Analytics token: `5c53079cb9a64d819d1ca53e8533ca63`（ほかのアプリと同じサイト）
- ホスティング: Cloudflare Workers 静的アセット。別 Worker に Route `ktkwmr.com/bandstemmixer*` だけを割り当てる（ベースライン §0 の A）。
  ドメイン直下（トップページ、`robots.txt`、ルートの `sitemap.xml`、ルートの 404）は `ktkwmr/ktkwmr.com`（Worker `ktkwmr-home`）にある。このアプリの sitemap は `/bandstemmixer/sitemap.xml`。

## ルール
- 手で編集するのはアプリ本体 `public/bandstemmixer/index.html`・`separator.js`・`mixer.js`・`sw.js` と `scripts/`。生成ファイル（`public/bandstemmixer/ja/index.html`、情報ページ `<slug>/` とその `ja/`、`public/bandstemmixer/sitemap.xml`）は編集せず、`node scripts/build-ja.mjs` と `node scripts/build-pages.mjs` で作り直す（`--check` で確認）。
- 画面の文言は `index.html` の `I18N`（en / ja）に書き、要素には `data-i18n` / `data-i18n-html` / `data-i18n-attr` を付ける。JS で作る文言は `t()` を使う。子要素を持つ要素に `data-i18n` は付けない（`build-ja.mjs` が止まる）。
- **非営利のまま運営する（広告・有料機能を付けない）。** Demucs のコードは MIT だが、学習済みの重みは MIT の対象外で、Meta は科学研究目的に限って提供している（facebookresearch/demucs#327）。収益化するなら、商用利用できる重みの分離モデルに替えるのが先。重みはリポジトリに入れない（ブラウザが Hugging Face から取得する）。
- モデルは 4 分割の `htdemucs`（timcsy/demucs-web-onnx の `htdemucs_embedded.onnx`、約 172 MB）。6 分割（htdemucs_6s、StemSplit 版）は、ユーザーの PC で読み込み中にメモリ不足になったのでやめた。入力は波形とスペクトログラムの 2 つ、出力は時間側と周波数側の 2 つで、STFT・逆 STFT は demucs-web（jsDelivr）の関数を使う。
- モデルの URL・キャッシュ名（`MODEL_URL`・`MODEL_CACHE`）は `index.html` と `separator.js` の両方に、ONNX Runtime と demucs-web のバージョンは `separator.js` の `ORT_BASE`・`DEMUCS_WEB` と `sw.js` の `CDN` にある。変えるときは全部を同じ PR で直す。モデルのファイルを変えたら `MODEL_CACHE` の `-v2` を上げ、`sw.js` の `KEEP` も直す。
- 大きなダウンロードの前の確認（Wi-Fi でないときのダイアログ）は `index.html` の `connectionRisk()`・`askNetwork()`。モデルがキャッシュ済みなら出さない。ダウンロード量の表示は `MODEL_MB`・`ENGINE_MB`。
- ページはクロスオリジン分離（`public/_headers` の COOP / COEP require-corp）。ONNX Runtime の複数スレッドと、分離結果を `SharedArrayBuffer` でプレーヤーと共有するのに必要。外部から読むファイルは CORS で読む（`<script type="module">`・`fetch`・`import()`）。CORS でない読み込み（`<img>` の外部画像など）を足すと COEP でブロックされる。
- 外部ホストを足したら `public/_headers` の CSP と、プライバシーの説明（`scripts/pages/privacy.mjs`、アプリ内の `privacy.body`、README）を同じ PR で直す。
- ミキサーの設定は `localStorage` の `bandstemmixer-state`（各パートの音量・ミュート、全体の音量）。GPU は WebGPU があれば自動で使う。ソロは保存しない。分離したパートは保存しない。
- トップページ（https://ktkwmr.com/）のアプリ一覧に載せたら、アプリ名・説明・アイコン・記事を変えたときに `ktkwmr/ktkwmr.com` の `scripts/pages/home.mjs` を直す PR を別に出す（ベースライン §2-16）。
- 記事を追加・変更したら、PR のプレビューで人間が内容を確認してからマージする（ベースライン §10-7）。
- 作業はブランチ → PR → Cloudflare のプレビュービルド確認 → squash マージ。
- 本番サイト・Cloudflare 管理画面・外部 CDN・Hugging Face にはこの環境から届かないことが多い。確かめられなかったことは「未確認」と書き、ユーザーに確認手順を伝える。動作確認は、同じ入出力（波形 [1,2,343980] とスペクトログラム [1,4,2048,336] → 時間側 [1,4,2,343980] と周波数側 [1,4,4,2048,336]）の小さな偽モデルと、npm の onnxruntime-web・demucs-web を Playwright の `context.route` で返して行う（ベースライン §12-11）。

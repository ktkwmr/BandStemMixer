# Band Stem Mixer

バンドの曲を AI（Demucs htdemucs、ONNX Runtime Web、STFT は dsp.js で demucs-web と同じ計算）でブラウザの中で 4 パート（ボーカル・ドラム・ベース・その他）に分離し、ミュート・ソロ・フェーダーでミックスして練習できる Web アプリ。「コード推定＆ハモリ生成」で、キー・コードを推定し、ボーカルの 3 度・5 度上（下）のハモリ（ピッチシフトした声とガイド音）を作れる。コードは編集でき、ドラム以外のキーを ±12 半音変えられる。各パートとミックスは MP3 で保存できる。公開 URL: https://ktkwmr.com/bandstemmixer/ （日本語: /bandstemmixer/ja/）
構成・開発・デプロイの詳細は README.md を参照。

## 共通ベースライン
- 独自機能以外の共通項目は ktkwmr/webapp-baseline（非公開）の WEBAPP_BASELINE.md に従う。
  セッションに無ければ add_repo（read。更新するときは push）で追加して読む。
- 各項目の状態は docs/baseline-status.md に記録する。
- どのアプリにも当てはまる新しい作業・設定・落とし穴が出てきたら、作業の最後に
  ベースラインへの追記案を出す（ユーザーが了承したらベースラインのリポジトリに PR）。
- 独自機能（分離・ミキサー・MP3 保存）の変更だけなら追記は不要。

## このアプリの値
- スラッグ: `bandstemmixer` / ドメイン: `ktkwmr.com` / 言語: en（既定）+ ja（`/ja/`）
- 運営者: ktkwmr / 問い合わせ: GitHub Issues
- Cloudflare Web Analytics token: `5c53079cb9a64d819d1ca53e8533ca63`（ほかのアプリと同じサイト）
- ホスティング: Cloudflare Workers 静的アセット。別 Worker に Route `ktkwmr.com/bandstemmixer*` だけを割り当てる（ベースライン §0 の A）。
  ドメイン直下（トップページ、`robots.txt`、ルートの `sitemap.xml`、ルートの 404）は `ktkwmr/ktkwmr.com`（Worker `ktkwmr-home`）にある。このアプリの sitemap は `/bandstemmixer/sitemap.xml`。

## ルール
- 手で編集するのはアプリ本体 `public/bandstemmixer/index.html`・`separator.js`・`dsp.js`・`mixer.js`・`encoder.js`・`harmony.js`・`keyshift.js`・`sw.js` と `scripts/`。生成ファイル（`public/bandstemmixer/ja/index.html`、情報ページ `<slug>/` とその `ja/`、`public/bandstemmixer/sitemap.xml`）は編集せず、`node scripts/build-ja.mjs` と `node scripts/build-pages.mjs` で作り直す（`--check` で確認）。
- 画面の文言は `index.html` の `I18N`（en / ja）に書き、要素には `data-i18n` / `data-i18n-html` / `data-i18n-attr` を付ける。JS で作る文言は `t()` を使う。子要素を持つ要素に `data-i18n` は付けない（`build-ja.mjs` が止まる）。
- **非営利のまま運営する（広告・有料機能を付けない）。** Demucs のコードは MIT だが、学習済みの重みは MIT の対象外で、Meta は科学研究目的に限って提供している（facebookresearch/demucs#327）。収益化するなら、商用利用できる重みの分離モデルに替えるのが先。重みはリポジトリに入れない（ブラウザが Hugging Face から取得する）。
- モデルは 4 分割の `htdemucs`（timcsy/demucs-web-onnx の `htdemucs_embedded.onnx`、約 172 MB）。6 分割（htdemucs_6s、StemSplit 版）は、ユーザーの PC で読み込み中にメモリ不足になったのでやめた。入力は波形とスペクトログラムの 2 つ、出力は時間側と周波数側の 2 つで、STFT・逆 STFT は `dsp.js`。demucs-web の `prepareModelInput`・`standaloneMask`・`standaloneIspec` と同じ値を出すが（FFT は demucs-web の `fft.js` を jsDelivr から読む）、作業用の配列を最初に 1 回だけ確保して使い回す。demucs-web の関数は区間ごとに約 150 MB を確保し、iPhone 17e で曲の途中でタブが落ちたため。`dsp.js` を変えたら、demucs-web の関数と出力を突き合わせて差が 0 であることを確かめる。
- モデルの URL・キャッシュ名（`MODEL_URL`・`MODEL_CACHE`）は `index.html` と `separator.js` の両方に、ONNX Runtime と demucs-web のバージョンは `separator.js` の `ORT_BASE`・`DEMUCS_WEB` と `sw.js` の `CDN` にある。変えるときは全部を同じ PR で直す。モデルのファイルを変えたら `MODEL_CACHE` の `-v2` を上げ、`sw.js` の `KEEP` も直す。
- 保存は MP3 だけ（192 kbps）。`encoder.js`（ワーカー）が lamejs（`@breezystack/lamejs`、LGPL-3.0）で作る。lamejs は改変せず CDN から別ファイルとして読む（LGPL の条件。改変するなら変更を公開する必要がある）。バージョンは `encoder.js` の `LAME_URL` と `sw.js` の `CDN`。
- 大きなダウンロードの前の確認（Wi-Fi でないときのダイアログ）は `index.html` の `connectionRisk()`・`askNetwork()`。モデルがキャッシュ済みなら出さない。ダウンロード量の表示は `MODEL_MB`・`ENGINE_MB`。
- ページはクロスオリジン分離（`public/_headers` の COOP / COEP require-corp）。ONNX Runtime の複数スレッドと、分離結果を `SharedArrayBuffer` でプレーヤーと共有するのに必要。外部から読むファイルは CORS で読む（`<script type="module">`・`fetch`・`import()`）。CORS でない読み込み（`<img>` の外部画像など）を足すと COEP でブロックされる。
- 外部ホストを足したら `public/_headers` の CSP と、プライバシーの説明（`scripts/pages/privacy.mjs`、アプリ内の `privacy.body`、README）を同じ PR で直す。
- ハモリは `harmony.js`（ワーカー）。AI モデルもライブラリも使わない自前の JavaScript：まず 4 パートの和（曲全体）から拍とテンポ（`detectBeats()`。Loop Trainer（ktkwmr/LoopTrainer、MIT、同じ作者）の `detectBeats()` から小節の頭の推定を除いて移したもの。`BEAT_BIAS` も同じ値）を出し、拍ごとのマス（`makeGrid()`、4 分音符。拍が見つからないときは 0.5 秒ごと）を作る。「ベース」「その他」のクロマ（12 音の強さ）をマスごとに足して長三和音・短三和音と照合し、拍ごとに HMM（Viterbi）でならしてコード、Krumhansl のプロファイルと主和音の長さでキー、ボーカルを YIN で音程にしてノートに切り、各ノートにキーの中の 3 度か 5 度上（下）を、コードとぶつかるときはコードの音に寄せて選ぶ（コードの種類は `CHORD_TYPES`。推定はメジャー・マイナーだけ、7th・add9・dim7・m7b5・aug などは編集で付く）。ページはコードを拍ごとのマス（`harm.cells`、`harm.grid`）で持ち、編集はマス単位（その拍から何拍分か）。ノーコードは空白で表示する。キーは曲全体で 1 つ（転調には対応しない）なので画面には出さず、ハモリの音選びにだけ使う。表示は BPM・コード（上の段の名前と拍の目盛り）・旋律・ハモリの音だけ（いま・次のコードの表示、コードの境目の縦線はなし）。ピアノロールは横ドラッグ・横ホイールでスクロールでき（`viewStart`）、再生開始・シークで再生位置に戻る。一度作るとボタンは「ハモリを再生成」（`harm.regen`）になり、ページが持っているコード（編集したもの）と旋律を渡して使い回す（コードの推定と音程の追跡をやり直さない）。コードを編集しても自動では作り直さず、案内（`chords.stale`）を出す。0.3 秒より近いノートは 1 つのフレーズにつなぎ（すき間は真ん中で分ける）、フレーズごとに途切れない音として作る（音程の変化はノートの境目で 40 ms かけて移る）。ハモリの声は TD-PSOLA でボーカルの音程を変えたもの（フレーズの前後 60 ms と、フレーズ内の子音・息も含める）、ガイド音は単純な合成音（フレーズ内はレガート）。どちらもモノラル（L と R に同じ配列）で、ミキサーの 5・6 本目（`HARM`）に足す。分析は 11025 Hz（4 分の 1 に間引き）。作り直し・分離し直しで置き換え、保存はしない。
- キーチェンジは `keyshift.js`（ワーカー、パートごとに 1 つ並行）。フェーズボコーダー（ピークの位相固定）で時間を伸ばしてから元の長さに戻す。ベースは FFT 4096、ほかは 2048。ドラムは変えない。ページは分離したままのパート（`orig`）と、ハモリ・コードを原曲のキーで持ち、キーの変化（`semis`）は音・コード名・表示にだけかける。ハモリの声とガイド音は、キーを変えるたびに `harmony.js` で作り直す（ハモリの音程 + キーの変化を一度にずらす）。`keyshift.js` を変えたら、テスト曲を ±n 半音ずらして、コード推定と旋律がちょうど n ずれ、音量が変わらないことを確かめる。`harmony.js` を変えたら、`scripts/guide-song.mjs` の曲で、コード（Am F C G）・旋律・ハモリの声の音程が合うことを確かめる。
- ミキサーの設定は `localStorage` の `bandstemmixer-state`（各パートの音量・ミュート（ハモリの 2 本も）、全体の音量）。分離の設定は端末ごとに順に試す（`index.html` の `MODES`・`LADDER`）。PC は full（WebGPU があれば GPU、CPU は多スレッド）→ cpu。スマホとメモリ 4 GB 以下の端末は gpu（GPU・メモリ節約）→ cpu（2 スレッド）→ cpu1（1 スレッド）。iPhone の Safari では GPU の作業メモリはタブではなく GPU プロセスが持つので、タブの上限（htdemucs は 1 区間で約 1 GB 使う）に触れにくい。エラーなら同じ分離の中で次の設定に移り、タブごと落ちたら（`bandstemmixer-running` の記録が残る）次に開いたときに `bandstemmixer-crashed` に覚えて、その設定を 30 日飛ばす。ソロは保存しない。分離したパートは保存しない。
- 記事は `scripts/pages/<slug>.mjs`（`guide`・`minus-one`・`learn-by-ear`・`harmony`・`chords-and-key`・`how-it-works`・`better-results`・`faq`）。画面写真は `scripts/pages/shots.mjs` の `img()` で入れる。アプリと共通の値（モデルの大きさ・曲の長さの上限・フェーダーの上限・MP3 のビットレート・区間の長さ）は書き写さず、`scripts/pages/app.mjs` がアプリのファイルから読む（見つからなければビルドが止まる）。記事を足したら `build-pages.mjs` の `PAGES` と、`index.html` の `intro.body` のガイド一覧（英日）にも足す。見た目を変えたら `node scripts/render-guide-images.mjs` で画面写真を撮り直す（架空の曲 `scripts/guide-song.mjs` を使い、`separator.js` を仮の処理に差し替えるので AI モデルは不要。日本語のファイル名はパスではなく buffer で渡す）。
- トップページ（https://ktkwmr.com/）のアプリ一覧に載せたら、アプリ名・説明・アイコン・記事を変えたときに `ktkwmr/ktkwmr.com` の `scripts/pages/home.mjs` を直す PR を別に出す（ベースライン §2-16）。
- 記事を追加・変更したら、PR のプレビューで人間が内容を確認してからマージする（ベースライン §10-7）。確認してほしい点を `docs/article-review.md` に書き、PR 本文にも載せる。記事は広告なし（重みのライセンスのため。記事だけに広告を付けるのも不可）。
- 作業はブランチ → PR → Cloudflare のプレビュービルド確認 → squash マージ。
- 本番サイト・Cloudflare 管理画面・外部 CDN・Hugging Face にはこの環境から届かないことが多い。確かめられなかったことは「未確認」と書き、ユーザーに確認手順を伝える。動作確認は、同じ入出力（波形 [1,2,343980] とスペクトログラム [1,4,2048,336] → 時間側 [1,4,2,343980] と周波数側 [1,4,4,2048,336]）の小さな偽モデルと、npm の onnxruntime-web・demucs-web を Playwright の `context.route` で返して行う（ベースライン §12-11）。

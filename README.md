# Band Stem Mixer

Split a band song into 4 parts with AI — vocals, drums, bass, and other (guitar, keys…) — right in your browser, then mute, solo, and mix them to practice along with your band. Save each part, or your own mix, as an MP3 file. The song is never uploaded.

バンドの曲を AI でボーカル・ドラム・ベース・その他（ギター・鍵盤など）の 4 つのパートに分離し、パートごとにミュート・ソロ・音量を変えて練習できる Web アプリです。各パートと自分で作ったミックスは MP3 で保存できます。分離はブラウザの中で行い、曲はアップロードしません。

**▶ https://ktkwmr.com/bandstemmixer/** (日本語: https://ktkwmr.com/bandstemmixer/ja/)

## Features / 機能

- **4 stems**: vocals, drums, bass, other (guitar, keys, and the rest) — with [Demucs](https://github.com/facebookresearch/demucs) `htdemucs` (ONNX export [`timcsy/demucs-web-onnx`](https://huggingface.co/timcsy/demucs-web-onnx) and the STFT code of [demucs-web](https://github.com/timcsy/demucs-web)), run by [ONNX Runtime Web](https://onnxruntime.ai/) in a worker
  4 パート分離（Demucs htdemucs を ONNX Runtime Web でブラウザ内実行。STFT は demucs-web の JavaScript）
- **Mixer**: fader, mute (M), and solo (S) per part, master volume, level meters, seek, keyboard shortcuts; the parts play in sample-accurate sync (AudioWorklet)
  パートごとのフェーダー・ミュート・ソロ、全体の音量、レベルメーター、シーク、キーボード操作。AudioWorklet でぴったりそろえて再生
- **Harmony**: “Find chords & make harmony” estimates the key and chords (from bass + other), follows the vocal melody, and adds two parts: the vocals pitch-shifted to a harmony a 3rd or a 5th above or below (TD-PSOLA) and a guide tone of the same notes. The chords, the melody, and the harmony notes scroll above the faders. Once made, the button becomes “Remake the harmony”. Chords can be edited (tap a chord name; root, type, split at the play position); “Remake the harmony” then uses them. Plain JavaScript in a worker (`harmony.js`), no AI model or download
  「コード推定＆ハモリ生成」で、キーとコード（ベースとその他から）を推定し、ボーカルの旋律を追って、3 度または 5 度上（下）のハモリを 2 パート（ピッチシフトしたボーカルの声と、同じ音のガイド音）として足す。コード・旋律・ハモリの音はフェーダーの上に流れて表示。一度作るとボタンは「ハモリを再生成」になる。コードは編集でき（コード名をタップ。ルート・種類・再生位置で分ける）、「ハモリを再生成」でそのコードを使う。ワーカー（`harmony.js`）の JavaScript だけで、AI モデルもダウンロードも使わない
- **Key change**: ±12 semitones for every part except the drums, with the chords and the harmony; same tempo. A phase vocoder in workers (`keyshift.js`, one per part, in parallel). Saved MP3 files of moved parts say the key in the name
  ドラム以外のキーを ±12 半音まで変える（テンポはそのまま）。コード表示とハモリも一緒に変わる。ワーカー（`keyshift.js`、パートごとに並行）のフェーズボコーダー。キーを変えたパートの MP3 はファイル名にキーが入る
- **Save**: each part, or the current mix, as a 192 kbps MP3 (44.1 kHz stereo), encoded in a worker (`encoder.js`) with [lamejs](https://github.com/shijinyu/lamejs) (LAME, LGPL-3.0)
  各パートと現在のミックスを MP3（192 kbps・44.1 kHz ステレオ）で保存。変換はワーカー（`encoder.js`）で lamejs（LAME、LGPL-3.0）を使う
- **Large-download warning**: the first separation downloads the model (about 172 MB) plus the engine (about 14 MB, or 27 MB with WebGPU). If the browser reports mobile data or Data Saver (`navigator.connection`, Chrome on Android), or cannot tell the connection type on a phone or tablet (iPhone, iPad, Firefox), the app asks before downloading. Once the model is saved, it does not ask again
  初回は AI モデル（約 172 MB）と分離のプログラム（約 14 MB、WebGPU 版は約 27 MB）をダウンロード。モバイルデータ通信・データセーバーのとき、またはスマホ・タブレットで接続の種類が分からないとき（iPhone・iPad・Firefox）は、ダウンロード前にダイアログで確認。モデルを保存したあとは確認しない
- The model is kept in Cache Storage (`bandstemmixer-model-v2`), so it is downloaded once. ⚙ → “Delete the AI model” removes it; “Reset mixer” resets the mixer settings
  モデルは Cache Storage に保存し、ダウンロードは 1 回だけ。⚙ →「AI モデルを削除」で消せる。「ミキサーを元に戻す」でミキサーの設定を初期状態に戻す
- Uses the **GPU (WebGPU)** when the browser has it; on the CPU it uses several threads when the page is cross-origin isolated
  WebGPU があれば GPU で処理。CPU ではクロスオリジン分離により複数スレッドで処理
- Songs up to 12 minutes; most formats the browser can decode (MP3, WAV, M4A/AAC, FLAC, Ogg…)
  12 分まで。ブラウザで再生できる形式（MP3・WAV・M4A・FLAC・Ogg など）
- **Installable PWA**, English / Japanese UI (`/bandstemmixer/ja/`, `?lang=en|ja`)
  ホーム画面に追加でき、英語・日本語に対応

### How separation works / 分離の仕組み

`separator.js` (module worker) cuts the song into 7.8 s chunks (343,980 samples at 44.1 kHz, the fixed input of the exported graph) that overlap by a quarter and are cross-faded. For each chunk, `dsp.js` makes the waveform and spectrogram inputs, the model returns a time-domain and a frequency-domain output, and `dsp.js` turns the frequency output back into sound (inverse STFT) and adds it to the time output. `dsp.js` gives exactly the same numbers as demucs-web's `prepareModelInput` / `standaloneMask` / `standaloneIspec` (it uses demucs-web's FFT), but reuses its buffers for every chunk: demucs-web allocates about 150 MB per chunk, which made an iPhone close the tab partway through a song. Model output order: drums, bass, other, vocals. The result is 16-bit PCM in `SharedArrayBuffer`s, shared with the player (`mixer.js`, an AudioWorklet) without copying. With WebGPU it runs on the GPU (falling back to the CPU inside ONNX Runtime); if the first try fails, it retries once in a fresh worker on one CPU thread with settings that use less memory.
`separator.js` が曲を 7.8 秒ずつ 1/4 重ねて区切り、`dsp.js` でモデルの入力（波形とスペクトログラム）を作ってモデルに通し、周波数側の出力を逆 STFT で音に戻して時間側の出力に足します。`dsp.js` は demucs-web の関数と同じ値を出しますが（FFT は demucs-web のもの）、作業用の配列を使い回します（demucs-web は区間ごとに約 150 MB を確保し、iPhone では曲の途中でタブが落ちた）。重なりはクロスフェードでつなぎます。結果は 16 bit の PCM で、プレーヤー（`mixer.js`）とコピーせずに共有します。WebGPU があれば GPU で動かし、失敗したら新しいワーカーで CPU 1 スレッド・メモリ節約の設定でやり直します。

The page is cross-origin isolated (`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp` in `public/_headers`). Every cross-origin file must be loaded with CORS (module scripts and `fetch` are).

## Privacy / プライバシー

- The song is read, separated, and played only in your browser. It is never uploaded. Saving MP3 files only saves them on your device. No accounts, cookies, ads, or microphone.
- To separate, the browser downloads the AI model from **Hugging Face** and ONNX Runtime Web, demucs-web, and (when saving) lamejs from **jsDelivr** (they receive the IP address and browser information, as with any download; nothing about the song).
- Saved in the browser: the model, mixer settings, and the app files for offline use.
- The site is hosted on Cloudflare (standard access logs). Page views are counted with Cloudflare Web Analytics, which uses no cookies.
- 曲の読み込み・分離・再生はブラウザ内だけで行い、アップロードしません。MP3 の保存も端末に保存するだけです。アカウント・Cookie・広告・マイクはありません。
- 分離のため、ブラウザが **Hugging Face** から AI モデルを、**jsDelivr** から ONNX Runtime Web・demucs-web・（保存するときは）lamejs をダウンロードします（通常のダウンロードと同じく IP アドレス等が届きます。曲の情報は送りません）。
- ブラウザに保存するもの: AI モデル、ミキサーの設定、オフライン用のアプリのファイル。
- サイトは Cloudflare で配信しています（標準的なアクセスログ）。閲覧数は Cookie を使わない Cloudflare Web Analytics で集計しています。

Full policy: `/bandstemmixer/privacy/` (`/bandstemmixer/ja/privacy/`). Operator: `/bandstemmixer/about/`.

## Guides / ガイド記事

`/bandstemmixer/<slug>/` (`/bandstemmixer/ja/<slug>/`): `guide` (how to use), `minus-one` (practicing with your part removed), `learn-by-ear` (hearing the bass and drums), `how-it-works` (how AI separation works), `better-results` (tips), `faq`. Written in `scripts/pages/<slug>.mjs`; values shared with the app (model size, song length limit, fader range, MP3 bitrate) are read from the app's files by `scripts/pages/app.mjs`. Before an article change is merged, a person reads it on the PR preview (`docs/article-review.md`).
使い方・マイナスワン・耳コピ・仕組み・コツ・FAQ の 6 本。記事を変えたら、マージ前に PR のプレビューで人間が内容を確認します。

## Project structure / 構成

```
public/
  _headers                      # security headers (CSP, COOP / COEP, etc.)
  404.html                      # page for unknown URLs under /bandstemmixer/ (status 404)
  bandstemmixer/
    index.html                  # the app (HTML / CSS / JS, English and Japanese text)
    separator.js                # module worker: downloads / caches the model, runs the separation
    dsp.js                      # STFT / inverse STFT for each chunk (buffers reused)
    mixer.js                    # AudioWorklet: plays and mixes the 4 parts (6 with the harmony)
    harmony.js                  # worker: key, chords, vocal melody, harmony voice and guide tone
    keyshift.js                 # worker: key change of one part (phase vocoder)
    encoder.js                  # worker: makes the MP3 files (lamejs)
    ja/index.html               # Japanese page, generated from index.html (do not edit)
    about/ privacy/ guide/ … ja/…  # info pages and guides, generated from scripts/pages/ (do not edit)
    images/guide/               # guide screenshots, made by scripts/render-guide-images.mjs
    sitemap.xml                 # generated by scripts/build-pages.mjs (do not edit)
    sw.js  manifest.json  icons/  og-image.png  THIRD_PARTY_LICENSES.md
scripts/
  build-ja.mjs  build-pages.mjs  pages/  update-third-party-licenses.mjs  build-preview.mjs
  render-guide-images.mjs  guide-song.mjs   # guide screenshots (a made-up song, no AI model needed)
  og-image.html  render-og-image.mjs  render-icons.mjs
wrangler.jsonc                  # Cloudflare Workers (static assets, route ktkwmr.com/bandstemmixer*)
CLAUDE.md  docs/baseline-status.md
```

This Worker only serves `/bandstemmixer/*`; the domain root belongs to the `ktkwmr-home` Worker ([ktkwmr/ktkwmr.com](https://github.com/ktkwmr/ktkwmr.com)).
When you load anything from a new external host, add it to the CSP in `public/_headers` and update the privacy text.

## Development / 開発

Serve `public/` with the headers in `public/_headers` and open `/bandstemmixer/`. Opening `index.html` as a `file://` URL does not work (Service Worker, module worker, AudioWorklet). Without the COOP / COEP headers (for example `npx serve public`) the app still works, but on a single CPU thread.
`file://` で直接開くと動きません。`public/_headers` のヘッダーを付けて配信してください（`npx serve public` でも動きますが、CPU 1 スレッドになり遅くなります）。

```sh
npx wrangler dev        # http://localhost:8787/bandstemmixer/ (also runs the generators and applies _headers)
```

If the app shows an old version, reload (or restart the installed app). 古い画面が出るときは再読み込みしてください。

To change the model or the library versions, update `MODEL_URL` / `MODEL_CACHE` in both `index.html` and `separator.js`, `ORT_BASE` / `DEMUCS_WEB` in `separator.js`, and `CDN` / `KEEP` in `sw.js` together. Bump `MODEL_CACHE` (`-v3`) when the model file changes, so old copies are not used.

## Deploy / デプロイ

Cloudflare Workers static assets. With Workers Builds connected, a push to `main` deploys; other branches get preview builds. By hand: `npx wrangler deploy`.

## Generated files / 生成ファイル

Edit only `public/bandstemmixer/index.html`, `separator.js`, `dsp.js`, `mixer.js`, `encoder.js`, `harmony.js`, `keyshift.js`, `sw.js`, and `scripts/`. `ja/index.html`, the info pages, and `sitemap.xml` are generated by `wrangler deploy` / `wrangler dev` and by the **Build generated pages** workflow on push to `main`:

```sh
node scripts/build-ja.mjs             # regenerate ja/index.html
node scripts/build-pages.mjs          # regenerate the info pages and sitemap.xml
node scripts/build-ja.mjs --check     # exit 1 if out of date (same for build-pages.mjs)
```

The guide screenshots are made with `node scripts/render-guide-images.mjs` (needs Playwright: `npm install --no-save playwright && npx playwright install chromium`). It plays a made-up song (`scripts/guide-song.mjs`) and replaces `separator.js` with a stand-in that returns the song's parts, so the AI model is not needed. Re-run it when the app's look changes.
画面写真は `node scripts/render-guide-images.mjs` で撮り直します（架空の曲を使い、AI モデルは不要）。

`THIRD_PARTY_LICENSES.md` gets new CDN libraries from `scripts/update-third-party-licenses.mjs` (run by the **Update third-party licenses** workflow). The model entry (Demucs, with the note that its weights are not MIT) is written by hand.

## License / ライセンス

MIT © 2026 ktkwmr. ONNX Runtime Web (© Microsoft Corporation) and demucs-web (timcsy) are MIT licensed, and lamejs (LAME) is LGPL-3.0, loaded unmodified as a separate file; see `public/bandstemmixer/THIRD_PARTY_LICENSES.md`.

**The AI model's weights are not MIT.** Demucs' code is MIT (© Meta Platforms, Inc. and affiliates), but Meta provides the pretrained weights for scientific purposes only ([facebookresearch/demucs#327](https://github.com/facebookresearch/demucs/issues/327)). Keep this app non-commercial (no ads, no paid features) while it uses them; monetizing it needs a separation model whose weights allow commercial use. The weights are downloaded by the browser from Hugging Face and are not in this repository.
AI モデルの重みは MIT ではありません。Demucs のコードは MIT ですが、学習済みの重みは Meta が科学研究目的に限って提供しています。この重みを使う間はアプリを非営利（広告・有料機能なし）にしてください。収益化するには、商用利用できる重みの分離モデルに替える必要があります。

// How to use the app. Screenshots: node scripts/render-guide-images.mjs
import { MODEL_MB, ENGINE_MB, MAX_MIN, MAX_MIN_LOW_MEM, FADER_MAX, KBPS } from "./app.mjs";
import { img } from "./shots.mjs";

const FIRST_MB = MODEL_MB + ENGINE_MB.cpu;

export default {
  slug: "guide",
  en: {
    title: "How to Use Band Stem Mixer: Split a Song into Parts and Mix Them",
    heading: "How to use Band Stem Mixer",
    nav: "How to use (guide)",
    description:
      "Step-by-step guide to Band Stem Mixer: choose a song, separate it into vocals, drums, bass, and other with AI in your browser, mute, solo, and mix the parts, change the key, see the chords, make a harmony part, and save MP3 files.",
    body: () => `
<p class="lead">Band Stem Mixer splits a song into four parts with AI — vocals, drums, bass, and other — and lets you mix them for practice. This guide walks through every part of the screen.</p>

<nav class="toc" aria-label="Contents"><b>Contents</b><ol>
  <li><a href="#quick">Start in three steps</a></li>
  <li><a href="#song">Choosing a song and separating it</a></li>
  <li><a href="#first">The first time: downloading the AI model</a></li>
  <li><a href="#mixer">The mixer</a></li>
  <li><a href="#harmony">Key, chords, and harmony</a></li>
  <li><a href="#save">Saving MP3 files</a></li>
  <li><a href="#phone">On a phone or tablet</a></li>
  <li><a href="#keys">Keyboard shortcuts</a></li>
  <li><a href="#data">What is kept on your device</a></li>
</ol></nav>

<h2 id="quick">Start in three steps</h2>
<ol>
  <li><b>Choose a song.</b> Tap “Choose an audio file” and pick an MP3, WAV, M4A, or FLAC file, or drop it on the box.</li>
  <li><b>Press “Separate into 4 parts”.</b> Wait until the bar is full. Keep the screen open.</li>
  <li><b>Press play and mix.</b> Mute your own part with <b>M</b> and play along with the rest of the band.</li>
</ol>

<h2 id="song">Choosing a song and separating it</h2>
<figure class="shot">
  ${img("en", "song", "The song panel: a box to choose an audio file, the chosen file practice-song.wav (1:00, stereo), the Separate into 4 parts button, and a note that the AI model of about 172 MB is downloaded the first time. Numbers 1 to 4 mark them.")}
  <figcaption>The numbers match the list below. Tap the image to enlarge it.</figcaption>
</figure>
<ol>
  <li><b>Choose an audio file</b> – Any format your browser can play: MP3, WAV, M4A (AAC), FLAC, Ogg, and others. Songs up to ${MAX_MIN} minutes (${MAX_MIN_LOW_MEM} minutes on phones and tablets, which have less memory). The file is read in your browser and never uploaded.</li>
  <li><b>The song</b> – The file name, the length, and whether it is stereo or mono.</li>
  <li><b>Separate into 4 parts</b> – Starts the separation. After it finishes, the button becomes “Separate again”.</li>
  <li><b>The AI model</b> – Whether the AI model is already saved on this device. If not, it is downloaded when you press the button.</li>
</ol>
<figure class="shot">
  ${img("en", "progress", "Separation in progress: the bar shows 4 of 11 sections done, about 40 seconds left, with a Cancel button, a note to keep the screen open, and the line Separating with: GPU (WebGPU).")}
  <figcaption>While it separates. The song is cut into short sections (about 7.8 seconds each) and the bar counts them.</figcaption>
</figure>
<p>The bar shows how many sections are done and about how long is left. How long it takes depends on the device: on a recent computer, about the length of the song or a few times longer; on a phone, longer. The line under the bar shows how the separation runs: on the <b>GPU (WebGPU)</b> when the browser supports it, otherwise on the CPU.</p>
<div class="note"><p>Keep the screen open until it finishes. On a phone, separation stops when the screen turns off or you switch to another app. If it stops with a memory error, the app tries again with settings that use less memory.</p></div>

<h2 id="first">The first time: downloading the AI model</h2>
<p>The first time you separate a song, the browser downloads the AI model (about ${MODEL_MB} MB) and the separation engine (about ${ENGINE_MB.cpu} MB, or ${ENGINE_MB.gpu} MB with the GPU). They are kept on your device, so the next time there is no download and the song panel says “The AI model is saved on this device”.</p>
<figure class="shot phone">
  ${img("en", "network", "On a phone, a dialog asks: Are you on Wi-Fi? This browser does not tell the app whether you are on Wi-Fi or mobile data. Download: about 186 MB, only the first time. Buttons: Not now, and Download and separate.", { half: true })}
  <figcaption>On a phone or tablet, the app asks before the first download.</figcaption>
</figure>
<p>Because the download is large (about ${FIRST_MB} MB in all), the app asks first when you seem to be on mobile data or have Data Saver on, and on phones and tablets whose browser does not say what kind of connection it has (such as iPhone and iPad). Choose “Not now” and connect to Wi-Fi if you are not on Wi-Fi.</p>
<p>To free the space, open ⚙ → “Delete the AI model”. It is downloaded again the next time you separate a song.</p>

<h2 id="mixer">The mixer</h2>
<figure class="shot">
  ${img("en", "mixer", "The mixer while playing: the stop button and the position bar at 0:21 of 1:00, the key control and the Find chords & make harmony button, four rows for Vocals (at 80%), Bass (muted), Drums, and Other (guitar, keys…), each with a level meter, M and S buttons, a fader, and a save button, and under them the Master fader, Reset mixer, and Save this mix (MP3). Numbers 1 to 10 mark the controls.")}
  <figcaption>Here the bass is muted (M), as a bass player would for practice, and the vocals are turned down to 80%.</figcaption>
</figure>
<ol>
  <li><b>Play / Stop</b> – The button shows ■ while it plays. Press it again to stop; the next play starts from where it stopped.</li>
  <li><b>Position</b> – Drag to move through the song.</li>
  <li><b>The part and its level</b> – The bar under the name moves with the sound of that part.</li>
  <li><b>M (mute)</b> – Silences that part. Here the bass is muted.</li>
  <li><b>S (solo)</b> – Plays only the parts whose S is on. You can solo more than one part, for example bass and drums together. While any S is on, M is ignored.</li>
  <li><b>Fader</b> – The volume of the part, from 0% to ${FADER_MAX}%.</li>
  <li><b>↓ (save the part)</b> – Saves that part alone as an MP3 file.</li>
  <li><b>Master</b> – The volume of the whole mix.</li>
  <li><b>Reset mixer</b> – Puts every part back to 100% and unmuted (the harmony guide tone back to muted).</li>
  <li><b>Save this mix (MP3)</b> – Saves what you hear now as one MP3 file.</li>
</ol>
<p>The faders, M, and the master volume are remembered for next time; S is not, so you never start in solo by mistake.</p>
<p>Between the play button and the parts are the key control and “Find chords &amp; make harmony”, explained in the next section.</p>
<p>For practice ideas, see <a href="../minus-one/">practicing with your part removed</a> and <a href="../learn-by-ear/">hearing the bass and drums clearly</a>.</p>

<h2 id="harmony">Key, chords, and harmony</h2>
<figure class="shot">
  ${img("en", "harmony", "The mixer after making a harmony: the key control, the Remake the harmony button and the part, BPM 120, a scrolling view of the chords, the vocal melody, and the harmony notes, and two added rows, Harmony (voice) and Harmony guide tone. Numbers 1 to 7 mark them.")}
  <figcaption>After “Find chords &amp; make harmony”. The numbers match the list below.</figcaption>
</figure>
<ol>
  <li><b>Key (all but drums)</b> – − and + move the vocals, bass, and other by a semitone, up to an octave either way. The tempo and the drums stay the same.</li>
  <li><b>Find chords &amp; make harmony</b> – Finds the tempo, the chord on every beat, and the vocal melody, and makes a harmony part. After the first time it says “Remake the harmony”.</li>
  <li><b>The harmony part</b> – a 3rd or a 5th, above or below the melody.</li>
  <li><b>BPM</b> – the tempo found in the song.</li>
  <li><b>The view</b> – chord names on top (tap a beat there to change the chord), the vocal melody as a grey line, and the harmony notes as black bars. Drag it sideways to look ahead; tap it to jump there.</li>
  <li><b>Harmony (voice)</b> – the vocals moved to the harmony notes.</li>
  <li><b>Harmony guide tone</b> – the same notes as a plain tone. It starts muted; press its M to hear it.</li>
</ol>
<p>All of this runs in your browser without the AI model. For more, see <a href="../harmony/">practicing harmonies</a> and <a href="../chords-and-key/">chords and key change</a>.</p>

<h2 id="save">Saving MP3 files</h2>
<ul>
  <li><b>Each part</b> – The ↓ button on each row saves that part, as it was separated (the fader and M do not change it).</li>
  <li><b>Your mix</b> – “Save this mix (MP3)” saves what you hear now: the faders, M, S, and the master volume.</li>
  <li><b>Harmony</b> – The two harmony parts have ↓ buttons too.</li>
  <li>The files are ${KBPS} kbps MP3 (44.1 kHz stereo), named after the song, for example <code>practice-song - Bass.mp3</code>. When the key is changed, the name says so: <code>practice-song - Bass (key +2).mp3</code>.</li>
  <li>The separated parts, the chords, and the harmony are not kept in the app. When you reload the page or choose another song, they are gone: save the files you want to keep, or separate the song again.</li>
</ul>
<p>Saved MP3 files play on any device. You can separate a song on a computer and practice with the files on your phone.</p>

<h2 id="phone">On a phone or tablet</h2>
<figure class="shot phone">
  ${img("en", "phone", "Band Stem Mixer on a phone: the mixer with the play button, the position, and the four parts, each with M, S, save, and a fader below the name.", { half: true })}
  <figcaption>On a narrow screen, each part's fader is under its name.</figcaption>
</figure>
<p>The mixer works the same on a phone. Separation needs a lot of memory, though: phones and tablets take longer, take songs up to ${MAX_MIN_LOW_MEM} minutes, and some cannot finish at all.</p>
<div class="note"><p><b>iPhone and iPad:</b> separation may stop partway because the device runs out of memory; the page then reloads. The app remembers the setting that stopped and uses another one next time. If it keeps stopping, separate the song on a computer and play the saved MP3 files on the iPhone.</p></div>

<h2 id="keys">Keyboard shortcuts</h2>
<div class="table-wrap">
  <table class="text stack">
    <thead><tr><th scope="col">Key</th><th scope="col">Action</th></tr></thead>
    <tbody>
      <tr><th scope="row"><code>Space</code></th><td>Play / stop</td></tr>
      <tr><th scope="row"><code>1</code>–<code>6</code></th><td>Mute or unmute vocals, bass, drums, other (and 5, 6: the harmony voice and guide tone, once made)</td></tr>
      <tr><th scope="row"><code>←</code> <code>→</code></th><td>5 seconds back / forward</td></tr>
    </tbody>
  </table>
</div>

<h2 id="data">What is kept on your device</h2>
<ul>
  <li>The AI model and the separation engine (so they are downloaded once).</li>
  <li>The mixer settings: each part's fader and mute, and the master volume.</li>
  <li>The app itself, so it opens without a connection. You can add it to your home screen.</li>
</ul>
<p>Your song, the separated parts, the chords, and the harmony are not saved and are never uploaded. See the <a href="../privacy/">privacy policy</a>.</p>
`,
  },
  ja: {
    title: "Band Stem Mixer の使い方：曲をパートに分離してミックスする",
    heading: "Band Stem Mixer の使い方",
    nav: "使い方ガイド",
    description:
      "Band Stem Mixer の使い方を画面写真つきで解説。曲を選んで AI でボーカル・ドラム・ベース・その他に分離し、パートごとにミュート・ソロ・音量を変え、キーの変更・コード表示・ハモリ作りをして、MP3 で保存するまで。",
    body: () => `
<p class="lead">Band Stem Mixer は、曲を AI でボーカル・ドラム・ベース・その他の 4 つのパートに分け、パートごとに音量を変えて練習できるアプリです。このガイドでは、画面の各部分を順に説明します。</p>

<nav class="toc" aria-label="目次"><b>目次</b><ol>
  <li><a href="#quick">3 ステップで始める</a></li>
  <li><a href="#song">曲を選んで分離する</a></li>
  <li><a href="#first">初回は AI モデルをダウンロード</a></li>
  <li><a href="#mixer">ミキサー</a></li>
  <li><a href="#harmony">キー・コード・ハモリ</a></li>
  <li><a href="#save">MP3 で保存する</a></li>
  <li><a href="#phone">スマホ・タブレットで使う</a></li>
  <li><a href="#keys">キーボード操作</a></li>
  <li><a href="#data">端末に保存されるもの</a></li>
</ol></nav>

<h2 id="quick">3 ステップで始める</h2>
<ol>
  <li><b>曲を選ぶ。</b>「音声ファイルを選ぶ」を押して MP3・WAV・M4A・FLAC などのファイルを選ぶか、枠にドロップします。</li>
  <li><b>「4 つのパートに分離する」を押す。</b>バーがいっぱいになるまで待ちます。画面は開いたままにしてください。</li>
  <li><b>再生してミックスする。</b>自分のパートを <b>M</b> でミュートして、ほかのパートに合わせて演奏します。</li>
</ol>

<h2 id="song">曲を選んで分離する</h2>
<figure class="shot">
  ${img("ja", "song", "曲のパネル。音声ファイルを選ぶ枠、選んだファイル（練習曲.wav、1:00、ステレオ）、「4 つのパートに分離する」ボタン、AI モデル（約 172 MB）は最初に分離するときにダウンロードするという案内。1〜4 の番号付き。")}
  <figcaption>番号は下の説明と対応しています。画像を押すと拡大します。</figcaption>
</figure>
<ol>
  <li><b>音声ファイルを選ぶ</b> – ブラウザで再生できる形式なら使えます（MP3・WAV・M4A（AAC）・FLAC・Ogg など）。長さは ${MAX_MIN} 分まで（メモリの少ないスマホ・タブレットでは ${MAX_MIN_LOW_MEM} 分まで）。ファイルはブラウザの中で読み込み、アップロードしません。</li>
  <li><b>曲</b> – ファイル名と長さ、ステレオかモノラルか。</li>
  <li><b>4 つのパートに分離する</b> – 分離を始めます。終わると「もう一度分離する」に変わります。</li>
  <li><b>AI モデル</b> – AI モデルがこの端末に保存済みかどうか。まだなら、ボタンを押したときにダウンロードします。</li>
</ol>
<figure class="shot">
  ${img("ja", "progress", "分離中の画面。バーは 11 区間のうち 4 区間が完了、残り約 40 秒、キャンセルボタン、画面を開いたままにする案内、「分離に使っている設定：GPU（WebGPU）」の表示。")}
  <figcaption>分離中の画面。曲を約 7.8 秒ずつの区間に分けて処理し、バーはその数を数えます。</figcaption>
</figure>
<p>バーには、終わった区間の数と残り時間の目安が出ます。かかる時間は端末によって違い、最近のパソコンで曲の長さと同じくらいから数倍、スマホではさらにかかります。バーの下には分離の方法が出ます。ブラウザが対応していれば <b>GPU（WebGPU）</b>、そうでなければ CPU で処理します。</p>
<div class="note"><p>終わるまで画面を開いたままにしてください。スマホでは、画面が消えたりほかのアプリに切り替えたりすると分離が止まります。メモリ不足で止まったときは、メモリを節約する設定で自動的にやり直します。</p></div>

<h2 id="first">初回は AI モデルをダウンロード</h2>
<p>最初に分離するときに、AI モデル（約 ${MODEL_MB} MB）と分離のプログラム（約 ${ENGINE_MB.cpu} MB、GPU を使う場合は約 ${ENGINE_MB.gpu} MB）をダウンロードします。端末に保存するので、2 回目からはダウンロードせず、曲のパネルに「AI モデルはこの端末に保存済みです」と出ます。</p>
<figure class="shot phone">
  ${img("ja", "network", "スマホで最初の分離の前に出るダイアログ。「Wi-Fi に接続していますか？」の見出しと、ダウンロード量（約 186 MB、初回のみ）、「やめておく」と「ダウンロードして分離する」のボタン。", { half: true })}
  <figcaption>スマホ・タブレットでは、最初のダウンロードの前に確認が出ます。</figcaption>
</figure>
<p>ダウンロード量が大きい（合わせて約 ${FIRST_MB} MB）ので、モバイルデータ通信やデータセーバーのとき、また接続の種類が分からないスマホ・タブレット（iPhone・iPad など）では、ダウンロードの前に確認します。Wi-Fi でなければ「やめておく」を選び、Wi-Fi につないでから分離してください。</p>
<p>容量を空けたいときは、⚙ →「AI モデルを削除」で消せます。次に分離するときにもう一度ダウンロードします。</p>

<h2 id="mixer">ミキサー</h2>
<figure class="shot">
  ${img("ja", "mixer", "再生中のミキサー。停止ボタンと再生位置（1:00 のうち 0:21）、キーの − ＋ と「コード推定＆ハモリ生成」ボタン、ボーカル（80%）・ベース（ミュート）・ドラム・その他（ギター・鍵盤など）の 4 行に、それぞれレベルメーター、M と S のボタン、フェーダー、保存ボタン。下に全体の音量、「ミキサーを元に戻す」「このミックスを保存（MP3）」。1〜10 の番号付き。")}
  <figcaption>ベーシストの練習のように、ベースをミュート（M）し、ボーカルを 80% に下げたところ。</figcaption>
</figure>
<ol>
  <li><b>再生・停止</b> – 再生中は ■ になります。もう一度押すと止まり、次の再生は止めた位置から始まります。</li>
  <li><b>再生位置</b> – ドラッグして曲の中を移動します。</li>
  <li><b>パートとレベル</b> – 名前の下のバーが、そのパートの音に合わせて動きます。</li>
  <li><b>M（ミュート）</b> – そのパートを消します。ここではベースをミュートしています。</li>
  <li><b>S（ソロ）</b> – S を押したパートだけを鳴らします。ベースとドラムのように、複数のパートをソロにできます。S が 1 つでもオンの間は、M は無視されます。</li>
  <li><b>フェーダー</b> – パートの音量（0〜${FADER_MAX}%）。</li>
  <li><b>↓（パートを保存）</b> – そのパートだけを MP3 ファイルで保存します。</li>
  <li><b>全体</b> – ミックス全体の音量。</li>
  <li><b>ミキサーを元に戻す</b> – すべてのパートを 100%・ミュートなしに戻します（ハモリのガイド音はミュートに戻します）。</li>
  <li><b>このミックスを保存（MP3）</b> – いま聞こえている音を 1 つの MP3 ファイルで保存します。</li>
</ol>
<p>フェーダー・M・全体の音量は次回も残ります。S は残らないので、うっかりソロのまま始まることはありません。</p>
<p>再生ボタンとパートの間にある「キー」と「コード推定＆ハモリ生成」は、次の節で説明します。</p>
<p>練習のしかたは、<a href="../minus-one/">自分のパートを消して練習する</a>と<a href="../learn-by-ear/">ベースとドラムを聞き取る</a>を見てください。</p>

<h2 id="harmony">キー・コード・ハモリ</h2>
<figure class="shot">
  ${img("ja", "harmony", "ハモリを作ったあとのミキサー。キーの − と ＋、「ハモリを再生成」ボタンとパート、BPM 120、コード・ボーカルの音程・ハモリの音が流れる表示、増えた 2 行「ハモリ（声）」「ハモリのガイド音」。1〜7 の番号付き。")}
  <figcaption>「コード推定＆ハモリ生成」を押したあと。番号は下の説明と対応しています。</figcaption>
</figure>
<ol>
  <li><b>キー（ドラム以外）</b> – − と ＋ で、ボーカル・ベース・その他を半音ずつ、上下 1 オクターブまで動かします。テンポとドラムは変わりません。</li>
  <li><b>コード推定＆ハモリ生成</b> – テンポ、拍ごとのコード、ボーカルの旋律を推定し、ハモリのパートを作ります。2 回目からは「ハモリを再生成」になります。</li>
  <li><b>ハモリのパート</b> – 旋律の 3 度か 5 度の、上か下か。</li>
  <li><b>BPM</b> – 曲から推定したテンポ。</li>
  <li><b>表示</b> – 上の段にコード名（拍をタップするとコードを変えられます）、灰色の線がボーカルの音程、黒い帯がハモリの音。横にドラッグすると先を見られ、タップするとその位置に移ります。</li>
  <li><b>ハモリ（声）</b> – ボーカルをハモリの音程に変えたもの。</li>
  <li><b>ハモリのガイド音</b> – 同じ音を単純な音で鳴らしたもの。最初はミュートなので、聞くときは M を押します。</li>
</ol>
<p>これらはすべて、AI モデルを使わずにブラウザの中で処理します。詳しくは<a href="../harmony/">ハモリの練習</a>と<a href="../chords-and-key/">コード表示とキー変更</a>をご覧ください。</p>

<h2 id="save">MP3 で保存する</h2>
<ul>
  <li><b>パートごと</b> – 各行の ↓ ボタンで、そのパートを分離したままの音で保存します（フェーダーや M は反映しません）。</li>
  <li><b>自分のミックス</b> – 「このミックスを保存（MP3）」で、いま聞こえている音（フェーダー・M・S・全体の音量）を保存します。</li>
  <li><b>ハモリ</b> – ハモリの 2 つのパートにも ↓ ボタンがあります。</li>
  <li>ファイルは ${KBPS} kbps の MP3（44.1 kHz ステレオ）で、名前は曲名から付けます（例：<code>練習曲 - ベース.mp3</code>）。キーを変えたときは名前に入ります（例：<code>練習曲 - ベース（キー +2）.mp3</code>）。</li>
  <li>分離したパート・コード・ハモリはアプリに残りません。ページを読み込み直したり別の曲を選んだりすると消えるので、残したいものは保存するか、もう一度分離してください。</li>
</ul>
<p>保存した MP3 はどの端末でも再生できます。パソコンで分離して、スマホでそのファイルを使って練習することもできます。</p>

<h2 id="phone">スマホ・タブレットで使う</h2>
<figure class="shot phone">
  ${img("ja", "phone", "スマホでの Band Stem Mixer。再生ボタンと再生位置、4 つのパートの行に M・S・保存ボタン、名前の下にフェーダー。", { half: true })}
  <figcaption>幅の狭い画面では、各パートのフェーダーが名前の下に並びます。</figcaption>
</figure>
<p>ミキサーはスマホでも同じように使えます。ただし分離にはメモリをたくさん使うので、スマホ・タブレットでは時間がかかり、曲の長さは ${MAX_MIN_LOW_MEM} 分までで、端末によっては最後まで分離できません。</p>
<div class="note"><p><b>iPhone・iPad：</b>メモリが足りずに分離が途中で止まり、ページが読み込み直されることがあります。アプリは止まった設定を覚えて、次は別の設定で分離します。何度も止まるときは、パソコンで分離して、保存した MP3 を iPhone で再生してください。</p></div>

<h2 id="keys">キーボード操作</h2>
<div class="table-wrap">
  <table class="text stack">
    <thead><tr><th scope="col">キー</th><th scope="col">操作</th></tr></thead>
    <tbody>
      <tr><th scope="row"><code>Space</code></th><td>再生・停止</td></tr>
      <tr><th scope="row"><code>1</code>〜<code>6</code></th><td>ボーカル・ベース・ドラム・その他のミュートの切り替え（ハモリを作ったあとは 5・6 でハモリ（声）・ガイド音）</td></tr>
      <tr><th scope="row"><code>←</code> <code>→</code></th><td>5 秒戻る・進む</td></tr>
    </tbody>
  </table>
</div>

<h2 id="data">端末に保存されるもの</h2>
<ul>
  <li>AI モデルと分離のプログラム（ダウンロードは 1 回だけ）。</li>
  <li>ミキサーの設定（各パートの音量とミュート、全体の音量）。</li>
  <li>アプリ本体（通信がなくても開けるように）。ホーム画面に追加できます。</li>
</ul>
<p>曲・分離したパート・コード・ハモリは保存せず、アップロードもしません。<a href="../privacy/">プライバシーポリシー</a>もご覧ください。</p>
`,
  },
};

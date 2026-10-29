// Article: tips for a cleaner separation and for separating without trouble (memory, time, files)
import { MAX_MIN, MAX_MIN_LOW_MEM, KBPS, mp3Mb } from "./app.mjs";

const SONG_SEC = 4 * 60; // a 4-minute song, for the file size example
const mb = (x) => Math.round(x * 10) / 10;

export default {
  slug: "better-results",
  en: {
    title: "Tips for Better AI Stem Separation: File Quality, Song Length, and Devices",
    heading: "How to get better separation",
    nav: "Tips for better separation",
    description:
      "Get cleaner parts from AI stem separation: start from the best-quality file, use a computer for long songs, avoid memory errors on phones, and know which songs separate well and which do not.",
    body: () => `
<p class="lead">The separation quality depends mostly on the song itself, but the file you start from and the device you use make a difference too. Here is what helps.</p>

<nav class="toc" aria-label="Contents"><b>Contents</b><ol>
  <li><a href="#file">Start from the best file you have</a></li>
  <li><a href="#songs">Songs that separate well, and songs that do not</a></li>
  <li><a href="#device">Use a computer for long songs</a></li>
  <li><a href="#memory">If it stops partway</a></li>
  <li><a href="#after">After separating</a></li>
</ol></nav>

<h2 id="file">Start from the best file you have</h2>
<ul>
  <li><b>Lossless is best</b> – WAV and FLAC keep every detail. A recording straight from your band's mixing session (the stereo mix) is ideal.</li>
  <li><b>MP3 and AAC are fine at a good bitrate</b> – 256–320 kbps MP3 or 256 kbps AAC (M4A) separates nearly as well. Low-bitrate files (128 kbps or less) have lost high-frequency detail, which shows up as a swishy sound in the separated parts.</li>
  <li><b>Do not convert a lossy file to WAV to “improve” it</b> – what was lost is not restored.</li>
  <li><b>Stereo is better than mono</b> – the difference between the left and right channels is one of the clues the model uses. Mono files work, but separate less cleanly.</li>
  <li><b>Recordings from a phone in the rehearsal room</b> work for practice, but room echo and distortion make the parts blur into each other.</li>
</ul>
<p>Music from streaming services (Apple Music, Spotify, YouTube) cannot be opened: use files you have.</p>

<h2 id="songs">Songs that separate well, and songs that do not</h2>
<div class="table-wrap">
  <table class="text stack">
    <thead><tr><th scope="col">Separates well</th><th scope="col">Harder</th></tr></thead>
    <tbody>
      <tr><td data-label="Well:">A typical band: vocals, guitar or keys, bass, drums</td><td data-label="Harder:">Instruments the model rarely heard: synth bass, orchestral music, unusual percussion</td></tr>
      <tr><td data-label="Well:">A clear, dry mix with space between instruments</td><td data-label="Harder:">Lots of reverb, heavy distortion, very loud (heavily compressed) masters</td></tr>
      <tr><td data-label="Well:">One lead singer</td><td data-label="Harder:">A choir or many layered voices; spoken word over music</td></tr>
      <tr><td data-label="Well:">Studio recordings</td><td data-label="Harder:">Live recordings with crowd noise; old recordings with hiss</td></tr>
    </tbody>
  </table>
</div>
<p>Why these are harder is explained in <a href="../how-it-works/#leak">how AI separation works</a>.</p>

<h2 id="device">Use a computer for long songs</h2>
<ul>
  <li><b>A computer is much faster than a phone</b>, especially with a recent graphics chip and a browser that supports WebGPU (recent Chrome and Edge, for example).</li>
  <li>Songs up to <b>${MAX_MIN} minutes</b> can be separated on a computer, and up to <b>${MAX_MIN_LOW_MEM} minutes</b> on phones and tablets. For a longer recording, such as a whole rehearsal, cut out the song you need first.</li>
  <li><b>Separate on a computer, practice anywhere</b>: save the parts or your mix as MP3 files (about ${mb(mp3Mb(SONG_SEC))} MB for a 4-minute song at ${KBPS} kbps) and play them on your phone.</li>
</ul>

<h2 id="memory">If it stops partway</h2>
<p>Separation needs about 1 GB of memory while it runs. If the device runs short:</p>
<ol>
  <li><b>Close other tabs and apps</b> before you separate, and keep the screen on.</li>
  <li>If an error appears, the app <b>tries again automatically</b> with settings that use less memory.</li>
  <li>If the page reloads by itself, the browser closed it for lack of memory. The app remembers the setting that stopped and uses a lighter one next time: choose the song again and press “Separate into 4 parts”.</li>
  <li>If it still stops — which can happen on iPhone and iPad — <b>separate on a computer</b> and use the saved MP3 files on that device.</li>
</ol>

<h2 id="after">After separating</h2>
<ul>
  <li>If a muted part can still be heard faintly, <b>turn the other parts up a little</b> rather than the volume down: the trace is quieter than the parts around it.</li>
  <li>If a part sounds thin or swishy on its own, listen to it <b>together with one other part</b> (solo two parts): the artifacts are much less noticeable.</li>
  <li>Save the parts you want to keep. They are not kept in the app, and separating again takes the same time.</li>
</ul>
`,
  },
  ja: {
    title: "AI 音源分離をきれいにするコツ：ファイルの音質・曲の長さ・端末",
    heading: "うまく分離するコツ",
    nav: "うまく分離するコツ",
    description:
      "AI の音源分離でパートをきれいに分けるコツ。音質のよいファイルを使う、長い曲はパソコンで、スマホでメモリ不足を避ける方法、分離しやすい曲と難しい曲。",
    body: () => `
<p class="lead">分離の仕上がりはほとんど曲そのもので決まりますが、元のファイルと使う端末でも変わります。効果のあることをまとめました。</p>

<nav class="toc" aria-label="目次"><b>目次</b><ol>
  <li><a href="#file">いちばん音質のよいファイルを使う</a></li>
  <li><a href="#songs">分離しやすい曲・難しい曲</a></li>
  <li><a href="#device">長い曲はパソコンで</a></li>
  <li><a href="#memory">途中で止まるときは</a></li>
  <li><a href="#after">分離したあとに</a></li>
</ol></nav>

<h2 id="file">いちばん音質のよいファイルを使う</h2>
<ul>
  <li><b>可逆圧縮・非圧縮がいちばん</b> – WAV・FLAC は情報がすべて残っています。バンドの録音なら、ミックスダウンしたステレオのファイルが理想です。</li>
  <li><b>MP3・AAC もビットレートが高ければ十分</b> – 256〜320 kbps の MP3 や 256 kbps の AAC（M4A）なら、ほぼ同じように分離できます。128 kbps 以下のファイルは高い音の情報が失われていて、分離したパートにシャリシャリした音が出やすくなります。</li>
  <li><b>MP3 などを WAV に変換しても良くならない</b> – 失われた情報は戻りません。</li>
  <li><b>モノラルよりステレオ</b> – 左右の違いもモデルの手がかりの 1 つです。モノラルでも分離できますが、分かれ方は甘くなります。</li>
  <li><b>スタジオでスマホで録った音</b>でも練習には使えますが、部屋の響きや音割れがあると、パートどうしがにじみます。</li>
</ul>
<p>音楽配信サービス（Apple Music・Spotify・YouTube など）の曲は開けません。手持ちのファイルを使ってください。</p>

<h2 id="songs">分離しやすい曲・難しい曲</h2>
<div class="table-wrap">
  <table class="text stack">
    <thead><tr><th scope="col">分離しやすい</th><th scope="col">難しい</th></tr></thead>
    <tbody>
      <tr><td data-label="しやすい：">一般的なバンド編成（ボーカル・ギターか鍵盤・ベース・ドラム）</td><td data-label="難しい：">学習であまり聞いていない楽器（シンセベース・オーケストラ・珍しい打楽器など）</td></tr>
      <tr><td data-label="しやすい：">楽器どうしの間に余裕のある、すっきりしたミックス</td><td data-label="難しい：">リバーブが深い、歪みが強い、音圧を極端に上げたマスター</td></tr>
      <tr><td data-label="しやすい：">リードボーカルが 1 人</td><td data-label="難しい：">合唱や声を何重にも重ねた曲、音楽の上の語り</td></tr>
      <tr><td data-label="しやすい：">スタジオ録音</td><td data-label="難しい：">歓声の入ったライブ録音、ノイズの多い古い録音</td></tr>
    </tbody>
  </table>
</div>
<p>難しい理由は<a href="../how-it-works/#leak">AI 音源分離の仕組み</a>で説明しています。</p>

<h2 id="device">長い曲はパソコンで</h2>
<ul>
  <li><b>パソコンはスマホよりずっと速く</b>分離できます。最近のグラフィックスを積んだパソコンで、WebGPU に対応したブラウザ（最近の Chrome・Edge など）ならさらに速くなります。</li>
  <li>曲の長さは、パソコンでは <b>${MAX_MIN} 分</b>まで、スマホ・タブレットでは <b>${MAX_MIN_LOW_MEM} 分</b>までです。リハーサル全体の録音のように長いものは、必要な曲だけを切り出してから分離してください。</li>
  <li><b>パソコンで分離して、どこでも練習</b>：パートやミックスを MP3 で保存すれば（${KBPS} kbps で 4 分の曲なら約 ${mb(mp3Mb(SONG_SEC))} MB）、スマホで再生できます。</li>
</ul>

<h2 id="memory">途中で止まるときは</h2>
<p>分離中は約 1 GB のメモリを使います。端末のメモリが足りないときは、</p>
<ol>
  <li>分離の前に<b>ほかのタブやアプリを閉じ</b>、画面を付けたままにします。</li>
  <li>エラーが出たときは、メモリを節約する設定で<b>自動的にやり直します</b>。</li>
  <li>ページが勝手に読み込み直されたときは、メモリ不足でブラウザがページを閉じています。アプリは止まった設定を覚えて、次はより軽い設定を使うので、曲を選び直して「4 つのパートに分離する」を押してください。</li>
  <li>それでも止まるとき（iPhone・iPad で起こることがあります）は、<b>パソコンで分離</b>して、保存した MP3 をその端末で使ってください。</li>
</ol>

<h2 id="after">分離したあとに</h2>
<ul>
  <li>ミュートしたパートがかすかに聞こえるときは、全体の音量を下げるより、<b>ほかのパートを少し上げる</b>と目立たなくなります。残った音は周りのパートより小さいからです。</li>
  <li>1 つのパートだけだと細い・シャリシャリした音に聞こえるときは、<b>もう 1 つのパートと一緒に</b>（2 つをソロにして）聞くと、ノイズがかなり気にならなくなります。</li>
  <li>残したいパートは保存しておきましょう。アプリには残らず、もう一度分離すると同じだけ時間がかかります。</li>
</ul>
`,
  },
};

// Article: the chords and the tempo found in a song, editing the chords, and changing the key.
// Screenshots: node scripts/render-guide-images.mjs (harmony, chord)
import { img } from "./shots.mjs";

export default {
  slug: "chords-and-key",
  en: {
    title: "Find the Chords and BPM of a Song, Edit Them, and Change the Key (All but Drums)",
    heading: "Chords, tempo, and key change",
    nav: "Chords and key change",
    description:
      "See the chords of a song beat by beat with its BPM, fix them by hand, and move the key up or down by up to an octave — vocals, bass, and guitar/keys, but not the drums — without changing the tempo.",
    body: () => `
<p class="lead">Besides separating a song, Band Stem Mixer can show its chords on every beat, its tempo (BPM), and move it to another key. The chords and the key change work on the separated parts, so they are available once the song is separated.</p>

<nav class="toc" aria-label="Contents"><b>Contents</b><ol>
  <li><a href="#find">Finding the chords and the tempo</a></li>
  <li><a href="#edit">Editing the chords</a></li>
  <li><a href="#key">Changing the key</a></li>
  <li><a href="#uses">Ways to use them</a></li>
  <li><a href="#limits">What to expect</a></li>
</ol></nav>

<h2 id="find">Finding the chords and the tempo</h2>
<p>Press <b>“Find chords &amp; make harmony”</b> above the parts. The app first finds the beats and the tempo of the song, then a chord for each beat (quarter note). They appear above the parts: <b>BPM</b> next to the button, and the chord names along the top of the scrolling view, with a small tick at every beat. Drag the view sideways to read ahead. The same button also makes a <a href="../harmony/">harmony part</a>; if you only want the chords, mute the two harmony parts.</p>
<p>How it works, briefly:</p>
<ul>
  <li><b>Beats</b> – where new sounds start (attacks) in the whole song, the time between them that repeats most, and then the beats that best fit both. The same method as the beat detection in <a href="/looptrainer/">Loop Trainer</a>, this site's practice player.</li>
  <li><b>Chords</b> – how strong each of the 12 notes is in the bass and “Other” (guitar, keys) parts during each beat, compared with every major and minor chord. A chord does not change every beat for no reason, so the result is smoothed over the beats.</li>
</ul>
<p>Only major and minor chords are found automatically: a C7 shows as C, an Am7 as Am or C. Add the 7ths and other types by editing.</p>

<h2 id="edit">Editing the chords</h2>
<figure class="shot">
  ${img("en", "chord", "The Edit the chord dialog: the time 0:29 – 0:30, Root C, Type major, Length 2 beats, and Cancel and Change buttons.")}
  <figcaption>Each beat can have its own chord.</figcaption>
</figure>
<ol>
  <li>Tap the beat where the chord is wrong, in the chord row at the top of the view.</li>
  <li>Choose the <b>root</b> (C to B; blank for no chord), the <b>type</b>, and the <b>length</b>: how many beats from there, 1 to 16. The length starts at “until this chord ends”, so fixing a wrong chord is one tap on “Change”; choose 1 beat to change just that beat.</li>
  <li>Press “Change”. To use the new chords in the harmony, press <b>“Remake the harmony”</b>.</li>
</ol>
<p>Types: major, minor (m), 7, maj7, m7, add9, dim, dim7, m7b5, aug, sus4. “Back to the estimated chords” undoes all your edits. The chords are not kept after you reload the page; write down the ones you need.</p>

<h2 id="key">Changing the key</h2>
<p>Use <b>− and +</b> next to “Key (all but drums)” above the parts. Each press moves the song a semitone, up to 12 semitones (an octave) either way.</p>
<ul>
  <li><b>Vocals, bass, and other</b> move; <b>the drums do not</b>, since they have no key, and moving them would only change their sound.</li>
  <li><b>The tempo stays the same.</b> Only the pitch changes.</li>
  <li><b>The chord names follow</b>: at +2, an Am shows as Bm. The harmony is made again for the new key.</li>
  <li>It takes a few seconds (longer for long songs and on phones); the song keeps playing in the old key until the new one is ready. Press several times in a row and it works once, after the last press.</li>
  <li>Saved MP3 files of the moved parts say the key in their name, for example <code>practice-song - Bass (key +2).mp3</code>.</li>
</ul>

<h2 id="uses">Ways to use them</h2>
<div class="table-wrap">
  <table class="text stack">
    <thead><tr><th scope="col">You want to</th><th scope="col">Do this</th></tr></thead>
    <tbody>
      <tr><th scope="row">Sing a song that is too high or low</th><td data-label="Do this:">Move the key until the melody sits well in your voice, mute the vocals, and sing along. Save the mix as your karaoke track.</td></tr>
      <tr><th scope="row">Play along with a song tuned a half step down</th><td data-label="Do this:">Press + once: the band is in standard tuning again, and you can play without retuning.</td></tr>
      <tr><th scope="row">Play a song in the key your band uses</th><td data-label="Do this:">Move it to that key; the chord names show what to play in the new key.</td></tr>
      <tr><th scope="row">Learn the chords by ear</th><td data-label="Do this:">Solo “Other” or “Bass”, follow the chord row, and check each chord by ear. Fix the ones that sound wrong.</td></tr>
    </tbody>
  </table>
</div>

<h2 id="limits">What to expect</h2>
<ul>
  <li><b>The chords are an estimate.</b> They are usually right for clear major and minor chords, and miss more often with 7ths and tensions, chords over a different bass note, quiet or sparse parts, and heavy distortion.</li>
  <li><b>The tempo can come out double or half</b> (60 instead of 120), and songs without a steady beat may get no beats at all; then the chords are placed every half second and the app says so.</li>
  <li><b>Songs that change tempo or key</b> are treated as one tempo and one key.</li>
  <li><b>A key change is processed sound.</b> Small changes (one or two semitones) sound natural; large ones make voices and instruments sound thinner or deeper, and sharp attacks a little softer.</li>
  <li>A moved key keeps a second copy of three parts in memory. On a phone with a long song, it can run out of memory.</li>
</ul>
<p>For slowing a song down without changing the pitch, or looping a section, use <a href="/looptrainer/">Loop Trainer</a> with the MP3 files you saved.</p>
`,
  },
  ja: {
    title: "曲のコードと BPM を表示・編集し、キーを変える（ドラム以外）",
    heading: "コード表示とキー変更",
    nav: "コード表示とキー変更",
    description:
      "曲のコードを 1 拍ごとに BPM と一緒に表示し、手で直し、テンポはそのままで、ボーカル・ベース・ギター／鍵盤のキーを 1 オクターブまで上げ下げする方法（ドラムはそのまま）。",
    body: () => `
<p class="lead">Band Stem Mixer は、曲を分離するだけでなく、拍ごとのコードとテンポ（BPM）を表示し、曲のキーを変えることもできます。コードの推定とキーの変更は分離したパートを使うので、曲を分離したあとに使えます。</p>

<nav class="toc" aria-label="目次"><b>目次</b><ol>
  <li><a href="#find">コードとテンポを推定する</a></li>
  <li><a href="#edit">コードを編集する</a></li>
  <li><a href="#key">キーを変える</a></li>
  <li><a href="#uses">使い方の例</a></li>
  <li><a href="#limits">仕上がりについて</a></li>
</ol></nav>

<h2 id="find">コードとテンポを推定する</h2>
<p>パートの上にある<b>「コード推定＆ハモリ生成」</b>を押します。アプリはまず曲の拍とテンポを推定し、次に 1 拍（4 分音符）ごとのコードを推定します。結果はパートの上に出ます。ボタンの下に <b>BPM</b>、流れる表示の上の段にコード名（拍ごとに小さな目盛り）です。表示を横にドラッグすると先を読めます。同じボタンで<a href="../harmony/">ハモリのパート</a>も作られます。コードだけを見たいときは、ハモリの 2 つのパートをミュートしてください。</p>
<p>仕組みは次のとおりです。</p>
<ul>
  <li><b>拍</b> – 曲全体で新しい音が鳴り始める位置（アタック）と、その間隔でいちばん繰り返されるものを調べ、両方にいちばん合う拍の並びを決めます。このサイトの練習用プレーヤー <a href="/looptrainer/ja/">Loop Trainer</a> の拍の検出と同じ方法です。</li>
  <li><b>コード</b> – 拍ごとに、ベースと「その他」（ギター・鍵盤）のパートで 12 の音それぞれがどれだけ強く鳴っているかを調べ、すべてのメジャー・マイナーのコードと比べます。コードは理由なく 1 拍ごとに変わったりしないので、前後の拍とのつながりも考えてならします。</li>
</ul>
<p>自動で推定するのはメジャーとマイナーのコードだけです。C7 は C、Am7 は Am か C と出ます。7th などは編集で付けてください。</p>

<h2 id="edit">コードを編集する</h2>
<figure class="shot">
  ${img("ja", "chord", "「コードを編集」の画面。0:29 〜 0:30、ルート C、種類 メジャー、長さ 2 拍、「キャンセル」と「変更する」のボタン。")}
  <figcaption>1 拍ごとに、自由にコードを入れられます。</figcaption>
</figure>
<ol>
  <li>表示の上の段（コード）で、コードが違っている拍をタップします。</li>
  <li><b>ルート</b>（C〜B。ノーコードは空白）・<b>種類</b>・<b>長さ</b>（その拍から何拍分か、1〜16 拍）を選びます。長さは最初「そのコードが終わるまで」になっているので、違うコードを直すときは「変更する」を押すだけです。1 拍だけ変えるときは「1 拍」を選びます。</li>
  <li>「変更する」を押します。直したコードをハモリに使うには、<b>「ハモリを再生成」</b>を押します。</li>
</ol>
<p>種類は、メジャー・マイナー（m）・7・maj7・m7・add9・dim・dim7・m7b5・aug・sus4 です。「推定したコードに戻す」で、編集をすべて取り消せます。コードはページを読み込み直すと消えるので、必要なものは書き留めておいてください。</p>

<h2 id="key">キーを変える</h2>
<p>パートの上の「キー（ドラム以外）」の <b>− と ＋</b> を使います。1 回押すごとに半音ずつ、上下それぞれ 12 半音（1 オクターブ）まで動かせます。</p>
<ul>
  <li><b>ボーカル・ベース・その他</b>が動き、<b>ドラムは動きません</b>。ドラムにはキーがなく、動かすと音色が変わるだけだからです。</li>
  <li><b>テンポは変わりません。</b>音の高さだけが変わります。</li>
  <li><b>コード名も一緒に変わります。</b>+2 なら Am は Bm と出ます。ハモリも新しいキーで作り直します。</li>
  <li>数秒かかります（長い曲やスマホではもっと）。準備ができるまでは、元のキーのまま再生が続きます。続けて何回か押しても、処理は最後に押したあと 1 回だけです。</li>
  <li>キーを変えたパートを MP3 で保存すると、ファイル名にキーが入ります（例：<code>練習曲 - ベース（キー +2）.mp3</code>）。</li>
</ul>

<h2 id="uses">使い方の例</h2>
<div class="table-wrap">
  <table class="text stack">
    <thead><tr><th scope="col">やりたいこと</th><th scope="col">方法</th></tr></thead>
    <tbody>
      <tr><th scope="row">高すぎる・低すぎる曲を歌う</th><td data-label="方法：">主旋律が歌いやすい高さになるまでキーを動かし、ボーカルをミュートして歌います。ミックスを保存すれば、自分用のカラオケ音源になります。</td></tr>
      <tr><th scope="row">半音下げチューニングの曲に合わせて弾く</th><td data-label="方法：">＋を 1 回押すと、レギュラーチューニングのまま一緒に弾けます。</td></tr>
      <tr><th scope="row">バンドで演奏するキーで練習する</th><td data-label="方法：">そのキーまで動かします。コード名が新しいキーで出るので、何を弾けばよいか分かります。</td></tr>
      <tr><th scope="row">コードを耳コピする</th><td data-label="方法：">「その他」か「ベース」をソロにして、上の段のコードを目で追いながら、1 つずつ耳で確かめます。違って聞こえるものは直します。</td></tr>
    </tbody>
  </table>
</div>

<h2 id="limits">仕上がりについて</h2>
<ul>
  <li><b>コードは推定です。</b>はっきりしたメジャー・マイナーのコードはたいてい合いますが、7th やテンション、ベースが別の音のコード（オンコード）、音の少ない静かな部分、強く歪んだ音では外れやすくなります。</li>
  <li><b>テンポが倍や半分で出ることがあります</b>（120 のところが 60 など）。拍のはっきりしない曲では拍が見つからないこともあり、その場合はコードを 0.5 秒ごとに区切り、その旨を表示します。</li>
  <li><b>途中でテンポやキーが変わる曲</b>も、1 つのテンポ・1 つのキーとして扱います。</li>
  <li><b>キーの変更は加工した音です。</b>半音〜1 音くらいなら自然ですが、大きく動かすと声や楽器が細く（低くすると太く）聞こえ、鋭いアタックが少しやわらかくなります。</li>
  <li>キーを変えている間は、3 つのパートの別のコピーをメモリに持ちます。スマホで長い曲だと、メモリが足りなくなることがあります。</li>
</ul>
<p>音程を変えずにゆっくり再生したり、区間をループしたりするには、保存した MP3 を <a href="/looptrainer/ja/">Loop Trainer</a> で開いてください。</p>
`,
  },
};

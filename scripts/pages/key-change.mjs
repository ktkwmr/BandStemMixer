// Article: changing the key of a separated song (all parts but the drums).
// Before 2026-11, this was "chords-and-key"; the chords and the harmony moved to Vocal Harmony Maker.

export default {
  slug: "key-change",
  en: {
    title: "Change the Key of a Song Without Changing the Tempo (All Parts but the Drums)",
    heading: "Changing the key of a song",
    nav: "Changing the key",
    description:
      "Move a song up or down by up to an octave without changing its tempo — vocals, bass, and guitar/keys, but not the drums — to sing in your range, play with a song tuned down, or practice in your band's key.",
    body: () => `
<p class="lead">Band Stem Mixer can move a separated song to another key, a semitone at a time, without changing its tempo. Because the song is already split into parts, the drums can stay exactly as they are while everything else moves.</p>

<nav class="toc" aria-label="Contents"><b>Contents</b><ol>
  <li><a href="#key">Changing the key</a></li>
  <li><a href="#uses">Ways to use it</a></li>
  <li><a href="#limits">What to expect</a></li>
</ol></nav>

<h2 id="key">Changing the key</h2>
<p>Use <b>− and +</b> next to “Key (all but drums)” above the parts. Each press moves the song a semitone, up to 12 semitones (an octave) either way.</p>
<ul>
  <li><b>Vocals, bass, and other</b> move; <b>the drums do not</b>, since they have no key, and moving them would only change their sound.</li>
  <li><b>The tempo stays the same.</b> Only the pitch changes.</li>
  <li>It takes a few seconds (longer for long songs and on phones); the song keeps playing in the old key until the new one is ready. Press several times in a row and it works once, after the last press.</li>
  <li>Saved MP3 files of the moved parts say the key in their name, for example <code>practice-song - Bass (key +2).mp3</code>.</li>
</ul>

<h2 id="uses">Ways to use it</h2>
<div class="table-wrap">
  <table class="text stack">
    <thead><tr><th scope="col">You want to</th><th scope="col">Do this</th></tr></thead>
    <tbody>
      <tr><th scope="row">Sing a song that is too high or low</th><td data-label="Do this:">Move the key until the melody sits well in your voice, mute the vocals, and sing along. Save the mix as your karaoke track.</td></tr>
      <tr><th scope="row">Play along with a song tuned a half step down</th><td data-label="Do this:">Press + once: the band is in standard tuning again, and you can play without retuning.</td></tr>
      <tr><th scope="row">Play a song in the key your band uses</th><td data-label="Do this:">Move it to that key and practice your part there.</td></tr>
    </tbody>
  </table>
</div>
<div class="note"><p>To see the chords of a song (and how they change with the key), or to add a harmony part to its vocals, use our separate app <a href="/vocalharmonymaker/">Vocal Harmony Maker</a>.</p></div>

<h2 id="limits">What to expect</h2>
<ul>
  <li><b>A key change is processed sound.</b> Small changes (one or two semitones) sound natural; large ones make voices and instruments sound thinner or deeper, and sharp attacks a little softer.</li>
  <li>A moved key keeps a second copy of three parts in memory. On a phone with a long song, it can run out of memory.</li>
</ul>
<p>For slowing a song down without changing the pitch, or looping a section, use <a href="/looptrainer/">Loop Trainer</a> with the MP3 files you saved.</p>
`,
  },
  ja: {
    title: "曲のキーをテンポはそのままで変える（ドラム以外）",
    heading: "曲のキーを変える",
    nav: "キーを変える",
    description:
      "テンポを変えずに、曲のキーを 1 オクターブまで上げ下げする方法。ボーカル・ベース・ギター／鍵盤が動き、ドラムはそのまま。歌いやすい高さにする、半音下げチューニングの曲に合わせる、バンドのキーで練習する、などに。",
    body: () => `
<p class="lead">Band Stem Mixer は、分離した曲のキーを、テンポを変えずに半音ずつ動かせます。曲がパートに分かれているので、ドラムはそのままで、ほかのパートだけを動かせます。</p>

<nav class="toc" aria-label="目次"><b>目次</b><ol>
  <li><a href="#key">キーを変える</a></li>
  <li><a href="#uses">使い方の例</a></li>
  <li><a href="#limits">仕上がりについて</a></li>
</ol></nav>

<h2 id="key">キーを変える</h2>
<p>パートの上の「キー（ドラム以外）」の <b>− と ＋</b> を使います。1 回押すごとに半音ずつ、上下それぞれ 12 半音（1 オクターブ）まで動かせます。</p>
<ul>
  <li><b>ボーカル・ベース・その他</b>が動き、<b>ドラムは動きません</b>。ドラムにはキーがなく、動かすと音色が変わるだけだからです。</li>
  <li><b>テンポは変わりません。</b>音の高さだけが変わります。</li>
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
      <tr><th scope="row">バンドで演奏するキーで練習する</th><td data-label="方法：">そのキーまで動かして、自分のパートを練習します。</td></tr>
    </tbody>
  </table>
</div>
<div class="note"><p>曲のコードを見たり（キーを変えるとコード名も変わります）、ボーカルにハモリを付けたりするには、別のアプリ <a href="/vocalharmonymaker/ja/">Vocal Harmony Maker</a> をお使いください。</p></div>

<h2 id="limits">仕上がりについて</h2>
<ul>
  <li><b>キーの変更は加工した音です。</b>半音〜1 音くらいなら自然ですが、大きく動かすと声や楽器が細く（低くすると太く）聞こえ、鋭いアタックが少しやわらかくなります。</li>
  <li>キーを変えている間は、3 つのパートの別のコピーをメモリに持ちます。スマホで長い曲だと、メモリが足りなくなることがあります。</li>
</ul>
<p>音程を変えずにゆっくり再生したり、区間をループしたりするには、保存した MP3 を <a href="/looptrainer/ja/">Loop Trainer</a> で開いてください。</p>
`,
  },
};

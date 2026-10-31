// Article: practicing harmonies with a harmony part made from the separated vocals.
// Screenshots: node scripts/render-guide-images.mjs (harmony, chord)
import { img } from "./shots.mjs";

export default {
  slug: "harmony",
  en: {
    title: "Practice Singing Harmonies: Make a Harmony Part from Any Song's Vocals",
    heading: "Practicing harmonies: a harmony part made from the vocals",
    nav: "Practicing harmonies",
    description:
      "Make a harmony part a 3rd or a 5th above or below the vocal melody of a song, as a sung voice and as a guide tone, and practice singing it. How to read the screen, a step-by-step practice plan, editing the chords, and the limits.",
    body: () => `
<p class="lead">Singing a harmony is hard mainly because the melody pulls you onto it. Band Stem Mixer can make a harmony part from the vocals of a song: it finds the chords, follows the melody, and adds the harmony as two extra parts in the mixer — the singer's own voice moved to the harmony notes, and a plain guide tone. You can then turn each one up or down while you learn.</p>

<nav class="toc" aria-label="Contents"><b>Contents</b><ol>
  <li><a href="#make">Making the harmony</a></li>
  <li><a href="#screen">Reading the screen</a></li>
  <li><a href="#which">Upper or lower, 3rd or 5th</a></li>
  <li><a href="#practice">A practice plan in four steps</a></li>
  <li><a href="#chords">When a chord is wrong: edit it and remake</a></li>
  <li><a href="#limits">What to expect</a></li>
</ol></nav>

<h2 id="make">Making the harmony</h2>
<ol>
  <li><b>Separate the song</b> into four parts (see <a href="../guide/">how to use</a>).</li>
  <li><b>Choose the part</b> next to the button: upper (a 3rd above), lower (a 3rd below), or a 5th above or below.</li>
  <li><b>Press “Find chords &amp; make harmony”.</b> It takes from a few seconds to about a minute, depending on the song and the device. Playback goes on while it works.</li>
</ol>
<p>Everything is worked out in your browser, without the AI model or any download. After the first time the button becomes <b>“Remake the harmony”</b>: it reuses the chords and the melody it already found, so it is quicker. Use it after you change the part or the chords: the button turns black when the harmony no longer matches them.</p>

<h2 id="screen">Reading the screen</h2>
<figure class="shot">
  ${img("en", "harmony", "The mixer after making a harmony: the key control (all parts but drums), the Remake the harmony button and the part (Upper, 3rd above), BPM 120, a scrolling view with chord names on top, the vocal melody as a grey line and the harmony notes as black bars, and two new rows: Harmony (voice) and Harmony guide tone. Numbers 1 to 7 mark them.")}
  <figcaption>The numbers match the list below. The song is a made-up one.</figcaption>
</figure>
<ol>
  <li><b>Key</b> – Moves every part except the drums, and the harmony with them, by semitones. See <a href="../chords-and-key/">chords and key change</a>.</li>
  <li><b>Find chords &amp; make harmony / Remake the harmony</b></li>
  <li><b>The harmony part</b> – 3rd or 5th, above or below.</li>
  <li><b>BPM</b> – The tempo found in the song. The chords change on its beats.</li>
  <li><b>The roll</b> – The chord names on top, with a small tick at every beat; the vocal melody as a <b>grey line</b>; the harmony notes as <b>black bars</b>; the black vertical line is the play position. Drag it sideways (or use a sideways swipe or Shift + wheel) to look ahead or back; tap it to jump there. It follows the playback again when you press play.</li>
  <li><b>Harmony (voice)</b> – The separated vocals moved to the harmony notes. It keeps the singer's vibrato and words, so it sounds like a second singer.</li>
  <li><b>Harmony guide tone</b> – The same notes as a plain, steady tone. The pitch is exact, which makes it the easiest to sing along to. It starts muted; press its M to hear it.</li>
</ol>
<p>Both new parts have M, S, a fader, and the ↓ button to save them as MP3 files, like the other parts.</p>

<h2 id="which">Upper or lower, 3rd or 5th</h2>
<div class="table-wrap">
  <table class="text stack">
    <thead><tr><th scope="col">Part</th><th scope="col">What it sounds like</th><th scope="col">Good for</th></tr></thead>
    <tbody>
      <tr><th scope="row">Upper (3rd above)</th><td data-label="Sounds like:">The most common harmony in pop: bright, moving with the melody</td><td data-label="Good for:">Singers whose range goes higher than the lead</td></tr>
      <tr><th scope="row">Lower (3rd below)</th><td data-label="Sounds like:">Warm and supporting, under the melody</td><td data-label="Good for:">Lower voices; a softer harmony</td></tr>
      <tr><th scope="row">5th above / below</th><td data-label="Sounds like:">Open and strong, more “hollow” than a 3rd</td><td data-label="Good for:">Rock choruses, power-chord songs; a third voice next to a 3rd harmony</td></tr>
    </tbody>
  </table>
</div>
<p>The app does not simply add a fixed interval. For each note it picks a note in the song's key, and when that note would clash with the chord at that moment, it moves to a chord tone instead — so a “3rd above” is sometimes a 4th, and a “5th” sometimes a 6th, as a singer would do. Short gaps between notes are joined, so the harmony moves smoothly through a phrase instead of stopping and starting.</p>

<h2 id="practice">A practice plan in four steps</h2>
<ol>
  <li><b>Listen.</b> Solo the guide tone (S) and listen to the harmony on its own a few times. Then add the vocals (S on both) to hear how the two lines fit.</li>
  <li><b>Sing with the guide.</b> Turn the guide tone on (its M; it starts muted) and keep the vocals on, and sing the harmony along with the guide. Turn the harmony voice off (M) for now.</li>
  <li><b>Lower the help.</b> Turn the guide tone down step by step — 60%, 30% — until you are carrying the harmony yourself against the lead vocal.</li>
  <li><b>Sing it alone.</b> Mute the guide tone and the harmony voice and sing the harmony against the lead and the band. To check yourself, unmute the harmony voice for a moment.</li>
</ol>
<div class="note"><p>Want to sing the melody against a harmony instead? Mute the vocals and keep the harmony voice on. To fit your range, move the key (−/+); the harmony follows.</p></div>
<p>Save what you made with ↓ or “Save this mix (MP3)” to practice on your phone. The harmony is not kept in the app after you reload.</p>

<h2 id="chords">When a chord is wrong: edit it and remake</h2>
<figure class="shot">
  ${img("en", "chord", "The Edit the chord dialog: the time 0:29 – 0:30, Root C, Type major, Length 2 beats, and Cancel and Change buttons.")}
  <figcaption>Tap a beat in the chord row to open the editor.</figcaption>
</figure>
<p>The harmony is chosen to fit the chords, so a wrong chord can give a wrong harmony note. Tap the beat in the chord row (the top of the roll) where the chord is wrong, choose the root, the type, and how many beats it lasts, and press “Change”. Then press <b>“Remake the harmony”</b>. Details are in <a href="../chords-and-key/#edit">editing the chords</a>.</p>

<h2 id="limits">What to expect</h2>
<ul>
  <li><b>It is an estimate.</b> The chords, the melody, and the choice of harmony notes are worked out automatically and can be wrong, especially with backing vocals in the vocal part, fast runs, or songs with unusual chords.</li>
  <li><b>One key for the whole song.</b> A song that changes key partway (for example a last chorus a step up) is harmonized in one key, so notes after the change can be off.</li>
  <li><b>The harmony voice is processed sound.</b> Moving a voice a 3rd or more changes its character a little, and anything that leaked into the vocal part moves with it. For an exact pitch, use the guide tone.</li>
  <li><b>A harmony is a suggestion, not the record.</b> If the song has its own harmony part, learn that one by ear; the app's harmony is a starting point or a practice tool.</li>
</ul>
<p>Use songs you have the rights to use; see <a href="../minus-one/#rights">which songs you can use</a>.</p>
`,
  },
  ja: {
    title: "ハモリの練習：曲のボーカルからハモリパートを作って歌う",
    heading: "ハモリの練習：ボーカルからハモリパートを作る",
    nav: "ハモリの練習",
    description:
      "曲のボーカルの旋律の 3 度・5 度上（下）にハモリパートを作り、ハモリの声とガイド音で練習する方法。画面の見方、4 ステップの練習法、コードの直し方、限界まで。",
    body: () => `
<p class="lead">ハモリが難しいのは、主旋律に引っぱられてしまうからです。Band Stem Mixer は、曲のボーカルからハモリパートを作れます。コードを推定し、旋律を追って、ハモリを 2 つのパートとしてミキサーに足します。歌い手の声をハモリの音程に変えた「ハモリ（声）」と、単純な「ガイド音」です。覚える段階に合わせて、それぞれの音量を上げ下げしながら練習できます。</p>

<nav class="toc" aria-label="目次"><b>目次</b><ol>
  <li><a href="#make">ハモリを作る</a></li>
  <li><a href="#screen">画面の見方</a></li>
  <li><a href="#which">上ハモ・下ハモ、3 度と 5 度</a></li>
  <li><a href="#practice">4 ステップの練習法</a></li>
  <li><a href="#chords">コードが違うとき：直して再生成</a></li>
  <li><a href="#limits">仕上がりについて</a></li>
</ol></nav>

<h2 id="make">ハモリを作る</h2>
<ol>
  <li><b>曲を分離します</b>（<a href="../guide/">使い方</a>をご覧ください）。</li>
  <li>ボタンの横で<b>パートを選びます</b>。上ハモ（3 度上）・下ハモ（3 度下）・5 度上・5 度下から選べます。</li>
  <li><b>「コード推定＆ハモリ生成」を押します。</b>曲と端末によって、数秒から 1 分ほどかかります。その間も再生は止まりません。</li>
</ol>
<p>処理はすべてブラウザの中で行い、AI モデルもダウンロードも使いません。一度作るとボタンは<b>「ハモリを再生成」</b>に変わり、推定したコードと旋律を使い回すので、2 回目からは速く終わります。パートやコードを変えたあとに押してください。作り直しが必要なときは、ボタンが黒くなります。</p>

<h2 id="screen">画面の見方</h2>
<figure class="shot">
  ${img("ja", "harmony", "ハモリを作ったあとのミキサー。キー（ドラム以外）の − と ＋、「ハモリを再生成」ボタンとパート（上ハモ（3 度上））、BPM 120、上にコード名、灰色の線でボーカルの音程、黒い帯でハモリの音が流れる表示、増えた 2 行「ハモリ（声）」「ハモリのガイド音」。1〜7 の番号付き。")}
  <figcaption>番号は下の説明と対応しています。曲は架空のものです。</figcaption>
</figure>
<ol>
  <li><b>キー</b> – ドラム以外のパートと、ハモリを、半音ずつ上げ下げします。<a href="../chords-and-key/">コード表示とキー変更</a>をご覧ください。</li>
  <li><b>コード推定＆ハモリ生成／ハモリを再生成</b></li>
  <li><b>ハモリのパート</b> – 3 度か 5 度、上か下か。</li>
  <li><b>BPM</b> – 曲から推定したテンポ。コードはこの拍の上で切り替わります。</li>
  <li><b>表示</b> – 上の段にコード名（拍ごとに小さな目盛り）、<b>灰色の線</b>がボーカルの音程、<b>黒い帯</b>がハモリの音、黒い縦線が再生位置です。横にドラッグ（または横スワイプ・Shift＋ホイール）すると前後を見られ、タップするとその位置に移ります。再生を始めると、再生位置に戻ります。</li>
  <li><b>ハモリ（声）</b> – 分離したボーカルを、ハモリの音程に変えたもの。歌い手のビブラートや歌詞が残るので、もう一人が歌っているように聞こえます。</li>
  <li><b>ハモリのガイド音</b> – 同じ音を、揺れのない単純な音で鳴らします。音程が正確なので、いちばん合わせやすい音です。最初はミュートになっているので、聞くときは M を押します。</li>
</ol>
<p>増えた 2 つのパートにも、ほかのパートと同じく M・S・フェーダーと、MP3 で保存する ↓ ボタンがあります。</p>

<h2 id="which">上ハモ・下ハモ、3 度と 5 度</h2>
<div class="table-wrap">
  <table class="text stack">
    <thead><tr><th scope="col">パート</th><th scope="col">聞こえ方</th><th scope="col">向いている人・曲</th></tr></thead>
    <tbody>
      <tr><th scope="row">上ハモ（3 度上）</th><td data-label="聞こえ方：">ポップスでいちばんよく使うハモリ。明るく、主旋律と一緒に動く</td><td data-label="向いている：">主旋律より高い声が出る人</td></tr>
      <tr><th scope="row">下ハモ（3 度下）</th><td data-label="聞こえ方：">主旋律の下で支える、やわらかい響き</td><td data-label="向いている：">低めの声の人、控えめなハモリ</td></tr>
      <tr><th scope="row">5 度上・下</th><td data-label="聞こえ方：">3 度より開いた、力強い響き</td><td data-label="向いている：">ロックのサビ、パワーコードの曲、3 度のハモリに足す 3 声目</td></tr>
    </tbody>
  </table>
</div>
<p>アプリは、決まった音程をそのまま足しているわけではありません。音ごとに曲のキーの中の音を選び、そのときのコードとぶつかる場合はコードの音に寄せます。そのため「3 度上」がところどころ 4 度に、「5 度」が 6 度になることがあります。歌い手が実際にハモるときと同じ考え方です。音と音の短いすき間はつなぐので、フレーズの途中で途切れず、なめらかに動きます。</p>

<h2 id="practice">4 ステップの練習法</h2>
<ol>
  <li><b>聞く</b> – ガイド音だけをソロ（S）にして、ハモリを何度か聞きます。次にボーカルも S にして、2 つの線の重なり方を聞きます。</li>
  <li><b>ガイドと一緒に歌う</b> – ガイド音の M を押してミュートを外し（最初はミュート）、ボーカルとガイド音を鳴らしたまま、ガイドに合わせてハモリを歌います。ハモリ（声）は、まずはミュート（M）しておきます。</li>
  <li><b>助けを減らす</b> – ガイド音を 60%、30% と少しずつ下げ、主旋律に対して自分でハモリを保てるようにします。</li>
  <li><b>一人で歌う</b> – ガイド音とハモリ（声）をミュートし、主旋律とバンドに対してハモリを歌います。確かめたいときは、ハモリ（声）を少しだけ戻します。</li>
</ol>
<div class="note"><p>逆に、ハモリに対して主旋律を歌う練習もできます。ボーカルをミュートして、ハモリ（声）を鳴らします。声の高さが合わないときは、キー（− / ＋）を動かすと、ハモリも一緒に移ります。</p></div>
<p>作ったものは ↓ や「このミックスを保存（MP3）」で保存すると、スマホでも練習できます。ハモリはページを読み込み直すと消えます。</p>

<h2 id="chords">コードが違うとき：直して再生成</h2>
<figure class="shot">
  ${img("ja", "chord", "「コードを編集」の画面。0:29 〜 0:30、ルート C、種類 メジャー、長さ 2 拍、「キャンセル」と「変更する」のボタン。")}
  <figcaption>上の段（コード）の拍をタップすると開きます。</figcaption>
</figure>
<p>ハモリの音はコードに合わせて選ぶので、コードが違っていると、ハモリの音も外れることがあります。表示の上の段（コード）で、違っている拍をタップし、ルート・種類・何拍分かを選んで「変更する」を押します。そのあと<b>「ハモリを再生成」</b>を押してください。詳しくは<a href="../chords-and-key/#edit">コードの編集</a>をご覧ください。</p>

<h2 id="limits">仕上がりについて</h2>
<ul>
  <li><b>自動の推定です。</b>コード・旋律・ハモリの音の選び方は自動で決めるので、間違うことがあります。ボーカルのパートにコーラスが入っている曲、速い動きの多い曲、珍しいコードの曲は特に外れやすくなります。</li>
  <li><b>キーは曲全体で 1 つです。</b>途中で転調する曲（最後のサビで 1 音上がるなど）も 1 つのキーで考えるので、転調のあとはハモリが外れることがあります。</li>
  <li><b>ハモリ（声）は加工した音です。</b>声の音程を 3 度以上動かすと声の感じが少し変わり、ボーカルのパートに残っているほかの音も一緒に動きます。正確な音程はガイド音で確かめてください。</li>
  <li><b>原曲のハモリとは限りません。</b>曲にハモリのパートがあるなら、それは耳で覚えてください。アプリのハモリは、練習のきっかけや練習用の素材です。</li>
</ul>
<p>使う曲は、使う権利のあるものにしてください。<a href="../minus-one/#rights">使える曲</a>もご覧ください。</p>
`,
  },
};

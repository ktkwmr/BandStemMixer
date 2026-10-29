// Article: hearing the bass and drums clearly by soloing them, for learning by ear
import { FADER_MAX } from "./app.mjs";

export default {
  slug: "learn-by-ear",
  en: {
    title: "Can't Hear the Bass? Solo the Bass and Drums to Learn Them by Ear",
    heading: "Hearing the bass and drums clearly: learning parts by ear with solo",
    nav: "Hearing the bass and drums clearly",
    description:
      "The bass line is the hardest part to hear in a mix. Separate it with AI and solo it, or solo the drums to hear the kick and hi-hat pattern. A practical method for learning bass and drum parts by ear.",
    body: () => `
<p class="lead">In most recordings the bass is felt more than heard, and the drums are a wash of cymbals. Separating the song and listening to one part on its own makes both much easier to learn by ear.</p>

<nav class="toc" aria-label="Contents"><b>Contents</b><ol>
  <li><a href="#why">Why the bass is hard to hear</a></li>
  <li><a href="#bass">Learning a bass line</a></li>
  <li><a href="#drums">Learning a drum part</a></li>
  <li><a href="#pairs">Listening to two parts together</a></li>
  <li><a href="#slow">Slowing a part down</a></li>
  <li><a href="#cautions">Things to watch out for</a></li>
</ol></nav>

<h2 id="why">Why the bass is hard to hear</h2>
<ul>
  <li><b>Low notes are covered by everything above them.</b> Guitars, keys, and vocals sit over the bass and draw your attention.</li>
  <li><b>Small speakers barely play low notes.</b> On phone speakers and many laptops, you mostly hear the bass's upper harmonics, which makes the notes easy to mistake.</li>
  <li><b>The bass and the kick drum play together.</b> Their attacks blend, so it is hard to tell which one you are hearing.</li>
</ul>

<h2 id="bass">Learning a bass line</h2>
<ol>
  <li>Separate the song and press <b>S on Bass</b>. Only the bass plays.</li>
  <li>Use <b>headphones</b> or speakers that play low notes. With the bass on its own, turning it up is safe: the fader goes up to ${FADER_MAX}%.</li>
  <li>Find the <b>root notes</b> first: the note at the start of each chord. Most bass lines are built on them.</li>
  <li>Then fill in what happens between them: passing notes, octaves, rhythms.</li>
  <li>Turn the solo off and play along with the whole band to check.</li>
</ol>
<div class="note"><p>If a note is hard to name, check its octave: low notes are easy to hear an octave off. Play the note on your bass in two octaves and compare.</p></div>

<h2 id="drums">Learning a drum part</h2>
<p>Solo the drums to hear the pattern without the other instruments. Listen to one part of the kit at a time:</p>
<ol>
  <li><b>Hi-hat or ride</b> – the steady pulse: eighth notes, sixteenths, or a shuffle? Open hi-hats?</li>
  <li><b>Snare</b> – usually beats 2 and 4; listen for ghost notes between them.</li>
  <li><b>Kick</b> – the part that changes most from song to song. Write it down beat by beat.</li>
  <li><b>Fills</b> – where they come (often the bar before a new section) and which drums they move across.</li>
</ol>
<p>The “Drums” part includes the whole kit and usually other percussion, such as tambourine and shaker.</p>

<h2 id="pairs">Listening to two parts together</h2>
<p>Solo works on more than one part. Press S on both <b>Bass and Drums</b> to hear the rhythm section on its own: how the bass follows the kick, and where they play different rhythms. This is the best way to learn the groove before you play along with the full band.</p>
<p>Bass players can also do the opposite: mute only the bass and play along. See <a href="../minus-one/">practicing with your part removed</a>.</p>

<h2 id="slow">Slowing a part down</h2>
<p>Fast passages are easier to follow slowly. Save the soloed part with the ↓ button, then open the MP3 in <a href="/looptrainer/">Loop Trainer</a>, a practice player on this site that loops a section and slows it down without changing the pitch.</p>

<h2 id="cautions">Things to watch out for</h2>
<ul>
  <li><b>Traces of other parts.</b> A soloed part can contain a little of the others — for example, the low thump of the kick drum in the bass, or a vocal note in “Other”. If a note seems odd, compare with the full mix.</li>
  <li><b>Synth bass and low keys</b> may be split between “Bass” and “Other”.</li>
  <li><b>Sound quality.</b> The separated parts are estimates. Use them to hear what is played, not as a reference for the instrument's tone.</li>
</ul>
<p>See <a href="../how-it-works/">how AI separation works</a> for why this happens.</p>
`,
  },
  ja: {
    title: "ベースが聞き取れないときは：ベースとドラムをソロにして耳コピする",
    heading: "ベースとドラムを聞き取る：ソロにして耳コピする",
    nav: "ベースとドラムを聞き取る",
    description:
      "ミックスの中でいちばん聞き取りにくいベースを AI で分離してソロで聞く方法と、ドラムをソロにしてキックやハイハットのパターンを聞き取る方法。ベース・ドラムの耳コピのコツ。",
    body: () => `
<p class="lead">多くの録音では、ベースは「聞こえる」より「感じる」音で、ドラムはシンバルにまぎれがちです。曲を分離して 1 つのパートだけを聞くと、どちらもずっと耳コピしやすくなります。</p>

<nav class="toc" aria-label="目次"><b>目次</b><ol>
  <li><a href="#why">ベースが聞き取りにくい理由</a></li>
  <li><a href="#bass">ベースラインを耳コピする</a></li>
  <li><a href="#drums">ドラムのパターンを耳コピする</a></li>
  <li><a href="#pairs">2 つのパートを一緒に聞く</a></li>
  <li><a href="#slow">ゆっくり聞く</a></li>
  <li><a href="#cautions">気をつけること</a></li>
</ol></nav>

<h2 id="why">ベースが聞き取りにくい理由</h2>
<ul>
  <li><b>低い音は、上に重なる音に隠れる。</b>ギター・鍵盤・ボーカルがベースの上で鳴り、耳がそちらに向きます。</li>
  <li><b>小さなスピーカーは低音をほとんど出さない。</b>スマホや多くのノートパソコンのスピーカーでは、ベースの倍音が主に聞こえるので、音を取り違えやすくなります。</li>
  <li><b>ベースとキックが同時に鳴る。</b>音の立ち上がりが混ざり、どちらの音を聞いているのか分かりにくくなります。</li>
</ul>

<h2 id="bass">ベースラインを耳コピする</h2>
<ol>
  <li>曲を分離して、<b>ベースの S</b> を押します。ベースだけが鳴ります。</li>
  <li><b>ヘッドホン</b>か、低音の出るスピーカーで聞きます。ベースだけなので、音量を上げても大丈夫です（フェーダーは ${FADER_MAX}% まで）。</li>
  <li>まず<b>ルート音</b>（各コードの頭の音）を取ります。ベースラインの多くはルート音が土台です。</li>
  <li>次に、その間の動き（経過音・オクターブ・リズム）を埋めます。</li>
  <li>ソロを外し、バンド全体に合わせて弾いて確かめます。</li>
</ol>
<div class="note"><p>音名が分かりにくいときは、オクターブを疑ってください。低い音は 1 オクターブ違って聞こえやすいので、ベースで 2 つのオクターブを弾いて比べます。</p></div>

<h2 id="drums">ドラムのパターンを耳コピする</h2>
<p>ドラムをソロにすると、ほかの楽器なしでパターンを聞けます。キットの中の 1 つずつに注目します。</p>
<ol>
  <li><b>ハイハット・ライド</b> – 刻みは 8 分か 16 分か、シャッフルか。オープンハイハットはあるか。</li>
  <li><b>スネア</b> – ふつうは 2 拍目と 4 拍目。その間のゴーストノートも聞きます。</li>
  <li><b>キック</b> – 曲ごとにいちばん変わる部分。1 拍ずつ書き出します。</li>
  <li><b>フィル</b> – どこで入るか（新しいセクションの直前の小節が多い）、どの太鼓を回っているか。</li>
</ol>
<p>「ドラム」には、キット全体と、たいていタンバリンやシェイカーなどの打楽器も入ります。</p>

<h2 id="pairs">2 つのパートを一緒に聞く</h2>
<p>ソロは複数のパートにかけられます。<b>ベースとドラム</b>の両方の S を押すと、リズム隊だけを聞けます。ベースがキックにどう合わせているか、どこで違うリズムを弾いているかが分かり、バンド全体に合わせる前にグルーヴをつかむのにいちばんの方法です。</p>
<p>ベーシストは逆に、ベースだけをミュートして合わせて弾く練習もできます。<a href="../minus-one/">自分のパートを消して練習する</a>を見てください。</p>

<h2 id="slow">ゆっくり聞く</h2>
<p>速いフレーズは、ゆっくり聞くと追いやすくなります。ソロにしたパートを ↓ ボタンで保存し、その MP3 を同じサイトの <a href="/looptrainer/ja/">Loop Trainer</a> で開くと、区間をループさせ、音程を変えずにスロー再生できます。</p>

<h2 id="cautions">気をつけること</h2>
<ul>
  <li><b>ほかのパートの音が残る。</b>ソロにしたパートに、ほかのパートの音が少し入ることがあります（ベースにキックの低い音、「その他」にボーカルなど）。おかしいと思ったら、元のミックスと比べてください。</li>
  <li><b>シンセベースや低い鍵盤</b>は、「ベース」と「その他」に分かれて入ることがあります。</li>
  <li><b>音質。</b>分離したパートは推定した音です。何を弾いているかを聞くためのもので、楽器の音色の手本にはなりません。</li>
</ul>
<p>なぜそうなるかは<a href="../how-it-works/">AI 音源分離の仕組み</a>で説明しています。</p>
`,
  },
};

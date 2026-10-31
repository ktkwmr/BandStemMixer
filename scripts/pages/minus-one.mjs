// Article: practicing with your own part removed (a "minus one" track), for each instrument
import { FADER_MAX } from "./app.mjs";

export default {
  slug: "minus-one",
  en: {
    title: "How to Make a Minus-One Backing Track: Remove Your Part from a Song",
    heading: "Practicing with your part removed: making a minus-one track",
    nav: "Practicing with your part removed",
    description:
      "Remove the vocals, bass, or drums from a song with AI and play along with the rest of the band. How to make a minus-one backing track for each instrument, how to set the faders, and what to expect.",
    body: () => `
<p class="lead">A “minus one” is a recording of a song with one part missing — yours. Playing along with it is the closest thing to rehearsing with the band when the band is not there. With Band Stem Mixer you can make one from a recording you already have.</p>

<nav class="toc" aria-label="Contents"><b>Contents</b><ol>
  <li><a href="#why">Why practice with a minus-one track</a></li>
  <li><a href="#how">Making one in three steps</a></li>
  <li><a href="#parts">Settings for each instrument</a></li>
  <li><a href="#guide">Keep a little of your part as a guide</a></li>
  <li><a href="#limits">What to expect from the separation</a></li>
  <li><a href="#rights">Which songs you can use</a></li>
</ol></nav>

<h2 id="why">Why practice with a minus-one track</h2>
<p>Practicing alone with the original recording has a problem: the musician on the record is playing your part too. You hear their notes over yours, and it is easy to think you played something you did not. With your part removed:</p>
<ul>
  <li>You hear exactly what you play, against the rest of the band.</li>
  <li>You have to keep time yourself, as on stage: nobody covers for a missed entry.</li>
  <li>You learn what the other parts do while you play — the drum fill that leads into the chorus, the bass line under your solo.</li>
</ul>

<h2 id="how">Making one in three steps</h2>
<ol>
  <li><b>Separate the song</b> into vocals, drums, bass, and other (see <a href="../guide/">how to use</a>).</li>
  <li><b>Press M on your part.</b> The song plays on without it.</li>
  <li><b>Save it</b> with “Save this mix (MP3)” if you want to practice with it elsewhere, for example on your phone at the studio.</li>
</ol>

<h2 id="parts">Settings for each instrument</h2>
<div class="table-wrap">
  <table class="text stack">
    <thead><tr><th scope="col">You play</th><th scope="col">Mute</th><th scope="col">Tips</th></tr></thead>
    <tbody>
      <tr><th scope="row">Vocals</th><td data-label="Mute:">Vocals</td><td data-label="Tips:">A karaoke track. Backing vocals and harmonies usually go with the vocals, so they disappear too. If the song is too high or low for you, move the key (all parts but the drums move).</td></tr>
      <tr><th scope="row">Bass</th><td data-label="Mute:">Bass</td><td data-label="Tips:">Turn the drums up a little (110–120%) to lock in with the kick drum.</td></tr>
      <tr><th scope="row">Drums</th><td data-label="Mute:">Drums</td><td data-label="Tips:">Turn the bass up so you can follow the groove. Without a click, the band's tempo is now your job.</td></tr>
      <tr><th scope="row">Guitar or keys</th><td data-label="Mute:">Other</td><td data-label="Tips:">Guitar and keys are in the same part, so muting “Other” removes both. If the song has both, turn “Other” down to about 30% instead and play over it.</td></tr>
    </tbody>
  </table>
</div>
<p>The faders go up to ${FADER_MAX}%, so you can also bring up a part that is hard to hear in the original mix.</p>

<h2 id="guide">Keep a little of your part as a guide</h2>
<p>Muting your part completely is the goal, but not always the best start. While you are still learning the song, turn your part down to about 20–30% instead of muting it. You can still hear where it goes, but your own playing is louder. Lower it each time you practice, and mute it when you no longer need it.</p>
<p>When you need to hear a passage clearly first, solo it: see <a href="../learn-by-ear/">hearing the bass and drums clearly</a>.</p>
<p>Singers who sing the harmony in the band can make one from the vocals and practice it the same way: see <a href="../harmony/">practicing harmonies</a>. To play in your band's key or with a song tuned down, see <a href="../chords-and-key/#key">changing the key</a>.</p>

<h2 id="limits">What to expect from the separation</h2>
<ul>
  <li><b>Traces of your part may remain.</b> The AI estimates each part from the mix; a little of the muted part can still be heard, especially at loud moments.</li>
  <li><b>Other sounds can change slightly</b> where they overlapped with your part — for example, the edge of a snare hit that coincided with a bass note.</li>
  <li><b>Guitar and keys are not separated from each other</b>; they share “Other”.</li>
</ul>
<p>For practice this is usually more than enough. For tips on getting a cleaner result, see <a href="../better-results/">how to get better separation</a>; for why it happens, see <a href="../how-it-works/">how AI separation works</a>.</p>

<h2 id="rights">Which songs you can use</h2>
<p>Use songs you recorded, or recordings you have the right to use. Separating a song for your own practice is one thing; publishing or sharing the separated parts or your minus-one track of someone else's song usually needs the permission of the rights holders. Music from streaming services cannot be opened in the app.</p>
`,
  },
  ja: {
    title: "マイナスワン音源の作り方：曲から自分のパートを消して練習する",
    heading: "自分のパートを消して練習する（マイナスワン音源の作り方）",
    nav: "自分のパートを消して練習する",
    description:
      "AI で曲からボーカル・ベース・ドラムなどを消して、バンドのほかのパートに合わせて練習する方法。楽器ごとのマイナスワン音源の作り方、フェーダーの設定、分離の限界まで。",
    body: () => `
<p class="lead">マイナスワン（マイナスワン音源）は、曲から 1 つのパート、つまり自分のパートだけを抜いた音源です。バンドのメンバーがいないときに、いちばんリハーサルに近い練習ができます。Band Stem Mixer なら、手持ちの音源から作れます。</p>

<nav class="toc" aria-label="目次"><b>目次</b><ol>
  <li><a href="#why">マイナスワンで練習する理由</a></li>
  <li><a href="#how">3 ステップで作る</a></li>
  <li><a href="#parts">楽器ごとの設定</a></li>
  <li><a href="#guide">自分のパートを少し残す</a></li>
  <li><a href="#limits">分離の仕上がりについて</a></li>
  <li><a href="#rights">使える曲</a></li>
</ol></nav>

<h2 id="why">マイナスワンで練習する理由</h2>
<p>原曲に合わせて一人で練習すると、録音の中のプレイヤーも同じパートを弾いています。自分の音にお手本の音が重なるので、弾けていない部分にも気づきにくくなります。自分のパートを消すと、</p>
<ul>
  <li>バンドの中で自分が出している音だけがそのまま聞こえる。</li>
  <li>ステージと同じように、自分でリズムをキープする必要がある（入りを間違えても誰も助けてくれない）。</li>
  <li>サビに入る前のドラムのフィルや、ソロの下のベースラインなど、ほかのパートが何をしているかを覚えられる。</li>
</ul>

<h2 id="how">3 ステップで作る</h2>
<ol>
  <li><b>曲を分離する</b>（ボーカル・ドラム・ベース・その他。<a href="../guide/">使い方ガイド</a>を参照）。</li>
  <li><b>自分のパートの M を押す。</b>そのパートが消えた状態で曲が流れます。</li>
  <li><b>保存する。</b>スタジオでスマホから流すなど、ほかの場所でも使いたいときは「このミックスを保存（MP3）」で保存します。</li>
</ol>

<h2 id="parts">楽器ごとの設定</h2>
<div class="table-wrap">
  <table class="text stack">
    <thead><tr><th scope="col">担当</th><th scope="col">ミュート</th><th scope="col">コツ</th></tr></thead>
    <tbody>
      <tr><th scope="row">ボーカル</th><td data-label="ミュート：">ボーカル</td><td data-label="コツ：">カラオケ音源になります。コーラス・ハモリもふつうはボーカルに入るので、一緒に消えます。高さが合わないときはキーを動かします（ドラム以外が動きます）。</td></tr>
      <tr><th scope="row">ベース</th><td data-label="ミュート：">ベース</td><td data-label="コツ：">ドラムを少し上げる（110〜120%）と、キックに合わせやすくなります。</td></tr>
      <tr><th scope="row">ドラム</th><td data-label="ミュート：">ドラム</td><td data-label="コツ：">ベースを上げるとグルーヴをつかみやすくなります。クリックがないので、テンポを保つのは自分の役目です。</td></tr>
      <tr><th scope="row">ギター・鍵盤</th><td data-label="ミュート：">その他</td><td data-label="コツ：">ギターと鍵盤は同じパートに入るので、「その他」をミュートすると両方消えます。両方入っている曲では、ミュートせずに 30% くらいに下げて、その上で弾くのも手です。</td></tr>
    </tbody>
  </table>
</div>
<p>フェーダーは ${FADER_MAX}% まで上げられるので、原曲では聞こえにくいパートを大きくすることもできます。</p>

<h2 id="guide">自分のパートを少し残す</h2>
<p>最終的には完全にミュートするのが目標ですが、最初からそうする必要はありません。曲を覚えている途中なら、ミュートせずに 20〜30% くらいに下げておくと、どこで何を弾くかが分かりつつ、自分の音のほうが大きく聞こえます。練習のたびに少しずつ下げ、要らなくなったらミュートします。</p>
<p>聞き取りにくいフレーズは、先にソロで確かめましょう。<a href="../learn-by-ear/">ベースとドラムを聞き取る</a>で説明しています。</p>
<p>バンドでハモリを歌う人は、ボーカルからハモリを作って同じように練習できます。<a href="../harmony/">ハモリの練習</a>をご覧ください。バンドのキーや、半音下げチューニングの曲に合わせたいときは、<a href="../chords-and-key/#key">キーを変える</a>を見てください。</p>

<h2 id="limits">分離の仕上がりについて</h2>
<ul>
  <li><b>自分のパートが少し残ることがあります。</b>AI はミックスから各パートを推定しているので、特に音の大きい部分では、ミュートしたパートがかすかに聞こえることがあります。</li>
  <li><b>ほかの音が少し変わることがあります。</b>ベースの音と重なったスネアの音の輪郭など、自分のパートと重なっていた部分です。</li>
  <li><b>ギターと鍵盤は分かれません。</b>どちらも「その他」に入ります。</li>
</ul>
<p>練習にはたいてい十分です。きれいに分離するコツは<a href="../better-results/">うまく分離するコツ</a>、なぜそうなるかは<a href="../how-it-works/">AI 音源分離の仕組み</a>で説明しています。</p>

<h2 id="rights">使える曲</h2>
<p>自分たちで録音した曲や、使う権利のある音源を使ってください。自分の練習のために分離することと、他人の曲の分離したパートやマイナスワン音源を公開・配布することは別で、後者にはふつう権利者の許可が必要です。音楽配信サービスの曲はアプリで開けません。</p>
`,
  },
};

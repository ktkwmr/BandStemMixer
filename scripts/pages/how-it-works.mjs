// Article: how AI music source separation works (Demucs htdemucs), and its limits.
// Facts about Demucs are from its README and paper (Rouard, Massa, Défossez, ICASSP 2023) and
// facebookresearch/demucs#327 (the weights' license); see docs/article-review.md.
import { MODEL_MB, CHUNK_SEC, chunksFor } from "./app.mjs";

const EXAMPLE_SEC = 4 * 60; // a 4-minute song

export default {
  slug: "how-it-works",
  en: {
    title: "How AI Music Source Separation Works (Demucs) — and Why It Is Not Perfect",
    heading: "How AI music separation works, and why it is not perfect",
    nav: "How AI separation works",
    description:
      "How an AI model like Demucs splits a mixed song into vocals, drums, bass, and other: what it learns, why sounds leak between parts, why guitar and keys stay together, how Band Stem Mixer runs it in your browser, and how it finds chords, makes harmonies, and changes the key.",
    body: () => `
<p class="lead">Once a song is mixed, the instruments are added together into one waveform (two, in stereo). There is no switch that takes them apart again. AI separation works by <b>estimating</b> what each instrument must have sounded like — very well, but not perfectly. Knowing how helps you get the most out of it.</p>

<nav class="toc" aria-label="Contents"><b>Contents</b><ol>
  <li><a href="#problem">Why separating a mix is hard</a></li>
  <li><a href="#learn">How the AI learns to separate</a></li>
  <li><a href="#demucs">The model: Demucs (htdemucs)</a></li>
  <li><a href="#parts">Why four parts, and why guitar and keys stay together</a></li>
  <li><a href="#leak">Why sounds leak between parts</a></li>
  <li><a href="#browser">How it runs in your browser</a></li>
  <li><a href="#chords">Chords, harmony, and key change (without AI)</a></li>
</ol></nav>

<h2 id="problem">Why separating a mix is hard</h2>
<p>Instruments in a band share the same range of frequencies. A bass note's harmonics overlap the guitar; a snare hit spreads over almost every frequency; a singer and a guitar can play the same note at the same time. In the mixed recording these sounds are added together, and many different combinations of instruments could have produced the same mix. Older methods used simple tricks — for example removing what is in the center of a stereo mix to remove the vocals — which also removed the bass and the kick drum, and left the vocal reverb behind.</p>

<h2 id="learn">How the AI learns to separate</h2>
<p>A separation model is trained on songs for which the separate recordings of each part (the “stems”) are available. During training it hears the mix, makes its guess for each part, and is corrected by comparing the guess with the real stems — many thousands of times, across many songs. It learns what a voice, a bass, and a drum kit typically sound like, and uses that knowledge to pull them apart in songs it has never heard.</p>
<p>Because the model learned from examples, it does best on music like what it was trained on — mainly pop and rock with a typical band setup — and can be less sure with unusual instruments or sounds.</p>

<h2 id="demucs">The model: Demucs (htdemucs)</h2>
<p>Band Stem Mixer uses <b>Demucs</b>, a music separation model published by Meta AI researchers, in its <b>Hybrid Transformer</b> version (<code>htdemucs</code>, Rouard, Massa, and Défossez, ICASSP 2023):</p>
<ul>
  <li><b>Hybrid</b> – It looks at the sound in two ways at once: as a waveform (how the signal moves over time) and as a spectrogram (which frequencies are present at each moment). Each view is better at some sounds: sharp drum hits are clear in the waveform, held notes in the spectrogram.</li>
  <li><b>Transformer</b> – In its middle, a Transformer (the type of neural network used in many recent AI models) relates every moment of the section to every other, and the two views to each other.</li>
  <li><b>Training data</b> – According to the Demucs documentation, it was trained on the MUSDB HQ dataset plus 800 extra songs.</li>
  <li><b>Accuracy</b> – The documentation reports a signal-to-distortion ratio (SDR) of 9.00 dB on the MUSDB HQ test set. SDR measures how close the separated parts are to the real stems; it is a standard way to compare models, not a measure of how good it sounds to you.</li>
</ul>
<p>The trained model (its “weights”) is provided by Meta <b>for scientific purposes only</b> and is not covered by the MIT license of the Demucs code. This is why Band Stem Mixer is non-commercial, with no ads.</p>

<h2 id="parts">Why four parts, and why guitar and keys stay together</h2>
<p>The four parts — vocals, drums, bass, and other — come from the datasets the model was trained on, which provide stems in those four groups. “Other” is everything else: guitars, keys, synths, strings, horns. The model never learned to tell those apart, so they come out together.</p>
<p>Demucs also has an experimental six-part version that adds guitar and piano. Its own documentation says guitar quality seems okay but piano has a lot of bleeding and artifacts, and it needs more memory; it ran out of memory in a browser during our tests, so Band Stem Mixer uses the four-part model.</p>

<h2 id="leak">Why sounds leak between parts</h2>
<p>The model's output is its best estimate, so some sounds end up in the wrong part, or in two parts at once (called <b>bleeding</b>):</p>
<ul>
  <li>Sounds that share frequencies and timing are hardest: the kick drum and the bass, a sung note doubled by a guitar.</li>
  <li><b>Reverb and effects</b> blur instruments into each other, so the echo of a voice can stay in “Other”.</li>
  <li>Loud, heavily compressed or distorted mixes give the model less to go on. Lossy files (low-bitrate MP3) have already lost detail.</li>
  <li>Instruments the model rarely heard in training can be split between parts — a synth bass may land partly in “Bass” and partly in “Other”.</li>
</ul>
<p>For practice — muting your part or hearing a line clearly — this is rarely a problem. For tips, see <a href="../better-results/">how to get better separation</a>.</p>

<h2 id="browser">How it runs in your browser</h2>
<p>Usually a model like this runs on a server. Band Stem Mixer runs it on your own device, so your song is never uploaded:</p>
<ul>
  <li>The browser downloads the model (about ${MODEL_MB} MB, converted to the ONNX format) once and keeps it.</li>
  <li><b>ONNX Runtime Web</b> runs the model, on the graphics chip (GPU) through WebGPU when the browser supports it, otherwise on the processor (CPU).</li>
  <li>This model takes ${CHUNK_SEC} seconds of sound at a time, so the song is cut into sections that overlap by a quarter, and the overlaps are cross-faded so no seams can be heard. A 4-minute song is ${chunksFor(EXAMPLE_SEC)} sections — the count you see on the progress bar.</li>
  <li>Each section needs a lot of memory — about 1 GB while the model runs. That is why computers are much faster, and why some phones cannot finish.</li>
</ul>
<p>Once separated, the four parts are played together in sync, and the mixer only changes their volumes, so moving a fader is instant.</p>

<h2 id="chords">Chords, harmony, and key change (without AI)</h2>
<p>The chords, the harmony, and the key change do not use an AI model. They are classic signal-processing methods, written in JavaScript and run in the browser, that work much better on the separated parts than on the full mix:</p>
<ul>
  <li><b>Beats and tempo</b> – the moments where new sounds start, the interval between them that repeats most (autocorrelation), and the chain of beats that fits both best (dynamic programming, after D. Ellis, 2007).</li>
  <li><b>Chords</b> – for each beat, the strength of each of the 12 notes (a “chroma”) in the bass and “Other” parts, compared with the 24 major and minor chords; a hidden Markov model keeps the chords from changing on every beat without reason. Without guitar and vocals mixed in, the bass part makes the root of each chord much clearer.</li>
  <li><b>Melody</b> – the pitch of the separated vocals, found with the YIN method and cut into notes.</li>
  <li><b>Harmony voice</b> – the vocals moved to the harmony notes with TD-PSOLA, which repeats or skips single cycles of the voice, so the voice keeps its character. Pitch correction (like Auto-Tune) can pull it toward the exact harmony notes.</li>
  <li><b>Key change</b> – a phase vocoder that stretches each part in time by the pitch ratio and plays it back at the original length.</li>
</ul>
<p>Like the separation, these are estimates. See <a href="../chords-and-key/#limits">what to expect from the chords</a> and <a href="../harmony/#limits">from the harmony</a>.</p>
`,
  },
  ja: {
    title: "AI 音源分離の仕組み（Demucs）と、完璧に分かれない理由",
    heading: "AI 音源分離の仕組みと、完璧に分かれない理由",
    nav: "AI 音源分離の仕組み",
    description:
      "Demucs などの AI がミックスされた曲をボーカル・ドラム・ベース・その他に分ける仕組み。何を学習しているか、なぜパートの間で音が混ざるか、なぜギターと鍵盤が分かれないか、ブラウザでどう動かしているか。コード推定・ハモリ・キー変更の仕組みも。",
    body: () => `
<p class="lead">ミックスされた曲では、楽器の音が足し合わされて 1 つ（ステレオなら 2 つ）の波形になっています。元に戻すスイッチはありません。AI による音源分離は、各楽器がどんな音だったはずかを<b>推定</b>する方法です。とてもよく推定できますが、完璧ではありません。仕組みを知っておくと、上手に使えます。</p>

<nav class="toc" aria-label="目次"><b>目次</b><ol>
  <li><a href="#problem">ミックスを分けるのが難しい理由</a></li>
  <li><a href="#learn">AI が分け方を学ぶ方法</a></li>
  <li><a href="#demucs">使っているモデル：Demucs（htdemucs）</a></li>
  <li><a href="#parts">4 パートである理由と、ギターと鍵盤が分かれない理由</a></li>
  <li><a href="#leak">パートの間で音が混ざる理由</a></li>
  <li><a href="#browser">ブラウザの中で動かす仕組み</a></li>
  <li><a href="#chords">コード・ハモリ・キー変更の仕組み（AI なし）</a></li>
</ol></nav>

<h2 id="problem">ミックスを分けるのが難しい理由</h2>
<p>バンドの楽器は、同じ周波数の範囲を共有しています。ベースの倍音はギターと重なり、スネアの音はほぼすべての周波数に広がり、歌とギターが同時に同じ音を出すこともあります。ミックスではこれらが足し合わされていて、同じミックスになる楽器の組み合わせはいくらでも考えられます。昔ながらの方法は、たとえば「ステレオの中央にある音を消してボーカルを消す」といった単純なもので、ベースやキックまで消え、ボーカルの残響は残ってしまいました。</p>

<h2 id="learn">AI が分け方を学ぶ方法</h2>
<p>分離のモデルは、パートごとの録音（ステム）がそろっている曲で学習します。学習中はミックスを聞いて各パートを推定し、本物のステムと比べて修正されることを、たくさんの曲で何千回も繰り返します。そうして、声・ベース・ドラムがふつうどんな音かを覚え、初めて聞く曲でもその知識でパートを分けます。</p>
<p>例から学んでいるので、学習した音楽に近いもの（主にポップス・ロックの一般的なバンド編成）ほどうまく分けられ、珍しい楽器や音は苦手なことがあります。</p>

<h2 id="demucs">使っているモデル：Demucs（htdemucs）</h2>
<p>Band Stem Mixer は、Meta の研究者が公開した音源分離モデル <b>Demucs</b> の <b>Hybrid Transformer</b> 版（<code>htdemucs</code>。Rouard、Massa、Défossez、ICASSP 2023）を使っています。</p>
<ul>
  <li><b>ハイブリッド</b> – 音を 2 つの見方で同時に扱います。波形（信号が時間とともにどう動くか）と、スペクトログラム（各瞬間にどの周波数があるか）です。ドラムの鋭い音は波形で、伸ばした音はスペクトログラムで捉えやすく、それぞれ得意な音が違います。</li>
  <li><b>Transformer</b> – 中心部には Transformer（最近の多くの AI で使われるニューラルネットワークの一種）があり、区間の中のあらゆる時点どうし、また 2 つの見方どうしを関連づけます。</li>
  <li><b>学習データ</b> – Demucs の説明によると、MUSDB HQ データセットと、それとは別の 800 曲で学習しています。</li>
  <li><b>精度</b> – 説明では、MUSDB HQ のテスト用の曲で SDR（信号対歪み比）9.00 dB とされています。SDR は分離したパートが本物のステムにどれだけ近いかを測る指標で、モデルどうしを比べるための標準的な数字です。聞いたときの良さを表すものではありません。</li>
</ul>
<p>学習済みのモデル（重み）は、Meta が<b>科学研究目的に限って</b>提供しているもので、Demucs のコードの MIT ライセンスの対象外です。このため Band Stem Mixer は広告を付けず、非営利で運営しています。</p>

<h2 id="parts">4 パートである理由と、ギターと鍵盤が分かれない理由</h2>
<p>ボーカル・ドラム・ベース・その他の 4 つは、モデルが学習したデータセットのステムの分け方から来ています。「その他」はギター・鍵盤・シンセ・ストリングス・管楽器など残りすべてで、モデルはこれらを区別することを学んでいないので、まとめて出てきます。</p>
<p>Demucs にはギターとピアノを足した 6 パートの試験的な版もありますが、Demucs 自身の説明でも、ギターはまずまずの品質に見える一方、ピアノは音の混ざりやノイズが多いとされています。メモリも多く必要で、私たちのテストではブラウザでメモリが足りなくなったため、Band Stem Mixer では 4 パートのモデルを使っています。</p>

<h2 id="leak">パートの間で音が混ざる理由</h2>
<p>モデルの出力はあくまで推定なので、一部の音が違うパートに入ったり、2 つのパートに分かれて入ったりします（<b>かぶり</b>、ブリードと呼びます）。</p>
<ul>
  <li>周波数もタイミングも重なる音ほど難しくなります（キックとベース、ギターが重ねた歌のメロディなど）。</li>
  <li><b>リバーブやエフェクト</b>は楽器どうしをぼかすので、声の残響が「その他」に残ることがあります。</li>
  <li>音圧を強く上げたミックスや歪んだ音は、手がかりが少なくなります。ビットレートの低い MP3 などは、すでに細かい情報が失われています。</li>
  <li>学習であまり聞いていない楽器は、パートに分かれて入ることがあります（シンセベースが「ベース」と「その他」に分かれるなど）。</li>
</ul>
<p>自分のパートを消す、フレーズを聞き取るといった練習では、ほとんど問題になりません。コツは<a href="../better-results/">うまく分離するコツ</a>にまとめています。</p>

<h2 id="browser">ブラウザの中で動かす仕組み</h2>
<p>このようなモデルは、ふつうはサーバーで動かします。Band Stem Mixer は自分の端末の中で動かすので、曲をアップロードしません。</p>
<ul>
  <li>ブラウザがモデル（ONNX 形式に変換したもの、約 ${MODEL_MB} MB）を 1 回だけダウンロードして保存します。</li>
  <li><b>ONNX Runtime Web</b> がモデルを動かします。ブラウザが WebGPU に対応していればグラフィックス（GPU）で、そうでなければプロセッサ（CPU）で処理します。</li>
  <li>このモデルは一度に ${CHUNK_SEC} 秒ずつしか扱えないので、曲を 4 分の 1 ずつ重ねた区間に分け、重なりをクロスフェードしてつなぎ目が聞こえないようにします。4 分の曲なら ${chunksFor(EXAMPLE_SEC)} 区間で、進み具合のバーに出る数です。</li>
  <li>1 区間の処理に約 1 GB のメモリを使います。パソコンのほうがずっと速く、スマホでは最後まで分離できない機種があるのはこのためです。</li>
</ul>
<p>分離が終わると 4 つのパートをそろえて再生し、ミキサーは音量だけを変えるので、フェーダーを動かすとすぐに反映されます。</p>

<h2 id="chords">コード・ハモリ・キー変更の仕組み（AI なし）</h2>
<p>コードの推定・ハモリ・キーの変更には AI モデルを使っていません。昔からある信号処理の方法を JavaScript で書いて、ブラウザで動かしています。ミックス全体より、分離したパートに使うほうがずっとうまくいきます。</p>
<ul>
  <li><b>拍とテンポ</b> – 新しい音が鳴り始める位置と、その間隔でいちばん繰り返されるもの（自己相関）を調べ、両方にいちばん合う拍の並びを決めます（動的計画法。D. Ellis、2007 年の方法）。</li>
  <li><b>コード</b> – 拍ごとに、ベースと「その他」のパートで 12 の音それぞれがどれだけ鳴っているか（クロマ）を調べ、24 のメジャー・マイナーのコードと比べます。隠れマルコフモデルで、理由なく 1 拍ごとにコードが変わらないようにします。ギターや歌が混ざっていないベースのパートは、コードのルートを見つける大きな手がかりになります。</li>
  <li><b>旋律</b> – 分離したボーカルの音程を YIN という方法で調べ、音符に区切ります。</li>
  <li><b>ハモリ（声）</b> – TD-PSOLA という方法で、ボーカルの波の 1 周期ずつを重ねたり間引いたりして音程を変えるので、声の感じが残ります。音程補正（Auto-Tune のような処理）で、正しいハモリの音に寄せることもできます。</li>
  <li><b>キーの変更</b> – フェーズボコーダーで、各パートを音程の比率だけ時間方向に伸ばし、元の長さで再生し直します。</li>
</ul>
<p>分離と同じく、これらも推定です。<a href="../chords-and-key/#limits">コードの仕上がり</a>と<a href="../harmony/#limits">ハモリの仕上がり</a>もご覧ください。</p>
`,
  },
};

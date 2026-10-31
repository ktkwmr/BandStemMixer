// Questions and answers. The answers are HTML; build-pages.mjs also puts a plain-text
// copy in the FAQPage structured data.
import { MODEL_MB, MAX_MIN, MAX_MIN_LOW_MEM, KBPS } from "./app.mjs";

const EN = [
  { q: "Is Band Stem Mixer free?", a: "Yes. It is free, with no sign-up, no account, and no ads." },
  {
    q: "Is my song uploaded?",
    a: 'No. The song is read, separated, and played only in your browser. Nothing about it is sent anywhere. See the <a href="../privacy/">privacy policy</a>.',
  },
  {
    q: "Which parts does it separate?",
    a: "Four: vocals, drums, bass, and other. “Other” is everything else — guitars, keys, synths, strings — together. Backing vocals usually come out with the vocals.",
  },
  {
    q: "Can it separate the guitar and the piano?",
    a: 'No. They both go to “Other”. The model was trained to separate four parts; see <a href="../how-it-works/#parts">why guitar and keys stay together</a>.',
  },
  {
    q: "Which files can I open?",
    a: `Any audio format your browser can play: MP3, WAV, M4A (AAC), FLAC, Ogg, and others. Songs up to ${MAX_MIN} minutes (${MAX_MIN_LOW_MEM} minutes on phones and tablets).`,
  },
  {
    q: "Can I use songs from Apple Music, Spotify, or YouTube?",
    a: "No. Music from streaming services is protected and cannot be opened in other apps. Use audio files you have, such as recordings of your band or songs you bought as files.",
  },
  {
    q: "How long does it take?",
    a: "On a recent computer, about the length of the song or a few times longer; faster with a browser that supports WebGPU. Phones and tablets take longer. The progress bar shows about how long is left.",
  },
  {
    q: "Why is there a large download?",
    a: `The AI model (about ${MODEL_MB} MB) runs on your device, so the browser has to download it once. It is kept, so the next time there is no download. On mobile data the app asks first. ⚙ → “Delete the AI model” frees the space.`,
  },
  {
    q: "The page reloaded, or separation stopped partway.",
    a: 'The device ran out of memory. Close other tabs and apps and try again: the app uses a lighter setting next time. If it keeps stopping, separate the song on a computer. See <a href="../better-results/#memory">if it stops partway</a>.',
  },
  {
    q: "Does it work on iPhone?",
    a: "The mixer and saved MP3 files work, but separating may not: iPhones and iPads can run out of memory while separating, and the page reloads. We recommend separating on a computer and playing the saved MP3 files on the iPhone.",
  },
  {
    q: "I can still hear a little of the part I muted.",
    a: 'AI separation is an estimate, so traces of a part can remain in the others. It is usually quieter than the rest; turning the other parts up a little helps. See <a href="../how-it-works/#leak">why sounds leak between parts</a>.',
  },
  {
    q: "Are the separated parts saved?",
    a: `Not in the app: they are gone when you reload or choose another song, and so are the chords and the harmony. Save the ones you want as MP3 files (${KBPS} kbps) with the ↓ buttons or “Save this mix (MP3)”. The mixer settings (faders, mute, master volume) are remembered.`,
  },
  {
    q: "Can it find the chords of a song?",
    a: 'Yes. After separating, press “Find chords & make harmony”: it finds the tempo (BPM) and a chord on every beat. Only major and minor chords are found automatically, and they can be wrong, so each beat can be edited by hand (including 7, maj7, m7, add9, dim7, m7b5, aug, and sus4). See <a href="../chords-and-key/">chords and key change</a>.',
  },
  {
    q: "Can it make a harmony part?",
    a: 'Yes: a 3rd or a 5th above or below the vocal melody, as the singer\'s voice moved to the harmony notes and as a plain guide tone, each with its own fader. It is chosen to fit the key and the chords, and it is an estimate. See <a href="../harmony/">practicing harmonies</a>.',
  },
  {
    q: "Can I change the key?",
    a: 'Yes, up to 12 semitones up or down, without changing the tempo. The vocals, bass, and other move; the drums do not. The chord names and the harmony follow. See <a href="../chords-and-key/#key">changing the key</a>.',
  },
  {
    q: "The chords or the harmony are wrong after a key change partway through the song.",
    a: "The app treats a song as one key and one tempo. After a key change or a tempo change, the harmony and the beats can be off; fix the chords by hand where needed and press “Remake the harmony”.",
  },
  {
    q: "Can I publish the parts or a karaoke version I made?",
    a: "Only for songs whose rights you have, such as your own band's recordings. Publishing or sharing separated parts of someone else's song usually needs the permission of the rights holders.",
  },
  {
    q: "Can I use it offline?",
    a: "After your first separation, the app, the AI model, and the separation engine are kept on your device, so it opens and separates without a connection. You can also add it to your home screen.",
  },
];

const JA = [
  { q: "無料ですか？", a: "はい。無料で、登録やアカウントは不要、広告もありません。" },
  {
    q: "曲はアップロードされますか？",
    a: 'いいえ。曲の読み込み・分離・再生はブラウザの中だけで行い、曲に関する情報はどこにも送りません。<a href="../privacy/">プライバシーポリシー</a>をご覧ください。',
  },
  {
    q: "どのパートに分かれますか？",
    a: "ボーカル・ドラム・ベース・その他の 4 つです。「その他」はギター・鍵盤・シンセ・ストリングスなど残りすべてをまとめたものです。コーラスはふつうボーカルに入ります。",
  },
  {
    q: "ギターとピアノを分けられますか？",
    a: 'できません。どちらも「その他」に入ります。モデルが 4 パートに分けるように学習しているためです。<a href="../how-it-works/#parts">ギターと鍵盤が分かれない理由</a>をご覧ください。',
  },
  {
    q: "どんなファイルを開けますか？",
    a: `ブラウザで再生できる形式（MP3・WAV・M4A（AAC）・FLAC・Ogg など）です。長さは ${MAX_MIN} 分まで（スマホ・タブレットでは ${MAX_MIN_LOW_MEM} 分まで）。`,
  },
  {
    q: "Apple Music・Spotify・YouTube の曲は使えますか？",
    a: "使えません。配信サービスの曲は保護されていて、ほかのアプリでは開けません。バンドの録音や、ファイルで購入した曲など、手持ちの音源ファイルを使ってください。",
  },
  {
    q: "どのくらい時間がかかりますか？",
    a: "最近のパソコンで、曲の長さと同じくらいから数倍です。WebGPU に対応したブラウザなら速くなります。スマホ・タブレットではさらにかかります。残り時間の目安はバーの下に出ます。",
  },
  {
    q: "大きなダウンロードがあるのはなぜですか？",
    a: `AI モデル（約 ${MODEL_MB} MB）を端末の中で動かすので、最初に 1 回ダウンロードする必要があります。端末に保存するので、2 回目からはダウンロードしません。モバイルデータ通信のときは先に確認します。⚙ →「AI モデルを削除」で容量を空けられます。`,
  },
  {
    q: "ページが読み込み直された・分離が途中で止まりました。",
    a: '端末のメモリが足りなくなっています。ほかのタブやアプリを閉じてもう一度試してください。次はより軽い設定で分離します。何度も止まるときはパソコンで分離してください。<a href="../better-results/#memory">途中で止まるときは</a>もご覧ください。',
  },
  {
    q: "iPhone で使えますか？",
    a: "ミキサーと保存した MP3 は使えますが、分離はできないことがあります。iPhone・iPad では分離中にメモリが足りなくなり、ページが読み込み直されることがあります。パソコンで分離して、保存した MP3 を iPhone で再生するのがおすすめです。",
  },
  {
    q: "ミュートしたパートが少し聞こえます。",
    a: 'AI の分離は推定なので、ほかのパートにその音が少し残ることがあります。たいていは周りより小さいので、ほかのパートを少し上げると目立たなくなります。<a href="../how-it-works/#leak">パートの間で音が混ざる理由</a>をご覧ください。',
  },
  {
    q: "分離したパートは保存されますか？",
    a: `アプリには残りません。ページを読み込み直したり別の曲を選んだりすると、コードやハモリと一緒に消えます。残したいものは ↓ ボタンや「このミックスを保存（MP3）」で MP3（${KBPS} kbps）にしてください。ミキサーの設定（音量・ミュート・全体の音量）は次回も残ります。`,
  },
  {
    q: "曲のコードを調べられますか？",
    a: '調べられます。分離したあと「コード推定＆ハモリ生成」を押すと、テンポ（BPM）と 1 拍ごとのコードを推定します。自動で推定するのはメジャーとマイナーだけで、間違うこともあるので、拍ごとに手で直せます（7・maj7・m7・add9・dim7・m7b5・aug・sus4 も選べます）。<a href="../chords-and-key/">コード表示とキー変更</a>をご覧ください。',
  },
  {
    q: "ハモリのパートを作れますか？",
    a: '作れます。ボーカルの旋律の 3 度か 5 度の上か下に、歌い手の声をハモリの音程に変えたものと、単純なガイド音の 2 つを作り、それぞれ音量を変えられます。キーとコードに合うように選びますが、推定なので外れることもあります。<a href="../harmony/">ハモリの練習</a>をご覧ください。',
  },
  {
    q: "キーを変えられますか？",
    a: 'テンポはそのままで、上下 12 半音まで変えられます。ボーカル・ベース・その他が動き、ドラムは動きません。コード名とハモリも一緒に変わります。<a href="../chords-and-key/#key">キーを変える</a>をご覧ください。',
  },
  {
    q: "転調する曲で、途中からコードやハモリが合いません。",
    a: "アプリは曲全体を 1 つのキー・1 つのテンポとして扱います。転調やテンポの変化のあとは、ハモリや拍がずれることがあります。必要なところのコードを手で直して「ハモリを再生成」を押してください。",
  },
  {
    q: "作ったパートやカラオケ音源を公開してもいいですか？",
    a: "自分たちのバンドの録音など、権利を持っている曲だけにしてください。他人の曲を分離したパートを公開・配布するには、ふつう権利者の許可が必要です。",
  },
  {
    q: "オフラインで使えますか？",
    a: "一度分離すると、アプリ・AI モデル・分離のプログラムが端末に保存されるので、通信がなくても開いて分離できます。ホーム画面に追加することもできます。",
  },
];

const list = (items) => `<dl class="faq">\n${items.map((x) => `  <dt>${x.q}</dt>\n  <dd>${x.a}</dd>`).join("\n")}\n</dl>`;

export default {
  slug: "faq",
  faq: true,
  en: {
    title: "Band Stem Mixer FAQ",
    heading: "Frequently asked questions",
    nav: "FAQ",
    description:
      "Answers to common questions about Band Stem Mixer: privacy, which parts it separates, supported files, how long it takes, the AI model download, iPhone, leftover sounds, chords, harmony, key change, saving MP3 files, and offline use.",
    faq: EN,
    body: () => `<p class="lead">Short answers to common questions. For step-by-step instructions, see the <a href="../guide/">guide</a>.</p>\n${list(EN)}`,
  },
  ja: {
    title: "よくある質問（FAQ）",
    heading: "よくある質問",
    nav: "よくある質問",
    description:
      "Band Stem Mixer についてのよくある質問。プライバシー、分離するパート、開けるファイル、かかる時間、AI モデルのダウンロード、iPhone、残る音、コード、ハモリ、キーの変更、MP3 の保存、オフライン。",
    faq: JA,
    body: () => `<p class="lead">よくある質問への短い回答です。詳しい手順は<a href="../guide/">使い方ガイド</a>をご覧ください。</p>\n${list(JA)}`,
  },
};

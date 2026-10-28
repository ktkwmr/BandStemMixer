// Operator information (site information page, linked from the footer)
const ISSUES = "https://github.com/ktkwmr/BandStemMixer/issues";
const REPO = "https://github.com/ktkwmr/BandStemMixer";

export default {
  slug: "about",
  schemaType: "AboutPage",
  modified: "2026-10-28",
  en: {
    title: "About This Site",
    heading: "About this site",
    nav: "About this site",
    description: "Operator information for Band Stem Mixer: who runs the site, how to contact us, disclaimer, and copyright.",
    body: () => `
<div class="table-wrap">
  <table class="text stack">
    <tbody>
      <tr><th scope="row">Site name</th><td>Band Stem Mixer</td></tr>
      <tr><th scope="row">URL</th><td><a href="/bandstemmixer/">https://ktkwmr.com/bandstemmixer/</a></td></tr>
      <tr><th scope="row">Operator</th><td>ktkwmr (individual developer)</td></tr>
      <tr><th scope="row">What we offer</th><td>A free web app that separates a band song into 6 parts (vocals, guitar, bass, drums, piano, other) with AI on your device, and mixes them for practice</td></tr>
      <tr><th scope="row">Contact</th><td><a href="${ISSUES}" rel="noopener">GitHub Issues</a></td></tr>
    </tbody>
  </table>
</div>

<h2 id="contact">Contact</h2>
<p>For questions, bug reports, and suggestions, please open an issue on <a href="${ISSUES}" rel="noopener">GitHub Issues</a>. A GitHub account (free) is required.</p>
<p>Issues are public. Do not include personal information, and do not attach songs. If separation fails, the error message, the length and format of the file (for example <code>4:30, MP3</code>), your browser, and your device are enough.</p>

<h2 id="disclaimer">Disclaimer</h2>
<ul>
  <li>The separation is done by an AI model and is not perfect: sounds can leak between parts or be lost. We do not guarantee the quality of the separated parts or that the information on this site is correct or complete.</li>
  <li>Separation needs a lot of memory and processing. On some devices it can be slow or fail, and the device can get warm.</li>
  <li>Separate only recordings you made or have the rights to use. Publishing or distributing separated parts of other people's songs may infringe copyright. You are responsible for how you use the files.</li>
  <li>We are not responsible for any loss or damage resulting from the use of this site.</li>
  <li>Links to other websites are provided for convenience. We are not responsible for their content.</li>
  <li>The content of this site may be changed or removed, and the service may be stopped, without notice.</li>
</ul>

<h2 id="copyright">Copyright</h2>
<ul>
  <li>The app's source code is published under the <a href="${REPO}/blob/main/LICENSE" rel="noopener">MIT License</a>. The AI model (Demucs htdemucs_6s, MIT License) and the libraries used by the app are listed under Settings → About in the app.</li>
  <li>The text and images on this site are © 2026 ktkwmr.</li>
</ul>

<h2 id="privacy">Privacy</h2>
<p>How this site handles information is described in the <a href="../privacy/">privacy policy</a>.</p>
`,
  },
  ja: {
    title: "運営者情報",
    heading: "運営者情報",
    nav: "運営者情報",
    description: "Band Stem Mixer の運営者情報。運営者、お問い合わせ先、免責事項、著作権について。",
    body: () => `
<div class="table-wrap">
  <table class="text stack">
    <tbody>
      <tr><th scope="row">サイト名</th><td>Band Stem Mixer</td></tr>
      <tr><th scope="row">URL</th><td><a href="/bandstemmixer/ja/">https://ktkwmr.com/bandstemmixer/ja/</a></td></tr>
      <tr><th scope="row">運営者</th><td>ktkwmr（個人開発者）</td></tr>
      <tr><th scope="row">内容</th><td>バンドの曲を AI で端末の中で 6 つのパート（ボーカル・ギター・ベース・ドラム・ピアノ・その他）に分離し、練習用にミックスできる無料の Web アプリ</td></tr>
      <tr><th scope="row">お問い合わせ</th><td><a href="${ISSUES}" rel="noopener">GitHub の Issues</a></td></tr>
    </tbody>
  </table>
</div>

<h2 id="contact">お問い合わせ</h2>
<p>ご質問・不具合の報告・ご要望は、<a href="${ISSUES}" rel="noopener">GitHub の Issues</a> にお寄せください。投稿には GitHub のアカウント（無料）が必要です。</p>
<p>Issues の内容は公開されます。個人情報は書かず、曲のファイルも添付しないでください。分離に失敗したときは、エラーの文言、ファイルの長さと形式（例: <code>4:30・MP3</code>）、ブラウザと端末の種類があれば十分です。</p>

<h2 id="disclaimer">免責事項</h2>
<ul>
  <li>分離は AI モデルが行うもので、完全ではありません。パートの間で音が混ざったり、音が欠けたりすることがあります。分離したパートの品質や、本サイトの情報が正確・完全であることを保証するものではありません。</li>
  <li>分離には多くのメモリと処理が必要です。端末によっては時間がかかったり失敗したりし、端末が熱くなることがあります。</li>
  <li>分離するのは、自分で録音した音源か、使う権利のある音源だけにしてください。ほかの人の曲を分離したパートを公開・配布すると、著作権の侵害になることがあります。ファイルの使い方は利用者の責任となります。</li>
  <li>本サイトの利用によって生じた損害について、運営者は責任を負いません。</li>
  <li>本サイトからリンクしている外部サイトの内容について、運営者は責任を負いません。</li>
  <li>本サイトの内容は、予告なく変更・削除したり、提供を終了したりすることがあります。</li>
</ul>

<h2 id="copyright">著作権</h2>
<ul>
  <li>アプリのソースコードは <a href="${REPO}/blob/main/LICENSE" rel="noopener">MIT ライセンス</a>で公開しています。AI モデル（Demucs htdemucs_6s、MIT ライセンス）とアプリが使用しているライブラリは、アプリの「設定 → このアプリについて」に掲載しています。</li>
  <li>本サイトの文章と画像の著作権は ktkwmr に帰属します（© 2026 ktkwmr）。</li>
</ul>

<h2 id="privacy">プライバシー</h2>
<p>本サイトでの情報の取り扱いについては<a href="../privacy/">プライバシーポリシー</a>をご覧ください。</p>
`,
  },
};

// Privacy policy (site information page, linked from the footer and from the app's Privacy dialog).
// Includes the external-transmission notice required in Japan (電気通信事業法の外部送信規律).
// Update `modified` and the dates at the end when the content changes (for example when a service is added).
const ISSUES = "https://github.com/ktkwmr/BandStemMixer/issues";
const CLOUDFLARE = "https://www.cloudflare.com/privacypolicy/";
const GOOGLE = "https://policies.google.com/privacy";
const GOOGLE_PARTNERS = "https://policies.google.com/technologies/partner-sites";
const HUGGINGFACE = "https://huggingface.co/privacy";
const JSDELIVR = "https://www.jsdelivr.com/terms/privacy-policy-jsdelivr-net";

export default {
  slug: "privacy",
  schemaType: "WebPage",
  modified: "2026-11-28",
  en: {
    title: "Privacy Policy",
    heading: "Privacy policy",
    nav: "Privacy policy",
    description:
      "How Band Stem Mixer handles information: your song is separated on your device and never uploaded, the AI model and library downloads (Hugging Face, jsDelivr), data saved in your browser, analytics (Google Analytics only with your consent), cookies, and no ads.",
    body: () => `
<p class="lead">This policy explains how Band Stem Mixer (https://ktkwmr.com/bandstemmixer/, "this site") handles information. In short: your song is separated on your device and never uploaded. To do that, your browser downloads an AI model and a library from external services.</p>

<nav class="toc" aria-label="Contents"><b>Contents</b><ol>
  <li><a href="#app">What you do in the app</a></li>
  <li><a href="#storage">Data saved in your browser</a></li>
  <li><a href="#external">Information sent to external services</a></li>
  <li><a href="#cookies">Cookies and advertising</a></li>
  <li><a href="#analytics">Analytics</a></li>
  <li><a href="#third-party">Sharing with third parties</a></li>
  <li><a href="#contact">Contact</a></li>
  <li><a href="#changes">Changes to this policy</a></li>
</ol></nav>

<h2 id="app">1. What you do in the app</h2>
<p>The audio file you choose is read, separated into parts by the AI model, moved to another key when you ask, and played only in your browser. The file, the separated parts, and their names are never sent to our server or to anyone else. Saving a part or a mix as an MP3 file only saves it on your device. The app does not use the microphone. This site has no accounts, and we do not ask for your name, email address, or other personal information.</p>

<h2 id="storage">2. Data saved in your browser</h2>
<p>The following data is saved in your browser's storage on your device. It is not sent to us.</p>
<ul>
  <li><b>The AI model:</b> the model file (about 170 MB) downloaded the first time you separate a song, so it is not downloaded again.</li>
  <li><b>Mixer settings:</b> the level and mute of each part, the master volume, and whether the GPU is used.</li>
  <li><b>App files:</b> the pages and files of this site and the ONNX Runtime library, so the app works offline.</li>
</ul>
<p>Your songs and the separated parts are not saved in the browser; they are gone when you close or reload the page. To delete the data above, use “Reset mixer” and ⚙ → “Delete the AI model” in the app, or clear this site's data (site data, cookies, and storage for ktkwmr.com) in your browser settings.</p>

<h2 id="external">3. Information sent to external services</h2>
<p>When you use this site, your browser sends information to the following services. This list also serves as the notice of external transmission required under Japan's Telecommunications Business Act.</p>
<div class="table-wrap">
  <table class="text stack">
    <thead><tr><th scope="col">Service (operator)</th><th scope="col">When</th><th scope="col">Information sent</th><th scope="col">Purpose</th></tr></thead>
    <tbody>
      <tr><th scope="row"><a href="${CLOUDFLARE}" rel="noopener">Cloudflare</a> (Cloudflare, Inc.)</th><td data-label="When:">Every page and file request</td><td data-label="Information sent:">IP address, browser information (user agent), requested URL, date and time</td><td data-label="Purpose:">Hosting this site, security, and access logs for operation</td></tr>
      <tr><th scope="row"><a href="${CLOUDFLARE}" rel="noopener">Cloudflare Web Analytics</a> (Cloudflare, Inc.)</th><td data-label="When:">Every page view</td><td data-label="Information sent:">IP address, browser information (user agent), the URL of the page, referrer, page load time. No cookies are used.</td><td data-label="Purpose:">Counting page views (see "Analytics" below)</td></tr>
      <tr><th scope="row"><a href="${CLOUDFLARE}" rel="noopener">Cloudflare Zaraz</a> (Cloudflare, Inc.)</th><td data-label="When:">Every page view, and when you use the app (such as tapping a button)</td><td data-label="Information sent:">IP address, browser information (user agent), the URL of the page, referrer, and the usage events listed in "Analytics" below</td><td data-label="Purpose:">Showing the cookie banner, and passing usage events on to Google Analytics only if you agree</td></tr>
      <tr><th scope="row"><a href="${GOOGLE}" rel="noopener">Google Analytics</a> (Google LLC)</th><td data-label="When:">Only if you choose “Accept all” in the cookie banner: every page view, and when you use the app. Sent from Cloudflare's servers, not from your browser</td><td data-label="Information sent:">A random ID for your browser, the URL of the page, referrer, browser information, approximate location from a shortened IP address, and the usage events listed in "Analytics" below</td><td data-label="Purpose:">Understanding how the site is used, to improve it (see "Analytics" below)</td></tr>
      <tr><th scope="row"><a href="${HUGGINGFACE}" rel="noopener">Hugging Face</a> (Hugging Face, Inc.)</th><td data-label="When:">The first time you separate a song (until the model is saved in your browser)</td><td data-label="Information sent:">IP address, browser information (user agent), the URL of the model file, date and time. Nothing about your song is sent.</td><td data-label="Purpose:">Downloading the AI model (Demucs htdemucs)</td></tr>
      <tr><th scope="row"><a href="${JSDELIVR}" rel="noopener">jsDelivr</a> (a CDN run by Prospect One and its partners)</th><td data-label="When:">When you separate a song (until the library is saved in your browser)</td><td data-label="Information sent:">IP address, browser information (user agent), the URL of the library file, the page that requested it (referrer), date and time</td><td data-label="Purpose:">Downloading ONNX Runtime Web, the library that runs the AI model, demucs-web, which prepares the audio for it, and (when you save a file) lamejs, which makes the MP3</td></tr>
    </tbody>
  </table>
</div>

<h2 id="cookies">4. Cookies and advertising</h2>
<p>This site uses cookies only for analytics:</p>
<ul>
  <li><b>Your choice in the cookie banner</b> (set by Cloudflare Zaraz when you choose), so the banner is not shown again. The choice applies to all apps on ktkwmr.com.</li>
  <li><b>A random ID for Google Analytics</b>, only if you choose “Accept all”, to count returning visits. It does not contain your name or other personal details.</li>
</ul>
<p>You can change your choice at any time from “Cookie settings” at the bottom of each page. This site does not show ads. If we add ads in the future, we will update this policy before they are shown.</p>

<h2 id="analytics">5. Analytics</h2>
<p>To see how many people use this site, we use <b>Cloudflare Web Analytics</b>. It counts page views without cookies and without identifying or tracking individual visitors across sites.</p>
<p>To learn how the app and the guides are used, so we can improve them, we also use <b>Google Analytics</b> through <b>Cloudflare Zaraz</b>, <b>only if you agree</b> in the cookie banner. It records:</p>
<ul>
  <li>the pages viewed, how long they were open, and where you came from (referrer);</li>
  <li>the buttons and links tapped, and the settings changed (by name, and for settings their value, such as “Bass: muted” or “Key: +2”);</li>
  <li>how long music was played;</li>
  <li>the kind and length of the song file opened (such as “MP3, 4.2 minutes”), and how the separation went (how long it took, which processing was used, or the kind of error);</li>
  <li>key changes and whether they worked, and which parts were saved as MP3;</li>
</ul>
<p>File names and the music itself are never sent. The data is sent to Google from Cloudflare's servers (your browser does not connect to Google), with the end of your IP address removed. Google signals and advertising features are turned off, and the data is kept for 14 months. See <a href="${GOOGLE_PARTNERS}" rel="noopener">how Google uses information from sites that use its services</a>.</p>
<p>If you choose “Reject all”, or do not choose, nothing is sent to Google Analytics.</p>

<h2 id="third-party">6. Sharing with third parties</h2>
<p>We do not collect personal information that identifies you, and we do not sell or provide it to third parties, except where required by law.</p>

<h2 id="contact">7. Contact</h2>
<p>For questions about this policy, please open an issue on <a href="${ISSUES}" rel="noopener">GitHub Issues</a>. See <a href="../about/">about this site</a> for the operator.</p>

<h2 id="changes">8. Changes to this policy</h2>
<p>We may update this policy when the site changes, for example when we add or remove a service. The updated policy applies from the time it is posted on this page.</p>
<p>Effective: October 28, 2026 (updated October 31, 2026: chord estimation, harmony, and key change added to section 1, all done in the browser; updated November 25, 2026: chord estimation and harmony removed, as they moved to a separate app; updated November 28, 2026: Google Analytics through Cloudflare Zaraz, only with your consent)</p>
`,
  },
  ja: {
    title: "プライバシーポリシー",
    heading: "プライバシーポリシー",
    nav: "プライバシーポリシー",
    description:
      "Band Stem Mixer のプライバシーポリシー。曲は端末の中で分離してアップロードしないこと、AI モデルとライブラリのダウンロード（Hugging Face・jsDelivr）、ブラウザに保存するデータ、アクセス解析（同意した場合のみ Google アナリティクス）、Cookie、広告がないことについて。",
    body: () => `
<p class="lead">Band Stem Mixer（https://ktkwmr.com/bandstemmixer/、以下「本サイト」）での情報の取り扱いについて説明します。要点は、曲は端末の中で分離し、どこにもアップロードしないことです。そのために、ブラウザが外部のサービスから AI モデルとライブラリをダウンロードします。</p>

<nav class="toc" aria-label="目次"><b>目次</b><ol>
  <li><a href="#app">アプリで行うこと</a></li>
  <li><a href="#storage">ブラウザに保存するデータ</a></li>
  <li><a href="#external">外部への情報の送信</a></li>
  <li><a href="#cookies">Cookie と広告</a></li>
  <li><a href="#analytics">アクセス解析</a></li>
  <li><a href="#third-party">第三者への提供</a></li>
  <li><a href="#contact">お問い合わせ</a></li>
  <li><a href="#changes">改定</a></li>
</ol></nav>

<h2 id="app">1. アプリで行うこと</h2>
<p>選んだ音声ファイルの読み込み、AI モデルによるパートへの分離、キーの変更、再生は、ブラウザの中だけで行います。ファイル、分離したパート、ファイル名が、運営者のサーバーやほかの誰かに送られることはありません。パートやミックスを MP3 ファイルで保存しても、端末に保存するだけです。マイクは使いません。本サイトにはアカウント登録はなく、氏名やメールアドレスなどの個人情報をお聞きすることもありません。</p>

<h2 id="storage">2. ブラウザに保存するデータ</h2>
<p>次のデータを、お使いの端末のブラウザ内に保存します。運営者に送られることはありません。</p>
<ul>
  <li><b>AI モデル：</b>次から再びダウンロードしなくて済むよう、初めて分離したときにダウンロードしたモデルのファイル（約 170 MB）を保存します。</li>
  <li><b>ミキサーの設定：</b>各パートの音量とミュート、全体の音量、GPU を使うかどうか。</li>
  <li><b>アプリのファイル：</b>オフラインでも使えるよう、本サイトのページやファイルと ONNX Runtime のライブラリを保存します。</li>
</ul>
<p>曲・分離したパートはブラウザに保存しません。ページを閉じたり再読み込みしたりすると消えます。上のデータを消したいときは、アプリの「ミキサーを元に戻す」と ⚙ →「AI モデルを削除」を使うか、ブラウザの設定でこのサイト（ktkwmr.com）のデータ（サイトデータ・Cookie・ストレージ）を削除してください。</p>

<h2 id="external">3. 外部への情報の送信</h2>
<p>本サイトを利用すると、お使いのブラウザから次のサービスに情報が送信されます。この一覧は、電気通信事業法の外部送信規律に基づく公表を兼ねています。</p>
<div class="table-wrap">
  <table class="text stack">
    <thead><tr><th scope="col">送信先（事業者）</th><th scope="col">送信のタイミング</th><th scope="col">送信される情報</th><th scope="col">利用目的</th></tr></thead>
    <tbody>
      <tr><th scope="row"><a href="${CLOUDFLARE}" rel="noopener">Cloudflare</a>（Cloudflare, Inc.）</th><td data-label="タイミング：">すべてのページ・ファイルの読み込み時</td><td data-label="送信される情報：">IP アドレス、ブラウザの情報（ユーザーエージェント）、アクセスした URL、日時</td><td data-label="利用目的：">本サイトの配信、セキュリティの確保、運用のためのアクセスログ</td></tr>
      <tr><th scope="row"><a href="${CLOUDFLARE}" rel="noopener">Cloudflare Web Analytics</a>（Cloudflare, Inc.）</th><td data-label="タイミング：">ページを開いたとき</td><td data-label="送信される情報：">IP アドレス、ブラウザの情報（ユーザーエージェント）、閲覧したページの URL、参照元、ページの表示速度。Cookie は使いません。</td><td data-label="利用目的：">ページの閲覧数の集計（「アクセス解析」の項目を参照）</td></tr>
      <tr><th scope="row"><a href="${CLOUDFLARE}" rel="noopener">Cloudflare Zaraz</a>（Cloudflare, Inc.）</th><td data-label="タイミング：">ページを開いたとき、アプリを操作したとき（ボタンを押したときなど）</td><td data-label="送信される情報：">IP アドレス、ブラウザの情報（ユーザーエージェント）、閲覧したページの URL、参照元、「アクセス解析」の項目に書いた操作の情報</td><td data-label="利用目的：">Cookie のバナーの表示と、同意した場合に限り Google アナリティクスへ操作の情報を渡すこと</td></tr>
      <tr><th scope="row"><a href="${GOOGLE}" rel="noopener">Google アナリティクス</a>（Google LLC）</th><td data-label="タイミング：">Cookie のバナーで「すべて同意」を選んだ場合のみ。ページを開いたとき、アプリを操作したとき。お使いのブラウザからではなく Cloudflare のサーバーから送信</td><td data-label="送信される情報：">ブラウザごとのランダムな ID、閲覧したページの URL、参照元、ブラウザの情報、末尾を削った IP アドレスから推定するおおよその地域、「アクセス解析」の項目に書いた操作の情報</td><td data-label="利用目的：">サイトの使われ方を知り、改善すること（「アクセス解析」の項目を参照）</td></tr>
      <tr><th scope="row"><a href="${HUGGINGFACE}" rel="noopener">Hugging Face</a>（Hugging Face, Inc.）</th><td data-label="タイミング：">初めて曲を分離するとき（モデルがブラウザに保存されるまで）</td><td data-label="送信される情報：">IP アドレス、ブラウザの情報（ユーザーエージェント）、モデルのファイルの URL、日時。曲の情報は送りません。</td><td data-label="利用目的：">AI モデル（Demucs htdemucs）のダウンロード</td></tr>
      <tr><th scope="row"><a href="${JSDELIVR}" rel="noopener">jsDelivr</a>（Prospect One とそのパートナーが運営する CDN）</th><td data-label="タイミング：">曲を分離するとき（ライブラリがブラウザに保存されるまで）</td><td data-label="送信される情報：">IP アドレス、ブラウザの情報（ユーザーエージェント）、ライブラリのファイルの URL、読み込んだページ（参照元）、日時</td><td data-label="利用目的：">AI モデルを動かすライブラリ ONNX Runtime Web、音声をモデル用に変換する demucs-web、（ファイルを保存するときは）MP3 を作る lamejs のダウンロード</td></tr>
    </tbody>
  </table>
</div>

<h2 id="cookies">4. Cookie と広告</h2>
<p>本サイトは、アクセス解析のためだけに Cookie を使います。</p>
<ul>
  <li><b>Cookie のバナーでの選択：</b>選んだときに Cloudflare Zaraz が保存し、バナーを再び出さないようにします。選択は ktkwmr.com のすべてのアプリに共通です。</li>
  <li><b>Google アナリティクス用のランダムな ID：</b>「すべて同意」を選んだ場合のみ。再訪を数えるためのもので、氏名などの個人の情報は含みません。</li>
</ul>
<p>選択は、各ページの下にある「Cookie の設定」からいつでも変えられます。本サイトは広告を表示しません。今後広告を表示する場合は、表示を始める前に本ポリシーを改定します。</p>

<h2 id="analytics">5. アクセス解析</h2>
<p>本サイトの利用状況を知るため、<b>Cloudflare Web Analytics</b> を使用しています。Cookie を使わずにページの閲覧数を集計するもので、個人を特定したり、ほかのサイトをまたいで追跡したりはしません。</p>
<p>また、アプリと記事の使われ方を知って改善するため、Cookie のバナーで<b>同意した場合に限り</b>、<b>Cloudflare Zaraz</b> を通じて <b>Google アナリティクス</b>を使用します。記録するのは次の情報です。</p>
<ul>
  <li>見たページ、開いていた時間、どこから来たか（参照元）</li>
  <li>押したボタンやリンク、変えた設定（名前と、設定はその値。「ベース：ミュート」「キー：+2」など）</li>
  <li>再生した時間</li>
  <li>開いた曲のファイルの種類と長さ（「MP3・4.2 分」など）、分離の結果（かかった時間、使った処理、エラーの種類）</li>
  <li>キーの変更とうまくいったかどうか、MP3 で保存したパート</li>
</ul>
<p>ファイル名と曲そのものは送りません。データは Cloudflare のサーバーから IP アドレスの末尾を削って Google に送り、お使いのブラウザが Google に直接つながることはありません。Google シグナルと広告の機能は使わず、データの保持期間は 14 か月です。Google によるデータの使われ方は<a href="${GOOGLE_PARTNERS}" rel="noopener">Google のサービスを使用するサイトやアプリから収集した情報の Google による使用</a>をご覧ください。</p>
<p>「すべて拒否」を選んだ場合や、選ばなかった場合は、Google アナリティクスには何も送られません。</p>

<h2 id="third-party">6. 第三者への提供</h2>
<p>本サイトは、個人を特定できる情報を収集していません。法令に基づく場合を除き、個人情報を第三者に販売・提供することはありません。</p>

<h2 id="contact">7. お問い合わせ</h2>
<p>本ポリシーについてのご質問は、<a href="${ISSUES}" rel="noopener">GitHub の Issues</a> にお寄せください。運営者については<a href="../about/">運営者情報</a>をご覧ください。</p>

<h2 id="changes">8. 改定</h2>
<p>サービスの追加・終了など本サイトの変更に合わせて、本ポリシーを改定することがあります。改定後のポリシーは、このページに掲載した時点から適用されます。</p>
<p>制定日：2026 年 10 月 28 日（2026 年 10 月 31 日改定：1. にコードの推定・ハモリ・キーの変更を追加。いずれもブラウザの中で行います。2026 年 11 月 25 日改定：コードの推定とハモリを別のアプリに移したため削除。2026 年 11 月 28 日改定：同意した場合に限り Cloudflare Zaraz を通じて Google アナリティクスを使用）</p>
`,
  },
};

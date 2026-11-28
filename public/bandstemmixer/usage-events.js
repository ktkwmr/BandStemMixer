// Usage events (how the app and the guides are used), sent with Cloudflare Zaraz (/cdn-cgi/zaraz/i.js,
// loaded just before this file). Zaraz forwards them to Google Analytics 4 only after the visitor agrees
// in its consent banner (the GA4 tool is assigned to the "Analytics" purpose in the Zaraz dashboard).
// Where Zaraz is not there (wrangler dev, preview builds, blocked by the browser), nothing is sent.
//
// Never send what the visitor made or opened: no file names, titles, text they typed, names they gave,
// or the content itself. Only which control was used, counts, durations, file kinds, and results.
//
// Common events (see docs/analytics.md; the parameters are registered in GA4 as custom definitions):
//   <p>_tap      button            every tap on a button or link (named by tapName)
//   <p>_change   control, value    a setting changed (select, slider, number, checkbox, radio, file kind)
//   <p>_engaged  seconds[, play_seconds]  time the page was visible (and sound played) since the last one,
//                                  sent when the page is hidden or closed
// The app adds its own events with usage.track("name", { ... }) → "<p>_name".
// Every event also has ui_lang (en / ja).
//
// Copied from ktkwmr/webapp-baseline templates/public/__slug__/usage-events.js. Only PREFIX differs.
(function () {
  "use strict";
  const PREFIX = "bsm";
  const lang = () => (document.documentElement.lang || "en").slice(0, 2);

  function send(name, params) {
    try {
      if (window.zaraz && typeof window.zaraz.track === "function") window.zaraz.track(name, Object.assign({ ui_lang: lang() }, params || {}));
    } catch (e) { /* analytics must never break the app */ }
  }
  const track = (name, params) => send(PREFIX + "_" + name, params);
  const clip = (s) => String(s).slice(0, 100);

  // The key of a data-i18n / data-i18n-html / data-i18n-attr (the first one), which names the control
  // the same way in every language
  function i18nKey(el) {
    const d = el.dataset;
    if (d.i18n) return d.i18n;
    if (d.i18nHtml) return d.i18nHtml;
    if (d.i18nAttr) { const m = /:([^;]+)/.exec(d.i18nAttr); if (m) return m[1].trim(); }
    return "";
  }
  // Named by data-track, the id, the i18n key, the page (same-site link) or host (other site), or else
  // the nearest id above it and the element's first class (list items made by the app, ...)
  function nameOf(el) {
    if (el.dataset.track) return el.dataset.track;
    if (el.id) return el.id;
    if (el.classList.contains("cookie-settings")) return "cookie-settings";
    if (el.tagName === "A" && el.href) {
      if (/^(blob|data):/.test(el.href)) return "download";
      try {
        const u = new URL(el.href, document.baseURI);
        if (u.origin === location.origin) return "link:" + u.pathname + (u.hash || "");
        return "link:" + u.host;
      } catch (e) { return "link"; }
    }
    const key = i18nKey(el) || (el.querySelector && (() => { const c = el.querySelector("[data-i18n],[data-i18n-attr]"); return c ? i18nKey(c) : ""; })());
    const box = el.parentElement && el.parentElement.closest("[id]");
    if (key) return (box ? box.id + ":" : "") + key;
    if (el.name) return (box ? box.id + ":" : "") + el.name;
    const cls = (el.getAttribute("class") || "").trim().split(/\s+/)[0];
    return (box ? box.id : "page") + ":" + (cls || el.tagName.toLowerCase());
  }

  // ---- Taps -------------------------------------------------------------------------------------
  document.addEventListener("click", function (e) {
    // Only what the visitor tapped (the app's own clicks, such as starting a download, are not counted)
    if (!e.isTrusted) return;
    const el = e.target && e.target.closest && e.target.closest("button, a[href], summary, [role=button], [role=tab], [role=menuitem], [role=option]");
    if (!el || el.disabled) return;
    // "Cookie settings" in the footer: open Zaraz's consent banner again
    if (el.classList.contains("cookie-settings")) {
      e.preventDefault();
      try { if (window.zaraz && typeof window.zaraz.showConsentModal === "function") window.zaraz.showConsentModal(); } catch (err) {}
    }
    track("tap", { button: clip(nameOf(el)) });
  }, true);

  // ---- Settings -----------------------------------------------------------------------------------
  // Text the visitor types is never sent. A <select> whose options are names the visitor gave (songs,
  // sets, tracks) has data-track-value="off": only that it changed is sent.
  function valueOf(el) {
    const type = (el.type || "").toLowerCase();
    if (type === "checkbox") return el.checked ? "on" : "off";
    if (type === "file") {
      const kinds = Array.from(el.files || []).map((f) => (/\.([a-z0-9]{1,8})$/i.exec(f.name) || [, "other"])[1].toLowerCase());
      return Array.from(new Set(kinds)).sort().join("+") || "none";
    }
    if (el.dataset.trackValue === "off" || (el.closest && el.closest("[data-track-value=off]"))) return "";
    if (type === "range" || type === "number") return el.value;
    if (type === "radio" || el.tagName === "SELECT") return el.value;
    return "";
  }
  document.addEventListener("change", function (e) {
    const el = e.target;
    if (!el || !el.matches || !el.matches("select, input[type=range], input[type=number], input[type=checkbox], input[type=radio], input[type=file]")) return;
    // Only what the visitor changed (not values the app sets itself). Files can only be chosen by the
    // visitor (the change event of a file input is not "trusted" in some browsers and test tools)
    if (!e.isTrusted && el.type !== "file") return;
    const params = { control: clip(nameOf(el)) };
    const value = valueOf(el);
    if (value !== "") params.value = clip(value);
    if (el.type === "file") params.files = (el.files || []).length;
    track("change", params);
  }, true);

  // ---- Time on the page ---------------------------------------------------------------------------
  // Counted only while the page is visible; sound playing is counted while it plays (also in the
  // background). Sent each time the page is hidden, then counted again from zero.
  let shownAt = document.visibilityState === "visible" ? performance.now() : null, shown = 0;
  let playAt = null, played = 0, plays = false;
  function flush() {
    const now = performance.now();
    if (shownAt != null) { shown += now - shownAt; shownAt = null; }
    if (playAt != null) { played += now - playAt; playAt = now; }
    const seconds = Math.round(shown / 1000), playSeconds = Math.round(played / 1000);
    shown = 0; played = 0;
    if (seconds < 1 && playSeconds < 1) return;
    const params = { seconds: seconds };
    if (plays) params.play_seconds = playSeconds;
    track("engaged", params);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flush();
    else if (shownAt == null) shownAt = performance.now();
  });
  window.addEventListener("pagehide", function () { if (shownAt != null || playAt != null) flush(); });

  window.usage = {
    track: track,
    // The app calls this when sound starts and stops
    playing: function (on) {
      plays = true;
      const now = performance.now();
      if (on && playAt == null) playAt = now;
      else if (!on && playAt != null) { played += now - playAt; playAt = null; }
    },
  };
})();

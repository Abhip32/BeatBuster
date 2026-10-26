/**
 * Universal utility to decode HTML entities in song titles, artist names, and album names.
 * Handles named entities, decimal entities, hex entities, and double-encoded strings (e.g. &amp;quot;).
 */
export function decodeHtml(str) {
  if (!str || typeof str !== "string") return "";

  let decoded = str;

  // Run up to 2 passes to resolve double-escaped entities (e.g. &amp;quot;)
  for (let pass = 0; pass < 2; pass++) {
    if (!decoded.includes("&")) break;

    decoded = decoded
      .replace(/&quot;|&#34;|&#x22;/gi, '"')
      .replace(/&#039;|&#39;|&apos;|&#x27;/gi, "'")
      .replace(/&lsquo;|&rsquo;|&#8216;|&#8217;/gi, "'")
      .replace(/&ldquo;|&rdquo;|&#8220;|&#8221;/gi, '"')
      .replace(/&amp;|&#38;|&#x26;/gi, "&")
      .replace(/&lt;|&#60;|&#x3c;/gi, "<")
      .replace(/&gt;|&#62;|&#x3e;/gi, ">")
      .replace(/&nbsp;|&#160;/gi, " ")
      .replace(/&ndash;|&#8211;/gi, "-")
      .replace(/&mdash;|&#8212;/gi, "—")
      .replace(/&hellip;|&#8230;/gi, "...");
  }

  return decoded;
}

export default decodeHtml;

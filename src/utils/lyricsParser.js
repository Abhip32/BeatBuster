/**
 * Robust LRC & Enhanced Word-Level Lyrics Parser
 * Handles:
 * - Standard LRC: [00:12.34] line
 * - Enhanced / Word-Level LRC: [00:12.34]<00:12.340>word <00:12.800>word
 * - Tag-only lines: <00:12.340>word <00:12.800>word
 * - Multiple timestamps per line: [00:10.00][01:20.00] repeated line
 * - Strips all syllable tags (<00:12.340>) from displayed text
 */

export const parseLrc = (lrcString) => {
  if (!lrcString || typeof lrcString !== "string") return [];

  const lines = lrcString.split(/\r?\n/);
  const result = [];
  let autoId = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Ignore metadata headers like [ti:...], [ar:...], [al:...], [by:...], [offset:...]
    if (/^\[(ti|ar|al|by|offset|length|re|ve):.*\]/i.test(rawLine)) {
      continue;
    }

    // Match leading timestamp tags at the very beginning of the line
    // e.g. [00:10.00] or [00:10.00][01:20.00] or <00:36.290> or [00:36.29]<00:36.290>
    const leadingTagRegex = /^(?:(?:\[|<)\d{1,2}:\d{2}(?:\.\d{1,3})?(?:\]|>))+/;
    const leadingMatch = rawLine.match(leadingTagRegex);

    if (!leadingMatch) {
      continue;
    }

    // Extract individual timestamps from the leading tags cluster
    const timeRegex = /(?:\[|<)(\d{1,2}):(\d{2}(?:\.\d{1,3})?)(?:\]|>)/g;
    const timestamps = new Set();
    let m;
    while ((m = timeRegex.exec(leadingMatch[0])) !== null) {
      const minutes = parseInt(m[1], 10);
      const seconds = parseFloat(m[2]);
      if (!isNaN(minutes) && !isNaN(seconds)) {
        // Round to 2 decimal places to avoid duplicate almost-identical float timestamps
        const totalSeconds = Math.round((minutes * 60 + seconds) * 100) / 100;
        timestamps.add(totalSeconds);
      }
    }

    if (timestamps.size === 0) {
      continue;
    }

    // Clean text by stripping ALL timestamp tags [mm:ss.xxx] and <mm:ss.xxx> anywhere in line
    const cleanText = rawLine
      .replace(/(?:\[|<)\d{1,2}:\d{2}(?:\.\d{1,3})?(?:\]|>)/g, "")
      .replace(/<[^>]+>/g, "") // any remaining angle bracket tags
      .replace(/\s+/g, " ")
      .trim();

    // If line has meaningful text, push an entry for each unique leading timestamp
    if (cleanText) {
      timestamps.forEach((time) => {
        result.push({
          id: autoId++,
          time,
          text: cleanText,
        });
      });
    }
  }

  // Sort chronologically by time
  return result.sort((a, b) => a.time - b.time);
};

/**
 * Clean any timestamp tags or angle tags from plain lyrics text
 */
export const cleanPlainLyrics = (plainText) => {
  if (!plainText || typeof plainText !== "string") return "";
  return plainText
    .split(/\r?\n/)
    .map((line) => {
      // Remove metadata tags [ar:...], etc.
      if (/^\[(ti|ar|al|by|offset|length|re|ve):.*\]/i.test(line.trim())) {
        return "";
      }
      return line
        .replace(/(?:\[|<)\d{1,2}:\d{2}(?:\.\d{1,3})?(?:\]|>)/g, "")
        .replace(/<[^>]+>/g, "")
        .trim();
    })
    .filter((line, idx, arr) => line !== "" || (idx > 0 && arr[idx - 1] !== ""))
    .join("\n")
    .trim();
};

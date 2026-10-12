// The visible brand uses the existing PNG artwork. The hidden legacy SVG text
// depended on Outfit; remove only that obsolete group, preserving the artwork.
export function removeLegacyLogoFontText(html) {
  return html.replace(
    /\s*<g\b[^>]*font-family="Outfit, 'Brush Script MT', cursive, sans-serif"[^>]*>[\s\S]*?<\/g>/g,
    '',
  );
}

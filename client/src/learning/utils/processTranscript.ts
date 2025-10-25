export default function processTranscript(text: string){
  // Split by period or newline (with optional spaces around)
  const lines = text
    .split(/[.\n]+/) // split on one or more periods or newlines
    .map((s) => s.trim()) // trim whitespace
    .filter(Boolean); // remove empty strings

  return lines;
}
import stringComparison from "string-comparison";

export function processTranscript(
  text: string,
  wordCount: number = 0
) {
  text = text.toLowerCase()
  // Remove special characters
  text = text.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");

  // First split into words if needed
  let words = text.split(/[.\s]+/).filter(Boolean);

  // If wordCount is 0 or not provided, return the original split
  if (wordCount <= 0) {
    return words;
  }

  // Group words into chunks of specified size
  const result: string[] = [];
  for (let i = 0; i < words.length; i += wordCount) {
    const chunk = words.slice(i, i + wordCount).join(' ');
    if (chunk) {
      result.push(chunk);
    }
  }

  return result;
}


/*
?


*/

//export function isLineComplete()

export function compareTextAccuracy(original: string, transcription: string) {
  const jaro = stringComparison.jaroWinkler;
  original = original.toLowerCase().trim();
  transcription = transcription.toLowerCase().trim();
  return jaro.similarity(original, transcription);
}

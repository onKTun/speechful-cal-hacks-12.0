export default function processTranscript(text: string){
  // Split by period or newline (with optional spaces around)
  const lines = text
    .split(/[.\n]+/) // split on one or more periods or newlines
    .map((s) => s.trim()) // trim whitespace
    .filter(Boolean); // remove empty strings

  return lines;
}
/*
?


*/

function compareTextAccuracy(original: string, transcription: string){
  //format the strings, removing whitespace and making it all lowercase
  //parse each string, delimiting with spaces, and create two arrays
  //iterate through the original, comparing it with the transcription, keep track of how many words are the same
}
// String similarity code from https://github.com/aceakash/string-similarity
// licensed under MIT, based on Dice's Coefficient.
// As OneDrive ASCII searching is not bad, the function as a supplement,
// requires optimization for other languages like CJK.
function getStrSimilarity(first: string, second: string): number {
  first = first.replace(/\s+/g, '')
  second = second.replace(/\s+/g, '')

  if (first === second) return 1 // Identical or empty
  if (first.length < 2 || second.length < 2) return 0 // If either is a 0-letter or 1-letter string

  let firstBigrams = new Map()
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2)
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1

    firstBigrams.set(bigram, count)
  }

  let intersectionSize = 0
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2)
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0

    if (count > 0) {
      firstBigrams.set(bigram, count - 1)
      intersectionSize++
    }
  }

  return (2.0 * intersectionSize) / (first.length + second.length - 2)
}
export default getStrSimilarity

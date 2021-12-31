// Comprehensive bigram similarity mostly, with a bit char Dice coefficient.
// The former one requires bigram equality,
// which may works bad in char-less words like short Chinese word.
// The latter one is used to ensure when the former one is both 0,
// at least same chars may contribute to the similarity.
// The ratio is 9 : 1 to ensure the former one contributes most.
// Ref: paper N-gram similarity and distance DOI https://doi.org/10.1007/11575832_13
function getStrSimilarity(a: string, b: string): number {
  a = a.replace(/\s+/g, '')
  b = b.replace(/\s+/g, '')

  if (a.length === 0 || b.length === 0) {
    return a === b ? 1 : 0
  }

  if (a.length === 1) {
    return b.indexOf(a) !== -1 ? 1 / b.length : 0
  } else if (b.length === 1) {
    return a.indexOf(b) !== -1 ? 1 / a.length : 0
  }

  const aBigrams: string[] = []
  for (let i = 0; i < a.length; i++) {
    if (i - 1 < 0) {
      // Affixing
      aBigrams.push('\x00'.repeat(2 - (i + 1)) + a.substring(i, i + 1))
      continue
    }
    aBigrams.push(a.substring(i - 1, i + 1))
  }
  const bBigrams: string[] = []
  for (let i = 0; i < b.length; i++) {
    if (i - 1 < 0) {
      bBigrams.push('\x00'.repeat(2 - (i + 1)) + b.substring(i, i + 1))
      continue
    }
    bBigrams.push(b.substring(i - 1, i + 1))
  }

  const res = new Array(a.length + 1).fill(0).map(() => new Array(b.length + 1).fill(0))
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      res[i + 1][j + 1] = Math.max(
        res[i][j + 1],
        res[i + 1][j],
        res[i][j] +
          // Reduce to LCS
          (aBigrams[i] === bBigrams[j]
            ? 1
            : bBigrams.indexOf(aBigrams[i][0]) !== -1 || bBigrams.indexOf(aBigrams[i][1]) !== -1
            ? 0.5
            : 0)
      )
    }
  }
  const r1 = res[a.length][b.length] / Math.max(a.length, b.length)

  const r2 = Math.max(
    a
      .split('')
      .map(c => (b.indexOf(c) !== -1 ? 1 : 0) as number)
      .reduce((a, b) => a + b) / a.length,
    b
      .split('')
      .map(c => (a.indexOf(c) !== -1 ? 1 : 0) as number)
      .reduce((a, b) => a + b) / b.length
  )

  return r1 * 0.9 + r2 * 0.1
}
export default getStrSimilarity

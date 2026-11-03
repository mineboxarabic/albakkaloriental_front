// Mirror of AlimExpressApp/src/lib/text-search.ts: keep both copies identical so the
// admin back office and the catalog rank searches the same way.

/**
 * Search matching shared by every search box: French and Arabic aware, typo tolerant,
 * and strict enough that a query only returns things that actually resemble it.
 */

const ARABIC_DIACRITICS = /[ً-ٰٟۖ-ۭ]/g;
const ARABIC_TATWEEL = /ـ/g;
const ARABIC_INDIC_DIGIT_OFFSET = 0x0660;
const PERSIAN_DIGIT_OFFSET = 0x06f0;

const CHARACTER_FOLDS: ReadonlyArray<[RegExp, string]> = [
  [/œ/g, "oe"],
  [/æ/g, "ae"],
  [/ß/g, "ss"],
  [/[ٱأإآ]/g, "ا"],
  [/ى/g, "ي"],
  [/ی/g, "ي"],
  [/ئ/g, "ي"],
  [/ؤ/g, "و"],
  [/ة/g, "ه"],
  [/ک/g, "ك"],
];

const FRENCH_STOP_WORDS = ["l", "d", "j", "qu", "le", "la", "les", "de", "des", "du", "un", "une", "et", "a", "au", "aux", "en"];
const ARABIC_STOP_WORDS = ["و", "في", "من", "مع", "على", "او", "عن"];
const STOP_WORDS = new Set([...FRENCH_STOP_WORDS, ...ARABIC_STOP_WORDS]);

const ARABIC_ARTICLE_PREFIXES = ["وال", "بال", "فال", "كال", "لل", "ال"];
const MIN_ARABIC_STEM_LENGTH = 2;

const MIN_SUBSTRING_LENGTH = 3;
const MIN_NUMERIC_SUBSTRING_LENGTH = 4;
const MIN_ONE_TYPO_LENGTH = 4;
const MIN_TWO_TYPOS_LENGTH = 8;
const MAX_ABBREVIATION_SPREAD = 2.5;

export const MATCH_SCORES = {
  exactField: 600,
  fieldPrefix: 500,
  exactWord: 450,
  wordPrefix: 400,
  joinedWords: 350,
  substring: 300,
  wordTypo: 250,
  prefixTypo: 220,
  typoPenalty: 30,
  abbreviation: 100,
} as const;

const PHRASE_BONUS = 150;

function toLatinDigits(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);
    const offset = code >= PERSIAN_DIGIT_OFFSET ? PERSIAN_DIGIT_OFFSET : ARABIC_INDIC_DIGIT_OFFSET;
    return String(code - offset);
  });
}

/**
 * Folds text to a comparable form: no accents, no Arabic diacritics, Arabic letter variants
 * unified (أ/إ/آ → ا, ى → ي, ة → ه…), Latin digits, and numbers split from their units so
 * "Café L'Or 33cl" and "cafe l or 33 cl" compare equal.
 */
export function normalizeSearchText(value: string): string {
  return memoize(normalizedTextCache, value, foldSearchText);
}

const MEMO_LIMIT = 100_000;
const TYPO_CACHE_TOKEN_LIMIT = 64;
const normalizedTextCache = new Map<string, string>();
const tokenCache = new Map<string, string[]>();
const wordCache = new Map<string, string[]>();

/** Search runs on every keystroke over the whole catalog, so each distinct string is folded once. */
function memoize<T>(cache: Map<string, T>, key: string, compute: (key: string) => T): T {
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  if (cache.size >= MEMO_LIMIT) cache.clear();
  const value = compute(key);
  cache.set(key, value);
  return value;
}

function splitWords(field: string): string[] {
  return memoize(wordCache, field, (value) => value.split(" "));
}

function foldSearchText(value: string): string {
  let text = toLatinDigits(value.toLowerCase()).normalize("NFD");
  text = text.replace(/[̀-ͯ]/g, "").replace(ARABIC_DIACRITICS, "").replace(ARABIC_TATWEEL, "");
  for (const [pattern, replacement] of CHARACTER_FOLDS) text = text.replace(pattern, replacement);

  return text
    .replace(/[^a-z0-9ء-ي]+/g, " ")
    .replace(/(\d)(?=[^\d\s])/g, "$1 ")
    .replace(/([^\d\s])(?=\d)/g, "$1 ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Splits a query into the words worth matching; articles and conjunctions only count when typed alone. */
export function tokenizeSearchQuery(search: string): string[] {
  return memoize(tokenCache, search, (value) => {
    const tokens = normalizeSearchText(value).split(" ").filter(Boolean);
    const meaningful = tokens.filter((token) => !STOP_WORDS.has(token));
    return meaningful.length > 0 ? meaningful : tokens;
  });
}

/** "الزيتون", "بالزيتون" and "زيتون" share the stem "زيتون". */
export function stripArabicArticle(word: string): string {
  for (const prefix of ARABIC_ARTICLE_PREFIXES) {
    if (word.startsWith(prefix) && word.length - prefix.length >= MIN_ARABIC_STEM_LENGTH) {
      return word.slice(prefix.length);
    }
  }
  return word;
}

function hasDigit(value: string): boolean {
  return /\d/.test(value);
}

interface TypoDistances {
  /** Distance between the whole word and the token. */
  word: number;
  /** Smallest distance between a proper prefix of the word and the token (word still being typed). */
  prefix: number;
}

/**
 * Optimal string alignment (Levenshtein + adjacent swaps) between the token and every
 * prefix of the word, in one pass; abandoned as soon as no prefix can stay within `limit`.
 */
export function getTypoDistances(word: string, token: string, limit: number): TypoDistances {
  const tooFar = limit + 1;
  const rows = Math.min(word.length, token.length + limit);
  let previousPrevious: number[] = [];
  let previous = Array.from({ length: token.length + 1 }, (_, index) => index);
  const distances: TypoDistances = { word: tooFar, prefix: tooFar };

  for (let i = 1; i <= rows; i += 1) {
    const current = [i];
    let rowMinimum = i;

    for (let j = 1; j <= token.length; j += 1) {
      const cost = word[i - 1] === token[j - 1] ? 0 : 1;
      let distance = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      const swapped = i > 1 && j > 1 && word[i - 1] === token[j - 2] && word[i - 2] === token[j - 1];
      if (swapped) distance = Math.min(distance, previousPrevious[j - 2] + 1);
      current[j] = distance;
      rowMinimum = Math.min(rowMinimum, distance);
    }

    if (rowMinimum > limit) break;
    const tokenDistance = current[token.length];
    if (i === word.length) distances.word = Math.min(tokenDistance, tooFar);
    else if (i >= token.length - 1) distances.prefix = Math.min(distances.prefix, tokenDistance);
    previousPrevious = previous;
    previous = current;
  }

  return distances;
}

function getAllowedTypos(token: string): number {
  if (hasDigit(token) || token.length < MIN_ONE_TYPO_LENGTH) return 0;
  return token.length >= MIN_TWO_TYPOS_LENGTH ? 2 : 1;
}

/** Abbreviation match inside one word ("ntl" → "nutella"); never spans several words. */
function getAbbreviationScore(word: string, token: string): number | null {
  if (hasDigit(token) || word[0] !== token[0]) return null;

  let tokenIndex = 0;
  let lastMatchIndex = 0;
  for (let wordIndex = 0; wordIndex < word.length && tokenIndex < token.length; wordIndex += 1) {
    if (word[wordIndex] !== token[tokenIndex]) continue;
    lastMatchIndex = wordIndex;
    tokenIndex += 1;
  }

  if (tokenIndex !== token.length) return null;
  const spread = (lastMatchIndex + 1) / token.length;
  if (spread > MAX_ABBREVIATION_SPREAD) return null;

  return MATCH_SCORES.abbreviation + token.length * 5 - (lastMatchIndex + 1 - token.length);
}

function getTypoScore(word: string, token: string, allowedTypos: number): number | null {
  if (word.length < token.length - allowedTypos) return null;

  const distances = getTypoDistances(word, token, allowedTypos);
  if (distances.word <= allowedTypos) return MATCH_SCORES.wordTypo - distances.word * MATCH_SCORES.typoPenalty;
  if (distances.prefix <= allowedTypos) return MATCH_SCORES.prefixTypo - distances.prefix * MATCH_SCORES.typoPenalty;
  return null;
}

function getWordScore(word: string, token: string, tokenStem: string): number | null {
  const wordStem = stripArabicArticle(word);
  if (word === token || wordStem === tokenStem) return MATCH_SCORES.exactWord;
  if (word.startsWith(token) || wordStem.startsWith(tokenStem)) return MATCH_SCORES.wordPrefix;
  return null;
}

function bestOf(scores: Array<number | null>): number | null {
  let best: number | null = null;
  for (const score of scores) {
    if (score !== null && (best === null || score > best)) best = score;
  }
  return best;
}

function bestWordScore(words: string[], scoreWord: (word: string) => number | null): number | null {
  let best: number | null = null;
  for (const word of words) {
    const score = scoreWord(word);
    if (score !== null && (best === null || score > best)) best = score;
  }
  return best;
}

/** "cocacola" against "coca cola": the token runs through consecutive words with the spaces dropped. */
function joinedWordsMatch(words: string[], token: string): boolean {
  for (let start = 0; start < words.length - 1; start += 1) {
    if (!token.startsWith(words[start])) continue;

    let offset = words[start].length;
    for (let next = start + 1; next < words.length && offset < token.length; next += 1) {
      const word = words[next];
      if (token.length - offset <= word.length) {
        if (word.startsWith(token.slice(offset))) return true;
        break;
      }
      if (!token.startsWith(word, offset)) break;
      offset += word.length;
    }
  }
  return false;
}

function substringAllowed(token: string): boolean {
  const minimum = /^\d+$/.test(token) ? MIN_NUMERIC_SUBSTRING_LENGTH : MIN_SUBSTRING_LENGTH;
  return token.length >= minimum;
}

/**
 * Scores one query token against one normalized field, best match first:
 * exact > field prefix > whole word > word prefix > words typed together > substring
 * > typo > abbreviation. Null means no match.
 */
export function getTokenMatchScore(field: string, queryToken: string): number | null {
  if (!field || !queryToken) return null;
  if (field === queryToken) return MATCH_SCORES.exactField;
  if (field.startsWith(queryToken)) return MATCH_SCORES.fieldPrefix;

  const words = splitWords(field);
  const tokenStem = stripArabicArticle(queryToken);

  const wordScore = bestWordScore(words, (word) => getWordScore(word, queryToken, tokenStem));
  if (wordScore !== null) return wordScore;
  if (words.length > 1 && joinedWordsMatch(words, queryToken)) return MATCH_SCORES.joinedWords;
  if (substringAllowed(queryToken) && field.includes(queryToken)) return MATCH_SCORES.substring;

  const allowedTypos = getAllowedTypos(queryToken);
  if (allowedTypos > 0) {
    const typoScore = bestWordScore(words, (word) => getWordTypoScore(word, queryToken, tokenStem, allowedTypos));
    if (typoScore !== null) return typoScore;
  }

  return bestWordScore(words, (word) => getAbbreviationScore(word, queryToken));
}

const typoScoreCache = new Map<string, Map<string, number | null>>();

function getTypoCacheFor(token: string): Map<string, number | null> {
  const cached = typoScoreCache.get(token);
  if (cached) return cached;
  if (typoScoreCache.size >= TYPO_CACHE_TOKEN_LIMIT) typoScoreCache.clear();
  const created = new Map<string, number | null>();
  typoScoreCache.set(token, created);
  return created;
}

/** Catalog words repeat across products ("huile", "زيت"…), so each word/token pair is compared once. */
function getWordTypoScore(word: string, token: string, tokenStem: string, allowedTypos: number): number | null {
  const cache = getTypoCacheFor(token);
  const cached = cache.get(word);
  if (cached !== undefined) return cached;
  const score = computeWordTypoScore(word, token, tokenStem, allowedTypos);
  cache.set(word, score);
  return score;
}

function computeWordTypoScore(word: string, token: string, tokenStem: string, allowedTypos: number): number | null {
  const wordStem = stripArabicArticle(word);
  const direct = getTypoScore(word, token, allowedTypos);
  if (wordStem === word && tokenStem === token) return direct;
  return bestOf([direct, getTypoScore(wordStem, tokenStem, allowedTypos)]);
}

/** True when the query words appear side by side, in order, in the field (stop words ignored). */
export function containsPhrase(field: string, tokens: string[]): boolean {
  if (tokens.length < 2) return false;
  const words = field.split(" ").filter((word) => !STOP_WORDS.has(word)).map(stripArabicArticle);
  const stems = tokens.map(stripArabicArticle);

  return words.some((_, start) => stems.every((stem, offset) => words[start + offset]?.startsWith(stem)));
}

/**
 * Scores a free-text query against a single label. Every token must match somewhere in the
 * label, so "prem olive" still finds "Huile d'Olive Premium". Null means no match.
 */
export function getLabelSearchScore(label: string, search: string): number | null {
  const tokens = tokenizeSearchQuery(search);
  if (tokens.length === 0) return 0;

  const normalizedLabel = normalizeSearchText(label);
  if (!normalizedLabel) return null;

  let score = 0;
  for (const token of tokens) {
    const tokenScore = getTokenMatchScore(normalizedLabel, token);
    if (tokenScore === null) return null;
    score += tokenScore;
  }

  const phraseBonus = containsPhrase(normalizedLabel, tokens) ? PHRASE_BONUS : 0;
  const lengthTieBreak = Math.min(normalizedLabel.split(" ").length, 20);

  return score + phraseBonus - lengthTieBreak;
}

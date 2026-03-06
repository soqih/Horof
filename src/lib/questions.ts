import { LETTERS } from './constants';

export interface Question {
    id: string;
    letter: string;
    category: string;
    question: string;
    answer: string;
}

// Normalize letter variants (أ آ ا إ) and (ه هـ) for matching board letters
const LETTER_ALIASES: Record<string, string[]> = {
    'أ': ['أ', 'آ', 'ا', 'إ'],
    'هـ': ['هـ', 'ه'],
};

function getLetterVariants(letter: string): string[] {
    return LETTER_ALIASES[letter] ?? [letter];
}

function matchesLetter(boardLetter: string, questionLetter: string): boolean {
    const variants = getLetterVariants(boardLetter);
    return variants.includes(questionLetter);
}

// Fallback questions when JSON not loaded yet
const FALLBACK_QUESTIONS: Question[] = LETTERS.flatMap((letter, lIdx) => [
    { id: `${lIdx}-تاريخ`, letter, category: 'تاريخ', question: `سؤال تاريخي يبدأ بحرف ${letter}؟`, answer: `إجابة تاريخية بحرف ${letter}` },
    { id: `${lIdx}-عام`, letter, category: 'عام', question: `سؤال عام يبدأ بحرف ${letter}؟`, answer: `إجابة عامة بحرف ${letter}` },
]);

let cachedQuestions: Question[] | null = null;

function deduplicateByContent(questions: Question[]): Question[] {
    const seen = new Set<string>();
    return questions.filter((q) => {
        const key = `${q.question}|${q.answer}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export async function loadQuestions(): Promise<Question[]> {
    if (cachedQuestions) return cachedQuestions;
    const valid = (q: Question) =>
        q.question && q.answer && q.letter && q.category && q.id;
    try {
        let batch1: Question[] = [];
        let batch2: Question[] = [];
        const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
        try {
            const res1 = await fetch(`${base}/questions_batch_1.json`);
            batch1 = (await res1.json()) as Question[];
        } catch {
            /* batch1 optional */
        }
        try {
            const res2 = await fetch(`${base}/questions_batch_2.json`);
            batch2 = (await res2.json()) as Question[];
        } catch {
            /* batch2 optional */
        }
        const batch2Keys = new Set(batch2.filter(valid).map((q) => `${q.question}|${q.answer}`));
        const deduped1 = batch1.filter(
            (q) => valid(q) && !batch2Keys.has(`${q.question}|${q.answer}`)
        );
        cachedQuestions = deduplicateByContent([...batch2.filter(valid), ...deduped1]);
        return cachedQuestions.length > 0 ? cachedQuestions : FALLBACK_QUESTIONS;
    } catch {
        return FALLBACK_QUESTIONS;
    }
}

export function getRandomQuestionByLetter(
    questions: Question[],
    letter: string,
    categoryOverride?: string
): Question {
    let pool = questions.filter((q) => matchesLetter(letter, q.letter));

    if (categoryOverride) {
        pool = pool.filter((q) => q.category === categoryOverride);
    }

    if (pool.length === 0) {
        pool = questions.filter((q) => matchesLetter(letter, q.letter));
    }
    if (pool.length === 0) return FALLBACK_QUESTIONS[0]!;

    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex]!;
}

export function getAvailableCategoriesForLetter(
    questions: Question[],
    letter: string
): string[] {
    const pool = questions.filter((q) => matchesLetter(letter, q.letter));
    return Array.from(new Set(pool.map((q) => q.category))).sort();
}

/** All unique categories in the game - for فزعة صب to show full choice */
export function getAllCategories(questions: Question[]): string[] {
    return Array.from(new Set(questions.map((q) => q.category))).sort();
}

/** Check if a letter has questions in a given category */
export function hasQuestionsForLetterAndCategory(
    questions: Question[],
    letter: string,
    category: string
): boolean {
    return questions.some(
        (q) => matchesLetter(letter, q.letter) && q.category === category
    );
}

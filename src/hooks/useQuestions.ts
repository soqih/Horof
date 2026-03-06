import { useState, useEffect } from 'react';
import {
    loadQuestions,
    getRandomQuestionByLetter,
    getAvailableCategoriesForLetter,
    getAllCategories,
    hasQuestionsForLetterAndCategory,
    Question,
} from '../lib/questions';

export function useQuestions() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuestions().then((q) => {
            setQuestions(q);
            setLoading(false);
        });
    }, []);

    return {
        questions,
        loading,
        getRandomQuestion: (letter: string, category?: string) =>
            getRandomQuestionByLetter(questions, letter, category),
        getCategoriesForLetter: (letter: string) =>
            getAvailableCategoriesForLetter(questions, letter),
        getAllCategories: () => getAllCategories(questions),
        hasQuestionsForLetterAndCategory: (letter: string, category: string) =>
            hasQuestionsForLetterAndCategory(questions, letter, category),
    };
}

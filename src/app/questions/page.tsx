'use client';

import React, { useMemo, useState } from 'react';
import { NeoButton } from '../../components/ui/NeoButton';
import { useQuestions } from '../../hooks/useQuestions';
import { LETTERS } from '../../lib/constants';
import { Question } from '../../lib/questions';

const RANDOM_LABEL = 'عشوائي';
type DisplayMode = 'full' | 'word-by-word';

export default function QuestionsPage() {
    const {
        loading,
        questions,
        getRandomQuestion,
        getCategoriesForLetter,
        getAllCategories,
        hasQuestionsForLetterAndCategory,
    } = useQuestions();

    const [letter, setLetter] = useState<string>(LETTERS[0] ?? '');
    const [category, setCategory] = useState<string>(RANDOM_LABEL);
    const [question, setQuestion] = useState<Question | null>(null);
    const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);
    const [displayMode, setDisplayMode] = useState<DisplayMode>('full');
    const [revealedWordCount, setRevealedWordCount] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    const allCategories = useMemo(() => getAllCategories(), [getAllCategories]);

    const resetQuestionView = () => {
        setRevealedWordCount(0);
        setShowAnswer(false);
    };

    const applyLetter = (nextLetter: string) => {
        const nextCategories = getCategoriesForLetter(nextLetter);
        setLetter(nextLetter);

        if (category !== RANDOM_LABEL && !nextCategories.includes(category)) {
            setCategory(RANDOM_LABEL);
        }

        setQuestion(null);
        resetQuestionView();
    };

    const applyCategory = (nextCategory: string) => {
        setCategory(nextCategory);
        setQuestion(null);
        resetQuestionView();
    };

    const drawQuestion = () => {
        if (!letter || questions.length === 0) return;

        const categoryOverride = category === RANDOM_LABEL ? undefined : category;
        let next = getRandomQuestion(letter, categoryOverride, usedQuestionIds);
        let attempts = 0;

        while (question && next.id === question.id && attempts < 8) {
            next = getRandomQuestion(letter, categoryOverride, usedQuestionIds);
            attempts += 1;
        }

        setQuestion(next);
        setUsedQuestionIds((prev) => (prev.includes(next.id) ? prev : [...prev, next.id]));
        resetQuestionView();
    };

    const words = question ? question.question.split(/\s+/).filter(Boolean) : [];
    const revealedWords = Math.min(revealedWordCount, words.length);
    const handleDisplayModeChange = (mode: DisplayMode) => {
        setDisplayMode(mode);
        setRevealedWordCount(0);
    };

    return (
        <div className="min-h-screen bg-[var(--color-neo-bg)] p-3 sm:p-6">
            <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:gap-6">
                <header className="border-8 border-black bg-white shadow-neo-lg p-4 sm:p-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl sm:text-4xl font-black drop-shadow-[2px_2px_0px_var(--color-neo-primary)]">
                            واجهة الأسئلة (المقدم)
                        </h1>
                        <p className="font-bold text-lg">
                            الترتيب: 1) اختر الحرف والتصنيف 2) اختر طريقة العرض 3) اسحب سؤالًا.
                        </p>
                    </div>
                </header>

                <section className="border-8 border-black bg-white shadow-neo p-4 sm:p-6 flex flex-col gap-4">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        <div className="border-4 border-black bg-[var(--color-neo-bg)] p-4 flex flex-col gap-4">
                            <p className="font-black text-xl">1) إعداد السؤال</p>
                            <label className="font-black text-lg flex flex-col gap-2">
                                الحرف
                                <select
                                    value={letter}
                                    onChange={(e) => applyLetter(e.target.value)}
                                    className="border-4 border-black p-3 bg-white font-bold"
                                >
                                    {LETTERS.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="font-black text-lg flex flex-col gap-2">
                                التصنيف
                                <select
                                    value={category}
                                    onChange={(e) => applyCategory(e.target.value)}
                                    className="border-4 border-black p-3 bg-white font-bold"
                                >
                                    <option value={RANDOM_LABEL}>{RANDOM_LABEL}</option>
                                    {allCategories.map((item) => {
                                        const disabled =
                                            !hasQuestionsForLetterAndCategory(letter, item);
                                        return (
                                            <option key={item} value={item} disabled={disabled}>
                                                {disabled ? `${item} (غير متاح)` : item}
                                            </option>
                                        );
                                    })}
                                </select>
                            </label>
                            {allCategories.some(
                                (item) => !hasQuestionsForLetterAndCategory(letter, item)
                            ) && (
                                <p className="text-sm font-bold text-gray-700">
                                    التصنيفات غير المتاحة لهذا الحرف تظهر معطلة.
                                </p>
                            )}
                        </div>

                        <div className="border-4 border-black bg-[var(--color-neo-bg)] p-4 flex flex-col gap-4">
                            <p className="font-black text-xl">2) طريقة العرض</p>
                            <div className="flex flex-wrap gap-3">
                                <NeoButton
                                    variant={displayMode === 'full' ? 'primary' : 'gray'}
                                    className={displayMode === 'full' ? '' : '!bg-white'}
                                    onClick={() => handleDisplayModeChange('full')}
                                >
                                    عرض كامل
                                </NeoButton>
                                <NeoButton
                                    variant={displayMode === 'word-by-word' ? 'primary' : 'gray'}
                                    className={displayMode === 'word-by-word' ? '' : '!bg-white'}
                                    onClick={() => handleDisplayModeChange('word-by-word')}
                                >
                                    كلمة بكلمة
                                </NeoButton>
                            </div>
                            <p className="font-bold text-lg">
                                الوضع الحالي: {displayMode === 'full' ? 'عرض كامل' : 'كلمة بكلمة'}
                            </p>
                        </div>

                        <div className="border-4 border-black bg-[var(--color-neo-bg)] p-4 flex flex-col gap-3">
                            <p className="font-black text-xl">3) التحكم</p>
                            <NeoButton variant="blue" onClick={drawQuestion} disabled={loading}>
                                سؤال جديد
                            </NeoButton>
                            <NeoButton
                                variant="green"
                                disabled={!question}
                                onClick={() => setShowAnswer((current) => !current)}
                            >
                                {showAnswer ? 'إخفاء الإجابة' : 'إظهار الإجابة'}
                            </NeoButton>
                            {displayMode === 'word-by-word' && (
                                <NeoButton
                                    variant="primary"
                                    onClick={() => setRevealedWordCount((count) => Math.min(count + 1, words.length))}
                                    disabled={!question || revealedWords >= words.length}
                                >
                                    كشف الكلمة التالية
                                </NeoButton>
                            )}
                        </div>
                    </div>
                </section>

                <section className="border-8 border-black bg-white shadow-neo-lg p-4 sm:p-6 flex-1 min-h-[420px]">
                    {loading && (
                        <p className="text-center text-2xl font-black py-12">جاري تحميل الأسئلة...</p>
                    )}

                    {!loading && !question && (
                        <p className="text-center text-2xl font-black py-12">اضغط &quot;سؤال جديد&quot; لعرض السؤال.</p>
                    )}

                    {!loading && question && (
                        <div className="flex flex-col gap-6 h-full">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="bg-[var(--color-neo-blue)] text-white border-4 border-black px-4 py-2 font-black">
                                    حرف: {letter}
                                </div>
                                <div className="bg-[var(--color-neo-pink)] text-white border-4 border-black px-4 py-2 font-black">
                                    تصنيف: {question.category}
                                </div>
                                <div className="bg-[var(--color-neo-primary)] border-4 border-black px-4 py-2 font-black">
                                    عرض: {displayMode === 'full' ? 'كامل' : 'كلمة بكلمة'}
                                </div>
                                {displayMode === 'word-by-word' && (
                                    <div className="bg-white border-4 border-black px-4 py-2 font-black">
                                        الكلمات: {revealedWords}/{words.length}
                                    </div>
                                )}
                            </div>

                            <div className="border-8 border-black bg-[var(--color-neo-bg)] p-6 min-h-[220px] flex items-center">
                                {displayMode === 'full' ? (
                                    <h2 className="text-4xl font-black leading-tight w-full">{question.question}</h2>
                                ) : (
                                    <h2 className="text-4xl font-black leading-tight w-full">
                                        {words.map((word, index) =>
                                            index < revealedWords ? (
                                                <span key={`${word}-${index}`} className="mx-1 inline-block">
                                                    {word}
                                                </span>
                                            ) : (
                                                <span key={`${word}-${index}`} className="mx-1 text-black/30 inline-block">
                                                    •••
                                                </span>
                                            )
                                        )}
                                    </h2>
                                )}
                            </div>

                            {showAnswer && (
                                <div className="bg-[var(--color-neo-green)] border-8 border-black p-6 text-3xl font-black">
                                    الإجابة: {question.answer}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

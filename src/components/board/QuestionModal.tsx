import React, { useState, useEffect, useCallback } from 'react';
import { CellData, useGameStore } from '../../store/useGameStore';
import { NeoModal } from '../ui/NeoModal';
import { NeoButton } from '../ui/NeoButton';
import { Question } from '../../lib/questions';
import { useQuestions } from '../../hooks/useQuestions';

const RANDOM_LABEL = 'عشوائي';

interface QuestionModalProps {
    cell: CellData | null;
    isOpen: boolean;
    onClose: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({ cell, isOpen, onClose }) => {
    const [question, setQuestion] = useState<Question | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>(RANDOM_LABEL);
    const [revealedWordCount, setRevealedWordCount] = useState(0);
    const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [activeCellId, setActiveCellId] = useState<number | null>(null);

    const { captureCell, turn, activeFazaaTeam, usedQuestionIds, markQuestionUsed, clearActiveFazaaTeam } = useGameStore();
    const {
        questions,
        loading,
        getRandomQuestion,
        getAllCategories,
        hasQuestionsForLetterAndCategory,
    } = useQuestions();

    const allCategories = getAllCategories();
    const mustPickCategory = activeFazaaTeam !== null;

    if (cell && cell.id !== activeCellId) {
        setActiveCellId(cell.id);
        setQuestion(null);
        setSelectedCategory(RANDOM_LABEL);
        setRevealedWordCount(0);
        setTimerSeconds(null);
        setShowAnswer(false);
    }

    const loadQuestion = useCallback(
        (category?: string) => {
            if (!cell || questions.length === 0) return;
            const cat = category === RANDOM_LABEL || !category ? undefined : category;
            const q = getRandomQuestion(cell.letter, cat, usedQuestionIds);
            setQuestion(q);
            markQuestionUsed(q.id);
        },
        [cell, questions.length, getRandomQuestion, usedQuestionIds, markQuestionUsed]
    );

    useEffect(() => {
        if (isOpen && cell && !loading) {
            if (!(mustPickCategory && allCategories.length > 0)) {
                if (!question) {
                    loadQuestion(); // Random by default
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, cell?.id, loading, mustPickCategory, allCategories.length]);

    useEffect(() => {
        if (timerSeconds !== null && timerSeconds > 0) {
            const interval = setInterval(() => {
                setTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timerSeconds]);

    const handleChangeQuestion = () => {
        if (!cell) return;
        const cat = selectedCategory === RANDOM_LABEL ? undefined : selectedCategory;
        let nextQ = getRandomQuestion(cell.letter, cat, usedQuestionIds);
        let attempts = 0;
        while (question && nextQ.id === question.id && attempts < 5) {
            nextQ = getRandomQuestion(cell.letter, cat, usedQuestionIds);
            attempts++;
        }
        setQuestion(nextQ);
        markQuestionUsed(nextQ.id);
        setRevealedWordCount(0);
        setShowAnswer(false);
        setTimerSeconds(null);
    };

    const words = question ? question.question.split(/\s+/).filter(Boolean) : [];
    const revealNextWord = () => {
        setRevealedWordCount((prev) => Math.min(prev + 1, words.length));
    };

    const start5sTimer = () => {
        setTimerSeconds(5);
    };

    const handleCorrectRed = () => {
        if (cell) captureCell(cell.id, 'red');
        clearActiveFazaaTeam();
        onClose();
    };

    const handleCorrectBlue = () => {
        if (cell) captureCell(cell.id, 'blue');
        clearActiveFazaaTeam();
        onClose();
    };

    if (!cell) return null;

    // Loading state
    if (isOpen && loading) {
        return (
            <NeoModal isOpen={isOpen} onClose={onClose} title={`سؤال حرف - ${cell.letter}`}>
                <p className="text-center py-8">جاري تحميل الأسئلة...</p>
            </NeoModal>
        );
    }

    // فزعة صب: must pick category before seeing question - show ALL categories for full choice
    if (isOpen && mustPickCategory && allCategories.length > 0 && !question) {
        return (
            <NeoModal
                isOpen={isOpen}
                onClose={onClose}
                title={`فزعة صب - اختر التصنيف (حرف ${cell.letter})`}
            >
                <div className="flex flex-col gap-6 text-center">
                    <p className="text-xl font-bold">
                        الفريق {activeFazaaTeam === 'red' ? 'الأحمر' : 'الأزرق'} استخدم فزعة صب - اختر التصنيف
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 max-h-[60vh] overflow-y-auto">
                        {allCategories.map((cat) => {
                            const hasQuestions = hasQuestionsForLetterAndCategory(
                                cell.letter,
                                cat
                            );
                            return (
                                <NeoButton
                                    key={cat}
                                    variant="primary"
                                    disabled={!hasQuestions}
                                    title={
                                        !hasQuestions
                                            ? `لا توجد أسئلة في "${cat}" لحرف ${cell.letter}`
                                            : undefined
                                    }
                                    onClick={() => {
                                        if (!hasQuestions) return;
                                        setSelectedCategory(cat);
                                        setRevealedWordCount(0);
                                        loadQuestion(cat);
                                    }}
                                >
                                    {cat}
                                </NeoButton>
                            );
                        })}
                    </div>
                </div>
            </NeoModal>
        );
    }

    if (loading || !question) return null;

    return (
        <NeoModal
            isOpen={isOpen}
            onClose={onClose}
            title={`سؤال حرف - ${cell.letter}`}
            footer={
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <NeoButton variant="red" onClick={handleCorrectRed}>
                            إجابة صحيحة - أحمر
                        </NeoButton>
                        <NeoButton variant="blue" onClick={handleCorrectBlue}>
                            إجابة صحيحة - أزرق
                        </NeoButton>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <NeoButton variant="gray" onClick={() => setShowAnswer(true)}>
                            إظهار الإجابة / خطأ
                        </NeoButton>
                        <NeoButton variant="primary" onClick={handleChangeQuestion}>
                            تغيير السؤال
                        </NeoButton>
                        <NeoButton variant="gray" onClick={onClose} className="!bg-white">
                            إلغاء
                        </NeoButton>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col gap-6 text-center">
                <div className="bg-[var(--color-neo-pink)] text-white p-2 border-4 border-black inline-block mx-auto transform -rotate-2">
                    تصنيف: {question.category}
                </div>

                <h3
                    className="text-4xl font-black leading-tight border-b-8 border-black pb-6 cursor-pointer select-none min-h-[4rem] flex flex-wrap justify-center items-center gap-2"
                    onClick={revealNextWord}
                    title="اضغط لكشف الكلمة التالية"
                >
                    {words.map((word, i) =>
                        i < revealedWordCount ? (
                            <span key={i}>{word}</span>
                        ) : (
                            <span key={i} className="text-black/40">•••</span>
                        )
                    )}
                    {revealedWordCount < words.length && (
                        <span className="text-sm font-normal text-gray-500 block w-full mt-2">
                            اضغط لكشف الكلمة التالية
                        </span>
                    )}
                </h3>

                {showAnswer && (
                    <div className="bg-[var(--color-neo-green)] p-4 border-4 border-black text-3xl font-bold animate-pulse">
                        الإجابة: {question.answer}
                    </div>
                )}

                <div className="mt-8">
                    {timerSeconds === null ? (
                        <NeoButton variant="primary" onClick={start5sTimer} size="lg">
                            بدء العداد 5 ثواني
                        </NeoButton>
                    ) : (
                        <div
                            className={`text-6xl font-black border-4 border-black p-4 inline-block ${timerSeconds === 0
                                ? 'bg-[var(--color-neo-red)] text-white animate-bounce'
                                : 'bg-white'
                                }`}
                        >
                            00:0{timerSeconds}
                        </div>
                    )}
                </div>
            </div>
        </NeoModal>
    );
};

import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  createVariantQuestion,
  INITIAL_QUESTIONS,
  mergeTags,
  normalizeQuestionForType,
  QuestionBankItem,
  QuestionStatus,
} from './questionBank';

interface QuestionBankContextValue {
  questions: QuestionBankItem[];
  addQuestions: (questions: QuestionBankItem[]) => void;
  updateQuestion: (question: QuestionBankItem) => void;
  removeQuestion: (id: string) => void;
  bulkAddCustomTags: (ids: string[], tags: string[]) => void;
  bulkSetStatus: (ids: string[], status: QuestionStatus) => void;
  generateVariants: (ids: string[]) => QuestionBankItem[];
}

const QuestionBankContext = createContext<QuestionBankContextValue | null>(null);

export function QuestionBankProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<QuestionBankItem[]>(INITIAL_QUESTIONS);

  const value = useMemo<QuestionBankContextValue>(() => ({
    questions,
    addQuestions: (nextQuestions) => {
      setQuestions(prev => [
        ...nextQuestions.map(question => normalizeQuestionForType(question)),
        ...prev,
      ]);
    },
    updateQuestion: (question) => {
      setQuestions(prev => prev.map(item => item.id === question.id ? normalizeQuestionForType(question) : item));
    },
    removeQuestion: (id) => {
      setQuestions(prev => prev.filter(item => item.id !== id));
    },
    bulkAddCustomTags: (ids, tags) => {
      setQuestions(prev => prev.map(item => ids.includes(item.id)
        ? { ...item, customTags: mergeTags(item.customTags, tags) }
        : item
      ));
    },
    bulkSetStatus: (ids, status) => {
      setQuestions(prev => prev.map(item => ids.includes(item.id) ? { ...item, status } : item));
    },
    generateVariants: (ids) => {
      const sources = questions.filter(item => ids.includes(item.id));
      const variants = sources.flatMap(source => [0, 1, 2].map(index => createVariantQuestion(source, index)));
      setQuestions(prev => [...variants, ...prev]);
      return variants;
    },
  }), [questions]);

  return (
    <QuestionBankContext.Provider value={value}>
      {children}
    </QuestionBankContext.Provider>
  );
}

export function useQuestionBank() {
  const value = useContext(QuestionBankContext);
  if (!value) {
    throw new Error('useQuestionBank must be used inside QuestionBankProvider');
  }
  return value;
}

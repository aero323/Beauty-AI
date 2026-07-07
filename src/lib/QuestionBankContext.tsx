import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  createTaxonomyTag,
  createVariantQuestion,
  getTagNameKey,
  INITIAL_QUESTIONS,
  limitQuestionTags,
  mergeTags,
  normalizeQuestionForType,
  normalizeTagName,
  QuestionBankItem,
  QuestionStatus,
  QUESTION_TAXONOMY,
  TaxonomyTag,
} from './questionBank';

interface QuestionBankContextValue {
  questions: QuestionBankItem[];
  tags: TaxonomyTag[];
  addQuestions: (questions: QuestionBankItem[]) => void;
  updateQuestion: (question: QuestionBankItem) => void;
  removeQuestion: (id: string) => void;
  bulkAddTags: (ids: string[], tags: string[]) => void;
  bulkSetStatus: (ids: string[], status: QuestionStatus) => void;
  generateVariants: (ids: string[]) => QuestionBankItem[];
  addTag: (name: string) => void;
  renameTag: (id: string, name: string) => void;
  deleteTag: (id: string) => void;
}

const QuestionBankContext = createContext<QuestionBankContextValue | null>(null);

interface QuestionBankState {
  questions: QuestionBankItem[];
  tags: TaxonomyTag[];
}

function addTagToCollection(tags: TaxonomyTag[], name: string) {
  const normalized = normalizeTagName(name);
  if (!normalized) return { tags, tagId: '' };

  const existing = tags.find(tag => getTagNameKey(tag.name) === getTagNameKey(normalized));
  if (existing) return { tags, tagId: existing.id };

  let nextTag = createTaxonomyTag(normalized);
  if (tags.some(tag => tag.id === nextTag.id)) {
    nextTag = { ...nextTag, id: `${nextTag.id}-${tags.length + 1}` };
  }
  return { tags: [...tags, nextTag], tagId: nextTag.id };
}

function buildInitialTags() {
  return INITIAL_QUESTIONS.flatMap(question => question.customTags).reduce((currentTags, name) => {
    return addTagToCollection(currentTags, name).tags;
  }, QUESTION_TAXONOMY.tags);
}

function normalizeQuestionWithTags(question: QuestionBankItem, tags: TaxonomyTag[], promoteCustomTags: boolean) {
  let workingTags = tags;
  let normalizedQuestion = normalizeQuestionForType(question);

  if (promoteCustomTags && normalizedQuestion.customTags.length > 0) {
    const nextTagIds = [...normalizedQuestion.tagIds];

    normalizedQuestion.customTags.forEach(name => {
      const result = addTagToCollection(workingTags, name);
      workingTags = result.tags;
      if (result.tagId) nextTagIds.push(result.tagId);
    });

    normalizedQuestion = {
      ...normalizedQuestion,
      tagIds: Array.from(new Set(nextTagIds)),
      customTags: [],
    };
  }

  return {
    tags: workingTags,
    question: limitQuestionTags(normalizedQuestion),
  };
}

function createInitialQuestionBankState(): QuestionBankState {
  const initialTags = buildInitialTags();
  const questions = INITIAL_QUESTIONS.map(question => normalizeQuestionWithTags(question, initialTags, true).question);
  return { questions, tags: initialTags };
}

export function QuestionBankProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<QuestionBankState>(createInitialQuestionBankState);

  const value = useMemo<QuestionBankContextValue>(() => ({
    questions: state.questions,
    tags: state.tags,
    addQuestions: (nextQuestions) => {
      setState(prev => {
        let workingTags = prev.tags;
        const normalizedQuestions = nextQuestions.map(question => {
          const result = normalizeQuestionWithTags(question, workingTags, question.status !== 'pending_review');
          workingTags = result.tags;
          return result.question;
        });

        return {
          tags: workingTags,
          questions: [...normalizedQuestions, ...prev.questions],
        };
      });
    },
    updateQuestion: (question) => {
      setState(prev => {
        const result = normalizeQuestionWithTags(question, prev.tags, question.status !== 'pending_review');
        return {
          tags: result.tags,
          questions: prev.questions.map(item => item.id === question.id ? result.question : item),
        };
      });
    },
    removeQuestion: (id) => {
      setState(prev => ({ ...prev, questions: prev.questions.filter(item => item.id !== id) }));
    },
    bulkAddTags: (ids, names) => {
      setState(prev => {
        let workingTags = prev.tags;
        const tagIdsToApply: string[] = [];

        names.forEach(name => {
          const result = addTagToCollection(workingTags, name);
          workingTags = result.tags;
          if (result.tagId) tagIdsToApply.push(result.tagId);
        });

        return {
          tags: workingTags,
          questions: prev.questions.map(item => ids.includes(item.id)
            ? limitQuestionTags({
              ...item,
              tagIds: Array.from(new Set([...item.tagIds, ...tagIdsToApply])),
            })
            : item
          ),
        };
      });
    },
    bulkSetStatus: (ids, status) => {
      setState(prev => ({
        ...prev,
        questions: prev.questions.map(item => ids.includes(item.id) ? { ...item, status } : item),
      }));
    },
    generateVariants: (ids) => {
      const sources = state.questions.filter(item => ids.includes(item.id));
      const variants = sources.flatMap(source => [0, 1, 2].map(index => createVariantQuestion(source, index)));
      setState(prev => ({ ...prev, questions: [...variants, ...prev.questions] }));
      return variants;
    },
    addTag: (name) => {
      setState(prev => ({ ...prev, tags: addTagToCollection(prev.tags, name).tags }));
    },
    renameTag: (id, name) => {
      setState(prev => {
        const target = prev.tags.find(tag => tag.id === id);
        const normalizedName = normalizeTagName(name);
        if (!target || !normalizedName) return prev;

        const duplicate = prev.tags.find(tag => tag.id !== id && getTagNameKey(tag.name) === getTagNameKey(normalizedName));
        if (duplicate) {
          return {
            tags: prev.tags.filter(tag => tag.id !== id),
            questions: prev.questions.map(question => ({
              ...question,
              tagIds: Array.from(new Set(question.tagIds.map(tagId => tagId === id ? duplicate.id : tagId))),
              customTags: question.customTags.filter(tag => getTagNameKey(tag) !== getTagNameKey(normalizedName)),
            })),
          };
        }

        return {
          tags: prev.tags.map(tag => tag.id === id ? { ...tag, name: normalizedName } : tag),
          questions: prev.questions.map(question => ({
            ...question,
            customTags: question.customTags.map(tag => getTagNameKey(tag) === getTagNameKey(target.name) ? normalizedName : tag),
          })),
        };
      });
    },
    deleteTag: (id) => {
      setState(prev => {
        const target = prev.tags.find(tag => tag.id === id);
        if (!target) return prev;

        return {
          tags: prev.tags.filter(tag => tag.id !== id),
          questions: prev.questions.map(question => ({
            ...question,
            tagIds: question.tagIds.filter(tagId => tagId !== id),
            customTags: question.customTags.filter(tag => getTagNameKey(tag) !== getTagNameKey(target.name)),
          })),
        };
      });
    },
  }), [state]);

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

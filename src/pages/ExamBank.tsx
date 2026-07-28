import React, { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Database,
  Edit,
  FileText,
  FolderTree,
  Library,
  Loader2,
  Plus,
  Replace,
  Save,
  Search,
  Sparkles,
  Tags,
  Trash2,
  Wand2,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';
import { useQuestionBank } from '../lib/QuestionBankContext';
import { aiActionTone } from '../lib/visualTones';
import {
  createQuestionId,
  DEFAULT_FILTERS,
  DIFFICULTY_LABELS,
  filterQuestions,
  findProduct,
  findProductLine,
  GENERAL_CAPABILITY_LINE_ID,
  getTagNameKey,
  getQuestionAnswerText,
  getQuestionTagNames,
  MAX_TAGS_PER_QUESTION,
  mergeTags,
  normalizeQuestionForType,
  normalizeTagName,
  parseTagInput,
  QUESTION_TAXONOMY,
  QUESTION_TYPE_LABELS,
  QuestionBankItem,
  QuestionDifficulty,
  QuestionFilters,
  QuestionMediaType,
  QuestionOption,
  QuestionStatus,
  QuestionType,
  STATUS_LABELS,
} from '../lib/questionBank';

const statusBadgeClass: Record<QuestionStatus, string> = {
  active: 'bg-[#EEF8F4] text-[#2F735C] border-[#BFDCCF]',
  pending_review: 'bg-[#FFF7EA] text-[#8B621F] border-[#E8CCA0]',
  draft: 'bg-slate-100 text-[#5D565A] border-slate-200',
  archived: 'bg-[#F1ECE8] text-[#766F73] border-[#E5DED8]',
};

const typeToneClass: Record<QuestionType, string> = {
  single_choice: 'bg-rose-50 text-rose-700 border-rose-200',
  multiple_choice: 'bg-[#EEF8F4] text-[#2F735C] border-[#BFDCCF]',
  true_false: 'bg-[#FFF7EA] text-[#8B621F] border-[#E8CCA0]',
  short_answer: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  dropdown: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  ordering: 'bg-amber-50 text-amber-700 border-amber-200',
  checkbox_grid: 'bg-violet-50 text-violet-700 border-violet-200',
  file_upload: 'bg-slate-100 text-slate-700 border-slate-200',
};

const TAG_MANAGE_PAGE_SIZE = 60;
type TagSortMode = 'usage_desc' | 'usage_asc' | 'name_asc' | 'unused_first';
type TreeFilterKey = 'brandIds' | 'productLineIds' | 'categoryIds';
type TreeDraftFilters = Pick<QuestionFilters, TreeFilterKey>;
type FilterTreeSectionId = 'brand' | 'productLine' | 'category' | 'generalCapability';

const emptyTreeFilters = (): TreeDraftFilters => ({
  brandIds: [],
  productLineIds: [],
  categoryIds: [],
});

const copyTreeFilters = (filters: TreeDraftFilters): TreeDraftFilters => ({
  brandIds: [...filters.brandIds],
  productLineIds: [...filters.productLineIds],
  categoryIds: [...filters.categoryIds],
});

const countTreeSelections = (filters: TreeDraftFilters) => (
  filters.brandIds.length + filters.productLineIds.length + filters.categoryIds.length
);

const sameTreeSelections = (a: TreeDraftFilters, b: TreeDraftFilters) => {
  const sameValues = (left: string[], right: string[]) => left.length === right.length && left.every(value => right.includes(value));
  return sameValues(a.brandIds, b.brandIds)
    && sameValues(a.productLineIds, b.productLineIds)
    && sameValues(a.categoryIds, b.categoryIds);
};

const getVariantGenerationStep = (progress: number) => {
  if (progress < 25) return '读取旧题题干、答案和分类标签...';
  if (progress < 50) return '围绕同一考点生成不同问法...';
  if (progress < 75) return '继承题目分类、标签和来源信息...';
  if (progress < 100) return '检查相似度并写入待审核列表...';
  return '生成完成，准备进入待审核';
};

const blankQuestion = (): QuestionBankItem => normalizeQuestionForType({
  id: createQuestionId('manual'),
  type: 'single_choice',
  stem: '',
  options: [
    { id: 'a', label: 'A', text: '' },
    { id: 'b', label: 'B', text: '' },
    { id: 'c', label: 'C', text: '' },
    { id: 'd', label: 'D', text: '' },
  ],
  correctOptionIds: ['a'],
  productLineId: QUESTION_TAXONOMY.productLines[0]?.id,
  productId: QUESTION_TAXONOMY.productLines[0]?.products[0]?.id,
  tagIds: [],
  customTags: [],
  difficulty: 'basic',
  sourceFile: '手动录入',
  status: 'draft',
});

function cloneQuestion(question: QuestionBankItem): QuestionBankItem {
  return {
    ...question,
    options: question.options?.map(option => ({ ...option })),
    tagIds: [...question.tagIds],
    customTags: [...question.customTags],
    correctOptionIds: question.correctOptionIds ? [...question.correctOptionIds] : undefined,
    gridRows: question.gridRows?.map(row => ({ ...row })),
    gridColumns: question.gridColumns?.map(column => ({ ...column })),
    gridCorrectAnswers: question.gridCorrectAnswers?.map(answer => ({ ...answer })),
    allowedUploadTypes: question.allowedUploadTypes ? [...question.allowedUploadTypes] : undefined,
    attachments: question.attachments?.map(attachment => ({ ...attachment })),
  };
}

function countByProductLine(questions: QuestionBankItem[], productLineId: string) {
  return questions.filter(question => question.productLineId === productLineId && question.status !== 'archived').length;
}

function countByBrand(questions: QuestionBankItem[], brandId: string) {
  return questions.filter(question => {
    const product = findProduct(question.productLineId, question.productId);
    return product?.brandId === brandId && question.status !== 'archived';
  }).length;
}

function countByCategory(questions: QuestionBankItem[], categoryId: string) {
  return questions.filter(question => {
    const product = findProduct(question.productLineId, question.productId);
    return product?.categoryId === categoryId && question.status !== 'archived';
  }).length;
}

export function ExamBank() {
  const {
    questions,
    tags,
    addQuestions,
    updateQuestion,
    removeQuestion,
    bulkAddTags,
    bulkSetStatus,
    generateVariants,
    addTag,
    renameTag,
    deleteTag,
  } = useQuestionBank();

  const [filters, setFilters] = useState<QuestionFilters>(DEFAULT_FILTERS);
  const [treeDraft, setTreeDraft] = useState<TreeDraftFilters>(() => copyTreeFilters(DEFAULT_FILTERS));
  const [collapsedTreeSections, setCollapsedTreeSections] = useState<Record<FilterTreeSectionId, boolean>>({
    brand: false,
    productLine: false,
    category: false,
    generalCapability: false,
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');
  const [tagDialog, setTagDialog] = useState(false);
  const [batchTags, setBatchTags] = useState('');
  const [tagManageDialog, setTagManageDialog] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [tagSort, setTagSort] = useState<TagSortMode>('usage_desc');
  const [tagPage, setTagPage] = useState(1);
  const [tagDraftNames, setTagDraftNames] = useState<Record<string, string>>({});
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);
  const [editingMode, setEditingMode] = useState<'create' | 'edit' | null>(null);
  const [customTagInput, setCustomTagInput] = useState('');
  const [variantGeneration, setVariantGeneration] = useState<{
    progress: number;
    sourceCount: number;
    targetCount: number;
    step: string;
  } | null>(null);

  useEffect(() => {
    setTreeDraft({
      brandIds: [...filters.brandIds],
      productLineIds: [...filters.productLineIds],
      categoryIds: [...filters.categoryIds],
    });
  }, [filters.brandIds, filters.productLineIds, filters.categoryIds]);

  const filteredQuestions = useMemo(() => filterQuestions(questions, filters, tags), [questions, filters, tags]);
  const allVisibleSelected = filteredQuestions.length > 0 && filteredQuestions.every(question => selectedIds.has(question.id));
  const selectedQuestions = questions.filter(question => selectedIds.has(question.id));
  const pendingCount = questions.filter(question => question.status === 'pending_review').length;

  const productsForFilter = filters.productLineId === 'all'
    ? QUESTION_TAXONOMY.productLines.flatMap(line => line.products)
    : findProductLine(filters.productLineId)?.products || [];
  const filterLineHasProducts = filters.productLineId === 'all' || productsForFilter.length > 0;
  const editingProductLine = editingQuestion?.productLineId ? findProductLine(editingQuestion.productLineId) : undefined;
  const editingProducts = editingProductLine?.products || [];
  const editingUsesTagSubclassification = !!editingQuestion && (
    editingQuestion.productLineId === GENERAL_CAPABILITY_LINE_ID || editingProducts.length === 0
  );

  const tagUsageById = useMemo(() => {
    const usage = new Map<string, number>(tags.map(tag => [tag.id, 0]));
    const tagIdByName = new Map<string, string>(tags.map(tag => [getTagNameKey(tag.name), tag.id]));

    questions.forEach(question => {
      const usedInQuestion = new Set<string>();
      question.tagIds.forEach(tagId => {
        if (usage.has(tagId)) usedInQuestion.add(tagId);
      });
      question.customTags.forEach(tagName => {
        const tagId = tagIdByName.get(getTagNameKey(tagName));
        if (tagId) usedInQuestion.add(tagId);
      });
      usedInQuestion.forEach(tagId => usage.set(tagId, (usage.get(tagId) || 0) + 1));
    });

    return usage;
  }, [questions, tags]);

  const tagRows = useMemo(() => {
    const keyword = tagSearch.trim().toLocaleLowerCase();
    return tags
      .map(tag => ({ tag, usage: tagUsageById.get(tag.id) || 0 }))
      .filter(row => !keyword || row.tag.name.toLocaleLowerCase().includes(keyword))
      .sort((a, b) => {
        if (tagSort === 'usage_asc') return a.usage - b.usage || a.tag.name.localeCompare(b.tag.name, 'zh-Hans-CN');
        if (tagSort === 'name_asc') return a.tag.name.localeCompare(b.tag.name, 'zh-Hans-CN');
        if (tagSort === 'unused_first') return Number(a.usage > 0) - Number(b.usage > 0) || a.tag.name.localeCompare(b.tag.name, 'zh-Hans-CN');
        return b.usage - a.usage || a.tag.name.localeCompare(b.tag.name, 'zh-Hans-CN');
      });
  }, [tagSearch, tagSort, tagUsageById, tags]);

  const totalTagPages = Math.max(1, Math.ceil(tagRows.length / TAG_MANAGE_PAGE_SIZE));
  const currentTagPage = Math.min(tagPage, totalTagPages);
  const tagPageStart = (currentTagPage - 1) * TAG_MANAGE_PAGE_SIZE;
  const visibleTagRows = tagRows.slice(tagPageStart, tagPageStart + TAG_MANAGE_PAGE_SIZE);
  const sidebarTags = useMemo(() => {
    return [...tags]
      .sort((a, b) => (tagUsageById.get(b.id) || 0) - (tagUsageById.get(a.id) || 0) || a.name.localeCompare(b.name, 'zh-Hans-CN'))
      .slice(0, 18);
  }, [tagUsageById, tags]);
  const duplicates = useMemo(() => {
    const first = questions.find(question => question.id === 'b1');
    const second = questions.find(question => question.id === 'b2');
    if (!first || !second) return [];
    return [{ targetId: second.id, similarToId: first.id, matchPercent: 85 }];
  }, [questions]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  };

  const updateFilters = (patch: Partial<QuestionFilters>) => {
    setFilters(prev => ({ ...prev, ...patch }));
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filteredQuestions.map(question => question.id)));
  };

  const openCreatePanel = () => {
    setEditingQuestion(blankQuestion());
    setEditingMode('create');
    setCustomTagInput('');
  };

  const openEditPanel = (question: QuestionBankItem) => {
    setEditingQuestion(cloneQuestion(question));
    setEditingMode('edit');
    setCustomTagInput('');
  };

  const closeEditPanel = () => {
    setEditingQuestion(null);
    setEditingMode(null);
    setCustomTagInput('');
  };

  const saveEditingQuestion = () => {
    if (!editingQuestion) return;
    const normalized = normalizeQuestionForType(editingQuestion);
    if (editingMode === 'create') {
      addQuestions([normalized]);
      showToast('已新增题目草稿');
    } else {
      updateQuestion(normalized);
      showToast(normalized.status === 'pending_review' ? '待审核题目已更新' : '题目已保存');
    }
    closeEditPanel();
  };

  const approveEditingQuestion = () => {
    if (!editingQuestion) return;
    const normalized = normalizeQuestionForType({ ...editingQuestion, status: 'active' });
    if (editingMode === 'create') {
      addQuestions([normalized]);
    } else {
      updateQuestion(normalized);
    }
    showToast('题目已审核入库');
    closeEditPanel();
  };

  const setEditingField = <K extends keyof QuestionBankItem>(key: K, value: QuestionBankItem[K]) => {
    setEditingQuestion(prev => prev ? normalizeQuestionForType({ ...prev, [key]: value }) : prev);
  };

  const handleTypeChange = (type: QuestionType) => {
    if (!editingQuestion) return;
    setEditingQuestion(normalizeQuestionForType({ ...editingQuestion, type }));
  };

  const handleProductLineChange = (productLineId: string) => {
    const firstProductId = findProductLine(productLineId)?.products[0]?.id;
    setEditingQuestion(prev => prev ? { ...prev, productLineId, productId: firstProductId } : prev);
  };

  const toggleTag = (tagId: string) => {
    setEditingQuestion(prev => {
      if (!prev) return prev;
      const tag = tags.find(item => item.id === tagId);
      const selectedNames = getQuestionTagNames(prev, tags);
      const nextTags = prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId];

      if (!prev.tagIds.includes(tagId) && selectedNames.length >= MAX_TAGS_PER_QUESTION) {
        showToast(`每道题最多 ${MAX_TAGS_PER_QUESTION} 个标签`);
        return prev;
      }

      return {
        ...prev,
        tagIds: nextTags,
        customTags: tag ? prev.customTags.filter(name => getTagNameKey(name) !== getTagNameKey(tag.name)) : prev.customTags,
      };
    });
  };

  const addCustomTag = () => {
    if (!editingQuestion) return;
    const inputTags = parseTagInput(customTagInput).map(normalizeTagName).filter(Boolean);
    if (inputTags.length === 0) return;
    const currentTagCount = getQuestionTagNames(editingQuestion, tags).length;

    if (currentTagCount >= MAX_TAGS_PER_QUESTION) {
      showToast(`每道题最多 ${MAX_TAGS_PER_QUESTION} 个标签`);
      setCustomTagInput('');
      return;
    }

    if (inputTags.length > MAX_TAGS_PER_QUESTION - currentTagCount) {
      showToast(`每道题最多 ${MAX_TAGS_PER_QUESTION} 个标签`);
    }

    setEditingQuestion(prev => {
      if (!prev) return prev;
      let nextTagIds = [...prev.tagIds];
      let nextCustomTags = [...prev.customTags];
      let selectedNames = getQuestionTagNames(prev, tags);

      inputTags.forEach(name => {
        if (selectedNames.length >= MAX_TAGS_PER_QUESTION) return;
        const existing = tags.find(tag => getTagNameKey(tag.name) === getTagNameKey(name));
        const alreadySelected = selectedNames.some(tagName => getTagNameKey(tagName) === getTagNameKey(name));
        if (alreadySelected) return;

        if (existing) {
          nextTagIds = Array.from(new Set([...nextTagIds, existing.id]));
        } else {
          nextCustomTags = mergeTags(nextCustomTags, [name]);
        }
        selectedNames = mergeTags(selectedNames, [name]);
      });

      return { ...prev, tagIds: nextTagIds, customTags: nextCustomTags };
    });
    setCustomTagInput('');
  };

  const removeCustomTag = (tag: string) => {
    setEditingQuestion(prev => {
      if (!prev) return prev;
      const matchedCommonTag = tags.find(item => getTagNameKey(item.name) === getTagNameKey(tag));
      return {
        ...prev,
        tagIds: matchedCommonTag ? prev.tagIds.filter(id => id !== matchedCommonTag.id) : prev.tagIds,
        customTags: prev.customTags.filter(item => getTagNameKey(item) !== getTagNameKey(tag)),
      };
    });
  };

  const updateOption = (optionId: string, text: string) => {
    setEditingQuestion(prev => {
      if (!prev?.options) return prev;
      return {
        ...prev,
        options: prev.options.map(option => option.id === optionId ? { ...option, text } : option),
      };
    });
  };

  const addOption = () => {
    setEditingQuestion(prev => {
      if (!prev?.options) return prev;
      const label = String.fromCharCode(65 + prev.options.length);
      const option: QuestionOption = { id: `${label.toLowerCase()}-${Date.now()}`, label, text: '' };
      const nextOptions = [...prev.options, option];
      return {
        ...prev,
        options: nextOptions,
        correctOptionIds: prev.type === 'ordering'
          ? [...(prev.correctOptionIds || []), option.id]
          : prev.correctOptionIds,
      };
    });
  };

  const toggleCorrectOption = (optionId: string) => {
    setEditingQuestion(prev => {
      if (!prev) return prev;
      if (prev.type === 'single_choice' || prev.type === 'true_false' || prev.type === 'dropdown') {
        return { ...prev, correctOptionIds: [optionId] };
      }
      if (prev.type === 'ordering') return prev;
      const current = prev.correctOptionIds || [];
      const next = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      return { ...prev, correctOptionIds: next };
    });
  };

  const setOrderingPosition = (optionId: string, position: number) => {
    setEditingQuestion(prev => {
      if (!prev?.options || prev.type !== 'ordering') return prev;
      const currentOrder = prev.correctOptionIds?.length === prev.options.length
        ? [...prev.correctOptionIds]
        : prev.options.map(option => option.id);
      const withoutOption = currentOrder.filter(id => id !== optionId);
      withoutOption.splice(position, 0, optionId);
      return { ...prev, correctOptionIds: withoutOption };
    });
  };

  const updateGridItem = (key: 'gridRows' | 'gridColumns', itemId: string, text: string) => {
    setEditingQuestion(prev => {
      if (!prev) return prev;
      const items = prev[key] || [];
      return {
        ...prev,
        [key]: items.map(item => item.id === itemId ? { ...item, text } : item),
      };
    });
  };

  const addGridItem = (key: 'gridRows' | 'gridColumns') => {
    setEditingQuestion(prev => {
      if (!prev) return prev;
      const items = prev[key] || [];
      const isRow = key === 'gridRows';
      const index = items.length + 1;
      const item: QuestionOption = {
        id: `${isRow ? 'r' : 'c'}-${Date.now()}`,
        label: isRow ? String(index) : String.fromCharCode(64 + index),
        text: '',
      };
      return { ...prev, [key]: [...items, item] };
    });
  };

  const toggleGridAnswer = (rowId: string, columnId: string) => {
    setEditingQuestion(prev => {
      if (!prev || prev.type !== 'checkbox_grid') return prev;
      const current = prev.gridCorrectAnswers || [];
      const exists = current.some(answer => answer.rowId === rowId && answer.columnId === columnId);
      return {
        ...prev,
        gridCorrectAnswers: exists
          ? current.filter(answer => !(answer.rowId === rowId && answer.columnId === columnId))
          : [...current, { rowId, columnId }],
      };
    });
  };

  const toggleAllowedUploadType = (type: QuestionMediaType) => {
    setEditingQuestion(prev => {
      if (!prev || prev.type !== 'file_upload') return prev;
      const current = prev.allowedUploadTypes || [];
      const next = current.includes(type)
        ? current.filter(item => item !== type)
        : [...current, type];
      return { ...prev, allowedUploadTypes: next.length > 0 ? next : [type] };
    });
  };

  const addAttachment = (type: QuestionMediaType, file?: File) => {
    setEditingQuestion(prev => {
      if (!prev) return prev;
      const nextAttachment = {
        id: `att-${Date.now()}`,
        type,
        name: file?.name || (type === 'image' ? '题目图片' : '题目视频'),
        url: file ? URL.createObjectURL(file) : (type === 'image' ? 'https://example.com/question-image.jpg' : 'https://example.com/question-video.mp4'),
      };
      return { ...prev, attachments: [...(prev.attachments || []), nextAttachment] };
    });
  };

  const handleAttachmentUpload = (type: QuestionMediaType, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    addAttachment(type, file);
    event.currentTarget.value = '';
  };

  const updateAttachment = (attachmentId: string, patch: { name?: string; url?: string }) => {
    setEditingQuestion(prev => prev ? {
      ...prev,
      attachments: (prev.attachments || []).map(attachment => attachment.id === attachmentId ? { ...attachment, ...patch } : attachment),
    } : prev);
  };

  const removeAttachment = (attachmentId: string) => {
    setEditingQuestion(prev => prev ? {
      ...prev,
      attachments: (prev.attachments || []).filter(attachment => attachment.id !== attachmentId),
    } : prev);
  };

  const saveBatchTags = () => {
    const tags = parseTagInput(batchTags);
    if (tags.length === 0 || selectedIds.size === 0) return;
    bulkAddTags(Array.from(selectedIds), tags);
    setTagDialog(false);
    setBatchTags('');
    setSelectedIds(new Set());
    showToast('批量标签已成功应用');
  };

  const openTagManageDialog = () => {
    setTagDraftNames(Object.fromEntries(tags.map(tag => [tag.id, tag.name])));
    setNewTagName('');
    setTagSearch('');
    setTagSort('usage_desc');
    setTagPage(1);
    setTagManageDialog(true);
  };

  const handleAddCommonTag = () => {
    const normalized = normalizeTagName(newTagName);
    if (!normalized) return;
    addTag(normalized);
    setNewTagName('');
    showToast('标签已新增，同名会自动去重');
  };

  const handleRenameCommonTag = (tagId: string) => {
    const normalized = normalizeTagName(tagDraftNames[tagId] || '');
    if (!normalized) return;
    renameTag(tagId, normalized);
    showToast('标签名称已更新');
  };

  const handleDeleteCommonTag = (tagId: string) => {
    if (filters.tagId === tagId) updateFilters({ tagId: 'all' });
    deleteTag(tagId);
    showToast('标签已删除，并已从题目上解除关联');
  };

  const handleBatchArchive = () => {
    if (selectedIds.size === 0) return;
    bulkSetStatus(Array.from(selectedIds), 'archived');
    showToast(`已归档 ${selectedIds.size} 道题目`);
    setSelectedIds(new Set());
  };

  const handleGenerateVariants = (ids: string[]) => {
    if (ids.length === 0 || variantGeneration) return;
    const sourceIds = [...ids];
    const targetCount = sourceIds.length * 3;
    let progress = 8;

    setVariantGeneration({
      progress,
      sourceCount: sourceIds.length,
      targetCount,
      step: getVariantGenerationStep(progress),
    });

    const interval = window.setInterval(() => {
      progress = Math.min(progress + 18, 100);
      setVariantGeneration({
        progress,
        sourceCount: sourceIds.length,
        targetCount,
        step: getVariantGenerationStep(progress),
      });

      if (progress >= 100) {
        window.clearInterval(interval);
        window.setTimeout(() => {
          const variants = generateVariants(sourceIds);
          setVariantGeneration(null);
          setFilters(prev => ({
            ...prev,
            status: 'pending_review',
            brandId: 'all',
            brandIds: [],
            productLineId: 'all',
            productLineIds: [],
            productId: 'all',
            categoryId: 'all',
            categoryIds: [],
          }));
          setSelectedIds(new Set(variants.map(question => question.id)));
          showToast(`AI 已生成 ${variants.length} 道待审核变体题`);
        }, 250);
      }
    }, 320);
  };

  const handleResolveDuplicate = (keepId: string, deleteId: string) => {
    removeQuestion(deleteId);
    setShowDuplicates(false);
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(deleteId);
      next.add(keepId);
      return next;
    });
    showToast('成功合并重复题目！');
  };

  const appliedTreeFilters = copyTreeFilters(filters);
  const treeDraftSelectionCount = countTreeSelections(treeDraft);
  const treeDraftHasChanges = !sameTreeSelections(treeDraft, appliedTreeFilters);
  const isAllTreeActive = treeDraftSelectionCount === 0;

  const clearTreeDraft = () => {
    setTreeDraft(emptyTreeFilters());
  };

  const toggleTreeDraftValue = (key: TreeFilterKey, id: string) => {
    setTreeDraft(prev => {
      const values = prev[key];
      const nextValues = values.includes(id)
        ? values.filter(value => value !== id)
        : [...values, id];
      return { ...prev, [key]: nextValues };
    });
  };

  const toggleTreeSection = (sectionId: FilterTreeSectionId) => {
    setCollapsedTreeSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const applyTreeFilters = () => updateFilters({
    brandId: 'all',
    brandIds: [...treeDraft.brandIds],
    productLineId: 'all',
    productLineIds: [...treeDraft.productLineIds],
    productId: 'all',
    categoryId: 'all',
    categoryIds: [...treeDraft.categoryIds],
  });

  const filterTreeSections: Array<{
    id: FilterTreeSectionId;
    title: string;
    items: Array<{
      id: string;
      name: string;
      count: number;
      checked: boolean;
      onToggle: () => void;
      skipI18n?: boolean;
    }>;
  }> = [
    {
      id: 'brand',
      title: '品牌',
      items: QUESTION_TAXONOMY.brands.map(brand => ({
        id: brand.id,
        name: brand.name,
        count: countByBrand(questions, brand.id),
        checked: treeDraft.brandIds.includes(brand.id),
        onToggle: () => toggleTreeDraftValue('brandIds', brand.id),
        skipI18n: true,
      })),
    },
    {
      id: 'productLine',
      title: '产品线',
      items: QUESTION_TAXONOMY.productLines
        .filter(line => line.id !== GENERAL_CAPABILITY_LINE_ID)
        .map(line => ({
          id: line.id,
          name: line.name,
          count: countByProductLine(questions, line.id),
          checked: treeDraft.productLineIds.includes(line.id),
          onToggle: () => toggleTreeDraftValue('productLineIds', line.id),
        })),
    },
    {
      id: 'category',
      title: '类别',
      items: QUESTION_TAXONOMY.categories.map(category => ({
        id: category.id,
        name: category.name,
        count: countByCategory(questions, category.id),
        checked: treeDraft.categoryIds.includes(category.id),
        onToggle: () => toggleTreeDraftValue('categoryIds', category.id),
      })),
    },
    {
      id: 'generalCapability',
      title: '通用能力',
      items: [{
        id: GENERAL_CAPABILITY_LINE_ID,
        name: '通用能力题',
        count: countByProductLine(questions, GENERAL_CAPABILITY_LINE_ID),
        checked: treeDraft.productLineIds.includes(GENERAL_CAPABILITY_LINE_ID),
        onToggle: () => toggleTreeDraftValue('productLineIds', GENERAL_CAPABILITY_LINE_ID),
      }],
    },
  ];

  return (
    <div className="relative flex h-[calc(100vh-6rem)] min-h-[680px] flex-col gap-4 overflow-hidden">
      {toast && (
        <div className="absolute left-1/2 top-0 z-50 flex -translate-x-1/2 items-center space-x-2 rounded-lg bg-[#3B8F72] px-4 py-2 text-white shadow-lg animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center text-2xl font-bold text-[#1F1C1F]">
            <Library className="mr-2 h-6 w-6 text-rose-600" />
            题库管理
          </h1>
          <p className="mt-1 text-sm text-[#766F73]">统一管理通过生成、录入和 AI 派生的考核试题</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="h-8 border-[#E8CCA0] bg-[#FFF7EA] px-3 text-[#8B621F]">
            待审核 {pendingCount}
          </Badge>
          <Button variant="outline" onClick={() => setShowDuplicates(true)} className="font-bold border-[#E8CCA0] bg-[#FFF7EA] text-[#8B621F] hover:bg-[#F7E6C8]">
            <Replace className="h-4 w-4" />
            排查重复题目
          </Button>
          <Button onClick={openCreatePanel} className="bg-rose-600 text-white hover:bg-rose-700">
            <Plus className="h-4 w-4" />
            新增题目
          </Button>
        </div>
      </div>

      {variantGeneration && (
        <div className="shrink-0 rounded-xl border border-[#E8CCA0] bg-[#FFF7EA] px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#B9822B] ring-1 ring-[#E8CCA0]">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#242124]">AI 正在生成变体题</div>
                <p className="mt-0.5 text-xs leading-relaxed text-[#8B621F]">
                  基于 {variantGeneration.sourceCount} 道旧题生成约 {variantGeneration.targetCount} 道待审核题，完成后会自动筛选到“待审核”。
                </p>
                <p className="mt-1 text-xs text-[#766F73]">{variantGeneration.step}</p>
              </div>
            </div>
            <div className="w-full shrink-0 md:w-72">
              <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-[#8B621F]">
                <span>生成进度</span>
                <span>{variantGeneration.progress}%</span>
              </div>
              <Progress value={variantGeneration.progress} className="h-2 bg-[#F7E6C8]" indicatorClassName="bg-[#B9822B]" />
            </div>
          </div>
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col rounded-xl border border-[#E5DED8] bg-white">
          <div className="border-b border-[#E9E4DF] p-4">
            <div className="flex items-center text-sm font-bold text-[#242124]">
              <FolderTree className="mr-2 h-4 w-4 text-rose-600" />
              筛选树
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <button
                onClick={clearTreeDraft}
                className={`mb-3 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-bold transition-colors ${isAllTreeActive ? 'bg-rose-50 text-rose-700' : 'text-[#3F3A3D] hover:bg-[#F8F5F3]'}`}
              >
                <span>全部题目</span>
                <span className="text-xs text-[#9A9396]">{questions.filter(question => question.status !== 'archived').length}</span>
              </button>

              <div className="space-y-2">
                {filterTreeSections.map(section => {
                  const collapsed = collapsedTreeSections[section.id];
                  const checkedCount = section.items.filter(item => item.checked).length;
                  return (
                    <div key={section.id}>
                      <button
                        type="button"
                        onClick={() => toggleTreeSection(section.id)}
                        aria-expanded={!collapsed}
                        className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[11px] font-bold text-[#766F73] transition-colors hover:bg-[#F8F5F3] hover:text-[#3F3A3D]"
                      >
                        {collapsed ? <ChevronRight className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
                        <span className="min-w-0 flex-1 truncate">{section.title}</span>
                        {checkedCount > 0 && (
                          <span data-i18n-skip="true" className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] text-rose-700">
                            {checkedCount}
                          </span>
                        )}
                      </button>
                      {!collapsed && (
                        <div className="space-y-1 border-l border-[#E9E4DF] pl-2">
                          {section.items.map(item => (
                            <label
                              key={item.id}
                              className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${item.checked ? 'bg-rose-50 font-bold text-rose-700' : 'text-[#766F73] hover:bg-[#F8F5F3]'}`}
                            >
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={item.onToggle}
                                className="h-3.5 w-3.5 shrink-0 rounded border-[#D6CEC8] text-rose-600 focus:ring-rose-500"
                              />
                              <span data-i18n-skip={item.skipI18n ? 'true' : undefined} className="min-w-0 flex-1 truncate">{item.name}</span>
                              <span className="shrink-0 text-[#9A9396]">{item.count}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)] gap-2 border-t border-[#E9E4DF] bg-white p-3 shadow-[0_-6px_14px_rgba(31,28,31,0.04)]">
              <Button onClick={clearTreeDraft} variant="outline" size="sm" className="h-8 px-3 text-xs">
                清空
              </Button>
              <Button onClick={applyTreeFilters} disabled={!treeDraftHasChanges} size="sm" className="h-8 bg-rose-600 px-3 text-xs text-white hover:bg-rose-700 disabled:bg-[#D6CEC8]">
                确定
              </Button>
            </div>
          </div>
          <div className="border-t border-[#E9E4DF] p-4">
            <div className="relative mb-2 flex items-center justify-between gap-2 group/tag-rule-note">
              <div className="flex min-w-0 items-center text-sm font-bold text-[#242124]">
                <Tags className="mr-2 h-4 w-4 text-rose-600" />
                常用标签
              </div>
              <Button onClick={openTagManageDialog} variant="outline" size="sm" className="h-7 px-2 text-xs">
                <Edit className="h-3.5 w-3.5" />
                标签管理
              </Button>
              <button
                type="button"
                aria-describedby="tag-ai-rule-note"
                className="absolute -right-1.5 -top-2 z-20 h-4 min-w-4 rounded-full bg-blue-950 px-1 text-center text-[9px] font-bold leading-4 text-white shadow-sm outline-none ring-blue-300 transition-colors hover:bg-blue-900 focus:ring-2"
              >
                注
              </button>
              <div
                id="tag-ai-rule-note"
                data-i18n-skip="true"
                role="tooltip"
                className="absolute right-0 bottom-full z-[100] mb-2 hidden w-[380px] max-w-[min(380px,calc(100vw-2rem))] rounded-lg bg-blue-950/95 px-4 py-3 text-xs leading-relaxed text-white shadow-xl backdrop-blur-sm group-hover/tag-rule-note:block group-focus-within/tag-rule-note:block"
              >
                AI 生成题目时自动匹配标签，优先从现有常用标签里选。如果 AI 认为需要新标签，比如“沟通开场”，先在生成预览或待审核题中显示；培训师审核入库时同步加入常用标签库。同名标签自动去重；一道题默认最多贴 5 个标签。培训师在这里删除标签时，只会从题目上解除关联，不删除题目。
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {sidebarTags.map(tag => (
                <button
                  key={tag.id}
                  data-i18n-skip="true"
                  onClick={() => updateFilters({ tagId: filters.tagId === tag.id ? 'all' : tag.id })}
                  className={`rounded-full border px-2 py-1 text-[10px] font-bold transition-colors ${filters.tagId === tag.id ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-[#E5DED8] bg-[#F8F5F3] text-[#5D565A] hover:border-rose-200'}`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            {tags.length > sidebarTags.length && (
              <div className="mt-2 text-[10px] text-[#9A9396]">
                共 {tags.length} 个标签，仅展示高频前 {sidebarTags.length} 个
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#E5DED8] bg-white">
          <div className="shrink-0 border-b border-[#E9E4DF] p-4">
            <div className="grid gap-3 xl:grid-cols-[minmax(220px,1fr)_160px_160px_160px_160px]">
              <div className="relative min-w-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9396]" />
                <input
                  type="text"
                  placeholder="搜索题目、标签、题目分类、产品或来源..."
                  value={filters.keyword}
                  onChange={event => updateFilters({ keyword: event.target.value })}
                  className="h-9 w-full rounded-lg border border-[#E5DED8] bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
              <select value={filters.type} onChange={event => updateFilters({ type: event.target.value as QuestionFilters['type'] })} className="h-9 rounded-lg border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20">
                <option value="all">全部题型</option>
                {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <select value={filters.productId} onChange={event => updateFilters({ productId: event.target.value })} disabled={!filterLineHasProducts} className="h-9 rounded-lg border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 disabled:bg-[#F8F5F3] disabled:text-[#9A9396]">
                <option value="all">{filterLineHasProducts ? '全部产品' : '无需关联产品'}</option>
                {productsForFilter.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
              <select value={filters.difficulty} onChange={event => updateFilters({ difficulty: event.target.value as QuestionFilters['difficulty'] })} className="h-9 rounded-lg border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20">
                <option value="all">全部难度</option>
                {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <div className="relative group/status-flow-note">
                <select value={filters.status} onChange={event => updateFilters({ status: event.target.value as QuestionFilters['status'] })} className="h-9 w-full rounded-lg border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20">
                  <option value="all">全部状态</option>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <button
                  type="button"
                  aria-describedby="question-status-flow-note"
                  className="absolute -right-1.5 -top-2 z-20 h-4 min-w-4 rounded-full bg-blue-950 px-1 text-center text-[9px] font-bold leading-4 text-white shadow-sm outline-none ring-blue-300 transition-colors hover:bg-blue-900 focus:ring-2"
                >
                  注
                </button>
                <div
                  id="question-status-flow-note"
                  data-i18n-skip="true"
                  role="tooltip"
                  className="absolute right-0 top-full z-[100] mt-2 hidden w-[420px] max-w-[min(420px,calc(100vw-2rem))] rounded-lg bg-blue-950/95 px-4 py-3 text-xs leading-relaxed text-white shadow-xl backdrop-blur-sm group-hover/status-flow-note:block group-focus-within/status-flow-note:block"
                >
                  <p className="font-bold">手动录入题</p>
                  <p>草稿 -&gt; 已入库 -&gt; 已归档</p>
                  <p className="mt-1 text-white/85">
                    用户点“新增题目”后，默认是 草稿。草稿代表培训师还在编辑，不应该进入考试组卷或附加题。编辑完成后点右下角“审核入库”，状态变成 已入库，之后才会出现在“考试组卷”和“课件附加题”的候选题里。历史不用的题可以批量归档，变成 已归档。
                  </p>
                  <p className="mt-3 font-bold">AI 生成/旧题派生题</p>
                  <p>待审核 -&gt; 已入库 -&gt; 已归档</p>
                  <p className="mt-1 text-white/85">
                    从题库里点“AI 生成变体题”后，新题直接进入 待审核。待审核表示：AI 已经生成初稿，但培训师必须检查题干、答案、标签、分类、难度。用户可以在题库筛选“待审核”，打开题目编辑抽屉修改，然后点“审核入库”。
                  </p>
                </div>
              </div>
            </div>

            {selectedIds.size > 0 && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm">
                <div className="font-bold text-rose-700">已选择 {selectedIds.size} 项</div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={() => setTagDialog(true)} variant="outline" size="sm" className="h-8 bg-white text-rose-600 border-rose-200">
                    <Edit className="h-4 w-4" />
                    批量编辑标签
                  </Button>
                  <Button onClick={() => handleGenerateVariants(Array.from(selectedIds))} disabled={!!variantGeneration} variant="outline" size="sm" className={`h-8 bg-white ${aiActionTone.buttonClass}`}>
                    {variantGeneration ? <Loader2 className={`h-4 w-4 animate-spin ${aiActionTone.iconClass}`} /> : <Wand2 className={`h-4 w-4 ${aiActionTone.iconClass}`} />}
                    {variantGeneration ? '生成中' : 'AI 生成变体题'}
                  </Button>
                  <Button onClick={handleBatchArchive} variant="outline" size="sm" className="h-8 bg-white text-[#8B621F] border-[#E8CCA0] hover:bg-[#FFF7EA]">
                    <Archive className="h-4 w-4" />
                    批量归档
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="mb-2 flex items-center justify-between border-b border-[#E5DED8] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#766F73]">
              <div className="flex min-w-0 flex-1 items-center gap-3 pr-4">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                />
                <span className="w-20 shrink-0">题型</span>
                <span className="min-w-0 flex-1">题干</span>
                <span className="hidden w-28 shrink-0 lg:block">分类/产品</span>
                <span className="hidden w-36 shrink-0 xl:block">标签</span>
                <span className="hidden w-28 shrink-0 md:block">状态</span>
                <span className="hidden w-40 shrink-0 2xl:block">来源文件</span>
              </div>
              <span className="w-32 shrink-0 text-right">操作</span>
            </div>

            <div className="space-y-2">
              {filteredQuestions.map(question => {
                const product = findProduct(question.productLineId, question.productId);
                const line = findProductLine(question.productLineId);
                const questionTags = getQuestionTagNames(question, tags);
                const isGeneralCapability = question.productLineId === GENERAL_CAPABILITY_LINE_ID;
                const categoryName = line?.name || '未分类';
                const productName = product?.name || '未关联产品';
                const categoryProductLabel = isGeneralCapability ? categoryName : `${categoryName} / ${productName}`;
                const productColumnName = isGeneralCapability ? '通用能力' : product?.name || '未关联产品';

                return (
                  <div key={question.id} className="group flex items-center justify-between rounded-lg border border-[#E9E4DF] bg-white p-3 shadow-sm transition-colors hover:border-[#E5DED8] hover:bg-[#F8F5F3]">
                    <div className="flex min-w-0 flex-1 items-center gap-3 pr-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                        checked={selectedIds.has(question.id)}
                        onChange={() => toggleSelect(question.id)}
                      />
                      <div className="w-20 shrink-0">
                        <Badge variant="outline" className={`whitespace-normal text-center text-[10px] font-bold leading-tight ${typeToneClass[question.type]}`}>
                          {QUESTION_TYPE_LABELS[question.type]}
                        </Badge>
                      </div>
                      <button onClick={() => openEditPanel(question)} className="group/stem-tooltip relative min-w-0 flex-1 text-left">
                        <div data-i18n-skip="true" title={question.stem} className="truncate text-sm font-bold text-[#242124] group-hover:text-rose-700">
                          {question.stem}
                        </div>
                        <div
                          data-i18n-skip="true"
                          role="tooltip"
                          className="pointer-events-none absolute left-0 top-full z-[90] mt-2 hidden w-[520px] max-w-[min(520px,calc(100vw-2rem))] rounded-lg border border-[#E5DED8] bg-white px-3 py-2 text-xs font-medium leading-relaxed text-[#242124] shadow-xl group-hover/stem-tooltip:block group-focus/stem-tooltip:block"
                        >
                          {question.stem}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-[#766F73]">
                          <span data-i18n-skip="true">{categoryProductLabel}</span>
                          <span>{DIFFICULTY_LABELS[question.difficulty]}</span>
                          {question.generatedFromQuestionId && <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-bold text-indigo-700">AI 派生</span>}
                        </div>
                      </button>
                      <div data-i18n-skip="true" className="hidden w-28 shrink-0 truncate text-xs text-[#5D565A] lg:block" title={productColumnName}>
                        {productColumnName}
                      </div>
                      <div className="hidden w-36 shrink-0 flex-wrap gap-1 xl:flex">
                        {questionTags.slice(0, 3).map(tag => (
                          <Badge key={tag} data-i18n-skip="true" variant="secondary" className="max-w-full truncate bg-slate-100 text-[10px] font-normal text-[#5D565A]">
                            {tag}
                          </Badge>
                        ))}
                        {questionTags.length > 3 && <span className="text-[10px] text-[#9A9396]">+{questionTags.length - 3}</span>}
                      </div>
                      <div className="hidden w-28 shrink-0 md:block">
                        <Badge variant="outline" className={`text-[10px] font-bold ${statusBadgeClass[question.status]}`}>
                          {STATUS_LABELS[question.status]}
                        </Badge>
                      </div>
                      <div className="hidden w-40 shrink-0 items-center truncate text-xs text-[#766F73] 2xl:flex" title={question.sourceFile}>
                        <FileText className="mr-1 h-3 w-3 shrink-0" />
                        <span data-i18n-skip="true" className="truncate">{question.sourceFile || '-'}</span>
                      </div>
                    </div>

                    <div className="flex w-32 shrink-0 items-center justify-end gap-1">
                      {question.status === 'pending_review' && (
                        <Button onClick={() => updateQuestion({ ...question, status: 'active' })} variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#3B8F72] hover:bg-[#EEF8F4]" title="审核入库">
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button onClick={() => handleGenerateVariants([question.id])} disabled={!!variantGeneration} variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#8B621F] hover:bg-[#FFF7EA]" title="AI 生成变体题">
                        {variantGeneration ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      </Button>
                      <Button onClick={() => openEditPanel(question)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50" title="编辑">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => removeQuestion(question.id)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50" title="删除">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {filteredQuestions.length === 0 && (
                <div className="py-16 text-center text-[#9A9396]">
                  <Database className="mx-auto mb-4 h-12 w-12 opacity-20" />
                  <p>暂无符合条件的题目</p>
                  <p className="mt-1 text-xs">请尝试其他关键词、题目分类或标签</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {editingQuestion && (
        <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-2xl flex-col border-l border-[#E5DED8] bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#E9E4DF] px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-[#242124]">{editingMode === 'create' ? '新增题目' : '编辑题目'}</h2>
              <p className="text-xs text-[#766F73]">修改题干、题型、答案、题目分类和标签后保存</p>
            </div>
            <button onClick={closeEditPanel} className="rounded-lg p-2 text-[#766F73] hover:bg-[#F8F5F3]">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-5">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-bold text-[#3F3A3D]">题型</span>
                  <select value={editingQuestion.type} onChange={event => handleTypeChange(event.target.value as QuestionType)} className="h-9 w-full rounded-lg border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20">
                    {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-bold text-[#3F3A3D]">状态</span>
                  <select value={editingQuestion.status} onChange={event => setEditingField('status', event.target.value as QuestionStatus)} className="h-9 w-full rounded-lg border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20">
                    {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-bold text-[#3F3A3D]">题目分类</span>
                  <select value={editingQuestion.productLineId || ''} onChange={event => handleProductLineChange(event.target.value)} className="h-9 w-full rounded-lg border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20">
                    {QUESTION_TAXONOMY.productLines.map(line => <option key={line.id} value={line.id}>{line.name}</option>)}
                  </select>
                </label>
                {editingUsesTagSubclassification ? (
                  <div className="block">
                    <span className="mb-1 block text-sm font-bold text-[#3F3A3D]">产品</span>
                    <div className="min-h-9 rounded-lg border border-dashed border-[#E5DED8] bg-[#F8F5F3] px-3 py-2 text-sm">
                      <div className="font-bold text-[#5D565A]">无需关联产品</div>
                      <p className="mt-1 text-xs leading-relaxed text-[#766F73]">通用能力题无需关联产品，培训师可通过标签继续细分。</p>
                    </div>
                  </div>
                ) : (
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold text-[#3F3A3D]">产品</span>
                    <select value={editingQuestion.productId || ''} onChange={event => setEditingField('productId', event.target.value)} className="h-9 w-full rounded-lg border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20">
                      {editingProducts.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
                    </select>
                  </label>
                )}
                <label className="block">
                  <span className="mb-1 block text-sm font-bold text-[#3F3A3D]">难度</span>
                  <select value={editingQuestion.difficulty} onChange={event => setEditingField('difficulty', event.target.value as QuestionDifficulty)} className="h-9 w-full rounded-lg border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20">
                    {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-bold text-[#3F3A3D]">来源文件</span>
                  <input value={editingQuestion.sourceFile || ''} onChange={event => setEditingField('sourceFile', event.target.value)} className="h-9 w-full rounded-lg border border-[#E5DED8] px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20" />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-bold text-[#3F3A3D]">题干</span>
                <textarea
                  data-i18n-skip="true"
                  value={editingQuestion.stem}
                  onChange={event => setEditingField('stem', event.target.value)}
                  className="min-h-24 w-full resize-none rounded-lg border border-[#E5DED8] px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-rose-500/20"
                  placeholder="请输入题干..."
                />
              </label>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-[#3F3A3D]">题目素材</span>
                  <div className="flex gap-2">
                    <label className="inline-flex h-7 cursor-pointer items-center justify-center rounded-md border border-[#E5DED8] bg-white px-3 text-xs font-bold text-[#3F3A3D] shadow-sm transition-colors hover:bg-[#F8F5F3]">
                      添加图片
                      <input type="file" accept="image/*" className="hidden" onChange={event => handleAttachmentUpload('image', event)} />
                    </label>
                    <label className="inline-flex h-7 cursor-pointer items-center justify-center rounded-md border border-[#E5DED8] bg-white px-3 text-xs font-bold text-[#3F3A3D] shadow-sm transition-colors hover:bg-[#F8F5F3]">
                      添加视频
                      <input type="file" accept="video/*" className="hidden" onChange={event => handleAttachmentUpload('video', event)} />
                    </label>
                  </div>
                </div>
                <div className="space-y-2 rounded-lg border border-[#E9E4DF] bg-[#F8F5F3] p-2">
                  {(editingQuestion.attachments || []).length === 0 ? (
                    <div className="px-2 py-1 text-xs text-[#9A9396]">暂无图片或视频素材</div>
                  ) : (
                    editingQuestion.attachments?.map(attachment => (
                      <div key={attachment.id} className="grid gap-2 rounded-md bg-white p-2 md:grid-cols-[72px_minmax(0,1fr)_minmax(0,1.4fr)_28px] md:items-center">
                        <Badge variant="outline" className="w-fit text-[10px]">{attachment.type === 'image' ? '图片' : '视频'}</Badge>
                        <input
                          data-i18n-skip="true"
                          value={attachment.name}
                          onChange={event => updateAttachment(attachment.id, { name: event.target.value })}
                          className="h-8 min-w-0 rounded-md border border-[#E5DED8] px-2 text-xs outline-none focus:ring-2 focus:ring-rose-500/20"
                          placeholder="素材名称"
                        />
                        <input
                          data-i18n-skip="true"
                          value={attachment.url}
                          onChange={event => updateAttachment(attachment.id, { url: event.target.value })}
                          className="h-8 min-w-0 rounded-md border border-[#E5DED8] px-2 text-xs outline-none focus:ring-2 focus:ring-rose-500/20"
                          placeholder="素材链接"
                        />
                        <button onClick={() => removeAttachment(attachment.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-[#9A9396] hover:bg-red-50 hover:text-red-500" title="移除素材">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {editingQuestion.type === 'short_answer' ? (
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold text-[#3F3A3D]">参考答案</span>
                    <textarea data-i18n-skip="true" value={editingQuestion.referenceAnswer || ''} onChange={event => setEditingField('referenceAnswer', event.target.value)} className="min-h-24 w-full resize-none rounded-lg border border-[#E5DED8] px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-rose-500/20" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold text-[#3F3A3D]">评分要点</span>
                    <textarea data-i18n-skip="true" value={editingQuestion.scoringRubric || ''} onChange={event => setEditingField('scoringRubric', event.target.value)} className="min-h-20 w-full resize-none rounded-lg border border-[#E5DED8] px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-rose-500/20" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold text-[#3F3A3D]">AI 阅卷提示 (选填)</span>
                    <textarea data-i18n-skip="true" value={editingQuestion.aiGradingHint || ''} onChange={event => setEditingField('aiGradingHint', event.target.value)} className="min-h-16 w-full resize-none rounded-lg border border-[#E5DED8] px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-rose-500/20" />
                  </label>
                </div>
              ) : editingQuestion.type === 'file_upload' ? (
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold text-[#3F3A3D]">上传说明</span>
                    <textarea data-i18n-skip="true" value={editingQuestion.uploadInstructions || ''} onChange={event => setEditingField('uploadInstructions', event.target.value)} className="min-h-20 w-full resize-none rounded-lg border border-[#E5DED8] px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-rose-500/20" />
                  </label>
                  <div>
                    <span className="mb-2 block text-sm font-bold text-[#3F3A3D]">允许上传类型</span>
                    <div className="flex gap-3">
                      {(['image', 'video'] as QuestionMediaType[]).map(type => (
                        <label key={type} className="flex items-center gap-2 rounded-lg border border-[#E5DED8] bg-[#F8F5F3] px-3 py-2 text-sm font-bold text-[#5D565A]">
                          <input
                            type="checkbox"
                            checked={editingQuestion.allowedUploadTypes?.includes(type) || false}
                            onChange={() => toggleAllowedUploadType(type)}
                            className="h-4 w-4 text-rose-600 focus:ring-rose-500"
                          />
                          {type === 'image' ? '图片' : '视频'}
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold text-[#3F3A3D]">评分要点</span>
                    <textarea data-i18n-skip="true" value={editingQuestion.scoringRubric || ''} onChange={event => setEditingField('scoringRubric', event.target.value)} className="min-h-20 w-full resize-none rounded-lg border border-[#E5DED8] px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-rose-500/20" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold text-[#3F3A3D]">AI 阅卷提示 (选填)</span>
                    <textarea data-i18n-skip="true" value={editingQuestion.aiGradingHint || ''} onChange={event => setEditingField('aiGradingHint', event.target.value)} className="min-h-16 w-full resize-none rounded-lg border border-[#E5DED8] px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-rose-500/20" />
                  </label>
                </div>
              ) : editingQuestion.type === 'checkbox_grid' ? (
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-[#3F3A3D]">网格行</span>
                        <Button onClick={() => addGridItem('gridRows')} variant="outline" size="sm" className="h-7 text-xs">
                          <Plus className="h-3.5 w-3.5" />
                          加行
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {editingQuestion.gridRows?.map(row => (
                          <div key={row.id} className="flex items-center gap-2 rounded-lg border border-[#E9E4DF] bg-[#F8F5F3] p-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-xs font-bold text-[#766F73]">{row.label}</span>
                            <input data-i18n-skip="true" value={row.text} onChange={event => updateGridItem('gridRows', row.id, event.target.value)} className="h-8 min-w-0 flex-1 rounded-md border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-[#3F3A3D]">网格列</span>
                        <Button onClick={() => addGridItem('gridColumns')} variant="outline" size="sm" className="h-7 text-xs">
                          <Plus className="h-3.5 w-3.5" />
                          加列
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {editingQuestion.gridColumns?.map(column => (
                          <div key={column.id} className="flex items-center gap-2 rounded-lg border border-[#E9E4DF] bg-[#F8F5F3] p-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-xs font-bold text-[#766F73]">{column.label}</span>
                            <input data-i18n-skip="true" value={column.text} onChange={event => updateGridItem('gridColumns', column.id, event.target.value)} className="h-8 min-w-0 flex-1 rounded-md border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-[#E9E4DF]">
                    <table className="min-w-full text-xs">
                      <thead className="bg-[#F8F5F3]">
                        <tr>
                          <th className="w-28 px-3 py-2 text-left text-[#766F73]">匹配项</th>
                          {editingQuestion.gridColumns?.map(column => <th key={column.id} data-i18n-skip="true" className="px-3 py-2 text-center text-[#766F73]">{column.text || column.label}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E9E4DF] bg-white">
                        {editingQuestion.gridRows?.map(row => (
                          <tr key={row.id}>
                            <td data-i18n-skip="true" className="px-3 py-2 font-bold text-[#3F3A3D]">{row.text || row.label}</td>
                            {editingQuestion.gridColumns?.map(column => {
                              const checked = editingQuestion.gridCorrectAnswers?.some(answer => answer.rowId === row.id && answer.columnId === column.id) || false;
                              return (
                                <td key={column.id} className="px-3 py-2 text-center">
                                  <input type="checkbox" checked={checked} onChange={() => toggleGridAnswer(row.id, column.id)} className="h-4 w-4 text-rose-600 focus:ring-rose-500" />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : editingQuestion.type === 'ordering' ? (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#3F3A3D]">排序步骤与正确顺序</span>
                    <Button onClick={addOption} variant="outline" size="sm" className="h-7 text-xs">
                      <Plus className="h-3.5 w-3.5" />
                      增加步骤
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {editingQuestion.options?.map(option => {
                      const order = editingQuestion.correctOptionIds || editingQuestion.options?.map(item => item.id) || [];
                      const position = Math.max(0, order.indexOf(option.id));
                      return (
                        <div key={option.id} className="grid grid-cols-[72px_1fr] items-center gap-2 rounded-lg border border-[#E9E4DF] bg-[#F8F5F3] p-2">
                          <select value={position} onChange={event => setOrderingPosition(option.id, Number(event.target.value))} className="h-8 rounded-md border border-[#E5DED8] bg-white px-2 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500/20">
                            {editingQuestion.options?.map((_, index) => <option key={index} value={index}>第 {index + 1}</option>)}
                          </select>
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-xs font-bold text-[#766F73]">{option.label}</span>
                            <input data-i18n-skip="true" value={option.text} onChange={event => updateOption(option.id, event.target.value)} className="h-8 min-w-0 flex-1 rounded-md border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#3F3A3D]">{editingQuestion.type === 'dropdown' ? '下拉选项与答案' : '选项与答案'}</span>
                    {editingQuestion.type !== 'true_false' && (
                      <Button onClick={addOption} variant="outline" size="sm" className="h-7 text-xs">
                        <Plus className="h-3.5 w-3.5" />
                        增加选项
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {editingQuestion.options?.map(option => (
                      <div key={option.id} className="grid grid-cols-[32px_1fr] items-center gap-2 rounded-lg border border-[#E9E4DF] bg-[#F8F5F3] p-2">
                        <label className="flex h-8 items-center justify-center">
                          <input
                            type={editingQuestion.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                            checked={editingQuestion.correctOptionIds?.includes(option.id) || false}
                            onChange={() => toggleCorrectOption(option.id)}
                            className="h-4 w-4 text-rose-600 focus:ring-rose-500"
                          />
                        </label>
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-xs font-bold text-[#766F73]">{option.label}</span>
                          <input
                            data-i18n-skip="true"
                            value={option.text}
                            disabled={editingQuestion.type === 'true_false'}
                            onChange={event => updateOption(option.id, event.target.value)}
                            className="h-8 min-w-0 flex-1 rounded-md border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 disabled:bg-[#F1ECE8]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="block text-sm font-bold text-[#3F3A3D]">常用标签</span>
                  <span className="text-xs text-[#766F73]">AI 已自动匹配标签，可删除或补充；每题最多 {MAX_TAGS_PER_QUESTION} 个。</span>
                </div>
                <div className="mb-3 flex min-h-8 flex-wrap gap-2 rounded-lg border border-[#E9E4DF] bg-[#F8F5F3] p-2">
                  {getQuestionTagNames(editingQuestion, tags).map(tag => (
                    <span key={tag} data-i18n-skip="true" className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-bold text-[#5D565A] ring-1 ring-[#E5DED8]">
                      {tag}
                      <button onClick={() => removeCustomTag(tag)} className="text-[#9A9396] hover:text-red-500" title="移除标签">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {getQuestionTagNames(editingQuestion, tags).length === 0 && (
                    <span className="px-1 py-1 text-xs text-[#9A9396]">暂无标签</span>
                  )}
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {tags.map(tag => {
                    const selected = editingQuestion.tagIds.includes(tag.id)
                      || editingQuestion.customTags.some(name => getTagNameKey(name) === getTagNameKey(tag.name));
                    return (
                      <button
                        key={tag.id}
                        data-i18n-skip="true"
                        onClick={() => toggleTag(tag.id)}
                        className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${selected ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-[#E5DED8] bg-white text-[#5D565A] hover:border-rose-200'}`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input value={customTagInput} onChange={event => setCustomTagInput(event.target.value)} onKeyDown={event => event.key === 'Enter' && addCustomTag()} placeholder="输入标签并按回车添加..." className="h-9 min-w-0 flex-1 rounded-lg border border-[#E5DED8] px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20" />
                  <Button onClick={addCustomTag} variant="outline" className="h-9">添加为本题标签</Button>
                </div>
              </div>

              {editingQuestion.generatedFromQuestionId && (
                <div className="rounded-lg border border-[#E8CCA0] bg-[#FFF7EA] p-3 text-xs leading-relaxed text-[#8B621F]">
                  这是一道 AI 派生题，来源题 ID：<span data-i18n-skip="true" className="font-bold">{editingQuestion.generatedFromQuestionId}</span>。请确认题干、答案和标签后再审核入库。
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-[#E9E4DF] px-5 py-4">
            <div className="text-xs text-[#766F73]">当前答案：<span data-i18n-skip="true" className="font-bold text-[#3B8F72]">{getQuestionAnswerText(editingQuestion)}</span></div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={closeEditPanel}>取消</Button>
              <Button variant="outline" onClick={saveEditingQuestion}>
                <Save className="h-4 w-4" />
                保存
              </Button>
              <Button onClick={approveEditingQuestion} className="bg-[#3B8F72] text-white hover:bg-[#2F735C]">
                <Check className="h-4 w-4" />
                审核入库
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showDuplicates} onOpenChange={setShowDuplicates}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Replace className="mr-2 h-5 w-5 text-[#B9822B]" />
              发现高度相似的题目
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {duplicates.map(dup => {
              const q1 = questions.find(question => question.id === dup.similarToId);
              const q2 = questions.find(question => question.id === dup.targetId);
              if (!q1 || !q2) return null;

              return (
                <div key={dup.targetId} className="space-y-4 rounded-xl border border-[#E5DED8] bg-[#F8F5F3] p-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-bold text-[#3F3A3D]">相似度检测</span>
                    <Badge className="border-none bg-[#F7E6C8] font-bold text-[#8B621F] hover:bg-[#F7E6C8]">{dup.matchPercent}% 相似</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[q1, q2].map((question, index) => (
                      <div key={question.id} className="rounded-xl border border-[#E5DED8] bg-white p-4">
                        <Badge variant="outline" className="mb-2">{index === 0 ? '已有试题' : '新试题'} (ID: {question.id})</Badge>
                        <p data-i18n-skip="true" className="mb-3 text-sm font-bold text-[#242124]">{question.stem}</p>
                        {question.options && (
                          <ul className="mb-3 space-y-1 text-xs text-[#766F73]">
                            {question.options.map(option => <li key={option.id} data-i18n-skip="true">{option.label}. {option.text}</li>)}
                          </ul>
                        )}
                        <p className="mb-4 text-xs font-medium text-[#3B8F72]">答案: <span data-i18n-skip="true">{getQuestionAnswerText(question)}</span></p>
                        <Button
                          onClick={() => index === 0 ? handleResolveDuplicate(q1.id, q2.id) : handleResolveDuplicate(q2.id, q1.id)}
                          variant="outline"
                          size="sm"
                          className="w-full border-rose-200 text-rose-700 hover:bg-rose-50"
                        >
                          {index === 0 ? '保留此题并移除右侧' : '保留此题并移除左侧'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {duplicates.length === 0 && <div className="py-8 text-center text-[#766F73]">目前没有发现重复或雷同题目。</div>}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={tagDialog} onOpenChange={setTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批量编辑标签</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-[#E9E4DF] bg-[#F8F5F3] p-3">
              <p className="text-sm font-medium text-[#3F3A3D]">将为选中的 {selectedQuestions.length} 道题目应用标签</p>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-[#3F3A3D]">添加标签 (以逗号或空格分隔)</label>
                <Button onClick={() => setBatchTags('Lumina新品, 成分解析, 销售话术')} variant="ghost" size="sm" className={`h-6 ${aiActionTone.ghostButtonClass}`}>
                  <Wand2 className={`mr-1 h-3 w-3 ${aiActionTone.iconClass}`} />
                  AI 自动推荐
                </Button>
              </div>
              <textarea
                value={batchTags}
                onChange={event => setBatchTags(event.target.value)}
                className="min-h-[80px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-rose-500"
                placeholder="例如: 基础知识, 新品, Lumina"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagDialog(false)}>取消</Button>
            <Button className="bg-rose-600 text-white hover:bg-rose-700" onClick={saveBatchTags}>应用标签</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tagManageDialog} onOpenChange={setTagManageDialog}>
        <DialogContent className="flex h-[86vh] flex-col gap-0 overflow-hidden bg-[#FCFAF8] p-0 sm:max-w-[1120px]">
          <div className="shrink-0 border-b border-[#E9E4DF] bg-white px-5 py-4 pr-14">
            <DialogTitle className="flex items-center">
              <Tags className="mr-2 h-5 w-5 text-rose-600" />
              标签管理
            </DialogTitle>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#766F73]">
              <span>全部 <span data-i18n-skip="true">{tags.length}</span> 个标签</span>
            </div>
          </div>

          <div className="shrink-0 border-b border-[#E9E4DF] bg-[#F8F5F3] px-5 py-3">
            <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_180px_minmax(240px,360px)_92px]">
              <div className="relative min-w-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9396]" />
                <input
                  value={tagSearch}
                  onChange={event => {
                    setTagSearch(event.target.value);
                    setTagPage(1);
                  }}
                  placeholder="搜索标签名称"
                  className="h-9 w-full rounded-lg border border-[#E5DED8] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
              <select
                value={tagSort}
                onChange={event => {
                  setTagSort(event.target.value as TagSortMode);
                  setTagPage(1);
                }}
                className="h-9 rounded-lg border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="usage_desc">使用量从高到低</option>
                <option value="usage_asc">使用量从低到高</option>
                <option value="name_asc">按名称排序</option>
                <option value="unused_first">未使用优先</option>
              </select>
              <input
                value={newTagName}
                onChange={event => setNewTagName(event.target.value)}
                onKeyDown={event => event.key === 'Enter' && handleAddCommonTag()}
                placeholder="输入新标签"
                className="h-9 min-w-0 rounded-lg border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              <Button onClick={handleAddCommonTag} className="h-9 bg-rose-600 text-white hover:bg-rose-700">
                <Plus className="h-4 w-4" />
                新增
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 px-5 py-3">
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-[#E9E4DF] bg-white">
              <div className="hidden shrink-0 grid-cols-[minmax(0,1fr)_96px_92px] gap-3 border-b border-[#E9E4DF] bg-[#F8F5F3] px-3 py-2 text-xs font-bold text-[#766F73] md:grid">
                <span>标签名称</span>
                <span className="text-center">引用题数</span>
                <span className="text-center">操作</span>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {visibleTagRows.map(({ tag, usage }) => (
                  <div
                    key={tag.id}
                    className="grid gap-2 border-b border-[#F1ECE8] px-3 py-1.5 last:border-b-0 md:min-h-10 md:grid-cols-[minmax(0,1fr)_96px_92px] md:items-center md:gap-3"
                  >
                    <input
                      data-i18n-skip="true"
                      value={tagDraftNames[tag.id] ?? tag.name}
                      onChange={event => setTagDraftNames(prev => ({ ...prev, [tag.id]: event.target.value }))}
                      className="h-7 min-w-0 rounded-md border border-transparent bg-transparent px-2 text-sm outline-none hover:border-[#E5DED8] hover:bg-[#FCFAF8] focus:border-[#E5DED8] focus:bg-white focus:ring-2 focus:ring-rose-500/20"
                    />
                    <div className="text-xs tabular-nums text-[#766F73] md:text-center">
                      {usage}
                    </div>
                    <div className="flex items-center gap-1 md:justify-center">
                      <Button
                        onClick={() => handleRenameCommonTag(tag.id)}
                        variant="outline"
                        size="icon-sm"
                        title="保存改名"
                        aria-label={`保存 ${tag.name} 的新名称`}
                        className="border-[#E5DED8] text-[#5D565A] hover:bg-[#F8F5F3]"
                      >
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteCommonTag(tag.id)}
                        variant="outline"
                        size="icon-sm"
                        title="删除标签"
                        aria-label={`删除 ${tag.name}`}
                        className="border-red-100 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                {tagRows.length === 0 && (
                  <div className="flex h-full min-h-[240px] items-center justify-center text-sm text-[#9A9396]">
                    暂无符合条件的标签
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t border-[#E9E4DF] bg-white px-5 py-3 sm:items-center sm:justify-between">
            <span className="text-xs text-[#766F73]">
              显示 <span data-i18n-skip="true">{tagRows.length === 0 ? 0 : tagPageStart + 1}-{Math.min(tagPageStart + TAG_MANAGE_PAGE_SIZE, tagRows.length)}</span> / <span data-i18n-skip="true">{tagRows.length}</span>
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                disabled={currentTagPage <= 1}
                onClick={() => setTagPage(page => Math.max(1, page - 1))}
              >
                上一页
              </Button>
              <span data-i18n-skip="true" className="min-w-12 text-center text-xs text-[#766F73]">{currentTagPage} / {totalTagPages}</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                disabled={currentTagPage >= totalTagPages}
                onClick={() => setTagPage(page => Math.min(totalTagPages, page + 1))}
              >
                下一页
              </Button>
            </div>
            <Button variant="outline" onClick={() => setTagManageDialog(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

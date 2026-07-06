import React, { useMemo, useState } from 'react';
import {
  Archive,
  Check,
  CheckCircle,
  Database,
  Edit,
  FileText,
  FolderTree,
  Library,
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
import { useQuestionBank } from '../lib/QuestionBankContext';
import { aiActionTone } from '../lib/visualTones';
import {
  createQuestionId,
  DEFAULT_FILTERS,
  DIFFICULTY_LABELS,
  filterQuestions,
  findProduct,
  findProductLine,
  getQuestionAnswerText,
  getQuestionTagNames,
  mergeTags,
  normalizeQuestionForType,
  parseTagInput,
  QUESTION_TAXONOMY,
  QUESTION_TYPE_LABELS,
  QuestionBankItem,
  QuestionDifficulty,
  QuestionFilters,
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
  };
}

function countByProductLine(questions: QuestionBankItem[], productLineId: string) {
  return questions.filter(question => question.productLineId === productLineId && question.status !== 'archived').length;
}

function countByProduct(questions: QuestionBankItem[], productId: string) {
  return questions.filter(question => question.productId === productId && question.status !== 'archived').length;
}

export function ExamBank() {
  const {
    questions,
    addQuestions,
    updateQuestion,
    removeQuestion,
    bulkAddCustomTags,
    bulkSetStatus,
    generateVariants,
  } = useQuestionBank();

  const [filters, setFilters] = useState<QuestionFilters>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');
  const [tagDialog, setTagDialog] = useState(false);
  const [batchTags, setBatchTags] = useState('');
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);
  const [editingMode, setEditingMode] = useState<'create' | 'edit' | null>(null);
  const [customTagInput, setCustomTagInput] = useState('');

  const filteredQuestions = useMemo(() => filterQuestions(questions, filters), [questions, filters]);
  const allVisibleSelected = filteredQuestions.length > 0 && filteredQuestions.every(question => selectedIds.has(question.id));
  const selectedQuestions = questions.filter(question => selectedIds.has(question.id));
  const pendingCount = questions.filter(question => question.status === 'pending_review').length;

  const productsForFilter = filters.productLineId === 'all'
    ? QUESTION_TAXONOMY.productLines.flatMap(line => line.products)
    : findProductLine(filters.productLineId)?.products || [];

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
      const nextTags = prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId];
      return { ...prev, tagIds: nextTags };
    });
  };

  const addCustomTag = () => {
    if (!editingQuestion) return;
    const tags = parseTagInput(customTagInput);
    if (tags.length === 0) return;
    setEditingQuestion(prev => prev ? { ...prev, customTags: mergeTags(prev.customTags, tags) } : prev);
    setCustomTagInput('');
  };

  const removeCustomTag = (tag: string) => {
    setEditingQuestion(prev => prev ? { ...prev, customTags: prev.customTags.filter(item => item !== tag) } : prev);
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
      return { ...prev, options: [...prev.options, option] };
    });
  };

  const toggleCorrectOption = (optionId: string) => {
    setEditingQuestion(prev => {
      if (!prev) return prev;
      if (prev.type === 'single_choice' || prev.type === 'true_false') {
        return { ...prev, correctOptionIds: [optionId] };
      }
      const current = prev.correctOptionIds || [];
      const next = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      return { ...prev, correctOptionIds: next };
    });
  };

  const saveBatchTags = () => {
    const tags = parseTagInput(batchTags);
    if (tags.length === 0 || selectedIds.size === 0) return;
    bulkAddCustomTags(Array.from(selectedIds), tags);
    setTagDialog(false);
    setBatchTags('');
    setSelectedIds(new Set());
    showToast('批量标签已成功应用');
  };

  const handleBatchArchive = () => {
    if (selectedIds.size === 0) return;
    bulkSetStatus(Array.from(selectedIds), 'archived');
    showToast(`已归档 ${selectedIds.size} 道题目`);
    setSelectedIds(new Set());
  };

  const handleGenerateVariants = (ids: string[]) => {
    if (ids.length === 0) return;
    const variants = generateVariants(ids);
    setFilters(prev => ({ ...prev, status: 'pending_review', productLineId: 'all', productId: 'all' }));
    setSelectedIds(new Set(variants.map(question => question.id)));
    showToast(`AI 已生成 ${variants.length} 道待审核变体题`);
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

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col rounded-xl border border-[#E5DED8] bg-white">
          <div className="border-b border-[#E9E4DF] p-4">
            <div className="flex items-center text-sm font-bold text-[#242124]">
              <FolderTree className="mr-2 h-4 w-4 text-rose-600" />
              产品线分类
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <button
              onClick={() => updateFilters({ productLineId: 'all', productId: 'all' })}
              className={`mb-2 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-bold transition-colors ${filters.productLineId === 'all' ? 'bg-rose-50 text-rose-700' : 'text-[#3F3A3D] hover:bg-[#F8F5F3]'}`}
            >
              <span>全部题目</span>
              <span className="text-xs text-[#9A9396]">{questions.filter(question => question.status !== 'archived').length}</span>
            </button>

            {QUESTION_TAXONOMY.productLines.map(line => (
              <div key={line.id} className="mb-2">
                <button
                  onClick={() => updateFilters({ productLineId: line.id, productId: 'all' })}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-bold transition-colors ${filters.productLineId === line.id && filters.productId === 'all' ? 'bg-rose-50 text-rose-700' : 'text-[#3F3A3D] hover:bg-[#F8F5F3]'}`}
                >
                  <span data-i18n-skip="true">{line.name}</span>
                  <span className="text-xs text-[#9A9396]">{countByProductLine(questions, line.id)}</span>
                </button>
                <div className="mt-1 space-y-1 pl-3">
                  {line.products.map(product => (
                    <button
                      key={product.id}
                      onClick={() => updateFilters({ productLineId: line.id, productId: product.id })}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${filters.productId === product.id ? 'bg-[#F8F5F3] text-rose-700 font-bold' : 'text-[#766F73] hover:bg-[#F8F5F3]'}`}
                    >
                      <span data-i18n-skip="true" className="truncate">{product.name}</span>
                      <span className="ml-2 shrink-0 text-[#9A9396]">{countByProduct(questions, product.id)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#E9E4DF] p-4">
            <div className="mb-2 flex items-center text-sm font-bold text-[#242124]">
              <Tags className="mr-2 h-4 w-4 text-rose-600" />
              常用标签
            </div>
            <div className="flex flex-wrap gap-2">
              {QUESTION_TAXONOMY.tags.map(tag => (
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
          </div>
        </aside>

        <main className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#E5DED8] bg-white">
          <div className="shrink-0 border-b border-[#E9E4DF] p-4">
            <div className="grid gap-3 xl:grid-cols-[minmax(220px,1fr)_160px_160px_160px_160px]">
              <div className="relative min-w-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9396]" />
                <input
                  type="text"
                  placeholder="搜索题目、标签、产品线、产品或来源..."
                  value={filters.keyword}
                  onChange={event => updateFilters({ keyword: event.target.value })}
                  className="h-9 w-full rounded-lg border border-[#E5DED8] bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
              <select value={filters.type} onChange={event => updateFilters({ type: event.target.value as QuestionFilters['type'] })} className="h-9 rounded-lg border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20">
                <option value="all">全部题型</option>
                {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <select value={filters.productId} onChange={event => updateFilters({ productId: event.target.value })} className="h-9 rounded-lg border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20">
                <option value="all">全部产品</option>
                {productsForFilter.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
              <select value={filters.difficulty} onChange={event => updateFilters({ difficulty: event.target.value as QuestionFilters['difficulty'] })} className="h-9 rounded-lg border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20">
                <option value="all">全部难度</option>
                {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <select value={filters.status} onChange={event => updateFilters({ status: event.target.value as QuestionFilters['status'] })} className="h-9 rounded-lg border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20">
                <option value="all">全部状态</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>

            {selectedIds.size > 0 && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm">
                <div className="font-bold text-rose-700">已选择 {selectedIds.size} 项</div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={() => setTagDialog(true)} variant="outline" size="sm" className="h-8 bg-white text-rose-600 border-rose-200">
                    <Edit className="h-4 w-4" />
                    批量编辑标签
                  </Button>
                  <Button onClick={() => handleGenerateVariants(Array.from(selectedIds))} variant="outline" size="sm" className={`h-8 bg-white ${aiActionTone.buttonClass}`}>
                    <Wand2 className={`h-4 w-4 ${aiActionTone.iconClass}`} />
                    AI 生成变体题
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
                <span className="hidden w-28 shrink-0 lg:block">产品</span>
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
                const tags = getQuestionTagNames(question);

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
                      <button onClick={() => openEditPanel(question)} className="min-w-0 flex-1 text-left">
                        <div data-i18n-skip="true" className="truncate text-sm font-bold text-[#242124] group-hover:text-rose-700">
                          {question.stem}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-[#766F73]">
                          <span data-i18n-skip="true">{line?.name || '未分类'} / {product?.name || '未关联产品'}</span>
                          <span>{DIFFICULTY_LABELS[question.difficulty]}</span>
                          {question.generatedFromQuestionId && <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-bold text-indigo-700">AI 派生</span>}
                        </div>
                      </button>
                      <div data-i18n-skip="true" className="hidden w-28 shrink-0 truncate text-xs text-[#5D565A] lg:block" title={product?.name}>
                        {product?.name || '未关联产品'}
                      </div>
                      <div className="hidden w-36 shrink-0 flex-wrap gap-1 xl:flex">
                        {tags.slice(0, 3).map(tag => (
                          <Badge key={tag} data-i18n-skip="true" variant="secondary" className="max-w-full truncate bg-slate-100 text-[10px] font-normal text-[#5D565A]">
                            {tag}
                          </Badge>
                        ))}
                        {tags.length > 3 && <span className="text-[10px] text-[#9A9396]">+{tags.length - 3}</span>}
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
                      <Button onClick={() => handleGenerateVariants([question.id])} variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#8B621F] hover:bg-[#FFF7EA]" title="AI 生成变体题">
                        <Sparkles className="h-4 w-4" />
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
                  <p className="mt-1 text-xs">请尝试其他关键词、产品线或分类标签</p>
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
              <p className="text-xs text-[#766F73]">修改题干、题型、答案、产品分类和标签后保存</p>
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
                  <span className="mb-1 block text-sm font-bold text-[#3F3A3D]">产品线</span>
                  <select value={editingQuestion.productLineId || ''} onChange={event => handleProductLineChange(event.target.value)} className="h-9 w-full rounded-lg border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20">
                    {QUESTION_TAXONOMY.productLines.map(line => <option key={line.id} value={line.id}>{line.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-bold text-[#3F3A3D]">产品</span>
                  <select value={editingQuestion.productId || ''} onChange={event => setEditingField('productId', event.target.value)} className="h-9 w-full rounded-lg border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20">
                    {(findProductLine(editingQuestion.productLineId)?.products || []).map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
                  </select>
                </label>
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
              ) : (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#3F3A3D]">选项与答案</span>
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
                <span className="mb-2 block text-sm font-bold text-[#3F3A3D]">知识点标签</span>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_TAXONOMY.tags.map(tag => (
                    <button
                      key={tag.id}
                      data-i18n-skip="true"
                      onClick={() => toggleTag(tag.id)}
                      className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${editingQuestion.tagIds.includes(tag.id) ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-[#E5DED8] bg-[#F8F5F3] text-[#5D565A]'}`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-2 block text-sm font-bold text-[#3F3A3D]">自定义标签</span>
                <div className="mb-2 flex flex-wrap gap-2">
                  {editingQuestion.customTags.map(tag => (
                    <span key={tag} data-i18n-skip="true" className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-[#5D565A]">
                      {tag}
                      <button onClick={() => removeCustomTag(tag)} className="text-[#9A9396] hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={customTagInput} onChange={event => setCustomTagInput(event.target.value)} onKeyDown={event => event.key === 'Enter' && addCustomTag()} placeholder="输入标签并按回车添加..." className="h-9 min-w-0 flex-1 rounded-lg border border-[#E5DED8] px-3 text-sm outline-none focus:ring-2 focus:ring-rose-500/20" />
                  <Button onClick={addCustomTag} variant="outline" className="h-9">添加</Button>
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
    </div>
  );
}

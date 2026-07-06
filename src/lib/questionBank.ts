export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer';
export type QuestionDifficulty = 'basic' | 'intermediate' | 'advanced';
export type QuestionStatus = 'draft' | 'active' | 'archived' | 'pending_review';

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
}

export interface Product {
  id: string;
  name: string;
}

export interface ProductLine {
  id: string;
  name: string;
  products: Product[];
}

export interface TaxonomyTag {
  id: string;
  name: string;
  group: '知识点' | '业务场景' | '来源';
}

export interface QuestionBankItem {
  id: string;
  type: QuestionType;
  stem: string;
  options?: QuestionOption[];
  correctOptionIds?: string[];
  referenceAnswer?: string;
  scoringRubric?: string;
  aiGradingHint?: string;
  productLineId?: string;
  productId?: string;
  tagIds: string[];
  customTags: string[];
  difficulty: QuestionDifficulty;
  sourceFile?: string;
  status: QuestionStatus;
  generatedFromQuestionId?: string;
}

export interface QuestionFilters {
  keyword: string;
  type: 'all' | QuestionType;
  productLineId: 'all' | string;
  productId: 'all' | string;
  tagId: 'all' | string;
  difficulty: 'all' | QuestionDifficulty;
  status: 'all' | QuestionStatus;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  true_false: '判断题',
  short_answer: '简答题',
};

export const DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  basic: '基础',
  intermediate: '进阶',
  advanced: '困难',
};

export const STATUS_LABELS: Record<QuestionStatus, string> = {
  draft: '草稿',
  active: '已入库',
  archived: '已归档',
  pending_review: '待审核',
};

export const DEFAULT_FILTERS: QuestionFilters = {
  keyword: '',
  type: 'all',
  productLineId: 'all',
  productId: 'all',
  tagId: 'all',
  difficulty: 'all',
  status: 'all',
};

export const QUESTION_TAXONOMY = {
  productLines: [
    {
      id: 'skincare',
      name: '护肤系列',
      products: [
        { id: 'lumina-serum', name: 'Lumina 新品精华' },
        { id: 'barrier-shield', name: 'Barrier Shield 修护系列' },
        { id: 'winter-moisture', name: '冬季保湿系列' },
      ],
    },
    {
      id: 'makeup',
      name: '彩妆系列',
      products: [
        { id: 'soft-glow-foundation', name: 'Soft Glow 粉底液' },
        { id: 'velvet-lip', name: 'Velvet Lip 唇膏' },
      ],
    },
    {
      id: 'haircare',
      name: '护发系列',
      products: [
        { id: 'silk-hair-mask', name: 'Silk Repair 发膜' },
      ],
    },
  ] satisfies ProductLine[],
  tags: [
    { id: 'ingredient', name: '成分', group: '知识点' },
    { id: 'new-product', name: '新品', group: '业务场景' },
    { id: 'suitable-user', name: '适用人群', group: '知识点' },
    { id: 'selling-point', name: '卖点', group: '知识点' },
    { id: 'sales-script', name: '销售话术', group: '业务场景' },
    { id: 'basic-knowledge', name: '基础知识', group: '知识点' },
    { id: 'winter-care', name: '冬季护理', group: '业务场景' },
    { id: 'competitor', name: '竞品对比', group: '业务场景' },
    { id: 'barrier-repair', name: '屏障修护', group: '知识点' },
    { id: 'aftercare', name: '术后护理', group: '知识点' },
  ] satisfies TaxonomyTag[],
};

export const INITIAL_QUESTIONS: QuestionBankItem[] = [
  {
    id: 'b1',
    type: 'single_choice',
    stem: 'Lumina新品精华的核心成分是什么？',
    options: [
      { id: 'a', label: 'A', text: '烟酰胺' },
      { id: 'b', label: 'B', text: '神经酰胺' },
      { id: 'c', label: 'C', text: '玻色因' },
      { id: 'd', label: 'D', text: '高浓度维他命B5' },
    ],
    correctOptionIds: ['d'],
    productLineId: 'skincare',
    productId: 'lumina-serum',
    tagIds: ['ingredient', 'new-product'],
    customTags: ['Lumina'],
    difficulty: 'basic',
    sourceFile: 'Lumina_新品精华_培训版.pdf',
    status: 'active',
  },
  {
    id: 'b2',
    type: 'single_choice',
    stem: '下列哪一项是Lumina新品精华的主要修护成分？',
    options: [
      { id: 'a', label: 'A', text: '烟酰胺' },
      { id: 'b', label: 'B', text: '维他命C' },
      { id: 'c', label: 'C', text: '玻色因' },
      { id: 'd', label: 'D', text: '维他命B5' },
    ],
    correctOptionIds: ['d'],
    productLineId: 'skincare',
    productId: 'lumina-serum',
    tagIds: ['ingredient', 'barrier-repair'],
    customTags: ['Lumina'],
    difficulty: 'basic',
    sourceFile: 'Lumina_Sales_Deck.pptx',
    status: 'active',
  },
  {
    id: 'b3',
    type: 'true_false',
    stem: 'Lumina新品精华适合激光术后使用。',
    options: [
      { id: 'true', label: '正确', text: '正确' },
      { id: 'false', label: '错误', text: '错误' },
    ],
    correctOptionIds: ['true'],
    productLineId: 'skincare',
    productId: 'lumina-serum',
    tagIds: ['suitable-user', 'new-product', 'aftercare'],
    customTags: [],
    difficulty: 'intermediate',
    sourceFile: 'Lumina_新品精华_培训版.pdf',
    status: 'active',
  },
  {
    id: 'b4',
    type: 'multiple_choice',
    stem: '以下关于Lumina新品精华的描述，哪些是正确的？',
    options: [
      { id: 'a', label: 'A', text: '质地轻薄' },
      { id: 'b', label: 'B', text: '适合替代所有防晒产品' },
      { id: 'c', label: 'C', text: '含有高浓度维他命B5' },
      { id: 'd', label: 'D', text: '能帮助修护肌肤屏障' },
    ],
    correctOptionIds: ['a', 'c', 'd'],
    productLineId: 'skincare',
    productId: 'lumina-serum',
    tagIds: ['selling-point', 'new-product', 'barrier-repair'],
    customTags: ['重点考点'],
    difficulty: 'intermediate',
    sourceFile: 'Lumina_新品精华_培训版.pdf',
    status: 'active',
  },
  {
    id: 'b5',
    type: 'short_answer',
    stem: '顾客担心精华黏腻、不适合热带气候时，BA 应如何说明 Lumina 新品精华的卖点？',
    referenceAnswer: '先回应顾客对肤感的顾虑，再说明产品质地轻薄、吸收快，并强调高浓度维他命B5和屏障修护卖点，最后建议先在手背试用感受。',
    scoringRubric: '回应顾虑 2 分；说明轻薄吸收 2 分；提到核心成分和修护价值 4 分；给出试用或转化建议 2 分。',
    aiGradingHint: '重点看是否先共情，再给出产品事实和转化动作。',
    productLineId: 'skincare',
    productId: 'lumina-serum',
    tagIds: ['sales-script', 'selling-point'],
    customTags: ['主观题'],
    difficulty: 'advanced',
    sourceFile: 'Lumina_新品精华_培训版.pdf',
    status: 'active',
  },
  {
    id: 'b6',
    type: 'single_choice',
    stem: '冬季护肤中最需要优先向顾客强调的步骤是？',
    options: [
      { id: 'a', label: 'A', text: '高频去角质' },
      { id: 'b', label: 'B', text: '清洁后及时保湿锁水' },
      { id: 'c', label: 'C', text: '只使用彩妆打底' },
      { id: 'd', label: 'D', text: '减少所有护肤步骤' },
    ],
    correctOptionIds: ['b'],
    productLineId: 'skincare',
    productId: 'winter-moisture',
    tagIds: ['basic-knowledge', 'winter-care'],
    customTags: [],
    difficulty: 'basic',
    sourceFile: '冬季保湿系列培训.pdf',
    status: 'draft',
  },
];

export function createQuestionId(prefix = 'q') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function findProductLine(productLineId?: string) {
  return QUESTION_TAXONOMY.productLines.find(line => line.id === productLineId);
}

export function findProduct(productLineId?: string, productId?: string) {
  return findProductLine(productLineId)?.products.find(product => product.id === productId);
}

export function findTag(tagId: string) {
  return QUESTION_TAXONOMY.tags.find(tag => tag.id === tagId);
}

export function getQuestionTagNames(question: QuestionBankItem) {
  const taxonomyTags = question.tagIds.map(id => findTag(id)?.name).filter(Boolean) as string[];
  return [...taxonomyTags, ...question.customTags];
}

export function parseTagInput(input: string) {
  return Array.from(new Set(input.split(/[,，\s]+/).map(tag => tag.trim()).filter(Boolean)));
}

export function mergeTags(existing: string[], next: string[]) {
  return Array.from(new Set([...existing, ...next].map(tag => tag.trim()).filter(Boolean)));
}

export function getQuestionAnswerText(question: QuestionBankItem) {
  if (question.type === 'short_answer') {
    return question.referenceAnswer || '待补充参考答案';
  }

  const selectedOptions = question.options?.filter(option => question.correctOptionIds?.includes(option.id)) || [];
  return selectedOptions.map(option => `${option.label}. ${option.text}`).join('、') || '未设置答案';
}

export function getQuestionSearchText(question: QuestionBankItem) {
  const line = findProductLine(question.productLineId)?.name || '';
  const product = findProduct(question.productLineId, question.productId)?.name || '';
  const optionText = question.options?.map(option => `${option.label}${option.text}`).join(' ') || '';
  return [
    question.stem,
    optionText,
    question.referenceAnswer,
    question.scoringRubric,
    line,
    product,
    question.sourceFile,
    QUESTION_TYPE_LABELS[question.type],
    DIFFICULTY_LABELS[question.difficulty],
    STATUS_LABELS[question.status],
    ...getQuestionTagNames(question),
  ].filter(Boolean).join(' ').toLowerCase();
}

export function filterQuestions(questions: QuestionBankItem[], filters: QuestionFilters) {
  const keyword = filters.keyword.trim().toLowerCase();

  return questions.filter(question => {
    if (filters.type !== 'all' && question.type !== filters.type) return false;
    if (filters.productLineId !== 'all' && question.productLineId !== filters.productLineId) return false;
    if (filters.productId !== 'all' && question.productId !== filters.productId) return false;
    if (filters.tagId !== 'all' && !question.tagIds.includes(filters.tagId) && !question.customTags.includes(filters.tagId)) return false;
    if (filters.difficulty !== 'all' && question.difficulty !== filters.difficulty) return false;
    if (filters.status !== 'all' && question.status !== filters.status) return false;
    if (keyword && !getQuestionSearchText(question).includes(keyword)) return false;
    return true;
  });
}

export function normalizeQuestionForType(question: QuestionBankItem): QuestionBankItem {
  if (question.type === 'short_answer') {
    return {
      ...question,
      options: undefined,
      correctOptionIds: undefined,
      referenceAnswer: question.referenceAnswer || '',
      scoringRubric: question.scoringRubric || '',
      aiGradingHint: question.aiGradingHint || '',
    };
  }

  if (question.type === 'true_false') {
    const options = [
      { id: 'true', label: '正确', text: '正确' },
      { id: 'false', label: '错误', text: '错误' },
    ];
    const currentAnswer = question.correctOptionIds?.[0];
    return {
      ...question,
      options,
      correctOptionIds: currentAnswer === 'false' ? ['false'] : ['true'],
      referenceAnswer: undefined,
      scoringRubric: undefined,
      aiGradingHint: undefined,
    };
  }

  const fallbackOptions = question.options && question.options.length >= 2
    ? question.options
    : [
      { id: 'a', label: 'A', text: '' },
      { id: 'b', label: 'B', text: '' },
      { id: 'c', label: 'C', text: '' },
      { id: 'd', label: 'D', text: '' },
    ];

  return {
    ...question,
    options: fallbackOptions,
    correctOptionIds: question.type === 'single_choice'
      ? [question.correctOptionIds?.[0] || fallbackOptions[0].id]
      : question.correctOptionIds || [fallbackOptions[0].id],
    referenceAnswer: undefined,
    scoringRubric: undefined,
    aiGradingHint: undefined,
  };
}

export function createVariantQuestion(source: QuestionBankItem, index: number): QuestionBankItem {
  const inheritedTags = mergeTags(source.customTags, ['AI变体']);
  const id = createQuestionId(`variant-${source.id}`);
  const suffixes = [
    '换一种问法考察同一知识点',
    '结合门店销售场景重新提问',
    '用于复训抽查的变体题',
  ];

  if (source.type === 'short_answer') {
    return {
      ...source,
      id,
      stem: `${source.stem}（${suffixes[index % suffixes.length]}）`,
      referenceAnswer: source.referenceAnswer || '',
      scoringRubric: source.scoringRubric || '',
      aiGradingHint: source.aiGradingHint || 'AI 初稿，需培训师复核评分要点。',
      customTags: inheritedTags,
      status: 'pending_review',
      generatedFromQuestionId: source.id,
    };
  }

  return normalizeQuestionForType({
    ...source,
    id,
    stem: `${source.stem}（${suffixes[index % suffixes.length]}）`,
    customTags: inheritedTags,
    status: 'pending_review',
    generatedFromQuestionId: source.id,
  });
}

export function createUploadPreviewQuestions(): QuestionBankItem[] {
  return [
    {
      ...INITIAL_QUESTIONS[0],
      id: createQuestionId('upload'),
      status: 'pending_review',
      sourceFile: 'Lumina_新品精华_培训版.pdf',
    },
    {
      ...INITIAL_QUESTIONS[2],
      id: createQuestionId('upload'),
      status: 'pending_review',
      sourceFile: 'Lumina_新品精华_培训版.pdf',
    },
    {
      ...INITIAL_QUESTIONS[3],
      id: createQuestionId('upload'),
      status: 'pending_review',
      sourceFile: 'Lumina_新品精华_培训版.pdf',
    },
    {
      ...INITIAL_QUESTIONS[4],
      id: createQuestionId('upload'),
      status: 'pending_review',
      sourceFile: 'Lumina_新品精华_培训版.pdf',
    },
  ];
}

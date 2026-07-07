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

export const GENERAL_CAPABILITY_LINE_ID = 'general-capability';
export const MAX_TAGS_PER_QUESTION = 5;

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
    {
      id: GENERAL_CAPABILITY_LINE_ID,
      name: '通用能力',
      products: [],
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
    { id: 'service-etiquette', name: '服务礼仪', group: '业务场景' },
    { id: 'communication-opening', name: '沟通开场', group: '业务场景' },
    { id: 'color-matching', name: '色彩搭配', group: '知识点' },
    { id: 'makeup-suggestion', name: '妆容建议', group: '知识点' },
    { id: 'skin-diagnosis', name: '肤质判断', group: '知识点' },
    { id: 'objection-handling', name: '异议处理', group: '业务场景' },
    { id: 'price-objection', name: '价格异议', group: '业务场景' },
    { id: 'deal-closing', name: '成交转化', group: '业务场景' },
    { id: 'add-on-selling', name: '连带推荐', group: '业务场景' },
    { id: 'complaint-handling', name: '投诉处理', group: '业务场景' },
    { id: 'display-standard', name: '陈列规范', group: '业务场景' },
    { id: 'member-operation', name: '会员运营', group: '业务场景' },
    { id: 'gift-recommendation', name: '礼赠推荐', group: '业务场景' },
    { id: 'campaign-script', name: '活动话术', group: '业务场景' },
    { id: 'holiday-promotion', name: '节日促销', group: '业务场景' },
    { id: 'sensitive-skin', name: '敏感肌', group: '知识点' },
    { id: 'oily-skin', name: '油性肌', group: '知识点' },
    { id: 'dry-skin', name: '干性肌', group: '知识点' },
    { id: 'combination-skin', name: '混合肌', group: '知识点' },
    { id: 'anti-aging', name: '抗老', group: '知识点' },
    { id: 'brightening', name: '提亮', group: '知识点' },
    { id: 'moisturizing', name: '保湿', group: '知识点' },
    { id: 'sun-care', name: '防晒', group: '知识点' },
    { id: 'cleansing', name: '清洁', group: '知识点' },
    { id: 'usage-step', name: '使用步骤', group: '知识点' },
    { id: 'contraindication', name: '禁忌注意', group: '知识点' },
    { id: 'product-safety', name: '产品安全', group: '知识点' },
    { id: 'faq', name: '常见问题', group: '知识点' },
    { id: 'easy-mistake', name: '易错题', group: '知识点' },
    { id: 'new-hire', name: '新人必考', group: '业务场景' },
    { id: 'advanced-training', name: '进阶训练', group: '业务场景' },
    { id: 'review-training', name: '复训题', group: '业务场景' },
    { id: 'scenario-drill', name: '场景演练', group: '业务场景' },
    { id: 'customer-need', name: '需求诊断', group: '业务场景' },
    { id: 'base-makeup', name: '底妆', group: '知识点' },
    { id: 'lip-makeup', name: '唇妆', group: '知识点' },
    { id: 'fragrance', name: '香氛', group: '知识点' },
    { id: 'hair-repair', name: '发丝修护', group: '知识点' },
    { id: 'scalp-care', name: '头皮护理', group: '知识点' },
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
  {
    id: 'b7',
    type: 'short_answer',
    stem: '顾客进店后只说“随便看看”时，BA 应如何用服务礼仪开启沟通？',
    referenceAnswer: '先保持适当距离和微笑问候，避免立即强推产品；用开放式问题了解顾客需求，例如“今天想看看护肤、彩妆还是礼赠方向？”；根据回应再引导体验或提供建议。',
    scoringRubric: '礼貌问候 2 分；不强推 2 分；开放式提问 3 分；后续引导体验或建议 3 分。',
    aiGradingHint: '重点看是否体现服务礼仪、需求探索和自然转化。',
    productLineId: GENERAL_CAPABILITY_LINE_ID,
    tagIds: ['sales-script', 'basic-knowledge'],
    customTags: ['服务礼仪', '沟通开场'],
    difficulty: 'basic',
    sourceFile: '门店服务礼仪SOP.pdf',
    status: 'active',
  },
];

export function createQuestionId(prefix = 'q') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function normalizeTagName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

export function getTagNameKey(name: string) {
  return normalizeTagName(name).toLocaleLowerCase();
}

export function createTagIdFromName(name: string) {
  const normalized = normalizeTagName(name);
  const asciiSlug = normalized
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (asciiSlug) return `tag-${asciiSlug}`;

  const hash = Array.from(normalized).reduce((acc, char) => {
    return (acc * 31 + char.charCodeAt(0)) % 1000000;
  }, 7);
  return `tag-${hash.toString(36)}`;
}

export function createTaxonomyTag(name: string): TaxonomyTag {
  return {
    id: createTagIdFromName(name),
    name: normalizeTagName(name),
    group: '知识点',
  };
}

export function findProductLine(productLineId?: string) {
  return QUESTION_TAXONOMY.productLines.find(line => line.id === productLineId);
}

export function findProduct(productLineId?: string, productId?: string) {
  return findProductLine(productLineId)?.products.find(product => product.id === productId);
}

export function findTag(tagId: string, tags: TaxonomyTag[] = QUESTION_TAXONOMY.tags) {
  return tags.find(tag => tag.id === tagId);
}

export function getQuestionTagNames(question: QuestionBankItem, tags: TaxonomyTag[] = QUESTION_TAXONOMY.tags) {
  const taxonomyTags = question.tagIds.map(id => findTag(id, tags)?.name).filter(Boolean) as string[];
  return mergeTags(taxonomyTags, question.customTags);
}

export function parseTagInput(input: string) {
  return Array.from(new Set(input.split(/[,，\s]+/).map(tag => tag.trim()).filter(Boolean)));
}

export function mergeTags(existing: string[], next: string[]) {
  return Array.from(new Set([...existing, ...next].map(tag => tag.trim()).filter(Boolean)));
}

export function limitQuestionTags(question: QuestionBankItem): QuestionBankItem {
  const tagIds = Array.from(new Set(question.tagIds)).slice(0, MAX_TAGS_PER_QUESTION);
  const remainingCustomSlots = Math.max(0, MAX_TAGS_PER_QUESTION - tagIds.length);
  return {
    ...question,
    tagIds,
    customTags: mergeTags([], question.customTags).slice(0, remainingCustomSlots),
  };
}

export function getQuestionAnswerText(question: QuestionBankItem) {
  if (question.type === 'short_answer') {
    return question.referenceAnswer || '待补充参考答案';
  }

  const selectedOptions = question.options?.filter(option => question.correctOptionIds?.includes(option.id)) || [];
  return selectedOptions.map(option => `${option.label}. ${option.text}`).join('、') || '未设置答案';
}

export function getQuestionSearchText(question: QuestionBankItem, tags: TaxonomyTag[] = QUESTION_TAXONOMY.tags) {
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
    ...getQuestionTagNames(question, tags),
  ].filter(Boolean).join(' ').toLowerCase();
}

export function filterQuestions(questions: QuestionBankItem[], filters: QuestionFilters, tags: TaxonomyTag[] = QUESTION_TAXONOMY.tags) {
  const keyword = filters.keyword.trim().toLowerCase();
  const selectedTagName = filters.tagId === 'all' ? '' : findTag(filters.tagId, tags)?.name || '';

  return questions.filter(question => {
    if (filters.type !== 'all' && question.type !== filters.type) return false;
    if (filters.productLineId !== 'all' && question.productLineId !== filters.productLineId) return false;
    if (filters.productId !== 'all' && question.productId !== filters.productId) return false;
    if (filters.tagId !== 'all' && !question.tagIds.includes(filters.tagId) && !question.customTags.includes(selectedTagName)) return false;
    if (filters.difficulty !== 'all' && question.difficulty !== filters.difficulty) return false;
    if (filters.status !== 'all' && question.status !== filters.status) return false;
    if (keyword && !getQuestionSearchText(question, tags).includes(keyword)) return false;
    return true;
  });
}

export function normalizeQuestionForType(question: QuestionBankItem): QuestionBankItem {
  if (question.type === 'short_answer') {
    return limitQuestionTags({
      ...question,
      options: undefined,
      correctOptionIds: undefined,
      referenceAnswer: question.referenceAnswer || '',
      scoringRubric: question.scoringRubric || '',
      aiGradingHint: question.aiGradingHint || '',
    });
  }

  if (question.type === 'true_false') {
    const options = [
      { id: 'true', label: '正确', text: '正确' },
      { id: 'false', label: '错误', text: '错误' },
    ];
    const currentAnswer = question.correctOptionIds?.[0];
    return limitQuestionTags({
      ...question,
      options,
      correctOptionIds: currentAnswer === 'false' ? ['false'] : ['true'],
      referenceAnswer: undefined,
      scoringRubric: undefined,
      aiGradingHint: undefined,
    });
  }

  const fallbackOptions = question.options && question.options.length >= 2
    ? question.options
    : [
      { id: 'a', label: 'A', text: '' },
      { id: 'b', label: 'B', text: '' },
      { id: 'c', label: 'C', text: '' },
      { id: 'd', label: 'D', text: '' },
    ];

  return limitQuestionTags({
    ...question,
    options: fallbackOptions,
    correctOptionIds: question.type === 'single_choice'
      ? [question.correctOptionIds?.[0] || fallbackOptions[0].id]
      : question.correctOptionIds || [fallbackOptions[0].id],
    referenceAnswer: undefined,
    scoringRubric: undefined,
    aiGradingHint: undefined,
  });
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
    return limitQuestionTags({
      ...source,
      id,
      stem: `${source.stem}（${suffixes[index % suffixes.length]}）`,
      referenceAnswer: source.referenceAnswer || '',
      scoringRubric: source.scoringRubric || '',
      aiGradingHint: source.aiGradingHint || 'AI 初稿，需培训师复核评分要点。',
      customTags: inheritedTags,
      status: 'pending_review',
      generatedFromQuestionId: source.id,
    });
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
      customTags: mergeTags(INITIAL_QUESTIONS[4].customTags, ['热带气候话术']),
      sourceFile: 'Lumina_新品精华_培训版.pdf',
    },
  ];
}

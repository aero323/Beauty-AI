import React, { useEffect, useState } from 'react';
import { Plus, Trash2, CheckCircle, Save, Settings, MessageSquare, AlertCircle, ImageIcon, Upload, Wand2, ChevronRight, ChevronDown, Package, Folder, FolderOpen, ArrowLeft, Play, Mic, ChevronUp, RotateCcw, LibraryBig, Link2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { aiActionTone } from '../lib/visualTones';
import { EffectiveStatusBadge, type EffectiveStatus } from '../components/EffectiveStatusBadge';
import { MaterialReferenceDialog } from '../components/MaterialReferenceDialog';
import { createDerivedAssetReferences } from '../lib/materialLibraryData';
import type { DerivedAssetReference, GoldenMaterial } from '../types';
import { PracticePromptNotice } from '../components/PracticePromptNotice';

interface Quote {
  id: string;
  text: string;
  hint: string;
  sourceReferences?: DerivedAssetReference[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  quotes: Quote[];
  effectiveStatus: EffectiveStatus;
}

interface ProductLine {
  id: string;
  name: string;
  products: Product[];
}

interface ProductCategory {
  id: string;
  name: string;
  lines: ProductLine[];
}

const INITIAL_DATA: ProductCategory[] = [
  {
    id: 'c1',
    name: '护肤品类',
    lines: [
      {
        id: 'l1',
        name: 'Barrier Shield 屏障修护系列',
        products: [
          {
            id: 'p1',
            name: 'BS B5高保湿面霜',
            description: '主打高浓度维他命B5与神经酰胺，适合干敏皮在换季或激光术后使用。',
            imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
            effectiveStatus: 'active',
            quotes: [
              { id: 'q1', text: '“这瓶面霜就像给肌肤穿上了一层隐形的拉链防风衣，特别适合现在这种容易换季泛红的天气。”', hint: '强调像衣服一样的保护感，适合秋冬/换季' },
              { id: 'q2', text: '“里面有黄金配比的神经酰胺，不是表面浮油，是真的能吃进皮肤里修护底子的。”', hint: '强调成分，针对顾客觉得其他面霜浮油的痛点' }
            ]
          },
          {
            id: 'p2',
            name: 'BS 急救舒缓精华',
            description: '高频次安抚敏感泛红，质地轻薄。',
            quotes: [],
            effectiveStatus: 'active'
          }
        ]
      },
      {
        id: 'l2',
        name: 'Radiance 极光透亮系列',
        products: [
          {
            id: 'p3',
            name: '极光焕白精华液',
            description: '阻断黑色素沉积，温和透亮。',
            quotes: [],
            effectiveStatus: 'active'
          }
        ]
      }
    ]
  },
  {
    id: 'c2',
    name: '彩妆品类',
    lines: [
      {
        id: 'l3',
        name: 'Flawless 丝绒底妆系列',
        products: [
          {
            id: 'p4',
            name: '丝绒持妆粉底液',
            description: '24小时长效贴合，打造高级哑光丝绒妆效。',
            quotes: [],
            effectiveStatus: 'active'
          }
        ]
      }
    ]
  }
];

interface QuoteReadAlongPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

function stripQuoteMarks(text: string) {
  return text.replace(/^[“"']+|[”"']+$/g, '').trim();
}

function splitQuoteForEmphasis(text: string) {
  const clean = stripQuoteMarks(text);
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 8) {
    return {
      lead: words.slice(0, 5).join(' '),
      highlight: words.slice(5, 8).join(' '),
      tail: words.slice(8).join(' '),
    };
  }

  const punctuationIndex = clean.search(/[，,。.!！?？]/);
  if (punctuationIndex > 5) {
    return {
      lead: clean.slice(0, punctuationIndex),
      highlight: clean.slice(punctuationIndex, punctuationIndex + 1),
      tail: clean.slice(punctuationIndex + 1),
    };
  }

  const midpoint = Math.max(4, Math.floor(clean.length * 0.45));
  const end = Math.min(clean.length, midpoint + Math.max(2, Math.floor(clean.length * 0.25)));
  return {
    lead: clean.slice(0, midpoint),
    highlight: clean.slice(midpoint, end),
    tail: clean.slice(end),
  };
}

function QuoteReadAlongPreviewDialog({ open, onOpenChange, product }: QuoteReadAlongPreviewDialogProps) {
  const quotes = product.quotes.length > 0
    ? product.quotes
    : [{ id: 'empty-preview', text: '“请先为这个产品添加一条适合跟读的销售金句。”', hint: '学员将在 APP 中听原音并按住跟读。' }];
  const [activeIndex, setActiveIndex] = useState(0);
  const currentQuote = quotes[Math.min(activeIndex, quotes.length - 1)] ?? quotes[0];
  const emphasized = splitQuoteForEmphasis(currentQuote.text);

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
    }
  }, [open, product.id]);

  const nextQuote = () => {
    setActiveIndex(index => (index + 1) % quotes.length);
  };

  const resetPreview = () => {
    setActiveIndex(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1120px] h-[88vh] overflow-hidden bg-[#FCFAF8] p-0">
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center justify-between border-b border-[#E5DED8] bg-white px-6 py-4">
            <div>
              <div className="relative w-fit pr-5 group/quote-read-note">
                <span data-i18n-skip="true" className="absolute -right-1 -top-2 z-20 h-4 min-w-4 rounded-full bg-blue-950 px-1 text-[9px] font-bold leading-4 text-white text-center shadow-sm backdrop-blur-sm">
                  注
                </span>
                <DialogTitle className="text-lg font-bold text-[#242124]">金句跟读预览</DialogTitle>
                <div
                  data-i18n-skip="true"
                  className="absolute left-0 top-full mt-2 hidden group-hover/quote-read-note:block z-50 w-80 rounded-lg bg-blue-950/95 px-3 py-2 text-xs leading-relaxed text-white shadow-xl backdrop-blur-sm"
                >
                  给研发：兵哥提出，金句跟读每次要做文本比对来判定正确率；如果有两次正确率低于 80%，则多读一次，最多 4 次。
                </div>
              </div>
              <p className="mt-1 text-xs text-[#766F73]">模拟学员 APP 端听原音、按住跟读和查看进度的练习界面</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetPreview}
              className="border-[#E5DED8] bg-white text-[#3F3A3D] hover:bg-[#F8F5F3]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>重置预览</span>
            </Button>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(360px,0.9fr)_minmax(0,1fr)]">
            <div className="flex min-h-0 items-center justify-center overflow-y-auto border-r border-[#E5DED8] bg-[#F7ECEC] p-6">
              <div className="relative h-[690px] w-[390px] max-h-full overflow-hidden rounded-[42px] border-[10px] border-[#242124] bg-[#FCEEEF] shadow-2xl">
                <div className="relative h-[300px] overflow-hidden bg-slate-200">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#E8D8D6] via-[#F3ECE9] to-[#C8D8D2] text-[#9A9396]">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-white/5 to-[#FCEEEF]" />
                  <button className="absolute left-6 top-8 flex h-12 w-12 items-center justify-center rounded-full border border-white/45 bg-white/20 text-white shadow-sm backdrop-blur-md">
                    <ArrowLeft className="h-6 w-6" />
                  </button>
                  <div className="absolute right-6 top-8 rounded-full border border-white/60 bg-white/25 p-1 shadow-sm backdrop-blur-md">
                    <div className="rounded-full bg-white px-4 py-2 text-sm font-black italic text-rose-500 shadow-sm">Sentence of Day</div>
                  </div>
                </div>

                <div className="absolute left-7 right-7 top-[230px] h-[305px] rounded-[32px] border border-white/70 bg-white/95 px-6 py-6 shadow-xl">
                  <div className="mb-5 flex items-center justify-between text-[12px] font-black uppercase tracking-[0.22em]">
                    <span className="text-[#6E8DA5]">{`Progress ${activeIndex + 1}/${quotes.length}`}</span>
                    <span className="text-rose-500">{`Practice #${activeIndex}`}</span>
                  </div>
                  <p data-i18n-skip="true" className="line-clamp-5 text-[23px] font-black italic leading-[1.25] text-[#0E3A4B]">
                    {emphasized.lead}
                    {emphasized.highlight ? <span className="mx-1 text-rose-500 underline decoration-rose-200 decoration-4 underline-offset-4">{emphasized.highlight}</span> : null}
                    {emphasized.tail}
                  </p>
                  <div className="my-4 h-px bg-[#E5EEF1]" />
                  <p data-i18n-skip="true" className="line-clamp-2 text-xs font-bold leading-relaxed text-[#8EA8BA]">
                    {currentQuote.hint || product.description}
                  </p>
                </div>

                <div className="absolute inset-x-0 bottom-20 flex items-end justify-center gap-12">
                  <div className="flex flex-col items-center gap-3">
                    <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#6E8DA5] shadow-lg">
                      <Play className="h-7 w-7 fill-current" />
                    </button>
                    <span className="text-sm font-black text-[#A8BBC8]">Listen</span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <button className="flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-white bg-rose-500 text-white shadow-xl shadow-rose-200 transition-transform active:scale-95">
                      <Mic className="h-11 w-11" />
                    </button>
                    <span className="text-base font-black text-rose-500">Hold to Read</span>
                  </div>
                </div>

                <button
                  onClick={nextQuote}
                  className="absolute inset-x-0 bottom-6 mx-auto flex w-fit flex-col items-center text-[12px] font-black uppercase tracking-[0.28em] text-[#B8C8D0]"
                >
                  Swipe Up
                  <ChevronUp className="mt-1 h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 overflow-y-auto bg-[#F8F5F3] p-6">
              <div className="mb-5 rounded-2xl border border-[#E5DED8] bg-white p-5">
                <div data-i18n-skip="true" className="text-sm font-bold text-[#242124]">{product.name}</div>
                <p data-i18n-skip="true" className="mt-1 text-xs leading-relaxed text-[#766F73]">{product.description}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-[#F8F5F3] p-3">
                    <div className="text-lg font-black text-[#242124]">{quotes.length}</div>
                    <div className="mt-1 text-[10px] font-bold text-[#9A9396]">金句数</div>
                  </div>
                  <div className="rounded-xl bg-[#F8F5F3] p-3">
                    <div className="text-lg font-black text-[#3B8F72]">92</div>
                    <div className="mt-1 text-[10px] font-bold text-[#9A9396]">示例评分</div>
                  </div>
                  <div className="rounded-xl bg-[#F8F5F3] p-3">
                    <div className="text-lg font-black text-rose-500">3</div>
                    <div className="mt-1 text-[10px] font-bold text-[#9A9396]">跟读次数</div>
                  </div>
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-wider text-[#9A9396]">金句跟读队列</div>
              </div>
              <div className="space-y-3">
                {quotes.map((quote, index) => (
                  <button
                    key={quote.id}
                    onClick={() => setActiveIndex(index)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      index === activeIndex
                        ? 'border-rose-200 bg-white shadow-sm ring-2 ring-rose-100'
                        : 'border-[#E5DED8] bg-white/70 hover:bg-white'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${index === activeIndex ? 'text-rose-500' : 'text-[#9A9396]'}`}>{`Practice ${index + 1}`}</span>
                      <span className="rounded-full bg-[#F8F5F3] px-2 py-0.5 text-[10px] font-bold text-[#766F73]">跟读</span>
                    </div>
                    <p data-i18n-skip="true" className="line-clamp-2 text-sm font-bold leading-relaxed text-[#242124]">{stripQuoteMarks(quote.text)}</p>
                    {quote.hint ? <p data-i18n-skip="true" className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#766F73]">{quote.hint}</p> : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BAQuotes() {
  const [categories, setCategories] = useState<ProductCategory[]>(INITIAL_DATA);
  // Store expanded state for categories and lines
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['c1', 'l1']));
  const [selectedProductId, setSelectedProductId] = useState<string>('p1');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('产品库已保存');
  const [toastTone, setToastTone] = useState<'success' | 'warning'>('success');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [materialReferenceOpen, setMaterialReferenceOpen] = useState(false);

  const showFeedback = (message: string, tone: 'success' | 'warning' = 'success', duration = 2500) => {
    setToastMessage(message);
    setToastTone(tone);
    setShowToast(true);
    setTimeout(() => setShowToast(false), duration);
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Find the selected product from nested structure
  let selectedProduct: Product | undefined;
  let breadcrumbs: string[] = [];

  for (const cat of categories) {
    for (const line of cat.lines) {
      for (const prod of line.products) {
        if (prod.id === selectedProductId) {
          selectedProduct = prod;
          breadcrumbs = [cat.name, line.name, prod.name];
          break;
        }
      }
      if (selectedProduct) break;
    }
    if (selectedProduct) break;
  }

  const handleUpdateProduct = (field: keyof Product, value: any) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      lines: cat.lines.map(line => ({
        ...line,
        products: line.products.map(prod =>
          prod.id === selectedProductId ? { ...prod, [field]: value, effectiveStatus: 'pending' } : prod
        )
      }))
    })));
  };

  const handleUpdateQuote = (quoteId: string, field: keyof Quote, value: string) => {
    if (!selectedProduct) return;
    handleUpdateProduct('quotes', selectedProduct.quotes.map(q =>
      q.id === quoteId ? { ...q, [field]: value } : q
    ));
  };

  const handleAddQuote = () => {
    if (!selectedProduct) return;
    const newQuote: Quote = {
      id: Date.now().toString(),
      text: '',
      hint: ''
    };
    handleUpdateProduct('quotes', [...selectedProduct.quotes, newQuote]);
  };

  const applyMaterialReference = (materials: GoldenMaterial[]) => {
    if (!selectedProduct || !materials.length) return;
    const importedQuotes: Quote[] = materials.map((material) => ({
      id: `material-quote-${material.id}-${Date.now()}`,
      text: material.quoteText ?? `“${material.evidence[0]?.transcript ?? material.summary}”`,
      hint: `适用：${material.targetLabel}。${material.aiSummary ?? material.summary}`,
      sourceReferences: createDerivedAssetReferences('quote', [material]),
    }));
    handleUpdateProduct('quotes', [...selectedProduct.quotes, ...importedQuotes]);
    showFeedback(`已从素材库导入 ${importedQuotes.length} 条金句草稿`, 'success', 3000);
  };

  const handleRemoveQuote = (quoteId: string) => {
    if (!selectedProduct) return;
    handleUpdateProduct('quotes', selectedProduct.quotes.filter(q => q.id !== quoteId));
  };

  const handleGenerateQuotes = () => {
    if (!selectedProduct) return;
    const productName = selectedProduct.name.trim();
    const productDescription = selectedProduct.description.trim();

    if (!productName || !productDescription) {
      showFeedback('请先填写产品名称和产品卖点', 'warning');
      return;
    }

    const context = productDescription.length > 34 ? `${productDescription.slice(0, 34)}...` : productDescription;
    const generatedQuotes: Quote[] = [
      {
        id: `${Date.now()}-quote-1`,
        text: `“${productName}适合先从肤感讲起，它不是单纯补水，而是帮肌肤把状态稳下来。”`,
        hint: `开场推荐，适合顾客还没有明确需求时，用“${context}”做温和引入。`
      },
      {
        id: `${Date.now()}-quote-2`,
        text: `“如果你担心护肤只是表面舒服，${productName}的重点就是让后续状态更稳定、更容易维持。”`,
        hint: '适合回应顾客担心效果短暂、只停留在肤感层面的疑虑。'
      },
      {
        id: `${Date.now()}-quote-3`,
        text: `“这款可以当作日常护理里的稳定器，换季、熬夜或状态波动时都更好衔接。”`,
        hint: '适合换季、作息不规律、皮肤状态反复的顾客。'
      },
      {
        id: `${Date.now()}-quote-4`,
        text: `“你可以先把${productName}理解成给皮肤打底，底子稳了，后面上妆和保养都会更听话。”`,
        hint: '适合有上妆、卡粉、保养吸收差等困扰的顾客。'
      },
      {
        id: `${Date.now()}-quote-5`,
        text: `“它的卖点不是夸张立刻变白变嫩，而是让皮肤慢慢回到更舒服、更可控的状态。”`,
        hint: '适合对功效承诺敏感、担心过度营销的理性顾客。'
      },
      {
        id: `${Date.now()}-quote-6`,
        text: `“如果你只想先入手一款不容易出错的护理品，${productName}会是很稳的第一步。”`,
        hint: '适合收口成交，帮助顾客降低选择成本。'
      }
    ];

    handleUpdateProduct('quotes', generatedQuotes);
    showFeedback('已生成 6 条销售金句', 'success');
  };

  const handleSave = () => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      lines: cat.lines.map(line => ({
        ...line,
        products: line.products.map(prod =>
          prod.id === selectedProductId ? { ...prod, effectiveStatus: 'active' } : prod
        )
      }))
    })));
    showFeedback('产品库已保存', 'success', 3000);
  };

  const selectedProductForPreview = selectedProduct ?? categories[0].lines[0].products[0];

  return (
    <div className="flex h-full bg-[#F7F3F1] overflow-hidden pt-2 rounded-xl border border-[#E5DED8]">
      {/* Left Sidebar - Hierarchy Tree */}
      <div className="w-80 bg-white border-r border-[#E5DED8] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#E9E4DF] flex items-center justify-between z-10 bg-white">
          <h2 className="font-bold text-[#242124] tracking-tight">产品与金句库</h2>
          <button
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-rose-600 px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-rose-700"
            title="添加品类或产品 (开发中)"
          >
            <Plus className="h-4 w-4" />
            <span>新建</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {categories.map(category => (
            <div key={category.id} className="space-y-1">
              <div
                className="flex items-center space-x-2 p-2 hover:bg-[#F8F5F3] cursor-pointer rounded-lg text-[#3F3A3D] select-none"
                onClick={(e) => toggleExpand(category.id, e)}
              >
                {expandedItems.has(category.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                {expandedItems.has(category.id) ? <FolderOpen className="h-4 w-4 text-rose-400" /> : <Folder className="h-4 w-4 text-rose-400" />}
                <span data-i18n-skip="true" className="font-bold text-sm">{category.name}</span>
              </div>

              {expandedItems.has(category.id) && (
                <div className="pl-6 space-y-1">
                  {category.lines.map(line => (
                    <div key={line.id} className="space-y-1">
                      <div
                        className="flex items-center space-x-2 p-2 hover:bg-[#F8F5F3] cursor-pointer rounded-lg text-[#5D565A] select-none"
                        onClick={(e) => toggleExpand(line.id, e)}
                      >
                        {expandedItems.has(line.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        {expandedItems.has(line.id) ? <FolderOpen className="h-4 w-4 text-emerald-400" /> : <Folder className="h-4 w-4 text-emerald-400" />}
                        <span data-i18n-skip="true" className="font-medium text-sm">{line.name}</span>
                      </div>

                      {expandedItems.has(line.id) && (
                        <div className="pl-6 space-y-0.5">
                          {line.products.map(product => (
                            <div
                              key={product.id}
                              onClick={() => setSelectedProductId(product.id)}
                              className={`flex items-center space-x-2 p-2 cursor-pointer rounded-lg text-sm transition-all ${
                                selectedProductId === product.id
                                  ? 'bg-rose-50 text-rose-700 font-bold'
                                  : 'text-[#766F73] hover:bg-[#F8F5F3] hover:text-[#242124]'
                              }`}
                            >
                              <Package className={`h-4 w-4 ${selectedProductId === product.id ? 'text-rose-500' : 'text-[#9A9396]'}`} />
                              <span data-i18n-skip="true" className="truncate">{product.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 bg-[#F7F3F1] flex flex-col relative overflow-hidden">
        {showToast && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 ${toastTone === 'warning' ? 'bg-[#B9822B]' : 'bg-[#3B8F72]'}`}>
            {toastTone === 'warning' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
        )}

        {selectedProduct ? (
          <>
            <div className="p-6 border-b border-[#E5DED8] bg-white flex items-center justify-between shrink-0">
              <div>
                <p data-i18n-skip="true" className="text-[10px] uppercase font-bold text-[#9A9396] tracking-wider mb-1 flex items-center">
                  {breadcrumbs.join(' / ')}
                </p>
                <h1 className="text-xl font-bold text-[#242124]">编辑产品：{selectedProduct.name}</h1>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPreviewOpen(true)}
                  className="border-[#E5DED8] bg-white text-[#3F3A3D] hover:bg-[#F8F5F3]"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>预览效果</span>
                </Button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm font-bold text-sm transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>保存产品库</span>
                </button>
                <EffectiveStatusBadge status={selectedProduct.effectiveStatus} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-4xl mx-auto space-y-6">
                <PracticePromptNotice />

                {/* Product Basic Info */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E9E4DF]">
                  <h3 className="text-sm font-bold text-[#242124] mb-5 flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-rose-500" />
                    产品基础信息
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#766F73] mb-2">产品名称</label>
                      <input
                        type="text"
                        value={selectedProduct.name}
                        onChange={(e) => handleUpdateProduct('name', e.target.value)}
                        className="w-full px-4 py-2 border border-[#E5DED8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-shadow font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#766F73] mb-2">产品卖点 / 介绍</label>
                      <textarea
                        value={selectedProduct.description}
                        onChange={(e) => handleUpdateProduct('description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-[#E5DED8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-shadow resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Image */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E9E4DF]">
                  <h3 className="text-sm font-bold text-[#242124] mb-5 flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2 text-[#3B8F72]" />
                    产品图配图
                  </h3>
                  <div className="flex flex-col lg:flex-row border border-[#E5DED8] rounded-xl overflow-hidden bg-[#F8F5F3]/50">
                    <div className="lg:w-[360px] bg-slate-100 flex items-center justify-center shrink-0 border-b lg:border-b-0 lg:border-r border-[#E5DED8] p-4">
                      <div className="w-full max-w-[320px] rounded-2xl bg-slate-900 p-1.5 shadow-sm">
                        <div className="overflow-hidden rounded-xl bg-white">
                          <div className="flex h-5 items-center justify-between px-3 text-[8px] font-bold text-[#9A9396]">
                            <span>9:41</span>
                            <span>SalesBoost AI</span>
                          </div>
                          <div className="relative aspect-square bg-slate-100 overflow-hidden">
                            {selectedProduct.imageUrl ? (
                              <img src={selectedProduct.imageUrl} alt="Product cover" className="w-full h-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-[#9A9396]">
                                <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                <span className="text-xs">移动端方形头图预览</span>
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/55 to-transparent px-3 pb-3 pt-8">
                              <p data-i18n-skip="true" className="text-[10px] font-bold text-white line-clamp-1">{selectedProduct.name}</p>
                              <p className="text-[8px] text-white/75">Training cover image</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-center space-y-4">
                      <div>
                        <p className="text-sm font-medium text-[#3F3A3D]">用于移动端培训详情页顶部头图，展示产品实物、使用场景或主视觉</p>
                        <ul className="text-xs text-[#766F73] mt-2 space-y-1 list-disc pl-4">
                          <li>建议尺寸：1080x1080 px，比例 1:1</li>
                          <li>主体内容居中，四周预留安全边距，避免文字或 Logo 贴边</li>
                          <li>图片会以 cover 方式裁切，重要信息不要放在边缘</li>
                          <li>支持的格式：JPG, PNG, WebP</li>
                          <li>大小限制：不得超过 10MB，上传后可二次压缩</li>
                        </ul>
                      </div>
                      <div className="flex items-center space-x-3 pt-2">
                        <Button variant="outline" size="sm" className="h-9 relative overflow-hidden">
                          <Upload className="h-4 w-4 mr-1.5 text-[#766F73]" />
                          <span>上传头图</span>
                          <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                handleUpdateProduct('imageUrl', url);
                              }
                            }}
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quotes */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E9E4DF]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-rose-500" />
                      <h3 className="text-sm font-bold text-[#242124]">产品销售金句库</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => setMaterialReferenceOpen(true)} variant="outline" size="sm" className="h-8 border-[#D8DEFF] bg-[#EEF1FF] text-[#515BCB] hover:bg-[#E1E7FF]">
                        <LibraryBig className="h-4 w-4 mr-1" />
                        引用素材
                      </Button>
                      <Button onClick={handleGenerateQuotes} variant="secondary" size="sm" className={`h-8 ${aiActionTone.buttonClass}`}>
                        <Wand2 className={`h-4 w-4 mr-1 ${aiActionTone.iconClass}`} />
                        AI 一键生成金句
                      </Button>
                      <Button onClick={handleAddQuote} variant="outline" size="sm" className="h-8 shadow-sm">
                        <Plus className="h-4 w-4 mr-1" />
                        新增金句
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedProduct.quotes.map((quote, index) => (
                      <div key={quote.id} className="p-4 rounded-xl border border-[#E5DED8] bg-[#F8F5F3]/50 relative group">
                        <div className="absolute left-4 top-4 bg-rose-100 text-rose-700 font-bold text-xs h-6 w-6 flex items-center justify-center rounded-md">
                          {index + 1}
                        </div>
                        <div className="pl-10 space-y-3 mt-2">
                          <div>
                            <label className="block text-xs font-bold text-[#766F73] mb-1">具体金句内容</label>
                            <textarea
                              value={quote.text}
                              onChange={(e) => handleUpdateQuote(quote.id, 'text', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-1.5 border border-[#E5DED8] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white font-medium resize-none"
                              placeholder="输入推荐给顾客的销售话术..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#766F73] mb-1 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1 text-[#B9822B]" />
                              金句使用提示 (场景、受众等)
                            </label>
                            <input
                              type="text"
                              value={quote.hint}
                              onChange={(e) => handleUpdateQuote(quote.id, 'hint', e.target.value)}
                              className="w-full px-3 py-1.5 border border-[#E5DED8] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#B9822B]/20 focus:border-[#B9822B] bg-white"
                              placeholder="例如：适合在顾客抱怨皮肤干燥脱皮时使用..."
                            />
                          </div>
                          {quote.sourceReferences?.length ? (
                            <div className="rounded-md border border-[#D8DEFF] bg-[#F7F8FF] px-3 py-2">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#515BCB]"><Link2 className="h-3.5 w-3.5" />素材库来源</div>
                              {quote.sourceReferences.map((source) => (
                                <div key={source.id} className="mt-1.5 text-[11px] leading-relaxed text-[#766F73]">{source.materialTitle} · v{source.materialVersion} · 证据 {source.evidenceRanges.map((range) => `${Math.floor(range.startSec / 60)}:${String(range.startSec % 60).padStart(2, '0')} - ${Math.floor(range.endSec / 60)}:${String(range.endSec % 60).padStart(2, '0')}`).join('，')}</div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <button
                          onClick={() => handleRemoveQuote(quote.id)}
                          className="absolute right-4 top-4 p-1 rounded-md text-[#9A9396] hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {selectedProduct.quotes.length === 0 && (
                      <div className="text-center py-6 bg-[#F8F5F3] rounded-xl border border-dashed border-[#E5DED8] text-[#766F73] text-sm">
                        暂无销售金句，请点击右上角新增
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#9A9396]">
            <Package className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-medium text-[#766F73]">在左侧选择一个产品查看金句</p>
          </div>
        )}

        <QuoteReadAlongPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          product={selectedProductForPreview}
        />
        <MaterialReferenceDialog
          open={materialReferenceOpen}
          onOpenChange={setMaterialReferenceOpen}
          target="quote"
          quoteTargetLabel={selectedProduct?.name}
          onApply={applyMaterialReference}
        />
      </div>
    </div>
  );
}

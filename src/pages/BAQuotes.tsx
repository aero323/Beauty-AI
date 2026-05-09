import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, Save, Settings, MessageSquare, AlertCircle, ImageIcon, Upload, Wand2, ChevronRight, ChevronDown, Package, Folder, FolderOpen } from 'lucide-react';
import { Button } from '../components/ui/button';
import { aiActionTone } from '../lib/visualTones';

interface Quote {
  id: string;
  text: string;
  hint: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  quotes: Quote[];
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
            quotes: [
              { id: 'q1', text: '“这瓶面霜就像给肌肤穿上了一层隐形的拉链防风衣，特别适合现在这种容易换季泛红的天气。”', hint: '强调像衣服一样的保护感，适合秋冬/换季' },
              { id: 'q2', text: '“里面有黄金配比的神经酰胺，不是表面浮油，是真的能吃进皮肤里修护底子的。”', hint: '强调成分，针对顾客觉得其他面霜浮油的痛点' }
            ]
          },
          {
            id: 'p2',
            name: 'BS 急救舒缓精华',
            description: '高频次安抚敏感泛红，质地轻薄。',
            quotes: []
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
            quotes: []
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
            quotes: []
          }
        ]
      }
    ]
  }
];

export function BAQuotes() {
  const [categories, setCategories] = useState<ProductCategory[]>(INITIAL_DATA);
  // Store expanded state for categories and lines
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['c1', 'l1']));
  const [selectedProductId, setSelectedProductId] = useState<string>('p1');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('产品库已保存');
  const [toastTone, setToastTone] = useState<'success' | 'warning'>('success');

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
          prod.id === selectedProductId ? { ...prod, [field]: value } : prod
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
    showFeedback('产品库已保存', 'success', 3000);
  };

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
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm font-bold text-sm transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>保存产品库</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-4xl mx-auto space-y-6">

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
                            <span>BA Training</span>
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
      </div>
    </div>
  );
}

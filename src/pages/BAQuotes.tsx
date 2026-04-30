import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, Save, Settings, MessageSquare, AlertCircle, ImageIcon, Upload, Wand2, ChevronRight, ChevronDown, Package, Folder, FolderOpen } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

interface Quote {
  id: string;
  text: string;
  hint: string;
  scope?: string;
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
              { id: 'q1', text: '“这瓶面霜就像给肌肤穿上了一层隐形的拉链防风衣，特别适合现在这种容易换季泛红的天气。”', hint: '强调像衣服一样的保护感，适合秋冬/换季', scope: 'HQ' },
              { id: 'q2', text: '“里面有黄金配比的神经酰胺，不是表面浮油，是真的能吃进皮肤里修护底子的。”', hint: '强调成分，针对顾客觉得其他面霜浮油的痛点', scope: '雅加达区' }
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

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex h-full bg-[#FAF9F8] overflow-hidden pt-2 rounded-xl border border-slate-200">
      {/* Left Sidebar - Hierarchy Tree */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between z-10 bg-white">
          <h2 className="font-bold text-slate-800 tracking-tight">产品与金句库</h2>
          <button 
            className="flex items-center justify-center p-1.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            title="添加品类或产品 (开发中)"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {categories.map(category => (
            <div key={category.id} className="space-y-1">
              <div 
                className="flex items-center space-x-2 p-2 hover:bg-slate-50 cursor-pointer rounded-lg text-slate-700 select-none"
                onClick={(e) => toggleExpand(category.id, e)}
              >
                {expandedItems.has(category.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                {expandedItems.has(category.id) ? <FolderOpen className="h-4 w-4 text-indigo-400" /> : <Folder className="h-4 w-4 text-indigo-400" />}
                <span className="font-bold text-sm">{category.name}</span>
              </div>
              
              {expandedItems.has(category.id) && (
                <div className="pl-6 space-y-1">
                  {category.lines.map(line => (
                    <div key={line.id} className="space-y-1">
                      <div 
                        className="flex items-center space-x-2 p-2 hover:bg-slate-50 cursor-pointer rounded-lg text-slate-600 select-none"
                        onClick={(e) => toggleExpand(line.id, e)}
                      >
                        {expandedItems.has(line.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        {expandedItems.has(line.id) ? <FolderOpen className="h-4 w-4 text-emerald-400" /> : <Folder className="h-4 w-4 text-emerald-400" />}
                        <span className="font-medium text-sm">{line.name}</span>
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
                                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                              }`}
                            >
                              <Package className={`h-4 w-4 ${selectedProductId === product.id ? 'text-rose-500' : 'text-slate-400'}`} />
                              <span className="truncate">{product.name}</span>
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
      <div className="flex-1 bg-[#FAF9F8] flex flex-col relative overflow-hidden">
        {showToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-bold">保存成功</span>
          </div>
        )}

        {selectedProduct ? (
          <>
            <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center">
                  {breadcrumbs.join(' / ')}
                </p>
                <h1 className="text-xl font-bold text-slate-800">编辑产品：{selectedProduct.name}</h1>
              </div>
              <button 
                onClick={handleSave}
                className="flex items-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-bold text-sm transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>保存产品库</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Product Basic Info */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-indigo-500" />
                    产品基础信息
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">产品名称</label>
                      <input 
                        type="text" 
                        value={selectedProduct.name}
                        onChange={(e) => handleUpdateProduct('name', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">产品卖点 / 介绍</label>
                      <textarea 
                        value={selectedProduct.description}
                        onChange={(e) => handleUpdateProduct('description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Image */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2 text-emerald-500" />
                    产品图配图
                  </h3>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                    <div className="w-48 h-48 bg-slate-100 flex items-center justify-center shrink-0 border-r border-slate-200 relative overflow-hidden p-2">
                      {selectedProduct.imageUrl ? (
                        <img src={selectedProduct.imageUrl} alt="Product" className="w-full h-full object-cover rounded-lg shadow-sm" />
                      ) : (
                        <div className="text-center text-slate-400 p-4">
                          <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <span className="text-xs">暂无配图</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-center space-y-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700">可用于在培训时向 BA 展示产品的实物外观或使用场景</p>
                        <ul className="text-xs text-slate-500 mt-2 space-y-1 list-disc pl-4">
                          <li>建议尺寸：800x800 px，比例 1:1</li>
                          <li>支持的格式：JPG, PNG, WebP</li>
                          <li>大小限制：不得超过 2MB</li>
                        </ul>
                      </div>
                      <div className="flex items-center space-x-3 pt-2">
                        <Button variant="outline" size="sm" className="h-9 relative overflow-hidden">
                          <Upload className="h-4 w-4 mr-1.5 text-slate-500" />
                          <span>上传图片</span>
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
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-rose-500" />
                      <h3 className="text-sm font-bold text-slate-800">产品销售金句库</h3>
                    </div>
                    <Button onClick={handleAddQuote} variant="outline" size="sm" className="h-8 shadow-sm">
                      <Plus className="h-4 w-4 mr-1" />
                      新增金句
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedProduct.quotes.map((quote, index) => (
                      <div key={quote.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 relative group">
                        <div className="absolute left-4 top-4 bg-rose-100 text-rose-700 font-bold text-xs h-6 w-6 flex items-center justify-center rounded-md">
                          {index + 1}
                        </div>
                        <div className="absolute right-12 top-4 flex gap-1">
                          {quote.scope && quote.scope !== 'HQ' && (
                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none px-1.5 py-0 h-5 text-[9px] cursor-pointer" onClick={() => handleUpdateQuote(quote.id, 'scope', 'HQ')}>{quote.scope}</Badge>
                          )}
                        </div>
                        <div className="pl-10 space-y-3 mt-2">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">具体金句内容</label>
                            <textarea 
                              value={quote.text}
                              onChange={(e) => handleUpdateQuote(quote.id, 'text', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white font-medium resize-none"
                              placeholder="输入推荐给顾客的销售话术..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                              金句使用提示 (场景、受众等)
                            </label>
                            <input 
                              type="text" 
                              value={quote.hint}
                              onChange={(e) => handleUpdateQuote(quote.id, 'hint', e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                              placeholder="例如：适合在顾客抱怨皮肤干燥脱皮时使用..."
                            />
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveQuote(quote.id)}
                          className="absolute right-4 top-4 p-1 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {selectedProduct.quotes.length === 0 && (
                      <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
                        暂无销售金句，请点击右上角新增
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Package className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-medium text-slate-500">在左侧选择一个产品查看金句</p>
          </div>
        )}
      </div>
    </div>
  );
}

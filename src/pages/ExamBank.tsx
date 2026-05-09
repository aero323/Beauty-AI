import React, { useState } from 'react';
import { Search, Filter, Database, Edit, Trash2, Library, CheckCircle, Replace, FileText, ChevronDown, ChevronUp, Wand2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { aiActionTone } from '../lib/visualTones';

const INITIAL_BANK = [
  {
    id: 'b1',
    type: 'SingleChoice',
    content: 'Lumina新品精华的核心成分是什么？',
    options: ['A. 烟酰胺', 'B. 神经酰胺', 'C. 玻色因', 'D. 高浓度维他命B5'],
    answer: 'D',
    sourceFile: 'Lumina_新品精华_培训版.pdf',
    tags: ['成分', '新品']
  },
  {
    id: 'b2',
    type: 'SingleChoice',
    content: '下列哪一项是Lumina新品精华的主要修护成分？',
    options: ['A. 烟酰胺', 'B. 维他命C', 'C. 玻色因', 'D. 维他命B5'],
    answer: 'D',
    sourceFile: 'Lumina_Sales_Deck.pptx',
    tags: ['成分']
  },
  {
    id: 'b3',
    type: 'TrueFalse',
    content: 'Lumina新品精华适合激光术后使用。',
    options: ['正确', '错误'],
    answer: '正确',
    sourceFile: 'Lumina_新品精华_培训版.pdf',
    tags: ['适用人群', '新品']
  },
];

export function ExamBank() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [bank, setBank] = useState(INITIAL_BANK);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');
  const [expandedQId, setExpandedQId] = useState<string | null>(null);

  const [tagDialog, setTagDialog] = useState(false);
  const [batchTags, setBatchTags] = useState('');

  const openTagDialog = () => {
    setBatchTags('');
    setTagDialog(true);
  };

  const handleAITags = () => {
    setBatchTags('Lumina新品, 成分解析, 销售话术');
    setToast('AI 已自动生成推荐标签');
    setTimeout(() => setToast(''), 2000);
  };

  const saveBatchTags = () => {
    const newTags = batchTags.split(/[,，]/).map(t => t.trim()).filter(Boolean);
    if (newTags.length === 0) return;

    setBank(prev => prev.map(q => {
      if (selectedIds.has(q.id)) {
        return { ...q, tags: Array.from(new Set([...q.tags, ...newTags])) };
      }
      return q;
    }));
    setTagDialog(false);
    setSelectedIds(new Set());
    setToast('批量标签已成功应用');
    setTimeout(() => setToast(''), 2000);
  };

  // Simulating duplicate detecting between b1 and b2
  const duplicates = [
    { targetId: 'b2', similarToId: 'b1', matchPercent: 85 }
  ];

  const handleResolveDuplicate = (keepId: string, deleteId: string) => {
    setBank(prev => prev.filter(q => q.id !== deleteId));
    setToast('成功合并重复题目！');
    setTimeout(() => {
      setToast('');
      setShowDuplicates(false);
    }, 2000);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredBank.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBank.map(q => q.id)));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    setBank(prev => prev.filter(q => !selectedIds.has(q.id)));
    setSelectedIds(new Set());
    setToast(`已删除 ${selectedIds.size} 道题目`);
    setTimeout(() => setToast(''), 2000);
  };

  const filteredBank = bank.filter(q => {
    const matchesSearch = q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.tags.some(t => t.includes(searchTerm)) ||
      q.sourceFile.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || q.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      {toast && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-[#3B8F72] text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      {/* Header operations */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1F1C1F] flex items-center">
            <Library className="h-6 w-6 mr-2 text-rose-600" />题库管理
          </h1>
          <p className="text-[#766F73] mt-1 text-sm">统一管理通过生成、录入的考核试题</p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9A9396]" />
            <input
              type="text"
              placeholder="搜索题目、标签或来源..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5DED8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
          <select
            className="px-3 py-2 bg-white border border-[#E5DED8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 shrink-0"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">全部题型</option>
            <option value="SingleChoice">单选题</option>
            <option value="MultipleChoice">多选题</option>
            <option value="TrueFalse">判断题</option>
          </select>
          <Button onClick={() => setShowDuplicates(true)} variant="secondary" className="shrink-0 bg-[#FFF7EA] text-[#8B621F] hover:bg-[#F7E6C8] hover:text-[#6F4B18] border-none">
            <Replace className="h-4 w-4 mr-2" /> 排查重复题目
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pb-6">
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-100 rounded-lg shadow-sm text-sm mb-4 animate-in fade-in sticky top-0 z-10">
            <div className="flex items-center text-rose-700 font-medium">
              已选择 <span className="font-bold mx-1">{selectedIds.size}</span> 项
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={openTagDialog} variant="outline" size="sm" className="h-8 bg-white text-rose-600 border-rose-200 hover:bg-rose-100">
                <Edit className="h-4 w-4 mr-1.5" /> 批量编辑标签
              </Button>
              <Button onClick={handleBatchDelete} variant="outline" size="sm" className="h-8 bg-white text-red-500 border-red-200 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-1.5" /> 批量删除
              </Button>
            </div>
          </div>
        )}

        {/* List Header */}
        <div className="flex items-center justify-between px-3 py-2 text-xs font-bold text-[#766F73] uppercase tracking-wider mb-2 border-b border-[#E5DED8]">
          <div className="flex items-center space-x-3 flex-1 min-w-0 pr-4">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-rose-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              checked={filteredBank.length > 0 && selectedIds.size === filteredBank.length}
              onChange={toggleSelectAll}
            />
            <span className="w-6 text-center">序号</span>
            <span className="min-w-20 w-auto md:w-28">题型</span>
            <span className="flex-1">题干</span>
            <span className="w-32 hidden md:block">标签</span>
            <span className="w-48 hidden lg:block">来源文件</span>
          </div>
          <div className="w-24 shrink-0"></div>
        </div>

        {filteredBank.map((q, i) => (
          <div key={q.id} className="group flex items-center justify-between p-3 border border-[#E9E4DF] hover:border-[#E5DED8] bg-white hover:bg-[#F8F5F3] transition-all rounded-lg shadow-sm relative">
            <div className="flex items-center space-x-3 flex-1 min-w-0 pr-4">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-rose-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                checked={selectedIds.has(q.id)}
                onChange={() => toggleSelect(q.id)}
              />
              <span className="text-[#9A9396] font-medium text-sm w-6 text-center shrink-0">{i + 1}</span>
              <div className="min-w-20 w-auto md:w-28 shrink-0">
                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold whitespace-normal text-center leading-tight">
                  {q.type === 'SingleChoice' ? '单选题' : q.type === 'MultipleChoice' ? '多选题' : '判断题'}
                </Badge>
              </div>
              <div className="group/tooltip relative flex-1 min-w-0">
                <div data-i18n-skip="true" className="font-medium text-[#242124] text-sm truncate cursor-help cursor-pointer">
                  {q.content}
                </div>

                {/* Tooltip Content */}
                <div className="absolute left-0 top-full mt-2 hidden group-hover/tooltip:block z-50 w-96 bg-white border border-[#E5DED8] shadow-xl rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                  <div data-i18n-skip="true" className="font-bold text-[#242124] text-sm mb-3 whitespace-normal">
                    {q.content}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt) => (
                      <div key={opt} data-i18n-skip="true" className={`px-3 py-1.5 rounded-md text-xs border ${q.answer.includes(opt.charAt(0)) || opt === q.answer ? 'bg-[#EEF8F4] border-emerald-200 text-emerald-800 font-semibold' : 'bg-[#F8F5F3] border-[#E5DED8] text-[#5D565A]'}`}>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-32 shrink-0 hidden md:flex flex-wrap gap-1">
                {q.tags.map(t => <Badge key={t} data-i18n-skip="true" variant="secondary" className="text-[10px] bg-slate-100 text-[#5D565A] font-normal">{t}</Badge>)}
              </div>
              <div className="w-48 shrink-0 hidden lg:flex items-center text-xs text-[#766F73] truncate" title={q.sourceFile}>
                <FileText className="h-3 w-3 mr-1 shrink-0" />
                <span data-i18n-skip="true" className="truncate">{q.sourceFile}</span>
              </div>
            </div>

            <div className="w-24 flex items-center justify-end space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700" title="编辑">
                <Edit className="h-4 w-4" />
              </Button>
              <Button onClick={() => setBank(prev => prev.filter(b => b.id !== q.id))} variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600" title="删除">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {filteredBank.length === 0 && (
          <div className="text-center py-16 text-[#9A9396]">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>暂无符合条件的题目</p>
          </div>
        )}
      </div>

      <Dialog open={showDuplicates} onOpenChange={setShowDuplicates}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Replace className="h-5 w-5 mr-2 text-[#B9822B]" />
              发现高度相似的题目
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {duplicates.map(dup => {
              const q1 = bank.find(b => b.id === dup.similarToId);
              const q2 = bank.find(b => b.id === dup.targetId);
              if (!q1 || !q2) return null;

              return (
                <div key={dup.targetId} className="bg-[#F8F5F3] p-4 rounded-xl border border-[#E5DED8] space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-sm font-bold text-[#3F3A3D]">相似度检测</span>
                    <Badge className="bg-[#F7E6C8] text-[#8B621F] hover:bg-[#F7E6C8] font-bold border-none">
                      {dup.matchPercent}% 相似
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-rose-100 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
                      <CardContent className="p-4 pt-5">
                        <Badge variant="outline" className="mb-2">已有试题 (ID: {q1.id})</Badge>
                        <p data-i18n-skip="true" className="font-bold text-sm mb-2">{q1.content}</p>
                        <ul className="text-xs text-[#766F73] space-y-1 mb-4">
                          {q1.options.map(o => <li key={o} data-i18n-skip="true">{o}</li>)}
                        </ul>
                        <p className="text-xs text-[#3B8F72] font-medium">答案: <span data-i18n-skip="true">{q1.answer}</span></p>
                        <div className="mt-4 pt-4 border-t border-[#E9E4DF] text-center">
                          <Button onClick={() => handleResolveDuplicate(q1.id, q2.id)} variant="outline" size="sm" className="w-full border-rose-200 text-rose-700 hover:bg-rose-50">
                            保留此题并移除右侧
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-[#F2DEC0] shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-[#B9822B]"></div>
                      <CardContent className="p-4 pt-5">
                        <Badge variant="outline" className="mb-2 border-[#E8CCA0] text-[#8B621F]">新试题 (ID: {q2.id})</Badge>
                        <p data-i18n-skip="true" className="font-bold text-sm mb-2">{q2.content}</p>
                        <ul className="text-xs text-[#766F73] space-y-1 mb-4">
                          {q2.options.map(o => <li key={o} data-i18n-skip="true">{o}</li>)}
                        </ul>
                        <p className="text-xs text-[#3B8F72] font-medium">答案: <span data-i18n-skip="true">{q2.answer}</span></p>
                        <div className="mt-4 pt-4 border-t border-[#E9E4DF] text-center">
                          <Button onClick={() => handleResolveDuplicate(q2.id, q1.id)} variant="outline" size="sm" className="w-full border-[#E8CCA0] text-[#8B621F] hover:bg-[#FFF7EA]">
                            保留此题并移除左侧
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
            {duplicates.length === 0 && (
              <div className="text-center py-8 text-[#766F73]">目前没有发现重复或雷同题目。</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={tagDialog} onOpenChange={setTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              批量编辑标签
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-[#F8F5F3] p-3 rounded-lg border border-[#E9E4DF] mb-4">
              <p className="text-sm font-medium text-[#3F3A3D]">将为选中的 {selectedIds.size} 道题目应用标签</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-[#3F3A3D]">添加标签 (以逗号或空格分隔)</label>
                <Button onClick={handleAITags} variant="ghost" size="sm" className={`h-6 ${aiActionTone.ghostButtonClass}`}>
                  <Wand2 className={`h-3 w-3 mr-1 ${aiActionTone.iconClass}`} />
                  AI 自动推荐
                </Button>
              </div>
              <textarea
                value={batchTags}
                onChange={(e) => setBatchTags(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm border-slate-300 focus:ring-1 focus:ring-indigo-500 min-h-[80px]"
                placeholder="例如: 基础知识, 新品, Lumina"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagDialog(false)}>取消</Button>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={saveBatchTags}>
              应用标签
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

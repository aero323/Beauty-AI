import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, Tag, Settings, Link2 } from 'lucide-react';
import { QUESTION_TAXONOMY } from '../lib/questionBank';

const MOCK_CATEGORIES = QUESTION_TAXONOMY.productLines.map((line, index) => ({
  id: line.id,
  name: line.name,
  count: [42, 18, 5][index] || 0,
  sub: line.products.map(product => product.name),
}));

export function CategoryManage() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [newCat, setNewCat] = useState('');

  const handleAddCat = () => {
    if (!newCat.trim()) return;
    setCategories([
      ...categories,
      { id: `cat_${Date.now()}`, name: newCat, count: 0, sub: [] }
    ]);
    setNewCat('');
  };

  return (
    <div className="flex-1 flex flex-col pt-2 h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between mb-4">
         <div>
            <h2 className="text-xl font-bold text-[#1F1C1F]">全局品类与标签配置</h2>
            <p className="text-sm text-[#766F73] mt-1">管理业务分类体系，变更将自动同步至题库、知识图谱及所有业务课件内容</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0">
        <div className="col-span-2 space-y-6 flex flex-col h-full">
          <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] flex-1 overflow-hidden flex flex-col">
            <CardHeader className="p-5 border-b border-slate-50 bg-[#F8F5F3]/50">
               <CardTitle className="text-base font-bold flex items-center">
                 <Tag className="h-4 w-4 mr-2 text-rose-600" /> 一级分类管理
               </CardTitle>
            </CardHeader>
            <CardContent className="p-5 overflow-auto flex-1">
               <div className="space-y-4">
                 {categories.map(cat => (
                   <div key={cat.id} className="flex flex-col p-4 bg-white border border-[#E5DED8] rounded-xl hover:border-rose-200 transition-colors">
                     <div className="flex items-center justify-between mb-3">
                       <div data-i18n-skip="true" className="font-bold text-[#242124]">{cat.name}</div>
                       <div className="flex space-x-2">
                         <div className="flex items-center text-xs text-[#766F73] bg-slate-100 px-2 py-1 rounded font-medium">
                           <Link2 className="h-3 w-3 mr-1" /> 已关联 {cat.count} 项内容
                         </div>
                         <Button variant="outline" size="sm" className="h-6 text-xs px-2">编辑</Button>
                         <Button variant="outline" size="sm" className="h-6 text-xs px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50">删除</Button>
                       </div>
                     </div>
                     <div className="flex flex-wrap gap-2">
                       {cat.sub.map(s => (
                         <Badge data-i18n-skip="true" variant="outline" key={s} className="bg-[#F8F5F3] text-[#5D565A] font-normal">
                           {s}
                         </Badge>
                       ))}
                       <Badge variant="outline" className="border-dashed text-[#9A9396] bg-white hover:border-rose-300 hover:text-rose-600 cursor-pointer">
                         <Plus className="h-3 w-3 mr-1" /> 增加二级标签
                       </Badge>
                     </div>
                   </div>
                 ))}
               </div>
            </CardContent>
            <div className="p-4 border-t border-[#E9E4DF] bg-[#F8F5F3]/50 flex space-x-3">
               <Input
                 placeholder="输入新分类名称"
                 value={newCat}
                 onChange={e => setNewCat(e.target.value)}
                 className="flex-1 shadow-sm"
               />
               <Button onClick={handleAddCat} className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm shrink-0">
                 添加一级分类
               </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] bg-rose-50/30">
            <CardHeader className="p-5">
              <CardTitle className="text-base font-bold flex items-center">
                <Settings className="h-4 w-4 mr-2 text-rose-600" /> 同步规则设置
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <div className="bg-white p-3 rounded-lg border border-[#E5DED8] shadow-sm text-sm">
                <p className="font-bold text-[#242124] mb-1">强制关联约束</p>
                <p className="text-[#766F73] text-xs">所有新生成的课件或场景剧本必须至少关联一个二级标签。</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-[#E5DED8] shadow-sm text-sm">
                <p className="font-bold text-[#242124] mb-1">自动级联更新</p>
                <p className="text-[#766F73] text-xs">修改或合并标签名称时，底部所有历史内容将自动执行替换操作。</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

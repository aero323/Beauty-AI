import React, { useState } from 'react';
import { Database, RefreshCw, Play, Clock, Search, FileText, Tag, Filter, MoreVertical, Eye, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';

interface KnowledgeChunk {
  id: string;
  tags: string[];
  content: string;
  sourceFile: string;
  time: string;
  status: 'parsed' | 'parsing' | 'failed' | 'pending';
}

const MOCK_CHUNKS: KnowledgeChunk[] = [
  {
    id: '1',
    tags: ['护肤', '抗老', 'Barrier Shield'],
    content: 'Barrier Shield系列核心成分为神经酰胺，具有重塑肌肤屏障、舒缓泛红的功效，特别适合敏感和受损肌肤。',
    sourceFile: 'Lumina_2023新品全线成分手册.pdf',
    time: '2023-10-24 14:30',
    status: 'parsed'
  },
  {
    id: '2',
    tags: ['销售话术', '竞品对比', 'Lbrand'],
    content: '当客户提及Lbrand的小棕瓶时，重点强调我们的Radiance精华吸收速度快3倍，且在热带气候下不油腻。',
    sourceFile: 'Q4_竞品话术应对SOP.docx',
    time: '2023-10-24 14:00',
    status: 'parsed'
  },
  {
    id: '3',
    tags: ['成分', '防晒', 'Sunbrella'],
    content: '结合了物理和化学防晒的双重优势，SPF50 PA+++，提供长达8小时的全波段紫外线防护。',
    sourceFile: '防晒系列_研发内部资料.pptx',
    time: '2023-10-23 09:15',
    status: 'parsed'
  },
  {
    id: '4',
    tags: ['彩妆', '底妆', '技巧'],
    content: '使用粉底液前，建议先配合使用保湿隔离霜打底，可使底妆服帖度提升50%，避免卡粉问题。',
    sourceFile: '2024早八底妆技巧培训.pdf',
    time: '2023-10-20 16:45',
    status: 'pending'
  }
];

export function KnowledgeGraph() {
  const [chunks, setChunks] = useState<KnowledgeChunk[]>(MOCK_CHUNKS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('2023-10-24 15:00:00');
  const [parseProgress, setParseProgress] = useState(0);

  const [editingChunk, setEditingChunk] = useState<KnowledgeChunk | null>(null);
  const [editTagsStr, setEditTagsStr] = useState('');
  const [editContent, setEditContent] = useState('');

  const openEditModal = (chunk: KnowledgeChunk) => {
    setEditingChunk(chunk);
    setEditTagsStr(chunk.tags.join(', '));
    setEditContent(chunk.content);
  };

  const handleSaveEdit = () => {
    if (!editingChunk) return;
    setChunks(prev => prev.map(c => 
      c.id === editingChunk.id 
        ? { ...c, content: editContent, tags: editTagsStr.split(',').map(s => s.trim()).filter(s => s) } 
        : c
    ));
    setEditingChunk(null);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleString('zh-CN', { hour12: false }));
    }, 2000);
  };

  const handleParse = () => {
    setIsParsing(true);
    setParseProgress(0);
    
    // Simulate parsing progress
    const interval = setInterval(() => {
      setParseProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsParsing(false);
            setChunks(prev => prev.map(c => c.status === 'pending' ? { ...c, status: 'parsed' } : c));
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Header section with buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
            <Database className="h-6 w-6 mr-3 text-indigo-600" />
            企业知识图谱
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center">
            <Clock className="h-4 w-4 mr-1.5 opacity-70" />
            最近同步时间：{lastSyncTime}
          </p>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button 
            onClick={handleSync}
            disabled={isSyncing || isParsing}
            className={`flex-1 md:flex-none items-center justify-center space-x-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-50 flex`}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isSyncing ? '正在拉取...' : '拉取同步'}</span>
          </button>
          
          <button 
            onClick={handleParse}
            disabled={isSyncing || isParsing}
            className={`flex-1 md:flex-none items-center justify-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm flex disabled:opacity-50`}
          >
            {isParsing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{isParsing ? '解析中' : '开始解析'}</span>
          </button>
        </div>
      </div>

      {isParsing && (
        <Card className="border-indigo-100 bg-indigo-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
               <span className="text-sm font-bold text-indigo-800">正在知识切片与入库...</span>
               <span className="text-sm font-bold text-indigo-600">{parseProgress}%</span>
            </div>
            <Progress value={parseProgress} className="h-2 bg-indigo-100" indicatorClassName="bg-indigo-600" />
          </CardContent>
        </Card>
      )}

      {/* List section */}
      <Card>
        <CardHeader className="pb-0 pt-6 px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-lg">已解析知识切片 ({chunks.length})</CardTitle>
            <div className="flex items-center space-x-2 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="搜索内容或标签..." 
                   className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow"
                 />
               </div>
               <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
                 <Filter className="h-4 w-4" />
               </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-slate-600">
               <thead className="text-xs text-slate-500 bg-slate-50/80 uppercase font-bold border-b border-slate-100">
                 <tr>
                   <th className="px-4 py-3 rounded-tl-lg">序号</th>
                   <th className="px-4 py-3">知识标签</th>
                   <th className="px-4 py-3 min-w-[300px]">知识切片详情</th>
                   <th className="px-4 py-3">来源文件名</th>
                   <th className="px-4 py-3">时间</th>
                   <th className="px-4 py-3">状态</th>
                   <th className="px-4 py-3 rounded-tr-lg text-right">操作</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {chunks.map((chunk, index) => (
                   <tr key={chunk.id} className="hover:bg-slate-50/50 transition-colors group">
                     <td className="px-4 py-4 font-medium text-slate-400">{index + 1}</td>
                     <td className="px-4 py-4">
                       <div className="flex flex-wrap gap-1">
                         {chunk.tags.map(tag => (
                           <Badge key={tag} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium">
                             {tag}
                           </Badge>
                         ))}
                       </div>
                     </td>
                     <td className="px-4 py-4">
                       <p className="line-clamp-2 text-slate-700 leading-relaxed font-medium">
                         {chunk.content}
                       </p>
                     </td>
                     <td className="px-4 py-4">
                       <div className="flex items-center space-x-2 text-slate-600">
                         <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                         <span className="truncate max-w-[150px]" title={chunk.sourceFile}>{chunk.sourceFile}</span>
                       </div>
                     </td>
                     <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500">
                       {chunk.time}
                     </td>
                     <td className="px-4 py-4">
                       {chunk.status === 'parsed' ? (
                         <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                           已解析
                         </span>
                       ) : chunk.status === 'pending' ? (
                         <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                           待解析
                         </span>
                       ) : (
                         <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                           解析失败
                         </span>
                       )}
                     </td>
                     <td className="px-4 py-4 text-right">
                       <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="查看详情">
                           <Eye className="h-4 w-4" />
                         </button>
                         <button onClick={() => openEditModal(chunk)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="编辑">
                           <Edit className="h-4 w-4" />
                         </button>
                         <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="删除">
                           <Trash2 className="h-4 w-4" />
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingChunk} onOpenChange={(open) => !open && setEditingChunk(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>编辑知识切片</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">标签 (以逗号分隔)</label>
              <input 
                type="text" 
                value={editTagsStr} 
                onChange={e => setEditTagsStr(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">知识切片详情</label>
              <Textarea 
                rows={6}
                value={editContent} 
                onChange={e => setEditContent(e.target.value)}
                className="w-full resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingChunk(null)}>
              取消
            </Button>
            <Button onClick={handleSaveEdit} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              发布知识
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

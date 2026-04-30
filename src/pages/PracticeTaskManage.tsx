import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Plus, Clock, Target, Calendar, CheckCircle2, FileText, Bot, MessageSquareText, TextSelect, Users, CheckCircle, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

const MOCK_AVATARS = [
  { id: 'a1', title: 'Ibu Nisa (VIP)' },
  { id: 'a2', title: 'Rina (Ingredient Geek)' },
];

const MOCK_SCRIPTS = [
  { id: 's1', title: '双萃精华促单话术' },
  { id: 's2', title: '敏感肌换季安抚' },
];

const MOCK_QUOTES = [
  { id: 'q1', title: '经典王牌：水油双泵黄金比例' },
  { id: 'q2', title: '异议处理：网上比专柜便宜' },
];

const MOCK_PRACTICE_TASKS = [
  {
    id: 'pt1',
    title: '11月每日打卡：双萃冲刺陪练',
    status: '进行中',
    publishTime: '2023-11-01',
    deadline: '2023-11-30',
    target: '全国直营门店BA',
    frequency: '每日完成 1 次',
    items: {
      avatars: ['a1'],
      scripts: ['s1'],
      quotes: ['q1']
    },
    progress: 58,
    targetCount: 1428,
    completedCount: 828,
    scope: '全国',
  },
  {
    id: 'pt2',
    title: '新功能实战：场景剧本每周通关',
    status: '已结束',
    publishTime: '2023-10-01',
    deadline: '2023-10-31',
    target: '华东区BA',
    frequency: '每周完成 3 次',
    items: {
      avatars: ['a2'],
      scripts: ['s1', 's2'],
      quotes: []
    },
    progress: 88,
    targetCount: 350,
    completedCount: 308,
    scope: '全国',
  },
  {
    id: 'pt3',
    title: '南区特定客诉处理专项',
    status: '进行中',
    publishTime: '2023-11-15',
    deadline: '2023-12-15',
    target: '南区所有门店BA',
    frequency: '每周完成 2 次',
    items: {
      avatars: ['a1'],
      scripts: ['s2'],
      quotes: []
    },
    progress: 15,
    targetCount: 300,
    completedCount: 45,
    scope: '区域',
    region: '南区',
  }
];

const MOCK_CANDIDATES = [
  { id: 'BA001', name: 'Siti Aminah', store: 'Jakarta Grand Indonesia', status: '已达标' },
  { id: 'BA002', name: 'Budi Santoso', store: 'Jakarta Plaza Senayan', status: '练习中' },
  { id: 'BA003', name: 'Ayu Lestari', store: 'Surabaya Tunjungan Plaza', status: '未开始' },
  { id: 'BA004', name: 'Rizky Pratama', store: 'Bali Beachwalk', status: '已达标' },
  { id: 'BA005', name: 'Dewi Sartika', store: 'Bandung Trans Studio', status: '练习中' },
  { id: 'BA006', name: 'Agung Setiawan', store: 'Medan Centre Point', status: '已达标' },
  { id: 'BA007', name: 'Putri Maharani', store: 'Yogyakarta Hartono Mall', status: '练习中' },
];

export function PracticeTaskManage({ isReadOnly = false, userRole }: { isReadOnly?: boolean, userRole?: string }) {
  const [tasks, setTasks] = useState(MOCK_PRACTICE_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(MOCK_PRACTICE_TASKS[0].id);
  const [createDialog, setCreateDialog] = useState(false);
  const [detailTask, setDetailTask] = useState<any>(null);

  const targets = (userRole === 'Regional Training Manager' || userRole === 'Regional Trainer')
    ? ['雅加达南区所有门店 BA', '本区域店长', '本区域新入职员工']
    : ['全国所有门店 BA', '华北区区域经理', '华东区店长', '入职不满3个月的新人'];

  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  
  return (
    <div className="flex h-full bg-[#FAF9F8] overflow-hidden pt-2 rounded-xl border border-slate-200">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between z-10 bg-white">
          <h2 className="font-bold text-slate-800 tracking-tight">练习任务列表</h2>
          {!isReadOnly && (
            <Button variant="ghost" size="sm" className="h-8 px-2 text-indigo-600 hover:bg-indigo-50" onClick={() => setCreateDialog(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                selectedTaskId === task.id
                  ? 'bg-indigo-50/50 border-indigo-200 shadow-sm'
                  : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                   <Badge variant="outline" className={`text-[10px] py-0 border-transparent ${task.status === '进行中' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                     {task.status}
                   </Badge>
                   <Badge variant="outline" className={`text-[10px] py-0 ${task.scope === '全国' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                     {task.scope === '区域' && task.region ? task.region : '全国'}
                   </Badge>
                 </div>
              </div>
              <h3 className={`font-bold text-sm mb-2 line-clamp-2 leading-snug ${
                selectedTaskId === task.id ? 'text-indigo-900' : 'text-slate-800'
              }`}>
                {task.title}
              </h3>
              <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-medium font-mono">
                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {task.frequency}</span>
                <span>{task.progress}% 达标</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col flex-wrap bg-slate-50/50">
        {selectedTask ? (
          <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
            <div className="p-8 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                   <Badge variant="outline" className={`${selectedTask.status === '进行中' ? 'border-amber-200 text-amber-600 bg-amber-50' : 'border-slate-200 text-slate-500 bg-slate-50'}`}>
                     {selectedTask.status}
                   </Badge>
                   <Badge variant="outline" className={`${selectedTask.scope === '全国' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                     {selectedTask.scope === '区域' && selectedTask.region ? selectedTask.region : '全国'}
                   </Badge>
                 </div>
                 <div className="flex space-x-2">
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className="h-8"
                     disabled={(userRole === 'Regional Training Manager' || userRole === 'Regional Trainer') && selectedTask.scope === '全国'}
                   >
                     停用任务
                   </Button>
                   <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-none" onClick={() => setDetailTask(selectedTask)}>查看完成明细</Button>
                 </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">{selectedTask.title}</h1>
              
              <div className="grid grid-cols-4 gap-6 mt-6">
                 <div className="flex flex-col">
                   <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 flex items-center"><Target className="w-3 h-3 mr-1" /> 分发对象</span>
                   <span className="text-sm font-medium text-slate-800">{selectedTask.target}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 flex items-center"><Clock className="w-3 h-3 mr-1" /> 练习频次</span>
                   <span className="text-sm font-medium text-slate-800">{selectedTask.frequency}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 flex items-center"><Calendar className="w-3 h-3 mr-1" /> 任务周期</span>
                   <span className="text-xs font-medium text-slate-800">{selectedTask.publishTime} 至 {selectedTask.deadline}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> 整体达标率</span>
                   <span className="text-sm font-bold text-amber-600">{selectedTask.progress}%</span>
                 </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
               <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                 包含的训练资产
               </h3>
               <div className="grid grid-cols-2 gap-4">
                 
                 {selectedTask.items.avatars.length > 0 && (
                   <Card className="border-slate-200">
                     <CardContent className="p-4">
                       <div className="flex items-center text-xs font-bold text-emerald-600 mb-3"><Bot className="w-4 h-4 mr-1.5" /> 指定数字人顾客 ({selectedTask.items.avatars.length})</div>
                       <ul className="space-y-2">
                         {selectedTask.items.avatars.map(id => {
                           const c = MOCK_AVATARS.find(x => x.id === id);
                           return <li key={id} className="text-sm font-medium text-slate-700 bg-slate-50 p-2 rounded-md">{c?.title}</li>
                         })}
                       </ul>
                     </CardContent>
                   </Card>
                 )}

                 {selectedTask.items.scripts.length > 0 && (
                   <Card className="border-slate-200">
                     <CardContent className="p-4">
                       <div className="flex items-center text-xs font-bold text-blue-600 mb-3"><MessageSquareText className="w-4 h-4 mr-1.5" /> 指定场景剧本 ({selectedTask.items.scripts.length})</div>
                       <ul className="space-y-2">
                         {selectedTask.items.scripts.map(id => {
                           const c = MOCK_SCRIPTS.find(x => x.id === id);
                           return <li key={id} className="text-sm font-medium text-slate-700 bg-slate-50 p-2 rounded-md">{c?.title}</li>
                         })}
                       </ul>
                     </CardContent>
                   </Card>
                 )}

                 {selectedTask.items.quotes.length > 0 && (
                   <Card className="border-slate-200">
                     <CardContent className="p-4">
                       <div className="flex items-center text-xs font-bold text-rose-600 mb-3"><TextSelect className="w-4 h-4 mr-1.5" /> 指定金句跟读 ({selectedTask.items.quotes.length})</div>
                       <ul className="space-y-2">
                         {selectedTask.items.quotes.map(id => {
                           const c = MOCK_QUOTES.find(x => x.id === id);
                           return <li key={id} className="text-sm font-medium text-slate-700 bg-slate-50 p-2 rounded-md">{c?.title}</li>
                         })}
                       </ul>
                     </CardContent>
                   </Card>
                 )}

               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <FileText className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-medium text-slate-500">在左侧选择一个练习任务查看明细</p>
          </div>
        )}
      </div>

      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="sm:max-w-5xl flex flex-col h-[85vh]">
          <DialogHeader className="shrink-0">
            <DialogTitle>新建周期练习任务</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto flex gap-6 my-4 px-1">
            {/* Left Column: Basic Info */}
            <div className="w-1/3 space-y-5 border-r border-slate-100 pr-6 shrink-0">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">任务名称</label>
                <input type="text" placeholder="例如：11月每日开口练习计划" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>
              
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1.5">分发对象 (多选)</label>
                 <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg h-32 overflow-y-auto">
                   {targets.map(target => (
                     <label key={target} className="flex items-center space-x-2 cursor-pointer">
                       <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                       <span className="text-sm text-slate-700">{target}</span>
                     </label>
                   ))}
                 </div>
              </div>

               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1.5">截止时间</label>
                 <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
               </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1.5">练习频次要求</label>
                 <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                   <option>每日完成 1 次</option>
                   <option>每周完成 3 次</option>
                   <option>周期内一次性通关</option>
                 </select>
              </div>
            </div>
            
            {/* Right Column: Asset Selection */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-sm font-bold text-slate-700 mb-2">配置练习素材 (可选多项组合)</label>
              
              <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg bg-slate-50/50 p-4 space-y-6">
                
                {/* 1. Avatars */}
                <div className="space-y-3">
                   <div className="text-sm font-bold text-emerald-600 flex items-center border-b border-emerald-100 pb-2"><Bot className="w-5 h-5 mr-2" /> 数字人顾客自由练</div>
                   <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {MOCK_AVATARS.map(item => (
                         <label key={item.id} className="relative flex flex-col p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-emerald-300 hover:shadow-sm  transition-all group">
                           <div className="absolute top-2 right-2 z-10">
                             <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shadow-sm" />
                           </div>
                           <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-2 mx-auto border border-emerald-100">
                             <span className="text-emerald-500 font-bold text-sm">3D</span>
                           </div>
                           <span className="text-xs font-bold text-center text-slate-700 group-hover:text-emerald-700">{item.title}</span>
                         </label>
                      ))}
                   </div>
                </div>

                {/* 2. Scripts */}
                <div className="space-y-3">
                   <div className="text-sm font-bold text-blue-600 flex items-center border-b border-blue-100 pb-2"><MessageSquareText className="w-5 h-5 mr-2" /> 场景剧本通关</div>
                   <div className="grid grid-cols-2 gap-3">
                      {MOCK_SCRIPTS.map(item => (
                         <label key={item.id} className="relative flex items-center p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all group">
                           <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 mr-3">
                             <MessageSquareText className="w-4 h-4" />
                           </div>
                           <span className="text-xs font-bold text-slate-700 flex-1 group-hover:text-blue-700 line-clamp-1">{item.title}</span>
                           <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 ml-2 shadow-sm" />
                         </label>
                      ))}
                   </div>
                </div>

                {/* 3. Quotes */}
                <div className="space-y-3">
                   <div className="text-sm font-bold text-rose-600 flex items-center border-b border-rose-100 pb-2"><TextSelect className="w-5 h-5 mr-2" /> 金句跟读打分</div>
                   <div className="grid grid-cols-1 gap-2">
                      {MOCK_QUOTES.map(item => (
                         <label key={item.id} className="relative flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-rose-300 hover:shadow-sm transition-all group">
                           <div className="flex flex-col">
                             <span className="text-[10px] text-slate-400 mb-0.5 font-medium uppercase">QUOTE</span>
                             <span className="text-xs font-bold text-slate-700 group-hover:text-rose-700">{item.title}</span>
                           </div>
                           <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 ml-2 shadow-sm shrink-0" />
                         </label>
                      ))}
                   </div>
                </div>

              </div>
              
              <p className="text-xs text-slate-500 mt-3 flex items-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                提示：选择不同的素材模块将组合成一个多维度的陪练任务。
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 shrink-0">
            <Button variant="outline" onClick={() => setCreateDialog(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => {
              setTasks([{
                id: `pt${Date.now()}`,
                title: '新建测试任务',
                status: '进行中',
                publishTime: new Date().toISOString().split('T')[0],
                deadline: '2023-12-31',
                target: '选中的人群',
                frequency: '每日完成 1 次',
                items: {
                  avatars: ['a1'],
                  scripts: [],
                  quotes: []
                },
                progress: 0,
                targetCount: 100,
                completedCount: 0,
                scope: (userRole === 'Regional Training Manager' || userRole === 'Regional Trainer') ? '区域' : '全国',
                region: (userRole === 'Regional Training Manager' || userRole === 'Regional Trainer') ? '南区' : undefined,
              }, ...tasks]);
              setCreateDialog(false);
            }}>确认发布任务</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={!!detailTask} onOpenChange={(open) => !open && setDetailTask(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader className="border-b border-slate-100 pb-4 shrink-0">
            <DialogTitle className="flex items-center text-slate-800">
              <Users className="w-5 h-5 mr-2 text-indigo-600" />
              {detailTask?.title} - 完成明细
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pt-4 flex flex-col min-h-0">
            <div className="grid grid-cols-3 gap-4 mb-6 shrink-0">
               <Card className="bg-slate-50 border-slate-100 shadow-none">
                 <CardContent className="p-4 flex items-center justify-between">
                   <div>
                     <p className="text-xs font-medium text-slate-500 mb-1">目标人数</p>
                     <p className="text-xl font-bold text-slate-800">{detailTask?.targetCount}</p>
                   </div>
                   <Users className="w-8 h-8 text-indigo-200" />
                 </CardContent>
               </Card>
               <Card className="bg-slate-50 border-slate-100 shadow-none">
                 <CardContent className="p-4 flex items-center justify-between">
                   <div>
                     <p className="text-xs font-medium text-slate-500 mb-1">已达标</p>
                     <p className="text-xl font-bold text-indigo-600">{detailTask?.completedCount}</p>
                   </div>
                   <CheckCircle className="w-8 h-8 text-indigo-200" />
                 </CardContent>
               </Card>
               <Card className="bg-slate-50 border-slate-100 shadow-none">
                 <CardContent className="p-4 flex items-center justify-between">
                   <div>
                     <p className="text-xs font-medium text-slate-500 mb-1">整体达标率</p>
                     <p className="text-xl font-bold text-slate-800">{detailTask?.progress}%</p>
                   </div>
                   <Target className="w-8 h-8 text-indigo-200" />
                 </CardContent>
               </Card>
            </div>
            
            <div className="flex justify-between items-center mb-4 shrink-0">
               <h3 className="text-sm font-bold text-slate-800">学员明细</h3>
               <div className="relative">
                 <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                 <input type="text" placeholder="搜索工号、姓名、门店..." className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64" />
               </div>
            </div>

            <div className="flex-1 overflow-auto border border-slate-200 rounded-xl">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                   <tr>
                     <th className="p-3 font-medium text-slate-500 w-24">工号</th>
                     <th className="p-3 font-medium text-slate-500 w-32">姓名</th>
                     <th className="p-3 font-medium text-slate-500">门店</th>
                     <th className="p-3 font-medium text-slate-500 w-32">状态</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 bg-white">
                    {MOCK_CANDIDATES.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-slate-500 font-mono text-xs">{c.id}</td>
                        <td className="p-3 font-medium text-slate-800">{c.name}</td>
                        <td className="p-3 text-slate-600">{c.store}</td>
                        <td className="p-3">
                          {c.status === '已达标' && <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none font-normal">已达标</Badge>}
                          {c.status === '练习中' && <Badge variant="outline" className="bg-blue-50 text-blue-600 border-none font-normal">练习中</Badge>}
                          {c.status === '未开始' && <Badge variant="outline" className="bg-slate-100 text-slate-500 border-none font-normal">未开始</Badge>}
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Plus, BookOpen, Clock, Target, Calendar, CheckCircle2, ChevronRight, FileText, Users, Search, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

const MOCK_COURSES = [
  { id: 'c1', title: '双萃系列核心卖点解析（2023版）', duration: '15 mins' },
  { id: 'c2', title: '敏感肌换季护理指南', duration: '20 mins' },
  { id: 'c3', title: 'VIP客户破冰话术实战', duration: '12 mins' },
  { id: 'c4', title: '防晒家族全系列对比', duration: '18 mins' },
];

const MOCK_STUDY_TASKS = [
  {
    id: 'st1',
    title: '新人入职必修课第一期',
    status: '进行中',
    publishTime: '2023-11-01',
    deadline: '2023-11-30',
    target: '全国新入职满1个月BA',
    courses: ['c1', 'c3'],
    progress: 45,
    targetCount: 1428,
    completedCount: 642,
    scope: '全国',
  },
  {
    id: 'st2',
    title: '秋冬防晒季全员冲刺培训',
    status: '已结束',
    publishTime: '2023-09-01',
    deadline: '2023-09-30',
    target: '全国直营门店BA',
    courses: ['c2', 'c4'],
    progress: 92,
    targetCount: 1428,
    completedCount: 1313,
    scope: '全国',
  },
  {
    id: 'st3',
    title: '南区敏感肌专属话术突破',
    status: '进行中',
    publishTime: '2023-11-15',
    deadline: '2023-12-15',
    target: '南区所有门店BA',
    courses: ['c2'],
    progress: 21,
    targetCount: 300,
    completedCount: 63,
    scope: '区域',
    region: '南区',
  }
];

const MOCK_CANDIDATES = [
  { id: 'BA001', name: 'Siti Aminah', store: 'Jakarta Grand Indonesia', status: '已完成' },
  { id: 'BA002', name: 'Budi Santoso', store: 'Jakarta Plaza Senayan', status: '学习中' },
  { id: 'BA003', name: 'Ayu Lestari', store: 'Surabaya Tunjungan Plaza', status: '未开始' },
  { id: 'BA004', name: 'Rizky Pratama', store: 'Bali Beachwalk', status: '已完成' },
  { id: 'BA005', name: 'Dewi Sartika', store: 'Bandung Trans Studio', status: '学习中' },
  { id: 'BA006', name: 'Agung Setiawan', store: 'Medan Centre Point', status: '已完成' },
  { id: 'BA007', name: 'Putri Maharani', store: 'Yogyakarta Hartono Mall', status: '学习中' },
];

export function StudyTaskManage({ isReadOnly = false, userRole }: { isReadOnly?: boolean, userRole?: string }) {
  const [tasks, setTasks] = useState(MOCK_STUDY_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(MOCK_STUDY_TASKS[0].id);
  const [createDialog, setCreateDialog] = useState(false);
  const [detailTask, setDetailTask] = useState<any>(null);

  const targets = (userRole === 'Regional Training Manager' || userRole === 'Regional Trainer')
    ? ['雅加达南区所有门店 BA', '本区域店长', '本区域新入职员工']
    : ['全国所有门店 BA', '所有区域经理', '全国店长', '入职不满3个月的新人'];

  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  
  return (
    <div className="flex h-full bg-[#FAF9F8] overflow-hidden pt-2 rounded-xl border border-slate-200">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between z-10 bg-white">
          <h2 className="font-bold text-slate-800 tracking-tight">学习任务列表</h2>
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
                   <Badge variant="outline" className={`text-[10px] py-0 border-transparent ${task.status === '进行中' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
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
                <span className="flex items-center"><BookOpen className="w-3 h-3 mr-1" /> {task.courses.length} 门课件</span>
                <span>{task.progress}% 完成</span>
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
                   <Badge variant="outline" className={`${selectedTask.status === '进行中' ? 'border-blue-200 text-blue-600 bg-blue-50' : 'border-slate-200 text-slate-500 bg-slate-50'}`}>
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
              
              <div className="grid grid-cols-3 gap-6 mt-6">
                 <div className="flex flex-col">
                   <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 flex items-center"><Target className="w-3 h-3 mr-1" /> 分发对象</span>
                   <span className="text-sm font-medium text-slate-800">{selectedTask.target}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 flex items-center"><Calendar className="w-3 h-3 mr-1" /> 任务周期</span>
                   <span className="text-sm font-medium text-slate-800">{selectedTask.publishTime} 至 {selectedTask.deadline}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> 当前进度</span>
                   <span className="text-sm font-bold text-indigo-600">{selectedTask.progress}% (整体完成率)</span>
                 </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
               <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                 <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
                 包含的课件内容 ({selectedTask.courses.length})
               </h3>
               <div className="space-y-3">
                 {selectedTask.courses.map((courseId, idx) => {
                   const courseInfo = MOCK_COURSES.find(c => c.id === courseId);
                   return (
                     <Card key={courseId} className="border-slate-200 shadow-sm hover:shadow transition-shadow">
                       <CardContent className="p-4 flex items-center justify-between">
                         <div className="flex items-center space-x-4">
                           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                             {idx + 1}
                           </div>
                           <div>
                             <h4 className="text-sm font-bold text-slate-800">{courseInfo?.title}</h4>
                             <p className="text-[10px] text-slate-500 mt-1 flex items-center">
                               <Clock className="w-3 h-3 mr-1" /> 预计 {courseInfo?.duration}
                             </p>
                           </div>
                         </div>
                         <Button variant="ghost" size="sm" className="text-indigo-600">
                           预览 <ChevronRight className="w-4 h-4 ml-1" />
                         </Button>
                       </CardContent>
                     </Card>
                   )
                 })}
               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <FileText className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-medium text-slate-500">在左侧选择一个学习任务查看明细</p>
          </div>
        )}
      </div>

      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="sm:max-w-4xl flex flex-col h-[85vh]">
          <DialogHeader className="shrink-0">
            <DialogTitle>新建周期学习任务</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto flex gap-6 my-4 px-1">
            {/* Left Column: Basic Info */}
            <div className="w-1/3 space-y-5 border-r border-slate-100 pr-6 shrink-0">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">任务名称</label>
                <input type="text" placeholder="例如：2023年终大促全员冲刺课" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
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
            </div>

            {/* Right Column: Resource Selection */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-sm font-bold text-slate-700 mb-2">选择课件 (按勾选顺序组合)</label>
              <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg bg-slate-50/50 p-4">
                 <div className="grid grid-cols-2 gap-4">
                   {MOCK_COURSES.map((course, idx) => (
                     <label key={course.id} className="relative flex flex-row items-center p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group">
                       <div className="absolute top-3 right-3 z-10">
                         <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shadow-sm" />
                       </div>
                       <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 mr-4">
                         <BookOpen className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                       </div>
                       <div className="flex-1 pr-6">
                         <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-700 transition-colors">{course.title}</p>
                         <p className="text-[10px] text-slate-500 flex items-center mt-2"><Clock className="w-3 h-3 mr-1" /> {course.duration}</p>
                       </div>
                     </label>
                   ))}
                 </div>
              </div>
              <p className="text-xs text-slate-500 mt-3 flex items-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                提示：选择的课件将按拼装顺序展示给学员，建议优先选择新发布的资产。
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 shrink-0">
            <Button variant="outline" onClick={() => setCreateDialog(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => {
              setTasks([{
                id: `st${Date.now()}`,
                title: '新建测试任务',
                status: '进行中',
                publishTime: new Date().toISOString().split('T')[0],
                deadline: '2023-12-31',
                target: '选中的人群',
                courses: ['c1'],
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
                     <p className="text-xs font-medium text-slate-500 mb-1">已完成</p>
                     <p className="text-xl font-bold text-indigo-600">{detailTask?.completedCount}</p>
                   </div>
                   <CheckCircle className="w-8 h-8 text-indigo-200" />
                 </CardContent>
               </Card>
               <Card className="bg-slate-50 border-slate-100 shadow-none">
                 <CardContent className="p-4 flex items-center justify-between">
                   <div>
                     <p className="text-xs font-medium text-slate-500 mb-1">当前进度</p>
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
                          {c.status === '已完成' && <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none font-normal">已完成</Badge>}
                          {c.status === '学习中' && <Badge variant="outline" className="bg-blue-50 text-blue-600 border-none font-normal">学习中</Badge>}
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

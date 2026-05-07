import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Target, Users, BookOpen, Clock, AlertTriangle, LayoutDashboard, CalendarCheck, Database, MessageSquare, TextSelect, Plus, ArrowRight, BrainCircuit, ClipboardList, CheckCircle2, ChevronRight, User, ChevronLeft, Building, PlayCircle, ArrowDownRight } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const MOCK_ONGOING_TASKS = [
  { id: '2', title: '『敏感肌抗老』场景陪练', scope: '全国', type: '练习任务', completed: 850, total: 1428, progress: 59, deadlineText: '本周五 (剩余 3 天)', isWarning: true, color: 'emerald' },
  { id: '3', title: '全员基础服务礼仪月度测试', scope: '全国', type: '考试任务', completed: 900, total: 1428, progress: 63, deadlineText: '下周五', isWarning: false, color: 'rose' },
  { id: '4', title: '新晋店长管理赋能 (第一期)', scope: '全国', type: '学习任务', completed: 45, total: 50, progress: 90, deadlineText: '无需截止日期 (长期有效)', isWarning: false, color: 'amber' },
  { id: '5', title: '秋冬面霜系列话术演练', scope: '全国', type: '练习任务', completed: 1000, total: 1428, progress: 70, deadlineText: '本月月底', isWarning: false, color: 'emerald' },
];

export function HTDashboard() {
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const handleStaffClick = (staffName: string) => {
    setSelectedStaff(staffName);
  };

  const handleStoreClick = (storeName: string) => {
    setSelectedStore(storeName);
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col pt-2">
      {/* Top KPIs - Auto Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden bg-white">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">全国注册 BA 总数</CardTitle>
            <Users className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold text-slate-800">1,428</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden bg-white">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">本月课件学习次数</CardTitle>
            <BookOpen className="h-4 w-4 text-fuchsia-400" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-end justify-between leading-none mb-2">
              <span className="text-3xl font-bold text-slate-800">45.2<span className="text-lg font-medium ml-1 text-slate-500">k</span></span>
              <span className="text-[10px] font-bold text-fuchsia-600 bg-fuchsia-50 px-2 py-1 rounded-md">环比 ↑ 12%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden bg-white">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">本月平均任务完成率</CardTitle>
            <CalendarCheck className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
             <div className="flex items-end justify-between leading-none mb-2">
              <span className="text-3xl font-bold text-slate-800">88.5%</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">环比 ↑ 4.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden bg-white">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">本月全国练习总次数</CardTitle>
             <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
             <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold text-slate-800">12.4<span className="text-lg font-medium ml-1 text-slate-500">k</span></span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">约 3.2 万小时</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full flex-1 min-h-[460px]">
        
        {/* Col 1: 内容资产总览 (Content & Assets) */}
        <div className="flex flex-col">
          <Card className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col bg-white">
            <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/50">
               <CardTitle className="text-sm font-bold flex items-center text-slate-800">
                 <Database className="h-4 w-4 mr-2 text-indigo-500" /> 数字资产大盘 (全局通览)
               </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col space-y-4">
              <div className="flex flex-col gap-3 flex-1 content-start">
                 <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-indigo-200 transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <BookOpen className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-slate-800">在线课件</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">共计: 124 份</div>
                       </div>
                    </div>
                    <button className="text-[11px] font-bold text-indigo-600 hover:text-white hover:bg-indigo-500 border border-indigo-200 hover:border-indigo-500 rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0"><Plus className="h-3 w-3 mr-1" /> 新增</button>
                 </div>

                 <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-emerald-200 transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <Users className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-slate-800">数字人顾客</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">共计: 8 位</div>
                       </div>
                    </div>
                    <button className="text-[11px] font-bold text-emerald-600 hover:text-white hover:bg-emerald-500 border border-emerald-200 hover:border-emerald-500 rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0"><Plus className="h-3 w-3 mr-1" /> 新增</button>
                 </div>

                 <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-amber-200 transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <MessageSquare className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-slate-800">场景剧本</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">共计: 35 个</div>
                       </div>
                    </div>
                    <button className="text-[11px] font-bold text-amber-600 hover:text-white hover:bg-amber-500 border border-amber-200 hover:border-amber-500 rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0"><Plus className="h-3 w-3 mr-1" /> 新增</button>
                 </div>

                 <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-rose-200 transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <TextSelect className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-slate-800">金句库</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">共计: 850 句</div>
                       </div>
                    </div>
                    <button className="text-[11px] font-bold text-rose-600 hover:text-white hover:bg-rose-500 border border-rose-200 hover:border-rose-500 rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0"><Plus className="h-3 w-3 mr-1" /> 新增</button>
                 </div>

                 <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-blue-200 transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <Database className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-slate-800">题库题目</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">共计: 3,240 题</div>
                       </div>
                    </div>
                    <button className="text-[11px] font-bold text-blue-600 hover:text-white hover:bg-blue-500 border border-blue-200 hover:border-blue-500 rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0"><Plus className="h-3 w-3 mr-1" /> 新增</button>
                 </div>

                 <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-fuchsia-200 transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <ClipboardList className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-slate-800">试卷总数</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">共计: 42 份</div>
                       </div>
                    </div>
                    <button className="text-[11px] font-bold text-fuchsia-600 hover:text-white hover:bg-fuchsia-500 border border-fuchsia-200 hover:border-fuchsia-500 rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0"><Plus className="h-3 w-3 mr-1" /> 新增</button>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Col 2: 全国作业与考试监控 (Tasks & Exams) */}
        <div className="flex flex-col">
           <Card className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col bg-white">
            <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/50 flex flex-row items-center justify-between">
               <CardTitle className="text-sm font-bold flex items-center text-slate-800">
                 <CalendarCheck className="h-4 w-4 mr-2 text-indigo-500" /> 全国任务监控 (进行中)
               </CardTitle>
               <button onClick={() => setShowAllTasks(true)} className="text-[10px] font-bold text-indigo-600 flex items-center hover:underline">查看全部 <ArrowRight className="h-3 w-3 ml-1" /></button>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto flex-1 flex flex-col space-y-4">
               {MOCK_ONGOING_TASKS.slice(0, 3).map(task => (
                 <div key={task.id} className="border border-slate-100 rounded-xl p-3 bg-white shadow-sm hover:shadow relative overflow-hidden transition-all group cursor-pointer">
                   <div className={`absolute top-0 left-0 w-1 h-full bg-${task.color}-500`}></div>
                   <div className="flex justify-between items-start mb-2">
                      <h4 className={`text-xs font-bold text-slate-800 group-hover:text-${task.color}-600 transition-colors`}>{task.title}</h4>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[9px] py-0 border-slate-200 text-slate-600 bg-slate-50">{task.scope}</Badge>
                        <Badge variant="outline" className={`text-[9px] py-0 border-${task.color}-200 text-${task.color}-600 bg-${task.color}-50`}>{task.type}</Badge>
                      </div>
                   </div>
                   <div className="flex justify-between text-[10px] text-slate-500 mb-1.5 font-medium">
                      <span>{task.completed} / {task.total} 人已{task.type === '练习任务' ? '达标' : '完成'}</span>
                      <span className="text-slate-800 font-bold">{task.progress}%</span>
                   </div>
                   <Progress value={task.progress} className={`h-1.5 [&>div]:bg-${task.color}-500`} />
                   <div className="mt-3 text-[10px] text-slate-400 flex items-center">
                      {task.isWarning && <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />}
                      {task.deadlineText !== '无需截止日期 (长期有效)' ? `截止日期: ${task.deadlineText}` : task.deadlineText}
                   </div>
                 </div>
               ))}

               {MOCK_ONGOING_TASKS.length > 3 && (
                 <div className="w-full mt-auto py-2 text-center text-xs font-bold text-slate-400">
                   其他 {MOCK_ONGOING_TASKS.length - 3} 个任务进行中
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        {/* Col 3: AI 薄弱点洞察 (AI Insights) */}
        <div className="flex flex-col">
          <Card className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col bg-slate-800 text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <BrainCircuit className="h-24 w-24" />
            </div>
            <CardHeader className="p-4 border-b border-slate-700 bg-slate-900/50 z-10 relative">
               <CardTitle className="text-sm font-bold flex items-center text-white">
                 <BrainCircuit className="h-4 w-4 mr-2 text-indigo-400" /> AI 自动洞察: 全国核心薄弱点
               </CardTitle>
               <CardDescription className="text-[10px] text-slate-400 mt-1">
                 该洞察基于近期数据生成，每周刷新
               </CardDescription>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto flex-1 space-y-4 z-10 relative">
               
               <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-sm flex flex-col space-y-2">
                  <div className="flex items-start justify-between">
                     <span className="text-xs font-bold text-rose-100">TOP 1: 新品核心成分区分体验</span>
                     <Badge variant="destructive" className="bg-rose-500 text-white border-none text-[9px] py-0 px-1.5">68% 高频卡点</Badge>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed"><span className="text-rose-400 font-bold tracking-wide">💡 AI 结论：</span> 大量 BA 无法通过情景演练清晰表述双萃系列 "亲水亲油" 的黄金比例，当面对敏感肌顾客时极易背错浓度配比。</p>
               </div>
               
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm flex flex-col space-y-2">
                  <div className="flex items-start justify-between">
                     <span className="text-xs font-bold text-amber-100">TOP 2: 竞对异议处理 (价格向)</span>
                     <Badge variant="outline" className="border-amber-500/50 text-amber-300 text-[9px] py-0 px-1.5 font-bold">42% 卡顿超5s</Badge>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed"><span className="text-amber-400 font-bold tracking-wide">💡 AI 结论：</span> 语音识别显示，员工在被质问 "XX牌更便宜为什么要买你们的" 时，卡顿显著，缺少差异化卖点和情绪价值支撑。</p>
               </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Drill down / Details */}
      <div className="space-y-6">
        <Tabs defaultValue="staff" className="w-full flex-1 flex flex-col min-h-[460px]">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-12 p-0">
            <TabsTrigger value="staff" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-6 data-[state=active]:shadow-none data-[state=active]:bg-transparent font-bold">全国员工排行</TabsTrigger>
            <TabsTrigger value="store" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-6 data-[state=active]:shadow-none data-[state=active]:bg-transparent font-bold">全国门店培训排行</TabsTrigger>
          </TabsList>
          
          <TabsContent value="staff" className="pt-4 flex-1 outline-none">
            <Card className="h-full flex flex-col border-none shadow-none">
              {selectedStaff ? (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 border border-slate-100 rounded-xl p-4 shadow-sm bg-white">
                   <div className="flex flex-row items-center justify-between mb-4">
                      <button onClick={() => setSelectedStaff(null)} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors">
                         <ChevronLeft className="h-3 w-3 mr-1" /> 返回员工列表
                      </button>
                      <Badge variant="destructive" className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none">{selectedStaff === 'Rina' ? '高风险' : '正常'}</Badge>
                   </div>
                   <div className="flex items-center space-x-4 mb-6 px-2">
                      <div className="h-16 w-16 rounded-full bg-slate-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                         <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${selectedStaff}`} alt={selectedStaff} className="h-full w-full object-cover" />
                      </div>
                      <div>
                         <h3 className="text-lg font-bold text-slate-800">{selectedStaff}</h3>
                         <p className="text-xs text-slate-500">Toko Mal Kelapa Gading | 入职 6 个月 | 南雅加达区</p>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                      <div className="space-y-4">
                         <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm h-full flex flex-col">
                           <h4 className="text-xs font-bold text-slate-800 mb-4 tracking-wider flex items-center"><BookOpen className="h-4 w-4 mr-2 text-indigo-500" /> 学习与考试</h4>
                           <div className="space-y-4 flex-1">
                             <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                               <div className="flex justify-between text-xs mb-2">
                                 <span className="text-slate-500 font-medium">任务完成率 (3/8)</span>
                                 <span className="font-bold text-slate-700">37%</span>
                               </div>
                               <Progress value={37} className="h-1.5 [&>div]:bg-indigo-500" />
                             </div>
                             <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                               <div className="flex justify-between text-xs mb-2">
                                 <span className="text-slate-500 font-medium">最近考试成绩</span>
                                 <span className="font-bold text-rose-600">52分</span>
                               </div>
                               <div className="text-[10px] text-slate-400 mt-1 flex items-center font-medium">
                                 历次趋势：<span className="ml-1 text-slate-600">65</span> <ArrowDownRight className="h-3 w-3 mx-1 text-rose-400" /> <span className="text-slate-600">58</span> <ArrowDownRight className="h-3 w-3 mx-1 text-rose-400" /> <span className="text-rose-600 font-bold">52</span>
                               </div>
                             </div>
                           </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm h-full flex flex-col">
                           <h4 className="text-xs font-bold text-slate-800 mb-4 tracking-wider flex items-center"><PlayCircle className="h-4 w-4 mr-2 text-emerald-500" /> 陪练与打卡</h4>
                           <div className="space-y-3 text-sm flex-1">
                             <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 h-full">
                               <div className="flex justify-between items-center border-b border-slate-200/60 pb-3 mb-3">
                                 <span className="text-slate-500 text-xs font-medium">本月对练次数</span>
                                 <span className="font-bold text-slate-800">0 次</span>
                               </div>
                               <div className="flex justify-between items-center border-b border-slate-200/60 pb-3 mb-3">
                                 <span className="text-slate-500 text-xs font-medium">剧本练习</span>
                                 <span className="font-bold text-slate-800">1 次</span>
                               </div>
                               <div className="flex justify-between items-center">
                                 <span className="text-slate-500 text-xs font-medium">金句跟读连击</span>
                                 <span className="font-bold text-rose-500">0 天</span>
                               </div>
                             </div>
                           </div>
                         </div>
                      </div>
                      
                      <div className="md:col-span-2 pt-2">
                         <div className="bg-orange-50/30 border border-orange-100 rounded-xl p-4 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center">
                               <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                               数据波动与学习提示
                            </h4>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              根据近期错题统计，该员工的知识盲区主要集中在<span className="font-bold text-slate-800">「夏季新品系列」</span>。其中涉及<span className="bg-white shadow-sm px-1 border border-orange-100 rounded text-[10px] font-mono mx-1">焕白精华适用肤质</span>的考题错误率达 <span className="font-bold text-rose-600">60%</span>。
                              <span className="text-slate-500 mt-2 block border-t border-orange-100 pt-2">此外，该员工本月尚未进行任何「场景陪练」打卡。建议提醒门店长针对新品知识面进行当面抽查与辅导。</span>
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col h-full bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                   <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/50">
                      <CardTitle className="text-sm font-bold text-slate-800 flex justify-between items-center">
                        <span className="flex items-center"><User className="h-4 w-4 mr-2 text-indigo-500"/> 全国员工学习力排名</span>
                      </CardTitle>
                      <CardDescription className="text-[10px] uppercase tracking-widest mt-1">点击员工姓名下钻个人履历</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto flex-1 h-[400px]">
                       <table className="w-full text-sm">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-wider text-left border-y border-slate-100 sticky top-0">
                          <tr>
                            <th className="py-2.5 px-5 font-bold w-12 text-center">Rank</th>
                            <th className="py-2.5 px-4 font-bold">员工姓名</th>
                            <th className="py-2.5 px-2 font-bold hidden sm:table-cell w-1/4">所属区域/门店</th>
                            <th className="py-2.5 px-3 font-bold text-center">任务完成率</th>
                            <th className="py-2.5 px-3 font-bold text-center text-indigo-600">当月积分</th>
                            <th className="py-2.5 px-5 font-bold text-right text-indigo-600">最新考试平均分</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleStaffClick('Siti')}>
                            <td className="py-3 px-5 font-bold text-amber-500 text-center">1</td>
                            <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Siti</td>
                            <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell">雅加达区 | Toko Senayan City</td>
                            <td className="py-3 px-3 text-center font-medium text-slate-700">100%</td>
                            <td className="py-3 px-3 text-center font-bold text-indigo-600">236</td>
                            <td className="py-3 px-5 text-right font-bold text-slate-800 text-base">98</td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleStaffClick('Dewi')}>
                            <td className="py-3 px-5 font-bold text-slate-400 text-center">2</td>
                            <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Dewi</td>
                            <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell">泗水区 | Tunjungan Plaza</td>
                            <td className="py-3 px-3 text-center font-medium text-slate-700">98%</td>
                            <td className="py-3 px-3 text-center font-bold text-indigo-600">228</td>
                            <td className="py-3 px-5 text-right font-bold text-slate-800 text-base">96</td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleStaffClick('Fitri')}>
                            <td className="py-3 px-5 font-bold text-amber-700 text-center">3</td>
                            <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Fitri</td>
                            <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell">雅加达区 | Toko Pacific Place</td>
                            <td className="py-3 px-3 text-center font-medium text-slate-700">95%</td>
                            <td className="py-3 px-3 text-center font-bold text-indigo-600">219</td>
                            <td className="py-3 px-5 text-right font-bold text-slate-800 text-base">95</td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleStaffClick('Putri')}>
                            <td className="py-3 px-5 font-bold text-slate-400 text-center">4</td>
                            <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Putri</td>
                            <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell">巴厘岛区 | Beachwalk Center</td>
                            <td className="py-3 px-3 text-center font-medium text-slate-700">92%</td>
                            <td className="py-3 px-3 text-center font-bold text-indigo-600">207</td>
                            <td className="py-3 px-5 text-right font-bold text-slate-800 text-base">92</td>
                          </tr>
                           <tr className="hover:bg-rose-50/50 transition-colors group cursor-pointer bg-rose-50/20" onClick={() => handleStaffClick('Rina')}>
                            <td className="py-3 px-5 font-bold text-rose-400 text-center">342</td>
                            <td className="py-3 px-4 font-bold text-rose-600 group-hover:text-rose-800 transition-colors flex items-center">
                              Rina
                            </td>
                            <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell">雅加达区 | T. Kelapa Gading</td>
                            <td className="py-3 px-3 text-center font-medium text-rose-600">30%</td>
                            <td className="py-3 px-3 text-center font-bold text-rose-600">58</td>
                            <td className="py-3 px-5 text-right font-bold text-rose-600 text-base">45</td>
                          </tr>
                        </tbody>
                      </table>
                    </CardContent>
                </div>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="store" className="pt-4 flex-1 outline-none">
             <Card className="h-full flex flex-col border-none shadow-none">
               {selectedStore ? (
                  <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 border border-slate-100 rounded-xl p-4 shadow-sm bg-white">
                     <div className="flex flex-row items-center justify-between mb-4">
                        <button onClick={() => setSelectedStore(null)} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors">
                           <ChevronLeft className="h-3 w-3 mr-1" /> 返回门店排行
                        </button>
                     </div>
                     <div className="flex items-center space-x-4 mb-6 px-2">
                         <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                           <Building className="h-6 w-6 text-indigo-600" />
                         </div>
                         <div>
                           <h3 className="text-lg font-bold text-slate-800">{selectedStore}</h3>
                           <p className="text-xs text-slate-500 mt-1">店长: Budi | 编制 BA: <span className="font-bold text-slate-700">6 名</span> | <Badge variant="outline" className="text-[9px] py-0 px-1 ml-1 font-mono">S级商圈</Badge></p>
                         </div>
                     </div>

                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm text-center">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">人均陪练</p>
                           <p className="text-2xl font-bold text-slate-800">4.2<span className="text-xs text-slate-500 font-medium ml-1">hrs</span></p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm text-center">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">任务完成率</p>
                           <p className="text-2xl font-bold text-emerald-600">92<span className="text-xs text-emerald-500 font-medium ml-1">%</span></p>
                        </div>
                         <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm text-center">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">优秀 BA 数</p>
                           <p className="text-2xl font-bold text-slate-800">4<span className="text-xs text-slate-500 font-medium ml-1">人</span></p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm text-center border-b-2 border-b-indigo-400">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">最新考试平均分</p>
                           <p className="text-2xl font-bold text-indigo-600">95<span className="text-xs text-indigo-400 font-medium ml-1">分</span></p>
                        </div>
                     </div>

                      <div className="border border-slate-100 rounded-xl pt-0 overflow-hidden flex-1 flex flex-col bg-slate-50/50">
                        <div className="p-3 bg-white border-b border-slate-100">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                            <Target className="h-4 w-4 mr-2 text-indigo-500" />
                            门店训练特长图谱
                          </h4>
                        </div>
                        <div className="p-4 space-y-4 flex-1">
                          <div className="flex flex-wrap gap-2">
                             <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none px-3 py-1 text-xs">连带销售话术卓越 (+15%)</Badge>
                             <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3 py-1 text-xs">抗老系列知识稳固</Badge>
                             <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-300 border-none px-3 py-1 text-xs">新品接受度极高</Badge>
                          </div>
                           <div className="text-xs text-slate-600 mt-2 leading-relaxed bg-white border border-slate-200 shadow-sm p-4 rounded-xl relative">
                             <div className="absolute -left-1 top-4 w-2 h-8 bg-indigo-500 rounded-r-full"></div>
                             <span className="font-bold text-indigo-700 block mb-1">AI 录音文本分析简报：</span> 
                             该门店本月完课率及陪练活跃度均居全国前列。系统对该店高分陪练录音进行文本检索，其在<span className="font-mono bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100 font-medium">抗老系列知识</span>和<span className="font-mono bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100 font-medium">价格异议处理</span>场景中的标准关键词命中率达 85% 以上。
                             <br/><span className="mt-1 block text-slate-500">建议可从其陪练记录中挑选 2-3 篇高分对局录音，在全国企微群内作为标准沟通话术进行分享。</span>
                           </div>
                        </div>
                      </div>
                  </div>
               ) : (
                  <div className="flex flex-col h-full bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                     <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/50">
                      <CardTitle className="text-sm font-bold text-slate-800 flex justify-between items-center">
                        <span className="flex items-center"><Building className="h-4 w-4 mr-2 text-indigo-500" /> 全国门店综合榜</span>
                      </CardTitle>
                      <CardDescription className="text-[10px] uppercase tracking-widest mt-1">点击门店进入管理微档案</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto flex-1 h-[400px]">
                       <table className="w-full text-sm">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-wider text-left border-y border-slate-100 sticky top-0">
                          <tr>
                            <th className="py-2.5 px-5 font-bold w-12 text-center">Rank</th>
                            <th className="py-2.5 px-4 font-bold">门店名称</th>
                            <th className="py-2.5 px-2 font-bold hidden sm:table-cell text-center">参训人数</th>
                            <th className="py-2.5 px-3 font-bold text-center">任务完成率</th>
                            <th className="py-2.5 px-5 font-bold text-right text-indigo-600">最新考试平均分</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleStoreClick('Toko Senayan City (雅加达)')}>
                            <td className="py-3 px-5 font-bold text-amber-500 text-center">1</td>
                            <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Toko Senayan City (雅加达)</td>
                             <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell text-center font-mono">6/6</td>
                            <td className="py-3 px-3 text-center font-medium text-slate-700">100%</td>
                            <td className="py-3 px-5 text-right font-bold text-slate-800 text-base">98</td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleStoreClick('Tunjungan Plaza (泗水)')}>
                            <td className="py-3 px-5 font-bold text-slate-400 text-center">2</td>
                            <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Tunjungan Plaza (泗水)</td>
                            <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell text-center font-mono">12/12</td>
                            <td className="py-3 px-3 text-center font-medium text-slate-700">100%</td>
                            <td className="py-3 px-5 text-right font-bold text-slate-800 text-base">96</td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleStoreClick('Toko Pacific Place (雅加达)')}>
                            <td className="py-3 px-5 font-bold text-amber-700 text-center">3</td>
                            <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Toko Pacific Place (雅加达)</td>
                            <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell text-center font-mono">8/8</td>
                            <td className="py-3 px-3 text-center font-medium text-slate-700">95%</td>
                            <td className="py-3 px-5 text-right font-bold text-slate-800 text-base">95</td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleStoreClick('Beachwalk Center (巴厘岛)')}>
                            <td className="py-3 px-5 font-bold text-slate-400 text-center">4</td>
                            <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Beachwalk Center (巴厘岛)</td>
                            <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell text-center font-mono">5/5</td>
                            <td className="py-3 px-3 text-center font-medium text-slate-700">90%</td>
                            <td className="py-3 px-5 text-right font-bold text-slate-800 text-base">92</td>
                          </tr>
                          <tr className="hover:bg-rose-50/50 transition-colors group cursor-pointer bg-rose-50/20" onClick={() => handleStoreClick('Toko Kelapa Gading (雅加达)')}>
                            <td className="py-3 px-5 font-bold text-rose-500 text-center">85</td>
                            <td className="py-3 px-4 font-bold text-rose-600 group-hover:text-rose-800 transition-colors">Toko Kelapa Gading (雅加达)</td>
                            <td className="py-3 px-2 text-[10px] text-rose-500 hidden sm:table-cell text-center font-mono">3/5</td>
                            <td className="py-3 px-3 text-center font-medium text-rose-600">60%</td>
                            <td className="py-3 px-5 text-right font-bold text-rose-600 text-base">58</td>
                          </tr>
                        </tbody>
                      </table>
                    </CardContent>
                 </div>
               )}
             </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* View All Tasks Dialog */}
      <Dialog open={showAllTasks} onOpenChange={setShowAllTasks}>
        <DialogContent className="sm:max-w-3xl flex flex-col h-[80vh]">
          <DialogHeader className="border-b border-slate-100 pb-4 shrink-0">
            <DialogTitle>全国任务监控 (所有进行中)</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_ONGOING_TASKS.map(task => (
              <div key={task.id} className="border border-slate-100 rounded-xl p-4 bg-white shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full bg-${task.color}-500`}></div>
                <div className="flex justify-between items-start mb-3">
                  <h4 className={`text-sm font-bold text-slate-800`}>{task.title}</h4>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px] py-0 border-slate-200 text-slate-600 bg-slate-50">{task.scope}</Badge>
                    <Badge variant="outline" className={`text-[10px] py-0 border-${task.color}-200 text-${task.color}-600 bg-${task.color}-50`}>{task.type}</Badge>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium">
                  <span>{task.completed} / {task.total} 人已{task.type === '练习任务' ? '达标' : '完成'}</span>
                  <span className="text-slate-800 font-bold">{task.progress}%</span>
                </div>
                <Progress value={task.progress} className={`h-2 [&>div]:bg-${task.color}-500`} />
                <div className="mt-4 text-xs text-slate-500 font-medium flex items-center">
                  {task.isWarning && <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />}
                  {task.deadlineText !== '无需截止日期 (长期有效)' ? `截止日期: ${task.deadlineText}` : task.deadlineText}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

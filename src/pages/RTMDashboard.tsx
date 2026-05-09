import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Target, Users, BookOpen, Clock, AlertTriangle, LayoutDashboard, CalendarCheck, Database, MessageSquare, TextSelect, Plus, ArrowRight, BrainCircuit, ClipboardList } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { getProgressTone } from '../lib/visualTones';

const RTM_ONGOING_TASKS = [
  { id: 'rtm-task-1', title: '夏季新品区域通关考核', scope: '区域', type: '考试任务', completed: 280, total: 342, progress: 81, deadlineText: '本周五 (剩余 3 天)', isWarning: true, badgeClass: 'border-rose-200 text-rose-600 bg-rose-50' },
  { id: 'rtm-task-2', title: '『敏感肌抗老』区域专项陪练', scope: '区域', type: '练习任务', completed: 215, total: 342, progress: 62, deadlineText: '下周三', isWarning: false, badgeClass: 'border-[#BFDCCF] text-[#3B8F72] bg-[#EEF8F4]' },
  { id: 'rtm-task-3', title: '店长基础服务抽检复训', scope: '区域', type: '学习任务', completed: 78, total: 96, progress: 81, deadlineText: '本月月底', isWarning: false, badgeClass: 'border-[#E5DED8] text-[#5D565A] bg-[#F8F5F3]' },
];

export function RTMDashboard() {
  const [showAllTasks, setShowAllTasks] = useState(false);
  const taskOneTone = getProgressTone(81);
  const taskTwoTone = getProgressTone(62);

  return (
    <div className="space-y-6 flex-1 flex flex-col pt-2">
      {/* Top KPIs - Auto Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden bg-white">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-[#766F73] uppercase tracking-widest">区域注册 BA 总数</CardTitle>
            <Users className="h-4 w-4 text-rose-400" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold text-[#242124]">342</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden bg-white">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-[#766F73] uppercase tracking-widest">本月课件学习次数</CardTitle>
            <BookOpen className="h-4 w-4 text-rose-400" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-end justify-between leading-none mb-2">
              <span className="text-3xl font-bold text-[#242124]">12.5<span className="text-lg font-medium ml-1 text-[#766F73]">k</span></span>
              <span className="text-[10px] font-bold text-[#4F5FD5] bg-[#F3F5FF] px-2 py-1 rounded-md">环比 ↑ 15%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden bg-white">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-[#766F73] uppercase tracking-widest">本月平均任务完成率</CardTitle>
            <CalendarCheck className="h-4 w-4 text-[#3B8F72]" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
             <div className="flex items-end justify-between leading-none mb-2">
              <span className="text-3xl font-bold text-[#242124]">89.2%</span>
              <span className="text-[10px] font-bold text-[#3B8F72] bg-[#EEF8F4] px-2 py-1 rounded-md">环比 ↑ 5.1%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden bg-white">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-[#766F73] uppercase tracking-widest">本月区域练习总次数</CardTitle>
             <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
             <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold text-[#242124]">3.1<span className="text-lg font-medium ml-1 text-[#766F73]">k</span></span>
              <span className="text-[10px] font-bold text-[#B9822B] bg-[#FFF7EA] px-2 py-1 rounded-md">约 1.2 万小时</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full flex-1 min-h-[460px]">

        {/* Col 1: 内容资产总览 (Content & Assets) */}
        <div className="flex flex-col">
          <Card className="rounded-2xl border border-[#E9E4DF] shadow-sm overflow-hidden flex-1 flex flex-col bg-white">
            <CardHeader className="p-4 border-b border-slate-50 bg-[#F8F5F3]/50">
               <CardTitle className="text-sm font-bold flex items-center text-[#242124]">
                 <Database className="h-4 w-4 mr-2 text-rose-500" /> 数字资产大盘 (区域通览)
               </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col space-y-4">
              <div className="flex flex-col gap-3 flex-1 content-start">
                 <div className="bg-[#F8F5F3] rounded-xl p-3 border border-[#E9E4DF] hover:border-rose-200 transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <BookOpen className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-[#242124]">区域在线课件</div>
                          <div className="text-[10px] text-[#766F73] font-medium mt-0.5">共计: 34 份</div>
                       </div>
                    </div>
                    <button className="text-[11px] font-bold text-rose-600 hover:text-white hover:bg-rose-500 border border-rose-200 hover:border-rose-500 rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0"><Plus className="h-3 w-3 mr-1" /> 新增</button>
                 </div>

                 <div className="bg-[#F8F5F3] rounded-xl p-3 border border-[#E9E4DF] hover:border-[#E8CCA0] transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg bg-[#F7E6C8] text-[#B9822B] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <MessageSquare className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-[#242124]">区域场景剧本</div>
                          <div className="text-[10px] text-[#766F73] font-medium mt-0.5">共计: 12 个</div>
                       </div>
                    </div>
                    <button className="text-[11px] font-bold text-[#B9822B] hover:text-white hover:bg-[#B9822B] border border-[#E8CCA0] hover:border-[#B9822B] rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0"><Plus className="h-3 w-3 mr-1" /> 新增</button>
                 </div>

                 <div className="bg-[#F8F5F3] rounded-xl p-3 border border-[#E9E4DF] hover:border-rose-200 transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <Database className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-[#242124]">区域题库题目</div>
                          <div className="text-[10px] text-[#766F73] font-medium mt-0.5">共计: 450 题</div>
                       </div>
                    </div>
                    <button className="text-[11px] font-bold text-rose-600 hover:text-white hover:bg-rose-500 border border-rose-200 hover:border-rose-500 rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0"><Plus className="h-3 w-3 mr-1" /> 新增</button>
                 </div>

                 <div className="bg-[#F8F5F3] rounded-xl p-3 border border-[#E9E4DF] hover:border-[#C8CEF8] transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg bg-[#EEF0FF] text-[#4F5FD5] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <ClipboardList className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-[#242124]">区域试卷总数</div>
                          <div className="text-[10px] text-[#766F73] font-medium mt-0.5">共计: 8 份</div>
                       </div>
                    </div>
                    <button className="text-[11px] font-bold text-[#4F5FD5] hover:text-white hover:bg-[#4F5FD5] border border-[#C8CEF8] hover:border-[#4F5FD5] rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0"><Plus className="h-3 w-3 mr-1" /> 新增</button>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Col 2: 区域作业与考试监控 (Tasks & Exams) */}
        <div className="flex flex-col">
           <Card className="rounded-2xl border border-[#E9E4DF] shadow-sm overflow-hidden flex-1 flex flex-col bg-white">
            <CardHeader className="p-4 border-b border-slate-50 bg-[#F8F5F3]/50 flex flex-row items-center justify-between">
               <CardTitle className="text-sm font-bold flex items-center text-[#242124]">
                 <CalendarCheck className="h-4 w-4 mr-2 text-rose-500" /> 区域任务监控 (进行中)
               </CardTitle>
               <button onClick={() => setShowAllTasks(true)} className="text-[10px] font-bold text-rose-600 flex items-center hover:underline">查看全部任务 <ArrowRight className="h-3 w-3 ml-1" /></button>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto flex-1 space-y-4">
               {/* Task 1 */}
               <div className="border border-[#E9E4DF] rounded-xl p-3 bg-white shadow-sm hover:shadow relative overflow-hidden transition-all group cursor-pointer">
                 <div className={`absolute top-0 left-0 w-1 h-full ${taskOneTone.barClass}`}></div>
                 <div className="flex justify-between items-start mb-2">
                    <h4 className={`text-xs font-bold text-[#242124] ${taskOneTone.hoverClass} transition-colors`}>夏季新品区域通关考核</h4>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[9px] py-0 border-[#E5DED8] text-[#5D565A] bg-[#F8F5F3]">区域</Badge>
                      <Badge variant="outline" className="text-[9px] py-0 border-rose-200 text-rose-600 bg-rose-50">考试任务</Badge>
                    </div>
                 </div>
                 <div className="flex justify-between text-[10px] text-[#766F73] mb-1.5 font-medium">
                    <span>280 / 342 人已完成</span>
                    <span className={`font-bold ${taskOneTone.textClass}`}>81%</span>
                 </div>
                 <Progress value={81} className="h-1.5 bg-slate-100" indicatorClassName={taskOneTone.indicatorClass} />
                 <div className="mt-3 text-[10px] text-[#9A9396] flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1 text-[#B9822B]" /> 截止日期: 本周五 (剩余 3 天)
                 </div>
               </div>

               {/* Task 2 */}
               <div className="border border-[#E9E4DF] rounded-xl p-3 bg-white shadow-sm hover:shadow relative overflow-hidden transition-all group cursor-pointer">
                 <div className={`absolute top-0 left-0 w-1 h-full ${taskTwoTone.barClass}`}></div>
                 <div className="flex justify-between items-start mb-2">
                    <h4 className={`text-xs font-bold text-[#242124] ${taskTwoTone.hoverClass} transition-colors`}>『敏感肌抗老』区域专项陪练</h4>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[9px] py-0 border-[#E5DED8] text-[#5D565A] bg-[#F8F5F3]">区域</Badge>
                      <Badge variant="outline" className="text-[9px] py-0 border-[#BFDCCF] text-[#3B8F72] bg-[#EEF8F4]">练习任务</Badge>
                    </div>
                 </div>
                 <div className="flex justify-between text-[10px] text-[#766F73] mb-1.5 font-medium">
                    <span>215 / 342 人已达标</span>
                    <span className={`font-bold ${taskTwoTone.textClass}`}>62%</span>
                 </div>
                 <Progress value={62} className="h-1.5 bg-slate-100" indicatorClassName={taskTwoTone.indicatorClass} />
                 <div className="mt-3 text-[10px] text-[#9A9396] flex items-center">
                    截止日期: 下周三
                 </div>
               </div>

               <button className="w-full mt-2 border border-dashed border-slate-300 rounded-xl py-3 flex items-center justify-center text-xs font-bold text-[#766F73] hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 transition-colors cursor-pointer">
                 <CalendarCheck className="h-3 w-3 mr-1" /> 新增区域任务
               </button>
            </CardContent>
          </Card>
        </div>

        {/* Col 3: AI 薄弱点洞察 (AI Insights) */}
        <div className="flex flex-col">
          <Card className="rounded-2xl border border-[#E9E4DF] shadow-sm overflow-hidden flex-1 flex flex-col bg-slate-800 text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <BrainCircuit className="h-24 w-24" />
            </div>
            <CardHeader className="p-4 border-b border-slate-700 bg-slate-900/50 z-30 relative group/insight-note">
               <span className="absolute right-3 top-3 z-20 h-4 min-w-4 rounded-full bg-blue-950 px-1 text-[9px] font-bold leading-4 text-white text-center shadow-sm backdrop-blur-sm">注</span>
               <CardTitle className="text-sm font-bold flex items-center text-white">
                 <BrainCircuit className="h-4 w-4 mr-2 text-rose-400" /> AI 自动洞察: 区域核心薄弱点
               </CardTitle>
               <CardDescription className="text-[10px] text-[#9A9396] mt-1">
                 该洞察基于区域近期数据生成，每周刷新
               </CardDescription>
               <div className="absolute right-3 top-full mt-2 hidden group-hover/insight-note:block z-[80] w-96 rounded-lg bg-blue-950/95 px-3 py-2 text-xs leading-relaxed text-white shadow-xl backdrop-blur-sm">
                 给研发：每周离线跑一次，只扫近 7-14 天聚合数据：任务完成率、考试题目错误率、陪练场景卡点率、语音转写标签统计、门店/区域 Top N。为降低 token，先用 SQL/规则聚合出 Top 20 候选，每个候选只传指标、趋势和 2-3 条短样例，不传全量原文/录音；结果缓存为周报，低置信度再二次调用模型。
               </div>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto flex-1 space-y-4 z-10 relative">

               <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-sm flex flex-col space-y-2">
                  <div className="flex items-start justify-between">
                     <span className="text-xs font-bold text-rose-100">TOP 1: 新品核心成分区分体验</span>
                     <Badge variant="destructive" className="bg-rose-500 text-white border-none text-[9px] py-0 px-1.5">72% 高频卡点</Badge>
                  </div>
                  <p className="text-[10px] text-[#C9C1C4] leading-relaxed"><span className="text-rose-400 font-bold tracking-wide">💡 AI 结论：</span> 区域内大量门店 BA 无法通过情景演练清晰表述双萃系列 "亲水亲油" 的黄金比例，当面对敏感肌顾客时极易背错浓度配比。</p>
               </div>

                <div className="p-3 rounded-xl border border-[#B9822B]/30 bg-[#B9822B]/10 backdrop-blur-sm flex flex-col space-y-2">
                  <div className="flex items-start justify-between">
                     <span className="text-xs font-bold text-amber-100">TOP 2: 竞对异议处理 (价格向)</span>
                     <Badge variant="outline" className="border-[#B9822B]/50 text-amber-300 text-[9px] py-0 px-1.5 font-bold">48% 卡顿超5s</Badge>
                  </div>
                  <p className="text-[10px] text-[#C9C1C4] leading-relaxed"><span className="text-amber-400 font-bold tracking-wide">💡 AI 结论：</span> 语音识别显示，员工在被质问 "区域内XX大楼的XX牌更便宜" 时，卡顿显著，缺少差异化卖点和情绪价值支撑。</p>
               </div>
            </CardContent>
          </Card>
        </div>

      </div>

      <Dialog open={showAllTasks} onOpenChange={setShowAllTasks}>
        <DialogContent className="sm:max-w-2xl flex flex-col max-h-[80vh]">
          <DialogHeader className="border-b border-[#E9E4DF] pb-4 shrink-0">
            <DialogTitle>区域任务监控 (所有进行中)</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto px-1 py-4 space-y-3">
            {RTM_ONGOING_TASKS.map(task => {
              const tone = getProgressTone(task.progress);
              return (
              <div key={task.id} className="border border-[#E9E4DF] rounded-xl p-4 bg-white shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${tone.barClass}`} />
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-bold text-[#242124]">{task.title}</h4>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px] py-0 border-[#E5DED8] text-[#5D565A] bg-[#F8F5F3]">{task.scope}</Badge>
                    <Badge variant="outline" className={`text-[10px] py-0 ${task.badgeClass}`}>{task.type}</Badge>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-[#766F73] mb-2 font-medium">
                  <span>{task.completed} / {task.total} 人已{task.type === '练习任务' ? '达标' : '完成'}</span>
                  <span className={`font-bold ${tone.textClass}`}>{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-2 bg-slate-100" indicatorClassName={tone.indicatorClass} />
                <div className="mt-4 text-xs text-[#766F73] font-medium flex items-center">
                  {task.isWarning && <AlertTriangle className="h-4 w-4 mr-1 text-[#B9822B]" />}
                  截止日期: {task.deadlineText}
                </div>
              </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

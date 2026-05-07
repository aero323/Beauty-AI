import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Target, Users, BookOpen, Clock, AlertTriangle, LayoutDashboard, CalendarCheck, Database, MessageSquare, TextSelect, Plus, ArrowRight, BrainCircuit, ClipboardList } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

export function RTMDashboard() {
  return (
    <div className="space-y-6 flex-1 flex flex-col pt-2">
      {/* Top KPIs - Auto Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden bg-white">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">区域注册 BA 总数</CardTitle>
            <Users className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold text-slate-800">342</span>
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
              <span className="text-3xl font-bold text-slate-800">12.5<span className="text-lg font-medium ml-1 text-slate-500">k</span></span>
              <span className="text-[10px] font-bold text-fuchsia-600 bg-fuchsia-50 px-2 py-1 rounded-md">环比 ↑ 15%</span>
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
              <span className="text-3xl font-bold text-slate-800">89.2%</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">环比 ↑ 5.1%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden bg-white">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">本月区域练习总次数</CardTitle>
             <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
             <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold text-slate-800">3.1<span className="text-lg font-medium ml-1 text-slate-500">k</span></span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">约 1.2 万小时</span>
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
                 <Database className="h-4 w-4 mr-2 text-indigo-500" /> 数字资产大盘 (区域通览)
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
                          <div className="text-sm font-bold text-slate-800">区域在线课件</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">共计: 34 份</div>
                       </div>
                    </div>
                    <button className="text-[11px] font-bold text-indigo-600 hover:text-white hover:bg-indigo-500 border border-indigo-200 hover:border-indigo-500 rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0"><Plus className="h-3 w-3 mr-1" /> 新增</button>
                 </div>

                 <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-amber-200 transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <MessageSquare className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-slate-800">区域场景剧本</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">共计: 12 个</div>
                       </div>
                    </div>
                    <button className="text-[11px] font-bold text-amber-600 hover:text-white hover:bg-amber-500 border border-amber-200 hover:border-amber-500 rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0"><Plus className="h-3 w-3 mr-1" /> 新增</button>
                 </div>

                 <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-blue-200 transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <Database className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-slate-800">区域题库题目</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">共计: 450 题</div>
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
                          <div className="text-sm font-bold text-slate-800">区域试卷总数</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">共计: 8 份</div>
                       </div>
                    </div>
                    <button className="text-[11px] font-bold text-fuchsia-600 hover:text-white hover:bg-fuchsia-500 border border-fuchsia-200 hover:border-fuchsia-500 rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0"><Plus className="h-3 w-3 mr-1" /> 新增</button>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Col 2: 区域作业与考试监控 (Tasks & Exams) */}
        <div className="flex flex-col">
           <Card className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col bg-white">
            <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/50 flex flex-row items-center justify-between">
               <CardTitle className="text-sm font-bold flex items-center text-slate-800">
                 <CalendarCheck className="h-4 w-4 mr-2 text-indigo-500" /> 区域任务监控 (进行中)
               </CardTitle>
               <button className="text-[10px] font-bold text-indigo-600 flex items-center hover:underline">查看全部任务 <ArrowRight className="h-3 w-3 ml-1" /></button>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto flex-1 space-y-4">
               {/* Task 1 */}
               <div className="border border-slate-100 rounded-xl p-3 bg-white shadow-sm hover:shadow relative overflow-hidden transition-all group cursor-pointer">
                 <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                 <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">夏季新品区域通关考核</h4>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[9px] py-0 border-slate-200 text-slate-600 bg-slate-50">区域</Badge>
                      <Badge variant="outline" className="text-[9px] py-0 border-indigo-200 text-indigo-600 bg-indigo-50">考试任务</Badge>
                    </div>
                 </div>
                 <div className="flex justify-between text-[10px] text-slate-500 mb-1.5 font-medium">
                    <span>280 / 342 人已完成</span>
                    <span className="text-slate-800 font-bold">81%</span>
                 </div>
                 <Progress value={81} className="h-1.5 [&>div]:bg-indigo-500" />
                 <div className="mt-3 text-[10px] text-slate-400 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" /> 截止日期: 本周五 (剩余 3 天)
                 </div>
               </div>

               {/* Task 2 */}
               <div className="border border-slate-100 rounded-xl p-3 bg-white shadow-sm hover:shadow relative overflow-hidden transition-all group cursor-pointer">
                 <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                 <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">『敏感肌抗老』区域专项陪练</h4>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[9px] py-0 border-slate-200 text-slate-600 bg-slate-50">区域</Badge>
                      <Badge variant="outline" className="text-[9px] py-0 border-emerald-200 text-emerald-600 bg-emerald-50">练习任务</Badge>
                    </div>
                 </div>
                 <div className="flex justify-between text-[10px] text-slate-500 mb-1.5 font-medium">
                    <span>215 / 342 人已达标</span>
                    <span className="text-slate-800 font-bold">62%</span>
                 </div>
                 <Progress value={62} className="h-1.5 [&>div]:bg-emerald-500" />
                 <div className="mt-3 text-[10px] text-slate-400 flex items-center">
                    截止日期: 下周三
                 </div>
               </div>

               <button className="w-full mt-2 border border-dashed border-slate-300 rounded-xl py-3 flex items-center justify-center text-xs font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors cursor-pointer">
                 <CalendarCheck className="h-3 w-3 mr-1" /> 新增区域任务
               </button>
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
                 <BrainCircuit className="h-4 w-4 mr-2 text-indigo-400" /> AI 自动洞察: 区域核心薄弱点
               </CardTitle>
               <CardDescription className="text-[10px] text-slate-400 mt-1">
                 该洞察基于区域近期数据生成，每周刷新
               </CardDescription>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto flex-1 space-y-4 z-10 relative">
               
               <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-sm flex flex-col space-y-2">
                  <div className="flex items-start justify-between">
                     <span className="text-xs font-bold text-rose-100">TOP 1: 新品核心成分区分体验</span>
                     <Badge variant="destructive" className="bg-rose-500 text-white border-none text-[9px] py-0 px-1.5">72% 高频卡点</Badge>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed"><span className="text-rose-400 font-bold tracking-wide">💡 AI 结论：</span> 区域内大量门店 BA 无法通过情景演练清晰表述双萃系列 "亲水亲油" 的黄金比例，当面对敏感肌顾客时极易背错浓度配比。</p>
               </div>
               
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm flex flex-col space-y-2">
                  <div className="flex items-start justify-between">
                     <span className="text-xs font-bold text-amber-100">TOP 2: 竞对异议处理 (价格向)</span>
                     <Badge variant="outline" className="border-amber-500/50 text-amber-300 text-[9px] py-0 px-1.5 font-bold">48% 卡顿超5s</Badge>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed"><span className="text-amber-400 font-bold tracking-wide">💡 AI 结论：</span> 语音识别显示，员工在被质问 "区域内XX大楼的XX牌更便宜" 时，卡顿显著，缺少差异化卖点和情绪价值支撑。</p>
               </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}

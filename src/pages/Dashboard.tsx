import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowUpRight, ArrowDownRight, AlertTriangle, ChevronRight, User, ChevronLeft, Building, BookOpen, PlayCircle, Target, Users, Clock, LayoutDashboard, CalendarCheck, Database, MessageSquare, TextSelect, Plus, ArrowRight, ClipboardList } from 'lucide-react';

export function RMDashboard() {
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
      <div className="flex justify-between flex-row items-center">
        <h1 className="text-2xl font-bold text-slate-800">区域数据</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden bg-white">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">区域注册BA总数</CardTitle>
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

      {/* Row 1: Assets and Tasks (Inherited from RTM) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        {/* Col 1: 内容资产总览 (Content & Assets) */}
        <div className="flex flex-col">
          <Card className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col bg-white">
            <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/50">
               <CardTitle className="text-sm font-bold flex items-center text-slate-800">
                 <Database className="h-4 w-4 mr-2 text-indigo-500" /> 数字资产大盘 (区域通览)
               </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col space-y-4 overflow-y-auto">
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
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Col 2: 区域作业与考试监控 (Tasks & Exams) */}
        <div className="lg:col-span-2 flex flex-col">
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
                    <Badge variant="outline" className="text-[9px] py-0 border-indigo-200 text-indigo-600 bg-indigo-50">综合任务</Badge>
                 </div>
                 <div className="flex justify-between text-[10px] text-slate-500 mb-1.5 font-medium">
                    <span>280 / 342 人已完成</span>
                    <span className="text-slate-800">81%</span>
                 </div>
                 <Progress value={81} className="h-1.5 [&>div]:bg-indigo-500 bg-slate-100" />
                 <div className="mt-3 flex justify-between items-center text-[10px] text-slate-400">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> 截止: 本周五 23:59</span>
                 </div>
               </div>

               {/* Task 2 */}
               <div className="border border-slate-100 rounded-xl p-3 bg-white shadow-sm hover:shadow relative overflow-hidden transition-all group cursor-pointer">
                 <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                 <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors">新客破冰沟通场景演练</h4>
                    <Badge variant="outline" className="text-[9px] py-0 border-amber-200 text-amber-600 bg-amber-50">AI 陪练</Badge>
                 </div>
                 <div className="flex justify-between text-[10px] text-slate-500 mb-1.5 font-medium">
                    <span>145 / 342 人已达标</span>
                    <span className="text-slate-800">42%</span>
                 </div>
                 <Progress value={42} className="h-1.5 [&>div]:bg-amber-500 bg-slate-100" />
                 <div className="mt-3 flex justify-between items-center text-[10px] text-slate-400">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> 截止: 2周后</span>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 2: Staff/Store Tabs and High Risk Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts / High Risk */}
        <Card className="lg:col-span-1 rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <CardHeader className="p-5 border-b border-slate-50 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-bold flex items-center">
               <span className="w-2 h-2 bg-rose-500 rounded-full mr-2"></span>
               高风险 BA <span className="ml-2 text-xs font-normal text-slate-400 px-2 py-0.5 bg-slate-100 rounded-full">3人需关注</span>
            </CardTitle>
            <button className="text-xs text-rose-600 font-semibold hover:underline">一键处理</button>
          </CardHeader>
          <CardContent className="p-2 flex-1">
            <div className="space-y-2 overflow-hidden">
              {/* Alert 1 */}
              <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between group cursor-pointer hover:bg-rose-50 transition-colors">
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 rounded-full bg-white border-2 border-rose-200 flex items-center justify-center font-bold text-rose-700">R</div>
                   <div>
                     <p className="text-sm font-bold text-slate-900">Rina <span className="text-xs font-normal text-slate-400 tracking-tight">• Toko Mal Kelapa Gading</span></p>
                     <p className="text-[11px] text-rose-600 mt-0.5">连续7天未登录 | 考试 52分 | 陪练 0次</p>
                   </div>
                </div>
                <button className="bg-rose-600 text-white text-[10px] px-3 py-1.5 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity">重点跟进</button>
              </div>

               {/* Alert 2 */}
               <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 flex items-center justify-between cursor-pointer hover:bg-amber-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-amber-200 flex items-center justify-center font-bold text-amber-700">D</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Dewi <span className="text-xs font-normal text-slate-400 tracking-tight">• Toko Pondok Indah</span></p>
                    <p className="text-[11px] text-amber-600 mt-0.5">参与度低：金句跟读20% | 本周仅登录1次</p>
                  </div>
                </div>
                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest hidden sm:inline-block">警告</span>
              </div>

               {/* Alert 3 */}
               <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700">S</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Sari <span className="text-xs font-normal text-slate-400 tracking-tight">• Toko Gandaria City</span></p>
                    <p className="text-[11px] text-slate-500 mt-0.5 italic">考试存疑：AI监考检测到切屏2次</p>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-slate-400 border border-slate-200 px-3 py-1.5 rounded-full bg-white hidden sm:block">查看日志</button>
              </div>
            </div>
          </CardContent>
          <div className="p-4 text-center border-t border-slate-50 bg-white">
            <p className="text-[11px] text-slate-400 font-medium">由AI基于活跃度预警模型自动计算 (权重20.5%)</p>
          </div>
        </Card>

        {/* Drill down / Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="staff" className="w-full flex-1 flex flex-col min-h-[460px]">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-12 p-0">
              <TabsTrigger value="staff" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-6 data-[state=active]:shadow-none data-[state=active]:bg-transparent font-bold">区域员工排行</TabsTrigger>
              <TabsTrigger value="store" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-6 data-[state=active]:shadow-none data-[state=active]:bg-transparent font-bold">门店培训排行</TabsTrigger>
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
                           <p className="text-xs text-slate-500">Toko Mal Kelapa Gading | 入职 6 个月</p>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        <div className="space-y-4">
                           <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm h-full flex flex-col">
                             <h4 className="text-xs font-bold text-slate-800 mb-4 tracking-wider flex items-center"><BookOpen className="h-4 w-4 mr-2 text-indigo-500" /> 学习与考试</h4>
                             <div className="space-y-4 flex-1">
                               <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                                 <div className="flex justify-between text-xs mb-2">
                                   <span className="text-slate-500 font-medium">本月完课率 (3/8)</span>
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
                              <button className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center transition-colors group-hover:underline">
                                 发送学习跟进提醒至店长 <ChevronRight className="h-3 w-3 ml-1" />
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                     <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/50">
                        <CardTitle className="text-sm font-bold text-slate-800 flex justify-between items-center">
                          <span className="flex items-center"><User className="h-4 w-4 mr-2 text-indigo-500"/> 区域员工学习力排名</span>
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase tracking-widest mt-1">点击员工姓名下钻个人履历</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 overflow-y-auto flex-1">
                         <table className="w-full text-sm">
                          <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-wider text-left border-y border-slate-100 sticky top-0">
                            <tr>
                              <th className="py-2.5 px-5 font-bold w-12 text-center">Rank</th>
                              <th className="py-2.5 px-4 font-bold">员工姓名</th>
                              <th className="py-2.5 px-2 font-bold hidden sm:table-cell w-1/4">所属门店</th>
                              <th className="py-2.5 px-3 font-bold text-center">任务完成率</th>
                              <th className="py-2.5 px-5 font-bold text-right text-indigo-600">最新考试平均分</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleStaffClick('Siti')}>
                              <td className="py-3 px-5 font-bold text-amber-500 text-center">1</td>
                              <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Siti</td>
                              <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell">Toko Senayan City</td>
                              <td className="py-3 px-3 text-center font-medium text-slate-700">100%</td>
                              <td className="py-3 px-5 text-right font-bold text-slate-800 text-base">98</td>
                            </tr>
                            <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleStaffClick('Fitri')}>
                              <td className="py-3 px-5 font-bold text-slate-400 text-center">2</td>
                              <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Fitri</td>
                              <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell">Toko Pacific Place</td>
                              <td className="py-3 px-3 text-center font-medium text-slate-700">95%</td>
                              <td className="py-3 px-5 text-right font-bold text-slate-800 text-base">95</td>
                            </tr>
                            <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleStaffClick('Ayu')}>
                              <td className="py-3 px-5 font-bold text-amber-700 text-center">3</td>
                              <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Ayu</td>
                              <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell">Toko Gandaria City</td>
                              <td className="py-3 px-3 text-center font-medium text-slate-700">90%</td>
                              <td className="py-3 px-5 text-right font-bold text-slate-800 text-base">91</td>
                            </tr>
                            <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleStaffClick('Maya')}>
                              <td className="py-3 px-5 font-bold text-slate-400 text-center">4</td>
                              <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Maya</td>
                              <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell">Toko Pondok Indah</td>
                              <td className="py-3 px-3 text-center font-medium text-slate-700">85%</td>
                              <td className="py-3 px-5 text-right font-bold text-slate-800 text-base">86</td>
                            </tr>
                             <tr className="hover:bg-rose-50/50 transition-colors group cursor-pointer bg-rose-50/20" onClick={() => handleStaffClick('Rina')}>
                              <td className="py-3 px-5 font-bold text-rose-400 text-center">18</td>
                              <td className="py-3 px-4 font-bold text-rose-600 group-hover:text-rose-800 transition-colors flex items-center">
                                Rina 
                                <span className="ml-2 px-1.5 py-0 bg-rose-100 text-[9px] rounded text-rose-700 font-bold hidden xl:inline-block">高退流风险</span>
                              </td>
                                <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell">T. Kelapa Gading</td>
                              <td className="py-3 px-3 text-center font-medium text-rose-600">30%</td>
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
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">完课率</p>
                             <p className="text-2xl font-bold text-emerald-600">92<span className="text-xs text-emerald-500 font-medium ml-1">%</span></p>
                          </div>
                           <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm text-center">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">优秀 BA 数</p>
                             <p className="text-2xl font-bold text-slate-800">4<span className="text-xs text-slate-500 font-medium ml-1">人</span></p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm text-center border-b-2 border-b-indigo-400">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">月度均分</p>
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
                               该门店本月完课率及陪练活跃度均居区域前列。系统对该店高分陪练录音进行文本检索，其在<span className="font-mono bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100 font-medium">抗老系列知识</span>和<span className="font-mono bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100 font-medium">价格异议处理</span>场景中的标准关键词命中率达 85% 以上。
                               <br/><span className="mt-1 block text-slate-500">建议可从其陪练记录中挑选 2-3 篇高分对局录音，在区域企微群内作为标准沟通话术进行分享。</span>
                             </div>
                          </div>
                        </div>
                    </div>
                 ) : (
                    <div className="flex flex-col h-full bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                       <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/50">
                        <CardTitle className="text-sm font-bold text-slate-800 flex justify-between items-center">
                          <span className="flex items-center"><Building className="h-4 w-4 mr-2 text-indigo-500" /> 区域门店综合榜 (雅加达南区)</span>
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase tracking-widest mt-1">点击门店进入管理微档案</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 overflow-y-auto flex-1">
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
                            <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleStoreClick('Toko Senayan City')}>
                              <td className="py-3 px-5 font-bold text-amber-500 text-center">1</td>
                              <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Toko Senayan City</td>
                               <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell text-center font-mono">6/6</td>
                              <td className="py-3 px-3 text-center font-medium text-slate-700">100%</td>
                              <td className="py-3 px-5 text-right font-bold text-slate-800 text-base">92</td>
                            </tr>
                            <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleStoreClick('Toko Pacific Place')}>
                              <td className="py-3 px-5 font-bold text-slate-400 text-center">2</td>
                              <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Toko Pacific Place</td>
                              <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell text-center font-mono">8/8</td>
                              <td className="py-3 px-3 text-center font-medium text-slate-700">95%</td>
                              <td className="py-3 px-5 text-right font-bold text-slate-800 text-base">87</td>
                            </tr>
                            <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleStoreClick('Toko Gandaria City')}>
                              <td className="py-3 px-5 font-bold text-amber-700 text-center">3</td>
                              <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Toko Gandaria City</td>
                              <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell text-center font-mono">5/5</td>
                              <td className="py-3 px-3 text-center font-medium text-slate-700">90%</td>
                              <td className="py-3 px-5 text-right font-bold text-slate-800 text-base">81</td>
                            </tr>
                            <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleStoreClick('Toko Pondok Indah')}>
                              <td className="py-3 px-5 font-bold text-slate-400 text-center">4</td>
                              <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Toko Pondok Indah</td>
                              <td className="py-3 px-2 text-[10px] text-slate-500 hidden sm:table-cell text-center font-mono">4/5</td>
                              <td className="py-3 px-3 text-center font-medium text-slate-700">80%</td>
                              <td className="py-3 px-5 text-right font-bold text-slate-800 text-base">73</td>
                            </tr>
                            <tr className="hover:bg-rose-50/50 transition-colors group cursor-pointer bg-rose-50/20" onClick={() => handleStoreClick('Toko Kelapa Gading')}>
                              <td className="py-3 px-5 font-bold text-rose-500 text-center">5</td>
                              <td className="py-3 px-4 font-bold text-rose-600 group-hover:text-rose-800 transition-colors">Toko Kelapa Gading</td>
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
      </div>
      
      {/* Footer AI Status Bar (Context for HQ Trainer) */}
      <div className="sticky bottom-0 mt-8 h-12 bg-indigo-900/95 backdrop-blur-sm rounded-xl flex items-center px-6 justify-between text-white shadow-xl shrink-0 z-50 border border-indigo-800/50 translate-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
          <p className="text-xs font-medium">AI 任务执行中：<span className="opacity-80 font-normal underline decoration-indigo-400/50 underline-offset-2">夏季新品手册_2024.pdf</span> 正在解析提取...</p>
        </div>
        <div className="flex space-x-4 items-center">
          <div className="w-32 h-1.5 bg-indigo-950 rounded-full overflow-hidden border border-indigo-800/30">
            <div className="h-full bg-indigo-400 w-2/3 shadow-[0_0_10px_rgba(129,140,248,0.5)]"></div>
          </div>
          <span className="text-[10px] font-bold tracking-wider">67%</span>
        </div>
      </div>
    </div>
  );
}

// Icons placeholders
function ActivityIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> }
function PlayIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg> }
function CheckCircleIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> }


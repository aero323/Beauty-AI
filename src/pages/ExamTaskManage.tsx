import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Calendar, Users, FileText, CheckCircle, Clock, AlertCircle, BarChart3, Edit, PlayCircle, Search, Eye, AlertTriangle, TrendingUp, HelpCircle, Trophy } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

type TaskStatus = '待开始' | '考试中' | '考试结束待复核' | '复核结束';

interface ExamTask {
  id: string;
  title: string;
  status: TaskStatus;
  publishTime: string;
  targetCount: number;
  submittedCount: number;
  aiGraded: boolean;
  avgScore?: number;
}

const MOCK_TASKS: ExamTask[] = [
  {
    id: 't1',
    title: 'Q3 新品知识通关考核 (2023)',
    status: '待开始',
    publishTime: '2023-11-01 10:00',
    targetCount: 1200,
    submittedCount: 0,
    aiGraded: false
  },
  {
    id: 't2',
    title: '防晒季：夏日畅销单品销售话术',
    status: '考试中',
    publishTime: '2023-10-15 00:00',
    targetCount: 850,
    submittedCount: 421,
    aiGraded: false
  },
  {
    id: 't3',
    title: '敏感肌护理基础：成分剖析与问答',
    status: '考试结束待复核',
    publishTime: '2023-09-20 09:00',
    targetCount: 500,
    submittedCount: 480,
    aiGraded: true
  },
  {
    id: 't4',
    title: '春季妆容趋势与实操笔试',
    status: '复核结束',
    publishTime: '2023-08-01 10:00',
    targetCount: 1000,
    submittedCount: 980,
    aiGraded: true,
    avgScore: 88.5
  }
];

const MOCK_CANDIDATES = [
  { id: 'BA001', name: 'Siti Aminah', store: 'Jakarta Grand Indonesia', status: '已交卷', submitTime: '10:45' },
  { id: 'BA002', name: 'Budi Santoso', store: 'Jakarta Plaza Senayan', status: '考试中', submitTime: '-' },
  { id: 'BA003', name: 'Ayu Lestari', store: 'Surabaya Tunjungan Plaza', status: '未开始', submitTime: '-' },
  { id: 'BA004', name: 'Rizky Pratama', store: 'Bali Beachwalk', status: '已交卷', submitTime: '10:52' },
  { id: 'BA005', name: 'Dewi Sartika', store: 'Bandung Trans Studio', status: '考试中', submitTime: '-' },
  { id: 'BA006', name: 'Agung Setiawan', store: 'Medan Centre Point', status: '已交卷', submitTime: '11:05' },
  { id: 'BA007', name: 'Putri Maharani', store: 'Yogyakarta Hartono Mall', status: '考试中', submitTime: '-' },
];

const MOCK_REVIEW_CANDIDATES = [
  { id: 'BA001', name: 'Siti Aminah', store: 'Jakarta Grand Indonesia', aiScore: 85, reviewStatus: '待复核' },
  { id: 'BA004', name: 'Rizky Pratama', store: 'Bali Beachwalk', aiScore: 92, reviewStatus: '已复核' },
  { id: 'BA006', name: 'Reza Rahadian', store: 'Medan Centre Point', aiScore: 78, reviewStatus: '待复核' },
  { id: 'BA007', name: 'Dian Sastrowardoyo', store: 'Makassar Trans Studio', aiScore: 88, reviewStatus: '待复核' },
  { id: 'BA008', name: 'Maya Sari', store: 'Yogyakarta Hartono Mall', aiScore: 95, reviewStatus: '已复核' },
];

const MOCK_INSIGHT_DATA = {
  total: 1000,
  submitted: 980,
  passRate: 92,
  avgScore: 88.5,
  highestScore: 100,
  lowestScore: 56,
  knowledgeGaps: [
    { title: '敏感肌换季护肤步骤', errorRate: 35 },
    { title: '顾客异议处理：大促价格对比', errorRate: 28 },
    { title: '双萃精华核心成分原理解析', errorRate: 22 }
  ],
  topPerformers: [
    { name: 'Siti Aminah', store: 'Jakarta Grand Indonesia', score: 100 },
    { name: 'Rizky Pratama', store: 'Bali Beachwalk', score: 98 },
    { name: 'Putri Maharani', store: 'Yogyakarta Hartono Mall', score: 97 },
  ]
};

export function ExamTaskManage({ isReadOnly = false }: { isReadOnly?: boolean }) {
  const [tasks] = useState<ExamTask[]>(MOCK_TASKS);
  const [activeTab, setActiveTab] = useState<'全部' | TaskStatus>('全部');
  const [monitoringTask, setMonitoringTask] = useState<ExamTask | null>(null);
  const [reviewingTask, setReviewingTask] = useState<ExamTask | null>(null);
  const [insightTask, setInsightTask] = useState<ExamTask | null>(null);
  
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case '待开始':
        return <Badge variant="outline" className="text-slate-500 border-slate-300 bg-slate-50 whitespace-nowrap">待开始</Badge>;
      case '考试中':
        return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 whitespace-nowrap">考试中</Badge>;
      case '考试结束待复核':
        return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 whitespace-nowrap">待复核</Badge>;
      case '复核结束':
        return <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 whitespace-nowrap">已结束</Badge>;
    }
  };

  const filteredTasks = tasks.filter(t => activeTab === '全部' || t.status === activeTab);

  const TABS = ['全部', '待开始', '考试中', '考试结束待复核', '复核结束'] as const;

  return (
    <div className="flex-1 flex flex-col pt-2 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">考试任务管理</h1>
          <p className="text-xs text-slate-500 mt-1">查看和追踪所有已发布的考试任务状态</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-100/50 p-1 rounded-xl shrink-0 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              {tab === '考试结束待复核' ? '待复核' : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filteredTasks.map(task => (
          <Card key={task.id} className="rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center gap-6">
              
              {/* Info section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusBadge(task.status)}
                  <div className="flex items-center text-[10px] text-slate-400 font-medium font-mono">
                    <Calendar className="w-3 h-3 mr-1" />
                    {task.publishTime} 发布
                  </div>
                </div>
                <CardTitle className="text-base font-bold text-slate-800 line-clamp-1">
                  {task.title}
                </CardTitle>
              </div>

              {/* Status specific content section */}
              <div className="w-full md:w-64 shrink-0">
                {task.status === '待开始' && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">尚未开始</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">预计推送给 {task.targetCount} 名考生</p>
                    </div>
                  </div>
                )}
                
                {task.status === '考试中' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <div className="text-[11px] text-slate-500 font-medium">答题进度 ({task.submittedCount}/{task.targetCount})</div>
                      <div className="text-sm font-bold text-blue-600">
                        {Math.round((task.submittedCount / task.targetCount) * 100)}%
                      </div>
                    </div>
                    <Progress value={(task.submittedCount / task.targetCount) * 100} className="h-1.5 [&>div]:bg-blue-500" />
                  </div>
                )}

                {task.status === '考试结束待复核' && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                     <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                       <AlertCircle className="w-4 h-4 text-amber-500" />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-amber-800">AI阅卷完毕</p>
                       <p className="text-[10px] text-amber-600 mt-0.5">已有 {task.submittedCount} 份答卷等待人工复核</p>
                     </div>
                  </div>
                )}

                {task.status === '复核结束' && (
                  <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-medium">参考</span>
                      <span className="text-sm font-bold text-slate-700">{task.submittedCount} 人</span>
                    </div>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-emerald-600 font-medium">平均分</span>
                      <span className="text-sm font-bold text-emerald-700">{task.avgScore} 分</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action section */}
              <div className="w-full md:w-36 shrink-0 md:border-l md:border-slate-100 md:pl-6 flex justify-end">
                 {task.status === '待开始' && (
                   <Button variant="outline" className="w-full text-xs font-bold hover:bg-slate-50 border-slate-200">
                     <FileText className="w-3.5 h-3.5 mr-1.5" /> 详情
                   </Button>
                 )}
                 {task.status === '考试中' && (
                   <Button onClick={() => setMonitoringTask(task)} className="w-full text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border-none shadow-none">
                     <Users className="w-3.5 h-3.5 mr-1.5" /> 监控
                   </Button>
                 )}
                 {task.status === '考试结束待复核' && (
                   isReadOnly ? (
                     <Button variant="outline" className="w-full text-xs font-bold bg-amber-50/50 text-amber-600 border-amber-200 pointer-events-none">
                       <Clock className="w-3.5 h-3.5 mr-1.5" /> 复核中
                     </Button>
                   ) : (
                     <Button onClick={() => setReviewingTask(task)} className="w-full text-xs font-bold bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 shadow-none">
                       <Edit className="w-3.5 h-3.5 mr-1.5" /> 复核
                     </Button>
                   )
                 )}
                 {task.status === '复核结束' && (
                   <div className="flex gap-2">
                     <Button onClick={() => setReviewingTask(task)} className="flex-1 text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 border-none shadow-none px-0">
                       <FileText className="w-3.5 h-3.5 mr-1" /> 成绩
                     </Button>
                     <Button onClick={() => setInsightTask(task)} className="flex-1 text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none shadow-none px-0">
                       <BarChart3 className="w-3.5 h-3.5 mr-1" /> 洞察
                     </Button>
                   </div>
                 )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredTasks.length === 0 && (
           <div className="text-center py-12 text-slate-400">
             <AlertCircle className="w-8 h-8 opacity-20 mx-auto mb-3" />
             <p className="text-sm font-medium">当前状态下暂无考试任务</p>
           </div>
        )}
      </div>

      {/* Monitoring Dialog */}
      <Dialog open={!!monitoringTask} onOpenChange={(open) => !open && setMonitoringTask(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader className="border-b border-slate-100 pb-4 shrink-0">
            <DialogTitle className="flex items-center text-slate-800">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              {monitoringTask?.title} - 实时监控
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pt-4 flex flex-col min-h-0">
            <div className="grid grid-cols-3 gap-4 mb-6 shrink-0">
               <Card className="bg-slate-50 border-slate-100 shadow-none">
                 <CardContent className="p-4 flex items-center justify-between">
                   <div>
                     <p className="text-xs font-medium text-slate-500 mb-1">目标人数</p>
                     <p className="text-xl font-bold text-slate-800">{monitoringTask?.targetCount}</p>
                   </div>
                   <Users className="w-8 h-8 text-blue-200" />
                 </CardContent>
               </Card>
               <Card className="bg-slate-50 border-slate-100 shadow-none">
                 <CardContent className="p-4 flex items-center justify-between">
                   <div>
                     <p className="text-xs font-medium text-slate-500 mb-1">已交卷</p>
                     <p className="text-xl font-bold text-blue-600">{monitoringTask?.submittedCount}</p>
                   </div>
                   <CheckCircle className="w-8 h-8 text-blue-200" />
                 </CardContent>
               </Card>
               <Card className="bg-slate-50 border-slate-100 shadow-none">
                 <CardContent className="p-4 flex items-center justify-between">
                   <div>
                     <p className="text-xs font-medium text-slate-500 mb-1">交卷率</p>
                     <p className="text-xl font-bold text-slate-800">{monitoringTask ? Math.round((monitoringTask.submittedCount / monitoringTask.targetCount) * 100) : 0}%</p>
                   </div>
                   <BarChart3 className="w-8 h-8 text-blue-200" />
                 </CardContent>
               </Card>
            </div>
            
            <div className="flex justify-between items-center mb-4 shrink-0">
               <h3 className="text-sm font-bold text-slate-800">考生明细 (正在实时刷新)</h3>
               <div className="relative">
                 <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                 <input type="text" placeholder="搜索免考工号、姓名、门店..." className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64" />
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
                     <th className="p-3 font-medium text-slate-500 w-32">交卷时间</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 bg-white">
                    {MOCK_CANDIDATES.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-slate-500 font-mono text-xs">{c.id}</td>
                        <td className="p-3 font-medium text-slate-800">{c.name}</td>
                        <td className="p-3 text-slate-600">{c.store}</td>
                        <td className="p-3">
                          {c.status === '已交卷' && <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none font-normal">已交卷</Badge>}
                          {c.status === '考试中' && <Badge variant="outline" className="bg-blue-50 text-blue-600 border-none font-normal">正在答题</Badge>}
                          {c.status === '未开始' && <Badge variant="outline" className="bg-slate-100 text-slate-500 border-none font-normal">尚未进入</Badge>}
                        </td>
                        <td className="p-3 text-slate-500 text-xs font-mono">{c.submitTime}</td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={!!reviewingTask} onOpenChange={(open) => !open && setReviewingTask(null)}>
        <DialogContent className="sm:max-w-5xl max-h-[85vh] flex flex-col">
          <DialogHeader className="border-b border-slate-100 pb-4 shrink-0">
            <DialogTitle className="flex items-center text-slate-800">
              {reviewingTask?.status === '复核结束' ? (
                <>
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  {reviewingTask?.title} - 完整考卷与成绩单
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
                  {reviewingTask?.title} - 待人工复核
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pt-4 flex flex-col min-h-0">
            
            {reviewingTask?.status !== '复核结束' && (
              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl mb-6 flex items-start gap-4 shrink-0">
                 <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-sm font-bold text-amber-800 mb-1">主观题/实操题AI阅卷完成</h3>
                   <p className="text-xs text-amber-700/80 mb-3 leading-relaxed">
                     本次考试包含 <span className="font-bold">2个AI对话实操题</span> 和 <span className="font-bold">1个简答题</span>。系统已经完成全部 480 份试卷的初步打分。请总部培训师对低分卷、可疑卷进行重点抽查，并可以通过录音核听纠正AI的评分，确认无误后结束复核发布最终成绩。
                   </p>
                   <div className="flex gap-4">
                      <div className="bg-white px-3 py-1.5 rounded-md border border-amber-200 flex items-center">
                        <span className="text-[10px] text-amber-600 font-bold mr-2">待复核数量</span>
                        <span className="text-sm font-bold text-slate-800">12 份</span>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-md border border-amber-200 flex items-center">
                        <span className="text-[10px] text-amber-600 font-bold mr-2">当前AI均分</span>
                        <span className="text-sm font-bold text-slate-800">88.5 分</span>
                      </div>
                   </div>
                 </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-4 shrink-0">
               <h3 className="text-sm font-bold text-slate-800">考生考卷列表</h3>
               <div className="flex gap-2">
                 <div className="relative">
                   <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                   <input type="text" placeholder="搜索姓名或工号..." className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-48" />
                 </div>
                 {reviewingTask?.status !== '复核结束' && (
                   <select className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-40">
                     <option>所有试卷</option>
                     <option>低于 80 分</option>
                     <option>分数异常差异重点</option>
                   </select>
                 )}
               </div>
            </div>

            <div className="flex-1 overflow-auto border border-slate-200 rounded-xl">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                   <tr>
                     <th className="p-3 font-medium text-slate-500 w-24">工号</th>
                     <th className="p-3 font-medium text-slate-500 w-32">姓名</th>
                     <th className="p-3 font-medium text-slate-500">门店</th>
                     <th className="p-3 font-medium text-slate-500 w-24">{reviewingTask?.status === '复核结束' ? '最终得分' : 'AI打分'}</th>
                     <th className="p-3 font-medium text-slate-500 w-24">状态</th>
                     <th className="p-3 font-medium text-slate-500 w-32 text-right">操作</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 bg-white">
                    {MOCK_REVIEW_CANDIDATES.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-slate-500 font-mono text-xs">{c.id}</td>
                        <td className="p-3 font-medium text-slate-800">{c.name}</td>
                        <td className="p-3 text-slate-600">{c.store}</td>
                        <td className="p-3">
                          <span className={`font-bold ${c.aiScore < 80 ? 'text-red-500' : 'text-slate-800'}`}>{c.aiScore} 分</span>
                        </td>
                        <td className="p-3">
                          {reviewingTask?.status === '复核结束' ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none font-normal">已评分</Badge>
                          ) : c.reviewStatus === '已复核' ? (
                            <Badge variant="outline" className="bg-slate-100 text-slate-500 border-transparent font-normal">已复核</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 font-bold">待复核</Badge>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm" className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                            <Eye className="w-4 h-4 mr-1.5" /> 查阅原卷
                          </Button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>

          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
             {reviewingTask?.status === '复核结束' ? (
               <Button variant="outline" onClick={() => setReviewingTask(null)}>关闭</Button>
             ) : (
               <>
                 <Button variant="outline" onClick={() => setReviewingTask(null)}>稍后再复核</Button>
                 <Button className="bg-amber-500 hover:bg-amber-600 text-white shadow-none" onClick={() => setReviewingTask(null)}>一键确认无误结出成绩</Button>
               </>
             )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Insight Dialog */}
      <Dialog open={!!insightTask} onOpenChange={(open) => !open && setInsightTask(null)}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col bg-slate-50">
          <DialogHeader className="border-b border-slate-200 pb-4 shrink-0 bg-white px-6 pt-6 -mx-6 -mt-6">
            <DialogTitle className="flex flex-col text-slate-800">
              <span className="flex items-center text-lg">
                 <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                 考试结果与洞察
              </span>
              <span className="text-xs text-slate-500 font-normal mt-1">{insightTask?.title}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1 py-4 flex flex-col gap-6">
            
            {/* KPI Row */}
            <div className="grid grid-cols-4 gap-4 shrink-0">
              <Card className="shadow-sm border-none">
                <CardContent className="p-5 flex flex-col p-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">平均得分</span>
                  <div className="flex items-end gap-2">
                     <span className="text-3xl font-bold text-slate-800">{MOCK_INSIGHT_DATA.avgScore}</span>
                     <span className="text-sm font-medium text-slate-400 mb-1">/ 100</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-none">
                <CardContent className="p-5 flex flex-col p-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">整体通过率</span>
                  <div className="flex items-end gap-2">
                     <span className="text-3xl font-bold text-emerald-600">{MOCK_INSIGHT_DATA.passRate}%</span>
                     <span className="text-xs font-medium text-slate-400 mb-1.5 line-clamp-1">≥ 80分合格</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-none">
                <CardContent className="p-5 flex flex-col p-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">最高分</span>
                  <div className="flex items-end gap-2">
                     <span className="text-3xl font-bold text-slate-800">{MOCK_INSIGHT_DATA.highestScore}</span>
                     <span className="text-sm font-medium text-slate-400 mb-1">/ 100</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-none">
                <CardContent className="p-5 flex flex-col p-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">最低分</span>
                  <div className="flex items-end gap-2">
                     <span className="text-3xl font-bold text-slate-800">{MOCK_INSIGHT_DATA.lowestScore}</span>
                     <span className="text-sm font-medium text-slate-400 mb-1">/ 100</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
               {/* Left: Knowledge Gaps */}
               <Card className="shadow-sm border-none flex flex-col">
                 <CardHeader className="p-5 pb-3 shrink-0 border-b border-slate-50">
                    <CardTitle className="text-sm font-bold flex items-center text-slate-800">
                      <HelpCircle className="w-4 h-4 mr-2 text-rose-500" /> 高频错题 / 知识薄弱点
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-5 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                      {MOCK_INSIGHT_DATA.knowledgeGaps.map((gap, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                             <span className="font-medium text-slate-700">{gap.title}</span>
                             <span className="text-rose-600 font-bold">错误率 {gap.errorRate}%</span>
                          </div>
                          <Progress value={gap.errorRate} className="h-2 [&>div]:bg-rose-400 bg-slate-100" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-800 leading-relaxed font-medium">
                      💡 <span className="font-bold">AI 建议：</span> 发现大部分 BA 在“敏感肌换季护肤步骤”和对大促价格异议处理上存在短板，建议后续指派该两门专题课件进行复补。
                    </div>
                 </CardContent>
               </Card>

               {/* Right: Top Performers */}
               <Card className="shadow-sm border-none flex flex-col">
                 <CardHeader className="p-5 pb-3 shrink-0 border-b border-slate-50">
                    <CardTitle className="text-sm font-bold flex items-center text-slate-800">
                      <Trophy className="w-4 h-4 mr-2 text-amber-500" /> 优秀标杆 (TOP 3)
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-0 flex-1 overflow-y-auto">
                    <ul className="divide-y divide-slate-50">
                      {MOCK_INSIGHT_DATA.topPerformers.map((p, i) => (
                        <li key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-4">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                               i === 0 ? 'bg-amber-100 text-amber-600' : 
                               i === 1 ? 'bg-slate-200 text-slate-500' : 'bg-orange-100 text-orange-700'
                             }`}>
                               {i + 1}
                             </div>
                             <div>
                               <p className="text-sm font-bold text-slate-800">{p.name}</p>
                               <p className="text-xs text-slate-500">{p.store}</p>
                             </div>
                          </div>
                          <div className="text-xl font-black text-slate-800">
                            {p.score} <span className="text-[10px] font-bold text-slate-400">分</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                 </CardContent>
               </Card>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { AlertTriangle, User, ChevronLeft, Building, BookOpen, PlayCircle, Users, Clock, CalendarCheck, Database, MessageSquare, ArrowRight, ClipboardList, Presentation } from 'lucide-react';
import { brandTone, getProgressTone, getScoreTone, getTaskStatusBadgeClass } from '../lib/visualTones';

const REGION_ONGOING_TASKS = [
  { id: 'region-task-1', title: '夏季新品区域通关考核', scope: '区域', type: '考试任务', completed: 280, total: 342, progress: 81, deadlineText: '本周五 23:59', isWarning: true, badgeClass: 'border-rose-200 text-rose-600 bg-rose-50' },
  { id: 'region-task-2', title: '新客破冰沟通场景演练', scope: '区域', type: '练习任务', completed: 145, total: 342, progress: 42, cycleLabel: '本日', frequency: '每日完成 1 次', deadlineText: '2周后', isWarning: false, badgeClass: 'border-[#E8CCA0] text-[#B9822B] bg-[#FFF7EA]' },
  { id: 'region-task-3', title: '『敏感肌抗老』区域专项陪练', scope: '区域', type: '练习任务', completed: 215, total: 342, progress: 62, cycleLabel: '本周', frequency: '每周完成 3 次', deadlineText: '下周三', isWarning: false, badgeClass: 'border-[#BFDCCF] text-[#3B8F72] bg-[#EEF8F4]' },
  { id: 'region-task-4', title: '店长基础服务抽检复训', scope: '区域', type: '学习任务', completed: 78, total: 96, progress: 81, deadlineText: '本月月底', isWarning: false, badgeClass: 'border-[#E5DED8] text-[#5D565A] bg-[#F8F5F3]' },
];

const getRegionalTaskProgressText = (task: any) => {
  if (task.type === '练习任务') {
    return `${task.cycleLabel ?? '当前周期'} ${task.completed} / ${task.total} 人已达标`;
  }
  return `${task.completed} / ${task.total} 人已完成`;
};

const VISIBLE_REGION_ONGOING_TASK_COUNT = 3;

const REGION_STAFF_PROFILES = {
  Siti: {
    status: '正常',
    meta: 'Toko Senayan City | 入职 6 个月 | 雅加达南区',
    taskCompleted: 8,
    taskTotal: 8,
    taskRate: 100,
    examScore: 98,
    examTrend: [92, 95, 98],
    monthlyPoints: 236,
    pointBreakdown: [
      { label: '学习任务完成', detail: '8/8 已完成', value: '+80', tone: 'text-[#3B8F72]' },
      { label: '考试成绩贡献', detail: '最新均分 98', value: '+98', tone: 'text-[#3B8F72]' },
      { label: '练习任务达标', detail: '5/5 已达标', value: '+58', tone: 'text-[#3B8F72]' },
    ],
    recentTasks: [
      { name: '夏季新品区域通关考核', type: '考试任务', status: '已交卷', progress: 100 },
      { name: '新客破冰沟通场景演练', type: '练习任务', status: '已达标', progress: 100 },
      { name: '敏感肌抗老区域专项陪练', type: '练习任务', status: '进行中', progress: 82 },
    ],
    isAtRisk: false,
  },
  Fitri: {
    status: '正常',
    meta: 'Toko Pacific Place | 入职 10 个月 | 雅加达南区',
    taskCompleted: 8,
    taskTotal: 8,
    taskRate: 95,
    examScore: 95,
    examTrend: [90, 93, 95],
    monthlyPoints: 219,
    pointBreakdown: [
      { label: '学习任务完成', detail: '8/8 已完成', value: '+76', tone: 'text-[#3B8F72]' },
      { label: '考试成绩贡献', detail: '最新均分 95', value: '+95', tone: 'text-[#3B8F72]' },
      { label: '练习任务达标', detail: '4/5 已达标', value: '+48', tone: 'text-[#B9822B]' },
    ],
    recentTasks: [
      { name: '敏感肌抗老区域专项陪练', type: '练习任务', status: '进行中', progress: 80 },
      { name: '夏季新品区域通关考核', type: '考试任务', status: '已交卷', progress: 100 },
      { name: '新客破冰沟通场景演练', type: '练习任务', status: '已达标', progress: 90 },
    ],
    isAtRisk: false,
  },
  Ayu: {
    status: '正常',
    meta: 'Toko Gandaria City | 入职 8 个月 | 雅加达南区',
    taskCompleted: 7,
    taskTotal: 8,
    taskRate: 90,
    examScore: 91,
    examTrend: [86, 88, 91],
    monthlyPoints: 203,
    pointBreakdown: [
      { label: '学习任务完成', detail: '7/8 已完成', value: '+68', tone: 'text-[#3B8F72]' },
      { label: '考试成绩贡献', detail: '最新均分 91', value: '+91', tone: 'text-[#3B8F72]' },
      { label: '练习任务达标', detail: '4/5 已达标', value: '+44', tone: 'text-[#B9822B]' },
    ],
    recentTasks: [
      { name: '夏季新品区域通关考核', type: '考试任务', status: '已交卷', progress: 100 },
      { name: '新客破冰沟通场景演练', type: '练习任务', status: '已达标', progress: 88 },
      { name: '店长基础服务抽检复训', type: '学习任务', status: '已完成', progress: 100 },
    ],
    isAtRisk: false,
  },
  Maya: {
    status: '正常',
    meta: 'Toko Pondok Indah | 入职 5 个月 | 雅加达南区',
    taskCompleted: 6,
    taskTotal: 8,
    taskRate: 85,
    examScore: 86,
    examTrend: [78, 82, 86],
    monthlyPoints: 187,
    pointBreakdown: [
      { label: '学习任务完成', detail: '6/8 已完成', value: '+60', tone: 'text-[#B9822B]' },
      { label: '考试成绩贡献', detail: '最新均分 86', value: '+86', tone: 'text-[#B9822B]' },
      { label: '练习任务达标', detail: '3/5 已达标', value: '+41', tone: 'text-[#B9822B]' },
    ],
    recentTasks: [
      { name: '新客破冰沟通场景演练', type: '练习任务', status: '进行中', progress: 72 },
      { name: '夏季新品区域通关考核', type: '考试任务', status: '已交卷', progress: 100 },
      { name: '敏感肌抗老区域专项陪练', type: '练习任务', status: '进行中', progress: 68 },
    ],
    isAtRisk: false,
  },
  Rina: {
    status: '高风险',
    meta: 'T. Kelapa Gading | 入职 6 个月 | 雅加达南区',
    taskCompleted: 3,
    taskTotal: 8,
    taskRate: 37,
    examScore: 52,
    examTrend: [65, 58, 52],
    monthlyPoints: 58,
    pointBreakdown: [
      { label: '学习任务完成', detail: '3/8 已完成', value: '+24', tone: 'text-rose-600' },
      { label: '考试成绩贡献', detail: '最新均分 52', value: '+22', tone: 'text-rose-600' },
      { label: '练习任务达标', detail: '0/5 未达标', value: '+12', tone: 'text-rose-600' },
    ],
    recentTasks: [
      { name: '新客破冰沟通场景演练', type: '练习任务', status: '未达标', progress: 20 },
      { name: '夏季新品区域通关考核', type: '考试任务', status: '已交卷', progress: 100 },
      { name: '敏感肌抗老区域专项陪练', type: '练习任务', status: '未开始', progress: 0 },
    ],
    isAtRisk: true,
  },
};

const REGION_STORE_PROFILES = {
  'Toko Senayan City': {
    manager: 'Dian',
    baCount: 6,
    avgTaskCompletion: 100,
    avgStudyCount: 28,
    avgPracticeCount: 18,
    avgExamScore: 92,
    employees: [
      { id: 'BA001', name: 'Siti Aminah', monthlyPoints: 236, completionRate: 100, lastExamScore: 98 },
      { id: 'BA018', name: 'Maya Putri', monthlyPoints: 224, completionRate: 100, lastExamScore: 96 },
      { id: 'BA029', name: 'Nadia Sari', monthlyPoints: 218, completionRate: 98, lastExamScore: 92 },
    ],
  },
  'Toko Pacific Place': {
    manager: 'Budi',
    baCount: 8,
    avgTaskCompletion: 95,
    avgStudyCount: 24,
    avgPracticeCount: 14,
    avgExamScore: 87,
    employees: [
      { id: 'BA071', name: 'Fitri Rahma', monthlyPoints: 219, completionRate: 95, lastExamScore: 95 },
      { id: 'BA082', name: 'Ayu Permata', monthlyPoints: 205, completionRate: 92, lastExamScore: 88 },
      { id: 'BA093', name: 'Intan Sari', monthlyPoints: 198, completionRate: 90, lastExamScore: 87 },
    ],
  },
  'Toko Gandaria City': {
    manager: 'Rangga',
    baCount: 5,
    avgTaskCompletion: 90,
    avgStudyCount: 20,
    avgPracticeCount: 11,
    avgExamScore: 81,
    employees: [
      { id: 'BA201', name: 'Ayu Lestari', monthlyPoints: 203, completionRate: 90, lastExamScore: 91 },
      { id: 'BA212', name: 'Sari Nabila', monthlyPoints: 176, completionRate: 84, lastExamScore: 80 },
      { id: 'BA223', name: 'Dewi Laras', monthlyPoints: 158, completionRate: 78, lastExamScore: 74 },
    ],
  },
  'Toko Pondok Indah': {
    manager: 'Maya',
    baCount: 5,
    avgTaskCompletion: 80,
    avgStudyCount: 17,
    avgPracticeCount: 8,
    avgExamScore: 73,
    employees: [
      { id: 'BA301', name: 'Maya Sari', monthlyPoints: 187, completionRate: 85, lastExamScore: 86 },
      { id: 'BA312', name: 'Dewi Puspita', monthlyPoints: 141, completionRate: 70, lastExamScore: 66 },
      { id: 'BA323', name: 'Lestari Wulan', monthlyPoints: 132, completionRate: 65, lastExamScore: 62 },
    ],
  },
  'Toko Kelapa Gading': {
    manager: 'Budi',
    baCount: 5,
    avgTaskCompletion: 60,
    avgStudyCount: 12,
    avgPracticeCount: 6,
    avgExamScore: 58,
    employees: [
      { id: 'BA131', name: 'Rina Wijaya', monthlyPoints: 58, completionRate: 37, lastExamScore: 52 },
      { id: 'BA142', name: 'Lia Kartika', monthlyPoints: 92, completionRate: 58, lastExamScore: 61 },
      { id: 'BA153', name: 'Dimas Pratama', monthlyPoints: 106, completionRate: 65, lastExamScore: 68 },
    ],
  },
};

export function RMDashboard() {
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const selectedStaffProfile = selectedStaff ? (REGION_STAFF_PROFILES[selectedStaff as keyof typeof REGION_STAFF_PROFILES] ?? REGION_STAFF_PROFILES.Rina) : REGION_STAFF_PROFILES.Rina;
  const selectedStoreProfile = selectedStore ? (REGION_STORE_PROFILES[selectedStore as keyof typeof REGION_STORE_PROFILES] ?? REGION_STORE_PROFILES['Toko Kelapa Gading']) : REGION_STORE_PROFILES['Toko Kelapa Gading'];

  const handleStaffClick = (staffName: string) => {
    setSelectedStaff(staffName);
  };

  const handleStoreClick = (storeName: string) => {
    setSelectedStore(storeName);
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col pt-2">
      <div className="flex justify-between flex-row items-center">
        <h1 className="text-2xl font-bold text-[#242124]">区域数据</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden bg-white">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-[#766F73] uppercase tracking-widest">区域注册BA总数</CardTitle>
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

      {/* Row 1: Assets and Tasks (Inherited from RTM) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch lg:min-h-[430px]">
        {/* Col 1: 内容资产总览 (Content & Assets) */}
        <div className="flex flex-col">
          <Card className="rounded-2xl border border-[#E9E4DF] shadow-sm overflow-hidden flex-1 flex flex-col bg-white">
            <CardHeader className="p-4 border-b border-slate-50 bg-[#F8F5F3]/50">
               <CardTitle className="text-sm font-bold flex items-center text-[#242124]">
                 <Database className="h-4 w-4 mr-2 text-rose-500" /> 数字资产大盘 (区域通览)
               </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col space-y-4 overflow-y-auto">
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
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Col 2: 区域作业与考试监控 (Tasks & Exams) */}
        <div className="lg:col-span-2 flex flex-col">
           <Card className="rounded-2xl border border-[#E9E4DF] shadow-sm overflow-hidden flex-1 flex flex-col bg-white">
            <CardHeader className="p-4 border-b border-slate-50 bg-[#F8F5F3]/50 flex flex-row items-center justify-between">
               <CardTitle className="text-sm font-bold flex items-center text-[#242124]">
                 <CalendarCheck className="h-4 w-4 mr-2 text-rose-500" /> 区域任务监控 (进行中)
               </CardTitle>
               <button onClick={() => setShowAllTasks(true)} className="text-[10px] font-bold text-rose-600 flex items-center hover:underline">查看全部任务 <ArrowRight className="h-3 w-3 ml-1" /></button>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto flex-1 space-y-4">
               {REGION_ONGOING_TASKS.slice(0, VISIBLE_REGION_ONGOING_TASK_COUNT).map(task => {
                 const tone = getProgressTone(task.progress);
                 return (
                   <div key={task.id} className="border border-[#E9E4DF] rounded-xl p-3 bg-white shadow-sm hover:shadow relative overflow-hidden transition-all group cursor-pointer">
                     <div className={`absolute top-0 left-0 w-1 h-full ${tone.barClass}`}></div>
                     <div className="flex justify-between items-start mb-2">
                        <h4 className={`text-xs font-bold text-[#242124] ${tone.hoverClass} transition-colors`}>{task.title}</h4>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[9px] py-0 border-[#E5DED8] text-[#5D565A] bg-[#F8F5F3]">{task.scope}</Badge>
                          <Badge variant="outline" className={`text-[9px] py-0 ${task.badgeClass}`}>{task.type}</Badge>
                        </div>
                     </div>
                     <div className="flex justify-between text-[10px] text-[#766F73] mb-1.5 font-medium">
                        <span>{getRegionalTaskProgressText(task)}</span>
                        <span className={`font-bold ${tone.textClass}`}>{task.progress}%</span>
                     </div>
                     <Progress value={task.progress} className="h-1.5 bg-slate-100" indicatorClassName={tone.indicatorClass} />
                     <div className="mt-3 flex justify-between items-center text-[10px] text-[#9A9396]">
                        <span className="flex items-center">
                          {task.isWarning && <AlertTriangle className="h-3 w-3 mr-1 text-[#B9822B]" />}
                          {!task.isWarning && <Clock className="w-3 h-3 mr-1" />}
                          截止: {task.deadlineText}
                        </span>
                     </div>
                   </div>
                 );
               })}

               {REGION_ONGOING_TASKS.length > VISIBLE_REGION_ONGOING_TASK_COUNT && (
                 <div className="w-full pt-1 text-center text-xs font-bold text-[#9A9396]">
                   其他 {REGION_ONGOING_TASKS.length - VISIBLE_REGION_ONGOING_TASK_COUNT} 个任务进行中
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 2: Staff/Store Tabs and High Risk Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-8">
        {/* Alerts / High Risk */}
        <Card className="lg:col-span-1 rounded-2xl border border-[#E9E4DF] shadow-sm flex flex-col overflow-hidden">
          <CardHeader className="p-5 border-b border-slate-50 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-bold flex items-center">
               <span className="w-2 h-2 bg-rose-500 rounded-full mr-2"></span>
               高风险 BA <span className="ml-2 text-xs font-normal text-[#9A9396] px-2 py-0.5 bg-slate-100 rounded-full">3人需关注</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 flex-1">
            <div className="space-y-2 overflow-hidden">
              {/* Alert 1 */}
              <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between group cursor-pointer hover:bg-rose-50 transition-colors">
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 rounded-full bg-white border-2 border-rose-200 flex items-center justify-center font-bold text-rose-700">R</div>
                   <div>
                     <p className="text-sm font-bold text-[#1F1C1F]">Rina <span className="text-xs font-normal text-[#9A9396] tracking-tight">• Toko Mal Kelapa Gading</span></p>
                     <p className="text-[11px] text-rose-600 mt-0.5">连续7天未登录 | 考试 52分 | 陪练 0次</p>
                   </div>
                </div>
              </div>

               {/* Alert 2 */}
               <div className="p-4 bg-[#FFF7EA]/50 rounded-xl border border-[#F2DEC0] flex items-center justify-between cursor-pointer hover:bg-[#FFF7EA] transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-[#E8CCA0] flex items-center justify-center font-bold text-[#8B621F]">D</div>
                  <div>
                    <p className="text-sm font-bold text-[#1F1C1F]">Dewi <span className="text-xs font-normal text-[#9A9396] tracking-tight">• Toko Pondok Indah</span></p>
                    <p className="text-[11px] text-[#B9822B] mt-0.5">参与度低：金句跟读20% | 本周仅登录1次</p>
                  </div>
                </div>
              </div>

               {/* Alert 3 */}
               <div className="p-4 bg-[#F8F5F3] rounded-xl border border-[#E9E4DF] flex items-center justify-between cursor-pointer hover:bg-[#F1ECE8] transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#E5DED8] flex items-center justify-center font-bold text-[#3F3A3D]">S</div>
                  <div>
                    <p className="text-sm font-bold text-[#1F1C1F]">Sari <span className="text-xs font-normal text-[#9A9396] tracking-tight">• Toko Gandaria City</span></p>
                    <p className="text-[11px] text-[#766F73] mt-0.5 italic">考试存疑：AI监考检测到切屏2次</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="p-4 text-center border-t border-slate-50 bg-white">
            <p className="text-[11px] text-[#9A9396] font-medium">根据登录、任务、考试和练习记录自动识别</p>
          </div>
        </Card>

        {/* Drill down / Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="staff" className="w-full flex-1 flex flex-col gap-0 min-h-[460px] overflow-hidden rounded-2xl border border-[#E9E4DF] bg-white shadow-sm">
            <TabsList className="w-full shrink-0 justify-start rounded-none border-0 border-b border-[#E9E4DF] bg-white h-12 p-0 shadow-none overflow-hidden">
              <TabsTrigger value="staff" className="h-full flex-1 rounded-none border-0 border-r border-[#E9E4DF] px-6 font-bold text-[#766F73] data-active:bg-white data-active:text-rose-700 data-active:shadow-none after:bottom-0 after:bg-rose-600 data-active:after:opacity-100">区域员工排行</TabsTrigger>
              <TabsTrigger value="store" className="h-full flex-1 rounded-none border-0 px-6 font-bold text-[#766F73] data-active:bg-white data-active:text-rose-700 data-active:shadow-none after:bottom-0 after:bg-rose-600 data-active:after:opacity-100">门店培训排行</TabsTrigger>
            </TabsList>

            <TabsContent value="staff" className="mt-0 flex-1 overflow-hidden outline-none">
              <Card className="h-full flex flex-col border-none shadow-none rounded-none">
                {selectedStaff ? (
                  <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 p-4 bg-white">
                     <div className="flex flex-row items-center justify-between mb-4">
                        <button onClick={() => setSelectedStaff(null)} className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center px-3 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-full transition-colors">
                           <ChevronLeft className="h-3 w-3 mr-1" /> 返回员工列表
                        </button>
                        <Badge variant="destructive" className={`${selectedStaffProfile.isAtRisk ? 'bg-rose-100 text-rose-700 hover:bg-rose-100' : 'bg-[#EEF8F4] text-[#3B8F72] hover:bg-[#EEF8F4]'} border-none`}>{selectedStaffProfile.status}</Badge>
                     </div>
                     <div className="flex items-center space-x-4 mb-6 px-2">
                        <div className="h-16 w-16 rounded-full bg-slate-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                           <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${selectedStaff}`} alt={selectedStaff} className="h-full w-full object-cover" />
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-[#242124]">{selectedStaff}</h3>
                           <p className="text-xs text-[#766F73]">{selectedStaffProfile.meta}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        <div className="space-y-4">
                           <div className="bg-white rounded-xl p-4 border border-[#E9E4DF] shadow-sm h-full flex flex-col">
                             <h4 className="text-xs font-bold text-[#242124] mb-4 tracking-wider flex items-center"><BookOpen className="h-4 w-4 mr-2 text-rose-500" /> 学习与考试</h4>
                             <div className="space-y-4 flex-1">
                               <div className="bg-[#F8F5F3]/50 p-3 rounded-lg border border-[#E9E4DF]">
                                 <div className="flex justify-between text-xs mb-2">
                                   <span className="text-[#766F73] font-medium">{`任务完成率 (${selectedStaffProfile.taskCompleted}/${selectedStaffProfile.taskTotal})`}</span>
                                   <span className={`font-bold ${getProgressTone(selectedStaffProfile.taskRate).textClass}`}>{selectedStaffProfile.taskRate}%</span>
                                 </div>
                                 <Progress value={selectedStaffProfile.taskRate} className="h-1.5 bg-slate-100" indicatorClassName={getProgressTone(selectedStaffProfile.taskRate).indicatorClass} />
                               </div>
                               <div className="bg-[#F8F5F3]/50 p-3 rounded-lg border border-[#E9E4DF]">
                                 <div className="flex justify-between text-xs mb-2">
                                   <span className="text-[#766F73] font-medium">最近考试成绩</span>
                                   <span className={`font-bold ${getScoreTone(selectedStaffProfile.examScore)}`}>{selectedStaffProfile.examScore}分</span>
                                 </div>
                                 <div className="text-[10px] text-[#9A9396] mt-1 flex items-center gap-1 font-medium">
                                   历次趋势：
                                   {selectedStaffProfile.examTrend.map((score, index) => (
                                     <span key={`${selectedStaff}-${score}-${index}`} className={index === selectedStaffProfile.examTrend.length - 1 ? `font-bold ${getScoreTone(score)}` : 'text-[#5D565A]'}>
                                       {score}
                                     </span>
                                   ))}
                                 </div>
                               </div>
                               <div className="rounded-lg border border-[#F3C9BC] bg-[#FFF0E8] p-3">
                                 <div className="flex items-start justify-between gap-3">
                                   <div>
                                     <p className="text-[10px] font-bold uppercase tracking-wider text-[#A85F4B]">当月积分</p>
                                     <p className="mt-1 text-[10px] leading-relaxed text-[#766F73]">按学习任务、考试成绩、练习达标三项累计</p>
                                   </div>
                                   <span className="text-2xl font-bold text-[#A85F4B]">{selectedStaffProfile.monthlyPoints}</span>
                                 </div>
                                 <div className="mt-3 space-y-2 border-t border-[#F3C9BC] pt-2">
                                   {selectedStaffProfile.pointBreakdown.map((item) => (
                                     <div key={item.label} className="flex items-center justify-between gap-2 text-[10px]">
                                       <span className="min-w-0 text-[#766F73]">
                                         <span className="font-bold text-[#3F3A3D]">{item.label}</span>
                                         <span className="ml-1">{item.detail}</span>
                                       </span>
                                       <span className={`shrink-0 font-bold ${item.tone}`}>{item.value}</span>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white rounded-xl p-4 border border-[#E9E4DF] shadow-sm h-full flex flex-col">
                             <h4 className="text-xs font-bold text-[#242124] mb-4 tracking-wider flex items-center"><PlayCircle className="h-4 w-4 mr-2 text-[#3B8F72]" /> 近期任务情况</h4>
                             <div className="flex-1 overflow-hidden rounded-lg border border-[#E9E4DF] bg-[#F8F5F3]/50">
                               <ul className="divide-y divide-[#E9E4DF]">
                                 {selectedStaffProfile.recentTasks.map((task) => {
                                   const tone = getProgressTone(task.progress);
                                   return (
                                     <li key={task.name} className="p-3 hover:bg-white/70 transition-colors">
                                       <div className="flex items-start justify-between gap-3">
                                         <h5 className="min-w-0 flex-1 truncate text-xs font-bold leading-5 text-[#242124]">{task.name}</h5>
                                         <Badge variant="outline" className={`shrink-0 border-none text-[10px] font-normal ${getTaskStatusBadgeClass(task.status)}`}>
                                           {task.status}
                                         </Badge>
                                       </div>
                                       <div className="mt-2 flex items-center justify-between gap-3">
                                         <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#9A9396]">{task.type}</span>
                                         <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                                           <Progress value={task.progress} className="h-1.5 max-w-28 bg-slate-100" indicatorClassName={tone.indicatorClass} />
                                           <span className={`w-8 text-right text-[10px] font-bold ${tone.textClass}`}>{task.progress}%</span>
                                         </div>
                                       </div>
                                     </li>
                                   );
                                 })}
                               </ul>
                             </div>
                           </div>
                        </div>

                        <div className="md:col-span-2 pt-2">
                           <div className="bg-[#FFF7EA]/50 border border-[#E8CCA0] rounded-xl p-4 relative overflow-visible group group/staff-insight-note">
                              <span className="absolute right-3 top-3 z-20 h-4 min-w-4 rounded-full bg-blue-950 px-1 text-[9px] font-bold leading-4 text-white text-center shadow-sm backdrop-blur-sm">注</span>
                              <div className="absolute top-0 left-0 w-1 h-full bg-[#B9822B]"></div>
                              <h4 className="text-xs font-bold text-[#242124] mb-2 flex items-center">
                                 <AlertTriangle className="h-4 w-4 mr-2 text-[#B9822B]" />
                                 数据波动与学习提示
                              </h4>
                              <div className="absolute right-3 bottom-full mb-2 hidden group-hover:block group-hover/staff-insight-note:block z-[80] w-96 rounded-lg bg-blue-950/95 px-3 py-2 text-xs leading-relaxed text-white shadow-xl backdrop-blur-sm">
                                给研发：员工级洞察不要跟首页 AI 自动洞察一样定期跑；在点击员工进入详情时按需生成，并用 SSE/WebSocket 流式输出。后端只传该员工近 30 天聚合指标和少量证据：错题 Top 5、低分考试、未达标任务、陪练卡点标签、最近 3 条短样例；先用规则/SQL 预筛和摘要缓存，避免把全量答卷、录音或转写原文发给模型。结果按 employeeId + 数据版本短缓存，切换员工或数据更新再重算。
                              </div>
                              <p className="text-xs text-[#3F3A3D] leading-relaxed">
                                根据近期错题统计，该员工的知识盲区主要集中在<span className="font-bold text-[#242124]">「夏季新品系列」</span>。其中涉及<span className="bg-white shadow-sm px-1 border border-[#E8CCA0] rounded text-[10px] font-mono mx-1">焕白精华适用肤质</span>的考题错误率达 <span className="font-bold text-rose-600">60%</span>。
                                <span className="text-[#766F73] mt-2 block border-t border-[#E8CCA0] pt-2">此外，该员工本月尚未进行任何「场景陪练」打卡。建议提醒门店长针对新品知识面进行当面抽查与辅导。</span>
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                     <CardHeader className="p-4 border-b border-slate-50 bg-[#F8F5F3]/50">
                        <CardTitle className="text-sm font-bold text-[#242124] flex justify-between items-center">
                          <span className="flex items-center"><User className="h-4 w-4 mr-2 text-rose-500"/> 区域员工学习力排名</span>
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase tracking-widest mt-1">点击员工姓名下钻个人履历</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 overflow-auto flex-1">
                         <table className="responsive-data-table w-full text-sm">
                          <thead className="bg-[#F8F5F3]/50 text-[#9A9396] text-[10px] uppercase tracking-wider text-left border-y border-[#E9E4DF] sticky top-0">
                            <tr>
                              <th className="table-rank-cell py-2.5 px-4 font-bold w-16 text-center">Rank</th>
                              <th className="py-2.5 px-4 font-bold min-w-32">员工姓名</th>
                              <th className="py-2.5 px-2 font-bold hidden sm:table-cell w-1/4">所属门店</th>
                              <th className={`table-compact-cell py-2.5 px-3 font-bold text-center ${brandTone.textClass}`}>当月积分</th>
                              <th className="table-compact-cell py-2.5 px-3 font-bold text-center">任务完成率</th>
                              <th className="table-compact-cell py-2.5 px-5 font-bold text-right text-[#766F73]">最新考试平均分</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStaffClick('Siti')}>
                              <td className="table-rank-cell py-3 px-4 font-bold text-[#B9822B] text-center">1</td>
                              <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Siti</td>
                              <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell">Toko Senayan City</td>
                              <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>236</td>
                              <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">100%</td>
                              <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(98)}`}>98</td>
                            </tr>
                            <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStaffClick('Fitri')}>
                              <td className="table-rank-cell py-3 px-4 font-bold text-[#9A9396] text-center">2</td>
                              <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Fitri</td>
                              <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell">Toko Pacific Place</td>
                              <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>219</td>
                              <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">95%</td>
                              <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(95)}`}>95</td>
                            </tr>
                            <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStaffClick('Ayu')}>
                              <td className="table-rank-cell py-3 px-4 font-bold text-[#8B621F] text-center">3</td>
                              <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Ayu</td>
                              <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell">Toko Gandaria City</td>
                              <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>203</td>
                              <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">90%</td>
                              <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(91)}`}>91</td>
                            </tr>
                            <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStaffClick('Maya')}>
                              <td className="table-rank-cell py-3 px-4 font-bold text-[#9A9396] text-center">4</td>
                              <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Maya</td>
                              <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell">Toko Pondok Indah</td>
                              <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>187</td>
                              <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">85%</td>
                              <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(86)}`}>86</td>
                            </tr>
                             <tr className="hover:bg-rose-50/50 transition-colors group cursor-pointer bg-rose-50/20" onClick={() => handleStaffClick('Rina')}>
                              <td className="table-rank-cell py-3 px-4 font-bold text-rose-400 text-center">18</td>
                              <td className="py-3 px-4 font-bold text-rose-600 group-hover:text-rose-800 transition-colors flex items-center">
                                Rina
                              </td>
                                <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell">T. Kelapa Gading</td>
                              <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>58</td>
                              <td className="py-3 px-3 text-center font-medium text-rose-600">37%</td>
                              <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(52)}`}>52</td>
                            </tr>
                          </tbody>
                        </table>
                      </CardContent>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="store" className="mt-0 flex-1 overflow-hidden outline-none">
               <Card className="h-full flex flex-col border-none shadow-none rounded-none">
                 {selectedStore ? (
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 p-4 bg-white">
                       <div className="flex flex-row items-center justify-between mb-4">
                          <button onClick={() => setSelectedStore(null)} className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center px-3 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-full transition-colors">
                             <ChevronLeft className="h-3 w-3 mr-1" /> 返回门店排行
                          </button>
                       </div>
                       <div className="flex items-center space-x-4 mb-6 px-2">
                           <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                             <Building className="h-6 w-6 text-rose-600" />
                           </div>
                           <div>
                             <h3 className="text-lg font-bold text-[#242124]">{selectedStore}</h3>
                           </div>
                       </div>

                       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                          <div className="bg-[#F8F5F3] rounded-xl p-3 border border-[#E9E4DF] shadow-sm text-center">
                             <p className="text-[10px] font-bold text-[#9A9396] uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Users className="h-3.5 w-3.5 text-rose-500" /> BA 人数</p>
                             <p className="text-2xl font-bold text-[#242124]">{selectedStoreProfile.baCount}<span className="text-xs text-[#766F73] font-medium ml-1">人</span></p>
                          </div>
                          <div className="bg-[#F8F5F3] rounded-xl p-3 border border-[#E9E4DF] shadow-sm text-center">
                             <p className="text-[10px] font-bold text-[#9A9396] uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><CalendarCheck className="h-3.5 w-3.5 text-[#3B8F72]" /> 平均任务完成率</p>
                             <p className={`text-2xl font-bold ${getProgressTone(selectedStoreProfile.avgTaskCompletion).textClass}`}>{selectedStoreProfile.avgTaskCompletion}<span className="text-xs font-medium ml-1">%</span></p>
                          </div>
                           <div className="bg-[#F8F5F3] rounded-xl p-3 border border-[#E9E4DF] shadow-sm text-center">
                             <p className="text-[10px] font-bold text-[#9A9396] uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><BookOpen className="h-3.5 w-3.5 text-[#4F5FD5]" /> 平均课件学习次数</p>
                             <p className="text-2xl font-bold text-[#242124]">{selectedStoreProfile.avgStudyCount}<span className="text-xs text-[#766F73] font-medium ml-1">次/人</span></p>
                          </div>
                          <div className="bg-[#F8F5F3] rounded-xl p-3 border border-[#E9E4DF] shadow-sm text-center">
                             <p className="text-[10px] font-bold text-[#9A9396] uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Presentation className="h-3.5 w-3.5 text-[#B9822B]" /> 平均练习次数</p>
                             <p className="text-2xl font-bold text-[#242124]">{selectedStoreProfile.avgPracticeCount}<span className="text-xs text-[#766F73] font-medium ml-1">次/人</span></p>
                          </div>
                       </div>

                        <div className="border border-[#E9E4DF] rounded-xl pt-0 overflow-hidden flex-1 flex flex-col bg-white">
                          <div className="p-4 bg-white border-b border-[#E9E4DF] flex items-center justify-between">
                            <h4 className="text-sm font-bold text-[#242124] flex items-center">
                              <Users className="h-4 w-4 mr-2 text-rose-500" />
                              门店 BA 员工列表
                            </h4>
                            <Badge variant="outline" className={`border-none text-[10px] ${getProgressTone(selectedStoreProfile.avgTaskCompletion).softClass} ${getProgressTone(selectedStoreProfile.avgTaskCompletion).textClass}`}>
                              最新考试平均分 {selectedStoreProfile.avgExamScore}
                            </Badge>
                          </div>
                          <div className="overflow-auto">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-[#F8F5F3]/80 sticky top-0 border-b border-[#E9E4DF] text-[#766F73] text-[10px] uppercase tracking-wider">
                                <tr>
                                  <th className="p-3 font-bold w-24">工号</th>
                                  <th className="p-3 font-bold min-w-40">姓名</th>
                                  <th className={`p-3 font-bold w-28 text-center ${brandTone.textClass}`}>当月积分</th>
                                  <th className="p-3 font-bold w-28 text-center">任务完成率</th>
                                  <th className="p-3 font-bold w-32 text-right">最近一次考试分数</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {selectedStoreProfile.employees.map((emp) => {
                                  const progressTone = getProgressTone(emp.completionRate);
                                  return (
                                    <tr key={emp.id} className="hover:bg-[#F8F5F3]/50 transition-colors">
                                      <td className="p-3 text-[#9A9396] font-mono text-xs">{emp.id}</td>
                                      <td className="p-3 font-bold text-[#242124]">
                                        <div className="flex items-center min-w-0">
                                          <div className={`w-8 h-8 rounded-full ${brandTone.bgClass} ${brandTone.textClass} flex items-center justify-center font-bold mr-3 text-xs shrink-0`}>
                                            {emp.name.charAt(0)}
                                          </div>
                                          <span className="truncate">{emp.name}</span>
                                        </div>
                                      </td>
                                      <td className={`p-3 text-center font-bold ${brandTone.textClass}`}>{emp.monthlyPoints}</td>
                                      <td className={`p-3 text-center font-bold ${progressTone.textClass}`}>{emp.completionRate}%</td>
                                      <td className={`p-3 text-right font-bold text-base ${getScoreTone(emp.lastExamScore)}`}>{emp.lastExamScore}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                    </div>
                 ) : (
                    <div className="flex flex-col h-full bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                       <CardHeader className="p-4 border-b border-slate-50 bg-[#F8F5F3]/50">
                        <CardTitle className="text-sm font-bold text-[#242124] flex justify-between items-center">
                          <span className="flex items-center"><Building className="h-4 w-4 mr-2 text-rose-500" /> 区域门店综合榜 (雅加达南区)</span>
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase tracking-widest mt-1">点击门店进入管理微档案</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 overflow-y-auto flex-1">
                         <table className="w-full text-sm">
                          <thead className="bg-[#F8F5F3]/50 text-[#9A9396] text-[10px] uppercase tracking-wider text-left border-y border-[#E9E4DF] sticky top-0">
                            <tr>
                              <th className="py-2.5 px-5 font-bold w-12 text-center">Rank</th>
                              <th className="py-2.5 px-4 font-bold">门店名称</th>
                              <th className="py-2.5 px-2 font-bold hidden sm:table-cell text-center">参训人数</th>
                              <th className="py-2.5 px-3 font-bold text-center">任务完成率</th>
                              <th className="py-2.5 px-5 font-bold text-right text-[#766F73]">最新考试平均分</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStoreClick('Toko Senayan City')}>
                              <td className="py-3 px-5 font-bold text-[#B9822B] text-center">1</td>
                              <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Toko Senayan City</td>
                               <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell text-center font-mono">6/6</td>
                              <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">100%</td>
                              <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(92)}`}>92</td>
                            </tr>
                            <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStoreClick('Toko Pacific Place')}>
                              <td className="py-3 px-5 font-bold text-[#9A9396] text-center">2</td>
                              <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Toko Pacific Place</td>
                              <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell text-center font-mono">8/8</td>
                              <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">95%</td>
                              <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(87)}`}>87</td>
                            </tr>
                            <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStoreClick('Toko Gandaria City')}>
                              <td className="py-3 px-5 font-bold text-[#8B621F] text-center">3</td>
                              <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Toko Gandaria City</td>
                              <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell text-center font-mono">5/5</td>
                              <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">90%</td>
                              <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(81)}`}>81</td>
                            </tr>
                            <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStoreClick('Toko Pondok Indah')}>
                              <td className="py-3 px-5 font-bold text-[#9A9396] text-center">4</td>
                              <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Toko Pondok Indah</td>
                              <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell text-center font-mono">4/5</td>
                              <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">80%</td>
                              <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(73)}`}>73</td>
                            </tr>
                            <tr className="hover:bg-rose-50/50 transition-colors group cursor-pointer bg-rose-50/20" onClick={() => handleStoreClick('Toko Kelapa Gading')}>
                              <td className="py-3 px-5 font-bold text-rose-500 text-center">5</td>
                              <td className="py-3 px-4 font-bold text-rose-600 group-hover:text-rose-800 transition-colors">Toko Kelapa Gading</td>
                              <td className="py-3 px-2 text-[10px] text-rose-500 hidden sm:table-cell text-center font-mono">3/5</td>
                              <td className="py-3 px-3 text-center font-medium text-rose-600">60%</td>
                              <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(58)}`}>58</td>
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

      <Dialog open={showAllTasks} onOpenChange={setShowAllTasks}>
        <DialogContent className="sm:max-w-2xl flex flex-col max-h-[80vh]">
          <DialogHeader className="border-b border-[#E9E4DF] pb-4 shrink-0">
            <DialogTitle>区域任务监控 (所有进行中)</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto px-1 py-4 space-y-3">
            {REGION_ONGOING_TASKS.map(task => {
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
                  <span>{getRegionalTaskProgressText(task)}</span>
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
  );
}

// Icons placeholders
function ActivityIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> }
function PlayIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg> }
function CheckCircleIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> }

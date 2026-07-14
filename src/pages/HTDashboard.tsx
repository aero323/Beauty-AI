import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Users, BookOpen, Clock, AlertTriangle, CalendarCheck, Database, MessageSquare, TextSelect, ArrowRight, BrainCircuit, ClipboardList, User, ChevronLeft, Building, PlayCircle, Presentation } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { brandTone, getProgressTone, getScoreTone, getTaskStatusBadgeClass } from '../lib/visualTones';
import { AppDownloadButton } from '../components/AppDownloadButton';
import { MonthlyPointsFormulaTooltip, StorePointsFormulaTooltip } from '../components/MonthlyPointsFormulaTooltip';
import { formatPointValue, getEmployeeMonthlyPoints, getEmployeeMonthlyPointsFromRate } from '../lib/points';

interface HTDashboardProps {
  onNavigate?: (tab: string) => void;
}

const MOCK_ONGOING_TASKS = [
  { id: '2', title: '『敏感肌抗老』场景陪练', scope: '全国', type: '练习任务', completed: 850, total: 1428, progress: 59, cycleLabel: '本周', frequency: '每周完成 3 次', deadlineText: '本周五 (剩余 3 天)', isWarning: true, badgeClass: 'border-[#BFDCCF] text-[#3B8F72] bg-[#EEF8F4]' },
  { id: '3', title: '全员基础服务礼仪月度测试', scope: '全国', type: '考试任务', completed: 900, total: 1428, progress: 63, deadlineText: '下周五', isWarning: false, badgeClass: 'border-rose-200 text-rose-600 bg-rose-50' },
  { id: '4', title: '新晋店长管理赋能 (第一期)', scope: '全国', type: '学习任务', completed: 45, total: 50, progress: 90, deadlineText: '无需截止日期 (长期有效)', isWarning: false, badgeClass: 'border-[#E5DED8] text-[#5D565A] bg-[#F8F5F3]' },
  { id: '5', title: '秋冬面霜系列话术演练', scope: '全国', type: '练习任务', completed: 1000, total: 1428, progress: 70, cycleLabel: '本日', frequency: '每日完成 1 次', deadlineText: '本月月底', isWarning: false, badgeClass: 'border-[#E8CCA0] text-[#B9822B] bg-[#FFF7EA]' },
];

const getTaskProgressText = (task: any) => {
  if (task.type === '练习任务') {
    return `${task.cycleLabel ?? '当前周期'} ${task.completed} / ${task.total} 人已达标`;
  }
  return `${task.completed} / ${task.total} 人已完成`;
};

const getProfilePointBreakdown = (profile: { taskCompleted: number; examScore: number }) => [
  { label: '任务完成分', detail: `${profile.taskCompleted} 个任务已完成`, value: `+${profile.taskCompleted * 10}`, tone: 'text-[#3B8F72]' },
  { label: '考试成绩', detail: '按原始分计入', value: `+${profile.examScore}`, tone: getScoreTone(profile.examScore) },
];

const VISIBLE_ONGOING_TASK_COUNT = 4;
const HQ_ACTIVE_BA_COUNT = 1428;
const HQ_INACTIVE_BA_COUNT = 12;

const HQ_STAFF_PROFILES = {
  Siti: {
    status: '正常',
    meta: 'Toko Senayan City | 入职 6 个月 | 雅加达区',
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
    practiceStatus: '已达标',
    practiceStatusClass: 'text-[#3B8F72]',
    scriptProgress: '5/5',
    latestPracticeTask: '敏感肌抗老场景陪练',
    evaluation: '优秀',
    evaluationClass: 'text-[#3B8F72]',
    recentTasks: [
      { name: '敏感肌抗老场景陪练', type: '练习任务', status: '已达标', progress: 100 },
      { name: '全员基础服务礼仪月度测试', type: '考试任务', status: '已交卷', progress: 100 },
      { name: '秋冬面霜系列话术演练', type: '练习任务', status: '进行中', progress: 80 },
    ],
    isAtRisk: false,
  },
  Dewi: {
    status: '正常',
    meta: 'Tunjungan Plaza | 入职 8 个月 | 泗水区',
    taskCompleted: 8,
    taskTotal: 8,
    taskRate: 98,
    examScore: 96,
    examTrend: [91, 94, 96],
    monthlyPoints: 228,
    pointBreakdown: [
      { label: '学习任务完成', detail: '8/8 已完成', value: '+78', tone: 'text-[#3B8F72]' },
      { label: '考试成绩贡献', detail: '最新均分 96', value: '+96', tone: 'text-[#3B8F72]' },
      { label: '练习任务达标', detail: '5/5 已达标', value: '+54', tone: 'text-[#3B8F72]' },
    ],
    practiceStatus: '已达标',
    practiceStatusClass: 'text-[#3B8F72]',
    scriptProgress: '5/5',
    latestPracticeTask: '全员基础服务礼仪演练',
    evaluation: '优秀',
    evaluationClass: 'text-[#3B8F72]',
    recentTasks: [
      { name: '全员基础服务礼仪月度测试', type: '考试任务', status: '已交卷', progress: 100 },
      { name: '敏感肌抗老场景陪练', type: '练习任务', status: '已达标', progress: 100 },
      { name: '秋冬面霜系列话术演练', type: '练习任务', status: '进行中', progress: 78 },
    ],
    isAtRisk: false,
  },
  Fitri: {
    status: '正常',
    meta: 'Toko Pacific Place | 入职 10 个月 | 雅加达区',
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
    practiceStatus: '已达标',
    practiceStatusClass: 'text-[#3B8F72]',
    scriptProgress: '4/5',
    latestPracticeTask: '秋冬面霜系列话术演练',
    evaluation: '良好',
    evaluationClass: 'text-[#B9822B]',
    recentTasks: [
      { name: '秋冬面霜系列话术演练', type: '练习任务', status: '进行中', progress: 80 },
      { name: '全员基础服务礼仪月度测试', type: '考试任务', status: '已交卷', progress: 100 },
      { name: '新客破冰沟通场景演练', type: '练习任务', status: '已达标', progress: 90 },
    ],
    isAtRisk: false,
  },
  Putri: {
    status: '正常',
    meta: 'Beachwalk Center | 入职 4 个月 | 巴厘岛区',
    taskCompleted: 7,
    taskTotal: 8,
    taskRate: 92,
    examScore: 92,
    examTrend: [86, 89, 92],
    monthlyPoints: 207,
    pointBreakdown: [
      { label: '学习任务完成', detail: '7/8 已完成', value: '+70', tone: 'text-[#3B8F72]' },
      { label: '考试成绩贡献', detail: '最新均分 92', value: '+92', tone: 'text-[#3B8F72]' },
      { label: '练习任务达标', detail: '4/5 已达标', value: '+45', tone: 'text-[#B9822B]' },
    ],
    practiceStatus: '已达标',
    practiceStatusClass: 'text-[#3B8F72]',
    scriptProgress: '4/5',
    latestPracticeTask: '新客破冰沟通场景演练',
    evaluation: '良好',
    evaluationClass: 'text-[#B9822B]',
    recentTasks: [
      { name: '新客破冰沟通场景演练', type: '练习任务', status: '已达标', progress: 92 },
      { name: '秋冬面霜系列话术演练', type: '练习任务', status: '进行中', progress: 72 },
      { name: '全员基础服务礼仪月度测试', type: '考试任务', status: '已交卷', progress: 100 },
    ],
    isAtRisk: false,
  },
  Rina: {
    status: '高风险',
    meta: 'T. Kelapa Gading | 入职 6 个月 | 雅加达区',
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
    practiceStatus: '未达标',
    practiceStatusClass: 'text-rose-600',
    scriptProgress: '0/5',
    latestPracticeTask: '敏感肌抗老场景陪练',
    evaluation: '需重点突破',
    evaluationClass: 'text-rose-600',
    recentTasks: [
      { name: '敏感肌抗老场景陪练', type: '练习任务', status: '未达标', progress: 20 },
      { name: '全员基础服务礼仪月度测试', type: '考试任务', status: '已交卷', progress: 100 },
      { name: '秋冬面霜系列话术演练', type: '练习任务', status: '未开始', progress: 0 },
    ],
    isAtRisk: true,
  },
};

const HQ_STORE_PROFILES = {
  'Toko Senayan City (雅加达)': {
    manager: 'Dian',
    baCount: 6,
    avgTaskCompletion: 100,
    avgStudyCount: 28,
    avgPracticeCount: 18,
    avgExamScore: 98,
    employees: [
      { id: 'BA001', name: 'Siti Aminah', monthlyPoints: 236, completionRate: 100, lastExamScore: 98 },
      { id: 'BA018', name: 'Maya Putri', monthlyPoints: 224, completionRate: 100, lastExamScore: 96 },
      { id: 'BA029', name: 'Nadia Sari', monthlyPoints: 218, completionRate: 98, lastExamScore: 95 },
    ],
  },
  'Tunjungan Plaza (泗水)': {
    manager: 'Agus',
    baCount: 12,
    avgTaskCompletion: 100,
    avgStudyCount: 26,
    avgPracticeCount: 16,
    avgExamScore: 96,
    employees: [
      { id: 'BA041', name: 'Dewi Sartika', monthlyPoints: 228, completionRate: 98, lastExamScore: 96 },
      { id: 'BA052', name: 'Rani Wulandari', monthlyPoints: 214, completionRate: 96, lastExamScore: 94 },
      { id: 'BA063', name: 'Tara Lestari', monthlyPoints: 196, completionRate: 92, lastExamScore: 90 },
    ],
  },
  'Toko Pacific Place (雅加达)': {
    manager: 'Budi',
    baCount: 8,
    avgTaskCompletion: 95,
    avgStudyCount: 24,
    avgPracticeCount: 14,
    avgExamScore: 95,
    employees: [
      { id: 'BA071', name: 'Fitri Rahma', monthlyPoints: 219, completionRate: 95, lastExamScore: 95 },
      { id: 'BA082', name: 'Ayu Permata', monthlyPoints: 205, completionRate: 92, lastExamScore: 91 },
      { id: 'BA093', name: 'Intan Sari', monthlyPoints: 198, completionRate: 90, lastExamScore: 89 },
    ],
  },
  'Beachwalk Center (巴厘岛)': {
    manager: 'Wayan',
    baCount: 5,
    avgTaskCompletion: 90,
    avgStudyCount: 21,
    avgPracticeCount: 12,
    avgExamScore: 92,
    employees: [
      { id: 'BA101', name: 'Putri Ayu', monthlyPoints: 207, completionRate: 92, lastExamScore: 92 },
      { id: 'BA112', name: 'Made Laras', monthlyPoints: 188, completionRate: 86, lastExamScore: 84 },
      { id: 'BA123', name: 'Kadek Rina', monthlyPoints: 176, completionRate: 82, lastExamScore: 80 },
    ],
  },
  'Toko Kelapa Gading (雅加达)': {
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

type HQStoreProfile = (typeof HQ_STORE_PROFILES)[keyof typeof HQ_STORE_PROFILES];

const getStoreMonthlyPoints = (store: HQStoreProfile) => {
  const employeeCount = store.employees.length;
  if (employeeCount === 0) return 0;

  const totalPoints = store.employees.reduce((sum, employee) => {
    return sum + getEmployeeMonthlyPointsFromRate(employee.completionRate, employee.lastExamScore);
  }, 0);
  return totalPoints / employeeCount;
};

const formatStoreMonthlyPoints = (store: HQStoreProfile) => {
  return formatPointValue(getStoreMonthlyPoints(store));
};

export function HTDashboard({ onNavigate }: HTDashboardProps) {
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const selectedStaffProfile = selectedStaff ? (HQ_STAFF_PROFILES[selectedStaff as keyof typeof HQ_STAFF_PROFILES] ?? HQ_STAFF_PROFILES.Rina) : HQ_STAFF_PROFILES.Rina;
  const selectedStoreProfile = selectedStore ? (HQ_STORE_PROFILES[selectedStore as keyof typeof HQ_STORE_PROFILES] ?? HQ_STORE_PROFILES['Toko Kelapa Gading (雅加达)']) : HQ_STORE_PROFILES['Toko Kelapa Gading (雅加达)'];

  const handleStaffClick = (staffName: string) => {
    setSelectedStaff(staffName);
  };

  const handleStoreClick = (storeName: string) => {
    setSelectedStore(storeName);
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col pt-2">
      {/* Top KPIs - Auto Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#9A9396]">Dashboard</p>
          <h2 className="text-xl font-bold text-[#242124]">全国培训概览</h2>
        </div>
        <AppDownloadButton />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden bg-white">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-[#766F73] uppercase tracking-widest">全国当前已激活BA数</CardTitle>
            <Users className="h-4 w-4 text-rose-400" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-end justify-between leading-none">
              <div>
                <span className="text-3xl font-bold text-[#242124]">{HQ_ACTIVE_BA_COUNT.toLocaleString('en-US')}</span>
                <p className="mt-1 text-[10px] font-medium text-[#9A9396]">（{HQ_INACTIVE_BA_COUNT} 人未激活）</p>
              </div>
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
              <span className="text-3xl font-bold text-[#242124]">45.2<span className="text-lg font-medium ml-1 text-[#766F73]">k</span></span>
              <span className="text-[10px] font-bold text-[#4F5FD5] bg-[#F3F5FF] px-2 py-1 rounded-md">环比 ↑ 12%</span>
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
              <span className="text-3xl font-bold text-[#242124]">88.5%</span>
              <span className="text-[10px] font-bold text-[#3B8F72] bg-[#EEF8F4] px-2 py-1 rounded-md">环比 ↑ 4.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden bg-white">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-[#766F73] uppercase tracking-widest">本月全国练习总次数</CardTitle>
             <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
             <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold text-[#242124]">12.4<span className="text-lg font-medium ml-1 text-[#766F73]">k</span></span>
              <span className="text-[10px] font-bold text-[#B9822B] bg-[#FFF7EA] px-2 py-1 rounded-md">约 3.2 万小时</span>
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
                 <Database className="h-4 w-4 mr-2 text-rose-500" /> 数字资产大盘 (全局通览)
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
                          <div className="text-sm font-bold text-[#242124]">在线课件</div>
                          <div className="text-[10px] text-[#766F73] font-medium mt-0.5">共计: 124 份</div>
                       </div>
                    </div>
                    <button onClick={() => onNavigate?.('courses_manage')} className="text-[11px] font-bold text-rose-600 hover:text-white hover:bg-rose-500 border border-rose-200 hover:border-rose-500 rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0">查看</button>
                 </div>

                 <div className="bg-[#F8F5F3] rounded-xl p-3 border border-[#E9E4DF] hover:border-[#BFDCCF] transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg bg-[#DCEFE7] text-[#3B8F72] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <Users className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-[#242124]">数字人顾客</div>
                          <div className="text-[10px] text-[#766F73] font-medium mt-0.5">共计: 8 位</div>
                       </div>
                    </div>
                    <button onClick={() => onNavigate?.('ba_avatars')} className="text-[11px] font-bold text-[#3B8F72] hover:text-white hover:bg-[#3B8F72] border border-[#BFDCCF] hover:border-[#3B8F72] rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0">查看</button>
                 </div>

                 <div className="bg-[#F8F5F3] rounded-xl p-3 border border-[#E9E4DF] hover:border-[#E8CCA0] transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg bg-[#F7E6C8] text-[#B9822B] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <MessageSquare className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-[#242124]">场景剧本</div>
                          <div className="text-[10px] text-[#766F73] font-medium mt-0.5">共计: 35 个</div>
                       </div>
                    </div>
                    <button onClick={() => onNavigate?.('ba_scripts')} className="text-[11px] font-bold text-[#B9822B] hover:text-white hover:bg-[#B9822B] border border-[#E8CCA0] hover:border-[#B9822B] rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0">查看</button>
                 </div>

                 <div className="bg-[#F8F5F3] rounded-xl p-3 border border-[#E9E4DF] hover:border-rose-200 transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <TextSelect className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-[#242124]">金句库</div>
                          <div className="text-[10px] text-[#766F73] font-medium mt-0.5">共计: 850 句</div>
                       </div>
                    </div>
                    <button onClick={() => onNavigate?.('ba_quotes')} className="text-[11px] font-bold text-rose-600 hover:text-white hover:bg-rose-500 border border-rose-200 hover:border-rose-500 rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0">查看</button>
                 </div>

                 <div className="bg-[#F8F5F3] rounded-xl p-3 border border-[#E9E4DF] hover:border-rose-200 transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <Database className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-[#242124]">题库题目</div>
                          <div className="text-[10px] text-[#766F73] font-medium mt-0.5">共计: 3,240 题</div>
                       </div>
                    </div>
                    <button onClick={() => onNavigate?.('exam_bank')} className="text-[11px] font-bold text-rose-600 hover:text-white hover:bg-rose-500 border border-rose-200 hover:border-rose-500 rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0">查看</button>
                 </div>

                 <div className="bg-[#F8F5F3] rounded-xl p-3 border border-[#E9E4DF] hover:border-[#C8CEF8] transition-colors group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg bg-[#EEF0FF] text-[#4F5FD5] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <ClipboardList className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-[#242124]">试卷总数</div>
                          <div className="text-[10px] text-[#766F73] font-medium mt-0.5">共计: 42 份</div>
                       </div>
                    </div>
                    <button onClick={() => onNavigate?.('exam_manage')} className="text-[11px] font-bold text-[#4F5FD5] hover:text-white hover:bg-[#4F5FD5] border border-[#C8CEF8] hover:border-[#4F5FD5] rounded-md px-2.5 py-1 transition-colors flex items-center shadow-sm bg-white shrink-0">查看</button>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Col 2: 全国附加题与考试监控 (Additional Questions & Exams) */}
        <div className="flex flex-col">
           <Card className="rounded-2xl border border-[#E9E4DF] shadow-sm overflow-hidden flex-1 flex flex-col bg-white">
            <CardHeader className="p-4 border-b border-slate-50 bg-[#F8F5F3]/50 flex flex-row items-center justify-between">
               <CardTitle className="text-sm font-bold flex items-center text-[#242124]">
                 <CalendarCheck className="h-4 w-4 mr-2 text-rose-500" /> 全国任务监控 (进行中)
               </CardTitle>
               <button onClick={() => setShowAllTasks(true)} className="text-[10px] font-bold text-rose-600 flex items-center hover:underline">查看全部任务 <ArrowRight className="h-3 w-3 ml-1" /></button>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto flex-1 flex flex-col space-y-4">
               {MOCK_ONGOING_TASKS.slice(0, VISIBLE_ONGOING_TASK_COUNT).map(task => {
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
                      <span>{getTaskProgressText(task)}</span>
                      <span className={`font-bold ${tone.textClass}`}>{task.progress}%</span>
                   </div>
                   <Progress value={task.progress} className="h-1.5 bg-slate-100" indicatorClassName={tone.indicatorClass} />
                   <div className="mt-3 text-[10px] text-[#9A9396] flex items-center">
                      {task.isWarning && <AlertTriangle className="h-3 w-3 mr-1 text-[#B9822B]" />}
                      {task.deadlineText !== '无需截止日期 (长期有效)' ? `截止日期: ${task.deadlineText}` : task.deadlineText}
                   </div>
                 </div>
                 );
               })}

               {MOCK_ONGOING_TASKS.length > VISIBLE_ONGOING_TASK_COUNT && (
                 <div className="w-full mt-auto py-2 text-center text-xs font-bold text-[#9A9396]">
                   其他 {MOCK_ONGOING_TASKS.length - VISIBLE_ONGOING_TASK_COUNT} 个任务进行中
                 </div>
               )}
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
                 <BrainCircuit className="h-4 w-4 mr-2 text-rose-400" /> AI 自动洞察: 全国核心薄弱点
               </CardTitle>
               <CardDescription className="text-[10px] text-[#9A9396] mt-1">
                 该洞察基于近期数据生成，每周刷新
               </CardDescription>
               <div className="absolute right-3 top-full mt-2 hidden group-hover/insight-note:block z-[80] w-96 rounded-lg bg-blue-950/95 px-3 py-2 text-xs leading-relaxed text-white shadow-xl backdrop-blur-sm">
                 给研发：每周离线跑一次，只扫近 7-14 天聚合数据：任务完成率、考试题目错误率、陪练场景卡点率、语音转写标签统计、门店/区域 Top N。为降低 token，先用 SQL/规则聚合出 Top 20 候选，每个候选只传指标、趋势和 2-3 条短样例，不传全量原文/录音；结果缓存为周报，低置信度再二次调用模型。
               </div>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto flex-1 space-y-4 z-10 relative">

               <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-sm flex flex-col space-y-2">
                  <div className="flex items-start justify-between">
                     <span className="text-xs font-bold text-rose-100">TOP 1: 新品核心成分区分体验</span>
                     <Badge variant="destructive" className="bg-rose-500 text-white border-none text-[9px] py-0 px-1.5">68% 高频卡点</Badge>
                  </div>
                  <p className="text-[10px] text-[#C9C1C4] leading-relaxed"><span className="text-rose-400 font-bold tracking-wide">💡 AI 结论：</span> 大量 BA 无法通过情景演练清晰表述双萃系列 "亲水亲油" 的黄金比例，当面对敏感肌顾客时极易背错浓度配比。</p>
               </div>

                <div className="p-3 rounded-xl border border-[#B9822B]/30 bg-[#B9822B]/10 backdrop-blur-sm flex flex-col space-y-2">
                  <div className="flex items-start justify-between">
                     <span className="text-xs font-bold text-amber-100">TOP 2: 竞对异议处理 (价格向)</span>
                     <Badge variant="outline" className="border-[#B9822B]/50 text-amber-300 text-[9px] py-0 px-1.5 font-bold">42% 卡顿超5s</Badge>
                  </div>
                  <p className="text-[10px] text-[#C9C1C4] leading-relaxed"><span className="text-amber-400 font-bold tracking-wide">💡 AI 结论：</span> 语音识别显示，员工在被质问 "XX牌更便宜为什么要买你们的" 时，卡顿显著，缺少差异化卖点和情绪价值支撑。</p>
               </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Drill down / Details */}
      <div className="space-y-6 pt-6">
        <Tabs defaultValue="staff" className="w-full flex-1 flex flex-col gap-0 min-h-[460px]">
          <TabsList className="w-full justify-start rounded-t-xl rounded-b-none border border-[#E9E4DF] border-b-0 bg-white h-12 p-0 shadow-sm overflow-hidden">
            <TabsTrigger value="staff" className="h-full flex-1 rounded-none border-0 border-r border-[#E9E4DF] px-6 font-bold text-[#766F73] data-active:bg-white data-active:text-rose-700 data-active:shadow-none after:bottom-0 after:bg-rose-600 data-active:after:opacity-100">全国员工排行</TabsTrigger>
            <TabsTrigger value="store" className="h-full flex-1 rounded-none border-0 px-6 font-bold text-[#766F73] data-active:bg-white data-active:text-rose-700 data-active:shadow-none after:bottom-0 after:bg-rose-600 data-active:after:opacity-100">全国门店培训排行</TabsTrigger>
          </TabsList>

          <TabsContent value="staff" className="mt-0 flex-1 outline-none">
            <Card className="h-full flex flex-col border-none shadow-none">
              {selectedStaff ? (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 border border-t-0 border-[#E9E4DF] rounded-b-xl rounded-t-none p-4 shadow-sm bg-white">
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
                                   <p className="text-[10px] font-bold uppercase tracking-wider text-[#A85F4B]">
                                     <MonthlyPointsFormulaTooltip tooltipClassName="left-0 translate-x-0" />
                                   </p>
                                   <p className="mt-1 text-[10px] leading-relaxed text-[#766F73]">任务每完成 1 个计 10 分，考试按原始分计入</p>
                                 </div>
                                 <span className="text-2xl font-bold text-[#A85F4B]">{getEmployeeMonthlyPoints(selectedStaffProfile.taskCompleted, selectedStaffProfile.examScore)}</span>
                               </div>
                               <div className="mt-3 space-y-2 border-t border-[#F3C9BC] pt-2">
                                 {getProfilePointBreakdown(selectedStaffProfile).map((item) => (
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
                <div className="flex flex-col h-full bg-white border border-t-0 border-[#E9E4DF] rounded-b-xl rounded-t-none shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                   <CardHeader className="p-4 border-b border-slate-50 bg-[#F8F5F3]/50">
                      <CardTitle className="text-sm font-bold text-[#242124] flex justify-between items-center">
                        <span className="flex items-center"><User className="h-4 w-4 mr-2 text-rose-500"/> 全国员工学习力排名</span>
                      </CardTitle>
                      <CardDescription className="text-[10px] uppercase tracking-widest mt-1">点击员工姓名下钻个人履历</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 overflow-auto flex-1 h-[400px]">
                       <table className="responsive-data-table w-full text-sm">
                        <thead className="bg-[#F8F5F3]/50 text-[#9A9396] text-[10px] uppercase tracking-wider text-left border-y border-[#E9E4DF] sticky top-0">
                          <tr>
                            <th className="table-rank-cell py-2.5 px-4 font-bold w-16 text-center">Rank</th>
                            <th className="py-2.5 px-4 font-bold min-w-32">员工姓名</th>
                            <th className="py-2.5 px-2 font-bold hidden sm:table-cell w-1/4">所属区域/门店</th>
                            <th className={`table-compact-cell py-2.5 px-3 font-bold text-center ${brandTone.textClass}`}><MonthlyPointsFormulaTooltip /></th>
                            <th className="table-compact-cell py-2.5 px-3 font-bold text-center">任务完成率</th>
                            <th className="table-compact-cell py-2.5 px-5 font-bold text-right text-[#766F73]">最新考试平均分</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStaffClick('Siti')}>
                            <td className="table-rank-cell py-3 px-4 font-bold text-[#B9822B] text-center">1</td>
                            <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Siti</td>
                            <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell">雅加达区 | Toko Senayan City</td>
                            <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>{getEmployeeMonthlyPoints(HQ_STAFF_PROFILES.Siti.taskCompleted, HQ_STAFF_PROFILES.Siti.examScore)}</td>
                            <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">100%</td>
                            <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(98)}`}>98</td>
                          </tr>
                          <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStaffClick('Dewi')}>
                            <td className="table-rank-cell py-3 px-4 font-bold text-[#9A9396] text-center">2</td>
                            <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Dewi</td>
                            <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell">泗水区 | Tunjungan Plaza</td>
                            <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>{getEmployeeMonthlyPoints(HQ_STAFF_PROFILES.Dewi.taskCompleted, HQ_STAFF_PROFILES.Dewi.examScore)}</td>
                            <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">98%</td>
                            <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(96)}`}>96</td>
                          </tr>
                          <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStaffClick('Fitri')}>
                            <td className="table-rank-cell py-3 px-4 font-bold text-[#8B621F] text-center">3</td>
                            <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Fitri</td>
                            <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell">雅加达区 | Toko Pacific Place</td>
                            <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>{getEmployeeMonthlyPoints(HQ_STAFF_PROFILES.Fitri.taskCompleted, HQ_STAFF_PROFILES.Fitri.examScore)}</td>
                            <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">95%</td>
                            <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(95)}`}>95</td>
                          </tr>
                          <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStaffClick('Putri')}>
                            <td className="table-rank-cell py-3 px-4 font-bold text-[#9A9396] text-center">4</td>
                            <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Putri</td>
                            <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell">巴厘岛区 | Beachwalk Center</td>
                            <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>{getEmployeeMonthlyPoints(HQ_STAFF_PROFILES.Putri.taskCompleted, HQ_STAFF_PROFILES.Putri.examScore)}</td>
                            <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">92%</td>
                            <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(92)}`}>92</td>
                          </tr>
                           <tr className="hover:bg-rose-50/50 transition-colors group cursor-pointer bg-rose-50/20" onClick={() => handleStaffClick('Rina')}>
                            <td className="table-rank-cell py-3 px-4 font-bold text-rose-400 text-center">342</td>
                            <td className="py-3 px-4 font-bold text-rose-600 group-hover:text-rose-800 transition-colors flex items-center">
                              Rina
                            </td>
                            <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell">雅加达区 | T. Kelapa Gading</td>
                            <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>{getEmployeeMonthlyPoints(HQ_STAFF_PROFILES.Rina.taskCompleted, HQ_STAFF_PROFILES.Rina.examScore)}</td>
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

          <TabsContent value="store" className="mt-0 flex-1 outline-none">
             <Card className="h-full flex flex-col border-none shadow-none">
               {selectedStore ? (
                  <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 border border-t-0 border-[#E9E4DF] rounded-b-xl rounded-t-none p-4 shadow-sm bg-white">
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
                                <th className={`p-3 font-bold w-28 text-center ${brandTone.textClass}`}><MonthlyPointsFormulaTooltip /></th>
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
                                    <td className={`p-3 text-center font-bold ${brandTone.textClass}`}>{getEmployeeMonthlyPointsFromRate(emp.completionRate, emp.lastExamScore)}</td>
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
                  <div className="flex flex-col h-full bg-white border border-t-0 border-[#E9E4DF] rounded-b-xl rounded-t-none shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                     <CardHeader className="p-4 border-b border-slate-50 bg-[#F8F5F3]/50">
                      <CardTitle className="text-sm font-bold text-[#242124] flex justify-between items-center">
                        <span className="flex items-center"><Building className="h-4 w-4 mr-2 text-rose-500" /> 全国门店综合榜</span>
                      </CardTitle>
                      <CardDescription className="text-[10px] uppercase tracking-widest mt-1">点击门店进入管理微档案</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto flex-1 h-[400px]">
                       <table className="w-full text-sm">
                        <thead className="bg-[#F8F5F3]/50 text-[#9A9396] text-[10px] uppercase tracking-wider text-left border-y border-[#E9E4DF] sticky top-0">
                          <tr>
                            <th className="py-2.5 px-5 font-bold w-12 text-center">Rank</th>
                            <th className="py-2.5 px-4 font-bold">门店名称</th>
                            <th className="py-2.5 px-2 font-bold hidden sm:table-cell text-center">参训人数</th>
                            <th className={`py-2.5 px-3 font-bold text-center ${brandTone.textClass}`}><StorePointsFormulaTooltip /></th>
                            <th className="py-2.5 px-3 font-bold text-center">任务完成率</th>
                            <th className="py-2.5 px-5 font-bold text-right text-[#766F73]">最新考试平均分</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStoreClick('Toko Senayan City (雅加达)')}>
                            <td className="py-3 px-5 font-bold text-[#B9822B] text-center">1</td>
                            <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Toko Senayan City (雅加达)</td>
                             <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell text-center font-mono">6/6</td>
                            <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>{formatStoreMonthlyPoints(HQ_STORE_PROFILES['Toko Senayan City (雅加达)'])}</td>
                            <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">100%</td>
                            <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(98)}`}>98</td>
                          </tr>
                          <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStoreClick('Tunjungan Plaza (泗水)')}>
                            <td className="py-3 px-5 font-bold text-[#9A9396] text-center">2</td>
                            <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Tunjungan Plaza (泗水)</td>
                            <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell text-center font-mono">12/12</td>
                            <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>{formatStoreMonthlyPoints(HQ_STORE_PROFILES['Tunjungan Plaza (泗水)'])}</td>
                            <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">100%</td>
                            <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(96)}`}>96</td>
                          </tr>
                          <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStoreClick('Toko Pacific Place (雅加达)')}>
                            <td className="py-3 px-5 font-bold text-[#8B621F] text-center">3</td>
                            <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Toko Pacific Place (雅加达)</td>
                            <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell text-center font-mono">8/8</td>
                            <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>{formatStoreMonthlyPoints(HQ_STORE_PROFILES['Toko Pacific Place (雅加达)'])}</td>
                            <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">95%</td>
                            <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(95)}`}>95</td>
                          </tr>
                          <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStoreClick('Beachwalk Center (巴厘岛)')}>
                            <td className="py-3 px-5 font-bold text-[#9A9396] text-center">4</td>
                            <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Beachwalk Center (巴厘岛)</td>
                            <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell text-center font-mono">5/5</td>
                            <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>{formatStoreMonthlyPoints(HQ_STORE_PROFILES['Beachwalk Center (巴厘岛)'])}</td>
                            <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">90%</td>
                            <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(92)}`}>92</td>
                          </tr>
                          <tr className="hover:bg-rose-50/50 transition-colors group cursor-pointer bg-rose-50/20" onClick={() => handleStoreClick('Toko Kelapa Gading (雅加达)')}>
                            <td className="py-3 px-5 font-bold text-rose-500 text-center">85</td>
                            <td className="py-3 px-4 font-bold text-rose-600 group-hover:text-rose-800 transition-colors">Toko Kelapa Gading (雅加达)</td>
                            <td className="py-3 px-2 text-[10px] text-rose-500 hidden sm:table-cell text-center font-mono">3/5</td>
                            <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>{formatStoreMonthlyPoints(HQ_STORE_PROFILES['Toko Kelapa Gading (雅加达)'])}</td>
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

      {/* View All Tasks Dialog */}
      <Dialog open={showAllTasks} onOpenChange={setShowAllTasks}>
        <DialogContent className="sm:max-w-2xl flex flex-col max-h-[80vh]">
          <DialogHeader className="border-b border-[#E9E4DF] pb-4 shrink-0">
            <DialogTitle>全国任务监控 (所有进行中)</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto px-1 py-4 space-y-3">
            {MOCK_ONGOING_TASKS.map(task => {
              const tone = getProgressTone(task.progress);
              return (
              <div key={task.id} className="border border-[#E9E4DF] rounded-xl p-4 bg-white shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${tone.barClass}`}></div>
                <div className="flex justify-between items-start mb-3">
                  <h4 className={`text-sm font-bold text-[#242124]`}>{task.title}</h4>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px] py-0 border-[#E5DED8] text-[#5D565A] bg-[#F8F5F3]">{task.scope}</Badge>
                    <Badge variant="outline" className={`text-[10px] py-0 ${task.badgeClass}`}>{task.type}</Badge>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-[#766F73] mb-2 font-medium">
                  <span>{getTaskProgressText(task)}</span>
                  <span className={`font-bold ${tone.textClass}`}>{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-2 bg-slate-100" indicatorClassName={tone.indicatorClass} />
                <div className="mt-4 text-xs text-[#766F73] font-medium flex items-center">
                  {task.isWarning && <AlertTriangle className="h-4 w-4 mr-1 text-[#B9822B]" />}
                  {task.deadlineText !== '无需截止日期 (长期有效)' ? `截止日期: ${task.deadlineText}` : task.deadlineText}
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

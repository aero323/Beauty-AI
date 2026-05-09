import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Users, Building, ChevronRight, Search, Clock, CalendarCheck, BookOpen, Presentation, CheckCircle, GraduationCap, LayoutList } from 'lucide-react';
import { getProgressTone, getTaskStatusBadgeClass } from '../lib/visualTones';

const MOCK_BA_LIST = [
  { id: 'BA001', name: 'Siti Aminah', store: 'Jakarta Grand Indonesia', joinedAt: '2022-03-15' },
  { id: 'BA002', name: 'Budi Santoso', store: 'Jakarta Plaza Senayan', joinedAt: '2023-01-10' },
  { id: 'BA003', name: 'Ayu Lestari', store: 'Surabaya Tunjungan Plaza', joinedAt: '2023-11-05' },
  { id: 'BA004', name: 'Rizky Pratama', store: 'Bali Beachwalk', joinedAt: '2021-08-20' },
  { id: 'BA005', name: 'Dewi Sartika', store: 'Bandung Trans Studio', joinedAt: '2022-12-01' },
];

const MOCK_USER_DATA: Record<string, any> = {
  'BA001': {
    taskCompletionRate: 98,
    lastExamScore: 95,
    totalCoursesStudied: 42,
    totalPracticeTime: '12h 30m',
    recentExams: [
      { name: '夏季新品区域通关考核', date: '2024-05-10', score: 95, passed: true },
      { name: '护肤基础知识月考', date: '2024-04-28', score: 98, passed: true },
      { name: '新客破冰沟通场景考试', date: '2024-04-15', score: 92, passed: true },
    ],
    recentTasks: [
      { name: '必修：2024夏季新品核心卖点解析', type: '学习任务', status: '已完成' },
      { name: '必修：抗老精华顾客异议处理', type: '练习任务', status: '已完成' },
      { name: '选修：小红书爆款商品推荐指南', type: '学习任务', status: '进行中', progress: 40 },
    ]
  },
  'BA002': {
    taskCompletionRate: 85,
    lastExamScore: 82,
    totalCoursesStudied: 28,
    totalPracticeTime: '6h 15m',
    recentExams: [
      { name: '夏季新品区域通关考核', date: '2024-05-10', score: 82, passed: true },
      { name: '护肤基础知识月考', date: '2024-04-28', score: 75, passed: true },
    ],
    recentTasks: [
      { name: '必修：2024夏季新品核心卖点解析', type: '学习任务', status: '已完成' },
      { name: '必修：抗老精华顾客异议处理', type: '练习任务', status: '进行中', progress: 50 },
    ]
  },
  'default': {
    taskCompletionRate: 90,
    lastExamScore: 88,
    totalCoursesStudied: 30,
    totalPracticeTime: '8h 00m',
    recentExams: [
      { name: '护肤基础知识月考', date: '2024-04-28', score: 88, passed: true },
    ],
    recentTasks: [
      { name: '必修：2024夏季新品核心卖点解析', type: '学习任务', status: '已完成' },
    ]
  }
}

export function PersonnelArchive({ userRole }: { userRole?: string }) {
  const [selectedUserId, setSelectedUserId] = useState<string>(MOCK_BA_LIST[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = MOCK_BA_LIST.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.store.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUser = MOCK_BA_LIST.find(u => u.id === selectedUserId);
  const userData = MOCK_USER_DATA[selectedUserId] || MOCK_USER_DATA['default'];

  const isNational = userRole === 'HQ Trainer';

  return (
    <div className="flex h-full bg-[#F7F3F1] overflow-hidden pt-2 rounded-xl border border-[#E5DED8]">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-[#E5DED8] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#E9E4DF] flex flex-col gap-3 z-10 bg-white">
          <h2 className="font-bold text-[#242124] tracking-tight flex items-center">
            <Users className="w-5 h-5 mr-2 text-rose-600" /> {isNational ? '全国人员列表' : '区域人员列表'}
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-[#9A9396] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索工号、姓名、门店..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm border border-[#E5DED8] rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-[#F8F5F3] relative z-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className={`p-3 rounded-xl cursor-pointer transition-all border ${
                selectedUserId === user.id
                ? 'bg-rose-50 border-rose-200 shadow-sm'
                : 'border-transparent hover:bg-[#F8F5F3]'
              }`}
            >
              <div className="flex items-center mb-1">
                <h3 className={`text-sm font-bold truncate flex-1 ${selectedUserId === user.id ? 'text-rose-800' : 'text-[#242124]'}`}>
                  {user.name}
                </h3>
                <span className="text-[10px] text-[#9A9396] font-mono ml-2">{user.id}</span>
              </div>
              <p className={`text-[10px] mt-1 flex items-center ${selectedUserId === user.id ? 'text-rose-600' : 'text-[#766F73]'}`}>
                 <Building className="w-3 h-3 mr-1" />
                 <span className="truncate">{user.store}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8F5F3]/50">
        <div className="p-6 pb-4 shrink-0 bg-white border-b border-[#E5DED8] z-10">
          <div className="flex items-center text-sm font-medium text-[#766F73] mb-4">
            <Users className="w-4 h-4 mr-1.5" />
            {isNational ? '全国人员档案' : '区域人员档案'}
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-[#242124] font-bold">{selectedUser?.name} ({selectedUser?.id})</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-2xl shadow-sm border border-rose-200">
                {selectedUser?.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                 <h1 className="text-2xl font-bold text-[#242124] mb-1">{selectedUser?.name}</h1>
                 <div className="flex items-center gap-4 text-sm text-[#766F73]">
                   <span className="flex items-center"><Building className="w-4 h-4 mr-1" /> {selectedUser?.store}</span>
                   <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> 入职: {selectedUser?.joinedAt}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="shadow-sm border border-[#E9E4DF] bg-white">
              <CardContent className="p-5 flex flex-col">
                <span className="text-xs font-bold text-[#766F73] uppercase tracking-wider mb-2 flex items-center">
                  <CalendarCheck className="w-3.5 h-3.5 mr-1.5 text-[#3B8F72]" />
                  任务完成率
                </span>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-[#3B8F72]">{userData.taskCompletionRate}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-[#E9E4DF] bg-white">
              <CardContent className="p-5 flex flex-col">
                <span className="text-xs font-bold text-[#766F73] uppercase tracking-wider mb-2 flex items-center">
                  <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                  最新考试分数
                </span>
                <div className="flex items-end gap-2">
                   <span className={`text-3xl font-bold ${userData.lastExamScore >= 90 ? 'text-[#3B8F72]' : userData.lastExamScore >= 80 ? 'text-rose-600' : 'text-[#B9822B]'}`}>
                     {userData.lastExamScore}
                   </span>
                   <span className="text-sm font-medium text-[#9A9396] mb-1">分</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-[#E9E4DF] bg-white">
              <CardContent className="p-5 flex flex-col">
                <span className="text-xs font-bold text-[#766F73] uppercase tracking-wider mb-2 flex items-center">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                  总学习课件
                </span>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-[#242124]">{userData.totalCoursesStudied}</span>
                   <span className="text-sm font-medium text-[#9A9396] mb-1">门课件</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-[#E9E4DF] bg-white">
              <CardContent className="p-5 flex flex-col">
                <span className="text-xs font-bold text-[#766F73] uppercase tracking-wider mb-2 flex items-center">
                  <Presentation className="w-3.5 h-3.5 mr-1.5 text-[#B9822B]" />
                  累计陪练时长
                </span>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-[#242124]">{userData.totalPracticeTime}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6 h-[800px]">
             {/* Left Column: Recent Exams */}
             <Card className="shadow-sm border border-[#E9E4DF] flex flex-col bg-white">
                <CardHeader className="p-5 border-b border-slate-50">
                  <CardTitle className="text-sm font-bold flex items-center text-[#242124]">
                    <LayoutList className="w-4 h-4 mr-2 text-rose-500" /> 历次考试记录
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto">
                   <ul className="divide-y divide-slate-50">
                      {userData.recentExams.map((exam: any, i: number) => (
                        <li key={i} className="p-5 hover:bg-[#F8F5F3]/50 transition-colors flex items-center justify-between">
                           <div>
                              <h4 className="font-bold text-sm text-[#242124] mb-1">{exam.name}</h4>
                              <p className="text-xs text-[#9A9396] flex items-center">
                                <Clock className="w-3 h-3 mr-1" /> {exam.date}
                              </p>
                           </div>
                           <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className={`text-xl font-bold ${exam.score >= 90 ? 'text-[#3B8F72]' : 'text-rose-500'}`}>
                                  {exam.score}
                                </span>
                                <span className="text-xs font-medium text-[#9A9396]">分</span>
                              </div>
                              <Badge variant="outline" className={`mt-1 font-normal text-[10px] ${exam.passed ? 'bg-[#EEF8F4] text-[#3B8F72] border-none' : 'bg-rose-50 text-rose-600 border-none'}`}>
                                {exam.passed ? '达标' : '未达标'}
                              </Badge>
                           </div>
                        </li>
                      ))}
                   </ul>
                </CardContent>
             </Card>

             {/* Right Column: Recent Tasks */}
             <Card className="shadow-sm border border-[#E9E4DF] flex flex-col bg-white">
                <CardHeader className="p-5 border-b border-slate-50">
                  <CardTitle className="text-sm font-bold flex items-center text-[#242124]">
                    <CheckCircle className="w-4 h-4 mr-2 text-[#B9822B]" /> 近期任务情况
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto">
                    <ul className="divide-y divide-slate-50">
                      {userData.recentTasks.map((task: any, i: number) => (
                        <li key={i} className="p-5 hover:bg-[#F8F5F3]/50 transition-colors flex flex-col justify-center">
                           <div className="flex justify-between items-start mb-2">
                              <div className="flex-1 mr-4">
                                <h4 className="font-bold text-sm text-[#242124] leading-snug">{task.name}</h4>
                              </div>
                              <Badge variant="outline" className={`font-normal text-[10px] shrink-0 border-none ${getTaskStatusBadgeClass(task.status)}`}>
                                {task.status}
                              </Badge>
                           </div>
                           <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9396]">{task.type}</span>
                              {task.progress !== undefined && (
                                <div className="flex items-center w-32 gap-2">
                                  <Progress value={task.progress} className="h-1.5 bg-slate-100" indicatorClassName={getProgressTone(task.progress).indicatorClass} />
                                  <span className={`text-[10px] font-bold ${getProgressTone(task.progress).textClass}`}>{task.progress}%</span>
                                </div>
                              )}
                           </div>
                        </li>
                      ))}
                   </ul>
                </CardContent>
             </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Users, Building, ChevronRight, Search, Target, Clock, CalendarCheck, BookOpen, Presentation, CheckCircle, GraduationCap, LayoutDashboard, LayoutList } from 'lucide-react';

const MOCK_BA_LIST = [
  { id: 'BA001', name: 'Siti Aminah', store: 'Jakarta Grand Indonesia', position: '高级BA', joinedAt: '2022-03-15' },
  { id: 'BA002', name: 'Budi Santoso', store: 'Jakarta Plaza Senayan', position: 'BA', joinedAt: '2023-01-10' },
  { id: 'BA003', name: 'Ayu Lestari', store: 'Surabaya Tunjungan Plaza', position: '初级BA', joinedAt: '2023-11-05' },
  { id: 'BA004', name: 'Rizky Pratama', store: 'Bali Beachwalk', position: '高级BA', joinedAt: '2021-08-20' },
  { id: 'BA005', name: 'Dewi Sartika', store: 'Bandung Trans Studio', position: 'BA', joinedAt: '2022-12-01' },
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
    <div className="flex h-full bg-[#FAF9F8] overflow-hidden pt-2 rounded-xl border border-slate-200">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3 z-10 bg-white">
          <h2 className="font-bold text-slate-800 tracking-tight flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-600" /> {isNational ? '全国' : '区域'}人员列表
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="搜索工号，姓名，门店..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 relative z-10" 
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
                ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                : 'border-transparent hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center mb-1">
                <h3 className={`text-sm font-bold truncate flex-1 ${selectedUserId === user.id ? 'text-indigo-800' : 'text-slate-800'}`}>
                  {user.name}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono ml-2">{user.id}</span>
              </div>
              <p className={`text-[10px] mt-1 flex items-center ${selectedUserId === user.id ? 'text-indigo-600' : 'text-slate-500'}`}>
                 <Building className="w-3 h-3 mr-1" />
                 <span className="truncate">{user.store}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
        <div className="p-6 pb-4 shrink-0 bg-white border-b border-slate-200 z-10">
          <div className="flex items-center text-sm font-medium text-slate-500 mb-4">
            <Users className="w-4 h-4 mr-1.5" />
            {isNational ? '全国' : '区域'}人员档案 
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-slate-800 font-bold">{selectedUser?.name} ({selectedUser?.id})</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-2xl shadow-sm border border-indigo-200">
                {selectedUser?.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                 <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-slate-800">{selectedUser?.name}</h1>
                    <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 font-normal">
                      {selectedUser?.position}
                    </Badge>
                 </div>
                 <div className="flex items-center gap-4 text-sm text-slate-500">
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
            <Card className="shadow-sm border border-slate-100 bg-white">
              <CardContent className="p-5 flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                  <CalendarCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                  任务完成率
                </span>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-emerald-600">{userData.taskCompletionRate}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-slate-100 bg-white">
              <CardContent className="p-5 flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                  <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                  最新考试分数
                </span>
                <div className="flex items-end gap-2">
                   <span className={`text-3xl font-bold ${userData.lastExamScore >= 90 ? 'text-emerald-600' : userData.lastExamScore >= 80 ? 'text-indigo-600' : 'text-amber-600'}`}>
                     {userData.lastExamScore}
                   </span>
                   <span className="text-sm font-medium text-slate-400 mb-1">分</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-slate-100 bg-white">
              <CardContent className="p-5 flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                  总学习课件
                </span>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-slate-800">{userData.totalCoursesStudied}</span>
                   <span className="text-sm font-medium text-slate-400 mb-1">个</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-slate-100 bg-white">
              <CardContent className="p-5 flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                  <Presentation className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                  累计陪练时长
                </span>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-slate-800">{userData.totalPracticeTime}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6 h-[800px]">
             {/* Left Column: Recent Exams */}
             <Card className="shadow-sm border border-slate-100 flex flex-col bg-white">
                <CardHeader className="p-5 border-b border-slate-50">
                  <CardTitle className="text-sm font-bold flex items-center text-slate-800">
                    <LayoutList className="w-4 h-4 mr-2 text-indigo-500" /> 历次考试记录
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto">
                   <ul className="divide-y divide-slate-50">
                      {userData.recentExams.map((exam: any, i: number) => (
                        <li key={i} className="p-5 hover:bg-slate-50/50 transition-colors flex items-center justify-between">
                           <div>
                              <h4 className="font-bold text-sm text-slate-800 mb-1">{exam.name}</h4>
                              <p className="text-xs text-slate-400 flex items-center">
                                <Clock className="w-3 h-3 mr-1" /> {exam.date}
                              </p>
                           </div>
                           <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className={`text-xl font-bold ${exam.score >= 90 ? 'text-emerald-500' : 'text-indigo-500'}`}>
                                  {exam.score}
                                </span>
                                <span className="text-xs font-medium text-slate-400">分</span>
                              </div>
                              <Badge variant="outline" className={`mt-1 font-normal text-[10px] ${exam.passed ? 'bg-emerald-50 text-emerald-600 border-none' : 'bg-rose-50 text-rose-600 border-none'}`}>
                                {exam.passed ? '达标' : '未达标'}
                              </Badge>
                           </div>
                        </li>
                      ))}
                   </ul>
                </CardContent>
             </Card>

             {/* Right Column: Recent Tasks */}
             <Card className="shadow-sm border border-slate-100 flex flex-col bg-white">
                <CardHeader className="p-5 border-b border-slate-50">
                  <CardTitle className="text-sm font-bold flex items-center text-slate-800">
                    <CheckCircle className="w-4 h-4 mr-2 text-amber-500" /> 近期任务情况
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto">
                    <ul className="divide-y divide-slate-50">
                      {userData.recentTasks.map((task: any, i: number) => (
                        <li key={i} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col justify-center">
                           <div className="flex justify-between items-start mb-2">
                              <div className="flex-1 mr-4">
                                <h4 className="font-bold text-sm text-slate-800 leading-snug">{task.name}</h4>
                              </div>
                              <Badge variant="outline" className={`font-normal text-[10px] shrink-0 border-none ${
                                task.status === '已完成' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                                {task.status}
                              </Badge>
                           </div>
                           <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{task.type}</span>
                              {task.progress !== undefined && (
                                <div className="flex items-center w-32 gap-2">
                                  <Progress value={task.progress} className="h-1.5 [&>div]:bg-blue-500 bg-slate-100" />
                                  <span className="text-[10px] font-bold text-slate-500">{task.progress}%</span>
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

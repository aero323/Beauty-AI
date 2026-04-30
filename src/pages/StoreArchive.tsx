import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Building, Users, CalendarCheck, BookOpen, Clock, Presentation, GraduationCap, ChevronRight, Search } from 'lucide-react';

const MOCK_STORES = [
  { id: 's1', name: 'Jakarta Grand Indonesia', city: 'Jakarta' },
  { id: 's2', name: 'Jakarta Plaza Senayan', city: 'Jakarta' },
  { id: 's3', name: 'Surabaya Tunjungan Plaza', city: 'Surabaya' },
  { id: 's4', name: 'Bali Beachwalk', city: 'Bali' },
  { id: 's5', name: 'Bandung Trans Studio', city: 'Bandung' },
  { id: 's6', name: 'Medan Centre Point', city: 'Medan' },
  { id: 's7', name: 'Yogyakarta Hartono Mall', city: 'Yogyakarta' },
  { id: 's8', name: 'Makassar Trans Studio', city: 'Makassar' },
];

const MOCK_STORE_DATA: Record<string, any> = {
  's1': {
    baCount: 12,
    avgTaskCompletion: 92.5,
    avgStudyCount: 24,
    avgPracticeCount: 15,
    employees: [
      { id: 'BA001', name: 'Siti Aminah', position: '高级BA', completionRate: '98%', lastExamScore: 95 },
      { id: 'BA012', name: 'Rini Yulianti', position: '初级BA', completionRate: '85%', lastExamScore: 82 },
      { id: 'BA023', name: 'Andi Saputra', position: 'BA', completionRate: '90%', lastExamScore: 88 },
    ]
  },
  's2': {
    baCount: 8,
    avgTaskCompletion: 88.0,
    avgStudyCount: 18,
    avgPracticeCount: 12,
    employees: [
      { id: 'BA002', name: 'Budi Santoso', position: 'BA', completionRate: '88%', lastExamScore: 85 },
      { id: 'BA015', name: 'Lestari', position: '高级BA', completionRate: '100%', lastExamScore: 98 },
    ]
  },
  // Fallback for others
  'default': {
    baCount: 10,
    avgTaskCompletion: 85.0,
    avgStudyCount: 20,
    avgPracticeCount: 10,
    employees: [
      { id: 'BA055', name: 'Dian Sastrowardoyo', position: 'BA', completionRate: '85%', lastExamScore: 80 },
    ]
  }
};

export function StoreArchive({ userRole }: { userRole?: string }) {
  const [selectedStoreId, setSelectedStoreId] = useState<string>(MOCK_STORES[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStores = MOCK_STORES.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const storeData = MOCK_STORE_DATA[selectedStoreId] || MOCK_STORE_DATA['default'];
  const selectedStoreName = MOCK_STORES.find(s => s.id === selectedStoreId)?.name || '';

  const isNational = userRole === 'HQ Trainer';

  return (
    <div className="flex h-full bg-[#FAF9F8] overflow-hidden pt-2 rounded-xl border border-slate-200">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3 z-10 bg-white">
          <h2 className="font-bold text-slate-800 tracking-tight flex items-center">
            <Building className="w-5 h-5 mr-2 text-indigo-600" /> {isNational ? '全国' : '区域'}门店列表
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="搜索门店名称..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 relative z-10" 
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredStores.map(store => (
            <div 
              key={store.id}
              onClick={() => setSelectedStoreId(store.id)}
              className={`p-3 rounded-xl cursor-pointer transition-all border ${
                selectedStoreId === store.id 
                ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                : 'border-transparent hover:bg-slate-50'
              }`}
            >
              <h3 className={`text-sm font-bold truncate ${selectedStoreId === store.id ? 'text-indigo-800' : 'text-slate-800'}`}>
                {store.name}
              </h3>
              <p className={`text-xs mt-1 flex items-center ${selectedStoreId === store.id ? 'text-indigo-600' : 'text-slate-500'}`}>
                 <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${selectedStoreId === store.id ? 'bg-indigo-400' : 'bg-slate-300'}`}></span>
                 {store.city}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
        <div className="p-6 pb-4 shrink-0 bg-white border-b border-slate-200 z-10">
          <div className="flex items-center text-sm font-medium text-slate-500 mb-2">
            <Building className="w-4 h-4 mr-1.5" />
            {isNational ? '全国' : '区域'}门店总档案 
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-slate-800 font-bold">{selectedStoreName}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{selectedStoreName} - 培训数据看板</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="shadow-sm border-none bg-white">
              <CardContent className="p-5 flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                  BA 人数
                </span>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-slate-800">{storeData.baCount}</span>
                   <span className="text-sm font-medium text-slate-400 mb-1">人</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-none bg-white">
              <CardContent className="p-5 flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                  <CalendarCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                  平均任务完成率
                </span>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-emerald-600">{storeData.avgTaskCompletion}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-none bg-white">
              <CardContent className="p-5 flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                  平均课件学习次数
                </span>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-slate-800">{storeData.avgStudyCount}</span>
                   <span className="text-sm font-medium text-slate-400 mb-1">次/人</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-none bg-white">
              <CardContent className="p-5 flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                  <Presentation className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                  平均陪练习次数
                </span>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-slate-800">{storeData.avgPracticeCount}</span>
                   <span className="text-sm font-medium text-slate-400 mb-1">次/人</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Table */}
          <Card className="shadow-sm border border-slate-100 flex-1 min-h-[400px]">
             <CardHeader className="p-5 border-b border-slate-100 bg-white rounded-t-xl">
               <CardTitle className="text-sm font-bold text-slate-800">门店 BA 员工列表</CardTitle>
             </CardHeader>
             <CardContent className="p-0 overflow-auto bg-white rounded-b-xl">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50/80 sticky top-0 border-b border-slate-100">
                   <tr>
                     <th className="p-4 font-bold text-slate-500 w-24">工号</th>
                     <th className="p-4 font-bold text-slate-500 w-48">姓名</th>
                     <th className="p-4 font-bold text-slate-500 w-32">岗位</th>
                     <th className="p-4 font-bold text-slate-500 w-32">任务完成率</th>
                     <th className="p-4 font-bold text-slate-500 w-48">最近一次考试分数</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {storeData.employees.map((emp: any) => (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-slate-400 font-mono text-xs">{emp.id}</td>
                        <td className="p-4 font-bold text-slate-800 flex items-center">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3 text-xs">
                            {emp.name.charAt(0)}
                          </div>
                          {emp.name}
                        </td>
                        <td className="p-4">
                           <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal hover:bg-slate-100">{emp.position}</Badge>
                        </td>
                        <td className="p-4">
                           <span className="font-bold text-emerald-600">{emp.completionRate}</span>
                        </td>
                        <td className="p-4">
                           <div className="flex items-center">
                              <span className={`font-bold text-lg mr-1 ${emp.lastExamScore >= 90 ? 'text-emerald-600' : emp.lastExamScore >= 80 ? 'text-indigo-600' : 'text-amber-600'}`}>
                                {emp.lastExamScore}
                              </span>
                              <span className="text-xs text-slate-400">分</span>
                           </div>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

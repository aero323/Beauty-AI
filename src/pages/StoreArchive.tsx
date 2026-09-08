import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Building, Users, CalendarCheck, BookOpen, Presentation, ChevronRight, Search } from 'lucide-react';
import { brandTone, getScoreTone } from '../lib/visualTones';
import { MonthlyPointsFormulaTooltip } from '../components/MonthlyPointsFormulaTooltip';
import { getEmployeeMonthlyPointsFromRate } from '../lib/points';

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
      { id: 'BA001', name: 'Siti Aminah', completionRate: '98%', monthlyPoints: 236, lastExamScore: 95 },
      { id: 'BA012', name: 'Rini Yulianti', completionRate: '85%', monthlyPoints: 184, lastExamScore: 82 },
      { id: 'BA023', name: 'Andi Saputra', completionRate: '90%', monthlyPoints: 203, lastExamScore: 88 },
    ]
  },
  's2': {
    baCount: 8,
    avgTaskCompletion: 88.0,
    avgStudyCount: 18,
    avgPracticeCount: 12,
    employees: [
      { id: 'BA002', name: 'Budi Santoso', completionRate: '88%', monthlyPoints: 191, lastExamScore: 85 },
      { id: 'BA015', name: 'Lestari', completionRate: '100%', monthlyPoints: 248, lastExamScore: 98 },
    ]
  },
  // Fallback for others
  'default': {
    baCount: 10,
    avgTaskCompletion: 85.0,
    avgStudyCount: 20,
    avgPracticeCount: 10,
    employees: [
      { id: 'BA055', name: 'Dian Sastrowardoyo', completionRate: '85%', monthlyPoints: 176, lastExamScore: 80 },
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
    <div className="flex h-full bg-[#F7F3F1] overflow-hidden pt-2 rounded-xl border border-[#E5DED8]">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-[#E5DED8] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#E9E4DF] flex flex-col gap-3 z-10 bg-white">
          <h2 className="font-bold text-[#242124] tracking-tight flex items-center">
            <Building className="w-5 h-5 mr-2 text-rose-600" /> {isNational ? '全国门店列表' : '区域门店列表'}
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-[#9A9396] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索门店名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm border border-[#E5DED8] rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-[#F8F5F3] relative z-10"
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
                ? 'bg-rose-50 border-rose-200 shadow-sm'
                : 'border-transparent hover:bg-[#F8F5F3]'
              }`}
            >
              <h3 className={`text-sm font-bold truncate ${selectedStoreId === store.id ? 'text-rose-800' : 'text-[#242124]'}`}>
                {store.name}
              </h3>
              <p className={`text-xs mt-1 flex items-center ${selectedStoreId === store.id ? 'text-rose-600' : 'text-[#766F73]'}`}>
                 <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${selectedStoreId === store.id ? 'bg-indigo-400' : 'bg-slate-300'}`}></span>
                 {store.city}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8F5F3]/50">
        <div className="p-6 pb-4 shrink-0 bg-white border-b border-[#E5DED8] z-10">
          <div className="flex items-center text-sm font-medium text-[#766F73] mb-2">
            <Building className="w-4 h-4 mr-1.5" />
            {isNational ? '全国门店总档案' : '区域门店总档案'}
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-[#242124] font-bold">{selectedStoreName}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#242124]">{selectedStoreName} - 门店培训数据看板</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="shadow-sm border-none bg-white">
              <CardContent className="p-5 flex flex-col">
                <span className="text-xs font-bold text-[#766F73] uppercase tracking-wider mb-2 flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                  BA 人数
                </span>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-[#242124]">{storeData.baCount}</span>
                   <span className="text-sm font-medium text-[#9A9396] mb-1">人</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-none bg-white">
              <CardContent className="p-5 flex flex-col">
                <span className="text-xs font-bold text-[#766F73] uppercase tracking-wider mb-2 flex items-center">
                  <CalendarCheck className="w-3.5 h-3.5 mr-1.5 text-[#3B8F72]" />
                  平均任务完成率
                </span>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-[#3B8F72]">{storeData.avgTaskCompletion}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-none bg-white">
              <CardContent className="p-5 flex flex-col">
                <span className="text-xs font-bold text-[#766F73] uppercase tracking-wider mb-2 flex items-center">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                  平均课件学习次数
                </span>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-[#242124]">{storeData.avgStudyCount}</span>
                   <span className="text-sm font-medium text-[#9A9396] mb-1">次/人</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-none bg-white">
              <CardContent className="p-5 flex flex-col">
                <span className="text-xs font-bold text-[#766F73] uppercase tracking-wider mb-2 flex items-center">
                  <Presentation className="w-3.5 h-3.5 mr-1.5 text-[#B9822B]" />
                  平均练习次数
                </span>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-[#242124]">{storeData.avgPracticeCount}</span>
                   <span className="text-sm font-medium text-[#9A9396] mb-1">次/人</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Table */}
          <Card className="shadow-sm border border-[#E9E4DF] flex-1 min-h-[400px]">
             <CardHeader className="p-5 border-b border-[#E9E4DF] bg-white rounded-t-xl">
               <CardTitle className="text-sm font-bold text-[#242124]">门店 BA 员工列表</CardTitle>
             </CardHeader>
             <CardContent className="p-0 overflow-auto bg-white rounded-b-xl">
               <table className="w-full text-left text-sm">
                 <thead className="bg-[#F8F5F3]/80 sticky top-0 border-b border-[#E9E4DF]">
                   <tr>
                     <th className="p-4 font-bold text-[#766F73] w-24">工号</th>
                     <th className="p-4 font-bold text-[#766F73] w-48">姓名</th>
                     <th className="p-4 font-bold text-[#766F73] w-32"><MonthlyPointsFormulaTooltip /></th>
                     <th className="p-4 font-bold text-[#766F73] w-32">任务完成率</th>
                     <th className="p-4 font-bold text-[#766F73] w-48">最近一次考试分数</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {storeData.employees.map((emp: any) => (
                      <tr key={emp.id} className="hover:bg-[#F8F5F3]/50 transition-colors">
                        <td className="p-4 text-[#9A9396] font-mono text-xs">{emp.id}</td>
                        <td className="p-4 font-bold text-[#242124] flex items-center">
                          <div className={`w-8 h-8 rounded-full ${brandTone.bgClass} ${brandTone.textClass} flex items-center justify-center font-bold mr-3 text-xs`}>
                            {emp.name.charAt(0)}
                          </div>
                          {emp.name}
                        </td>
                        <td className="p-4">
                           <span className={`font-bold ${brandTone.textClass}`}>
                             {getEmployeeMonthlyPointsFromRate(Number.parseFloat(emp.completionRate), emp.lastExamScore)}
                           </span>
                        </td>
                        <td className="p-4">
                           <span className="font-bold text-[#3B8F72]">{emp.completionRate}</span>
                        </td>
                        <td className="p-4">
                           <div className="flex items-center">
                              <span className={`font-bold text-lg mr-1 ${getScoreTone(emp.lastExamScore)}`}>
                                {emp.lastExamScore}
                              </span>
                              <span className="text-xs text-[#9A9396]">分</span>
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

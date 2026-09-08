import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Building2, Award, AlertTriangle, ChevronLeft, BookOpen, ArrowDownRight, PlayCircle, ChevronRight, User, Building, Target } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { brandTone, getProgressTone, getScoreTone } from '../lib/visualTones';
import { AppDownloadButton } from '../components/AppDownloadButton';
import { MonthlyPointsFormulaTooltip } from '../components/MonthlyPointsFormulaTooltip';
import { getEmployeeMonthlyPointsFromRate } from '../lib/points';

export function SMDashboard() {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const selectedStaffProgress = selectedStaff === 'Cintya' ? 100 : selectedStaff === 'Eka' ? 90 : selectedStaff === 'Putri' ? 85 : selectedStaff === 'Lestari' ? 60 : 37;
  const selectedStaffTone = getProgressTone(selectedStaffProgress);

  const handleStaffClick = (name: string) => {
    setSelectedStaff(name);
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col pt-2">
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-xl shadow-sm border border-[#E9E4DF]">
         <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
               <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F1C1F]">Toko Mal Kelapa Gading</h2>
              <p className="text-xs text-[#766F73]">Jakarta South District</p>
            </div>
         </div>
         <div className="flex items-center gap-2">
           <AppDownloadButton compact />
           <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none px-3 py-1 text-xs">门店排名预警: 倒数第一</Badge>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-xs font-semibold text-[#9A9396] uppercase tracking-widest">本店 BA 编制</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold">5<span className="text-sm font-normal text-[#9A9396] ml-1">人</span></span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-xs font-semibold text-[#9A9396] uppercase tracking-widest">本店综合完课率</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold text-rose-600">62%</span>
              <span className="text-xs text-rose-500 font-semibold mb-1">全区平均: 85%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-xs font-semibold text-[#9A9396] uppercase tracking-widest">本店考试均分</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold text-[#B9822B]">71.4</span>
              <span className="text-xs text-[#9A9396] italic mb-1">勉强及格</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 flex flex-col space-y-6">
        <Tabs defaultValue="staff" className="w-full flex-1 flex flex-col min-h-[460px]">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-12 p-0">
            <TabsTrigger value="staff" className="data-[state=active]:border-b-2 data-[state=active]:border-rose-600 rounded-none h-full px-6 data-[state=active]:shadow-none data-[state=active]:bg-transparent font-bold">本店员工排行</TabsTrigger>
            <TabsTrigger value="store" className="data-[state=active]:border-b-2 data-[state=active]:border-rose-600 rounded-none h-full px-6 data-[state=active]:shadow-none data-[state=active]:bg-transparent font-bold">区域门店全榜</TabsTrigger>
            <TabsTrigger value="my-store" className="data-[state=active]:border-b-2 data-[state=active]:border-rose-600 rounded-none h-full px-6 data-[state=active]:shadow-none data-[state=active]:bg-transparent font-bold">本店效能档案</TabsTrigger>
          </TabsList>

          <TabsContent value="staff" className="pt-4 flex-1 outline-none">
            <Card className="h-full flex flex-col border-none shadow-none">
              {selectedStaff ? (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 border border-[#E9E4DF] rounded-xl p-4 shadow-sm bg-white">
                   <div className="flex flex-row items-center justify-between mb-4">
                      <button onClick={() => setSelectedStaff(null)} className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center px-3 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-full transition-colors">
                         <ChevronLeft className="h-3 w-3 mr-1" /> 返回员工列表
                      </button>
                      <Badge variant="destructive" className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none">{selectedStaff === 'Rina' || selectedStaff === 'Lestari' ? '需重点关注' : '正常'}</Badge>
                   </div>
                   <div className="flex items-center space-x-4 mb-6 px-2">
                      <div className="h-16 w-16 rounded-full bg-slate-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                         <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${selectedStaff}`} alt={selectedStaff} className="h-full w-full object-cover" />
                      </div>
                      <div>
                         <h3 className="text-lg font-bold text-[#242124]">{selectedStaff}</h3>
                         <p className="text-xs text-[#766F73]">Toko Mal Kelapa Gading | 编制 BA</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                      <div className="space-y-4">
                         <div className="bg-white rounded-xl p-4 border border-[#E9E4DF] shadow-sm h-full flex flex-col">
                           <h4 className="text-xs font-bold text-[#242124] mb-4 tracking-wider flex items-center"><BookOpen className="h-4 w-4 mr-2 text-rose-500" /> 学习与考试</h4>
                           <div className="space-y-4 flex-1">
                             <div className="bg-[#F8F5F3]/50 p-3 rounded-lg border border-[#E9E4DF]">
                               <div className="flex justify-between text-xs mb-2">
                                 <span className="text-[#766F73] font-medium">本月完课率</span>
                                 <span className={`font-bold ${selectedStaffTone.textClass}`}>{selectedStaffProgress}%</span>
                               </div>
                               <Progress value={selectedStaffProgress} className="h-1.5 bg-slate-100" indicatorClassName={selectedStaffTone.indicatorClass} />
                             </div>
                             <div className="bg-[#F8F5F3]/50 p-3 rounded-lg border border-[#E9E4DF]">
                               <div className="flex justify-between text-xs mb-2">
                                 <span className="text-[#766F73] font-medium">最近考试成绩</span>
                                 <span className={`font-bold ${selectedStaff === 'Rina' || selectedStaff === 'Lestari' ? 'text-rose-600' : 'text-[#3F3A3D]'}`}>
                                   {selectedStaff === 'Cintya' ? '92' : selectedStaff === 'Eka' ? '86' : selectedStaff === 'Putri' ? '75' : selectedStaff === 'Lestari' ? '65' : '52'}分
                                 </span>
                               </div>
                               <div className="text-[10px] text-[#9A9396] mt-1 flex items-center font-medium">
                                 本月个人排名：<span className="ml-1 text-[#5D565A] font-bold">#{selectedStaff === 'Cintya' ? '1' : selectedStaff === 'Eka' ? '2' : selectedStaff === 'Putri' ? '3' : selectedStaff === 'Lestari' ? '4' : '5'}</span>
                               </div>
                             </div>
                           </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                          <div className="bg-white rounded-xl p-4 border border-[#E9E4DF] shadow-sm h-full flex flex-col">
                           <h4 className="text-xs font-bold text-[#242124] mb-4 tracking-wider flex items-center"><PlayCircle className="h-4 w-4 mr-2 text-[#3B8F72]" /> 陪练与打卡</h4>
                           <div className="space-y-3 text-sm flex-1">
                             <div className="bg-[#F8F5F3]/50 p-3 rounded-lg border border-[#E9E4DF] h-full">
                               <div className="flex justify-between items-center border-b border-[#E5DED8]/60 pb-3 mb-3">
                                 <span className="text-[#766F73] text-xs font-medium">本月对练达标</span>
                                 <span className="font-bold text-[#242124]">{selectedStaff === 'Cintya' || selectedStaff === 'Eka' || selectedStaff === 'Putri' ? '已达标' : '未达标'}</span>
                               </div>
                               <div className="flex justify-between items-center border-b border-[#E5DED8]/60 pb-3 mb-3">
                                 <span className="text-[#766F73] text-xs font-medium">剧本练习进度</span>
                                 <span className="font-bold text-[#242124]">{selectedStaff === 'Cintya' ? '5/5' : selectedStaff === 'Eka' ? '4/5' : selectedStaff === 'Putri' ? '2/5' : '0/5'}</span>
                               </div>
                               <div className="flex justify-between items-center">
                                 <span className="text-[#766F73] text-xs font-medium">表现评价</span>
                                 <span className={`font-bold ${selectedStaff === 'Cintya' || selectedStaff === 'Eka' ? 'text-green-600' : selectedStaff === 'Putri' ? 'text-[#5D565A]' : 'text-rose-500'}`}>
                                   {selectedStaff === 'Cintya' ? '优秀' : selectedStaff === 'Eka' ? '良好' : selectedStaff === 'Putri' ? '正常' : '需重点突破'}
                                 </span>
                               </div>
                             </div>
                           </div>
                         </div>
                      </div>

                      <div className="md:col-span-2 pt-2">
                         <div className="bg-orange-50/30 border border-orange-100 rounded-xl p-4 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                            <h4 className="text-xs font-bold text-[#242124] mb-2 flex items-center">
                               <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                               数据波动与指导提示
                            </h4>
                            <p className="text-xs text-[#3F3A3D] leading-relaxed">
                              {selectedStaff === 'Cintya' || selectedStaff === 'Eka' ?
                                <>该员工近期陪练频率平稳，知识点覆盖率极高（<span className="font-bold text-green-600">95%+</span>）。<span className="text-[#766F73] mt-2 block border-t border-orange-100 pt-2">建议鼓励其向新人分享学习方法，甚至在早会中担任一次临时讲师，通过输出巩固知识。</span></> :
                                <>根据近期错题统计，该员工的知识盲区主要集中在<span className="font-bold text-[#242124]">「夏季新品系列」</span>。其中涉及<span className="bg-white shadow-sm px-1 border border-orange-100 rounded text-[10px] font-mono mx-1">焕白精华适用肤质</span>的考题错误率最高。<span className="text-[#766F73] mt-2 block border-t border-orange-100 pt-2">建议在接下来的早会抽查中，针对此员工专门提问几道此知识点的内容进行夯实巩固。</span></>}
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col h-full bg-white border border-[#E9E4DF] rounded-xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                   <CardHeader className="p-4 border-b border-slate-50 bg-[#F8F5F3]/50">
                      <CardTitle className="text-sm font-bold text-[#242124] flex justify-between items-center">
                        <span className="flex items-center"><User className="h-4 w-4 mr-2 text-rose-500"/> 本店员工学习力排名</span>
                      </CardTitle>
                      <CardDescription className="text-[10px] uppercase tracking-widest mt-1">点击员工姓名查看档案细节</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto flex-1">
                       <table className="w-full text-sm">
                        <thead className="bg-[#F8F5F3]/50 text-[#9A9396] text-[10px] uppercase tracking-wider text-left border-y border-[#E9E4DF] sticky top-0 z-10">
                          <tr>
                            <th className="py-2.5 px-5 font-bold w-12 text-center">Rank</th>
                            <th className="py-2.5 px-4 font-bold">员工姓名</th>
                            <th className="py-2.5 px-2 font-bold w-1/3">完课进度</th>
                            <th className={`py-2.5 px-3 font-bold text-center ${brandTone.textClass}`}><MonthlyPointsFormulaTooltip /></th>
                            <th className="py-2.5 px-5 font-bold text-right text-[#766F73]">最新考试成绩</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStaffClick('Cintya')}>
                            <td className="py-3 px-5 font-bold text-[#B9822B] text-center">1</td>
                            <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Cintya</td>
                            <td className="py-3 px-2">
                               <div className="flex items-center space-x-2">
                                 <Progress value={100} className="h-1.5 w-16 bg-slate-100" indicatorClassName={getProgressTone(100).indicatorClass} />
                                 <span className={`text-[10px] font-bold ${getProgressTone(100).textClass}`}>100%</span>
                               </div>
                            </td>
                            <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>{getEmployeeMonthlyPointsFromRate(100, 92)}</td>
                            <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(92)}`}>92</td>
                          </tr>
                          <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStaffClick('Eka')}>
                            <td className="py-3 px-5 font-bold text-[#9A9396] text-center">2</td>
                            <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Eka</td>
                            <td className="py-3 px-2">
                               <div className="flex items-center space-x-2">
                                 <Progress value={90} className="h-1.5 w-16 bg-slate-100" indicatorClassName={getProgressTone(90).indicatorClass} />
                                 <span className={`text-[10px] font-bold ${getProgressTone(90).textClass}`}>90%</span>
                               </div>
                            </td>
                            <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>{getEmployeeMonthlyPointsFromRate(90, 86)}</td>
                            <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(86)}`}>86</td>
                          </tr>
                          <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStaffClick('Putri')}>
                            <td className="py-3 px-5 font-bold text-[#8B621F] text-center">3</td>
                            <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-rose-600 transition-colors">Putri</td>
                            <td className="py-3 px-2">
                               <div className="flex items-center space-x-2">
                                 <Progress value={85} className="h-1.5 w-16 bg-slate-100" indicatorClassName={getProgressTone(85).indicatorClass} />
                                 <span className={`text-[10px] font-bold ${getProgressTone(85).textClass}`}>85%</span>
                               </div>
                            </td>
                            <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>{getEmployeeMonthlyPointsFromRate(85, 75)}</td>
                            <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(75)}`}>75</td>
                          </tr>
                          <tr className="hover:bg-[#F8F5F3] transition-colors group cursor-pointer" onClick={() => handleStaffClick('Lestari')}>
                            <td className="py-3 px-5 font-bold text-[#9A9396] text-center">4</td>
                            <td className="py-3 px-4 font-bold text-[#242124] group-hover:text-[#B9822B] transition-colors">Lestari</td>
                            <td className="py-3 px-2">
                               <div className="flex items-center space-x-2">
                                 <Progress value={60} className="h-1.5 w-16 bg-slate-100" indicatorClassName={getProgressTone(60).indicatorClass} />
                                 <span className={`text-[10px] font-bold ${getProgressTone(60).textClass}`}>60%</span>
                               </div>
                            </td>
                            <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>{getEmployeeMonthlyPointsFromRate(60, 65)}</td>
                            <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(65)}`}>65</td>
                          </tr>
                           <tr className="hover:bg-rose-50/50 transition-colors group cursor-pointer bg-rose-50/20" onClick={() => handleStaffClick('Rina')}>
                            <td className="py-3 px-5 font-bold text-rose-400 text-center">5</td>
                            <td className="py-3 px-4 font-bold text-rose-600 group-hover:text-rose-800 transition-colors flex items-center">
                              Rina
                              <AlertTriangle className="h-3 w-3 ml-1 text-rose-500" />
                            </td>
                            <td className="py-3 px-2">
                               <div className="flex items-center space-x-2">
                                 <Progress value={37} className="h-1.5 w-16 bg-slate-100" indicatorClassName={getProgressTone(37).indicatorClass} />
                                 <span className={`text-[10px] font-bold ${getProgressTone(37).textClass}`}>37%</span>
                               </div>
                            </td>
                            <td className={`py-3 px-3 text-center font-bold ${brandTone.textClass}`}>{getEmployeeMonthlyPointsFromRate(37, 52)}</td>
                            <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(52)}`}>52</td>
                          </tr>
                        </tbody>
                      </table>
                    </CardContent>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="store" className="pt-4 flex-1 outline-none">
             <Card className="flex flex-col h-full bg-white border border-[#E9E4DF] rounded-xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <CardHeader className="p-4 border-b border-slate-50 bg-[#F8F5F3]/50">
                <CardTitle className="text-sm font-bold text-[#242124] flex justify-between items-center">
                  <span className="flex items-center"><Building className="h-4 w-4 mr-2 text-rose-500" /> 区域门店全榜 (只读展示)</span>
                </CardTitle>
                <CardDescription className="text-[10px] uppercase tracking-widest mt-1">仅做同大区内横向对比参考</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto flex-1">
                 <table className="w-full text-sm">
                  <thead className="bg-[#F8F5F3]/50 text-[#9A9396] text-[10px] uppercase tracking-wider text-left border-y border-[#E9E4DF] sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-5 font-bold w-12 text-center">Rank</th>
                      <th className="py-2.5 px-4 font-bold">门店名称</th>
                      <th className="py-2.5 px-2 font-bold hidden sm:table-cell text-center">参训人数</th>
                      <th className="py-2.5 px-3 font-bold text-center">任务完成率</th>
                      <th className="py-2.5 px-5 font-bold text-right text-[#766F73]">最新考试平均分</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr className="hover:bg-[#F8F5F3] transition-colors">
                      <td className="py-3 px-5 font-bold text-[#B9822B] text-center">1</td>
                      <td className="py-3 px-4 font-bold text-[#242124]">Toko Senayan City</td>
                       <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell text-center font-mono">6/6</td>
                      <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">100%</td>
                      <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(92)}`}>92</td>
                    </tr>
                    <tr className="hover:bg-[#F8F5F3] transition-colors">
                      <td className="py-3 px-5 font-bold text-[#9A9396] text-center">2</td>
                      <td className="py-3 px-4 font-bold text-[#242124]">Toko Pacific Place</td>
                      <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell text-center font-mono">8/8</td>
                      <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">95%</td>
                      <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(87)}`}>87</td>
                    </tr>
                    <tr className="hover:bg-[#F8F5F3] transition-colors">
                      <td className="py-3 px-5 font-bold text-[#8B621F] text-center">3</td>
                      <td className="py-3 px-4 font-bold text-[#242124]">Toko Gandaria City</td>
                      <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell text-center font-mono">5/5</td>
                      <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">90%</td>
                      <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(81)}`}>81</td>
                    </tr>
                    <tr className="hover:bg-[#F8F5F3] transition-colors">
                      <td className="py-3 px-5 font-bold text-[#9A9396] text-center">4</td>
                      <td className="py-3 px-4 font-bold text-[#242124]">Toko Pondok Indah</td>
                      <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell text-center font-mono">4/5</td>
                      <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">80%</td>
                      <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(73)}`}>73</td>
                    </tr>
                    <tr className="bg-rose-50/50 border-l-2 border-l-indigo-500 hover:bg-rose-50 transition-colors">
                      <td className="py-3 px-5 font-bold text-rose-500 text-center">5</td>
                      <td className="py-3 px-4 font-bold text-rose-700 flex items-center">
                        Toko Mal Kelapa Gading
                        <Badge className="ml-2 px-1 py-0 text-[9px] bg-rose-500 text-white border-none rounded">本店</Badge>
                      </td>
                      <td className="py-3 px-2 text-[10px] text-[#766F73] hidden sm:table-cell text-center font-mono">5/5</td>
                      <td className="py-3 px-3 text-center font-medium text-[#3F3A3D]">62%</td>
                      <td className={`py-3 px-5 text-right font-bold text-base ${getScoreTone(71.4)}`}>71.4</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="my-store" className="pt-4 flex-1 outline-none">
             <Card className="h-full flex flex-col border-none shadow-none">
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 border border-[#E9E4DF] rounded-xl p-4 shadow-sm bg-white">
                   <div className="flex items-center space-x-4 mb-6 px-2">
                       <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-100">
                         <Building className="h-6 w-6 text-rose-600" />
                       </div>
                       <div>
                         <h3 className="text-lg font-bold text-[#242124]">Toko Mal Kelapa Gading</h3>
                         <p className="text-xs text-[#766F73] mt-1">店长: 您 <span className="mx-1 text-[#C9C1C4]">|</span> 编制 BA: <span className="font-bold text-[#3F3A3D]">5 名</span> <span className="mx-1 text-[#C9C1C4]">|</span> 区域排名: <span className="font-bold text-rose-500">倒数第一</span></p>
                       </div>
                   </div>

                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                      <div className="bg-[#F8F5F3] rounded-xl p-3 border border-[#E9E4DF] shadow-sm text-center">
                         <p className="text-[10px] font-bold text-[#9A9396] uppercase tracking-widest mb-1">人均陪练</p>
                         <p className="text-2xl font-bold text-rose-600">1.2<span className="text-xs text-rose-400 font-medium ml-1">hrs</span></p>
                      </div>
                      <div className="bg-[#F8F5F3] rounded-xl p-3 border border-[#E9E4DF] shadow-sm text-center">
                         <p className="text-[10px] font-bold text-[#9A9396] uppercase tracking-widest mb-1">完课率</p>
                         <p className="text-2xl font-bold text-rose-600">62<span className="text-xs text-rose-400 font-medium ml-1">%</span></p>
                      </div>
                       <div className="bg-[#F8F5F3] rounded-xl p-3 border border-[#E9E4DF] shadow-sm text-center">
                         <p className="text-[10px] font-bold text-[#9A9396] uppercase tracking-widest mb-1">优秀 BA 数</p>
                         <p className="text-2xl font-bold text-[#3B8F72]">1<span className="text-xs text-[#3B8F72] font-medium ml-1">人</span></p>
                      </div>
                      <div className="bg-[#F8F5F3] rounded-xl p-3 border border-[#E9E4DF] shadow-sm text-center border-b-2 border-b-rose-400">
                         <p className="text-[10px] font-bold text-[#9A9396] uppercase tracking-widest mb-1">月度均分</p>
                         <p className="text-2xl font-bold text-rose-600">71.4<span className="text-xs text-rose-400 font-medium ml-1">分</span></p>
                      </div>
                   </div>

                    <div className="border border-[#E9E4DF] rounded-xl pt-0 overflow-hidden flex-1 flex flex-col bg-[#F8F5F3]/50">
                      <div className="p-3 bg-white border-b border-[#E9E4DF]">
                        <h4 className="text-xs font-bold text-[#242124] uppercase tracking-wider flex items-center">
                          <Target className="h-4 w-4 mr-2 text-rose-500" />
                          本店教务效能诊断档案
                        </h4>
                      </div>
                      <div className="p-4 space-y-4 flex-1">
                        <div className="flex flex-wrap gap-2">
                           <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-none px-3 py-1 text-xs">夏季新品考题低分预警 (-20%)</Badge>
                           <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none px-3 py-1 text-xs">陪练活跃度全区垫底</Badge>
                           <Badge className="bg-slate-200 text-[#3F3A3D] hover:bg-slate-300 border-none px-3 py-1 text-xs">员工学习进度断层严重</Badge>
                        </div>
                         <div className="text-xs text-[#5D565A] mt-2 leading-relaxed bg-white border border-[#E5DED8] shadow-sm p-4 rounded-xl relative">
                           <div className="absolute -left-1 top-4 w-2 h-8 bg-rose-500 rounded-r-full"></div>
                           <span className="font-bold text-rose-700 block mb-1">AI 录音文本与数据交叉分析简报：</span>
                           本月本店完课率（62%）与均分双双远低于全区平均（85% / 81分）。系统拉取录音文本检索发现，店员在<span className="font-mono bg-rose-50 px-1 py-0.5 rounded border border-rose-100 font-medium">新品成分讲解</span>场景中表现极其薄弱，核心卖点词汇命中率不足 40%。
                           <br/><span className="mt-1 block text-[#766F73]">此种情况通常由未及时向员工下发培训要求、或未进行带教抽测导致。建议您尽快在本周内组织一次「全员新品专场内训及通关验收」。</span>
                         </div>
                      </div>
                    </div>
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

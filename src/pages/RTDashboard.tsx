import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import {
  Users,
  MapPin,
  BellRing,
  AlertTriangle,
  PlayCircle,
  FileText,
  MessageSquare,
  BookOpen,
  Plus
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { getProgressTone } from '../lib/visualTones';

export function RTDashboard() {
  return (
    <div className="space-y-6 flex-1 flex flex-col pt-2">
      {/* Top KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden">
          <CardHeader className="p-5 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-[#9A9396] uppercase tracking-widest">管辖门店数</CardTitle>
            <MapPin className="h-4 w-4 text-[#C9C1C4]" />
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold text-[#242124]">18<span className="text-sm font-medium text-[#766F73] ml-1">家</span></span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden">
          <CardHeader className="p-5 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-[#9A9396] uppercase tracking-widest">总管辖 BA 人数</CardTitle>
            <Users className="h-4 w-4 text-[#C9C1C4]" />
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold text-[#242124]">142<span className="text-sm font-medium text-[#766F73] ml-1">人</span></span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden">
          <CardHeader className="p-5 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-[#9A9396] uppercase tracking-widest">本周任务完课率</CardTitle>
            <BookOpen className="h-4 w-4 text-[#C9C1C4]" />
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold text-rose-600">88%</span>
              <span className="text-xs text-rose-500 font-semibold mb-1">进度良好</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden">
          <CardHeader className="p-5 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-[#9A9396] uppercase tracking-widest">系统自动催办提醒</CardTitle>
            <BellRing className="h-4 w-4 text-[#B9822B]" />
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold text-[#242124]">27<span className="text-sm font-medium text-[#766F73] ml-1">次</span></span>
              <span className="text-[10px] bg-[#DCEFE7] text-[#2F735C] px-2 py-0.5 rounded-full font-bold mb-1">今日已全自动发送</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full flex-1">
        {/* Left Column: BA List & Mistake Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden">
            <CardHeader className="p-5 bg-[#F8F5F3] border-b border-[#E9E4DF] flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center">
                <Users className="h-4 w-4 mr-2 text-rose-500" /> BA 本周学习进度与档案
              </CardTitle>
              <Badge className="bg-white border-[#E5DED8] text-[#5D565A] font-normal">支持录音回读与分值调出</Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto">
               <table className="w-full text-sm">
                  <thead className="bg-[#F8F5F3] text-[#766F73] text-xs uppercase tracking-wider text-left border-b border-[#E9E4DF] hidden sm:table-header-group">
                    <tr>
                      <th className="py-3 px-5 font-medium">姓名 / 门店</th>
                      <th className="py-3 px-2 font-medium w-1/4">课程任务进度</th>
                      <th className="py-3 px-3 font-medium text-center">AI 陪练得分</th>
                      <th className="py-3 px-3 font-medium text-center">最新考分</th>
                      <th className="py-3 px-5 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr>
                      <td className="py-4 px-5">
                        <p className="font-semibold text-[#1F1C1F]">Arief</p>
                        <p className="text-[10px] text-[#9A9396]">Toko Senayan</p>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] text-[#9A9396]">昨日已学</span>
                             <span className={`text-[10px] font-bold ${getProgressTone(100).textClass}`}>完毕</span>
                          </div>
                          <Progress value={100} className="h-1.5 w-full bg-slate-100" indicatorClassName={getProgressTone(100).indicatorClass} />
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <Badge className="bg-[#EEF8F4] text-[#3B8F72] border-emerald-100">92 分</Badge>
                      </td>
                      <td className="py-4 px-3 text-center font-bold text-[#3F3A3D]">98</td>
                      <td className="py-4 px-5 text-right">
                         <button className="text-rose-600 hover:text-rose-800 font-semibold text-xs transition-colors flex items-center justify-end w-full">
                           <PlayCircle className="h-3.5 w-3.5 mr-1" /> 调取录音
                         </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-5">
                        <p className="font-semibold text-[#1F1C1F]">Dian</p>
                        <p className="text-[10px] text-[#9A9396]">Toko Pacific</p>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex flex-col space-y-1">
                           <div className="flex items-center justify-between">
                             <span className="text-[10px] text-[#9A9396]">今日 09:12 学过</span>
                             <span className={`text-[10px] font-bold ${getProgressTone(80).textClass}`}>80%</span>
                          </div>
                          <Progress value={80} className="h-1.5 w-full bg-slate-100" indicatorClassName={getProgressTone(80).indicatorClass} />
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <Badge className="bg-rose-50 text-rose-600 border-rose-100">85 分</Badge>
                      </td>
                      <td className="py-4 px-3 text-center font-bold text-[#3F3A3D]">82</td>
                      <td className="py-4 px-5 text-right">
                         <button className="text-rose-600 hover:text-rose-800 font-semibold text-xs transition-colors flex items-center justify-end w-full">
                           <PlayCircle className="h-3.5 w-3.5 mr-1" /> 调取录音
                         </button>
                      </td>
                    </tr>
                     <tr className="bg-[#FFF7EA]/20">
                      <td className="py-4 px-5">
                        <p className="font-semibold text-[#4C3415]">Rina</p>
                        <p className="text-[10px] text-[#B9822B]">Toko Kelapa Gading</p>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex flex-col space-y-1">
                           <div className="flex items-center justify-between">
                             <span className="text-[10px] text-[#B9822B] font-medium">3天未登录</span>
                             <span className={`text-[10px] font-bold ${getProgressTone(20).textClass}`}>20%</span>
                          </div>
                          <Progress value={20} className="h-1.5 w-full bg-slate-100" indicatorClassName={getProgressTone(20).indicatorClass} />
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <Badge className="bg-[#F7E6C8] text-[#8B621F] border-none font-bold">58 分</Badge>
                      </td>
                      <td className="py-4 px-3 text-center font-bold text-rose-600">45</td>
                      <td className="py-4 px-5 text-right flex flex-col items-end space-y-2 pb-2">
                         <button className="text-rose-600 hover:text-rose-800 font-semibold text-xs transition-colors flex items-center">
                           查看错题
                         </button>
                         <button className="text-rose-600 hover:text-rose-800 font-semibold text-[10px] transition-colors flex items-center opacity-70">
                           <PlayCircle className="h-3 w-3 mr-1" /> 听取陪练
                         </button>
                      </td>
                    </tr>
                  </tbody>
               </table>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden">
             <CardHeader className="p-5 bg-[#F8F5F3] border-b border-[#E9E4DF] flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-rose-500" /> 区域高频考试错题分析
              </CardTitle>
              <Badge className="bg-white border-[#E5DED8] text-[#5D565A] font-normal">一键发送群讲解</Badge>
            </CardHeader>
            <CardContent className="p-5">
                <div className="space-y-4">
                   <div className="flex items-start justify-between p-4 border border-rose-100 bg-rose-50/30 rounded-xl">
                      <div className="pr-4">
                         <p className="text-sm font-bold text-[#242124] mb-1">Q4: 客户提到竞品 'Brand A' 的光甘草定精华时，最佳应对策略是？</p>
                         <p className="text-xs text-[#766F73]">知识模块：2026早春抗老新品速递卡</p>
                      </div>
                      <div className="shrink-0 text-center">
                         <p className="text-xs text-rose-400 font-semibold mb-1">区域内错误率</p>
                         <p className="text-2xl font-bold text-rose-600">68%</p>
                      </div>
                   </div>

                   <div className="flex items-start justify-between p-4 border border-[#F2DEC0] bg-[#FFF7EA]/30 rounded-xl">
                      <div className="pr-4">
                         <p className="text-sm font-bold text-[#242124] mb-1">Q12: 当检测出受试者眼周存在假性干纹时，以下哪种连带销售手法最合理？</p>
                         <p className="text-xs text-[#766F73]">知识模块：进阶连带销售话术</p>
                      </div>
                      <div className="shrink-0 text-center">
                         <p className="text-xs text-[#B9822B] font-semibold mb-1">区域内错误率</p>
                         <p className="text-2xl font-bold text-[#B9822B]">45%</p>
                      </div>
                   </div>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Regional Scenario Creation */}
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden h-full flex flex-col">
             <CardHeader className="p-5 bg-rose-50/50 border-b border-rose-50/50 flex flex-col">
              <CardTitle className="text-base font-bold flex items-center text-rose-950 mb-2">
                <FileText className="h-4 w-4 mr-2 text-rose-500" /> 特色区域陪练剧本库
              </CardTitle>
              <CardDescription className="text-xs text-rose-600/70">
                可基于本地特性（如商圈特定竞品、当地节假日习俗）下发布区域专属AI陪练内容。
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col space-y-4">

                <button className="w-full py-4 border-2 border-dashed border-rose-200 rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-colors flex flex-col items-center justify-center text-rose-600 group">
                   <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Plus className="h-4 w-4" />
                   </div>
                   <span className="font-bold text-sm">创建区域专属剧本</span>
                </button>

                <div className="mt-4 space-y-3">
                   <p className="text-xs font-semibold text-[#9A9396] uppercase tracking-widest mb-2">已分发给您的 BA</p>

                   <div className="p-3 border border-[#E9E4DF] rounded-xl hover:border-rose-100 hover:shadow-sm transition-all group cursor-pointer bg-white">
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-sm font-bold text-[#242124]">斋月大促客流高峰话术</span>
                         <Badge className="bg-rose-50 text-rose-600 border-none font-bold text-[10px]">生效中</Badge>
                      </div>
                      <p className="text-[10px] text-[#766F73] line-clamp-2 leading-relaxed mb-3">为即将来临的斋月准备，重点演练快速接待多位顾客、推荐斋月礼盒套餐的特殊话术。</p>
                      <div className="flex justify-between items-center border-t border-slate-50 pt-2 text-[10px] text-[#9A9396]">
                         <span>123人 已练</span>
                         <span className="flex items-center hover:text-rose-600 font-semibold"><MessageSquare className="h-3 w-3 mr-1" /> 编辑</span>
                      </div>
                   </div>

                   <div className="p-3 border border-[#E9E4DF] rounded-xl hover:border-rose-100 hover:shadow-sm transition-all group cursor-pointer bg-white">
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-sm font-bold text-[#242124]">太平洋广场-竞品阻击专项</span>
                         <Badge className="bg-rose-50 text-rose-600 border-none font-bold text-[10px]">生效中</Badge>
                      </div>
                      <p className="text-[10px] text-[#766F73] line-clamp-2 leading-relaxed mb-3">针对 Pacific Place 商圈对门开店的 'Brand X'，演练我方产品的长效保湿优势应对。</p>
                      <div className="flex justify-between items-center border-t border-slate-50 pt-2 text-[10px] text-[#9A9396]">
                         <span>45人 已练</span>
                         <span className="flex items-center hover:text-rose-600 font-semibold"><MessageSquare className="h-3 w-3 mr-1" /> 编辑</span>
                      </div>
                   </div>
                </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

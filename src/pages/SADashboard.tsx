import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Users, Server, Cpu, Activity, ShieldCheck, Database, HardDrive, Network } from 'lucide-react';
import { AppDownloadButton } from '../components/AppDownloadButton';

export function SADashboard() {
  return (
    <div className="space-y-6 flex-1 flex flex-col pt-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#9A9396]">Dashboard</p>
          <h2 className="text-xl font-bold text-[#242124]">系统运行概览</h2>
        </div>
        <AppDownloadButton />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-xs font-semibold text-[#9A9396] uppercase tracking-widest">今日系统日活 (DAU)</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold">12,450</span>
              <span className="text-xs text-green-500 font-semibold mb-1">↑ 12%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-xs font-semibold text-[#9A9396] uppercase tracking-widest">月活用户 (MAU)</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold">45,820</span>
              <span className="text-xs text-green-500 font-semibold mb-1">↑ 5%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-xs font-semibold text-[#9A9396] uppercase tracking-widest">系统内容量</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold">3,892</span>
              <span className="text-xs text-[#9A9396] mb-1">个课件</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-xs font-semibold text-[#9A9396] uppercase tracking-widest">累计练习量</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold">4.2M</span>
              <span className="text-xs text-[#9A9396] mb-1">次演练</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full flex-1">
        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden flex flex-col h-[400px]">
          <CardHeader className="p-5 bg-[#F8F5F3] border-b border-[#E9E4DF]">
            <CardTitle className="text-base font-bold flex items-center">
              <Activity className="h-4 w-4 mr-2 text-[#766F73]" /> 近期系统动态
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1">
            <div className="divide-y divide-slate-50">
              <div className="p-4 flex items-start space-x-3 hover:bg-[#F8F5F3]">
                 <div className="bg-[#F7E6C8] text-[#B9822B] p-2 rounded-lg mt-0.5"><Activity className="h-4 w-4" /></div>
                 <div>
                   <p className="text-sm font-semibold text-[#1F1C1F]">API Gateway 429 频率限制</p>
                   <p className="text-xs text-[#766F73] mt-0.5">节点 `ais-prod-api-v2-5f6` 触发外部 LLM API 并发速率限制，已自动切换至指数避退重试策略。</p>
                   <p className="text-[10px] text-[#9A9396] mt-1">2 分钟前</p>
                 </div>
              </div>
              <div className="p-4 flex items-start space-x-3 hover:bg-[#F8F5F3]">
                 <div className="bg-[#DCEFE7] text-[#3B8F72] p-2 rounded-lg mt-0.5"><Database className="h-4 w-4" /></div>
                 <div>
                   <p className="text-sm font-semibold text-[#1F1C1F]">PostgreSQL Vacuum 分析完成</p>
                   <p className="text-xs text-[#766F73] mt-0.5">每日守护进程 `pg_vacuum` 运行结束，耗时 45.2s，共计释放 1.2GB 碎片化存储空间。</p>
                   <p className="text-[10px] text-[#9A9396] mt-1">45 分钟前</p>
                 </div>
              </div>
              <div className="p-4 flex items-start space-x-3 hover:bg-[#F8F5F3]">
                 <div className="bg-rose-100 text-rose-600 p-2 rounded-lg mt-0.5"><Cpu className="h-4 w-4" /></div>
                 <div>
                   <p className="text-sm font-semibold text-[#1F1C1F]">Pod 内存溢出 (OOM) 自动重启</p>
                   <p className="text-xs text-[#766F73] mt-0.5">多媒体转码 Worker 服务内存超限 ( &gt;2Gi)，Kubernetes 控制平面已杀死并重新调度该容器态。</p>
                   <p className="text-[10px] text-[#9A9396] mt-1">2 小时前</p>
                 </div>
              </div>
              <div className="p-4 flex items-start space-x-3 hover:bg-[#F8F5F3]">
                 <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mt-0.5"><ShieldCheck className="h-4 w-4" /></div>
                 <div>
                   <p className="text-sm font-semibold text-[#1F1C1F]">内网 TLS 证书热重载</p>
                   <p className="text-xs text-[#766F73] mt-0.5">VPC 内服务间通信的 TLS 证书已通过 Cert-Manager 成功轮换，当前主连接零宕机。</p>
                   <p className="text-[10px] text-[#9A9396] mt-1">昨天 14:30</p>
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] overflow-hidden flex flex-col h-[400px]">
          <CardHeader className="p-5 bg-[#F8F5F3] border-b border-[#E9E4DF]">
            <CardTitle className="text-base font-bold flex items-center">
              <Server className="h-4 w-4 mr-2 text-[#766F73]" /> 服务节点状态
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 flex-1">
            <div className="space-y-6">
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center text-sm font-medium text-[#3F3A3D]">
                     <Cpu className="h-4 w-4 mr-2 text-[#9A9396]" /> AI 推理集群 (GPU)
                   </div>
                   <span className="text-xs font-semibold text-[#5D565A]">68%</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div className="bg-rose-500 h-full w-[68%]"></div>
                 </div>
               </div>
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center text-sm font-medium text-[#3F3A3D]">
                     <Database className="h-4 w-4 mr-2 text-[#9A9396]" /> 主数据库 (PostgreSQL)
                   </div>
                   <span className="text-xs font-semibold text-[#5D565A]">42%</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div className="bg-[#3B8F72] h-full w-[42%]"></div>
                 </div>
               </div>
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center text-sm font-medium text-[#3F3A3D]">
                     <HardDrive className="h-4 w-4 mr-2 text-[#9A9396]" /> 媒体存储 (OSS/S3)
                   </div>
                   <span className="text-xs font-semibold text-rose-600">84%</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div className="bg-rose-500 h-full w-[84%]"></div>
                 </div>
                 <p className="text-[10px] text-rose-500 mt-1">存储阈值预警，建议进行扩容操作</p>
               </div>
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center text-sm font-medium text-[#3F3A3D]">
                     <Network className="h-4 w-4 mr-2 text-[#9A9396]" /> 前端 CDN 分发网络
                   </div>
                   <span className="text-xs font-semibold text-[#5D565A]">31%</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div className="bg-[#4F5FD5] h-full w-[31%]"></div>
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

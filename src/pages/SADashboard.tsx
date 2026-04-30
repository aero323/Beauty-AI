import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Users, Server, Cpu, Activity, ShieldCheck, Database, HardDrive, Network } from 'lucide-react';

export function SADashboard() {
  return (
    <div className="space-y-6 flex-1 flex flex-col pt-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-widest">今日系统日活 (DAU)</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold">12,450</span>
              <span className="text-xs text-green-500 font-semibold mb-1">↑ 12%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-widest">月活用户 (MAU)</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold">45,820</span>
              <span className="text-xs text-green-500 font-semibold mb-1">↑ 5%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-widest">系统内容量</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold">3,892</span>
              <span className="text-xs text-slate-400 mb-1">个课件</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-widest">累计练习量</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="flex items-end justify-between leading-none">
              <span className="text-3xl font-bold">4.2M</span>
              <span className="text-xs text-slate-400 mb-1">次演练</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full flex-1">
        <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[400px]">
          <CardHeader className="p-5 bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-base font-bold flex items-center">
              <Activity className="h-4 w-4 mr-2 text-slate-500" /> 近期系统动态
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1">
            <div className="divide-y divide-slate-50">
              <div className="p-4 flex items-start space-x-3 hover:bg-slate-50">
                 <div className="bg-amber-100 text-amber-600 p-2 rounded-lg mt-0.5"><Activity className="h-4 w-4" /></div>
                 <div>
                   <p className="text-sm font-semibold text-slate-900">API Gateway 429 频率限制</p>
                   <p className="text-xs text-slate-500 mt-0.5">节点 `ais-prod-api-v2-5f6` 触发外部 LLM API 并发速率限制，已自动切换至指数避退重试策略。</p>
                   <p className="text-[10px] text-slate-400 mt-1">2 分钟前</p>
                 </div>
              </div>
              <div className="p-4 flex items-start space-x-3 hover:bg-slate-50">
                 <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg mt-0.5"><Database className="h-4 w-4" /></div>
                 <div>
                   <p className="text-sm font-semibold text-slate-900">PostgreSQL Vacuum 分析完成</p>
                   <p className="text-xs text-slate-500 mt-0.5">每日守护进程 `pg_vacuum` 运行结束，耗时 45.2s，共计释放 1.2GB 碎片化存储空间。</p>
                   <p className="text-[10px] text-slate-400 mt-1">45 分钟前</p>
                 </div>
              </div>
              <div className="p-4 flex items-start space-x-3 hover:bg-slate-50">
                 <div className="bg-rose-100 text-rose-600 p-2 rounded-lg mt-0.5"><Cpu className="h-4 w-4" /></div>
                 <div>
                   <p className="text-sm font-semibold text-slate-900">Pod 内存溢出 (OOM) 自动重启</p>
                   <p className="text-xs text-slate-500 mt-0.5">多媒体转码 Worker 服务内存超限 ( &gt;2Gi)，Kubernetes 控制平面已杀死并重新调度该容器态。</p>
                   <p className="text-[10px] text-slate-400 mt-1">2 小时前</p>
                 </div>
              </div>
              <div className="p-4 flex items-start space-x-3 hover:bg-slate-50">
                 <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mt-0.5"><ShieldCheck className="h-4 w-4" /></div>
                 <div>
                   <p className="text-sm font-semibold text-slate-900">内网 TLS 证书热重载</p>
                   <p className="text-xs text-slate-500 mt-0.5">VPC 内服务间通信的 TLS 证书已通过 Cert-Manager 成功轮换，当前主连接零宕机。</p>
                   <p className="text-[10px] text-slate-400 mt-1">昨天 14:30</p>
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[400px]">
          <CardHeader className="p-5 bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-base font-bold flex items-center">
              <Server className="h-4 w-4 mr-2 text-slate-500" /> 服务节点状态
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 flex-1">
            <div className="space-y-6">
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center text-sm font-medium text-slate-700">
                     <Cpu className="h-4 w-4 mr-2 text-slate-400" /> AI 推理集群 (GPU)
                   </div>
                   <span className="text-xs font-semibold text-slate-600">68%</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div className="bg-indigo-500 h-full w-[68%]"></div>
                 </div>
               </div>
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center text-sm font-medium text-slate-700">
                     <Database className="h-4 w-4 mr-2 text-slate-400" /> 主数据库 (PostgreSQL)
                   </div>
                   <span className="text-xs font-semibold text-slate-600">42%</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div className="bg-emerald-500 h-full w-[42%]"></div>
                 </div>
               </div>
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center text-sm font-medium text-slate-700">
                     <HardDrive className="h-4 w-4 mr-2 text-slate-400" /> 媒体存储 (OSS/S3)
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
                   <div className="flex items-center text-sm font-medium text-slate-700">
                     <Network className="h-4 w-4 mr-2 text-slate-400" /> 前端 CDN 分发网络
                   </div>
                   <span className="text-xs font-semibold text-slate-600">31%</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div className="bg-blue-400 h-full w-[31%]"></div>
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

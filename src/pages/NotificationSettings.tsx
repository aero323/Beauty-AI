import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Bell, MessageSquare, Smartphone, Megaphone, CheckCircle2 } from 'lucide-react';

export function NotificationSettings() {
  const [channels, setChannels] = useState([
    { id: 'app', name: 'Lumina App Push', icon: Smartphone, enabled: true, connected: true, desc: '原生应用内部推送弹窗与消息盒子' },
    { id: 'whatsapp', name: 'WhatsApp Business', icon: MessageSquare, enabled: true, connected: true, desc: '东南亚区域BA常用社交渠道' },
    { id: 'feishu', name: '飞书 (Lark)', icon: Megaphone, enabled: false, connected: false, desc: '企业内部工作协同通讯工具' },
  ]);

  const toggleChannel = (id: string) => {
    setChannels(channels.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  return (
    <div className="flex-1 flex flex-col pt-2 h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
         <div>
            <h2 className="text-xl font-bold text-slate-900">全局通知渠道配置</h2>
            <p className="text-sm text-slate-500 mt-1">配置并管理平台发送培训任务、考试提醒及账号激活的各个消息通道</p>
         </div>
      </div>

      <div className="space-y-6 max-w-4xl">
        {channels.map((channel) => (
          <Card key={channel.id} className={`rounded-2xl shadow-sm border transition-colors ${channel.enabled ? 'border-indigo-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-80'}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm ${channel.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                    <channel.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center">
                      {channel.name} 
                      {channel.connected && (
                        <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] py-0 px-1.5 flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> 已接入API
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{channel.desc}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-2">
                     <span className="text-sm font-semibold text-slate-600">{channel.enabled ? '已启用' : '已停用'}</span>
                     <Button 
                        variant={channel.enabled ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => toggleChannel(channel.id)}
                        className={`h-6 text-xs px-2 ${channel.enabled ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'text-slate-500'}`}
                     >
                        开启/关闭
                     </Button>
                  </div>
                </div>
              </div>

              {channel.enabled && (
                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-6">
                   <div className="space-y-4">
                     <h4 className="text-sm font-bold text-slate-800">API 接入配置</h4>
                     <div className="space-y-3">
                       <div>
                         <label className="text-xs font-semibold text-slate-500">API Key / Token</label>
                         <Input type="password" value="*************************" readOnly className="mt-1 h-8 bg-slate-50 font-mono text-xs" />
                       </div>
                       <div>
                         <label className="text-xs font-semibold text-slate-500">Webhook URL</label>
                         <Input value="https://api.lumina.global/webhook/notify" readOnly className="mt-1 h-8 bg-slate-50 font-mono text-xs" />
                       </div>
                     </div>
                     <Button variant="outline" size="sm" className="h-8">修改配置</Button>
                   </div>
                   
                   <div className="space-y-4">
                     <h4 className="text-sm font-bold text-slate-800">支持的消息类型</h4>
                     <div className="space-y-2">
                       <div className="flex items-center space-x-2">
                         <div className="h-4 w-4 rounded-sm bg-indigo-500 text-white flex items-center justify-center"><CheckCircle2 className="h-3 w-3" /></div>
                         <span className="text-sm text-slate-600">账号初始激活通知</span>
                       </div>
                       <div className="flex items-center space-x-2">
                         <div className="h-4 w-4 rounded-sm bg-indigo-500 text-white flex items-center justify-center"><CheckCircle2 className="h-3 w-3" /></div>
                         <span className="text-sm text-slate-600">新学习任务 / 考试指派</span>
                       </div>
                       <div className="flex items-center space-x-2">
                         <div className="h-4 w-4 rounded-sm bg-indigo-500 text-white flex items-center justify-center"><CheckCircle2 className="h-3 w-3" /></div>
                         <span className="text-sm text-slate-600">任务催办预警 (Deadline-24h)</span>
                       </div>
                     </div>
                   </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

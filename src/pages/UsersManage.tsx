import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { FileUp, Search, Plus, UserCheck, Mail, Database } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

const MOCK_USERS = [
  { id: 'usr_1', name: 'Ahmad Maulana', role: '店长', region: '雅加达南区', email: 'ahmad.m@lumina.id', status: '已激活' },
  { id: 'usr_2', name: 'Rina', role: '高级BA', region: '雅加达南区', email: 'rina@lumina.id', status: '已激活' },
  { id: 'usr_3', name: 'Dewi', role: '初级BA', region: '万隆区', email: 'dewi@lumina.id', status: '未激活' },
];

export function UsersManage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [importDialog, setImportDialog] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const firstActiveIndex = users.findIndex((user) => user.status === '已激活');

  const handleImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      setUsers([
        ...users,
        { id: `usr_${Date.now()}`, name: 'Budi Santoso', role: '区域经理', region: '大区', email: 'budi@lumina.id', status: '未激活' },
        { id: `usr_${Date.now()+1}`, name: 'Fitriani', role: '区域培训师主管', region: '大区', email: 'fitriani@lumina.id', status: '未激活' },
      ]);
      setIsImporting(false);
      setImportDialog(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col pt-2 h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between mb-4">
         <div>
            <h2 className="text-xl font-bold text-[#1F1C1F]">账号管理与批量入驻</h2>
            <p className="text-sm text-[#766F73] mt-1">系统管理员可批量导入、激活并管理所有平台用户账号</p>
         </div>
         <div className="flex items-center space-x-4">
            <Button variant="outline" className="flex items-center" onClick={() => setImportDialog(true)}>
               <FileUp className="h-4 w-4 mr-2" /> Excel 批量导入
            </Button>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white">
               <Plus className="h-4 w-4 mr-2" /> 单点新增账号
            </Button>
         </div>
      </div>

      <Card className="rounded-2xl shadow-sm border border-[#E9E4DF] flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-[#F8F5F3]/50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9A9396]" />
            <Input
              placeholder="搜索姓名或邮箱..."
              className="pl-9 bg-white border-[#E5DED8]"
            />
          </div>
          <div className="flex items-center space-x-2 text-sm text-[#766F73]">
             <Database className="h-4 w-4" />
             <span>共计 {users.length} 个账号</span>
          </div>
        </div>
        <div className="p-0 overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F8F5F3]/80 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="py-3 px-6 text-xs font-semibold text-[#766F73] uppercase tracking-wider border-b border-[#E9E4DF]">员工姓名</th>
                <th className="py-3 px-6 text-xs font-semibold text-[#766F73] uppercase tracking-wider border-b border-[#E9E4DF]">系统角色</th>
                <th className="py-3 px-6 text-xs font-semibold text-[#766F73] uppercase tracking-wider border-b border-[#E9E4DF]">所属区域</th>
                <th className="py-3 px-6 text-xs font-semibold text-[#766F73] uppercase tracking-wider border-b border-[#E9E4DF]">联系邮箱</th>
                <th className="py-3 px-6 text-xs font-semibold text-[#766F73] uppercase tracking-wider border-b border-[#E9E4DF]">当前状态</th>
                <th className="py-3 px-6 text-xs font-semibold text-[#766F73] uppercase tracking-wider border-b border-[#E9E4DF] text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-[#F8F5F3]/50 transition-colors">
                  <td className="py-3 px-6 font-medium text-[#242124]">{user.name}</td>
                  <td className="py-3 px-6 text-[#5D565A] text-sm">{user.role}</td>
                  <td className="py-3 px-6 flex items-center text-sm text-[#766F73]">
                     {user.region}
                  </td>
                  <td className="py-3 px-6 text-[#5D565A] text-sm">{user.email}</td>
                  <td className="py-3 px-6">
                    <div className="relative inline-flex items-center overflow-visible group/activation-note">
                      <Badge variant="outline" className={`${user.status === '已激活' ? 'bg-[#EEF8F4] text-[#3B8F72] border-emerald-200' : 'bg-[#FFF7EA] text-[#B9822B] border-[#E8CCA0]'}`}>
                        {user.status}
                      </Badge>
                      {index === firstActiveIndex && user.status === '已激活' && (
                        <>
                          <span className="absolute -right-1 -top-2 z-10 h-4 min-w-4 rounded-full bg-blue-950 px-1 text-[9px] font-bold leading-4 text-white text-center shadow-sm backdrop-blur-sm">
                            注
                          </span>
                          <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block group-hover/activation-note:block z-[80] w-72 rounded-lg bg-blue-950/95 px-3 py-2 text-xs leading-relaxed text-white shadow-xl backdrop-blur-sm">
                            研发备注：已激活的定义为已下载APP登录。
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-6 text-right">
                     {user.status === '未激活' ? (
                       <Button variant="outline" size="sm" className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50">
                         发送激活通知
                       </Button>
                     ) : (
                       <Button variant="ghost" size="sm" className="h-7 text-xs text-[#9A9396]">
                         编辑
                       </Button>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={importDialog} onOpenChange={setImportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>从 Excel 批量导入账号</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="border-2 border-dashed border-[#E5DED8] rounded-xl p-8 flex flex-col items-center justify-center bg-[#F8F5F3]">
               <FileUp className="h-10 w-10 text-rose-400 mb-4" />
               <p className="text-sm font-semibold text-[#3F3A3D]">点击上传或将 Excel 文件拖拽至此</p>
               <p className="text-xs text-[#9A9396] mt-1">支持 .xlsx, .csv 格式，最大 10MB</p>
               <Button className="mt-4" variant="outline" size="sm">下载导入模板</Button>
            </div>

            <div className="mt-4 bg-blue-50 text-blue-700 p-3 rounded-lg text-xs flex items-start">
               <Mail className="h-4 w-4 mr-2 shrink-0 mt-0.5" />
               <span>导入成功后，系统将自动向所有新账号发送包含验证链接的激活通知邮件。</span>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-[#E9E4DF]">
            <Button variant="outline" onClick={() => setImportDialog(false)}>取消</Button>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white min-w-[100px]" onClick={handleImport} disabled={isImporting}>
               {isImporting ? '导入中...' : '开始导入'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState } from 'react';
import {
  PieChart,
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  Bell,
  LogOut,
  FolderOpen,
  ChevronDown,
  ClipboardList,
  Target,
  Layers
} from 'lucide-react';
import { Role } from '../types';
import { cn } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface LayoutProps {
  children: React.ReactNode;
  role: Role;
  setRole: (role: Role) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface SubMenuItem {
  id: string;
  label: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  subMenu?: SubMenuItem[];
}

export function Layout({ children, role, setRole, activeTab, setActiveTab }: LayoutProps) {
  const [expandedNavs, setExpandedNavs] = useState<string[]>(['course_group']);

  const toggleNav = (id: string) => {
    setExpandedNavs(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const getNavItems = (role: Role): NavItem[] => {
    switch (role) {
      case 'Super Admin':
        return [
          { id: 'dashboard', label: '运行概览', icon: PieChart },
          { id: 'org', label: '组织架构', icon: Layers },
          { id: 'users_manage', label: '账号管理', icon: Users },
          { id: 'category_manage', label: '品类设置', icon: BookOpen },
          { id: 'notification_settings', label: '通知设置', icon: Bell },
          { id: 'settings', label: '系统设置', icon: Settings },
        ];
      case 'HQ Trainer':
        return [
          { id: 'dashboard', label: '全国数据', icon: LayoutDashboard },
          { id: 'course_group', label: '在线课件', icon: BookOpen, subMenu: [
            { id: 'courses', label: '生成新课件' },
            { id: 'courses_manage', label: '课件管理' }
          ] },
          { id: 'ba_practice_group', label: 'AI陪练', icon: Users, subMenu: [
            { id: 'ba_avatars', label: '数字人顾客' },
            { id: 'ba_scripts', label: '场景剧本' },
            { id: 'ba_quotes', label: '金句库' }
          ] },
          { id: 'exam_group', label: '作业考试', icon: ClipboardList, subMenu: [
            { id: 'exam_generate', label: '生成题目' },
            { id: 'exam_bank', label: '题库管理' },
            { id: 'exam_homework', label: '作业管理' },
            { id: 'exam_manage', label: '考试组卷' }
          ] },
          { id: 'tasks_group', label: '周期任务', icon: FolderOpen, subMenu: [
            { id: 'study_task_manage', label: '学习任务管理' },
            { id: 'practice_task_manage', label: '练习任务管理' },
            { id: 'exam_task_manage', label: '考试任务管理' }
          ] },
          { id: 'org_group', label: '组织与档案', icon: Users, subMenu: [
            { id: 'store_archive', label: '全国门店总档案' },
            { id: 'personnel_archive', label: '全国人员档案' }
          ] },
        ];
      case 'Regional Training Manager':
        return [
          { id: 'dashboard', label: '区域数据', icon: LayoutDashboard },
          { id: 'regional_content', label: '区域补充内容', icon: BookOpen, subMenu: [
            { id: 'courses', label: '生成新课件' },
            { id: 'courses_manage', label: '区域课件管理' },
            { id: 'ba_scripts', label: '区域场景剧本' },
            { id: 'ba_avatars', label: '区域数字人顾客' }
          ] },
          { id: 'tasks', label: '周期任务', icon: Target, subMenu: [
            { id: 'study_task_manage', label: '学习任务' },
            { id: 'practice_task_manage', label: '练习任务' },
            { id: 'exam_task_manage', label: '考试任务' }
          ] },
          { id: 'org_group', label: '组织与档案', icon: Users, subMenu: [
            { id: 'store_archive', label: '门店总档案' },
            { id: 'personnel_archive', label: '人员档案' }
          ] },
        ];
      case 'Regional Manager':
        return [
          { id: 'dashboard', label: '区域数据', icon: LayoutDashboard },
          { id: 'tasks_group', label: '周期任务监控', icon: ClipboardList, subMenu: [
            { id: 'study_task_manage', label: '学习任务' },
            { id: 'practice_task_manage', label: '练习任务' },
            { id: 'exam_task_manage', label: '考试任务' }
          ] },
          { id: 'org_group', label: '组织与档案', icon: Users, subMenu: [
            { id: 'store_archive', label: '门店总档案' },
            { id: 'personnel_archive', label: '人员档案' }
          ] }
        ];
      case 'Regional Trainer':
        return [
          { id: 'dashboard', label: 'BA进度', icon: LayoutDashboard },
          { id: 'regional_content', label: '区域补充内容', icon: BookOpen, subMenu: [
            { id: 'courses', label: '生成新课件' },
            { id: 'courses_manage', label: '区域课件管理' },
            { id: 'ba_scripts', label: '区域场景剧本' },
            { id: 'ba_avatars', label: '区域数字人顾客' }
          ] },
          { id: 'tasks', label: '周期任务', icon: Target, subMenu: [
            { id: 'study_task_manage', label: '学习任务' },
            { id: 'practice_task_manage', label: '练习任务' },
            { id: 'exam_task_manage', label: '考试任务' }
          ] },
          { id: 'roleplay', label: '陪练大厅', icon: Users },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems(role);

  // Ensure active tab is valid for role
  React.useEffect(() => {
    const validIds = navItems.reduce((acc, item) => {
      if (item.subMenu) {
         acc.push(...item.subMenu.map(sub => sub.id));
      } else {
         acc.push(item.id);
      }
      return acc;
    }, [] as string[]);

    if (!validIds.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [role, activeTab, navItems, setActiveTab]);

  return (
    <div className="flex h-screen bg-[#FAF9F8] font-sans text-slate-800 overflow-hidden flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#1A1A1A] text-white flex flex-col flex-shrink-0 hidden md:flex">
        <div className="p-6 overflow-y-auto">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-tr from-rose-400 to-amber-200 rounded-lg"></div>
            <span className="font-bold tracking-tight text-lg">L'ÉCLAT <span className="font-light opacity-60">AI</span></span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item.id}>
                {item.subMenu ? (
                  <>
                    <button
                      onClick={() => toggleNav(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                         (item.subMenu.some(sub => sub.id === activeTab) && !expandedNavs.includes(item.id)) || expandedNavs.includes(item.id) ? "text-white" : "text-white opacity-70 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className={cn(
                           "mr-3 h-5 w-5",
                           (item.subMenu.some(sub => sub.id === activeTab) && !expandedNavs.includes(item.id)) || expandedNavs.includes(item.id) ? "text-white" : "text-white opacity-70"
                        )} />
                        {item.label}
                      </div>
                      <ChevronDown className={cn("h-4 w-4 transition-transform opacity-70", expandedNavs.includes(item.id) ? "rotate-180" : "rotate-0")} />
                    </button>
                    {expandedNavs.includes(item.id) && (
                      <div className="mt-1 space-y-1 pl-12 pr-4">
                        {item.subMenu.map(subItem => (
                          <button
                            key={subItem.id}
                            onClick={() => setActiveTab(subItem.id)}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              activeTab === subItem.id
                                ? "bg-white/10 text-white"
                                : "text-white opacity-60 hover:text-white hover:bg-white/5"
                            )}
                          >
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      activeTab === item.id
                        ? "bg-white/10 text-white"
                        : "text-white opacity-70 hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn(
                      "mr-3 h-5 w-5",
                      activeTab === item.id ? "text-white" : "text-white opacity-70"
                    )} />
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
           {/* Role Switcher Demo */}
          <div className="bg-white/5 rounded-xl p-4 mb-4">
             <p className="text-xs opacity-50 mb-1 uppercase tracking-widest font-semibold flex items-center justify-between">角色切换 (Demo)</p>
             <Select value={role} onValueChange={(val) => setRole(val as Role)}>
              <SelectTrigger className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 text-xs h-8 mt-2">
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Super Admin">系统管理员 (SA)</SelectItem>
                <SelectItem value="HQ Trainer">总部培训师 (HT)</SelectItem>
                <SelectItem value="Regional Manager">区域经理 (RM)</SelectItem>
                <SelectItem value="Regional Training Manager">区域培训师主管 (RTM)</SelectItem>
                <SelectItem value="Regional Trainer">区域培训师 (RT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold flex justify-between items-center">
              当前登录用户
              <button className="hover:opacity-100 transition-opacity"><LogOut className="h-3 w-3" /></button>
            </p>
            <p className="text-sm font-medium text-amber-200 mt-1">
              {role === 'Super Admin' ? '系统管理员' : 
               role === 'HQ Trainer' ? 'Sarah Lee' : 
               role === 'Regional Manager' ? 'Budi Santoso' : 
               role === 'Regional Training Manager' ? 'Fitriani' : 
               role === 'Regional Trainer' ? 'Nurul Huda' : 
               'Ahmad Maulana'}
            </p>
            <p className="text-[10px] opacity-40 uppercase mt-1">
              {role === 'Super Admin' ? 'Lumina 后台' : 
               role === 'HQ Trainer' ? '全球总部' : 
               role === 'Regional Manager' ? '大区管理' : 
               role === 'Regional Training Manager' ? '大区培训' : 
               role === 'Regional Trainer' ? '南区' : 
               '门店'}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header (Role Bar) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0 z-10 transition-colors">
          <div className="flex items-center space-x-4">
             <h1 className="text-lg font-semibold text-slate-900">{role === 'Super Admin' ? '系统运行概览' : role === 'HQ Trainer' ? '全国培训总览' : role === 'Regional Manager' ? '大区业务看板' : role === 'Regional Training Manager' ? '大区培训看板' : role === 'Regional Trainer' ? 'BA进度与辅导看板' : '门店考评看板'}</h1>
             <span className="text-slate-300 hidden md:block">|</span>
             <span className="text-xs font-medium text-slate-500 hidden md:block">Lumina AI 培训后台</span>
          </div>
          <div className="flex items-center space-x-6 ml-auto">
             <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
               <Bell className="h-5 w-5" />
               <span className="absolute top-0 right-0 block h-2 border-2 border-white w-2 rounded-full bg-rose-500" />
             </button>
             <div className="text-right hidden md:block">
               <p className="text-sm font-semibold text-slate-800">
                 {role === 'Super Admin' ? 'Admin' : 
                  role === 'HQ Trainer' ? 'Sarah Lee' : 
                  role === 'Regional Manager' ? 'Budi Santoso' : 
                  role === 'Regional Training Manager' ? 'Fitriani' : 
                  role === 'Regional Trainer' ? 'Nurul Huda' : 
                  'Ahmad Maulana'}
               </p>
               <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                 {role === 'Super Admin' ? 'SYSTEM ADMIN' : 
                  role === 'HQ Trainer' ? 'HQ TRAINER' : 
                  role === 'Regional Manager' ? 'REGIONAL MANAGER' : 
                  role === 'Regional Training Manager' ? 'REGIONAL TRAINING MANAGER' : 
                  role === 'Regional Trainer' ? 'REGIONAL TRAINER' : 
                  'STORE MANAGER'}
               </p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm">
                 {role === 'Super Admin' ? 'SA' : 
                  role === 'HQ Trainer' ? 'SL' : 
                  role === 'Regional Manager' ? 'BS' : 
                  role === 'Regional Training Manager' ? 'FI' : 
                  role === 'Regional Trainer' ? 'NH' : 
                  'AM'}
               </div>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-8">
          <div className="max-w-7xl mx-auto h-full space-y-6">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}


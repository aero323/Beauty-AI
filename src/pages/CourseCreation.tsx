import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { UploadCloud, FileText, CheckCircle, RefreshCcw, Eye, PlayCircle, PlusCircle, ArrowLeft, Edit, Link, Settings, Download, Sun, Info, Send, Wand2, ClipboardList } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { aiActionTone } from '../lib/visualTones';

export interface CourseTask {
  status: 'generating' | 'done';
  progress: number;
  courseTitle?: string;
}

interface CourseCreationProps {
  courseTask?: CourseTask | null;
  startGeneration?: () => void;
  resetTask?: () => void;
  onExitEditor?: () => void;
  onOpenHomework?: (courseTitle: string) => void;
}

export function CourseCreation({ courseTask, startGeneration, resetTask, onExitEditor, onOpenHomework }: CourseCreationProps) {
  const [localStep, setLocalStep] = useState(1);
  const [coursewareMode, setCoursewareMode] = useState<'ai-courseware' | 'script-only'>('ai-courseware');
  const step = courseTask ? (courseTask.status === 'generating' ? 2 : 3) : localStep;
  const [loadingProgress, setLoadingProgress] = useState(0);
  const editorTitle = courseTask?.courseTitle || '产品线全景地图';

  // Fallback generation for isolated dev or when startGeneration is not provided
  useEffect(() => {
    if (step === 2 && !courseTask) {
      const interval = setInterval(() => {
        setLoadingProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => setLocalStep(3), 500);
            return 100;
          }
          return p + Math.floor(Math.random() * 15) + 5;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [step, courseTask]);

  const handleStartGeneration = () => {
    if (startGeneration) {
      startGeneration();
    } else {
      setLocalStep(2);
      setLoadingProgress(0);
    }
  };

  const handleReset = () => {
    if (step === 3 && onExitEditor) {
      onExitEditor();
      setLocalStep(1);
      return;
    }
    if (resetTask) {
      resetTask();
    }
    setLocalStep(1);
  };

  // Render Step 3 directly as a full-screen-ish component without the stepper container if step=3
  if (step === 3) {
    return (
      <div className="flex flex-col h-full bg-[#F8F5F3] mt-1 rounded-xl border border-[#E5DED8] overflow-hidden min-h-[600px] flex-1">
        {/* Header */}
        <div className="h-14 border-b border-[#E5DED8] bg-white flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center space-x-3">
            <button onClick={handleReset} className="text-[#766F73] hover:text-[#242124]"><ArrowLeft className="w-5 h-5" /></button>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#766F73]">当前课件</span>
              <h2 className="text-sm font-bold text-[#242124] leading-tight">{editorTitle}</h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex border border-[#E5DED8] rounded-lg overflow-hidden bg-[#F8F5F3] text-[#766F73]">
               <button className="px-3 py-1.5 text-xs font-bold hover:bg-[#F1ECE8] border-r border-[#E5DED8]">CN</button>
               <button className="px-3 py-1.5 hover:bg-[#F1ECE8] border-r border-[#E5DED8]"><Sun className="w-4 h-4" /></button>
               <button className="px-3 py-1.5 hover:bg-[#F1ECE8] border-r border-[#E5DED8]"><Settings className="w-4 h-4" /></button>
               <button className="px-3 py-1.5 hover:bg-[#F1ECE8]"><Download className="w-4 h-4" /></button>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-2" />

            <div className="relative group/course-edit-note">
              <span className="absolute -right-1 -top-2 z-10 h-4 min-w-4 rounded-full bg-blue-950 px-1 text-[9px] font-bold leading-4 text-white text-center shadow-sm backdrop-blur-sm">
                注
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="h-8 text-xs font-bold border-[#E5DED8] bg-[#F8F5F3] text-[#9A9396] cursor-not-allowed"
              >
                <Edit className="w-4 h-4 mr-1.5" /> 课件编辑
              </Button>
              <div
                data-i18n-skip="true"
                className="absolute left-1/2 bottom-full mb-2 hidden -translate-x-1/2 group-hover/course-edit-note:block z-50 w-80 rounded-lg bg-blue-950/95 px-3 py-2 text-xs leading-relaxed text-white shadow-xl backdrop-blur-sm"
              >
                研发备注：一期按钮置灰，然后单独做一个课件列表可编辑的给亚男类角色。
              </div>
            </div>
            <Button
              size="sm"
              className="h-8 text-xs font-bold border-[#E5DED8] bg-[#F8F5F3] text-[#766F73] hover:bg-[#F1ECE8]"
              onClick={() => onOpenHomework?.(editorTitle)}
            >
              <ClipboardList className="w-4 h-4 mr-1.5" /> 关联附加题管理
            </Button>
            <Button size="sm" className="h-8 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"><Link className="w-4 h-4 mr-1.5" /> 生成链接</Button>
            <Button size="sm" className="h-8 text-xs font-bold bg-[#3B8F72] hover:bg-[#2F735C] text-white"><Send className="w-4 h-4 mr-1.5" /> 发布</Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar (Thumbnails) */}
          <div className="w-56 border-r border-[#E5DED8] bg-white flex flex-col overflow-y-auto shrink-0">
            <div className="p-3 space-y-3">
               {[
                 'Y.O.U护肤产品线培训导入',
                 '产品线全景地图',
                 'Barrier Shield: 屏障修护线',
                 'Radiance: 提亮焕亮线',
                 '知识检查: 系列定位初步...',
                 'Acneplus: 油痘肌肤理线'
               ].map((title, i) => {
                 const idx = i + 1;
                 const isActive = idx === 2;
                 return (
                  <div key={idx} className={`p-2 rounded-xl border-2 cursor-pointer transition-all ${isActive ? 'border-rose-300 bg-rose-50/60' : 'border-transparent hover:bg-[#F8F5F3]'}`}>
                    <div className={`text-[10px] font-bold mb-1.5 flex items-center gap-1.5 ${isActive ? 'text-rose-600' : 'text-[#766F73]'}`}>
                       <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white ${isActive ? 'bg-rose-600 shadow-sm shadow-rose-200' : 'bg-slate-300'}`}>{idx}</div>
                       {title}
                    </div>
                    <div className={`aspect-[16/9] bg-white rounded-lg shadow-sm w-full relative overflow-hidden ${isActive ? 'ring-1 ring-black/5' : 'border border-[#E5DED8]'}`}>
                       {/* Mock subtle content inside thumbnail */}
                       <div className="absolute top-2 left-2 right-2 flex flex-col gap-1 opacity-20">
                          <div className="h-1.5 w-1/2 bg-slate-400 rounded-full" />
                          <div className="h-1.5 w-3/4 bg-slate-400 rounded-full" />
                          <div className="h-1.5 w-1/3 bg-slate-400 rounded-full" />
                       </div>
                    </div>
                  </div>
                 )
               })}
            </div>
          </div>

          {/* Middle Area (Slide & Avatar Speaker) */}
          <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden relative">
            <div className="flex-1 p-6 lg:p-12 flex justify-center items-center overflow-y-auto min-h-0">
              {/* The Slide Mock */}
              <div className="w-full max-w-4xl aspect-[16/9] bg-white shadow-md rounded-2xl p-6 lg:p-10 flex flex-col relative border border-[#E5DED8]">
                 <div className="absolute top-4 right-6 text-5xl font-black text-slate-100 select-none">02</div>
                 <h1 className="text-2xl lg:text-3xl font-bold text-[#242124] mb-2 relative z-10">产品线全景地图</h1>
                 <p className="text-[#766F73] text-sm mb-6 relative z-10 border-b-2 border-amber-800/10 pb-4 inline-block max-w-sm">7大护肤线定位速览 | 功效分工 × 客群场景</p>

                 {/* Table Mock */}
                 <div className="w-full border border-[#E5DED8] rounded-lg overflow-hidden shadow-sm relative z-10 flex-1 flex flex-col">
                    <div className="grid grid-cols-6 bg-[#997A5C] text-white text-[10px] lg:text-xs font-bold text-center">
                       <div className="p-2 lg:p-3 flex items-center justify-center border-r border-white/20">系列</div>
                       <div className="p-2 lg:p-3 flex items-center justify-center border-r border-white/20">Barrier Shield</div>
                       <div className="p-2 lg:p-3 flex items-center justify-center border-r border-white/20">Radiance</div>
                       <div className="p-2 lg:p-3 flex items-center justify-center border-r border-white/20">Acneplus</div>
                       <div className="p-2 lg:p-3 flex items-center justify-center border-r border-white/20">Hy! Amino+</div>
                       <div className="p-2 lg:p-3 flex items-center justify-center">Sunbrella</div>
                    </div>
                    <div className="grid grid-cols-6 text-center text-[10px] lg:text-xs text-[#3F3A3D]">
                       <div className="p-2 lg:p-3 flex items-center justify-center border-r border-b border-[#E5DED8] bg-[#F5F2EF] font-bold">核心定位</div>
                       <div className="p-2 lg:p-3 flex items-center justify-center border-r border-b border-[#E5DED8] bg-white">修护屏障</div>
                       <div className="p-2 lg:p-3 flex items-center justify-center border-r border-b border-[#E5DED8] bg-white">焕亮匀肤</div>
                       <div className="p-2 lg:p-3 flex items-center justify-center border-r border-b border-[#E5DED8] bg-white">痘肌护理</div>
                       <div className="p-2 lg:p-3 flex items-center justify-center border-r border-b border-[#E5DED8] bg-white">基础清洁</div>
                       <div className="p-2 lg:p-3 flex items-center justify-center border-b border-[#E5DED8] bg-white">防晒防护</div>
                    </div>
                    <div className="grid grid-cols-6 text-center text-[10px] lg:text-xs text-[#3F3A3D] flex-1">
                       <div className="p-2 lg:p-3 flex items-center justify-center border-r border-[#E5DED8] bg-[#F5F2EF] font-bold">关键词</div>
                       <div className="p-2 lg:p-3 flex items-center justify-center border-r border-[#E5DED8] bg-white">舒缓 泛红 敏感</div>
                       <div className="p-2 lg:p-3 flex items-center justify-center border-r border-[#E5DED8] bg-white">提亮 痘印 光泽</div>
                       <div className="p-2 lg:p-3 flex items-center justify-center border-r border-[#E5DED8] bg-white">控油 净痘 平衡</div>
                       <div className="p-2 lg:p-3 flex items-center justify-center border-r border-[#E5DED8] bg-white">氨基酸 温和...</div>
                       <div className="p-2 lg:p-3 flex items-center justify-center bg-white">隔离 UV 防护</div>
                    </div>
                 </div>

                 <div className="text-center text-xs text-[#9A9396] mt-4 relative z-10">记忆框架：修护 | 焕亮 | 祛痘 | 清洁 | 防晒 | 焕肤抗老 | 熟龄抗老</div>

                 {/* Play Button Overlay */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="w-16 h-16 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-[#242124] shadow-xl pointer-events-auto cursor-pointer hover:scale-105 transition-transform border border-white/50">
                       <PlayCircle className="w-8 h-8 opacity-70" />
                    </div>
                 </div>
              </div>
            </div>

            {/* Bottom Avatar Speaking Component */}
            <div className="h-auto bg-white border-t border-[#E5DED8] px-6 py-4 flex items-start space-x-4 shrink-0 relative z-30 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col items-center shrink-0">
                 <div className="w-12 h-12 rounded-full border-2 border-rose-100 bg-rose-50 flex items-center justify-center overflow-hidden mb-1 relative">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e6f0ff" alt="avatar" className="w-[120%] h-[120%] object-cover object-top mt-2" />
                    <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#3B8F72] border-2 border-white rounded-full"></div>
                 </div>
                 <span className="text-[10px] text-[#766F73] font-medium">品牌讲师</span>
              </div>
              <div className="bg-[#F8F9FA] rounded-2xl rounded-tl-none p-4 flex-1 border border-[#E9E4DF] relative">
                 <p className="text-sm text-[#3F3A3D] leading-relaxed font-medium">接着我们刚才的培训目标，这一页就是大家建立整体认知的关键。先把产品线全景地图看清楚，后面每学一条线时，大家才不会只记单品，而是能真正理解它在整个护肤体系里的位置。</p>
              </div>
            </div>
          </div>

          {/* Right Sidebar (Notes/Script) */}
          <div className="w-72 border-l border-[#E5DED8] bg-white flex flex-col shrink-0">
            <div className="flex items-center border-b border-[#E9E4DF]">
               <button className="flex-1 text-center text-sm font-bold text-rose-600 border-b-2 border-rose-600 py-3 flex items-center justify-center gap-1.5"><FileText className="w-4 h-4"/> 笔记</button>
               <button className="flex-1 text-center text-sm font-bold text-[#766F73] py-3 hover:bg-[#F8F5F3] transition-colors">对话</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
               {/* Note Item 1 */}
               <div className="border border-rose-100 bg-rose-50/30 rounded-xl p-3 relative">
                  <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                  <div className="pl-4 text-xs font-bold text-[#766F73] mb-2 flex justify-between items-center">
                     <span>第 2 页 <span className="font-normal mx-1">/</span> 当前页</span>
                  </div>
                  <h3 className="font-bold text-[#242124] text-sm mb-2 pl-4">产品线全景地图</h3>
                  <div className="text-xs text-[#5D565A] leading-relaxed space-y-3">
                     <p><span className="text-[#B9822B] mr-1 opacity-70">💡</span>接着我们刚才的培训目标，这一页就是大家建立整体认知的关键。先把产品线全景地图看清楚，后面每学一条线时，大家才不会只记单品，而是能真正理解它在整个品牌护肤体系里的位置。</p>
                     <p><span className="text-[#B9822B] mr-1 opacity-70">💡</span>这一页的核心不是死记名称，而是抓住两个维度：第一是功效分工，第二是客群场景。也就是说，BA上柜时要先判断顾客当前最核心的肌肤需求，再把需求快速对应到正确系列。</p>
                     <p><span className="text-[#B9822B] mr-1 opacity-70">💡</span>从表格来看，Y.O.U的7大护肤线分工非常清晰。Barrier Shield负责修护屏障、舒缓敏感、减轻泛红...</p>
                  </div>
               </div>

               {/* Note Item 2 */}
               <div className="border border-[#E9E4DF] rounded-xl p-3 relative opacity-60">
                  <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                  <div className="pl-4 text-xs font-bold text-[#766F73] mb-2 flex justify-between items-center">
                     <span>第 3 页</span>
                  </div>
                  <h3 className="font-bold text-[#242124] text-sm mb-2 pl-4">Barrier Shield: 屏障修护线</h3>
                  <div className="text-xs text-[#5D565A] leading-relaxed space-y-3">
                     <p><span className="text-[#B9822B] mr-1 opacity-70">💡</span>好，接着我们刚刚那张产品线全景图往下走，先从整个体系的基础讲起...</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Step 1 & 2 wrapper
  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">AI 智能课件生成</h1>
          <p className="text-sm text-gray-500">上传产品知识，一键生成课件、AI讲解与题目</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center w-full max-w-3xl">
          <div className={`flex flex-col items-center flex-1 ${step >= 1 ? 'text-rose-600' : 'text-gray-400'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold border-2 mb-2 ${step >= 1 ? 'border-rose-600 bg-rose-50' : 'border-gray-300'}`}>1</div>
            <span className="text-xs font-medium">上传资料</span>
          </div>
          <div className={`h-0.5 w-16 sm:w-32 ${step >= 2 ? 'bg-rose-600' : 'bg-gray-200'} transition-all`} />
          <div className={`flex flex-col items-center flex-1 ${step >= 2 ? 'text-rose-600' : 'text-gray-400'}`}>
             <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold border-2 mb-2 ${step >= 2 ? 'border-rose-600 bg-rose-50' : 'border-gray-300'}`}>2</div>
             <span className="text-xs font-medium">AI生成中</span>
          </div>
          <div className={`h-0.5 w-16 sm:w-32 ${step >= 3 ? 'bg-rose-600' : 'bg-gray-200'} transition-all`} />
          <div className={`flex flex-col items-center flex-1 ${step >= 3 ? 'text-rose-600' : 'text-gray-400'}`}>
             <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold border-2 mb-2 ${step >= 3 ? 'border-rose-600 bg-rose-50' : 'border-gray-300'}`}>3</div>
             <span className="text-xs font-medium">审核与发布</span>
          </div>
        </div>
      </div>

      {step === 1 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
              <UploadCloud className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-8">拖拽 PDF、Word、PPTX 文件至此或点击上传</h3>

            <div className="flex space-x-4 mb-8">
              <div className="flex items-center px-4 py-2 bg-gray-50 rounded border border-gray-200 text-sm">
                <FileText className="h-4 w-4 mr-2 text-orange-500" />
                <span>Lumina_新品精华_培训版.pptx</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-gray-50 rounded border border-gray-200 text-sm">
                <FileText className="h-4 w-4 mr-2 text-orange-500" />
                <span>竞品_Lbrand_精华培训.pptx</span>
              </div>
            </div>

            <div className="w-full max-w-2xl text-left space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">附加生成指令 (可选)</label>
                <Textarea
                  placeholder="例如：重点突出我们产品的吸收速度，并生成与Lbrand的对比页。主语言使用本土化印尼语。"
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer group/tooltip relative">
                    <input type="checkbox" className="rounded text-rose-600 focus:ring-rose-500" defaultChecked />
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      同步生成课后附加题 (10题)
                      <Info className="h-4 w-4 ml-1.5 text-gray-400 hover:text-rose-500" />
                    </span>
                    {/* Tooltip Content */}
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tooltip:block z-50 w-64 bg-gray-800 text-white text-xs rounded-lg p-2 shadow-xl animate-in fade-in slide-in-from-bottom-1">
                      生成的附加题将进入题库；可以在附加题管理中查看
                    </div>
                  </label>
                </div>
                <div className="flex items-center shrink-0 relative group/voice-note">
                  <span className="absolute -right-1 -top-2 z-10 h-4 min-w-4 rounded-full bg-blue-950 px-1 text-[9px] font-bold leading-4 text-white text-center shadow-sm backdrop-blur-sm">注</span>
                  <span className="text-xs text-gray-500 mr-2">选择讲解角色：</span>
                  <Select defaultValue="role1">
                    <SelectTrigger className="w-[160px] h-8 text-xs bg-white">
                      <SelectValue placeholder="选择讲解角色" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="role1">
                        <div className="flex items-center space-x-2">
                          <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=64&h=64&fit=crop&crop=faces&q=80" alt="清爽帅哥" className="w-5 h-5 rounded-full object-cover" />
                          <span>清爽帅哥</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="role2">
                        <div className="flex items-center space-x-2">
                          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces&q=80" alt="美容姐姐" className="w-5 h-5 rounded-full object-cover" />
                          <span>美容姐姐</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="absolute left-24 bottom-full mb-2 hidden group-hover/voice-note:block z-50 w-72 rounded-lg bg-blue-950/95 px-3 py-2 text-xs leading-relaxed text-white shadow-xl backdrop-blur-sm">
                    给研发：把 minimax 支持印尼语的音色列表拿来放这里
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-1">
                <div className="grid gap-1 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setCoursewareMode('ai-courseware')}
                    className={`flex h-12 items-center justify-center rounded-lg px-4 text-sm font-bold transition-all ${
                      coursewareMode === 'ai-courseware'
                        ? 'bg-white text-rose-600 shadow-sm ring-1 ring-rose-100'
                        : 'text-gray-600 hover:bg-white/70 hover:text-gray-900'
                    }`}
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    使用AI智能生成课件
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoursewareMode('script-only')}
                    className={`flex h-12 items-center justify-center rounded-lg px-4 text-sm font-bold transition-all ${
                      coursewareMode === 'script-only'
                        ? 'bg-white text-rose-600 shadow-sm ring-1 ring-rose-100'
                        : 'text-gray-600 hover:bg-white/70 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    保留原始课件，仅生成讲解
                  </button>
                </div>
              </div>
            </div>

            <Button size="lg" className={`mt-8 px-8 font-bold ${aiActionTone.primaryButtonClass}`} onClick={handleStartGeneration}>
              <Wand2 className="h-4 w-4 mr-2" />
              开始智能生成
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-[#E5DED8]">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
             <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-rose-100 rounded-full border-t-[#4F5FD5] animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <RefreshCcw className="w-8 h-8 text-rose-600 animate-spin" />
                </div>
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">AI 正在深度解析文档...</h3>
             <p className="text-sm text-gray-500 mb-8 max-w-md text-center">
               系统正在提取知识点并生成对应的数字人讲解脚本，这可能需要 1-2 分钟。
               <br /><br />
               <span className="font-bold text-rose-600 leading-relaxed bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                  ⚡ 您可以离开此页面处理其他任务，生成完成后我们将通知您。
               </span>
             </p>

             <div className="w-full max-w-md space-y-4">
               <Progress value={courseTask?.progress || loadingProgress} className="h-2" />
               <div className="flex justify-between text-xs text-gray-500 font-medium">
                 <span>正在生成印尼语课件及逐字稿...</span>
                 <span>{courseTask?.progress || loadingProgress}%</span>
               </div>
             </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

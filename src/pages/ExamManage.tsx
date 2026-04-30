import React, { useState } from 'react';
import { ClipboardList, Database, Wand2, Search, Plus, Trash2, Edit, Save, CheckCircle, FileText } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

const INITIAL_EXAMS = [
  { id: 'e1', title: '2023年Q4新品全员考核', status: 'Draft', questionCount: 15, description: '本次考试重点考察Q4新品的核心卖点、适用人群及销售话术。' },
  { id: 'e2', title: '冬季保湿系列通关测试', status: 'Published', questionCount: 20, description: '针对冬季主推保湿单品的知识回顾与通关测试。' },
];

const BANK = [
  { id: 'b1', content: 'Lumina新品精华的核心成分是什么？', tags: ['成分', '新品'] },
  { id: 'b2', content: '下列哪一项是Lumina新品精华的主要修护成分？', tags: ['成分'] },
  { id: 'b3', content: 'Lumina新品精华适合激光术后使用。', tags: ['适用人群', '新品'] },
  { id: 'b4', content: '冬季护肤最重要的步骤是？', tags: ['基础', '冬季'] },
];

export function ExamManage() {
  const [exams, setExams] = useState(INITIAL_EXAMS);
  const [selectedExamId, setSelectedExamId] = useState<string>(INITIAL_EXAMS[0].id);
  
  const [examQuestions, setExamQuestions] = useState<{examId: string, questions: string[]}[]>([
    { examId: 'e1', questions: ['b1', 'b3', 'b4'] },
    { examId: 'e2', questions: ['b1', 'b2'] },
  ]);

  const [aiDialog, setAiDialog] = useState(false);
  const [publishDialog, setPublishDialog] = useState(false);
  const [infoDialog, setInfoDialog] = useState(false);
  
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  
  const [toast, setToast] = useState('');

  const selectedExam = exams.find(e => e.id === selectedExamId);
  const currentQuestions = examQuestions.find(eq => eq.examId === selectedExamId)?.questions || [];
  const linkedQuestions = BANK.filter(q => currentQuestions.includes(q.id));
  const availableQuestions = BANK.filter(q => !currentQuestions.includes(q.id));
  
  const handLink = (qId: string) => {
    setExamQuestions(prev => {
      if (!prev.find(eq => eq.examId === selectedExamId)) {
        return [...prev, { examId: selectedExamId, questions: [qId] }];
      }
      return prev.map(eq => 
        eq.examId === selectedExamId 
          ? { ...eq, questions: [...eq.questions, qId] }
          : eq
      );
    });
  };
  
  const handleUnlink = (qId: string) => {
    setExamQuestions(prev => prev.map(eq => 
      eq.examId === selectedExamId 
        ? { ...eq, questions: eq.questions.filter(id => id !== qId) }
        : eq
    ));
  };

  const handleAIGenerate = () => {
    // mock AI generating
    setExamQuestions(prev => prev.map(eq => 
      eq.examId === selectedExamId 
        ? { ...eq, questions: ['b1', 'b2', 'b4'] }
        : eq
    ));
    setAiDialog(false);
    setToast('AI 组卷完成！');
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = () => {
    setToast('保存试卷配置成功！');
    setTimeout(() => setToast(''), 3000);
  };

  const handleEditInfoStart = () => {
    if (selectedExam) {
      setEditTitle(selectedExam.title);
      setEditDesc(selectedExam.description);
      setInfoDialog(true);
    }
  };

  const handleSaveInfo = () => {
    setExams(prev => prev.map(e => e.id === selectedExamId ? { ...e, title: editTitle, description: editDesc } : e));
    setInfoDialog(false);
    setToast('基本信息已更新');
    setTimeout(() => setToast(''), 3000);
  };

  const handlePublish = () => {
    setExams(prev => prev.map(e => e.id === selectedExamId ? { ...e, status: 'Published' } : e));
    setPublishDialog(false);
    setToast('考试已成功发布！');
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="flex h-full bg-[#FAF9F8] overflow-hidden pt-2 rounded-xl border border-slate-200">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between z-10 bg-white">
          <h2 className="font-bold text-slate-800 tracking-tight">考试试卷列表</h2>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-indigo-600 hover:bg-indigo-50">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {exams.map(exam => (
            <div 
              key={exam.id}
              onClick={() => setSelectedExamId(exam.id)}
              className={`group flex flex-col p-3 rounded-xl border-2 transition-all cursor-pointer ${
                selectedExamId === exam.id 
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                  : 'border-transparent bg-slate-50 hover:bg-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-start space-x-3 w-full">
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${selectedExamId === exam.id ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-400'}`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 pr-2 w-full">
                  <h3 className={`font-bold text-sm truncate ${selectedExamId === exam.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {exam.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant={exam.status === 'Published' ? 'default' : 'secondary'} className={`text-[10px] h-5 ${exam.status === 'Published' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}>
                      {exam.status === 'Published' ? '已发布' : '待发布'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 bg-[#FAF9F8] flex flex-col relative overflow-hidden">
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-bold">{toast}</span>
          </div>
        )}

        {selectedExam ? (
          <>
            <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
              <div className="flex-1 mr-6">
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-slate-800">{selectedExam.title}</h1>
                  <Button variant="ghost" size="sm" onClick={handleEditInfoStart} className="h-6 px-2 text-indigo-600 hover:bg-indigo-50">
                    <Edit className="h-3 w-3 mr-1" /> 编辑简介
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">{selectedExam.description || '暂无考试简介'}</p>
              </div>
              <div className="flex space-x-3 shrink-0">
                <Button variant="outline" onClick={() => setAiDialog(true)} className="text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 font-bold">
                  <Wand2 className="h-4 w-4 mr-2" /> AI 智能组卷
                </Button>
                <Button 
                  onClick={handleSave}
                  variant="outline"
                  className="font-bold border-slate-200 hover:bg-slate-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  保存配置
                </Button>
                {selectedExam.status === 'Draft' && (
                  <Button
                    onClick={() => setPublishDialog(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    发布考试
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col xl:flex-row gap-6">
              
              {/* Linked Questions */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center">
                    <ClipboardList className="h-5 w-5 mr-2 text-emerald-500" />
                    已选题目列表 ({linkedQuestions.length})
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {linkedQuestions.map((q, i) => (
                    <Card key={q.id} className="border-emerald-100 shadow-sm relative group overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                      <CardContent className="p-4 pl-5">
                        <div className="flex justify-between items-start gap-4">
                          <div className="text-sm font-medium text-slate-800">{i + 1}. {q.content}</div>
                          <button 
                            onClick={() => handleUnlink(q.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0"
                            title="移除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2 flex space-x-2">
                          {q.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {linkedQuestions.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-white text-slate-400 text-sm">
                      暂无题目，可点击上方AI组卷或从右侧题库手动添加
                    </div>
                  )}
                </div>
              </div>

              {/* Available Questions from Bank */}
              <div className="flex-1 space-y-4 xl:border-l xl:border-slate-200 xl:pl-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center">
                    <Database className="h-5 w-5 mr-2 text-indigo-500" />
                    从题库手动添加
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {availableQuestions.map(q => (
                    <Card key={q.id} className="border-slate-200 shadow-sm group">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="text-sm font-medium text-slate-700">{q.content}</div>
                          <button 
                            onClick={() => handLink(q.id)}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors shrink-0 flex items-center"
                            title="添加"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="mt-2 flex space-x-2">
                          {q.tags.map(t => <Badge key={t} variant="outline" className="text-[10px] bg-slate-50">{t}</Badge>)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {availableQuestions.length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-sm">
                      没有更多可供添加的候选题目
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <ClipboardList className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-medium text-slate-500">在左侧选择一份试卷进行编排</p>
          </div>
        )}

        <Dialog open={aiDialog} onOpenChange={setAiDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Wand2 className="h-5 w-5 mr-2 text-indigo-600" />
                AI 智能组卷参数
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">包含考点 (标签)</label>
                <input type="text" placeholder="例如：新品, 成分, 销售话术" className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">期望题目数量</label>
                <input type="number" placeholder="默认为 20" className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">难度比例</label>
                <input type="text" placeholder="例如：基础 60%, 进阶 30%, 困难 10%" className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <Button variant="outline" onClick={() => setAiDialog(false)}>取消</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleAIGenerate}>
                确认生成
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={publishDialog} onOpenChange={setPublishDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                发布考试：{selectedExam?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">发布范围</label>
                <select className="w-full px-3 py-2 border rounded-md text-sm bg-white">
                  <option>全国范围</option>
                  <option>指定大区</option>
                  <option>指定门店</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">截止时间</label>
                <input type="datetime-local" className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">及格分数</label>
                  <input type="number" placeholder="80" className="w-full px-3 py-2 border rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">重考次数限制</label>
                  <input type="number" placeholder="3" className="w-full px-3 py-2 border rounded-md text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">考试时长 (分钟)</label>
                <input type="number" placeholder="45" className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <Button variant="outline" onClick={() => setPublishDialog(false)}>取消</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={handlePublish}>
                确认发布
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={infoDialog} onOpenChange={setInfoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                编辑考试简介
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">考试名称</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">考试简介</label>
                <textarea 
                  rows={4}
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm resize-none" 
                  placeholder="在此输入本次考试的目的、大纲或其他注意事项..."
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <Button variant="outline" onClick={() => setInfoDialog(false)}>取消</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSaveInfo}>
                保存信息
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

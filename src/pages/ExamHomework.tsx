import React, { useState } from 'react';
import { BookOpen, ClipboardList, Database, Save, Search, PlusCircle, CheckCircle, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const COURSES = [
  { id: 'c1', title: 'Lumina 新品精华培训', date: '2023-11-20', questionIds: ['b1', 'b3'] },
  { id: 'c2', title: '冬季护肤基础', date: '2023-11-18', questionIds: [] },
];

const BANK = [
  { id: 'b1', content: 'Lumina新品精华的核心成分是什么？', tags: ['成分', '新品'] },
  { id: 'b2', content: '下列哪一项是Lumina新品精华的主要修护成分？', tags: ['成分'] },
  { id: 'b3', content: 'Lumina新品精华适合激光术后使用。', tags: ['适用人群', '新品'] },
  { id: 'b4', content: '冬季护肤最重要的步骤是？', tags: ['基础', '冬季'] },
];

export function ExamHomework() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(COURSES[0].id);
  const [courses, setCourses] = useState(COURSES);
  const [showToast, setShowToast] = useState(false);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const linkedQuestions = BANK.filter(q => selectedCourse?.questionIds.includes(q.id));
  const availableQuestions = BANK.filter(q => !selectedCourse?.questionIds.includes(q.id));

  const handleLink = (questionId: string) => {
    setCourses(prev => prev.map(c => 
      c.id === selectedCourseId 
        ? { ...c, questionIds: [...c.questionIds, questionId] }
        : c
    ));
  };

  const handleUnlink = (questionId: string) => {
    setCourses(prev => prev.map(c => 
      c.id === selectedCourseId 
        ? { ...c, questionIds: c.questionIds.filter(id => id !== questionId) }
        : c
    ));
  };

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex h-full bg-[#FAF9F8] overflow-hidden pt-2 rounded-xl border border-slate-200">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between z-10 bg-white">
          <h2 className="font-bold text-slate-800 tracking-tight">课件与作业关联</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {courses.map(course => (
            <div 
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
              className={`group flex flex-col p-3 rounded-xl border-2 transition-all cursor-pointer ${
                selectedCourseId === course.id 
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                  : 'border-transparent bg-slate-50 hover:bg-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-start space-x-3 w-full">
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${selectedCourseId === course.id ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-400'}`}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0 pr-2 w-full">
                  <h3 className={`font-bold text-sm truncate ${selectedCourseId === course.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {course.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400">{course.date}</span>
                    <Badge variant="secondary" className="text-[10px] h-5">已关联 {course.questionIds.length} 题</Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 bg-[#FAF9F8] flex flex-col relative overflow-hidden">
        {showToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-bold">保存成功</span>
          </div>
        )}

        {selectedCourse ? (
          <>
            <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
              <div>
                <h1 className="text-xl font-bold text-slate-800">配置课件伴随作业：{selectedCourse.title}</h1>
                <p className="text-xs text-slate-500 mt-1">学员学习完此课件后，将在APP自动推送已关联的作业题</p>
              </div>
              <button 
                onClick={handleSave}
                className="flex items-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-bold text-sm transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>保存配置</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col xl:flex-row gap-6">
              
              {/* Linked Questions */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center">
                    <ClipboardList className="h-5 w-5 mr-2 text-emerald-500" />
                    已关联此课件的题目 ({linkedQuestions.length})
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
                            title="取消关联"
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
                      暂无关联题目，请从右侧题库添加
                    </div>
                  )}
                </div>
              </div>

              {/* Available Questions from Bank */}
              <div className="flex-1 space-y-4 xl:border-l xl:border-slate-200 xl:pl-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center">
                    <Database className="h-5 w-5 mr-2 text-indigo-500" />
                    题库可关联题目
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {availableQuestions.map(q => (
                    <Card key={q.id} className="border-slate-200 shadow-sm group">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="text-sm font-medium text-slate-700">{q.content}</div>
                          <button 
                            onClick={() => handleLink(q.id)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors shrink-0 flex items-center shadow-sm border border-indigo-100"
                            title="添加到作业"
                          >
                            <PlusCircle className="h-4 w-4 mr-1" /> 添加
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
                      没有更多可供关联的候选题目
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <BookOpen className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-medium text-slate-500">在左侧选择一个课件查看其伴随作业</p>
          </div>
        )}
      </div>
    </div>
  );
}

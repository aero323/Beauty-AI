import React, { useEffect, useState } from 'react';
import { BookOpen, ClipboardList, Database, Save, Search, PlusCircle, CheckCircle, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useQuestionBank } from '../lib/QuestionBankContext';
import { getQuestionTagNames, QUESTION_TYPE_LABELS } from '../lib/questionBank';

const COURSES = [
  { id: 'c1', title: 'Lumina 新品精华培训', date: '2023-11-20', questionIds: ['b1', 'b3'] },
  { id: 'c2', title: '冬季护肤基础', date: '2023-11-18', questionIds: [] },
];

interface ExamHomeworkProps {
  selectedCourseTitle?: string;
}

export function ExamHomework({ selectedCourseTitle }: ExamHomeworkProps) {
  const { questions } = useQuestionBank();
  const [selectedCourseId, setSelectedCourseId] = useState<string>(COURSES[0].id);
  const [courses, setCourses] = useState(COURSES);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!selectedCourseTitle) return;
    const matched = courses.find(course => course.title === selectedCourseTitle);
    if (matched) {
      setSelectedCourseId(matched.id);
      return;
    }

    const customId = `custom-${selectedCourseTitle.replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '')}`;
    setCourses(prev => prev.some(course => course.id === customId)
      ? prev
      : [{ id: customId, title: selectedCourseTitle, date: '-', questionIds: [] }, ...prev]
    );
    setSelectedCourseId(customId);
  }, [selectedCourseTitle]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const activeBank = questions.filter(q => q.status === 'active');
  const linkedQuestions = activeBank.filter(q => selectedCourse?.questionIds.includes(q.id));
  const availableQuestions = activeBank.filter(q => !selectedCourse?.questionIds.includes(q.id));

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
    <div className="flex h-full bg-[#F7F3F1] overflow-hidden pt-2 rounded-xl border border-[#E5DED8]">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-[#E5DED8] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#E9E4DF] flex items-center justify-between z-10 bg-white">
          <h2 className="font-bold text-[#242124] tracking-tight">课件与附加题关联</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {courses.map(course => (
            <div
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
              className={`group flex flex-col p-3 rounded-xl border-2 transition-all cursor-pointer ${
                selectedCourseId === course.id
                  ? 'border-rose-600 bg-rose-50/50 shadow-sm'
                  : 'border-transparent bg-[#F8F5F3] hover:bg-[#F1ECE8] hover:border-[#E5DED8]'
              }`}
            >
              <div className="flex items-start space-x-3 w-full">
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${selectedCourseId === course.id ? 'bg-rose-100 text-rose-600' : 'bg-white text-[#9A9396]'}`}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0 pr-2 w-full">
                  <h3 className={`font-bold text-sm truncate ${selectedCourseId === course.id ? 'text-rose-950' : 'text-[#242124]'}`}>
                    {course.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[#9A9396]">{course.date}</span>
                    <Badge variant="secondary" className="text-[10px] h-5">{`已关联 ${course.questionIds.length} 题`}</Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 bg-[#F7F3F1] flex flex-col relative overflow-hidden">
        {showToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#3B8F72] text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-bold">保存成功</span>
          </div>
        )}

        {selectedCourse ? (
          <>
            <div className="p-6 border-b border-[#E5DED8] bg-white flex items-center justify-between shrink-0">
              <div>
                <h1 className="text-xl font-bold text-[#242124]">配置课件附加题：{selectedCourse.title}</h1>
                <p className="text-xs text-[#766F73] mt-1">学员学习完此课件后，将在APP自动推送已关联的附加题</p>
              </div>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm font-bold text-sm transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>保存配置</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col xl:flex-row gap-6">

              {/* Linked Questions */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#242124] flex items-center">
                    <ClipboardList className="h-5 w-5 mr-2 text-[#3B8F72]" />
                    已关联此课件的题目 ({linkedQuestions.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {linkedQuestions.map((q, i) => (
                    <Card key={q.id} className="border-emerald-100 shadow-sm relative group overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3B8F72]"></div>
                      <CardContent className="p-4 pl-5">
                        <div className="flex justify-between items-start gap-4">
                          <div data-i18n-skip="true" className="text-sm font-medium text-[#242124]">{i + 1}. {q.stem}</div>
                          <button
                            onClick={() => handleUnlink(q.id)}
                            className="p-1.5 text-[#9A9396] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0"
                            title="取消关联"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-[10px] bg-white border-emerald-100 text-[#2F735C]">{QUESTION_TYPE_LABELS[q.type]}</Badge>
                          {getQuestionTagNames(q).map(t => <Badge key={t} data-i18n-skip="true" variant="secondary" className="text-[10px]">{t}</Badge>)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {linkedQuestions.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-[#E5DED8] rounded-xl bg-white text-[#9A9396] text-sm">
                      暂无关联题目，请从右侧题库添加
                    </div>
                  )}
                </div>
              </div>

              {/* Available Questions from Bank */}
              <div className="flex-1 space-y-4 xl:border-l xl:border-[#E5DED8] xl:pl-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#242124] flex items-center">
                    <Database className="h-5 w-5 mr-2 text-rose-500" />
                    题库可关联题目
                  </h3>
                </div>

                <div className="space-y-3">
                  {availableQuestions.map(q => (
                    <Card key={q.id} className="border-[#E5DED8] shadow-sm group">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div data-i18n-skip="true" className="text-sm font-medium text-[#3F3A3D]">{q.stem}</div>
                          <button
                            onClick={() => handleLink(q.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0 flex items-center shadow-sm border border-rose-100"
                            title="添加到附加题"
                          >
                            <PlusCircle className="h-4 w-4 mr-1" /> 添加
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-[10px] bg-white border-rose-100 text-rose-600">{QUESTION_TYPE_LABELS[q.type]}</Badge>
                          {getQuestionTagNames(q).map(t => <Badge key={t} data-i18n-skip="true" variant="outline" className="text-[10px] bg-[#F8F5F3]">{t}</Badge>)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {availableQuestions.length === 0 && (
                    <div className="text-center py-10 text-[#9A9396] text-sm">
                      没有更多可供关联的候选题目
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#9A9396]">
            <BookOpen className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-medium text-[#766F73]">在左侧选择一个课件查看其附加题</p>
          </div>
        )}
      </div>
    </div>
  );
}

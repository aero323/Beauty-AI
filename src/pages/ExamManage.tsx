import React, { useState } from 'react';
import { ClipboardList, Database, Wand2, Search, Plus, Trash2, Edit, Save, CheckCircle, FileText } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { aiActionTone } from '../lib/visualTones';
import { useQuestionBank } from '../lib/QuestionBankContext';
import { getQuestionTagNames, QUESTION_TYPE_LABELS } from '../lib/questionBank';
import {
  DEFAULT_EXAM_PROFILE_QUESTIONS,
  DEFAULT_EXAM_PASS_RULES,
  DefaultExamProfileQuestion,
  EXAM_PARTICIPANT_ROLES,
  EXAM_PASS_SCORE_OPTIONS,
  ExamPassRule,
  getExamParticipantRoleName,
} from '../lib/examPublishSettings';

const INITIAL_EXAMS = [
  { id: 'e1', title: '2023年Q4新品全员考核', status: 'Draft', questionCount: 15, description: '本次考试重点考察Q4新品的核心卖点、适用人群及销售话术。' },
  { id: 'e2', title: '冬季保湿系列通关测试', status: 'Published', questionCount: 20, description: '针对冬季主推保湿单品的知识回顾与通关测试。' },
];

interface ExamManageProps {
  onExamPublished?: (exam: { id: string; title: string; passRules: ExamPassRule[]; profileQuestions: DefaultExamProfileQuestion[]; questionCount: number }) => void;
  onGoToExamTasks?: () => void;
}

const createPassRuleId = () => `pass-rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function ExamManage({ onExamPublished, onGoToExamTasks }: ExamManageProps) {
  const { questions, tags } = useQuestionBank();
  const [exams, setExams] = useState(INITIAL_EXAMS);
  const [selectedExamId, setSelectedExamId] = useState<string>(INITIAL_EXAMS[0].id);

  const [examQuestions, setExamQuestions] = useState<{examId: string, questions: string[]}[]>([
    { examId: 'e1', questions: ['b1', 'b3', 'b4'] },
    { examId: 'e2', questions: ['b1', 'b2'] },
  ]);

  const [aiDialog, setAiDialog] = useState(false);
  const [publishDialog, setPublishDialog] = useState(false);
  const [publishSuccessDialog, setPublishSuccessDialog] = useState(false);
  const [infoDialog, setInfoDialog] = useState(false);
  const [passRules, setPassRules] = useState<ExamPassRule[]>(DEFAULT_EXAM_PASS_RULES);

  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [toast, setToast] = useState('');

  const selectedExam = exams.find(e => e.id === selectedExamId);
  const currentQuestions = examQuestions.find(eq => eq.examId === selectedExamId)?.questions || [];
  const activeBank = questions.filter(q => q.status === 'active');
  const linkedQuestions = activeBank.filter(q => currentQuestions.includes(q.id));
  const availableQuestions = activeBank.filter(q => !currentQuestions.includes(q.id));
  const paperQuestionCount = linkedQuestions.length + DEFAULT_EXAM_PROFILE_QUESTIONS.length;
  const selectedPassRuleRoleIds = passRules.map(rule => rule.roleId);
  const canAddPassRule = selectedPassRuleRoleIds.length < EXAM_PARTICIPANT_ROLES.length;

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
    const nextIds = activeBank.slice(0, 3).map(q => q.id);
    setExamQuestions(prev => prev.map(eq =>
      eq.examId === selectedExamId
        ? { ...eq, questions: nextIds }
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

  const updatePassRuleRole = (ruleId: string, roleId: string) => {
    setPassRules(prev => prev.map(rule => rule.id === ruleId
      ? { ...rule, roleId, roleName: getExamParticipantRoleName(roleId) }
      : rule
    ));
  };

  const updatePassRuleScore = (ruleId: string, score: number) => {
    setPassRules(prev => prev.map(rule => rule.id === ruleId ? { ...rule, score } : rule));
  };

  const addPassRule = () => {
    const nextRole = EXAM_PARTICIPANT_ROLES.find(role => !selectedPassRuleRoleIds.includes(role.id));
    if (!nextRole) return;
    setPassRules(prev => [
      ...prev,
      {
        id: createPassRuleId(),
        roleId: nextRole.id,
        roleName: nextRole.name,
        score: 80,
      },
    ]);
  };

  const removePassRule = (ruleId: string) => {
    setPassRules(prev => prev.length > 1 ? prev.filter(rule => rule.id !== ruleId) : prev);
  };

  const handlePublish = () => {
    if (selectedExam) {
      onExamPublished?.({
        id: selectedExam.id,
        title: selectedExam.title,
        passRules,
        profileQuestions: DEFAULT_EXAM_PROFILE_QUESTIONS,
        questionCount: paperQuestionCount,
      });
    }
    setExams(prev => prev.map(e => e.id === selectedExamId ? { ...e, status: 'Published' } : e));
    setPublishDialog(false);
    setPublishSuccessDialog(true);
  };

  const handleGoToExamTasks = () => {
    setPublishSuccessDialog(false);
    onGoToExamTasks?.();
  };

  return (
    <div className="flex h-full bg-[#F7F3F1] overflow-hidden pt-2 rounded-xl border border-[#E5DED8]">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-[#E5DED8] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#E9E4DF] flex items-center justify-between z-10 bg-white">
          <h2 className="font-bold text-[#242124] tracking-tight">考试试卷列表</h2>
          <Button size="sm" className="h-8 shrink-0 gap-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm">
            <Plus className="h-4 w-4" />
            新建
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {exams.map(exam => (
            <div
              key={exam.id}
              onClick={() => setSelectedExamId(exam.id)}
              className={`group flex flex-col p-3 rounded-xl border-2 transition-all cursor-pointer ${
                selectedExamId === exam.id
                  ? 'border-rose-600 bg-rose-50/50 shadow-sm'
                  : 'border-transparent bg-[#F8F5F3] hover:bg-[#F1ECE8] hover:border-[#E5DED8]'
              }`}
            >
              <div className="flex items-start space-x-3 w-full">
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${selectedExamId === exam.id ? 'bg-rose-100 text-rose-600' : 'bg-white text-[#9A9396]'}`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 pr-2 w-full">
                  <h3 data-i18n-skip="true" className={`font-bold text-sm truncate ${selectedExamId === exam.id ? 'text-rose-950' : 'text-[#242124]'}`}>
                    {exam.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant={exam.status === 'Published' ? 'default' : 'secondary'} className={`text-[10px] h-5 ${exam.status === 'Published' ? 'bg-[#3B8F72] hover:bg-[#2F735C]' : ''}`}>
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
      <div className="flex-1 bg-[#F7F3F1] flex flex-col relative overflow-hidden">
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#3B8F72] text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-bold">{toast}</span>
          </div>
        )}

        {selectedExam ? (
          <>
            <div className="p-6 border-b border-[#E5DED8] bg-white flex items-center justify-between shrink-0">
              <div className="flex-1 mr-6">
                <div className="flex items-center space-x-2">
                  <h1 data-i18n-skip="true" className="text-xl font-bold text-[#242124]">{selectedExam.title}</h1>
                  <Button variant="ghost" size="sm" onClick={handleEditInfoStart} className="h-6 px-2 text-rose-600 hover:bg-rose-50">
                    <Edit className="h-3 w-3 mr-1" /> 编辑简介
                  </Button>
                </div>
                {selectedExam.description ? (
                  <p data-i18n-skip="true" className="text-xs text-[#766F73] mt-1">{selectedExam.description}</p>
                ) : (
                  <p className="text-xs text-[#766F73] mt-1">暂无考试简介</p>
                )}
              </div>
              <div className="flex space-x-3 shrink-0">
                <Button variant="outline" onClick={() => setAiDialog(true)} className={`font-bold ${aiActionTone.buttonClass}`}>
                  <Wand2 className={`h-4 w-4 mr-2 ${aiActionTone.iconClass}`} /> AI 智能组卷
                </Button>
                <Button
                  onClick={handleSave}
                  variant="outline"
                  className="font-bold border-[#E5DED8] hover:bg-[#F8F5F3]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  保存配置
                </Button>
                {selectedExam.status === 'Draft' && (
                  <Button
                    onClick={() => setPublishDialog(true)}
                    className="bg-[#3B8F72] hover:bg-emerald-700 text-white font-bold"
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
                  <h3 className="font-bold text-[#242124] flex items-center">
                    <ClipboardList className="h-5 w-5 mr-2 text-[#3B8F72]" />
                    已选题目列表 ({paperQuestionCount})
                  </h3>
                  <Badge variant="outline" className="border-[#DCEFE7] bg-[#EEF8F4] text-[10px] font-bold text-[#2F735C]">
                    含 {DEFAULT_EXAM_PROFILE_QUESTIONS.length} 道固定信息题
                  </Badge>
                </div>

                <div className="space-y-3">
                  {linkedQuestions.map((q, i) => (
                    <Card key={q.id} className="border-emerald-100 shadow-sm relative group overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3B8F72]"></div>
                      <CardContent className="p-4 pl-5">
                        <div className="flex justify-between items-start gap-4">
                          <div className="text-sm font-medium text-[#242124]"><span>{i + 1}. </span><span data-i18n-skip="true">{q.stem}</span></div>
                          <button
                            onClick={() => handleUnlink(q.id)}
                            className="p-1.5 text-[#9A9396] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0"
                            title="移除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-[10px] bg-white border-emerald-100 text-[#2F735C]">{QUESTION_TYPE_LABELS[q.type]}</Badge>
                          {getQuestionTagNames(q, tags).map(t => <Badge key={t} data-i18n-skip="true" variant="secondary" className="text-[10px]">{t}</Badge>)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {linkedQuestions.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-[#E5DED8] rounded-xl bg-white text-[#9A9396] text-sm">
                      暂无业务题，可点击上方AI组卷或从右侧题库手动添加
                    </div>
                  )}
                  {DEFAULT_EXAM_PROFILE_QUESTIONS.map((profileQuestion, index) => (
                    <Card key={profileQuestion.id} className="border-[#DCEFE7] bg-[#F6FBF8] shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#78B29F]"></div>
                      <CardContent className="p-4 pl-5">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="text-sm font-medium text-[#242124]">
                              <span>{linkedQuestions.length + index + 1}. </span>
                              <span>{profileQuestion.stem}</span>
                            </div>
                            <div className="mt-2 rounded-lg border border-dashed border-[#BFDCCF] bg-white px-3 py-2 text-xs text-[#766F73]">
                              作答输入框占位：{profileQuestion.placeholder}
                            </div>
                          </div>
                          <Badge variant="outline" className="shrink-0 border-[#BFDCCF] bg-white text-[10px] font-bold text-[#2F735C]">
                            固定最后题
                          </Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-[10px] bg-white border-[#BFDCCF] text-[#2F735C]">信息填写</Badge>
                          <Badge variant="secondary" className="text-[10px] bg-white text-[#766F73]">不计分</Badge>
                          <Badge variant="secondary" className="text-[10px] bg-white text-[#766F73]">发布时自动下发</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Available Questions from Bank */}
              <div className="flex-1 space-y-4 xl:border-l xl:border-[#E5DED8] xl:pl-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#242124] flex items-center">
                    <Database className="h-5 w-5 mr-2 text-rose-500" />
                    从题库手动添加
                  </h3>
                </div>

                <div className="space-y-3">
                  {availableQuestions.map(q => (
                    <Card key={q.id} className="border-[#E5DED8] shadow-sm group">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div data-i18n-skip="true" className="text-sm font-medium text-[#3F3A3D]">{q.stem}</div>
                          <button
                            onClick={() => handLink(q.id)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0 flex items-center"
                            title="添加"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-[10px] bg-white border-rose-100 text-rose-600">{QUESTION_TYPE_LABELS[q.type]}</Badge>
                          {getQuestionTagNames(q, tags).map(t => <Badge key={t} data-i18n-skip="true" variant="outline" className="text-[10px] bg-[#F8F5F3]">{t}</Badge>)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {availableQuestions.length === 0 && (
                    <div className="text-center py-10 text-[#9A9396] text-sm">
                      没有更多可供添加的候选题目
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#9A9396]">
            <ClipboardList className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-medium text-[#766F73]">在左侧选择一份试卷进行编排</p>
          </div>
        )}

        <Dialog open={aiDialog} onOpenChange={setAiDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Wand2 className={`h-5 w-5 mr-2 ${aiActionTone.iconClass}`} />
                AI 智能组卷参数
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-[#3F3A3D] mb-1">包含考点 (标签)</label>
                <input type="text" placeholder="例如：新品, 成分, 销售话术" className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3F3A3D] mb-1">期望题目数量</label>
                <input type="number" placeholder="默认为 20" className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3F3A3D] mb-1">难度比例</label>
                <input type="text" placeholder="例如：基础 60%, 进阶 30%, 困难 10%" className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <Button variant="outline" onClick={() => setAiDialog(false)}>取消</Button>
              <Button className={aiActionTone.primaryButtonClass} onClick={handleAIGenerate}>
                确认生成
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={publishDialog} onOpenChange={setPublishDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                发布考试：{selectedExam?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-[#3F3A3D] mb-1">发布范围</label>
                <select className="w-full px-3 py-2 border rounded-md text-sm bg-white">
                  <option>全国范围</option>
                  <option>指定大区</option>
                  <option>指定门店</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3F3A3D] mb-1">截止时间</label>
                <input type="datetime-local" className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-[#3F3A3D]">岗位及格分数</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPassRule}
                    disabled={!canAddPassRule}
                    className="h-8 px-2 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    添加条件
                  </Button>
                </div>
                <div className="space-y-2">
                  {passRules.map(rule => (
                    <div key={rule.id} className="grid grid-cols-[minmax(0,1fr)_116px_32px] items-center gap-2">
                      <select
                        value={rule.roleId}
                        onChange={event => updatePassRuleRole(rule.id, event.target.value)}
                        className="h-10 min-w-0 rounded-md border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:border-[#3B8F72] focus:ring-2 focus:ring-[#3B8F72]/15"
                      >
                        {EXAM_PARTICIPANT_ROLES.map(role => (
                          <option key={role.id} value={role.id} disabled={selectedPassRuleRoleIds.includes(role.id) && role.id !== rule.roleId}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={rule.score}
                        onChange={event => updatePassRuleScore(rule.id, Number(event.target.value))}
                        className="h-10 rounded-md border border-[#E5DED8] bg-white px-3 text-sm outline-none focus:border-[#3B8F72] focus:ring-2 focus:ring-[#3B8F72]/15"
                      >
                        {EXAM_PASS_SCORE_OPTIONS.map(score => (
                          <option key={score} value={score}>{score} 分</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removePassRule(rule.id)}
                        disabled={passRules.length === 1}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-[#9A9396] transition-colors hover:bg-red-50 hover:text-red-500 disabled:pointer-events-none disabled:opacity-30"
                        title="删除条件"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3F3A3D] mb-1">考试时长 (分钟)</label>
                <input type="number" placeholder="45" className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div className="rounded-lg border border-[#DCEFE7] bg-[#EEF8F4] px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-[#2F735C]">随卷信息填写</span>
                  <span className="text-xs font-bold text-[#2F735C]">共 {paperQuestionCount} 题</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#2F735C]/80">
                  下发卷子时，系统会默认把“职位名称”和“门店渠道”作为最后两题，要求考生填写；这两题不计分。
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <Button variant="outline" onClick={() => setPublishDialog(false)}>取消</Button>
              <Button className="bg-[#3B8F72] hover:bg-emerald-700 text-white font-bold" onClick={handlePublish}>
                确认发布
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={publishSuccessDialog} onOpenChange={setPublishSuccessDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-[#242124]">
                <CheckCircle className="h-5 w-5 mr-2 text-[#3B8F72]" />
                考试发布成功
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <p className="text-sm font-medium text-[#242124]">
                请到考试任务管理那里查看已发布的考试任务。
              </p>
              {selectedExam && (
                <div className="rounded-lg border border-[#DCEFE7] bg-[#EEF8F4] px-3 py-2">
                  <p data-i18n-skip="true" className="text-xs font-bold text-[#2F735C] line-clamp-1">{selectedExam.title}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#2F735C] ring-1 ring-[#BFDCCF]">
                      试卷 {paperQuestionCount} 题
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#2F735C] ring-1 ring-[#BFDCCF]">
                      固定信息题 {DEFAULT_EXAM_PROFILE_QUESTIONS.length} 道
                    </span>
                    {passRules.map(rule => (
                      <span key={rule.id} data-i18n-skip="true" className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#2F735C] ring-1 ring-[#BFDCCF]">
                        {rule.roleName} {rule.score}分
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <Button variant="outline" onClick={() => setPublishSuccessDialog(false)}>
                继续组卷
              </Button>
              <Button className="bg-[#3B8F72] hover:bg-[#2F735C] text-white font-bold" onClick={handleGoToExamTasks}>
                去考试任务管理
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
                <label className="block text-sm font-medium text-[#3F3A3D] mb-1">考试名称</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3F3A3D] mb-1">考试简介</label>
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
              <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleSaveInfo}>
                保存信息
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

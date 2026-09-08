import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, Loader2, Database, Trash2, Wand2, Edit, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { aiActionTone } from '../lib/visualTones';
import { useQuestionBank } from '../lib/QuestionBankContext';
import {
  createUploadPreviewQuestions,
  getQuestionAnswerText,
  getQuestionTagNames,
  normalizeQuestionForType,
  QUESTION_TYPE_LABELS,
  QuestionBankItem,
  QuestionMediaType,
  QuestionOption,
} from '../lib/questionBank';

export function ExamGenerate() {
  const { addQuestions, tags } = useQuestionBank();
  const [step, setStep] = useState<'upload' | 'generating' | 'preview'>('upload');
  const [progress, setProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<QuestionBankItem[]>([]);

  const handleStartGeneration = () => {
    setStep('generating');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setPreviewQuestions(createUploadPreviewQuestions());
          setStep('preview');
          return 100;
        }
        return p + 25;
      });
    }, 800);
  };

  const updatePreviewQuestion = (id: string, patch: Partial<QuestionBankItem>) => {
    setPreviewQuestions(prev => prev.map(question => question.id === id
      ? normalizeQuestionForType({ ...question, ...patch })
      : question
    ));
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    setPreviewQuestions(prev => prev.map(question => {
      if (question.id !== questionId || !question.options) return question;
      return {
        ...question,
        options: question.options.map(option => option.id === optionId ? { ...option, text } : option),
      };
    }));
  };

  const addOption = (questionId: string) => {
    setPreviewQuestions(prev => prev.map(question => {
      if (question.id !== questionId || !question.options) return question;
      const label = String.fromCharCode(65 + question.options.length);
      const option: QuestionOption = { id: `${label.toLowerCase()}-${Date.now()}`, label, text: '' };
      return normalizeQuestionForType({
        ...question,
        options: [...question.options, option],
        correctOptionIds: question.type === 'ordering' ? [...(question.correctOptionIds || []), option.id] : question.correctOptionIds,
      });
    }));
  };

  const toggleCorrectOption = (questionId: string, optionId: string) => {
    setPreviewQuestions(prev => prev.map(question => {
      if (question.id !== questionId) return question;
      if (question.type === 'multiple_choice') {
        const current = question.correctOptionIds || [];
        return {
          ...question,
          correctOptionIds: current.includes(optionId)
            ? current.filter(id => id !== optionId)
            : [...current, optionId],
        };
      }
      if (question.type === 'ordering') return question;
      return { ...question, correctOptionIds: [optionId] };
    }));
  };

  const setOrderingPosition = (questionId: string, optionId: string, position: number) => {
    setPreviewQuestions(prev => prev.map(question => {
      if (question.id !== questionId || question.type !== 'ordering' || !question.options) return question;
      const currentOrder = question.correctOptionIds?.length === question.options.length
        ? [...question.correctOptionIds]
        : question.options.map(option => option.id);
      const withoutOption = currentOrder.filter(id => id !== optionId);
      withoutOption.splice(position, 0, optionId);
      return { ...question, correctOptionIds: withoutOption };
    }));
  };

  const updateGridItem = (questionId: string, key: 'gridRows' | 'gridColumns', itemId: string, text: string) => {
    setPreviewQuestions(prev => prev.map(question => {
      if (question.id !== questionId) return question;
      const items = question[key] || [];
      return { ...question, [key]: items.map(item => item.id === itemId ? { ...item, text } : item) };
    }));
  };

  const addGridItem = (questionId: string, key: 'gridRows' | 'gridColumns') => {
    setPreviewQuestions(prev => prev.map(question => {
      if (question.id !== questionId) return question;
      const items = question[key] || [];
      const isRow = key === 'gridRows';
      const index = items.length + 1;
      const item: QuestionOption = {
        id: `${isRow ? 'r' : 'c'}-${Date.now()}`,
        label: isRow ? String(index) : String.fromCharCode(64 + index),
        text: '',
      };
      return { ...question, [key]: [...items, item] };
    }));
  };

  const toggleGridAnswer = (questionId: string, rowId: string, columnId: string) => {
    setPreviewQuestions(prev => prev.map(question => {
      if (question.id !== questionId || question.type !== 'checkbox_grid') return question;
      const current = question.gridCorrectAnswers || [];
      const exists = current.some(answer => answer.rowId === rowId && answer.columnId === columnId);
      return {
        ...question,
        gridCorrectAnswers: exists
          ? current.filter(answer => !(answer.rowId === rowId && answer.columnId === columnId))
          : [...current, { rowId, columnId }],
      };
    }));
  };

  const toggleAllowedUploadType = (questionId: string, type: QuestionMediaType) => {
    setPreviewQuestions(prev => prev.map(question => {
      if (question.id !== questionId || question.type !== 'file_upload') return question;
      const current = question.allowedUploadTypes || [];
      const next = current.includes(type)
        ? current.filter(item => item !== type)
        : [...current, type];
      return { ...question, allowedUploadTypes: next.length > 0 ? next : [type] };
    }));
  };

  const addAttachment = (questionId: string, type: QuestionMediaType, file?: File) => {
    setPreviewQuestions(prev => prev.map(question => {
      if (question.id !== questionId) return question;
      return {
        ...question,
        attachments: [
          ...(question.attachments || []),
          {
            id: `att-${Date.now()}`,
            type,
            name: file?.name || (type === 'image' ? '题目图片' : '题目视频'),
            url: file ? URL.createObjectURL(file) : (type === 'image' ? 'https://example.com/question-image.jpg' : 'https://example.com/question-video.mp4'),
          },
        ],
      };
    }));
  };

  const handleAttachmentUpload = (questionId: string, type: QuestionMediaType, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    addAttachment(questionId, type, file);
    event.currentTarget.value = '';
  };

  const updateAttachment = (questionId: string, attachmentId: string, patch: { name?: string; url?: string }) => {
    setPreviewQuestions(prev => prev.map(question => question.id === questionId
      ? {
        ...question,
        attachments: (question.attachments || []).map(attachment => attachment.id === attachmentId ? { ...attachment, ...patch } : attachment),
      }
      : question
    ));
  };

  const removeAttachment = (questionId: string, attachmentId: string) => {
    setPreviewQuestions(prev => prev.map(question => question.id === questionId
      ? { ...question, attachments: (question.attachments || []).filter(attachment => attachment.id !== attachmentId) }
      : question
    ));
  };

  const removePreviewQuestion = (id: string) => {
    setPreviewQuestions(prev => prev.filter(question => question.id !== id));
  };

  const handleImport = () => {
    addQuestions(previewQuestions.map(question => normalizeQuestionForType({ ...question, status: 'active' })));
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setPreviewQuestions([]);
      setStep('upload');
    }, 2000);
  };

  return (
    <div className="space-y-6 relative">
      {showToast && (
        <div className="absolute top-0 right-0 z-50 bg-[#3B8F72] text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-bold">成功导入到题库！</span>
        </div>
      )}

      {step === 'upload' && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
              <UploadCloud className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-[#1F1C1F] mb-2">生成题目</h3>
            <p className="text-sm text-[#766F73] mb-8">拖拽 PDF、DOC、PPTX文件至此或点击上传，AI 将自动分析提取内容并出题</p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="flex items-center px-4 py-2 bg-[#F8F5F3] rounded-lg border border-[#E5DED8] text-sm">
                <FileText className="h-4 w-4 mr-2 text-rose-500" />
                <span data-i18n-skip="true" className="font-medium text-[#3F3A3D]">Lumina_新品精华_培训版.pdf</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-[#FFF7EA] rounded-lg border border-[#E8CCA0] text-sm text-[#8B621F]">
                生成结果将先进入待审核预览
              </div>
            </div>

            <Button onClick={handleStartGeneration} className={`px-8 font-bold ${aiActionTone.primaryButtonClass}`}>
              <Wand2 className="h-4 w-4 mr-2" />
              一键生成题目
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'generating' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <Loader2 className="h-12 w-12 text-rose-600 animate-spin mb-6" />
            <h3 className="text-xl font-bold text-[#1F1C1F] mb-2">AI 正在深度解析文件并生成题目</h3>
            <p className="text-[#766F73] text-sm mb-8">基于行业知识图谱提取核心考点...</p>
            <div className="w-full max-w-md">
              <Progress value={progress} className="h-2" />
              <p className="text-right text-xs text-[#9A9396] mt-2">{progress}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'preview' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1F1C1F]">生成结果预览</h1>
              <p className="text-[#766F73] mt-1">共生成 {previewQuestions.length} 道题目。请先人工编辑审核，确认后再导入题库。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setStep('upload')}>返回重新生成</Button>
              <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleImport} disabled={previewQuestions.length === 0}>
                <Database className="h-4 w-4 mr-2" />
                审核导入题库
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {previewQuestions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader className="pb-3 border-b border-[#E9E4DF] flex flex-col gap-3 md:flex-row md:items-center md:justify-between space-y-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={question.type}
                      onChange={event => updatePreviewQuestion(question.id, { type: event.target.value as QuestionBankItem['type'] })}
                      className="h-8 rounded-lg border border-rose-200 bg-rose-50 px-2 text-xs font-bold text-rose-700 outline-none focus:ring-2 focus:ring-rose-500/20"
                    >
                      {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <Badge variant="outline" className="bg-[#FFF7EA] text-[#8B621F] border-[#E8CCA0]">待审核</Badge>
                    <span className="text-xs text-[#766F73]">来源: <span data-i18n-skip="true">{question.sourceFile}</span></span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {getQuestionTagNames(question, tags).map(tag => <Badge key={tag} data-i18n-skip="true" variant="secondary" className="text-xs">{tag}</Badge>)}
                    <Button onClick={() => removePreviewQuestion(question.id)} variant="ghost" size="sm" className="h-7 text-red-500 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                      移除
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <label className="block">
                    <span className="mb-1 flex items-center text-xs font-bold text-[#766F73]">
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      题干 {index + 1}
                    </span>
                    <Textarea
                      data-i18n-skip="true"
                      value={question.stem}
                      onChange={event => updatePreviewQuestion(question.id, { stem: event.target.value })}
                      className="min-h-16 resize-none font-bold text-[#242124]"
                    />
                  </label>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#766F73]">题目素材</span>
                      <div className="flex gap-2">
                        <label className="inline-flex h-7 cursor-pointer items-center justify-center rounded-md border border-[#E5DED8] bg-white px-3 text-xs font-bold text-[#3F3A3D] shadow-sm transition-colors hover:bg-[#F8F5F3]">
                          添加图片
                          <input type="file" accept="image/*" className="hidden" onChange={event => handleAttachmentUpload(question.id, 'image', event)} />
                        </label>
                        <label className="inline-flex h-7 cursor-pointer items-center justify-center rounded-md border border-[#E5DED8] bg-white px-3 text-xs font-bold text-[#3F3A3D] shadow-sm transition-colors hover:bg-[#F8F5F3]">
                          添加视频
                          <input type="file" accept="video/*" className="hidden" onChange={event => handleAttachmentUpload(question.id, 'video', event)} />
                        </label>
                      </div>
                    </div>
                    {(question.attachments || []).length > 0 && (
                      <div className="space-y-2 rounded-lg border border-[#E9E4DF] bg-[#F8F5F3] p-2">
                        {question.attachments?.map(attachment => (
                          <div key={attachment.id} className="grid gap-2 rounded bg-white p-2 md:grid-cols-[52px_minmax(0,1fr)_minmax(0,1.4fr)_28px] md:items-center">
                            <Badge variant="outline" className="w-fit text-[10px]">{attachment.type === 'image' ? '图片' : '视频'}</Badge>
                            <input data-i18n-skip="true" value={attachment.name} onChange={event => updateAttachment(question.id, attachment.id, { name: event.target.value })} className="h-8 min-w-0 rounded border border-[#E5DED8] px-2 text-xs outline-none focus:ring-2 focus:ring-rose-500/20" />
                            <input data-i18n-skip="true" value={attachment.url} onChange={event => updateAttachment(question.id, attachment.id, { url: event.target.value })} className="h-8 min-w-0 rounded border border-[#E5DED8] px-2 text-xs outline-none focus:ring-2 focus:ring-rose-500/20" />
                            <button onClick={() => removeAttachment(question.id, attachment.id)} className="flex h-7 w-7 items-center justify-center rounded text-[#9A9396] hover:bg-red-50 hover:text-red-500" title="移除素材">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {question.type === 'short_answer' ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-xs font-bold text-[#766F73]">参考答案</span>
                        <Textarea
                          data-i18n-skip="true"
                          value={question.referenceAnswer || ''}
                          onChange={event => updatePreviewQuestion(question.id, { referenceAnswer: event.target.value })}
                          className="min-h-28 resize-none"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-bold text-[#766F73]">评分要点</span>
                        <Textarea
                          data-i18n-skip="true"
                          value={question.scoringRubric || ''}
                          onChange={event => updatePreviewQuestion(question.id, { scoringRubric: event.target.value })}
                          className="min-h-28 resize-none"
                        />
                      </label>
                    </div>
                  ) : question.type === 'file_upload' ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-xs font-bold text-[#766F73]">上传说明</span>
                        <Textarea data-i18n-skip="true" value={question.uploadInstructions || ''} onChange={event => updatePreviewQuestion(question.id, { uploadInstructions: event.target.value })} className="min-h-28 resize-none" />
                      </label>
                      <div className="space-y-3">
                        <div>
                          <span className="mb-1 block text-xs font-bold text-[#766F73]">允许上传类型</span>
                          <div className="flex gap-2">
                            {(['image', 'video'] as QuestionMediaType[]).map(type => (
                              <label key={type} className="flex items-center gap-2 rounded border border-[#E5DED8] bg-[#F8F5F3] px-3 py-2 text-xs font-bold text-[#5D565A]">
                                <input type="checkbox" checked={question.allowedUploadTypes?.includes(type) || false} onChange={() => toggleAllowedUploadType(question.id, type)} className="h-4 w-4 text-rose-600 focus:ring-rose-500" />
                                {type === 'image' ? '图片' : '视频'}
                              </label>
                            ))}
                          </div>
                        </div>
                        <label className="block">
                          <span className="mb-1 block text-xs font-bold text-[#766F73]">评分要点</span>
                          <Textarea data-i18n-skip="true" value={question.scoringRubric || ''} onChange={event => updatePreviewQuestion(question.id, { scoringRubric: event.target.value })} className="min-h-16 resize-none" />
                        </label>
                      </div>
                    </div>
                  ) : question.type === 'checkbox_grid' ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-[#766F73]">网格行</span>
                            <Button onClick={() => addGridItem(question.id, 'gridRows')} variant="outline" size="sm" className="h-7 text-xs">
                              <Plus className="h-3.5 w-3.5" />
                              加行
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {question.gridRows?.map(row => (
                              <div key={row.id} className="flex items-center gap-2">
                                <span className="w-6 text-xs font-bold text-[#766F73]">{row.label}</span>
                                <input data-i18n-skip="true" value={row.text} onChange={event => updateGridItem(question.id, 'gridRows', row.id, event.target.value)} className="h-8 min-w-0 flex-1 rounded border border-[#E5DED8] px-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/20" />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-[#766F73]">网格列</span>
                            <Button onClick={() => addGridItem(question.id, 'gridColumns')} variant="outline" size="sm" className="h-7 text-xs">
                              <Plus className="h-3.5 w-3.5" />
                              加列
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {question.gridColumns?.map(column => (
                              <div key={column.id} className="flex items-center gap-2">
                                <span className="w-6 text-xs font-bold text-[#766F73]">{column.label}</span>
                                <input data-i18n-skip="true" value={column.text} onChange={event => updateGridItem(question.id, 'gridColumns', column.id, event.target.value)} className="h-8 min-w-0 flex-1 rounded border border-[#E5DED8] px-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/20" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="overflow-x-auto rounded border border-[#E9E4DF]">
                        <table className="min-w-full text-xs">
                          <thead className="bg-[#F8F5F3]">
                            <tr>
                              <th className="px-3 py-2 text-left text-[#766F73]">匹配项</th>
                              {question.gridColumns?.map(column => <th key={column.id} data-i18n-skip="true" className="px-3 py-2 text-center text-[#766F73]">{column.text || column.label}</th>)}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E9E4DF] bg-white">
                            {question.gridRows?.map(row => (
                              <tr key={row.id}>
                                <td data-i18n-skip="true" className="px-3 py-2 font-bold text-[#3F3A3D]">{row.text || row.label}</td>
                                {question.gridColumns?.map(column => {
                                  const checked = question.gridCorrectAnswers?.some(answer => answer.rowId === row.id && answer.columnId === column.id) || false;
                                  return (
                                    <td key={column.id} className="px-3 py-2 text-center">
                                      <input type="checkbox" checked={checked} onChange={() => toggleGridAnswer(question.id, row.id, column.id)} className="h-4 w-4 text-rose-600 focus:ring-rose-500" />
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : question.type === 'ordering' ? (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#766F73]">排序步骤与正确顺序</span>
                        <Button onClick={() => addOption(question.id)} variant="outline" size="sm" className="h-7 text-xs">
                          <Plus className="h-3.5 w-3.5" />
                          增加步骤
                        </Button>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {question.options?.map(option => {
                          const order = question.correctOptionIds || question.options?.map(item => item.id) || [];
                          const position = Math.max(0, order.indexOf(option.id));
                          return (
                            <div key={option.id} className="grid grid-cols-[72px_1fr] items-center gap-2 rounded border border-[#E5DED8] bg-[#F8F5F3] p-2 text-sm">
                              <select value={position} onChange={event => setOrderingPosition(question.id, option.id, Number(event.target.value))} className="h-8 rounded border border-[#E5DED8] bg-white px-2 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500/20">
                                {question.options?.map((_, optionIndex) => <option key={optionIndex} value={optionIndex}>第 {optionIndex + 1}</option>)}
                              </select>
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="shrink-0 text-xs font-bold">{option.label}</span>
                                <input data-i18n-skip="true" value={option.text} onChange={event => updateOption(question.id, option.id, event.target.value)} className="h-8 min-w-0 flex-1 rounded border border-[#E5DED8] bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/20" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#766F73]">{question.type === 'dropdown' ? '下拉选项与答案' : '选项与答案'}</span>
                        {question.type !== 'true_false' && (
                          <Button onClick={() => addOption(question.id)} variant="outline" size="sm" className="h-7 text-xs">
                            <Plus className="h-3.5 w-3.5" />
                            增加选项
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {question.options?.map(option => (
                          <div key={option.id} className={`grid grid-cols-[32px_1fr] items-center gap-2 rounded border p-2 text-sm ${question.correctOptionIds?.includes(option.id) ? 'bg-[#EEF8F4] border-emerald-200 text-emerald-800 font-medium' : 'bg-[#F8F5F3] border-[#E5DED8] text-[#5D565A]'}`}>
                            <input
                              type={question.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                              checked={question.correctOptionIds?.includes(option.id) || false}
                              onChange={() => toggleCorrectOption(question.id, option.id)}
                              className="h-4 w-4 text-rose-600 focus:ring-rose-500"
                            />
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="shrink-0 text-xs font-bold">{option.label}</span>
                              <input
                                data-i18n-skip="true"
                                value={option.text}
                                disabled={question.type === 'true_false'}
                                onChange={event => updateOption(question.id, option.id, event.target.value)}
                                className="h-8 min-w-0 flex-1 rounded border border-[#E5DED8] bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 disabled:bg-transparent"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm font-medium text-[#3B8F72] flex items-start">
                    <CheckCircle className="h-4 w-4 mr-1.5 mt-0.5 shrink-0" />
                    <span>当前正确答案: <span data-i18n-skip="true">{getQuestionAnswerText(question)}</span></span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, Loader2, Database, AlertCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';

export function ExamGenerate() {
  const [step, setStep] = useState<'upload' | 'generating' | 'preview'>('upload');
  const [progress, setProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const mockQuestions = [
    {
      id: 'q1',
      type: 'SingleChoice',
      content: 'Lumina新品精华的核心成分是什么？',
      options: ['A. 烟酰胺', 'B. 神经酰胺', 'C. 玻色因', 'D. 高浓度维他命B5'],
      answer: 'D',
      tags: ['成分', '新品']
    },
    {
      id: 'q2',
      type: 'TrueFalse',
      content: 'Lumina新品精华适合激光术后使用。',
      options: ['正确', '错误'],
      answer: '正确',
      tags: ['适用人群', '新品']
    },
    {
      id: 'q3',
      type: 'MultipleChoice',
      content: '以下关于Lumina新品精华的描述，哪些是正确的？',
      options: ['A. 质地轻薄', 'B. 适合油性皮肤', 'C. 含有高浓度维他命B5', 'D. 能修护肌肤屏障'],
      answer: 'A, C, D',
      tags: ['卖点', '新品']
    }
  ];

  const handleStartGeneration = () => {
    setStep('generating');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setStep('preview');
          return 100;
        }
        return p + 25;
      });
    }, 800);
  };

  const handleImport = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setStep('upload'); // Reset after importing
    }, 2000);
  };

  return (
    <div className="space-y-6 relative">
      {showToast && (
        <div className="absolute top-0 right-0 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-bold">成功导入到题库！</span>
        </div>
      )}

      {step === 'upload' && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-20 w-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6">
              <UploadCloud className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">生成题目</h3>
            <p className="text-sm text-slate-500 mb-8">拖拽 PDF、DOC、PPTX文件至此或点击上传，AI 将自动分析提取内容并出题</p>
            
            <div className="flex space-x-4 mb-8">
              <div className="flex items-center px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                <FileText className="h-4 w-4 mr-2 text-rose-500" />
                <span className="font-medium text-slate-700">Lumina_新品精华_培训版.pdf</span>
              </div>
            </div>

            <Button onClick={handleStartGeneration} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
              一键生成题目
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'generating' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">AI 正在深度解析文件并生成题目</h3>
            <p className="text-slate-500 text-sm mb-8">基于行业知识图谱提取核心考点...</p>
            <div className="w-full max-w-md">
              <Progress value={progress} className="h-2" />
              <p className="text-right text-xs text-slate-400 mt-2">{progress}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'preview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">生成结果预览</h1>
              <p className="text-slate-500 mt-1">共生成 3 道题目，请审核并导入题库。在生成课件时如选择同步生成题目，也会在此统一查收进行入库操作。</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setStep('upload')}>返回重新生成</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleImport}>
                <Database className="h-4 w-4 mr-2" />
                导入至题库
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {mockQuestions.map((q, i) => (
              <Card key={q.id}>
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                      {q.type === 'SingleChoice' ? '单选题' : q.type === 'MultipleChoice' ? '多选题' : '判断题'}
                    </Badge>
                    <span className="text-xs text-slate-500">来源: Lumina_新品精华_培训版.pdf</span>
                  </div>
                  <div className="flex space-x-2">
                    {q.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="font-bold text-slate-800 text-sm">
                    {i + 1}. {q.content}
                  </div>
                  <div className="space-y-2">
                    {q.options.map(opt => (
                      <div key={opt} className={`p-2 rounded border text-sm ${q.answer.includes(opt.charAt(0)) || opt === q.answer ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-medium text-emerald-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1.5" /> 正确答案: {q.answer}
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

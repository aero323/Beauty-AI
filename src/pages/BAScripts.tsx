import React, { useState } from 'react';
import { Plus, Trash2, FileText, CheckCircle, Save, Settings, MessageSquare, AlertCircle, ImageIcon, Upload, Wand2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { PracticePromptNotice } from '../components/PracticePromptNotice';
import { aiActionTone } from '../lib/visualTones';
import { EffectiveStatusBadge, type EffectiveStatus } from '../components/EffectiveStatusBadge';
import { ConversationPlaygroundDialog, type PlaygroundMessage } from '../components/ConversationPlaygroundDialog';

interface ScriptStep {
  id: string;
  description: string;
  hint: string;
}

interface ScriptScenario {
  id: string;
  name: string;
  description: string;
  steps: ScriptStep[];
  imageUrl?: string;
  scope?: string;
  effectiveStatus: EffectiveStatus;
}

const INITIAL_SCRIPTS: ScriptScenario[] = [
  {
    id: '1',
    name: '干敏皮防晒推荐',
    description: '指导BA如何接待干敏皮顾客，通过挖掘需求推荐合适的防晒产品及其主要成分。',
    scope: 'HQ',
    effectiveStatus: 'active',
    steps: [
      { id: 's1', description: '询问顾客的日常护肤痛点和防晒需求', hint: '注意关注防晒产品的滋润度和温和性' },
      { id: 's2', description: '介绍Barrier Shield系列或物理类温和防晒', hint: '' },
      { id: 's3', description: '解答顾客关于搓泥/闷痘的疑虑，提供试用', hint: '建议在小面积肌肤上试用' }
    ]
  },
  {
    id: '2',
    name: '处理缺货抱怨',
    description: '顾客想要的热门产品缺货，BA需要安抚情绪并推荐合理的替代方案或引导预定。',
    scope: 'HQ',
    effectiveStatus: 'active',
    steps: [
      { id: 's1', description: '诚恳地向顾客道歉并表示理解', hint: '保持态度友好，不要推卸责任' },
      { id: 's2', description: '说明缺货原因并给出大概的到货时间', hint: '' },
      { id: 's3', description: '推荐功效相近的替代产品或帮忙预定', hint: '推荐时要强调替代品的相似功效' }
    ]
  }
];

export function BAScripts() {
  const [scripts, setScripts] = useState<ScriptScenario[]>(INITIAL_SCRIPTS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_SCRIPTS[0].id);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('剧本已保存');
  const [toastTone, setToastTone] = useState<'success' | 'warning'>('success');
  const [previewOpen, setPreviewOpen] = useState(false);

  const selectedScript = scripts.find(s => s.id === selectedId) || scripts[0];
  const previewScript = selectedScript
    ? {
        id: selectedScript.id,
        title: selectedScript.name,
        description: selectedScript.description,
        outline: selectedScript.steps.map(step => `${step.description}${step.hint ? `（${step.hint}）` : ''}`).join('\n')
      }
    : {
        id: 'custom-flow',
        title: '自定义大纲',
        description: selectedScript?.description ?? '使用当前剧本流程进行预览',
        outline: selectedScript?.steps.map(step => `${step.description}${step.hint ? `（${step.hint}）` : ''}`).join('\n') ?? ''
      };

  const showFeedback = (message: string, tone: 'success' | 'warning' = 'success', duration = 2500) => {
    setToastMessage(message);
    setToastTone(tone);
    setShowToast(true);
    setTimeout(() => setShowToast(false), duration);
  };

  const handleUpdate = (field: keyof ScriptScenario, value: any) => {
    setScripts(prev => prev.map(s => s.id === selectedId ? { ...s, [field]: value, effectiveStatus: 'pending' } : s));
  };

  const handleUpdateStep = (stepId: string, field: keyof ScriptStep, value: string) => {
    setScripts(prev => prev.map(s => {
      if (s.id !== selectedId) return s;
      return {
        ...s,
        effectiveStatus: 'pending',
        steps: s.steps.map(st => st.id === stepId ? { ...st, [field]: value } : st)
      };
    }));
  };

  const handleAddStep = () => {
    const newStep: ScriptStep = {
      id: Date.now().toString(),
      description: '新的剧本步骤...',
      hint: ''
    };
    handleUpdate('steps', [...selectedScript.steps, newStep]);
  };

  const handleRemoveStep = (stepId: string) => {
    handleUpdate('steps', selectedScript.steps.filter(st => st.id !== stepId));
  };

  const handleAddNew = () => {
    const newScript: ScriptScenario = {
      id: Date.now().toString(),
      name: '新场景剧本',
      description: '请描述该场景的主要背景与目的...',
      effectiveStatus: 'pending',
      steps: [
        { id: Date.now().toString(), description: '步骤 1', hint: '' }
      ]
    };
    setScripts([...scripts, newScript]);
    setSelectedId(newScript.id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newScripts = scripts.filter(s => s.id !== id);
    setScripts(newScripts);
    if (selectedId === id && newScripts.length > 0) {
      setSelectedId(newScripts[0].id);
    } else if (newScripts.length === 0) {
      setSelectedId('');
    }
  };

  const handleSave = () => {
    setScripts(prev => prev.map(s => s.id === selectedId ? { ...s, effectiveStatus: 'active' } : s));
    showFeedback('剧本已保存', 'success', 3000);
  };

  const buildPreviewMessages = (script: ScriptScenario): PlaygroundMessage[] => [
    {
      id: `${script.id}-opening`,
      role: 'assistant',
      text: `欢迎进入剧本预览。我会按「${script.name}」这个场景扮演顾客，你可以直接输入 BA 的示范回应。`,
    },
  ];

  const generatePreviewReply = (input: string) => {
    const text = input.toLowerCase();
    const matchedStep = selectedScript.steps.find(step =>
      text.includes(step.description.toLowerCase().slice(0, 4))
      || text.includes('价格')
      || text.includes('预算')
      || text.includes('试用')
      || text.includes('异议')
      || text.includes('油')
      || text.includes('搓泥')
    );

    if (text.includes('价格') || text.includes('预算')) {
      return `可以先从价值和体验讲起。这个剧本里更适合先回应顾客顾虑，再给出更稳的方案，必要时补充试用或替代选择。`;
    }

    if (text.includes('试用') || text.includes('小样')) {
      return `可以顺着顾客的试用意愿推进，先确认肤感和实际需求，再结合当前剧本的步骤引导试涂或体验。`;
    }

    if (text.includes('油') || text.includes('搓泥') || text.includes('闷痘')) {
      return `可以重点解释质地、适用肤质和使用顺序，先打消顾客对油腻、搓泥或闷痘的担心。`;
    }

    if (matchedStep) {
      return `可以按第 ${selectedScript.steps.indexOf(matchedStep) + 1} 步的节奏回应：${matchedStep.description}。对应提示可以写成「${matchedStep.hint || '先围绕当前顾客需求展开，再推进下一步'}」。`;
    }

    return `建议先呼应顾客问题，再回到这个剧本的核心主线：${selectedScript.description.slice(0, 36)}${selectedScript.description.length > 36 ? '...' : ''}`;
  };

  const previewInitialMessages = buildPreviewMessages({
    id: previewScript.id,
    name: previewScript.title,
    description: previewScript.description,
    steps: selectedScript?.steps ?? [],
    effectiveStatus: selectedScript?.effectiveStatus ?? 'pending',
  });

  const previewRightPane = (
    <div className="space-y-5">
      <div className="flex items-center gap-3 border-b border-[#E5DED8] pb-4">
        <div className="min-w-0">
          <div data-i18n-skip="true" className="truncate text-sm font-bold text-[#242124]">
            {selectedScript.name}
          </div>
          <div data-i18n-skip="true" className="mt-1 truncate text-xs text-[#766F73]">
            {selectedScript.description}
          </div>
        </div>
        <div className="ml-auto shrink-0">
          <EffectiveStatusBadge status={selectedScript.effectiveStatus} />
        </div>
      </div>

      <div>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#9A9396]">
          剧本步骤
        </div>
        <div className="space-y-3">
          {selectedScript.steps.map((step, index) => (
            <div key={step.id} className="rounded-xl border border-[#E5DED8] bg-white p-3">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#C47D2A]">
                步骤 {index + 1}
              </div>
              <div data-i18n-skip="true" className="text-sm font-bold text-[#242124]">
                {step.description}
              </div>
              {step.hint ? (
                <div data-i18n-skip="true" className="mt-1 text-xs leading-relaxed text-[#766F73]">
                  {step.hint}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const handleGenerateScriptSteps = () => {
    const scriptName = selectedScript.name.trim();
    const scenario = selectedScript.description.trim();

    if (!scriptName || !scenario) {
      showFeedback('请先填写剧本名称和场景介绍', 'warning');
      return;
    }

    const context = scenario.length > 36 ? `${scenario.slice(0, 36)}...` : scenario;
    const generatedSteps: ScriptStep[] = [
      {
        id: `${Date.now()}-ai-1`,
        description: `开场破冰，确认顾客是否符合「${scriptName}」场景`,
        hint: `先用自然问候降低距离感，再围绕“${context}”确认顾客当前需求。`
      },
      {
        id: `${Date.now()}-ai-2`,
        description: '追问肤质、使用习惯和当前顾虑，补齐推荐前信息',
        hint: '至少确认肤质状态、近期使用产品、预算/时间限制，避免直接推品。'
      },
      {
        id: `${Date.now()}-ai-3`,
        description: '复述顾客核心需求，并给出清晰的问题判断',
        hint: '用一句话总结顾客痛点，让顾客感到被理解，再进入方案推荐。'
      },
      {
        id: `${Date.now()}-ai-4`,
        description: `推荐匹配「${scriptName}」的主推产品或服务组合`,
        hint: '讲清楚推荐理由、关键成分/卖点和使用顺序，不要只背产品名。'
      },
      {
        id: `${Date.now()}-ai-5`,
        description: '处理顾客异议，补充体验、对比或替代方案',
        hint: '针对价格、效果、安全性、缺货等常见异议给出具体回应。'
      },
      {
        id: `${Date.now()}-ai-6`,
        description: '推动试用或成交，并确认后续跟进动作',
        hint: '给出明确下一步，例如现场试用、加购搭配、预约护理或售后提醒。'
      }
    ];

    handleUpdate('steps', generatedSteps);
    showFeedback('已生成 6 个剧本步骤', 'success');
  };

  return (
    <div className="flex h-full bg-[#F7F3F1] overflow-hidden pt-2 rounded-xl border border-[#E5DED8]">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-[#E5DED8] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#E9E4DF] flex items-center justify-between z-10 bg-white">
          <h2 className="font-bold text-[#242124] tracking-tight">场景剧本 ({scripts.length})</h2>
          <button
            onClick={handleAddNew}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-rose-600 px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-rose-700"
          >
            <Plus className="h-4 w-4" />
            <span>新建</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {scripts.map(script => (
            <div
              key={script.id}
              onClick={() => setSelectedId(script.id)}
              className={`group flex flex-col p-3 rounded-xl border-2 transition-all cursor-pointer ${
                selectedId === script.id
                  ? 'border-rose-600 bg-rose-50/50 shadow-sm'
                  : 'border-transparent bg-[#F8F5F3] hover:bg-[#F1ECE8] hover:border-[#E5DED8]'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3 w-full">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${selectedId === script.id ? 'bg-rose-100 text-rose-600' : 'bg-white text-[#9A9396]'}`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 pr-6 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 data-i18n-skip="true" className={`font-bold text-sm truncate ${selectedId === script.id ? 'text-rose-900' : 'text-[#242124]'}`}>
                        {script.name}
                      </h3>
                      {script.scope && script.scope !== 'HQ' && (
                        <Badge variant="secondary" className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-none px-1.5 py-0 h-4 text-[9px] font-normal tracking-widest leading-none flex items-center shrink-0">{script.scope}</Badge>
                      )}
                    </div>
                    <p data-i18n-skip="true" className={`text-xs mt-1 line-clamp-2 ${selectedId === script.id ? 'text-rose-700/70' : 'text-[#766F73]'}`}>
                       {script.description}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(script.id, e)}
                className={`absolute right-4 top-4 p-1.5 rounded-md text-[#9A9396] hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 ${selectedId === script.id ? 'opacity-100' : ''}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {scripts.length === 0 && (
            <div className="text-center py-10 text-[#9A9396] text-sm">
              暂无场景剧本，请点击右上角添加
            </div>
          )}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 bg-[#F7F3F1] flex flex-col relative overflow-hidden">
        {showToast && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 ${toastTone === 'warning' ? 'bg-[#B9822B]' : 'bg-[#3B8F72]'}`}>
            {toastTone === 'warning' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
        )}

        {selectedScript ? (
          <>
            <div className="p-6 border-b border-[#E5DED8] bg-white flex items-center justify-between shrink-0">
              <div>
                <h1 className="text-xl font-bold text-[#242124]">编辑剧本：{selectedScript.name}</h1>
                <p className="text-xs text-[#766F73] mt-1">配置剧情背景与考核指导节点</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPreviewOpen(true)}
                  className="border-[#E5DED8] bg-white text-[#3F3A3D] hover:bg-[#F8F5F3]"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>预览效果</span>
                </Button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm font-bold text-sm transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>保存剧本</span>
                </button>
                <EffectiveStatusBadge status={selectedScript.effectiveStatus} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-4xl mx-auto space-y-6">
                <PracticePromptNotice />

                {/* General Info */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E9E4DF]">
                  <h3 className="text-sm font-bold text-[#242124] mb-5 flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-rose-500" />
                    剧本基础信息
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#766F73] mb-2">剧本名称</label>
                      <input
                        type="text"
                        value={selectedScript.name}
                        onChange={(e) => handleUpdate('name', e.target.value)}
                        className="w-full px-4 py-2 border border-[#E5DED8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-shadow font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#766F73] mb-2">场景介绍</label>
                      <textarea
                        value={selectedScript.description}
                        onChange={(e) => handleUpdate('description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-[#E5DED8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-shadow resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Scenario Image */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E9E4DF]">
                  <h3 className="text-sm font-bold text-[#242124] mb-5 flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2 text-[#3B8F72]" />
                    场景配图
                  </h3>
                  <div className="flex border border-[#E5DED8] rounded-xl overflow-hidden bg-[#F8F5F3]/50">
                    <div className="w-48 h-48 bg-slate-100 flex items-center justify-center shrink-0 border-r border-[#E5DED8] relative overflow-hidden">
                      {selectedScript.imageUrl ? (
                        <img src={selectedScript.imageUrl} alt="Scenario" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-[#9A9396] p-4">
                          <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <span className="text-xs">暂无配图</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-center space-y-4">
                      <div>
                        <p className="text-sm font-medium text-[#3F3A3D]">可以上传一张图，来生动展示这个场景</p>
                        <ul className="text-xs text-[#766F73] mt-2 space-y-1 list-disc pl-4">
                          <li>建议尺寸：800x800 px，比例 1:1</li>
                          <li>支持的格式：JPG, PNG, WebP</li>
                          <li>大小限制：不得超过 2MB</li>
                        </ul>
                      </div>
                      <div className="flex items-center space-x-3 pt-2">
                        <Button variant="outline" size="sm" className="h-9 relative overflow-hidden">
                          <Upload className="h-4 w-4 mr-1.5 text-[#766F73]" />
                          <span>上传图片</span>
                          <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                handleUpdate('imageUrl', url);
                              }
                            }}
                          />
                        </Button>
                        <div className="relative group/image-note">
                          <span className="absolute -right-1 -top-2 z-10 h-4 min-w-4 rounded-full bg-blue-950 px-1 text-[9px] font-bold leading-4 text-white text-center shadow-sm backdrop-blur-sm">注</span>
                          <Button
                            variant="secondary"
                            size="sm"
                            className={`h-9 relative overflow-hidden ${aiActionTone.buttonClass}`}
                            disabled={!selectedScript.name || !selectedScript.description}
                            onClick={() => {
                              // Dummy AI generation
                              handleUpdate('imageUrl', `https://source.unsplash.com/random/800x800/?beauty,skincare,${encodeURIComponent(selectedScript.name)}`);
                              showFeedback('已生成场景配图', 'success', 2000);
                            }}
                          >
                            <Wand2 className={`h-4 w-4 mr-1.5 ${aiActionTone.iconClass}`} />
                            <span>AI 一键生成配图</span>
                          </Button>
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover/image-note:block z-50 w-80 rounded-lg bg-blue-950/95 px-3 py-2 text-xs leading-relaxed text-white shadow-xl backdrop-blur-sm">
                            给研发：必须先有剧本名称和场景介绍才能生图；生图的预制 prompt 里要写清楚这是美妆店场景，然后拼接剧本名称、场景介绍等基础信息。
                          </div>
                        </div>
                      </div>
                      {(!selectedScript.name || !selectedScript.description) && (
                        <p className="text-[10px] text-[#B9822B]">完善“剧本名称”和“场景介绍”后，可使用 AI 配图。</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E9E4DF]">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-[#242124] flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-rose-500" />
                      剧本步骤与提示节点
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button onClick={handleGenerateScriptSteps} variant="secondary" size="sm" className={`h-8 ${aiActionTone.buttonClass}`}>
                        <Wand2 className={`h-4 w-4 mr-1 ${aiActionTone.iconClass}`} />
                        AI 一键生成剧本
                      </Button>
                      <Button onClick={handleAddStep} variant="outline" size="sm" className="h-8 shadow-sm">
                        <Plus className="h-4 w-4 mr-1" />
                        新增步骤
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedScript.steps.map((step, index) => (
                      <div key={step.id} className="p-4 rounded-xl border border-[#E5DED8] bg-[#F8F5F3]/50 relative group">
                        <div className="absolute left-4 top-4 bg-rose-100 text-rose-700 font-bold text-xs h-6 w-6 flex items-center justify-center rounded-md">
                          {index + 1}
                        </div>
                        <div className="pl-10 space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-[#766F73] mb-1">步骤描述</label>
                            <input
                              type="text"
                              value={step.description}
                              onChange={(e) => handleUpdateStep(step.id, 'description', e.target.value)}
                              className="w-full px-3 py-1.5 border border-[#E5DED8] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#766F73] mb-1 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1 text-[#B9822B]" />
                              回答提示 (选填，给BA的指引，不填则由AI自动判定)
                            </label>
                            <textarea
                              value={step.hint}
                              onChange={(e) => handleUpdateStep(step.id, 'hint', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-1.5 border border-[#E5DED8] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#B9822B]/20 focus:border-[#B9822B] bg-white resize-none"
                              placeholder="例如：需提到核心成分神经酰胺..."
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveStep(step.id)}
                          className="absolute right-4 top-4 p-1 rounded-md text-[#9A9396] hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {selectedScript.steps.length === 0 && (
                      <div className="text-center py-6 bg-[#F8F5F3] rounded-xl border border-dashed border-[#E5DED8] text-[#766F73] text-sm">
                        暂无剧本步骤，请点击右上角新增
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#9A9396]">
            <FileText className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-medium text-[#766F73]">在左侧选择或创建一个剧本</p>
          </div>
        )}

        <ConversationPlaygroundDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          title="剧本预览"
          subtitle="输入顾客问题，查看当前剧本下的 BA 示范回应"
          seedKey={selectedScript.id}
          initialMessages={previewInitialMessages}
          generateReply={generatePreviewReply}
          rightPane={previewRightPane}
        />
      </div>
    </div>
  );
}

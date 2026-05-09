import React, { useState } from 'react';
import { Plus, Trash2, FileText, CheckCircle, Save, Settings, MessageSquare, AlertCircle, ImageIcon, Upload, Wand2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { aiActionTone } from '../lib/visualTones';

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
}

const RT_INITIAL_SCRIPTS: ScriptScenario[] = [
  {
    id: 'rt-script-1',
    name: '区域性：雨季应对防晕妆',
    description: '针对印尼等地区雨季高湿度容易晕妆的情况，给出针对性的防水防汗保湿建议。',
    scope: '雅加达区',
    steps: [
      { id: 's1', description: '询问顾客平时是否容易脱妆或感觉粘腻', hint: '切入热带地区痛点' },
      { id: 's2', description: '推荐含有强效定妆成分和防水配方的产品', hint: '突出持妆防汗脱落' },
      { id: 's3', description: '建议采用烘焙定妆法或三明治底妆法', hint: '给出完整的应对潮湿环境的底妆方案' }
    ]
  },
  {
    id: 'rt-script-2',
    name: '重点商圈：雅加达外派高管快速破冰',
    description: '针对雅加达高端商超内的门店，高管/外企人员时间紧凑，如何在短时间内吸引注意并建立信任。',
    scope: '雅加达区',
    steps: [
      { id: 's1', description: '用简单的英文或礼貌尊称快速破冰并赞美搭配', hint: '需专业干练，避免过度推销感' },
      { id: 's2', description: '一句话点出抗老/熬夜修护明星产品的核心优势', hint: '强调产品效率与即时效果' },
      { id: 's3', description: '邀请顾客进行手部五官快速体验，或预约周末SPA', hint: '尊重顾客时间，提供VIP服务' }
    ]
  }
];

export function RTBAScripts() {
  const [scripts, setScripts] = useState<ScriptScenario[]>(RT_INITIAL_SCRIPTS);
  const [selectedId, setSelectedId] = useState<string>(RT_INITIAL_SCRIPTS[0].id);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('区域剧本已保存');
  const [toastTone, setToastTone] = useState<'success' | 'warning'>('success');

  const selectedScript = scripts.find(s => s.id === selectedId) || scripts[0];

  const showFeedback = (message: string, tone: 'success' | 'warning' = 'success', duration = 2500) => {
    setToastMessage(message);
    setToastTone(tone);
    setShowToast(true);
    setTimeout(() => setShowToast(false), duration);
  };

  const handleUpdate = (field: keyof ScriptScenario, value: any) => {
    setScripts(prev => prev.map(s => s.id === selectedId ? { ...s, [field]: value } : s));
  };

  const handleUpdateStep = (stepId: string, field: keyof ScriptStep, value: string) => {
    setScripts(prev => prev.map(s => {
      if (s.id !== selectedId) return s;
      return {
        ...s,
        steps: s.steps.map(st => st.id === stepId ? { ...st, [field]: value } : st)
      };
    }));
  };

  const handleAddStep = () => {
    const newStep: ScriptStep = {
      id: Date.now().toString(),
      description: '新的区域剧本步骤...',
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
      name: '新区域场景剧本',
      description: '请描述该区域特色场景的主要背景与目的...',
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
    showFeedback('区域剧本已保存', 'success', 3000);
  };

  const handleGenerateScriptSteps = () => {
    const scriptName = selectedScript.name.trim();
    const scenario = selectedScript.description.trim();

    if (!scriptName || !scenario) {
      showFeedback('请先填写剧本名称和区域场景介绍', 'warning');
      return;
    }

    const context = scenario.length > 36 ? `${scenario.slice(0, 36)}...` : scenario;
    const generatedSteps: ScriptStep[] = [
      {
        id: `${Date.now()}-ai-1`,
        description: `开场破冰，确认顾客是否符合「${scriptName}」区域场景`,
        hint: `结合本区域门店语境自然问候，再围绕“${context}”确认顾客当前需求。`
      },
      {
        id: `${Date.now()}-ai-2`,
        description: '追问当地气候、肤质状态和消费习惯，补齐推荐前信息',
        hint: '至少确认肤质、近期使用产品、当地环境影响和预算限制。'
      },
      {
        id: `${Date.now()}-ai-3`,
        description: '复述顾客核心需求，并结合区域特点给出问题判断',
        hint: '把顾客痛点与当地气候、商圈或客群特征连接起来，再进入方案推荐。'
      },
      {
        id: `${Date.now()}-ai-4`,
        description: `推荐匹配「${scriptName}」的产品或服务组合`,
        hint: '讲清楚推荐理由、关键卖点和使用顺序，并说明为什么适合该区域场景。'
      },
      {
        id: `${Date.now()}-ai-5`,
        description: '处理顾客异议，补充体验、对比或区域替代方案',
        hint: '针对价格、效果、安全性、缺货等异议给出可在门店执行的回应。'
      },
      {
        id: `${Date.now()}-ai-6`,
        description: '推动试用或成交，并确认后续跟进动作',
        hint: '给出明确下一步，例如现场试用、加购搭配、预约护理或门店复访提醒。'
      }
    ];

    handleUpdate('steps', generatedSteps);
    showFeedback('已生成 6 个区域剧本步骤', 'success');
  };

  return (
    <div className="flex h-full bg-[#F7F3F1] overflow-hidden pt-2 rounded-xl border border-[#E5DED8]">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-[#E5DED8] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#E9E4DF] flex items-center justify-between z-10 bg-white">
          <h2 className="font-bold text-[#242124] tracking-tight">区域场景剧本 ({scripts.length})</h2>
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
                  ? 'border-[#B9822B] bg-[#FFF7EA]/50 shadow-sm'
                  : 'border-transparent bg-[#F8F5F3] hover:bg-[#F1ECE8] hover:border-[#E5DED8]'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3 w-full">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${selectedId === script.id ? 'bg-[#F7E6C8] text-[#B9822B]' : 'bg-white text-[#9A9396]'}`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 pr-6 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 data-i18n-skip="true" className={`font-bold text-sm truncate ${selectedId === script.id ? 'text-[#4C3415]' : 'text-[#242124]'}`}>
                        {script.name}
                      </h3>
                      {script.scope && script.scope !== 'HQ' && (
                        <Badge variant="secondary" data-i18n-skip="true" className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-none px-1.5 py-0 h-4 text-[9px] font-normal tracking-widest leading-none flex items-center shrink-0">{script.scope}</Badge>
                      )}
                    </div>
                    <p data-i18n-skip="true" className={`text-xs mt-1 line-clamp-2 ${selectedId === script.id ? 'text-[#8B621F]/70' : 'text-[#766F73]'}`}>
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
              暂无区域场景剧本，请点击右上角添加
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
                <h1 className="text-xl font-bold text-[#242124]">编辑区域剧本：{selectedScript.name}</h1>
                <p className="text-xs text-[#766F73] mt-1">配置剧情背景与区域适用的考核指导节点</p>
              </div>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-5 py-2 bg-[#B9822B] hover:bg-[#A67327] text-white rounded-lg shadow-sm font-bold text-sm transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>保存区域剧本</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-4xl mx-auto space-y-6">

                {/* General Info */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E9E4DF]">
                  <h3 className="text-sm font-bold text-[#242124] mb-5 flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-[#B9822B]" />
                    区域剧本基础信息
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#766F73] mb-2">剧本名称</label>
                      <input
                        type="text"
                        value={selectedScript.name}
                        onChange={(e) => handleUpdate('name', e.target.value)}
                        className="w-full px-4 py-2 border border-[#E5DED8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B9822B]/20 focus:border-[#B9822B] transition-shadow font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#766F73] mb-2">区域场景介绍</label>
                      <textarea
                        value={selectedScript.description}
                        onChange={(e) => handleUpdate('description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-[#E5DED8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B9822B]/20 focus:border-[#B9822B] transition-shadow resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Scenario Image */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E9E4DF]">
                  <h3 className="text-sm font-bold text-[#242124] mb-5 flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2 text-[#3B8F72]" />
                    区域场景配图
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
                        <p className="text-sm font-medium text-[#3F3A3D]">可以上传一张图，来生动展示区域门店场景</p>
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
                              handleUpdate('imageUrl', `https://source.unsplash.com/random/800x800/?beauty,store,china,${encodeURIComponent(selectedScript.name)}`);
                              showFeedback('已生成区域场景配图', 'success', 2000);
                            }}
                          >
                            <Wand2 className={`h-4 w-4 mr-1.5 ${aiActionTone.iconClass}`} />
                            <span>AI 一键生成区域配图</span>
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
                      <MessageSquare className="h-4 w-4 mr-2 text-[#B9822B]" />
                      区域剧本步骤与提示节点
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button onClick={handleGenerateScriptSteps} variant="secondary" size="sm" className={`h-8 ${aiActionTone.buttonClass}`}>
                        <Wand2 className={`h-4 w-4 mr-1 ${aiActionTone.iconClass}`} />
                        AI 一键生成剧本
                      </Button>
                      <Button onClick={handleAddStep} variant="outline" size="sm" className="h-8 shadow-sm border-[#E8CCA0] text-[#B9822B] hover:bg-[#FFF7EA] hover:text-[#8B621F]">
                        <Plus className="h-4 w-4 mr-1" />
                        新增步骤
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedScript.steps.map((step, index) => (
                      <div key={step.id} className="p-4 rounded-xl border border-[#E5DED8] bg-[#F8F5F3]/50 relative group">
                        <div className="absolute left-4 top-4 bg-[#F7E6C8] text-[#8B621F] font-bold text-xs h-6 w-6 flex items-center justify-center rounded-md">
                          {index + 1}
                        </div>
                        <div className="pl-10 space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-[#766F73] mb-1">步骤描述</label>
                            <input
                              type="text"
                              value={step.description}
                              onChange={(e) => handleUpdateStep(step.id, 'description', e.target.value)}
                              className="w-full px-3 py-1.5 border border-[#E5DED8] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#B9822B]/20 focus:border-[#B9822B] bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#766F73] mb-1 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1 text-[#9A9396]" />
                              回答提示 (选填，给区域BA的指引，不填则由AI自动判定)
                            </label>
                            <textarea
                              value={step.hint}
                              onChange={(e) => handleUpdateStep(step.id, 'hint', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-1.5 border border-[#E5DED8] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 bg-white resize-none"
                              placeholder="例如：需结合当季华东地区气候情况..."
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
                        暂无区域剧本步骤，请点击右上角新增
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#9A9396]">
            <FileText className="h-16 w-16 mb-4 opacity-20 text-[#B9822B]" />
            <p className="font-medium text-[#766F73]">在左侧选择或创建一个区域剧本</p>
          </div>
        )}
      </div>
    </div>
  );
}

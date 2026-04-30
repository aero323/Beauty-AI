import React, { useState } from 'react';
import { Plus, Trash2, FileText, CheckCircle, Save, Settings, MessageSquare, AlertCircle, ImageIcon, Upload, Wand2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';

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

const INITIAL_SCRIPTS: ScriptScenario[] = [
  {
    id: '1',
    name: '干敏皮防晒推荐',
    description: '指导BA如何接待干敏皮顾客，通过挖掘需求推荐合适的防晒产品及其主要成分。',
    scope: 'HQ',
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

  const selectedScript = scripts.find(s => s.id === selectedId) || scripts[0];

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
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex h-full bg-[#FAF9F8] overflow-hidden pt-2 rounded-xl border border-slate-200">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between z-10 bg-white">
          <h2 className="font-bold text-slate-800 tracking-tight">场景剧本 ({scripts.length})</h2>
          <button 
            onClick={handleAddNew}
            className="flex items-center justify-center p-1.5 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
          >
            <Plus className="h-5 w-5" />
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
                  : 'border-transparent bg-slate-50 hover:bg-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3 w-full">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${selectedId === script.id ? 'bg-rose-100 text-rose-600' : 'bg-white text-slate-400'}`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 pr-6 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold text-sm truncate ${selectedId === script.id ? 'text-rose-900' : 'text-slate-800'}`}>
                        {script.name}
                      </h3>
                      {script.scope && script.scope !== 'HQ' && (
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none px-1.5 py-0 h-4 text-[9px] font-normal tracking-widest leading-none flex items-center shrink-0">{script.scope}</Badge>
                      )}
                    </div>
                    <p className={`text-xs mt-1 line-clamp-2 ${selectedId === script.id ? 'text-rose-700/70' : 'text-slate-500'}`}>
                       {script.description}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={(e) => handleDelete(script.id, e)}
                className={`absolute right-4 top-4 p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 ${selectedId === script.id ? 'opacity-100' : ''}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {scripts.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">
              暂无场景剧本，请点击右上角添加
            </div>
          )}
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

        {selectedScript ? (
          <>
            <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
              <div>
                <h1 className="text-xl font-bold text-slate-800">编辑剧本：{selectedScript.name}</h1>
                <p className="text-xs text-slate-500 mt-1">配置剧情背景与考核指导节点</p>
              </div>
              <button 
                onClick={handleSave}
                className="flex items-center space-x-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm font-bold text-sm transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>保存剧本</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* General Info */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-rose-500" />
                    剧本基础信息
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">剧本名称</label>
                      <input 
                        type="text" 
                        value={selectedScript.name}
                        onChange={(e) => handleUpdate('name', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-shadow font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">场景介绍</label>
                      <textarea 
                        value={selectedScript.description}
                        onChange={(e) => handleUpdate('description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-shadow resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Scenario Image */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2 text-emerald-500" />
                    场景配图
                  </h3>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                    <div className="w-48 h-48 bg-slate-100 flex items-center justify-center shrink-0 border-r border-slate-200 relative overflow-hidden">
                      {selectedScript.imageUrl ? (
                        <img src={selectedScript.imageUrl} alt="Scenario" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-slate-400 p-4">
                          <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <span className="text-xs">暂无配图</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-center space-y-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700">可以上传一张图，来生动展示这个场景</p>
                        <ul className="text-xs text-slate-500 mt-2 space-y-1 list-disc pl-4">
                          <li>建议尺寸：800x800 px，比例 1:1</li>
                          <li>支持的格式：JPG, PNG, WebP</li>
                          <li>大小限制：不得超过 2MB</li>
                        </ul>
                      </div>
                      <div className="flex items-center space-x-3 pt-2">
                        <Button variant="outline" size="sm" className="h-9 relative overflow-hidden">
                          <Upload className="h-4 w-4 mr-1.5 text-slate-500" />
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
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-9 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-none relative overflow-hidden"
                          disabled={!selectedScript.name || !selectedScript.description}
                          onClick={() => {
                            // Dummy AI generation
                            handleUpdate('imageUrl', `https://source.unsplash.com/random/800x800/?beauty,skincare,${encodeURIComponent(selectedScript.name)}`);
                            setShowToast(true);
                            setTimeout(() => setShowToast(false), 2000);
                          }}
                        >
                          <Wand2 className="h-4 w-4 mr-1.5" />
                          <span>AI 一键生成配图</span>
                        </Button>
                      </div>
                      {(!selectedScript.name || !selectedScript.description) && (
                        <p className="text-[10px] text-amber-600">完善“剧本名称”和“场景介绍”后，可使用 AI 配图。</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-indigo-500" />
                      剧本步骤与提示节点
                    </h3>
                    <Button onClick={handleAddStep} variant="outline" size="sm" className="h-8 shadow-sm">
                      <Plus className="h-4 w-4 mr-1" />
                      新增步骤
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedScript.steps.map((step, index) => (
                      <div key={step.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 relative group">
                        <div className="absolute left-4 top-4 bg-indigo-100 text-indigo-700 font-bold text-xs h-6 w-6 flex items-center justify-center rounded-md">
                          {index + 1}
                        </div>
                        <div className="pl-10 space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">步骤描述</label>
                            <input 
                              type="text" 
                              value={step.description}
                              onChange={(e) => handleUpdateStep(step.id, 'description', e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                              回答提示 (选填，给BA的指引，不填则由AI自动判定)
                            </label>
                            <textarea 
                              value={step.hint}
                              onChange={(e) => handleUpdateStep(step.id, 'hint', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white resize-none"
                              placeholder="例如：需提到核心成分神经酰胺..."
                            />
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveStep(step.id)}
                          className="absolute right-4 top-4 p-1 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {selectedScript.steps.length === 0 && (
                      <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
                        暂无剧本步骤，请点击右上角新增
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <FileText className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-medium text-slate-500">在左侧选择或创建一个剧本</p>
          </div>
        )}
      </div>
    </div>
  );
}

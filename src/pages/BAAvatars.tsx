import React, { useState } from 'react';
import { Plus, Trash2, Upload, User, FileText, Tag, Image as ImageIcon, Save, CheckCircle, MessageSquare } from 'lucide-react';

interface Avatar {
  id: string;
  name: string;
  avatarUrl: string;
  videoUrl: string;
  tags: string[];
  prompt: string;
  flow: string;
}

const INITIAL_AVATARS: Avatar[] = [
  {
    id: '1',
    name: '职场莉莉',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily&backgroundColor=ffdfbf',
    videoUrl: '',
    tags: ['25-30岁', '混干皮', '女性', '通勤防晒需求'],
    prompt: '你叫莉莉，是一名在雅加达CBD工作的白领。你平时工作很忙，经常对着电脑，皮肤容易干燥并且有肤色不均的问题。你现在想寻找一款既能保湿又能防晒，并且上妆不搓泥的妆前/防晒产品。你的态度比较直接，看重产品的效率和实际效果。',
    flow: '1. 进店询问有没有适合干皮的防晒推荐。\n2. 对BA推荐的产品提出质疑（比如“会不会很油？”或“跟我的粉底会不会搓泥？”）。\n3. 询问有没有小样可以试用，或者要求试涂在手上。\n4. 根据BA的解答专业度决定是否购买。'
  },
  {
    id: '2',
    name: '学生小雅',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yaya&backgroundColor=c0aede',
    videoUrl: '',
    tags: ['18-22岁', '油痘肌', '女性', '预算有限'],
    prompt: '你是小雅，一名在读的大学生。你的皮肤是油痘肌，经常长痘痘和闭口，非常苦恼。你每月的护肤预算有限。你希望BA能推荐一些平价但有效祛痘、控油的产品。如果产品太贵，你会犹豫。',
    flow: '1. 在祛痘产品区徘徊，表现出不知所措。\n2. 告诉BA自己的痘痘问题，并强调自己是学生，可能买不起太贵的套盒。\n3. 询问除了护肤品，有没有什么日常护理的建议。\n4. 如果推荐的产品在预算内且听起来合理，会考虑购买单品。'
  }
];

const MOCK_SCENARIO_SCRIPTS = [
  {
    id: 'sun-care',
    title: '通勤防晒咨询',
    description: '适合干皮通勤顾客，重点考察防晒质地、上妆兼容和试用引导。',
    outline: '1. 顾客询问有没有适合干皮的防晒推荐。\n2. 顾客担心产品会油腻、搓泥或影响底妆。\n3. BA 需要解释质地、使用顺序和适用肤质。\n4. 顾客要求试涂或询问小样，BA 完成试用引导。'
  },
  {
    id: 'acne-care',
    title: '油痘肌基础护理',
    description: '适合预算有限的年轻顾客，重点考察控油祛痘推荐和价格异议处理。',
    outline: '1. 顾客在祛痘产品区停留，对产品选择犹豫。\n2. 顾客说明油痘肌问题，并强调预算有限。\n3. BA 需要推荐入门组合，并解释使用顺序。\n4. 顾客提出价格顾虑，BA 给出单品优先级建议。'
  }
];

export function BAAvatars() {
  const [avatars, setAvatars] = useState<Avatar[]>(INITIAL_AVATARS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_AVATARS[0].id);
  const [tagInput, setTagInput] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [flowMode, setFlowMode] = useState<'custom' | 'existing'>('custom');
  const [selectedScriptId, setSelectedScriptId] = useState(MOCK_SCENARIO_SCRIPTS[0].id);

  const selectedAvatar = avatars.find(a => a.id === selectedId) || avatars[0];

  const handleUpdate = (field: keyof Avatar, value: any) => {
    setAvatars(prev => prev.map(a => a.id === selectedId ? { ...a, [field]: value } : a));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!selectedAvatar.tags.includes(tagInput.trim())) {
        handleUpdate('tags', [...selectedAvatar.tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleUpdate('tags', selectedAvatar.tags.filter(t => t !== tagToRemove));
  };

  const handleSelectScript = (scriptId: string) => {
    const script = MOCK_SCENARIO_SCRIPTS.find(item => item.id === scriptId);
    setSelectedScriptId(scriptId);
    if (script) {
      handleUpdate('flow', script.outline);
    }
  };

  const handleAddNew = () => {
    const newAvatar: Avatar = {
      id: Date.now().toString(),
      name: '新数字人顾客',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}&backgroundColor=e2e8f0`,
      videoUrl: '',
      tags: ['新标签'],
      prompt: '在这里输入数字人的人格设定...',
      flow: '1. ...\n2. ...\n3. ...'
    };
    setAvatars([newAvatar, ...avatars]);
    setSelectedId(newAvatar.id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newAvatars = avatars.filter(a => a.id !== id);
    setAvatars(newAvatars);
    if (selectedId === id && newAvatars.length > 0) {
      setSelectedId(newAvatars[0].id);
    } else if (newAvatars.length === 0) {
      setSelectedId('');
    }
  };

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex h-full bg-[#FAF9F8] overflow-hidden pt-2 rounded-xl border border-slate-200">
      {/* Left Sidebar: List of Avatars */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between z-10 bg-white">
          <h2 className="font-bold text-slate-800 tracking-tight">数字人顾客 ({avatars.length})</h2>
          <button 
            onClick={handleAddNew}
            className="flex items-center justify-center p-1.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {avatars.map(avatar => (
            <div 
              key={avatar.id}
              onClick={() => setSelectedId(avatar.id)}
              className={`group flex items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                selectedId === avatar.id 
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                  : 'border-transparent bg-slate-50 hover:bg-slate-100 hover:border-slate-200'
              }`}
            >
              <img src={avatar.avatarUrl} alt={avatar.name} className={`w-12 h-12 rounded-full object-cover shrink-0 ${selectedId === avatar.id ? 'ring-2 ring-indigo-200' : ''}`} />
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-bold text-sm truncate ${selectedId === avatar.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {avatar.name}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1 mt-0.5 h-4 overflow-hidden">
                  {avatar.tags.slice(0, 2).map((tag, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 bg-white border border-slate-200 text-slate-500 rounded font-medium">
                      {tag}
                    </span>
                  ))}
                  {avatar.tags.length > 2 && <span className="text-[9px] px-1 text-slate-400">+{avatar.tags.length - 2}</span>}
                </div>
              </div>
              <button 
                onClick={(e) => handleDelete(avatar.id, e)}
                className={`ml-2 p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 ${selectedId === avatar.id ? 'opacity-100' : ''}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {avatars.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">
              暂无数字人顾客，请点击右上角添加
            </div>
          )}
        </div>
      </div>

      {/* Right Content: Edit Selected Avatar */}
      <div className="flex-1 bg-[#FAF9F8] flex flex-col relative">
        {showToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-bold">保存成功</span>
          </div>
        )}

        {selectedAvatar ? (
          <>
            <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
              <div>
                <h1 className="text-xl font-bold text-slate-800">编辑数字人：{selectedAvatar.name}</h1>
                <p className="text-xs text-slate-500 mt-1">配置角色外观、人格设定及互动流程以用于 BA 陪练</p>
              </div>
              <button 
                onClick={handleSave}
                className="flex items-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-bold text-sm transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>保存配置</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Basic Info & Visuals */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center">
                    <User className="h-4 w-4 mr-2 text-indigo-500" />
                    基本信息与形象
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* AVATAR IMAGE */}
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-slate-500 mb-2">静态头像</label>
                      <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex flex-col items-center justify-center p-4">
                        <img src={selectedAvatar.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover shadow-sm mb-3 group-hover:opacity-50 transition-opacity" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="h-6 w-6 text-indigo-600 mb-1" />
                          <span className="text-xs font-bold text-indigo-600">更换头像</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* COVER IMAGE UPLOAD */}
                    <div className="col-span-1 md:col-span-2">
                       <label className="block text-xs font-bold text-slate-500 mb-2">上传大图</label>
                       <div className="h-40 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex flex-col items-center justify-center text-slate-400 group">
                          {selectedAvatar.videoUrl ? (
                            <div className="text-indigo-600 font-bold text-sm">✓ 已上传大图</div>
                          ) : (
                            <>
                              <ImageIcon className="h-8 w-8 mb-2 group-hover:text-indigo-500 transition-colors" />
                              <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 mb-1">点击上传或拖拽大图至此</span>
                              <span className="text-[10px]">建议上传横版人物大图，用于学员端角色封面</span>
                            </>
                          )}
                       </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-6">
                    <label className="block text-xs font-bold text-slate-500 mb-2">数字人名称</label>
                    <input 
                      type="text" 
                      value={selectedAvatar.name}
                      onChange={(e) => handleUpdate('name', e.target.value)}
                      className="w-full max-w-sm px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow font-medium"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-indigo-500" />
                    角色标签 (年龄、肤质、需求等)
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedAvatar.tags.map((tag, i) => (
                      <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-1.5 focus:outline-none hover:text-indigo-800">
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="输入标签并按回车添加..." 
                    className="w-full max-w-sm px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow"
                  />
                </div>

                {/* Prompts & Flows */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-fuchsia-500" />
                      人格设定 Prompt
                    </h3>
                    <p className="text-[10px] text-slate-500 mb-4">设定性格、语气及背景，驱动大模型行为</p>
                    <textarea 
                      value={selectedAvatar.prompt}
                      onChange={(e) => handleUpdate('prompt', e.target.value)}
                      className="w-full h-64 p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-amber-500" />
                      对话流程与剧本大纲
                    </h3>
                    <p className="text-[10px] text-slate-500 mb-4">可以自定义剧本大纲，也可以从已有场景剧本中选择</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setFlowMode('custom')}
                        className={`h-9 rounded-lg border text-xs font-bold transition-colors ${flowMode === 'custom' ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                      >
                        自定义大纲
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFlowMode('existing');
                          handleSelectScript(selectedScriptId);
                        }}
                        className={`h-9 rounded-lg border text-xs font-bold transition-colors ${flowMode === 'existing' ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                      >
                        选择场景剧本
                      </button>
                    </div>
                    {flowMode === 'existing' && (
                      <div className="mb-3 rounded-xl border border-amber-100 bg-amber-50/40 p-3">
                        <label className="block text-[10px] font-bold text-amber-700 mb-2">已有场景剧本</label>
                        <select
                          value={selectedScriptId}
                          onChange={(e) => handleSelectScript(e.target.value)}
                          className="w-full h-9 rounded-lg border border-amber-200 bg-white px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        >
                          {MOCK_SCENARIO_SCRIPTS.map(script => (
                            <option key={script.id} value={script.id}>{script.title}</option>
                          ))}
                        </select>
                        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                          {MOCK_SCENARIO_SCRIPTS.find(script => script.id === selectedScriptId)?.description}
                        </p>
                      </div>
                    )}
                    <textarea 
                      value={selectedAvatar.flow}
                      onChange={(e) => handleUpdate('flow', e.target.value)}
                      className="w-full h-40 p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <User className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-medium text-slate-500">在左侧选择或创建一个数字人顾客</p>
          </div>
        )}
      </div>
    </div>
  );
}

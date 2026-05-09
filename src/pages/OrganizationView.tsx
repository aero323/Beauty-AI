import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Building2, MapPin, Store, User, Search, ChevronDown, ChevronRight, Mail, Hash, RefreshCw, Layers } from 'lucide-react';
import { Input } from '../components/ui/input';

const initialOrgData = [
  {
    id: 'org_1',
    name: 'Lumina 全球总部',
    type: '总部',
    icon: 'Building2',
    code: 'HQ-GLOBAL',
    manager: 'Sarah Lee',
    contact: 'contact@lumina.global',
    children: [
      {
        id: 'org_2',
        name: '亚太区 (APAC)',
        type: '大区',
        icon: 'MapPin',
        code: 'REG-APAC',
        manager: 'Kenji Sato',
        contact: 'apac@lumina.global',
        children: [
          {
            id: 'org_3',
            name: '雅加达管辖区 (ID-JKT)',
            type: '区域',
            icon: 'MapPin',
            code: 'AREA-JKT',
            manager: 'Budi Santoso',
            contact: 'jkt@lumina.id',
            children: [
              {
                id: 'org_4',
                name: 'Toko Mal Kelapa Gading',
                type: '门店',
                icon: 'Store',
                code: 'STR-JKT-001',
                manager: 'Ahmad Maulana',
                contact: '+62 812-3456-7890',
                children: [
                  { id: 'usr_1', name: 'Ahmad Maulana', type: '店长', icon: 'User', code: 'EMP-00101', contact: 'ahmad.m@lumina.id' },
                  { id: 'usr_2', name: 'Rina', type: '高级BA', icon: 'User', code: 'EMP-00102', contact: 'rina@lumina.id' },
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Building2': return Building2;
    case 'MapPin': return MapPin;
    case 'Store': return Store;
    case 'User': return User;
    default: return Building2;
  }
};

const TreeNode = ({ node, level, onSelect, selectedId }: any) => {
  const [expanded, setExpanded] = useState(level < 2);
  const Icon = getIcon(node.icon);
  const isSelected = selectedId === node.id;
  const isLeaf = !node.children || node.children.length === 0;

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-2 px-3 hover:bg-[#F8F5F3] cursor-pointer rounded-lg transition-colors ${isSelected ? 'bg-rose-50 border border-rose-100' : 'border border-transparent'}`}
        style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
        onClick={() => onSelect(node)}
      >
        <div className="w-5 h-5 flex items-center justify-center mr-1" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
          {!isLeaf && (expanded ? <ChevronDown className="h-4 w-4 text-[#9A9396]" /> : <ChevronRight className="h-4 w-4 text-[#9A9396]" />)}
        </div>
        <Icon className={`h-4 w-4 mr-2 ${isSelected ? 'text-rose-600' : 'text-[#766F73]'}`} />
        <span className={`text-sm tracking-tight truncate ${isSelected ? 'font-bold text-rose-950' : 'font-medium text-[#3F3A3D]'}`}>{node.name}</span>
        <Badge className={`ml-auto text-[10px] px-1.5 py-0 font-bold shrink-0 ${
          node.type === '初级BA' || node.type === '高级BA' || node.type === '店长' ? 'bg-slate-100 text-[#766F73]' :
          node.type === '门店' ? 'bg-[#FFF7EA] text-[#B9822B]' :
          node.type === '总部' ? 'bg-rose-50 text-rose-600' :
          'bg-rose-50 text-rose-600'
        } border-none`}>
          {node.type}
        </Badge>
      </div>
      {expanded && node.children && (
        <div className="mt-0.5">
          {node.children.map((child: any) => (
            <TreeNode key={child.id} node={child} level={level + 1} onSelect={onSelect} selectedId={selectedId} />
          ))}
        </div>
      )}
    </div>
  );
};

export function OrganizationView() {
  const [orgData, setOrgData] = useState(initialOrgData);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('org_4');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1500);
  };

  const findNodeById = (nodes: any[], id: string): any => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedNode = findNodeById(orgData, selectedNodeId);

  const SelectedIcon = selectedNode ? getIcon(selectedNode.icon) : Building2;

  return (
    <div className="flex-1 flex flex-col pt-2 h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between mb-4">
         <div>
            <h2 className="text-xl font-bold text-[#1F1C1F]">查看组织架构</h2>
            <p className="text-sm text-[#766F73] mt-1">组织架构数据由外部主系统自动同步，仅提供只读展示</p>
         </div>
         <div className="flex items-center space-x-4">
            <div className="text-xs text-[#766F73] font-medium flex items-center bg-[#F8F5F3] px-3 py-1.5 rounded-lg border border-[#E9E4DF] placeholder:">
               <RefreshCw className="h-3 w-3 mr-1.5 text-[#9A9396]" />
               最近同步: <span className="font-bold text-[#3F3A3D] ml-1">今天 08:30</span>
            </div>
            <button
               onClick={handleSync}
               disabled={isSyncing}
               className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${isSyncing ? 'bg-rose-100 text-rose-400 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:shadow-md'}`}
            >
               <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
               {isSyncing ? '同步中...' : '立即同步'}
            </button>
         </div>
      </div>

      <div className="flex gap-6 h-full min-h-0">
        {/* Left Tree Panel */}
        <Card className="w-1/3 rounded-2xl shadow-sm border border-[#E9E4DF] flex flex-col max-h-full">
          <CardHeader className="p-4 border-b border-slate-50 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9A9396]" />
              <input
                type="text"
                placeholder="搜索组织节点或人员名称..."
                className="w-full pl-9 pr-4 py-2 bg-[#F8F5F3] border border-[#E5DED8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium text-[#3F3A3D]"
              />
            </div>
          </CardHeader>
          <CardContent className="p-3 overflow-y-auto flex-1">
             {orgData.map(rootNode => (
                <TreeNode
                  key={rootNode.id}
                  node={rootNode}
                  level={0}
                  onSelect={(node: any) => setSelectedNodeId(node.id)}
                  selectedId={selectedNodeId}
                />
             ))}
          </CardContent>
          <div className="p-4 border-t border-slate-50 bg-[#F8F5F3]/50 shrink-0 flex items-center justify-end rounded-b-2xl">
            <button className="text-[10px] uppercase tracking-widest font-bold text-[#9A9396] hover:text-[#5D565A] transition-colors">
               展开全部
            </button>
          </div>
        </Card>

        {/* Right Detail Panel */}
        <Card className="flex-1 rounded-2xl shadow-sm border border-[#E9E4DF] flex flex-col max-h-full overflow-hidden">
          {selectedNode ? (
            <React.Fragment>
              <CardHeader className="p-6 pb-4 border-b border-slate-50 bg-[#F8F5F3]/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-white border border-[#E5DED8] shadow-sm flex items-center justify-center text-[#3F3A3D]">
                      <SelectedIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-[#1F1C1F]">{selectedNode.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1 text-sm font-medium">
                        <Badge className="bg-slate-200 text-[#5D565A] hover:bg-slate-200 border-none mr-2">{selectedNode.type}</Badge>
                        <span className="font-mono text-[#9A9396] bg-white px-1.5 py-0.5 rounded border border-[#E9E4DF] text-xs">ID: {selectedNode.code}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                     <Badge variant="outline" className="bg-[#F8F5F3] text-[#766F73] border-[#E5DED8] flex items-center pointer-events-none">
                       <RefreshCw className="h-3 w-3 mr-1" /> 已同步
                     </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-[#1F1C1F] uppercase tracking-widest border-b border-[#E9E4DF] pb-2">基础属性</h3>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#766F73] uppercase tracking-wider">节点名称</label>
                        <div className="px-3 py-2 bg-[#F8F5F3]/50 border border-[#E9E4DF] rounded-lg text-sm font-medium text-[#242124]">
                          {selectedNode.name}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#766F73] uppercase tracking-wider">节点编码 (唯一标识)</label>
                        <div className="flex items-center px-3 py-2 bg-[#F8F5F3]/50 border border-[#E9E4DF] rounded-lg text-sm font-mono text-[#3F3A3D]">
                          <Hash className="h-4 w-4 text-[#9A9396] mr-2 shrink-0" />
                          {selectedNode.code || '-'}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#766F73] uppercase tracking-wider">负责人 / 联络人</label>
                        <div className="flex items-center px-3 py-2 bg-[#F8F5F3]/50 border border-[#E9E4DF] rounded-lg text-sm font-medium text-[#3F3A3D]">
                          <User className="h-4 w-4 text-[#9A9396] mr-2 shrink-0" />
                          {selectedNode.manager || <span className="text-[#9A9396] italic">暂无指定负责人</span>}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#766F73] uppercase tracking-wider">联络方式</label>
                        <div className="flex items-center px-3 py-2 bg-[#F8F5F3]/50 border border-[#E9E4DF] rounded-lg text-sm font-medium text-[#3F3A3D]">
                          <Mail className="h-4 w-4 text-[#9A9396] mr-2 shrink-0" />
                          {selectedNode.contact || <span className="text-[#9A9396] italic">暂无联络方式</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational Setting */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-[#1F1C1F] uppercase tracking-widest border-b border-[#E9E4DF] pb-2">下级节点列表</h3>

                    {selectedNode.type === '初级BA' || selectedNode.type === '高级BA' || selectedNode.type === '店长' ? (
                       <div className="bg-[#FFF7EA] border border-[#F2DEC0] rounded-xl p-4 text-sm text-[#8B621F]">
                         <p className="font-bold mb-1">终端节点 (叶子节点)</p>
                         <p className="text-[#B9822B] opacity-80">当前选中的是人员节点类型，没有下级组织机构。</p>
                       </div>
                    ) : (
                      <>
                        {!selectedNode.children || selectedNode.children.length === 0 ? (
                           <div className="flex flex-col items-center justify-center py-8 text-[#9A9396] bg-[#F8F5F3]/50 rounded-xl border border-dashed border-[#E5DED8]">
                              <Layers className="h-8 w-8 mb-2 opacity-50 text-[#9A9396]" />
                              <p className="text-sm font-medium">该节点下暂无子机构或人员</p>
                           </div>
                        ) : (
                          <div className="mt-4">
                            <p className="text-xs font-semibold text-[#766F73] uppercase tracking-wider mb-3">当前直属下级 ({selectedNode.children.length})</p>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                              {selectedNode.children.map((child: any) => {
                                const ChildIcon = getIcon(child.icon);
                                return (
                                  <div key={child.id} className="flex items-center justify-between p-3 bg-white border border-[#E9E4DF] rounded-xl shadow-sm">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-1.5 bg-[#F8F5F3] rounded-md">
                                        <ChildIcon className="h-3 w-3 text-[#766F73]" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-[#242124] leading-none">{child.name}</p>
                                        <p className="text-[10px] text-[#9A9396] mt-1 font-mono">{child.code}</p>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] py-0 border-[#E5DED8] font-medium font-sans">
                                      {child.type}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </React.Fragment>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-[#9A9396]">
                <Building2 className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg font-semibold text-[#5D565A]">选择一个组织节点</p>
                <p className="text-sm mt-1">在左侧架构树中点击节点以查看详细信息</p>
             </div>
          )}
        </Card>
      </div>

    </div>
  );
}

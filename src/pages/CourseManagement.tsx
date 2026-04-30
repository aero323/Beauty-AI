import React, { useState } from 'react';
import { Search, Filter, Clock, Eye, Edit, Download, CalendarCheck, MoreVertical, Link, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface Course {
  id: string;
  title: string;
  description: string;
  views: number;
  creator: string;
  createdAt: string;
  tags: string[];
  imageColor: string;
  scope?: string;
}

const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: '香奈儿山茶花保湿系列产品培训',
    description: '深入解析山茶花提取物的核心功效，掌握搭配销售话术',
    views: 1250,
    creator: '张莉 (总部培训师)',
    createdAt: '2023-10-01',
    tags: ['护肤', '核心单品'],
    imageColor: 'from-pink-100 to-rose-200',
    scope: 'HQ'
  },
  {
    id: '2',
    title: '2024夏季早八伪素颜底妆技巧',
    description: '针对通勤人群的快速底妆SOP，提升试妆转化率',
    views: 890,
    creator: '李明 (彩妆主管)',
    createdAt: '2023-10-15',
    tags: ['彩妆', '实操手法'],
    imageColor: 'from-amber-100 to-orange-200',
    scope: 'HQ'
  },
  {
    id: '3',
    title: '油痘肌/敏感肌专研护理方案',
    description: '从成因解析到产品搭配，建立专业顾问形象',
    views: 2100,
    creator: '王芳 (资深培训师)',
    createdAt: '2023-09-20',
    tags: ['护肤', '问题肌肤'],
    imageColor: 'from-emerald-100 to-teal-200',
    scope: 'HQ'
  },
  {
    id: '4',
    title: '爆款双萃精华抗老原理解析',
    description: '水油双管设计的科研背景与黄金配比说明',
    views: 3420,
    creator: '李明 (彩妆主管)',
    createdAt: '2023-08-11',
    tags: ['护肤', '爆款深挖'],
    imageColor: 'from-amber-200 to-yellow-400',
    scope: 'HQ'
  },
  {
    id: '5',
    title: '节日礼盒搭配与连带销售技巧',
    description: '情人节/母亲节专属套盒推销话术及客单价提升秘籍',
    views: 560,
    creator: '系统默认',
    createdAt: '2023-11-05',
    tags: ['销售技巧', '节假日'],
    imageColor: 'from-rose-200 to-red-300',
  },
  {
    id: '6',
    title: '冷暖皮色彩诊断与口红试色',
    description: '快速判断顾客肤色冷暖调，精准推荐口红色号',
    views: 1120,
    creator: '王芳 (资深培训师)',
    createdAt: '2023-07-22',
    tags: ['彩妆', '专业知识'],
    imageColor: 'from-fuchsia-100 to-purple-200'
  },
  {
    id: '7',
    title: '高端线VVIP顾客邀约与维护',
    description: '针对高净值客户的服务标准与沙龙活动邀约话术',
    views: 450,
    creator: '张莉 (总部培训师)',
    createdAt: '2023-10-28',
    tags: ['客户关系', 'VVIP'],
    imageColor: 'from-slate-200 to-gray-300'
  },
  {
    id: '8',
    title: '香水科普与沙龙香寻香之旅',
    description: '前中后调解析、香精浓度区分及感官营销手法',
    views: 890,
    creator: '张莉 (总部培训师)',
    createdAt: '2023-09-05',
    tags: ['香水', '感官体验'],
    imageColor: 'from-indigo-100 to-blue-200',
  }
];

const ALL_TAGS = ['全部', '护肤', '彩妆', '香水', '销售技巧', '专业知识', '客户关系'];

export function CourseManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('全部');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (course: Course) => {
    const textToCopy = `【L'ÉCLAT AI 课件】${course.title}\n链接：https://lumina-ai.com/course/${course.id}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(course.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCourses = MOCK_COURSES
    .filter(course => selectedTag === '全部' || course.tags.includes(selectedTag))
    .filter(course => course.title.toLowerCase().includes(searchQuery.toLowerCase()) || course.description.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

  return (
    <div className="flex-1 flex flex-col pt-2 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">系统课件库</h1>
          <p className="text-xs text-slate-500 mt-1">管理和分发所有在线培训课件（共 {filteredCourses.length} 份）</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedTag === tag 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto z-20">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索课件名称或简介..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Clock className="h-4 w-4 text-slate-500" />
              {sortOrder === 'newest' ? '最新创建' : '最早创建'}
              <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSortOpen && (
              <div className="absolute top-11 right-0 w-32 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden py-1 z-30">
                <button 
                  onClick={() => { setSortOrder('newest'); setIsSortOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm ${sortOrder === 'newest' ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  最新创建
                </button>
                <button 
                  onClick={() => { setSortOrder('oldest'); setIsSortOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm ${sortOrder === 'oldest' ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  最早创建
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 overflow-y-auto">
        {filteredCourses.map(course => (
          <div key={course.id} className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            {/* Thumbnail */}
            <div className={`aspect-video w-full bg-gradient-to-br ${course.imageColor} relative`}>
              <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 group-hover:bg-black/60"></div>
              
              {/* Badges on Thumbnail (Hidden on Hover) */}
              <div className="absolute top-3 right-3 flex gap-1 items-center transition-opacity duration-300 group-hover:opacity-0">
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-medium">
                  <Eye className="h-3 w-3" />
                  {course.views > 1000 ? (course.views / 1000).toFixed(1) + 'k' : course.views}
                </div>
              </div>

              {/* Hover Overlay Meta */}
              <div className="absolute bottom-3 left-3 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-white/90 bg-black/40 px-2 py-1 rounded backdrop-blur-sm self-start">创建者: {course.creator}</span>
                    <span className="text-[10px] text-white/90 bg-black/40 px-2 py-1 rounded backdrop-blur-sm self-start">创建时间: {course.createdAt}</span>
                 </div>
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] gap-3">
                <button 
                  onClick={() => handleCopyLink(course)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full shadow-lg hover:scale-105 transition-all"
                >
                  {copiedId === course.id ? <CheckCircle2 className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                  {copiedId === course.id ? '已复制链接' : '生成链接'}
                </button>
                <div className="flex items-center gap-2">
                  <button className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/40 hover:scale-110 transition-all select-none group/btn relative">
                    <Edit className="h-3.5 w-3.5" />
                    <span className="absolute -bottom-5 text-[9px] font-bold text-white opacity-0 group-hover/btn:opacity-100 drop-shadow-md">编辑</span>
                  </button>
                  <button className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/40 hover:scale-110 transition-all select-none group/btn relative">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    <span className="absolute -bottom-5 text-[9px] font-bold text-white opacity-0 group-hover/btn:opacity-100 drop-shadow-md">任务</span>
                  </button>
                  <button className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/40 hover:scale-110 transition-all select-none group/btn relative">
                    <Download className="h-3.5 w-3.5" />
                    <span className="absolute -bottom-5 text-[9px] font-bold text-white opacity-0 group-hover/btn:opacity-100 drop-shadow-md">导出</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex flex-wrap gap-1 mb-2">
                {course.scope && course.scope !== 'HQ' && (
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none px-1.5 py-0 h-5 text-[9px]">{course.scope}</Badge>
                )}
                {course.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-bold px-1.5 py-0.5 rounded text-indigo-500 bg-indigo-50 border border-indigo-100">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 outline-none line-clamp-1 group-hover:text-indigo-600 transition-colors">
                {course.title}
              </h3>
              <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                {course.description}
              </p>
            </div>
            
            {/* Meta */}
            <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between mt-auto">
              <span className="text-[10px] text-slate-400 font-medium">创建于 {course.createdAt}</span>
              <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredCourses.length === 0 && (
         <div className="flex items-center justify-center flex-1">
            <div className="text-center">
               <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="h-8 w-8" />
               </div>
               <p className="text-sm font-medium text-slate-600">未找到相关课件</p>
               <p className="text-xs text-slate-400 mt-1">请尝试其他关键词或分类标签</p>
               <button 
                  onClick={() => { setSearchQuery(''); setSelectedTag('全部'); }}
                  className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                >
                  清除过滤条件
                </button>
            </div>
         </div>
      )}
    </div>
  );
}

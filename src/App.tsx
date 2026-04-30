/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { RMDashboard } from './pages/Dashboard';
import { SADashboard } from './pages/SADashboard';
import { HTDashboard } from './pages/HTDashboard';
import { SMDashboard } from './pages/SMDashboard';
import { CourseCreation, CourseTask } from './pages/CourseCreation';
import { CourseManagement } from './pages/CourseManagement';
import { RTCourseManagement } from './pages/RTCourseManagement';
import { BAAvatars } from './pages/BAAvatars';
import { BAScripts } from './pages/BAScripts';
import { RTBAScripts } from './pages/RTBAScripts';
import { BAQuotes } from './pages/BAQuotes';
import { ExamGenerate } from './pages/ExamGenerate';
import { ExamBank } from './pages/ExamBank';
import { ExamHomework } from './pages/ExamHomework';
import { ExamManage } from './pages/ExamManage';
import { ExamTaskManage } from './pages/ExamTaskManage';
import { StudyTaskManage } from './pages/StudyTaskManage';
import { PracticeTaskManage } from './pages/PracticeTaskManage';
import { StoreArchive } from './pages/StoreArchive';
import { PersonnelArchive } from './pages/PersonnelArchive';
import { OrganizationView } from './pages/OrganizationView';
import { UsersManage } from './pages/UsersManage';
import { CategoryManage } from './pages/CategoryManage';
import { NotificationSettings } from './pages/NotificationSettings';
import { KnowledgeGraph } from './pages/KnowledgeGraph';
import { Role } from './types';
import { Loader2, CheckCircle } from 'lucide-react';
import { Progress } from './components/ui/progress';

export default function App() {
  const [role, setRole] = useState<Role>('HQ Trainer');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Global Course Generation State
  const [courseTask, setCourseTask] = useState<CourseTask | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const startGeneration = () => {
    setCourseTask({ status: 'generating', progress: 0 });
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      if (p >= 100) {
        clearInterval(interval);
        setCourseTask({ status: 'done', progress: 100 });
        setShowSuccessBanner(true);
        setTimeout(() => setShowSuccessBanner(false), 5000);
      } else {
        setCourseTask(prev => prev ? { ...prev, progress: p } : null);
      }
    }, 500);
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      switch (role) {
        case 'Super Admin':
          return <SADashboard />;
        case 'HQ Trainer':
          return <HTDashboard />;
        case 'Regional Training Manager':
          return <RMDashboard />;
        case 'Regional Trainer':
          return <RMDashboard />;
        case 'Regional Manager':
          return <RMDashboard />;
        default:
          return <RMDashboard />;
      }
    }
    if (activeTab === 'org' && role === 'Super Admin') {
      return <OrganizationView />;
    }
    if (activeTab === 'users_manage' && role === 'Super Admin') {
      return <UsersManage />;
    }
    if (activeTab === 'category_manage' && role === 'Super Admin') {
      return <CategoryManage />;
    }
    if (activeTab === 'notification_settings' && role === 'Super Admin') {
      return <NotificationSettings />;
    }
    if (activeTab === 'knowledge_graph' && role === 'Super Admin') {
      return <KnowledgeGraph />;
    }
    if (activeTab === 'courses') {
      return (
        <CourseCreation 
          courseTask={courseTask} 
          startGeneration={startGeneration} 
          resetTask={() => setCourseTask(null)} 
        />
      );
    }
    if (activeTab === 'courses_manage') {
      if (role === 'Regional Training Manager') {
        return <RTCourseManagement />;
      }
      return <CourseManagement />;
    }
    if (activeTab === 'ba_avatars') {
      return <BAAvatars />;
    }
    if (activeTab === 'ba_scripts') {
      if (role === 'Regional Training Manager') {
        return <RTBAScripts />;
      }
      return <BAScripts />;
    }
    if (activeTab === 'ba_quotes') {
      return <BAQuotes />;
    }
    if (activeTab === 'exam_generate') {
      return <ExamGenerate />;
    }
    if (activeTab === 'exam_bank') {
      return <ExamBank />;
    }
    if (activeTab === 'exam_homework') {
      return <ExamHomework />;
    }
    if (activeTab === 'exam_manage') {
      return <ExamManage />;
    }
    if (activeTab === 'exam_task_manage') {
      return <ExamTaskManage isReadOnly={role === 'Regional Manager' || role === 'Regional Training Manager' || role === 'Regional Trainer'} />;
    }
    if (activeTab === 'study_task_manage') {
      return <StudyTaskManage isReadOnly={role === 'Regional Manager'} userRole={role} />;
    }
    if (activeTab === 'practice_task_manage') {
      return <PracticeTaskManage isReadOnly={role === 'Regional Manager'} userRole={role} />;
    }
    if (activeTab === 'store_archive') {
      return <StoreArchive userRole={role} />;
    }
    if (activeTab === 'personnel_archive') {
      return <PersonnelArchive userRole={role} />;
    }
    
    // Placeholder for other tabs
    return (
      <div className="flex items-center justify-center h-[60vh] border-2 border-dashed border-gray-200 rounded-xl">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-700 mb-2">即将上线</h2>
          <p className="text-gray-500">【{activeTab}】模块正在开发中，敬请期待。</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Layout role={role} setRole={setRole} activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>

      {/* Global Course Generation Banner */}
      {(courseTask?.status === 'generating' || showSuccessBanner) && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-5">
          {courseTask?.status === 'generating' ? (
            <div className="bg-[#1A1A1A] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 w-80 border border-white/10">
              <Loader2 className="h-5 w-5 text-indigo-400 font-bold animate-spin shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-bold">AI 课件生成中...</div>
                <div className="text-[10px] text-white/50 mt-0.5">请稍候，您可离开此页面</div>
                <Progress value={courseTask.progress} className="h-1 mt-2 bg-white/10" indicatorClassName="bg-indigo-500" />
              </div>
            </div>
          ) : showSuccessBanner ? (
            <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between w-80 border border-emerald-500">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <div>
                  <div className="text-sm font-bold">课件生成完成！</div>
                  <div className="text-[10px] text-emerald-200 mt-0.5">您的课件「产品线全景」已就绪</div>
                </div>
              </div>
              <button 
                onClick={() => { setActiveTab('courses'); setShowSuccessBanner(false); }}
                className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0"
              >
                去审核
              </button>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}

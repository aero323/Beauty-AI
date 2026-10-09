/**
 * 课件类审批的「内容预览」数据
 *
 * 提交端（生成课件发布）与演示单据共用同一份，保证审批人看到的内容口径一致。
 * 每个目录条目都带 detail：审批人点右侧「查看详情」可以看逐页内容、演示视频清单与附加题题干 / 答案。
 * 研发备注：生产环境这里由真实课件渲染器输出（PPT 逐页、视频播放器、题目组件）；
 * 原型用结构化文字模拟，条目文字与演示数据强相关，接真实数据时替换本文件的实现即可。
 */

import type { ApprovalPreviewDetail, ApprovalPreviewSection } from './approvalTypes';

/** 关联附加题：原型展示 5 道题的题干与答案 */
export function buildCourseHomeworkDetail(): ApprovalPreviewDetail {
  return {
    title: '关联附加题（5 题）',
    description: '题型：单选 3 · 多选 1 · 判断 1（原型展示题干与答案）',
    groups: [
      {
        title: '第 1 题（单选）',
        lines: ['顾客担心精华偏油，BA 首先应该怎么做？', 'A. 直接推荐双萃精华', 'B. 先确认肤质和顾虑，再说明质地与用法', 'C. 强调本月的促销活动', '答案：B'],
      },
      {
        title: '第 2 题（单选）',
        lines: ['双萃精华更适合在什么场景下主推？', 'A. 顾客只想快速补水', 'B. 顾客有抗老 / 提亮诉求且接受油相成分', 'C. 顾客明确要求无油配方', '答案：B'],
      },
      {
        title: '第 3 题（多选）',
        lines: ['关于双萃精华的使用说明，哪些是正确的？', 'A. 摇匀后按压 2–3 泵', 'B. 需避开眼周', 'C. 可单独使用，无需后续面霜', '答案：A、B'],
      },
      {
        title: '第 4 题（判断）',
        lines: ['「双萃精华只能干皮使用」——对还是错？', '答案：错（油皮 / 混油皮可减量使用）'],
      },
      {
        title: '第 5 题（单选）',
        lines: ['顾客问「为什么比普通精华贵」，最佳回应是？', 'A. 解释水油双相配比与研发成本', 'B. 只说「效果好」', 'C. 直接打折', '答案：A'],
      },
    ],
  };
}

/** 演示视频清单（课件目录里的「演示视频」条目使用） */
export function buildCourseVideoDetail(): ApprovalPreviewDetail {
  return {
    title: '演示视频 · 柜面话术示范',
    description: '共 3 段、合计约 6 分钟（原型用文字清单模拟播放器）',
    groups: [
      {
        title: '视频清单',
        lines: ['① 迎客与需求探询（2:10）', '② 双萃精华卖点演示与试用（2:40）', '③ 价格异议处理示范（1:30）'],
      },
    ],
  };
}

/** 把一份课件的关键内容打包成二级详情（学习任务等「包含课件」条目复用） */
export function buildCourseDetail(courseTitle: string): ApprovalPreviewDetail {
  return {
    title: `课件预览 · ${courseTitle}`,
    description: '课件目录 · 演示视频 · 关联附加题（原型展示结构化内容）',
    groups: [
      { title: '封面', lines: [`主标题：${courseTitle}`, '副标题：面向门店 BA 的主推策略', '视觉：主视觉 + 产品组合图'] },
      { title: '正文（3 页）', lines: ['核心成分与作用机制', '不同肤质 / 场景的推荐用法', '价格、质地、效果三类异议的回应'] },
      { title: '演示视频（3 段，约 6 分钟）', lines: ['① 迎客与需求探询（2:10）', '② 卖点演示与试用（2:40）', '③ 价格异议处理示范（1:30）'] },
      {
        title: '关联附加题（5 题）',
        lines: [
          '第 1 题（单选）顾虑应对 → 答案 B',
          '第 2 题（单选）适用场景 → 答案 B',
          '第 3 题（多选）使用说明 → 答案 A、B',
          '第 4 题（判断）只适合干皮？→ 错',
          '第 5 题（单选）价格异议回应 → 答案 A',
        ],
      },
    ],
  };
}

export function buildCourseApprovalPreview(courseTitle: string): ApprovalPreviewSection[] {
  return [
    {
      label: '课件目录',
      items: [
        {
          text: `封面 · ${courseTitle}`,
          detail: {
            title: '课件预览 · 封面',
            description: courseTitle,
            groups: [
              {
                title: '页面内容',
                lines: [`主标题：${courseTitle}`, '副标题：面向门店 BA 的冬季主推策略', '视觉：冬季氛围主视觉 + 产品组合图'],
              },
            ],
          },
        },
        {
          text: '产品卖点拆解（3 页）',
          detail: {
            title: '课件预览 · 产品卖点拆解',
            description: '共 3 页',
            groups: [
              { title: '第 2 页 · 核心成分', lines: ['核心成分与作用机制', '与同类产品的差异对比'] },
              { title: '第 3 页 · 卖点拆解', lines: ['不同肤质 / 场景的推荐用法', '柜面演示动作与话术示范'] },
              { title: '第 4 页 · 常见异议', lines: ['价格、质地、效果三类异议的回应'] },
            ],
          },
        },
        { text: '演示视频 · 柜面话术示范', detail: buildCourseVideoDetail() },
        { text: '结尾 · 关联附加题 5 题', detail: buildCourseHomeworkDetail() },
      ],
    },
  ];
}

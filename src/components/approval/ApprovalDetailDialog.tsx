/**
 * 审批详情弹窗（唯一入口）
 *
 * 三个地方复用：待我审批列表、站内信 / 消息中心、创建者的业务列表。
 * 弹窗内按当前身份给动作：审批人可同意 / 驳回（驳回必填理由），
 * 提交人可撤回、被驳回后重提、已生效后提交变更（原型演示入口）。
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle2, Clock3, Eye, FileText, GitCompare, ListChecks, Send, Undo2, XCircle } from 'lucide-react';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';
import {
  approveRequest,
  rejectRequest,
  resubmitRequest,
  submitRevision,
  useApprovalState,
  withdrawRequest,
} from '../../lib/approvalStore';
import {
  approversOf,
  formatDateTime,
  formatRelative,
  liveApprovedRequestForTarget,
  requestById,
  scopeText,
  typeLabel,
} from '../../lib/approvalEngine';
import type { ApprovalActor, ApprovalAction, ApprovalPreviewDetail } from '../../lib/approvalTypes';
import type { Role } from '../../types';

const ACTION_META: Record<ApprovalAction, { label: string; icon: React.ElementType; className: string }> = {
  submit: { label: '提交审批', icon: Send, className: 'text-[#515BCB]' },
  resubmit: { label: '重新提交', icon: Send, className: 'text-[#515BCB]' },
  approve: { label: '同意', icon: CheckCircle2, className: 'text-[#3B8F72]' },
  reject: { label: '驳回', icon: XCircle, className: 'text-red-600' },
  withdraw: { label: '撤回', icon: Undo2, className: 'text-[#766F73]' },
};

export function ApprovalDetailDialog({
  requestId,
  onClose,
  actor,
}: {
  requestId: string | null;
  onClose: () => void;
  actor: ApprovalActor;
  role: Role;
}) {
  const state = useApprovalState();
  const [rejecting, setRejecting] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [resubmitting, setResubmitting] = React.useState(false);
  const [resubmitNote, setResubmitNote] = React.useState('');
  const [revising, setRevising] = React.useState(false);
  const [changeNote, setChangeNote] = React.useState('');
  const [feedback, setFeedback] = React.useState('');
  /** 内容预览里的二级详情弹窗（课件逐页 / 附加题题干与答案） */
  const [previewDetail, setPreviewDetail] = React.useState<ApprovalPreviewDetail | null>(null);
  /** 二级弹窗打开时聚焦标题，避免浏览器滚到最底部的按钮 */
  const previewDetailTitleRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    setRejecting(false);
    setReason('');
    setResubmitting(false);
    setResubmitNote('');
    setRevising(false);
    setChangeNote('');
    setFeedback('');
    setPreviewDetail(null);
  }, [requestId]);

  const request = requestId ? requestById(state, requestId) : undefined;
  if (!request) return null;

  const canDecide = request.status === 'pending' && request.approverIds.includes(actor.id);
  const isCreator = request.creatorId === actor.id;
  const liveVersion = request.isRevision
    ? liveApprovedRequestForTarget(state, request.type, request.targetId)
    : undefined;

  const run = (result: { error?: string }) => {
    setFeedback(result.error ?? '操作成功。');
    if (result.error) return;
    setRejecting(false);
    setReason('');
    setResubmitting(false);
    setResubmitNote('');
    setRevising(false);
    setChangeNote('');
  };

  return (
    <>
    <Dialog open={Boolean(requestId)} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            审批详情
            <ApprovalStatusBadge request={request} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 对象摘要：整行展示，审批人和提交人都先看「这是什么」 */}
          <section className="rounded-xl border border-[#E9E4DF] bg-[#F8F5F3] p-4">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
              <Badge variant="outline" className="border-rose-200 bg-rose-50 py-0 text-[10px] text-rose-600">{typeLabel(request.type)}</Badge>
              <Badge variant="outline" className="py-0 text-[10px] text-[#766F73]">{scopeText(request.snapshot)}</Badge>
              {request.isRevision && (
                <Badge variant="outline" className="border-[#C7CDFF] bg-[#F3F5FF] py-0 text-[10px] text-[#3F48B4]">变更重审</Badge>
              )}
              {request.status === 'pending' && (
                <span className="flex items-center gap-1 text-[10px] font-medium text-[#B9822B]">
                  <Clock3 className="h-3 w-3" /> 已等待 {formatRelative(request.submittedAt)}
                </span>
              )}
            </div>
            <h3 data-i18n-skip="true" className="mt-2 text-base font-bold leading-snug text-[#242124]">{request.snapshot.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#5D565A]">{request.snapshot.summary}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#766F73]">
              {/* 提交人在「我的审批流转」里就是自己，不再重复展示 */}
              {!isCreator && <span>提交人：{request.creatorName}（{request.history[0]?.actorRole ?? '创建者'}）</span>}
              <span>提交时间：{formatDateTime(request.submittedAt)}</span>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* 左栏：审批信息 + 流转时间线 + 处理动作 */}
            <div className="space-y-4">
              <section className="rounded-xl border border-[#E9E4DF] bg-white p-4">
                <p className="flex items-center gap-1.5 text-xs font-bold text-[#3F3A3D]">
                  <ListChecks className="h-3.5 w-3.5 text-[#9A9396]" /> 审批信息
                </p>
                <div className="mt-3 grid gap-2">
                  {request.snapshot.fields.map(field => (
                    <div key={field.label} className="rounded-lg bg-[#F8F5F3] px-3 py-2 ring-1 ring-[#EFE9E5]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9A9396]">{field.label}</p>
                      <p data-i18n-skip="true" className="mt-0.5 text-xs font-medium leading-snug text-[#3F3A3D]">{field.value}</p>
                    </div>
                  ))}
                </div>
                {request.isRevision && liveVersion && (
                  <div className="mt-3 rounded-lg border border-[#DCEFE7] bg-[#EEF8F4] px-3 py-2 text-[11px] leading-relaxed text-[#2F735C]">
                    老版本继续生效：「{liveVersion.snapshot.title}」仍在学员端可用，本次通过后替换为新版本，驳回则不影响老版本。
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-[#E9E4DF] bg-white p-4">
                <p className="flex items-center gap-1.5 text-xs font-bold text-[#3F3A3D]">
                  <FileText className="h-3.5 w-3.5 text-[#9A9396]" /> 审批流转
                </p>
                <ol className="mt-3 space-y-3">
                  {request.history.map(event => {
                    const meta = ACTION_META[event.action];
                    const Icon = meta.icon;
                    return (
                      <li key={event.id} className="flex gap-3">
                        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F8F5F3] ring-1 ring-[#EFE9E5] ${meta.className}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#3F3A3D]">
                            {meta.label}
                            <span className="ml-2 font-normal text-[#9A9396]">{formatDateTime(event.at)}</span>
                          </p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-[#766F73]">
                            {event.actorName}（{event.actorRole}）{event.note ? ` · ${event.note}` : ''}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                {request.status === 'pending' && (
                  <p className="mt-3 rounded-lg bg-[#F8F5F3] px-3 py-2 text-[11px] leading-relaxed text-[#766F73]">
                    待审批人：{approversOf(request).map(item => item.name).join('、')} · 任一审批人同意即生效（单级审批）
                  </p>
                )}
                {request.decision && request.status !== 'pending' && (
                  <p className={`mt-3 rounded-lg px-3 py-2 text-[11px] leading-relaxed ${
                    request.decision.outcome === 'approved' ? 'bg-[#EEF8F4] text-[#2F735C]' : 'bg-red-50 text-red-600'
                  }`}>
                    {request.decision.outcome === 'approved' ? '同意' : '驳回'} · {request.decision.byName} · {formatDateTime(request.decision.at)}
                    {request.decision.reason ? ` · 理由：${request.decision.reason}` : ''}
                  </p>
                )}
              </section>
            </div>

            {/* 右栏：内容预览——审批人在这里看清「批的到底是什么」 */}
            <div className="space-y-4">
              <section className="rounded-xl border border-[#D8DEFF] bg-[#FCFDFF] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[#3F48B4]">
                    <Eye className="h-3.5 w-3.5" /> 内容预览
                  </p>
                  <span className="text-[10px] font-bold text-[#9A9396]">审批人视角 · 只读</span>
                </div>
                {request.snapshot.preview && request.snapshot.preview.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {request.snapshot.preview.map(section => (
                      <div key={section.label}>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#9A9396]">{section.label}</p>
                        <ul className="mt-1.5 space-y-1.5">
                          {section.items.map((raw, index) => {
                            const item = typeof raw === 'string' ? { text: raw, detail: undefined } : raw;
                            return (
                              <li key={index} className="flex items-center justify-between gap-2 rounded-lg border border-[#EEF1FF] bg-white px-3 py-2">
                                <span data-i18n-skip="true" className="min-w-0 flex-1 text-xs leading-relaxed text-[#3F3A3D]">{item.text}</span>
                                {item.detail && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 shrink-0 border-[#C7CDFF] px-2 text-[10px] font-bold text-[#3F48B4] hover:bg-[#EEF1FF]"
                                    onClick={() => setPreviewDetail(item.detail ?? null)}
                                  >
                                    查看详情
                                  </Button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-lg bg-white px-3 py-6 text-center text-xs text-[#9A9396] ring-1 ring-[#EEF1FF]">
                    这条单据未携带内容预览；生产环境按对象类型渲染真实内容。
                  </p>
                )}
                <p className="mt-3 text-[10px] leading-relaxed text-[#9A9396]">
                  注：条目右侧「查看详情」可按课件逐页 / 附加题题干与答案查看二级详情；生产环境这里渲染真实内容（PPT 逐页、视频播放器、题目组件），并与生效版本做逐项差异对比，原型用结构化内容模拟。
                </p>
              </section>

              {request.snapshot.changeSummary && request.snapshot.changeSummary.length > 0 && (
                <section className="rounded-xl border border-[#D8DEFF] bg-[#F8F9FF] p-4">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[#3F48B4]">
                    <GitCompare className="h-3.5 w-3.5" /> 本次变更点
                  </p>
                  <ul className="mt-2 space-y-1">
                    {request.snapshot.changeSummary.map((item, index) => (
                      <li key={index} data-i18n-skip="true" className="text-xs leading-relaxed text-[#3F48B4]">· {item}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>

          {feedback && (
            <p data-i18n-skip="true" className="rounded-lg bg-[#FFF7EA] px-3 py-2 text-xs font-medium text-[#8B621F]">{feedback}</p>
          )}

          {canDecide && !rejecting && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => setRejecting(true)}>
                <XCircle className="h-4 w-4" /> 驳回
              </Button>
              <Button className="bg-[#3B8F72] text-white hover:bg-[#2F735C]" onClick={() => run(approveRequest(request.id, actor))}>
                <CheckCircle2 className="h-4 w-4" /> 同意，内容生效
              </Button>
            </div>
          )}

          {canDecide && rejecting && (
            <div className="rounded-xl border border-red-200 bg-red-50/60 p-3">
              <label className="text-xs font-bold text-red-600">驳回理由（必填，1–200 字）</label>
              <textarea
                value={reason}
                onChange={event => setReason(event.target.value)}
                rows={3}
                maxLength={200}
                placeholder="写给提交人：哪里需要改、改成什么样才可以通过。"
                className="mt-2 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/15"
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => { setRejecting(false); setReason(''); }}>取消</Button>
                <Button size="sm" className="bg-red-600 text-white hover:bg-red-700" onClick={() => run(rejectRequest(request.id, actor, reason))}>
                  确认驳回
                </Button>
              </div>
            </div>
          )}

          {!canDecide && request.status === 'pending' && isCreator && (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-[#F8F5F3] px-3 py-2">
              <p className="text-[11px] leading-relaxed text-[#766F73]">审批中不能直接改内容，可撤回后修改再提交。</p>
              <Button size="sm" variant="outline" className="border-[#E5DED8]" onClick={() => run(withdrawRequest(request.id, actor))}>
                <Undo2 className="h-3.5 w-3.5" /> 撤回
              </Button>
            </div>
          )}

          {request.status === 'rejected' && isCreator && (
            <div className="rounded-xl border border-[#E9E4DF] bg-white p-3">
              {!resubmitting ? (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] leading-relaxed text-[#766F73]">按驳回理由修改后，可在同一单据上重新提交，审批历史会保留。</p>
                  <Button size="sm" className="bg-rose-600 text-white hover:bg-rose-700" onClick={() => setResubmitting(true)}>
                    重新提交
                  </Button>
                </div>
              ) : (
                <>
                  <label className="text-xs font-bold text-[#3F3A3D]">修改说明（选填）</label>
                  <textarea
                    value={resubmitNote}
                    onChange={event => setResubmitNote(event.target.value)}
                    rows={2}
                    placeholder="例如：已补充「方案说明」的判定标准。"
                    className="mt-2 w-full rounded-lg border border-[#E5DED8] px-3 py-2 text-xs outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setResubmitting(false)}>取消</Button>
                    <Button size="sm" className="bg-rose-600 text-white hover:bg-rose-700" onClick={() => run(resubmitRequest(request.id, actor, resubmitNote))}>
                      提交审批
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {request.status === 'approved' && isCreator && (
            <div className="rounded-xl border border-[#D8DEFF] bg-[#F8F9FF] p-3">
              {!revising ? (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] leading-relaxed text-[#3F48B4]">
                    已生效内容的修改需要重新审批；提交变更后老版本继续对学员开放。
                  </p>
                  <Button size="sm" variant="outline" className="border-[#C7CDFF] text-[#3F48B4] hover:bg-[#EEF1FF]" onClick={() => setRevising(true)}>
                    提交变更
                  </Button>
                </div>
              ) : (
                <>
                  <label className="text-xs font-bold text-[#3F48B4]">本次变更说明</label>
                  <textarea
                    value={changeNote}
                    onChange={event => setChangeNote(event.target.value)}
                    rows={2}
                    placeholder="例如：替换第 8 页过时成分表，新增 2 页油敏肌话术。"
                    className="mt-2 w-full rounded-lg border border-[#C7CDFF] bg-white px-3 py-2 text-xs outline-none focus:border-[#6974E8] focus:ring-2 focus:ring-[#515BCB]/15"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setRevising(false)}>取消</Button>
                    <Button
                      size="sm"
                      className="bg-[#515BCB] text-white hover:bg-[#444DB2]"
                      onClick={() => {
                        const note = changeNote.trim() || '内容调整';
                        return run(submitRevision(request.id, actor, {
                          ...request.snapshot,
                          changeSummary: [note],
                        }));
                      }}
                    >
                      提交变更审批
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          <p className="text-[10px] leading-relaxed text-[#9A9396]">
            注：生产实现需禁止自审（同一账号既是提交人又是审批人）、以文件版本做真实差异对比，并把站内信 / App 推送 / WhatsApp 换成真实消息服务；原型里外部渠道只展示状态。
          </p>
        </div>
      </DialogContent>
    </Dialog>

    {/* 预览条目的二级详情：独立 Dialog（课件逐页 / 附加题题干与答案），ESC 或点遮罩可回到审批详情 */}
    <Dialog open={Boolean(previewDetail)} onOpenChange={open => { if (!open) setPreviewDetail(null); }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl" initialFocus={previewDetailTitleRef}>
        {previewDetail && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle ref={previewDetailTitleRef} tabIndex={-1} data-i18n-skip="true" className="text-base font-bold leading-snug text-[#242124] outline-none">
                {previewDetail.title}
              </DialogTitle>
              {previewDetail.description && (
                <p data-i18n-skip="true" className="text-[11px] text-[#766F73]">{previewDetail.description}</p>
              )}
            </DialogHeader>
            <div className="space-y-4">
              {previewDetail.groups.map((group, groupIndex) => (
                <div key={groupIndex} className="rounded-lg border border-[#EEF1FF] bg-[#FCFDFF] px-3 py-2.5">
                  {group.title && (
                    <p data-i18n-skip="true" className="text-[11px] font-bold text-[#3F48B4]">{group.title}</p>
                  )}
                  <ul className={group.title ? 'mt-1.5 space-y-1' : 'space-y-1'}>
                    {group.lines.map((line, lineIndex) => (
                      <li key={lineIndex} data-i18n-skip="true" className="text-xs leading-relaxed text-[#3F3A3D]">{line}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-[#E9E4DF] pt-3">
              <p className="text-[10px] leading-relaxed text-[#9A9396]">原型展示结构化内容；生产环境接入真实课件 / 题库组件。</p>
              <Button size="sm" className="bg-[#515BCB] text-white hover:bg-[#444DB2]" onClick={() => setPreviewDetail(null)}>
                知道了
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}

/**
 * 审批流程配置（审批管理者）
 *
 * 类型 × 范围：每种产出可分别配置「全国流程」和「区域流程」；
 * 区域可以单独指定审批人，未单独配置的区域自动沿用全国流程。
 * 总开关由 Super Admin 在系统设置里控制，关闭时本页只读。
 */

import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { CheckCircle2, Info, Lock, RotateCcw, SlidersHorizontal, TriangleAlert, Users } from 'lucide-react';
import { ApproverIdentityBar } from '../components/approval/ApproverIdentityBar';
import {
  clearRegionalApprovalRule,
  setApprovalFlowRule,
  useApprovalState,
} from '../lib/approvalStore';
import { currentActorForRole } from '../lib/approvalEngine';
import {
  APPROVER_ACCOUNTS,
  APPROVAL_REGIONS,
  APPROVAL_TYPE_META,
  APPROVAL_TYPE_ORDER,
  approverLabel,
  regionNameOf,
  type ApprovalObjectType,
  type ApprovalState,
} from '../lib/approvalTypes';
import { cn } from '../lib/utils';
import type { Role } from '../types';

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (next: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-5 w-9 shrink-0 rounded-full transition-colors',
        checked ? 'bg-[#3B8F72]' : 'bg-[#D8D2CE]',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all', checked ? 'left-[18px]' : 'left-0.5')} />
    </button>
  );
}

function ApproverPicker({ selected, onChange, disabled }: { selected: string[]; onChange: (ids: string[]) => void; disabled?: boolean }) {
  return (
    <div className="mt-2 rounded-lg border border-[#E9E4DF] bg-[#FDFBFA] p-2">
      {APPROVER_ACCOUNTS.map(account => {
        const checked = selected.includes(account.id);
        return (
          <label key={account.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white">
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={() => onChange(checked ? selected.filter(id => id !== account.id) : [...selected, account.id])}
              className="h-3.5 w-3.5 rounded border-slate-300 text-rose-600"
            />
            <span className="text-xs font-bold text-[#3F3A3D]">{account.name}</span>
            <span className="text-[10px] text-[#9A9396]">
              {account.scope === '总部' ? '总部' : regionNameOf(account.regionId)} · {account.email} · {account.status}
            </span>
          </label>
        );
      })}
      <p className="px-2 pt-1 text-[10px] leading-relaxed text-[#9A9396]">
        候选来自「账号管理」里角色为审批管理者的账号；可多选，任一审批人同意即生效。
      </p>
    </div>
  );
}

function RuleSummary({ enabled, approverIds }: { enabled: boolean; approverIds: string[] }) {
  if (!enabled) return <Badge variant="outline" className="py-0 text-[10px] text-[#766F73]">未开启</Badge>;
  if (approverIds.length === 0) {
    return <Badge variant="outline" className="border-[#E8CCA0] bg-[#FFF7EA] py-0 text-[10px] text-[#8B621F]">开启但未配审批人</Badge>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {approverIds.map(id => (
        <Badge key={id} variant="outline" className="border-[#BFDCCF] bg-[#EEF8F4] py-0 text-[10px] text-[#2F735C]">
          {approverLabel(id)}
        </Badge>
      ))}
    </div>
  );
}

function TypeFlowCard({
  type,
  state,
  readOnly,
  actorName,
}: {
  type: ApprovalObjectType;
  state: ApprovalState;
  readOnly: boolean;
  actorName: string;
  key?: React.Key;
}) {
  const flow = state.config.types[type];
  const [pickerFor, setPickerFor] = React.useState<string | null>(null);
  const meta = APPROVAL_TYPE_META[type];

  const update = (key: 'national' | string, patch: { enabled?: boolean; approverIds?: string[] }) => {
    setApprovalFlowRule(type, key, patch, actorName);
  };

  return (
    <Card className="rounded-2xl border-[#E9E4DF] shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#F1ECE8] pb-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#242124]">
              {meta.label}
              {flow.national.enabled && <Badge variant="outline" className="border-[#BFDCCF] bg-[#EEF8F4] py-0 text-[10px] text-[#2F735C]">审批已开启</Badge>}
            </h3>
            <p className="mt-1 text-[11px] text-[#766F73]">创建角色：{meta.producers} · 通过后进入「{meta.targetTab}」</p>
          </div>
          <span className="text-[10px] text-[#9A9396]">
            {flow.updatedAt ? `最近修改：${new Date(flow.updatedAt).toLocaleString('zh-CN', { hour12: false })} · ${flow.updatedBy ?? ''}` : '尚未修改'}
          </span>
        </div>

        {/* 全国流程 */}
        <div className="mt-3 rounded-xl border border-[#EFE9E5] bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-[#3F3A3D]">全国流程</p>
              <p className="mt-0.5 text-[10px] text-[#9A9396]">全国范围的{meta.label}由下面指定的审批人审批</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#766F73]">{flow.national.enabled ? '已开启' : '未开启'}</span>
              <Toggle
                checked={flow.national.enabled}
                disabled={readOnly}
                onChange={next => update('national', { enabled: next })}
              />
            </div>
          </div>
          {flow.national.enabled && (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <RuleSummary enabled approverIds={flow.national.approverIds} />
              <Button
                size="xs"
                variant="outline"
                disabled={readOnly}
                className="border-[#E5DED8]"
                onClick={() => setPickerFor(pickerFor === 'national' ? null : 'national')}
              >
                <Users className="h-3 w-3" /> 选择审批人
              </Button>
            </div>
          )}
          {pickerFor === 'national' && (
            <ApproverPicker disabled={readOnly} selected={flow.national.approverIds} onChange={ids => update('national', { approverIds: ids })} />
          )}
        </div>

        {/* 区域流程 */}
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#3F3A3D]">区域流程</p>
            <span className="text-[10px] text-[#9A9396]">未单独配置的区域自动沿用全国流程</span>
          </div>
          <div className="mt-2 space-y-2">
            {APPROVAL_REGIONS.map(region => {
              const rule = flow.regional[region.id];
              const inherited = !rule;
              return (
                <div key={region.id} className={cn('rounded-xl border p-3', inherited ? 'border-dashed border-[#E5DED8] bg-[#FDFBFA]' : 'border-[#EFE9E5] bg-white')}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-bold text-[#3F3A3D]">
                        {region.name}
                        <span className="text-[10px] font-medium text-[#9A9396]">负责人 {region.ownerName}</span>
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#9A9396]">
                        {inherited
                          ? flow.national.enabled
                            ? '当前沿用全国流程（全国审批人）'
                            : '当前沿用全国流程（全国未开启，区域也不审批）'
                          : rule.enabled
                            ? '单独配置：本区域产出走本区域审批人'
                            : '单独配置：本区域产出不审批，直接生效'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {inherited ? (
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={readOnly}
                          className="border-[#E5DED8]"
                          onClick={() => update(region.id, { enabled: true, approverIds: [...flow.national.approverIds] })}
                        >
                          <SlidersHorizontal className="h-3 w-3" /> 单独配置
                        </Button>
                      ) : (
                        <>
                          <span className="text-[10px] font-bold text-[#766F73]">{rule.enabled ? '已开启' : '未开启'}</span>
                          <Toggle
                            checked={rule.enabled}
                            disabled={readOnly}
                            onChange={next => update(region.id, { enabled: next })}
                          />
                          <Button
                            size="xs"
                            variant="ghost"
                            disabled={readOnly}
                            className="text-[#766F73] hover:text-rose-600"
                            onClick={() => { setPickerFor(null); clearRegionalApprovalRule(type, region.id, actorName); }}
                          >
                            <RotateCcw className="h-3 w-3" /> 恢复沿用
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {!inherited && rule.enabled && (
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <RuleSummary enabled approverIds={rule.approverIds} />
                      <Button
                        size="xs"
                        variant="outline"
                        disabled={readOnly}
                        className="border-[#E5DED8]"
                        onClick={() => setPickerFor(pickerFor === region.id ? null : region.id)}
                      >
                        <Users className="h-3 w-3" /> 选择审批人
                      </Button>
                    </div>
                  )}
                  {pickerFor === region.id && !inherited && (
                    <ApproverPicker disabled={readOnly} selected={rule.approverIds} onChange={ids => update(region.id, { approverIds: ids })} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ApprovalFlowConfig({ role }: { role: Role }) {
  const state = useApprovalState();
  const actor = currentActorForRole(role, state);
  const readOnly = !state.config.masterEnabled;
  const [showNote, setShowNote] = React.useState(false);

  return (
    <div className="space-y-4 pt-2">
      <ApproverIdentityBar />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#1F1C1F]">审批流程配置</h2>
          <p className="mt-1 text-sm text-[#766F73]">决定哪些产出需要审批、由谁审批；客户可以按业务只开启其中几项。</p>
        </div>
        <Button size="sm" variant="outline" className="border-[#E5DED8]" onClick={() => setShowNote(prev => !prev)}>
          <Info className="h-3.5 w-3.5" /> 配置说明
        </Button>
      </div>

      {/* 总开关状态 */}
      <div className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3',
        state.config.masterEnabled ? 'border-[#DCEFE7] bg-[#EEF8F4]' : 'border-[#E8CCA0] bg-[#FFF7EA]',
      )}>
        <div className="flex items-start gap-2">
          {state.config.masterEnabled
            ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3B8F72]" />
            : <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#8B621F]" />}
          <div>
            <p className={cn('text-sm font-bold', state.config.masterEnabled ? 'text-[#2F735C]' : 'text-[#8B621F]')}>
              {state.config.masterEnabled ? '客户已启用审批功能' : '客户未启用审批功能（由系统管理员在「系统设置」控制）'}
            </p>
            <p className={cn('mt-0.5 text-[11px] leading-relaxed', state.config.masterEnabled ? 'text-[#2F735C]/80' : 'text-[#8B621F]/80')}>
              {state.config.masterEnabled
                ? '下面按类型 × 范围的开关立即生效：关闭后新的提交直接生效，已在审单据继续走完。'
                : '总开关关闭时本页只读；新的提交会直接生效，已在审单据继续走完。'}
            </p>
          </div>
        </div>
        {state.config.masterUpdatedBy && (
          <span className="text-[10px] text-[#9A9396]">
            {state.config.masterUpdatedBy} 修改于 {state.config.masterUpdatedAt ? new Date(state.config.masterUpdatedAt).toLocaleString('zh-CN', { hour12: false }) : '--'}
          </span>
        )}
      </div>

      {showNote && (
        <div className="rounded-2xl border border-[#D8DEFF] bg-[#F8F9FF] px-4 py-3 text-[11px] leading-relaxed text-[#3F48B4]">
          <p className="font-bold">给研发的口径</p>
          <p className="mt-1">1. 审批人是「审批管理者」角色下的账号，可在账号管理里新增 / 停用；一条流程可多选，任一同意即生效（单级）。</p>
          <p>2. 区域流程按区域分组配置，未配置的区域沿用全国流程；全国与区域都可单独关闭，关闭后该范围直接生效。</p>
          <p>3. 已生效内容的修改要重新审批：提交变更版本时老版本继续对学员开放，通过后替换，驳回不影响老版本。</p>
          <p>4. 提交满 24 小时未处理会催办一次；不做自动通过、不升级。生产环境用真实消息服务替换站内信 / App 推送 / WhatsApp。</p>
        </div>
      )}

      {readOnly && (
        <div className="flex items-center gap-2 rounded-xl bg-[#FFF7EA] px-3 py-2 text-[11px] font-medium text-[#8B621F]">
          <TriangleAlert className="h-3.5 w-3.5" />
          当前所有配置为只读：客户没有购买 / 启用审批功能。请联系系统管理员开启后再调整。
        </div>
      )}

      <div className="space-y-3">
        {APPROVAL_TYPE_ORDER.map(type => (
          <TypeFlowCard key={type} type={type} state={state} readOnly={readOnly} actorName={actor.name} />
        ))}
      </div>
    </div>
  );
}

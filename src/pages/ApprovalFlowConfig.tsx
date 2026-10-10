/**
 * 审批流程配置（Super Admin）
 *
 * 类型 × 范围 × 层级：每种产出可分别配置「全国流程」和「区域流程」，
 * 每个流程支持多级审批（按顺序逐级进行，每级任一审批人同意后进入下一级，最后一级同意才生效）。
 * 区域未单独配置时自动沿用全国流程；总开关由 Super Admin 在系统设置里控制，关闭时本页只读。
 */

import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { CheckCircle2, Info, Lock, Plus, RotateCcw, SlidersHorizontal, Trash2, TriangleAlert, Users } from 'lucide-react';
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
  approverAccountById,
  approverLabel,
  regionNameOf,
  type ApprovalLevel,
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
              {account.scope === '总部' ? '总部' : regionNameOf(account.regionId)}
              {account.dept ? ` · ${account.dept}` : ''} · {account.email} · {account.status}
            </span>
          </label>
        );
      })}
      <p className="px-2 pt-1 text-[10px] leading-relaxed text-[#9A9396]">
        候选来自「账号管理」里角色为审批管理者的账号；同一级可多选，任一人同意即进入下一级。
      </p>
    </div>
  );
}

function ruleIncomplete(levels: ApprovalLevel[]): boolean {
  return levels.length === 0 || levels.some(level => level.approverIds.length === 0);
}

/** 多级审批层级编辑器：逐级配置审批人，可增删层级 */
function LevelEditor({
  levels,
  disabled,
  onChange,
}: {
  levels: ApprovalLevel[];
  disabled?: boolean;
  onChange: (next: ApprovalLevel[]) => void;
}) {
  const [pickerFor, setPickerFor] = React.useState<number | null>(null);

  const updateLevel = (index: number, ids: string[]) => {
    onChange(levels.map((level, i) => (i === index ? { approverIds: ids } : level)));
  };
  const removeLevel = (index: number) => {
    setPickerFor(null);
    onChange(levels.filter((_, i) => i !== index));
  };
  const addLevel = () => {
    onChange([...levels, { approverIds: [] }]);
  };

  return (
    <div className="mt-2 space-y-2">
      <p className="text-[10px] leading-relaxed text-[#9A9396]">
        审批层级：按顺序逐级审批，每级任一审批人同意后进入下一级，最后一级同意才生效；任一级驳回即整单驳回。
      </p>
      {levels.length === 0 && (
        <p className="rounded-lg bg-[#FFF7EA] px-3 py-2 text-[11px] leading-relaxed text-[#8B621F]">
          尚未配置层级：该范围会阻止提交，请至少添加 1 级并指定审批人。
        </p>
      )}
      {levels.map((level, index) => (
        <div key={index} className="rounded-xl border border-[#EFE9E5] bg-[#FDFBFA] p-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="rounded bg-[#EEF1FF] px-1.5 py-0.5 text-[10px] font-bold text-[#3F48B4]">第 {index + 1} 级</span>
              {level.approverIds.length === 0 ? (
                <span className="rounded-full bg-[#FFF7EA] px-2 py-0.5 text-[10px] font-bold text-[#8B621F]">未指定审批人</span>
              ) : (
                <span className="flex flex-wrap gap-1">
                  {level.approverIds.map(id => (
                    <Badge key={id} variant="outline" className="border-[#BFDCCF] bg-[#EEF8F4] py-0 text-[10px] text-[#2F735C]">
                      {approverLabel(id)}
                    </Badge>
                  ))}
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                size="xs"
                variant="outline"
                disabled={disabled}
                className="border-[#E5DED8]"
                onClick={() => setPickerFor(pickerFor === index ? null : index)}
              >
                <Users className="h-3 w-3" /> 选择审批人
              </Button>
              {levels.length > 1 && (
                <Button
                  size="xs"
                  variant="ghost"
                  disabled={disabled}
                  className="text-[#766F73] hover:text-rose-600"
                  onClick={() => removeLevel(index)}
                >
                  <Trash2 className="h-3 w-3" /> 移除
                </Button>
              )}
            </div>
          </div>
          {pickerFor === index && (
            <ApproverPicker disabled={disabled} selected={level.approverIds} onChange={ids => updateLevel(index, ids)} />
          )}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="xs" variant="outline" disabled={disabled} className="border-[#E5DED8]" onClick={addLevel}>
          <Plus className="h-3 w-3" /> 添加一级
        </Button>
        {levels.length > 1 && (
          <span className="text-[10px] text-[#9A9396]">共 {levels.length} 级，按 1 → {levels.length} 顺序审批</span>
        )}
      </div>
    </div>
  );
}

function TypeFlowCard({
  type,
  state,
  readOnly,
  actorName,
  isHq,
  ownRegionId,
}: {
  type: ApprovalObjectType;
  state: ApprovalState;
  readOnly: boolean;
  actorName: string;
  /** 总部审批管理者：可配全国 + 全部区域 */
  isHq: boolean;
  /** 区域审批管理者：仅可配自己所在的区域 */
  ownRegionId?: string;
  key?: React.Key;
}) {
  const flow = state.config.types[type];
  const meta = APPROVAL_TYPE_META[type];

  const canEditNational = isHq;
  const canEditRegion = (regionId: string) => isHq || regionId === ownRegionId;

  const update = (key: 'national' | string, patch: { enabled?: boolean; levels?: ApprovalLevel[] }) => {
    if (readOnly) return;
    if (key === 'national' && !canEditNational) return;
    if (key !== 'national' && !canEditRegion(key)) return;
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
              <p className="flex items-center gap-1.5 text-xs font-bold text-[#3F3A3D]">
                全国流程
                {!canEditNational && (
                  <span className="rounded bg-[#F8F5F3] px-1.5 py-0.5 text-[10px] font-medium text-[#9A9396]">仅总部可配置</span>
                )}
              </p>
              <p className="mt-0.5 text-[10px] text-[#9A9396]">全国范围的{meta.label}由下面指定的审批人审批</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#766F73]">{flow.national.enabled ? '已开启' : '未开启'}</span>
              <Toggle
                checked={flow.national.enabled}
                disabled={readOnly || !canEditNational}
                onChange={next => update('national', { enabled: next })}
              />
            </div>
          </div>
          {flow.national.enabled && (
            <>
              {ruleIncomplete(flow.national.levels) && (
                <p className="mt-2 rounded-lg bg-[#FFF7EA] px-2.5 py-1.5 text-[10px] font-medium leading-relaxed text-[#8B621F]">
                  已开启但层级未配齐：该范围会阻止提交，请在下面补齐每级审批人。
                </p>
              )}
              <LevelEditor
                levels={flow.national.levels}
                disabled={readOnly || !canEditNational}
                onChange={levels => update('national', { levels })}
              />
            </>
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
              const editable = canEditRegion(region.id);
              return (
                <div key={region.id} className={cn('rounded-xl border p-3', inherited ? 'border-dashed border-[#E5DED8] bg-[#FDFBFA]' : 'border-[#EFE9E5] bg-white')}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-bold text-[#3F3A3D]">
                        {region.name}
                        <span className="text-[10px] font-medium text-[#9A9396]">负责人 {region.ownerName}</span>
                        {!editable && (
                          <span className="rounded bg-[#F8F5F3] px-1.5 py-0.5 text-[10px] font-medium text-[#9A9396]">仅总部 / 所属区域可配置</span>
                        )}
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
                          disabled={readOnly || !editable}
                          className="border-[#E5DED8]"
                          onClick={() => update(region.id, { enabled: true, levels: flow.national.levels.map(level => ({ approverIds: [...level.approverIds] })) })}
                        >
                          <SlidersHorizontal className="h-3 w-3" /> 单独配置
                        </Button>
                      ) : (
                        <>
                          <span className="text-[10px] font-bold text-[#766F73]">{rule.enabled ? '已开启' : '未开启'}</span>
                          <Toggle
                            checked={rule.enabled}
                            disabled={readOnly || !editable}
                            onChange={next => update(region.id, { enabled: next })}
                          />
                          <Button
                            size="xs"
                            variant="ghost"
                            disabled={readOnly || !editable}
                            className="text-[#766F73] hover:text-rose-600"
                            onClick={() => clearRegionalApprovalRule(type, region.id, actorName)}
                          >
                            <RotateCcw className="h-3 w-3" /> 恢复沿用
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {!inherited && rule.enabled && (
                    <LevelEditor
                      levels={rule.levels}
                      disabled={readOnly || !editable}
                      onChange={levels => update(region.id, { levels })}
                    />
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
  const account = approverAccountById(actor.id);
  /**
   * 本页归超管配置；超管可配全国 + 全部区域。
   * （保留按审批身份收敛的判断：如审批管理者的身份访问，仅能配置所在范围）
   */
  const isHq = role === 'Super Admin' || account?.scope === '总部';
  const readOnly = !state.config.masterEnabled;
  const [showNote, setShowNote] = React.useState(false);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#1F1C1F]">审批流程配置</h2>
          <p className="mt-1 text-sm text-[#766F73]">决定哪些产出需要审批、由谁按什么顺序审批；支持多级审批，客户可以按业务只开启其中几项。</p>
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
          <p className="mt-1">1. 审批人是「审批管理者」角色下的账号，可在账号管理里新增 / 停用；同一级可多选，任一人同意即进入下一级。</p>
          <p>2. 多级审批按「层级 1 → 层级 N」顺序逐级进行，最后一级同意才生效；任一级驳回即整单驳回，重新提交后从第 1 级重新开始。</p>
          <p>3. 区域流程按区域分组配置，未配置的区域沿用全国流程；全国与区域都可单独关闭，关闭后该范围直接生效。</p>
          <p>4. 本页归超管配置（总开关也在系统设置）；审批管理者只处理待办，不参与流程配置。生产环境在服务端校验账号权限与组织范围。</p>
          <p>5. 已生效内容的修改要重新审批：提交变更版本时老版本继续对学员开放，通过后替换，驳回不影响老版本。</p>
          <p>6. 提交满 24 小时未处理会给当前层级催办一次；不做自动通过、不升级。生产环境用真实消息服务替换站内信 / App 推送 / WhatsApp。</p>
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
          <TypeFlowCard
            key={type}
            type={type}
            state={state}
            readOnly={readOnly}
            actorName={actor.name}
            isHq={isHq}
            ownRegionId={account?.regionId}
          />
        ))}
      </div>
    </div>
  );
}

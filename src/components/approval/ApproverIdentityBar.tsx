/**
 * 演示用「当前审批身份」切换器
 *
 * 原型用角色切换器登录，一个角色只能演示一个账号；审批管理者有两类账号（总部 / 区域），
 * 所以在这里切换当前审批人，便于演示区域分流。生产环境身份来自登录态，这个组件会被移除。
 */

import React from 'react';
import { UserCog } from 'lucide-react';
import { APPROVER_ACCOUNTS, regionNameOf } from '../../lib/approvalTypes';
import { setApprovalDemoApprover, useApprovalState } from '../../lib/approvalStore';
import { cn } from '../../lib/utils';

export function ApproverIdentityBar() {
  const state = useApprovalState();
  const currentId = state.demoApproverId;

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E9E4DF] bg-white px-4 py-2.5">
      <div className="flex items-center gap-2">
        <UserCog className="h-4 w-4 text-[#A85F4B]" />
        <span className="text-xs font-bold text-[#3F3A3D]">当前审批身份（Demo）</span>
        <span className="text-[10px] text-[#9A9396]">生产环境取登录账号，原型用于演示总部 / 区域审批人分流</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-[#F8F5F3] p-1">
        {APPROVER_ACCOUNTS.map(account => {
          const active = account.id === currentId;
          return (
            <button
              key={account.id}
              type="button"
              onClick={() => setApprovalDemoApprover(account.id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-bold transition-colors',
                active ? 'bg-white text-[#A85F4B] shadow-sm ring-1 ring-[#F3C9BC]' : 'text-[#766F73] hover:text-[#3F3A3D]',
              )}
            >
              {account.name}
              <span className="ml-1 font-medium text-[10px] text-[#9A9396]">
                {account.scope === '总部' ? '总部' : regionNameOf(account.regionId)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

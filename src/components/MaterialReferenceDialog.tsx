import React, { useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, Check, Clock3, FileAudio, FileVideo, Folder, Link2, MapPin, Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MOCK_GOLDEN_ALBUMS, MOCK_GOLDEN_MATERIALS, MOCK_MATERIAL_RECOMMENDATIONS } from '../lib/materialLibraryData';
import type { GoldenMaterial, MaterialRecommendation } from '../types';

export type MaterialReferenceTarget = 'avatar' | 'script' | 'quote';

interface MaterialReferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: MaterialReferenceTarget;
  quoteTargetLabel?: string;
  onApply: (materials: GoldenMaterial[]) => void;
}

type QuoteReferenceTab = 'recommended' | 'albums';

const ALL_ALBUMS_ID = '__all__';
const UNCATEGORIZED_ALBUM_ID = '__uncategorized__';

const targetConfig: Record<MaterialReferenceTarget, {
  title: string;
  description: string;
}> = {
  avatar: {
    title: '为数字人顾客引用素材',
    description: '选取已审核的黄金话术，提炼顾客需求、顾虑、表达方式和互动流程，生成可编辑草稿。',
  },
  script: {
    title: '为场景剧本引用素材',
    description: '选取已审核的黄金话术，提炼场景背景、关键转折和 BA 行动，生成可编辑草稿。',
  },
  quote: {
    title: '为金句库引用素材',
    description: '选取已审核的黄金话术；每条素材会生成一条可继续编辑的金句草稿。',
  },
};

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function normalizeName(value?: string) {
  return value?.trim().toLocaleLowerCase() ?? '';
}

function materialTargetKind(material: GoldenMaterial) {
  return material.targetKind ?? (material.type === 'scenario_beat' ? 'scenario' : 'product');
}

interface MaterialOptionCardProps {
  material: GoldenMaterial;
  selected: boolean;
  onToggle: (id: string) => void;
  recommendation?: MaterialRecommendation;
}

interface MaterialListItem {
  material: GoldenMaterial;
  recommendation?: MaterialRecommendation;
}

function MaterialOptionCard({ material, selected, onToggle, recommendation }: MaterialOptionCardProps) {
  const evidence = material.evidence[0];
  const targetKind = materialTargetKind(material);

  return (
    <label
      className={`block cursor-pointer rounded-lg border p-4 transition-colors ${selected ? 'border-[#6974E8] bg-[#F4F5FF] shadow-sm' : 'border-[#E5DED8] bg-white hover:border-[#BDB8DD]'}`}
    >
      <div className="flex gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(material.id)}
          className="mt-1 h-4 w-4 rounded border-[#BDB5B1] accent-[#515BCB]"
          aria-label={`引用素材 ${material.title}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[#242124]">{material.title}</span>
            {recommendation ? <Badge variant="outline" className="border-[#D8DEFF] bg-[#EEF1FF] text-[#515BCB]"><Sparkles className="mr-1 h-3 w-3" />AI 推荐</Badge> : null}
            <Badge variant="outline" className="border-[#D8DEFF] bg-[#EEF1FF] text-[#515BCB]">{material.mediaKind === 'video' ? '视频' : '音频'}</Badge>
            <Badge variant="outline" className="border-[#E5DED8] bg-[#F8F5F3] text-[#766F73]">{targetKind === 'scenario' ? '场景' : '产品'}</Badge>
            <Badge variant="outline" className="border-[#BFDCCF] bg-[#EEF8F4] text-[#3B8F72]">{material.scope}</Badge>
          </div>
          <p data-i18n-skip="true" className="mt-2 text-sm leading-relaxed text-[#242124]">{material.transcript ?? material.summary}</p>
          <div className="mt-2 rounded-md bg-[#F8F5F3] px-3 py-2 text-xs leading-relaxed text-[#5D565A]"><span className="font-bold text-[#766F73]">AI 总结：</span>{material.aiSummary ?? material.summary}</div>
          {recommendation ? (
            <div className="mt-2 rounded-md border border-[#D8DEFF] bg-[#F7F8FF] px-3 py-2 text-xs leading-relaxed text-[#515BCB]"><span className="font-bold">AI 推荐理由：</span>{recommendation.recommendationReason}</div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {material.tags.map((tag) => <span key={tag} className="rounded-md bg-[#F8F5F3] px-2 py-1 text-[11px] font-medium text-[#766F73]">{tag}</span>)}
          </div>
          {evidence ? (
            <div className="mt-3 rounded-md border border-[#E9E4DF] bg-[#FCFAF8] px-3 py-2">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#766F73]">
                {material.mediaKind === 'video' ? <FileVideo className="h-3.5 w-3.5" /> : <FileAudio className="h-3.5 w-3.5" />}
                <span>证据 {formatTime(evidence.startSec)} - {formatTime(evidence.endSec)}</span>
                <span className="text-[#C9C1C4]">|</span>
                <span>{material.targetLabel}</span>
                <span className="text-[#C9C1C4]">|</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{material.region}</span>
              </div>
              <p data-i18n-skip="true" className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#5D565A]">{evidence.transcript}</p>
            </div>
          ) : null}
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#9A9396]">
            <Link2 className="h-3.5 w-3.5" />
            <span>审核人 {material.reviewerName} · v{material.version}</span>
          </div>
        </div>
        {selected ? <Check className="h-5 w-5 shrink-0 text-[#515BCB]" /> : null}
      </div>
    </label>
  );
}

function EmptyMaterialState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed border-[#E5DED8] bg-white px-5 py-10 text-center text-sm text-[#766F73]">{children}</div>;
}

export function MaterialReferenceDialog({ open, onOpenChange, target, quoteTargetLabel, onApply }: MaterialReferenceDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [quoteReferenceTab, setQuoteReferenceTab] = useState<QuoteReferenceTab>('recommended');
  const [selectedAlbumId, setSelectedAlbumId] = useState(ALL_ALBUMS_ID);
  const config = targetConfig[target];
  const materials = useMemo(() => MOCK_GOLDEN_MATERIALS.filter((material) => material.status === 'active'), []);
  const normalizedProductName = normalizeName(quoteTargetLabel);

  useEffect(() => {
    if (!open) return;
    setSelectedIds([]);
    setQuoteReferenceTab('recommended');
    setSelectedAlbumId(ALL_ALBUMS_ID);
  }, [open, target]);

  const recommendationsBySourceId = useMemo(() => new Map(
    MOCK_MATERIAL_RECOMMENDATIONS.map((recommendation) => [recommendation.mediaAssetId, recommendation]),
  ), []);

  const recommendedMaterials = useMemo(() => {
    const ranked = materials
      .filter((material) => materialTargetKind(material) === 'product')
      .flatMap((material) => {
        const recommendation = material.sourceMediaAssetId ? recommendationsBySourceId.get(material.sourceMediaAssetId) : undefined;
        if (!recommendation) return [];
        const matchesProduct = Boolean(normalizedProductName)
          && (normalizeName(material.targetLabel) === normalizedProductName || normalizeName(recommendation.targetLabel) === normalizedProductName);
        return [{ material, recommendation, matchesProduct }];
      })
      .sort((left, right) => Number(right.matchesProduct) - Number(left.matchesProduct)
        || Number(right.material.type === 'quote') - Number(left.material.type === 'quote')
        || right.recommendation.createdAt.localeCompare(left.recommendation.createdAt)
        || right.material.reviewedAt.localeCompare(left.material.reviewedAt));

    const targetMatches = ranked.filter((item) => item.matchesProduct);
    return targetMatches.length ? targetMatches : ranked;
  }, [materials, normalizedProductName, recommendationsBySourceId]);

  const albumCounts = useMemo(() => {
    const counts = new Map<string, number>();
    materials.forEach((material) => {
      const albumId = material.albumId ?? UNCATEGORIZED_ALBUM_ID;
      counts.set(albumId, (counts.get(albumId) ?? 0) + 1);
    });
    return counts;
  }, [materials]);

  const manualMaterials = useMemo(() => materials.filter((material) => {
    if (selectedAlbumId === ALL_ALBUMS_ID) return true;
    if (selectedAlbumId === UNCATEGORIZED_ALBUM_ID) return !material.albumId;
    return material.albumId === selectedAlbumId;
  }), [materials, selectedAlbumId]);

  const toggleMaterial = (id: string) => {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  };

  const apply = () => {
    const selected = materials.filter((material) => selectedIds.includes(material.id));
    if (!selected.length) return;
    onApply(selected);
    onOpenChange(false);
  };

  const renderMaterialList = (items: MaterialListItem[]) => {
    if (!items.length) return null;
    return (
      <div className="space-y-3">
        {items.map((item) => {
          const { material, recommendation } = item;
          return (
            <div key={material.id}>
              <MaterialOptionCard material={material} selected={selectedIds.includes(material.id)} onToggle={toggleMaterial} recommendation={recommendation} />
            </div>
          );
        })}
      </div>
    );
  };

  const albumFilterClass = (active: boolean) => `inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${active ? 'border-[#515BCB] bg-[#EEF1FF] text-[#515BCB]' : 'border-[#E5DED8] bg-white text-[#766F73] hover:border-[#C9C3C0] hover:text-[#3F3A3D]'}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[86vh] flex-col overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-[#E9E4DF] bg-white px-6 py-5">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF1FF] text-[#515BCB]">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[#242124]">{config.title}</DialogTitle>
              <p className="mt-1 text-xs leading-relaxed text-[#766F73]">{config.description}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#F8F5F3] px-6 py-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-xs font-bold text-[#766F73]">仅展示已审核、当前可用的黄金素材</div>
            <Badge data-i18n-skip="true" variant="outline" className="border-[#D8DEFF] bg-[#EEF1FF] text-[#515BCB]">已选 {selectedIds.length} 条</Badge>
          </div>

          {target === 'quote' ? (
            <Tabs value={quoteReferenceTab} onValueChange={(value) => setQuoteReferenceTab(value as QuoteReferenceTab)} className="gap-0">
              <TabsList variant="line" className="h-10 w-full justify-start gap-1 rounded-none border-b border-[#E9E4DF] p-0">
                <TabsTrigger value="recommended" className="h-10 flex-none rounded-none px-3 text-xs font-bold text-[#766F73] data-active:text-[#515BCB] after:bottom-0 after:bg-[#515BCB]">
                  <Sparkles className="h-3.5 w-3.5" />AI 推荐引用素材
                </TabsTrigger>
                <TabsTrigger value="albums" className="h-10 flex-none rounded-none px-3 text-xs font-bold text-[#766F73] data-active:text-[#515BCB] after:bottom-0 after:bg-[#515BCB]">
                  <Folder className="h-3.5 w-3.5" />从专辑手动选择
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recommended" className="mt-4">
                <div className="mb-4 rounded-lg border border-[#D8DEFF] bg-[#F7F8FF] px-3 py-2 text-xs leading-relaxed text-[#515BCB]">
                  <span className="font-bold">AI 优先排序：</span>{quoteTargetLabel?.trim() ? `优先展示与“${quoteTargetLabel.trim()}”匹配的已审核产品素材。` : '优先展示已审核产品素材。'}
                </div>
                {renderMaterialList(recommendedMaterials)}
                {!recommendedMaterials.length ? <EmptyMaterialState>当前没有可引用的 AI 推荐素材，可切换到“从专辑手动选择”。</EmptyMaterialState> : null}
              </TabsContent>

              <TabsContent value="albums" className="mt-4">
                <div className="mb-4 flex flex-wrap gap-2">
                  <button type="button" aria-pressed={selectedAlbumId === ALL_ALBUMS_ID} onClick={() => setSelectedAlbumId(ALL_ALBUMS_ID)} className={albumFilterClass(selectedAlbumId === ALL_ALBUMS_ID)}>
                    <Folder className="h-3.5 w-3.5" />全部专辑<span className="text-[11px] opacity-70">{materials.length}</span>
                  </button>
                  {MOCK_GOLDEN_ALBUMS.map((album) => (
                    <button key={album.id} type="button" aria-pressed={selectedAlbumId === album.id} onClick={() => setSelectedAlbumId(album.id)} className={albumFilterClass(selectedAlbumId === album.id)}>
                      <Folder className="h-3.5 w-3.5" />{album.name}<span className="text-[11px] opacity-70">{albumCounts.get(album.id) ?? 0}</span>
                    </button>
                  ))}
                  {(albumCounts.get(UNCATEGORIZED_ALBUM_ID) ?? 0) > 0 ? (
                    <button type="button" aria-pressed={selectedAlbumId === UNCATEGORIZED_ALBUM_ID} onClick={() => setSelectedAlbumId(UNCATEGORIZED_ALBUM_ID)} className={albumFilterClass(selectedAlbumId === UNCATEGORIZED_ALBUM_ID)}>
                      <Folder className="h-3.5 w-3.5" />未分类<span className="text-[11px] opacity-70">{albumCounts.get(UNCATEGORIZED_ALBUM_ID)}</span>
                    </button>
                  ) : null}
                </div>
                {renderMaterialList(manualMaterials.map((material) => ({ material })))}
                {!manualMaterials.length ? <EmptyMaterialState>当前专辑暂无可引用素材</EmptyMaterialState> : null}
              </TabsContent>
            </Tabs>
          ) : (
            <>
              {renderMaterialList(materials.map((material) => ({ material })))}
              {!materials.length ? <EmptyMaterialState>当前没有可引用的黄金素材</EmptyMaterialState> : null}
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#E9E4DF] bg-white px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-[#766F73]">
            <Sparkles className="h-4 w-4 text-[#6974E8]" />
            引用后会生成可编辑草稿，并保留证据与版本来源。
          </div>
          <Button disabled={!selectedIds.length} onClick={apply} className="gap-1.5 bg-[#515BCB] text-white hover:bg-[#444DB2]">
            <Clock3 className="h-4 w-4" />
            生成编辑草稿
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

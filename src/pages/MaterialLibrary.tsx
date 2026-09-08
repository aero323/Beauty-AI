import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArchiveX,
  AudioLines,
  BookOpenCheck,
  CheckCircle2,
  CircleOff,
  Eye,
  FileAudio,
  FileVideo,
  Folder,
  FolderInput,
  FolderPlus,
  MapPin,
  Pause,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Video,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import {
  MOCK_ANALYSIS_RUNS,
  MOCK_GOLDEN_ALBUMS,
  MOCK_GOLDEN_MATERIALS,
  MOCK_MATERIAL_RECOMMENDATIONS,
  MOCK_MEDIA_ASSETS,
} from '../lib/materialLibraryData';
import type {
  GoldenAlbum,
  GoldenMaterial,
  MaterialRecommendation,
  MaterialReviewStatus,
  MaterialScope,
  MaterialTargetKind,
  MediaAsset,
  Role,
  SourceEvidence,
} from '../types';

type LibraryView = 'assets' | 'golden' | 'recommendations';
type ReviewSource = { kind: 'asset'; asset: MediaAsset } | { kind: 'recommendation'; recommendation: MaterialRecommendation };

const ALL_PRODUCT_FILTER = '全部产品 / 场景';
const ALL_SOURCE_TASK_FILTER = '全部来源任务';
const ALL_ALBUM_ID = '__all__';
const UNCATEGORIZED_ALBUM_ID = '__uncategorized__';

interface MaterialLibraryProps {
  userRole: Role;
  requestedSubmissionId?: string | null;
  onRequestedAssetOpened?: () => void;
}

const viewMeta: Array<{ id: LibraryView; label: string }> = [
  { id: 'assets', label: '全部采集' },
  { id: 'golden', label: '黄金素材' },
  { id: 'recommendations', label: 'AI候选推荐' },
];

const assetStatusMeta: Record<MediaAsset['status'], { label: string; className: string }> = {
  ready: { label: '分析完成', className: 'border-[#BFDCCF] bg-[#EEF8F4] text-[#3B8F72]' },
  processing: { label: '转写处理中', className: 'border-[#D8DEFF] bg-[#EEF1FF] text-[#515BCB]' },
  needs_attention: { label: '待处理', className: 'border-[#E8CCA0] bg-[#FFF7EA] text-[#8B621F]' },
  deleted: { label: '已删除', className: 'border-red-200 bg-red-50 text-red-600' },
};

const recommendationStatusMeta: Record<MaterialReviewStatus, { label: string; className: string }> = {
  recommended: { label: 'AI 推荐', className: 'border-[#D8DEFF] bg-[#EEF1FF] text-[#515BCB]' },
  approved: { label: '已入黄金素材', className: 'border-[#BFDCCF] bg-[#EEF8F4] text-[#3B8F72]' },
  dismissed: { label: '不再推荐', className: 'border-[#E5DED8] bg-[#F8F5F3] text-[#9A9396]' },
};

const fieldClass = 'w-full rounded-lg border border-[#DED7D2] bg-white px-3 py-2 text-sm text-[#242124] outline-none transition-colors placeholder:text-[#A69EA2] focus:border-[#6974E8] focus:ring-2 focus:ring-[#6974E8]/15';

const videoCoverUrls: Record<string, string> = {
  'asset-ms-101': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=960&q=80',
  'asset-ms-102': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=960&q=80',
  'asset-ms-401': 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=960&q=80',
};

const mockVideoPlaybackUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
const mockAudioPlaybackUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function mediaLabel(kind: MediaAsset['mediaKind']) {
  return kind === 'audio' ? '音频' : '视频';
}

function targetLabel(kind: MaterialTargetKind) {
  return kind === 'product' ? '产品' : '场景';
}

function MaterialKindIcon({ kind, className = 'h-4 w-4' }: { kind: MediaAsset['mediaKind']; className?: string }) {
  return kind === 'audio' ? <FileAudio className={className} /> : <FileVideo className={className} />;
}

function getAssetTranscript(asset: MediaAsset) {
  return asset.transcript?.trim() || '';
}

function displayAssetTranscript(asset: MediaAsset) {
  return getAssetTranscript(asset) || (asset.status === 'processing' ? '转写文本暂未生成，完成后会自动更新。' : '暂无有效转写文本。');
}

function getAssetAnalysis(asset: MediaAsset) {
  return asset.analysisRunId ? MOCK_ANALYSIS_RUNS.find((run) => run.id === asset.analysisRunId) : undefined;
}

function getRecommendationTarget(recommendation: MaterialRecommendation) {
  return `${mediaLabel(recommendation.mediaKind)} · ${targetLabel(recommendation.targetKind)}`;
}

function getAssetTargetKind(asset: MediaAsset): MaterialTargetKind {
  return asset.productOrScenario.includes('抱怨') ? 'scenario' : 'product';
}

function getVideoCoverUrl(asset: MediaAsset) {
  return videoCoverUrls[asset.id] ?? videoCoverUrls['asset-ms-101'];
}

function AudioMiniPlayer({ asset, active, onActiveChange }: { asset: MediaAsset; active: boolean; onActiveChange: (assetId: string | null) => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [sourceCurrentTime, setSourceCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (active) return;
    audioRef.current?.pause();
    setIsPlaying(false);
  }, [active]);

  const displayedCurrentTime = Math.min(sourceCurrentTime, asset.durationSec);
  const progress = (displayedCurrentTime / asset.durationSec) * 100;

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      return;
    }
    onActiveChange(asset.id);
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      onActiveChange(null);
    }
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !isReady) return;
    const nextTime = (value / 100) * asset.durationSec;
    audio.currentTime = nextTime;
    setSourceCurrentTime(nextTime);
  };

  return (
    <div className="w-full shrink-0 rounded-lg border border-[#E5DED8] bg-[#FCFAF8] p-3 sm:w-52 lg:w-56">
      <audio
        ref={audioRef}
        preload="metadata"
        src={mockAudioPlaybackUrl}
        onLoadedMetadata={() => setIsReady(true)}
        onTimeUpdate={(event) => {
          if (event.currentTarget.currentTime >= asset.durationSec) {
            event.currentTarget.pause();
            event.currentTarget.currentTime = 0;
            setSourceCurrentTime(0);
            onActiveChange(null);
            return;
          }
          setSourceCurrentTime(event.currentTarget.currentTime);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => { setSourceCurrentTime(0); onActiveChange(null); }}
        onError={() => { setIsPlaying(false); onActiveChange(null); }}
      />
      <div className="flex items-center gap-3">
        <button type="button" onClick={togglePlayback} aria-label={`${isPlaying ? '暂停' : '播放'} ${asset.productOrScenario} 音频`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#515BCB] text-white transition-colors hover:bg-[#444DB2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#515BCB]">
          {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
        </button>
        <div className="min-w-0 flex-1"><div className="truncate text-xs font-bold text-[#3F3A3D]">音频试听</div><div className="mt-0.5 text-[11px] text-[#9A9396]">{formatTime(Math.round(displayedCurrentTime))} / {formatDuration(asset.durationSec)}</div></div>
      </div>
      <label className="mt-3 block"><span className="sr-only">调整试听进度</span><input type="range" min="0" max="100" step="0.1" value={progress} disabled={!isReady} onChange={(event) => seek(Number(event.target.value))} aria-label={`调整 ${asset.productOrScenario} 音频试听进度`} className="h-1.5 w-full cursor-pointer accent-[#515BCB] disabled:cursor-not-allowed disabled:opacity-45" /></label>
    </div>
  );
}

export function MaterialLibrary({ userRole, requestedSubmissionId, onRequestedAssetOpened }: MaterialLibraryProps) {
  const isRegional = ['Regional Manager', 'Regional Training Manager', 'Regional Trainer'].includes(userRole);
  const canReview = userRole === 'HQ Trainer' || userRole === 'Regional Training Manager';
  const canSuggest = userRole === 'Regional Trainer';
  const [activeView, setActiveView] = useState<LibraryView>('assets');
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('全部地区');
  const [mediaFilter, setMediaFilter] = useState<'全部' | 'audio' | 'video'>('全部');
  const [targetFilter, setTargetFilter] = useState<'全部目标' | MaterialTargetKind>('全部目标');
  const [productFilter, setProductFilter] = useState(ALL_PRODUCT_FILTER);
  const [sourceTaskFilter, setSourceTaskFilter] = useState(ALL_SOURCE_TASK_FILTER);
  const [activeAlbumId, setActiveAlbumId] = useState(ALL_ALBUM_ID);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [videoPreviewAsset, setVideoPreviewAsset] = useState<MediaAsset | null>(null);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<MaterialRecommendation | null>(null);
  const [reviewSource, setReviewSource] = useState<ReviewSource | null>(null);
  const [dismissRecommendation, setDismissRecommendation] = useState<MaterialRecommendation | null>(null);
  const [dismissReason, setDismissReason] = useState('');
  const [reviewForm, setReviewForm] = useState({ title: '', summary: '', scope: '全国共享' as MaterialScope, transcript: '', preserveFull: true, albumId: '' });
  const [recommendationStatuses, setRecommendationStatuses] = useState<Record<string, MaterialReviewStatus>>({});
  const [suggestedIds, setSuggestedIds] = useState<string[]>([]);
  const [promotedAssetIds, setPromotedAssetIds] = useState<string[]>([]);
  const [albums, setAlbums] = useState<GoldenAlbum[]>(MOCK_GOLDEN_ALBUMS);
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [albumForm, setAlbumForm] = useState({ name: '', description: '' });
  const [albumFormError, setAlbumFormError] = useState('');
  const [goldenMaterials, setGoldenMaterials] = useState<GoldenMaterial[]>(MOCK_GOLDEN_MATERIALS);

  useEffect(() => {
    if (!requestedSubmissionId) return;

    const asset = MOCK_MEDIA_ASSETS.find((item) => item.submissionId === requestedSubmissionId);
    setActiveView('assets');
    setSearch('');
    setRegionFilter('全部地区');
    setMediaFilter('全部');
    setTargetFilter('全部目标');
    setProductFilter(ALL_PRODUCT_FILTER);
    setSourceTaskFilter(ALL_SOURCE_TASK_FILTER);
    setSelectedAsset(asset ?? null);
    onRequestedAssetOpened?.();
  }, [onRequestedAssetOpened, requestedSubmissionId]);

  const regions = useMemo(() => Array.from(new Set(MOCK_MEDIA_ASSETS.map((asset) => asset.region))), []);
  const productOptions = useMemo(() => Array.from(new Set(MOCK_MEDIA_ASSETS.map((asset) => asset.productOrScenario))), []);
  const sourceTaskOptions = useMemo(() => Array.from(new Map(MOCK_MEDIA_ASSETS.map((asset) => [asset.taskId, asset.taskTitle])).entries()), []);
  const hasGoldenSource = (assetId: string) => promotedAssetIds.includes(assetId) || goldenMaterials.some((material) => material.sourceMediaAssetId === assetId && material.status === 'active');
  const isGoldenMaterialVisibleToRole = (material: GoldenMaterial) => !isRegional || material.scope === '全国共享' || ['巴厘岛区', '泗水区'].includes(material.region);

  const matchesFilters = (values: { title: string; transcript: string; tags?: string[]; region: string; mediaKind: 'audio' | 'video'; targetKind: MaterialTargetKind }) => {
    const keywords = `${values.title} ${values.transcript} ${(values.tags ?? []).join(' ')}`.toLowerCase();
    return (regionFilter === '全部地区' || values.region === regionFilter)
      && (mediaFilter === '全部' || values.mediaKind === mediaFilter)
      && (targetFilter === '全部目标' || values.targetKind === targetFilter)
      && keywords.includes(search.trim().toLowerCase());
  };

  const matchesAssetFilters = (asset: MediaAsset) => matchesFilters({
    title: `${asset.taskTitle} ${asset.productOrScenario}`,
    transcript: getAssetTranscript(asset),
    tags: asset.tags,
    region: asset.region,
    mediaKind: asset.mediaKind,
    targetKind: getAssetTargetKind(asset),
    })
    && (productFilter === ALL_PRODUCT_FILTER || asset.productOrScenario === productFilter)
    && (sourceTaskFilter === ALL_SOURCE_TASK_FILTER || asset.taskId === sourceTaskFilter);

  const assets = useMemo(() => MOCK_MEDIA_ASSETS.filter((asset) => {
    const inRoleScope = !isRegional || asset.scope === '全国' || ['巴厘岛区', '泗水区'].includes(asset.region);
    return inRoleScope && matchesAssetFilters(asset);
  }), [isRegional, mediaFilter, productFilter, regionFilter, search, sourceTaskFilter, targetFilter]);

  const recommendations = useMemo(() => MOCK_MATERIAL_RECOMMENDATIONS
    .map((recommendation) => ({ ...recommendation, status: recommendationStatuses[recommendation.id] ?? recommendation.status }))
    .filter((recommendation) => {
      const inRoleScope = !isRegional || ['巴厘岛区', '泗水区'].includes(recommendation.region) || recommendation.targetKind === 'product';
      return recommendation.status === 'recommended' && inRoleScope && matchesFilters({
        title: `${recommendation.targetLabel} ${getRecommendationTarget(recommendation)}`,
        transcript: `${recommendation.transcript} ${recommendation.aiSummary}`,
        region: recommendation.region,
        mediaKind: recommendation.mediaKind,
        targetKind: recommendation.targetKind,
      });
    }), [isRegional, mediaFilter, recommendationStatuses, regionFilter, search, targetFilter]);

  const visibleGoldenMaterials = useMemo(() => goldenMaterials.filter((material) => {
    const targetKind = material.targetKind ?? (material.type === 'scenario_beat' ? 'scenario' : 'product');
    const mediaKind = material.mediaKind ?? 'audio';
    const inRoleScope = isGoldenMaterialVisibleToRole(material);
    const inAlbum = activeAlbumId === ALL_ALBUM_ID
      || (activeAlbumId === UNCATEGORIZED_ALBUM_ID ? !material.albumId : material.albumId === activeAlbumId);
    return material.status === 'active' && inRoleScope && inAlbum && matchesFilters({
      title: `${material.title} ${material.targetLabel}`,
      transcript: `${material.transcript ?? material.summary} ${material.aiSummary ?? ''}`,
      tags: material.tags,
      region: material.region,
      mediaKind,
      targetKind,
    });
  }), [activeAlbumId, goldenMaterials, isRegional, mediaFilter, regionFilter, search, targetFilter]);

  const albumCounts = useMemo(() => {
    const counts = new Map<string, number>();
    goldenMaterials.forEach((material) => {
      if (material.status !== 'active' || !isGoldenMaterialVisibleToRole(material)) return;
      const key = material.albumId ?? UNCATEGORIZED_ALBUM_ID;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [goldenMaterials, isRegional]);

  const roleScopedGoldenMaterialCount = useMemo(
    () => goldenMaterials.filter((material) => material.status === 'active' && isGoldenMaterialVisibleToRole(material)).length,
    [goldenMaterials, isRegional],
  );

  const completedTranscriptCount = MOCK_MEDIA_ASSETS.filter((asset) => asset.status === 'ready' && Boolean(getAssetTranscript(asset))).length;

  const openReviewForAsset = (asset: MediaAsset) => {
    if (asset.status !== 'ready' || !getAssetTranscript(asset) || hasGoldenSource(asset.id)) return;
    setReviewSource({ kind: 'asset', asset });
    setReviewForm({
      title: `${asset.productOrScenario} · 精选话术`,
      summary: asset.aiCommentary ?? '请补充这段采集话术值得复用的原因。',
      scope: asset.scope === '区域' ? '区域可用' : '全国共享',
      transcript: getAssetTranscript(asset),
      preserveFull: true,
      albumId: '',
    });
    setSelectedAsset(null);
  };

  const openReviewForRecommendation = (recommendation: MaterialRecommendation) => {
    setReviewSource({ kind: 'recommendation', recommendation });
    setReviewForm({
      title: `${recommendation.targetLabel} · 推荐话术`,
      summary: recommendation.aiSummary,
      scope: recommendation.targetKind === 'scenario' ? '区域可用' : '全国共享',
      transcript: recommendation.transcript,
      preserveFull: false,
      albumId: '',
    });
    setSelectedRecommendation(null);
  };

  const openCreateAlbum = () => {
    setAlbumForm({ name: '', description: '' });
    setAlbumFormError('');
    setAlbumDialogOpen(true);
  };

  const createAlbum = () => {
    const name = albumForm.name.trim();
    if (!name) {
      setAlbumFormError('请输入专辑名称');
      return;
    }
    if (albums.some((album) => album.name.toLowerCase() === name.toLowerCase())) {
      setAlbumFormError('已有同名专辑，请换一个名称');
      return;
    }
    const now = '2026-09-03 11:50';
    const album: GoldenAlbum = {
      id: `album-${Date.now()}`,
      name,
      description: albumForm.description.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
    setAlbums((current) => [...current, album]);
    setActiveAlbumId(album.id);
    if (reviewSource) setReviewForm((current) => ({ ...current, albumId: album.id }));
    setAlbumDialogOpen(false);
    setAlbumForm({ name: '', description: '' });
    setAlbumFormError('');
  };

  const moveMaterialToAlbum = (materialId: string, albumId: string) => {
    setGoldenMaterials((current) => current.map((material) => material.id === materialId ? { ...material, albumId: albumId || undefined } : material));
  };

  const removeMaterialFromGolden = (materialId: string) => {
    const material = goldenMaterials.find((item) => item.id === materialId);
    if (!material || material.status !== 'active') return;

    const sourceStillInUse = material.sourceMediaAssetId
      ? goldenMaterials.some((item) => item.id !== material.id && item.sourceMediaAssetId === material.sourceMediaAssetId && item.status === 'active')
      : false;

    setGoldenMaterials((current) => current.map((item) => item.id === materialId ? { ...item, status: 'retired' } : item));
    if (material.sourceMediaAssetId && !sourceStillInUse) {
      setPromotedAssetIds((current) => current.filter((assetId) => assetId !== material.sourceMediaAssetId));
    }
  };

  const removeAssetFromGolden = (assetId: string) => {
    setGoldenMaterials((current) => current.map((material) => (
      material.sourceMediaAssetId === assetId && material.status === 'active'
        ? { ...material, status: 'retired' }
        : material
    )));
    setPromotedAssetIds((current) => current.filter((promotedAssetId) => promotedAssetId !== assetId));
  };

  const buildEvidence = (source: ReviewSource, transcript: string): SourceEvidence[] => {
    const asset = source.kind === 'asset'
      ? source.asset
      : MOCK_MEDIA_ASSETS.find((item) => item.id === source.recommendation.mediaAssetId);
    const analysis = asset ? getAssetAnalysis(asset) : undefined;
    if (analysis?.segments.length) return [{ ...analysis.segments[0], transcript }];
    return [{ id: `evidence-manual-${Date.now()}`, mediaAssetId: asset?.id ?? source.kind, startSec: 0, endSec: asset?.durationSec ?? 0, transcript }];
  };

  const confirmPromote = () => {
    if (!reviewSource || !reviewForm.title.trim() || !reviewForm.summary.trim() || !reviewForm.transcript.trim() || !reviewForm.albumId) return;
    const sourceAsset = reviewSource.kind === 'asset'
      ? reviewSource.asset
      : MOCK_MEDIA_ASSETS.find((asset) => asset.id === reviewSource.recommendation.mediaAssetId);
    if (!sourceAsset) return;
    const sourceTargetKind: MaterialTargetKind = sourceAsset.productOrScenario.includes('抱怨') ? 'scenario' : 'product';
    const evidence = buildEvidence(reviewSource, reviewForm.transcript.trim());
    const material: GoldenMaterial = {
      id: `gold-manual-${Date.now()}`,
      candidateId: reviewSource.kind === 'recommendation' ? reviewSource.recommendation.id : `manual-${sourceAsset.id}`,
      type: 'sales_method',
      title: reviewForm.title.trim(),
      summary: reviewForm.summary.trim(),
      targetLabel: sourceAsset.productOrScenario,
      region: sourceAsset.region,
      scope: reviewForm.scope,
      tags: sourceAsset.tags,
      evidence,
      reviewerName: userRole === 'HQ Trainer' ? 'Sarah Lee' : 'Fitriani',
      reviewedAt: '2026-09-03 11:45',
      version: 1,
      status: 'active',
      albumId: reviewForm.albumId,
      sourceMediaAssetId: sourceAsset.id,
      transcript: reviewForm.preserveFull ? getAssetTranscript(sourceAsset) : reviewForm.transcript.trim(),
      aiSummary: reviewForm.summary.trim(),
      mediaKind: sourceAsset.mediaKind,
      targetKind: sourceTargetKind,
    };
    setGoldenMaterials((current) => [material, ...current]);
    setPromotedAssetIds((current) => current.includes(sourceAsset.id) ? current : [...current, sourceAsset.id]);
    if (reviewSource.kind === 'recommendation') setRecommendationStatuses((current) => ({ ...current, [reviewSource.recommendation.id]: 'approved' }));
    setReviewSource(null);
    setActiveAlbumId(reviewForm.albumId);
    setActiveView('golden');
  };

  const confirmDismissRecommendation = () => {
    if (!dismissRecommendation) return;
    setRecommendationStatuses((current) => ({ ...current, [dismissRecommendation.id]: 'dismissed' }));
    setDismissRecommendation(null);
    setDismissReason('');
  };

  const requestSuggestion = (recommendation: MaterialRecommendation) => setSuggestedIds((current) => current.includes(recommendation.id) ? current : [...current, recommendation.id]);

  const renderEvidence = (evidence: SourceEvidence | undefined) => evidence ? <div className="mt-3 rounded-lg border border-[#E9E4DF] bg-[#FCFAF8] p-3"><div className="flex items-center gap-2 text-[11px] font-bold text-[#766F73]"><Play className="h-3.5 w-3.5 text-[#515BCB]" />证据片段 {formatTime(evidence.startSec)} - {formatTime(evidence.endSec)}</div><p data-i18n-skip="true" className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#5D565A]">{evidence.transcript}</p></div> : null;

  return (
    <div className="min-h-full space-y-5">
      <header className="rounded-lg border border-[#E5DED8] bg-white px-5 py-5 shadow-sm sm:px-6"><div className="flex flex-wrap items-start justify-between gap-5"><div><div className="flex items-center gap-2 text-[#515BCB]"><BookOpenCheck className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-wider">AI 陪练</span></div><h2 className="mt-2 text-xl font-bold text-[#242124]">素材库</h2><p className="mt-1 text-sm text-[#766F73]">先读转写，再从真实采集中精选可复用的黄金话术。</p></div><div className="grid w-full max-w-[520px] grid-cols-3 divide-x divide-[#E9E4DF] rounded-lg border border-[#E5DED8] bg-[#FCFAF8] sm:min-w-[390px]"><div className="px-3 py-3 sm:px-4"><div className="text-lg font-bold text-[#242124]">{MOCK_MEDIA_ASSETS.length}</div><div className="mt-1 text-[11px] text-[#766F73]">采集记录</div></div><div className="px-3 py-3 sm:px-4"><div className="text-lg font-bold text-[#515BCB]">{completedTranscriptCount}</div><div className="mt-1 text-[11px] text-[#766F73]">已完成转写</div></div><div className="px-3 py-3 sm:px-4"><div className="text-lg font-bold text-[#3B8F72]">{visibleGoldenMaterials.length}</div><div className="mt-1 text-[11px] text-[#766F73]">黄金素材</div></div></div></div></header>

      <section className="overflow-hidden rounded-lg border border-[#E5DED8] bg-white shadow-sm">
        <div className="border-b border-[#E9E4DF] px-5 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              {viewMeta.map((view) => <button key={view.id} onClick={() => setActiveView(view.id)} className={`relative px-3 py-3 text-sm font-bold transition-colors ${activeView === view.id ? 'text-[#515BCB]' : 'text-[#766F73] hover:text-[#3F3A3D]'}`}>{view.label}{activeView === view.id ? <span className="absolute inset-x-3 bottom-0 h-0.5 bg-[#515BCB]" /> : null}</button>)}
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 pb-3 sm:w-auto">
              <div className="relative min-w-[220px] flex-1 sm:flex-none"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9396]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索转写、产品或场景" className="h-8 w-full rounded-lg border border-[#E5DED8] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#6974E8] focus:ring-2 focus:ring-[#EEF1FF] sm:w-52" /></div>
              <select aria-label="按地区筛选" value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)} className="h-8 rounded-lg border border-[#E5DED8] bg-white px-2 text-xs text-[#5D565A] outline-none focus:border-[#6974E8]"><option>全部地区</option>{regions.map((region) => <option key={region}>{region}</option>)}</select>
              <select aria-label="按媒体类型筛选" value={mediaFilter} onChange={(event) => setMediaFilter(event.target.value as typeof mediaFilter)} className="h-8 rounded-lg border border-[#E5DED8] bg-white px-2 text-xs text-[#5D565A] outline-none focus:border-[#6974E8]"><option value="全部">全部媒体</option><option value="video">视频</option><option value="audio">音频</option></select>
              <select aria-label="按目标类型筛选" value={targetFilter} onChange={(event) => setTargetFilter(event.target.value as typeof targetFilter)} className="h-8 rounded-lg border border-[#E5DED8] bg-white px-2 text-xs text-[#5D565A] outline-none focus:border-[#6974E8]"><option value="全部目标">全部目标</option><option value="product">产品</option><option value="scenario">场景</option></select>
            </div>
          </div>
          {activeView === 'assets' ? (
            <div className="flex flex-wrap items-end gap-3 border-t border-[#F0ECE8] py-3">
              <div className="mr-1 flex items-center gap-1.5 self-center text-xs font-bold text-[#5D565A]"><Search className="h-3.5 w-3.5 text-[#515BCB]" />采集分类筛选</div>
              <label className="flex min-w-[190px] flex-1 flex-col gap-1 text-[11px] font-bold text-[#766F73] sm:flex-none"><span>产品 / 场景</span><select aria-label="按产品或场景筛选" value={productFilter} onChange={(event) => setProductFilter(event.target.value)} className="h-8 w-full rounded-lg border border-[#E5DED8] bg-white px-2 text-xs font-normal text-[#5D565A] outline-none focus:border-[#6974E8]"><option>{ALL_PRODUCT_FILTER}</option>{productOptions.map((product) => <option key={product}>{product}</option>)}</select></label>
              <label className="flex min-w-[230px] flex-1 flex-col gap-1 text-[11px] font-bold text-[#766F73] sm:flex-none"><span>来源任务</span><select aria-label="按来源任务筛选" value={sourceTaskFilter} onChange={(event) => setSourceTaskFilter(event.target.value)} className="h-8 w-full rounded-lg border border-[#E5DED8] bg-white px-2 text-xs font-normal text-[#5D565A] outline-none focus:border-[#6974E8]"><option value={ALL_SOURCE_TASK_FILTER}>{ALL_SOURCE_TASK_FILTER}</option>{sourceTaskOptions.map(([taskId, taskTitle]) => <option key={taskId} value={taskId}>{taskTitle}</option>)}</select></label>
              {(productFilter !== ALL_PRODUCT_FILTER || sourceTaskFilter !== ALL_SOURCE_TASK_FILTER) ? <button type="button" onClick={() => { setProductFilter(ALL_PRODUCT_FILTER); setSourceTaskFilter(ALL_SOURCE_TASK_FILTER); }} className="h-8 px-1 text-xs font-bold text-[#515BCB] hover:text-[#3F48B4]">清除分类筛选</button> : null}
            </div>
          ) : null}
        </div>

        <div className="p-5">
          {activeView === 'assets' ? (
            <div className="space-y-3">
              {assets.map((asset) => {
                const golden = hasGoldenSource(asset.id);
                const assetTargetKind = getAssetTargetKind(asset);
                const isVideo = asset.mediaKind === 'video';

                return (
                  <article key={asset.id} className="rounded-lg border border-[#E5DED8] bg-white p-4 transition-colors hover:border-[#C9C3C0] sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                      {isVideo ? (
                        <button
                          type="button"
                          onClick={() => setVideoPreviewAsset(asset)}
                          aria-label={`播放 ${asset.productOrScenario} 视频`}
                          className="group relative aspect-video w-full shrink-0 overflow-hidden rounded-lg border border-[#E5DED8] bg-[#F8F5F3] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#515BCB] sm:w-52 lg:w-56"
                        >
                          <img src={getVideoCoverUrl(asset)} alt={`${asset.productOrScenario} 视频封面`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                          <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
                          <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[11px] font-bold text-white">{formatDuration(asset.durationSec)}</span>
                          <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#515BCB] shadow-sm transition-transform group-hover:scale-105"><Play className="ml-0.5 h-5 w-5 fill-current" /></span>
                        </button>
                      ) : (
                        <AudioMiniPlayer asset={asset} active={activeAudioId === asset.id} onActiveChange={setActiveAudioId} />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-[#766F73]">{mediaLabel(asset.mediaKind)} · {formatDuration(asset.durationSec)}</span>
                          <Badge variant="outline" className={assetStatusMeta[asset.status].className}>{assetStatusMeta[asset.status].label}</Badge>
                          {golden ? <Badge variant="outline" className="border-[#BFDCCF] bg-[#EEF8F4] text-[#3B8F72]">已加入黄金素材</Badge> : null}
                        </div>

                        <>
                          <div className="mt-3 grid gap-3 border-y border-[#F0ECE8] py-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="min-w-0"><div className="text-[11px] font-bold text-[#9A9396]">{targetLabel(assetTargetKind)}</div><div className="mt-1 truncate text-sm font-bold text-[#242124]" title={asset.productOrScenario}>{asset.productOrScenario}</div></div>
                            <div className="min-w-0"><div className="text-[11px] font-bold text-[#9A9396]">提交人</div><div className="mt-1 truncate text-sm font-bold text-[#242124]">{asset.submitterName}</div></div>
                            <div className="min-w-0"><div className="text-[11px] font-bold text-[#9A9396]">地区</div><div className="mt-1 flex items-center gap-1 truncate text-sm font-bold text-[#242124]"><MapPin className="h-3.5 w-3.5 shrink-0 text-[#9A9396]" />{asset.region}</div></div>
                            <div className="min-w-0"><div className="text-[11px] font-bold text-[#9A9396]">来源任务</div><div className="mt-1 truncate text-sm font-bold text-[#242124]" title={asset.taskTitle}>{asset.taskTitle}</div></div>
                          </div>
                          <p data-i18n-skip="true" className="mt-3 line-clamp-2 text-sm leading-6 text-[#5D565A]"><span className="mr-2 font-bold text-[#766F73]">高光转写</span>{displayAssetTranscript(asset)}</p>
                        </>
                      </div>

                      <div className="flex shrink-0 items-center justify-end gap-2 lg:w-[180px] lg:flex-col lg:items-stretch">
                        <Button variant="outline" size="sm" onClick={() => setSelectedAsset(asset)} className="h-8 gap-1.5 border-[#E5DED8] text-[#5D565A] hover:bg-[#F8F5F3]"><Eye className="h-4 w-4" />查看详情</Button>
                        {golden ? (
                          <>
                            <Button variant="outline" size="sm" disabled className="h-8 gap-1.5 border-[#BFDCCF] bg-[#EEF8F4] text-[#3B8F72] disabled:cursor-default disabled:opacity-100"><ShieldCheck className="h-4 w-4" />已加入黄金素材</Button>
                            {canReview ? <Button variant="outline" size="sm" onClick={() => removeAssetFromGolden(asset.id)} className="h-8 gap-1.5 border-[#F1CFCA] text-[#B75147] hover:bg-[#FFF4F2] hover:text-[#A8443A]"><ArchiveX className="h-4 w-4" />从黄金素材移出</Button> : null}
                          </>
                        ) : (
                          <Button variant="outline" size="sm" disabled={!canReview || asset.status !== 'ready'} onClick={() => openReviewForAsset(asset)} className="h-8 gap-1.5 border-[#D8DEFF] text-[#515BCB] hover:bg-[#EEF1FF] disabled:cursor-not-allowed disabled:opacity-45"><ShieldCheck className="h-4 w-4" />{canReview ? '加入黄金素材' : canSuggest ? '建议入库' : '无操作权限'}</Button>
                        )}
                        {canSuggest && !golden ? <button onClick={() => setSuggestedIds((current) => current.includes(asset.id) ? current : [...current, asset.id])} className="text-right text-[11px] font-bold text-[#515BCB] hover:text-[#3F48B4] lg:text-center">{suggestedIds.includes(asset.id) ? '已提交建议' : '提交精选建议'}</button> : null}
                      </div>
                    </div>
                  </article>
                );
              })}
              {!assets.length ? <div className="rounded-lg border border-dashed border-[#E5DED8] px-5 py-12 text-center text-sm text-[#766F73]">没有符合条件的采集记录</div> : null}
            </div>
          ) : null}

          {activeView === 'golden' ? (
            <div>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#242124]">已精选黄金素材</h3>
                  <p className="mt-1 text-xs text-[#766F73]">由培训人员确认可复用，引用时只带入脱敏转写和来源版本。</p>
                </div>
                <div className="flex items-center gap-2">
                  {canReview ? (
                    <Button variant="outline" size="sm" onClick={openCreateAlbum} className="h-8 gap-1.5 border-[#D8DEFF] text-[#515BCB] hover:bg-[#EEF1FF]">
                      <FolderPlus className="h-4 w-4" />新建专辑
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="mb-5 overflow-x-auto border-b border-[#E9E4DF]">
                <div className="flex min-w-max items-center gap-2 pb-3">
                  <button
                    type="button"
                    aria-pressed={activeAlbumId === ALL_ALBUM_ID}
                    onClick={() => setActiveAlbumId(ALL_ALBUM_ID)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${activeAlbumId === ALL_ALBUM_ID ? 'border-[#515BCB] bg-[#EEF1FF] text-[#515BCB]' : 'border-[#E5DED8] bg-white text-[#766F73] hover:border-[#C9C3C0] hover:text-[#3F3A3D]'}`}
                  >
                    <Folder className="h-3.5 w-3.5" />全部专辑<span className="ml-0.5 text-[11px] opacity-70">{roleScopedGoldenMaterialCount}</span>
                  </button>
                  {albums.map((album) => (
                    <button
                      key={album.id}
                      type="button"
                      aria-pressed={activeAlbumId === album.id}
                      title={album.description}
                      onClick={() => setActiveAlbumId(album.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${activeAlbumId === album.id ? 'border-[#515BCB] bg-[#EEF1FF] text-[#515BCB]' : 'border-[#E5DED8] bg-white text-[#766F73] hover:border-[#C9C3C0] hover:text-[#3F3A3D]'}`}
                    >
                      <Folder className="h-3.5 w-3.5" />{album.name}<span className="ml-0.5 text-[11px] opacity-70">{albumCounts.get(album.id) ?? 0}</span>
                    </button>
                  ))}
                  {albumCounts.has(UNCATEGORIZED_ALBUM_ID) ? (
                    <button
                      type="button"
                      aria-pressed={activeAlbumId === UNCATEGORIZED_ALBUM_ID}
                      onClick={() => setActiveAlbumId(UNCATEGORIZED_ALBUM_ID)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${activeAlbumId === UNCATEGORIZED_ALBUM_ID ? 'border-[#515BCB] bg-[#EEF1FF] text-[#515BCB]' : 'border-[#E5DED8] bg-white text-[#766F73] hover:border-[#C9C3C0] hover:text-[#3F3A3D]'}`}
                    >
                      <Folder className="h-3.5 w-3.5" />未分类<span className="ml-0.5 text-[11px] opacity-70">{albumCounts.get(UNCATEGORIZED_ALBUM_ID) ?? 0}</span>
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                {visibleGoldenMaterials.map((material) => (
                  <article key={material.id} className="rounded-lg border border-[#E5DED8] bg-white p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="border-[#BFDCCF] bg-[#EEF8F4] text-[#3B8F72]">已审核</Badge>
                          <span className="text-xs text-[#766F73]">来源：{mediaLabel(material.mediaKind ?? 'audio')} · {targetLabel(material.targetKind ?? 'product')} · {material.targetLabel}</span>
                        </div>
                        <p data-i18n-skip="true" className="mt-3 text-sm font-medium leading-7 text-[#242124]">{material.transcript ?? material.summary}</p>
                        <div className="mt-3 rounded-md bg-[#F8F5F3] px-3 py-2 text-xs leading-relaxed text-[#5D565A]"><span className="font-bold text-[#766F73]">AI 总结：</span>{material.aiSummary ?? material.summary}</div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#766F73]"><span><MapPin className="mr-1 inline h-3.5 w-3.5 text-[#9A9396]" />{material.region}</span><span>范围：{material.scope}</span><span>审核人：{material.reviewerName}</span></div>
                      </div>
                      <div className="flex shrink-0 items-center justify-end gap-2 lg:w-[180px] lg:flex-col lg:items-stretch">
                        <Button variant="outline" size="sm" onClick={() => { const source = material.sourceMediaAssetId ? MOCK_MEDIA_ASSETS.find((asset) => asset.id === material.sourceMediaAssetId) : null; if (source) setSelectedAsset(source); }} className="h-8 gap-1.5 border-[#E5DED8] text-[#5D565A] hover:bg-[#F8F5F3]"><Eye className="h-4 w-4" />查看详情</Button>
                        {canReview ? (
                          <div className="flex items-center justify-end gap-1.5 lg:w-full">
                            <DropdownMenu>
                              <DropdownMenuTrigger aria-label={`移动 ${material.title} 到专辑`} title="移动到专辑" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5DED8] bg-white text-[#5D565A] transition-colors hover:bg-[#F8F5F3] hover:text-[#3F3A3D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#515BCB]">
                                <FolderInput className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52 border border-[#E5DED8] bg-white text-[#5D565A]">
                                <DropdownMenuGroup>
                                  <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-bold text-[#766F73]">移动到专辑</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => moveMaterialToAlbum(material.id, '')} className={!material.albumId ? 'bg-[#EEF1FF] text-[#515BCB]' : ''}>
                                    <Folder className="h-3.5 w-3.5" />未分类
                                    {!material.albumId ? <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-[#515BCB]" /> : null}
                                  </DropdownMenuItem>
                                  {albums.map((album) => (
                                    <DropdownMenuItem key={album.id} onClick={() => moveMaterialToAlbum(material.id, album.id)} className={material.albumId === album.id ? 'bg-[#EEF1FF] text-[#515BCB]' : ''}>
                                      <Folder className="h-3.5 w-3.5" />{album.name}
                                      {material.albumId === album.id ? <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-[#515BCB]" /> : null}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="outline" size="icon-sm" aria-label={`移出 ${material.title} 黄金素材`} title="移出黄金素材" onClick={() => removeMaterialFromGolden(material.id)} className="h-8 w-8 border-[#F1CFCA] text-[#B75147] hover:bg-[#FFF4F2] hover:text-[#A8443A]">
                              <ArchiveX className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : null}
                        <span className="text-right text-[11px] text-[#9A9396] lg:text-center">已被 {material.type === 'quote' ? 3 : 2} 个陪练资产引用</span>
                      </div>
                    </div>
                  </article>
                ))}
                {!visibleGoldenMaterials.length ? <div className="rounded-lg border border-dashed border-[#E5DED8] px-5 py-12 text-center text-sm text-[#766F73]">暂时没有符合条件的黄金素材</div> : null}
              </div>

            </div>
          ) : null}

          {activeView === 'recommendations' ? (
            <div>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[#E9E4DF] pb-4">
                <div><h3 className="flex items-center gap-2 text-base font-bold text-[#242124]"><Sparkles className="h-4 w-4 text-[#6974E8]" />AI候选推荐</h3><p className="mt-1 text-xs text-[#766F73]">AI 只负责发现和总结，是否进入黄金素材由人确认。</p></div>
                <Badge variant="outline" className="border-[#D8DEFF] bg-[#EEF1FF] text-[#515BCB]">{recommendations.length} 条待确认</Badge>
              </div>
              <div className="space-y-3">
                {recommendations.map((recommendation) => (
                  <article key={recommendation.id} className="rounded-lg border border-[#D8DEFF] bg-[#F9FAFF] p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2"><Badge variant="outline" className={recommendationStatusMeta.recommended.className}>AI 推荐</Badge><span className="text-xs text-[#766F73]">来源：{getRecommendationTarget(recommendation)} · {recommendation.targetLabel}</span></div>
                        <p data-i18n-skip="true" className="mt-3 text-sm font-medium leading-7 text-[#242124]">{recommendation.transcript}</p>
                        <div className="mt-3 rounded-md border border-[#D8DEFF] bg-white px-3 py-2 text-xs leading-relaxed text-[#515BCB]"><span className="font-bold">AI 总结：</span>{recommendation.aiSummary}</div>
                        <div className="mt-3 rounded-md bg-[#EEF1FF] px-3 py-2 text-xs leading-relaxed text-[#515BCB]"><span className="font-bold">AI 推荐理由：</span>{recommendation.recommendationReason}</div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#766F73]"><span><MapPin className="mr-1 inline h-3.5 w-3.5 text-[#9A9396]" />{recommendation.region}</span><span>推荐时间：{recommendation.createdAt}</span></div>
                      </div>
                      <div className="flex shrink-0 items-center justify-end gap-2 lg:w-[180px] lg:flex-col lg:items-stretch">
                        <Button variant="outline" size="sm" onClick={() => setSelectedRecommendation(recommendation)} className="h-8 gap-1.5 border-[#D8DEFF] text-[#515BCB] hover:bg-white"><Eye className="h-4 w-4" />查看详情</Button>
                        {canReview ? <Button size="sm" onClick={() => openReviewForRecommendation(recommendation)} className="h-8 gap-1.5 bg-[#515BCB] text-white hover:bg-[#444DB2]"><ShieldCheck className="h-4 w-4" />进入黄金素材</Button> : canSuggest ? <Button variant="outline" size="sm" onClick={() => requestSuggestion(recommendation)} className="h-8 gap-1.5 border-[#D8DEFF] text-[#515BCB] hover:bg-white"><ShieldCheck className="h-4 w-4" />{suggestedIds.includes(recommendation.id) ? '已提交建议' : '建议入库'}</Button> : null}
                        <Button variant="ghost" size="sm" onClick={() => setDismissRecommendation(recommendation)} className="h-8 gap-1.5 text-[#766F73] hover:bg-white hover:text-[#5D565A]"><CircleOff className="h-4 w-4" />不再推荐</Button>
                      </div>
                    </div>
                  </article>
                ))}
                {!recommendations.length ? <div className="rounded-lg border border-dashed border-[#D8DEFF] bg-[#F9FAFF] px-5 py-10 text-center text-sm text-[#766F73]">当前没有待确认的 AI 候选推荐</div> : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <Dialog open={Boolean(videoPreviewAsset)} onOpenChange={(open) => !open && setVideoPreviewAsset(null)}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-4xl">
          {videoPreviewAsset ? (
            <div>
              <DialogHeader className="border-b border-[#E9E4DF] px-5 py-4 pr-12">
                <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#242124]"><Video className="h-5 w-5 text-[#515BCB]" />原始视频预览</DialogTitle>
              </DialogHeader>
              <div className="bg-[#171518] p-4 sm:p-5">
                <video
                  key={videoPreviewAsset.id}
                  controls
                  autoPlay
                  playsInline
                  poster={getVideoCoverUrl(videoPreviewAsset)}
                  className="aspect-video w-full rounded-md bg-black object-contain"
                >
                  <source src={mockVideoPlaybackUrl} type="video/mp4" />
                  当前浏览器不支持视频播放。
                </video>
              </div>
              <div className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-3">
                <div><div className="text-[11px] font-bold text-[#9A9396]">{targetLabel(getAssetTargetKind(videoPreviewAsset))}</div><div className="mt-1 font-bold text-[#242124]">{videoPreviewAsset.productOrScenario}</div></div>
                <div><div className="text-[11px] font-bold text-[#9A9396]">提交人</div><div className="mt-1 font-bold text-[#242124]">{videoPreviewAsset.submitterName}</div></div>
                <div><div className="text-[11px] font-bold text-[#9A9396]">地区</div><div className="mt-1 flex items-center gap-1 font-bold text-[#242124]"><MapPin className="h-3.5 w-3.5 text-[#9A9396]" />{videoPreviewAsset.region}</div></div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedAsset)} onOpenChange={(open) => !open && setSelectedAsset(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader className="border-b border-[#E9E4DF] pb-4 pr-8">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#242124]"><MaterialKindIcon kind={selectedAsset?.mediaKind ?? 'video'} className="h-5 w-5 text-[#515BCB]" />采集转写详情</DialogTitle>
          </DialogHeader>
          {selectedAsset ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-[#F8F5F3] p-3"><div className="text-[11px] text-[#766F73]">媒体来源</div><div className="mt-1 text-sm font-bold text-[#242124]">{mediaLabel(selectedAsset.mediaKind)} · {selectedAsset.fileName}</div><div className="mt-1 text-xs text-[#766F73]">时长 {formatDuration(selectedAsset.durationSec)}</div></div>
                <div className="rounded-lg bg-[#F8F5F3] p-3"><div className="text-[11px] text-[#766F73]">采集目标</div><div className="mt-1 text-sm font-bold text-[#242124]">{selectedAsset.productOrScenario}</div><div className="mt-1 text-xs text-[#766F73]">{selectedAsset.region} · {selectedAsset.submittedAt}</div></div>
                <div className="rounded-lg bg-[#F8F5F3] p-3"><div className="text-[11px] text-[#766F73]">处理状态</div><div className="mt-1"><Badge variant="outline" className={assetStatusMeta[selectedAsset.status].className}>{assetStatusMeta[selectedAsset.status].label}</Badge></div></div>
              </div>
              <div className="rounded-lg border border-[#E5DED8] bg-[#171518] p-4 text-white"><div className="flex items-center justify-between gap-3"><div><div className="text-sm font-bold">原始{mediaLabel(selectedAsset.mediaKind)}</div><div className="mt-1 text-xs text-white/60">仅对有权限的审核人员开放播放</div></div><Button size="sm" variant="outline" onClick={() => selectedAsset.mediaKind === 'video' && setVideoPreviewAsset(selectedAsset)} disabled={selectedAsset.mediaKind !== 'video'} className="border-white/20 bg-white/10 text-white hover:bg-white/15 disabled:opacity-45"><Play className="mr-1.5 h-4 w-4" />播放原始媒体</Button></div><div className="mt-4 flex h-20 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-xs text-white/50">{selectedAsset.mediaKind === 'video' ? <Video className="mr-2 h-5 w-5" /> : <AudioLines className="mr-2 h-5 w-5" />}{selectedAsset.fileName}</div></div>
              <section><div className="flex items-center gap-2 text-sm font-bold text-[#242124]"><AudioLines className="h-4 w-4 text-[#515BCB]" />完整转写文本</div><div data-i18n-skip="true" className="mt-3 whitespace-pre-line rounded-lg border border-[#E9E4DF] bg-[#FCFAF8] p-4 text-sm leading-7 text-[#5D565A]">{displayAssetTranscript(selectedAsset)}</div></section>
              {getAssetAnalysis(selectedAsset) || selectedAsset.aiCommentary ? <section className="rounded-lg border border-[#D8DEFF] bg-[#EEF1FF] p-4"><div className="flex items-center gap-2 text-sm font-bold text-[#515BCB]"><Sparkles className="h-4 w-4" />AI 点评</div><p className="mt-2 text-sm leading-relaxed text-[#515BCB]">{getAssetAnalysis(selectedAsset)?.aiCommentary ?? selectedAsset.aiCommentary}</p></section> : null}
              <section><div className="text-sm font-bold text-[#242124]">提取洞察</div><div className="mt-3 space-y-2">{(getAssetAnalysis(selectedAsset)?.insights ?? selectedAsset.insights ?? []).map((insight) => <div key={insight} className="flex gap-2 rounded-lg border border-[#E9E4DF] bg-white p-3 text-sm text-[#5D565A]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3B8F72]" />{insight}</div>)}{!(getAssetAnalysis(selectedAsset)?.insights ?? selectedAsset.insights ?? []).length ? <div className="rounded-lg border border-dashed border-[#E5DED8] p-3 text-sm text-[#766F73]">分析完成后会在这里显示洞察。</div> : null}</div></section>
              {getAssetAnalysis(selectedAsset)?.segments.map((segment) => <div key={segment.id}>{renderEvidence(segment)}</div>)}
              <div className="flex flex-wrap justify-end gap-2 border-t border-[#E9E4DF] pt-4">
                <Button variant="outline" onClick={() => setSelectedAsset(null)}>关闭</Button>
                {hasGoldenSource(selectedAsset.id) ? (
                  <>
                    <Button disabled className="gap-1.5 border-[#BFDCCF] bg-[#EEF8F4] text-[#3B8F72] disabled:cursor-default disabled:opacity-100"><ShieldCheck className="h-4 w-4" />已加入黄金素材</Button>
                    {canReview ? <Button variant="outline" onClick={() => removeAssetFromGolden(selectedAsset.id)} className="gap-1.5 border-[#F1CFCA] text-[#B75147] hover:bg-[#FFF4F2] hover:text-[#A8443A]"><ArchiveX className="h-4 w-4" />从黄金素材移出</Button> : null}
                  </>
                ) : (
                  <Button disabled={!canReview || selectedAsset.status !== 'ready'} onClick={() => openReviewForAsset(selectedAsset)} className="gap-1.5 bg-[#515BCB] text-white hover:bg-[#444DB2] disabled:opacity-45"><ShieldCheck className="h-4 w-4" />{canReview ? '加入黄金素材' : canSuggest ? '建议入库' : '无操作权限'}</Button>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedRecommendation)} onOpenChange={(open) => !open && setSelectedRecommendation(null)}><DialogContent className="max-h-[86vh] overflow-y-auto sm:max-w-2xl"><DialogHeader className="border-b border-[#E9E4DF] pb-4 pr-8"><DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#242124]"><Sparkles className="h-5 w-5 text-[#6974E8]" />AI 推荐素材详情</DialogTitle></DialogHeader>{selectedRecommendation ? <div className="space-y-5"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline" className={recommendationStatusMeta.recommended.className}>AI 推荐</Badge><span className="text-xs text-[#766F73]">来源：{getRecommendationTarget(selectedRecommendation)} · {selectedRecommendation.targetLabel}</span></div><section><div className="text-sm font-bold text-[#242124]">推荐素材话术</div><p data-i18n-skip="true" className="mt-3 rounded-lg border border-[#E9E4DF] bg-[#FCFAF8] p-4 text-sm leading-7 text-[#3F3A3D]">{selectedRecommendation.transcript}</p></section><section className="rounded-lg border border-[#D8DEFF] bg-[#EEF1FF] p-4"><div className="text-sm font-bold text-[#515BCB]">AI 总结</div><p className="mt-2 text-sm leading-relaxed text-[#515BCB]">{selectedRecommendation.aiSummary}</p></section><section><div className="text-sm font-bold text-[#242124]">AI 推荐理由</div><p className="mt-2 text-sm leading-relaxed text-[#5D565A]">{selectedRecommendation.recommendationReason}</p></section><div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#766F73]"><span><MapPin className="mr-1 inline h-3.5 w-3.5 text-[#9A9396]" />{selectedRecommendation.region}</span><span>推荐时间：{selectedRecommendation.createdAt}</span></div><div className="flex justify-end gap-2 border-t border-[#E9E4DF] pt-4"><Button variant="outline" onClick={() => setSelectedRecommendation(null)}>关闭</Button>{canReview ? <Button onClick={() => openReviewForRecommendation(selectedRecommendation)} className="gap-1.5 bg-[#515BCB] text-white hover:bg-[#444DB2]"><ShieldCheck className="h-4 w-4" />进入黄金素材</Button> : null}<Button variant="outline" onClick={() => { setDismissRecommendation(selectedRecommendation); setSelectedRecommendation(null); }} className="gap-1.5 border-[#E5DED8] text-[#5D565A] hover:bg-[#F8F5F3]"><CircleOff className="h-4 w-4" />不再推荐</Button></div></div> : null}</DialogContent></Dialog>

      <Dialog open={Boolean(reviewSource)} onOpenChange={(open) => !open && setReviewSource(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader className="border-b border-[#E9E4DF] pb-4 pr-8">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#242124]"><ShieldCheck className="h-5 w-5 text-[#515BCB]" />确认进入黄金素材</DialogTitle>
          </DialogHeader>
          {reviewSource ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#E9E4DF] bg-[#FCFAF8] p-3 text-xs leading-relaxed text-[#766F73]">人工确认后，这条转写会进入黄金素材，并可被数字人顾客、场景剧本和金句库引用。</div>
              <label className="block"><span className="mb-1.5 block text-xs font-bold text-[#766F73]">黄金素材标题</span><input value={reviewForm.title} onChange={(event) => setReviewForm((current) => ({ ...current, title: event.target.value }))} className={fieldClass} /></label>
              <label className="block"><span className="mb-1.5 block text-xs font-bold text-[#766F73]">AI 总结 / 人工摘要</span><textarea value={reviewForm.summary} onChange={(event) => setReviewForm((current) => ({ ...current, summary: event.target.value }))} rows={3} className={`${fieldClass} resize-none`} /></label>
              <label className="block"><span className="mb-1.5 block text-xs font-bold text-[#766F73]">纳入黄金素材的话术</span><textarea value={reviewForm.transcript} onChange={(event) => setReviewForm((current) => ({ ...current, transcript: event.target.value }))} rows={5} className={`${fieldClass} resize-none leading-relaxed`} /><span className="mt-1 block text-[11px] text-[#9A9396]">可直接保留完整转写，也可以编辑为更短的精选片段。</span></label>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <label className="block"><span className="mb-1.5 block text-xs font-bold text-[#766F73]">归入专辑</span><select aria-label="选择黄金素材专辑" value={reviewForm.albumId} onChange={(event) => setReviewForm((current) => ({ ...current, albumId: event.target.value }))} className={fieldClass}><option value="">选择专辑</option>{albums.map((album) => <option key={album.id} value={album.id}>{album.name}</option>)}</select></label>
                <Button type="button" variant="outline" onClick={openCreateAlbum} className="h-9 gap-1.5 border-[#D8DEFF] text-[#515BCB] hover:bg-[#EEF1FF]"><FolderPlus className="h-4 w-4" />新建专辑</Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-xs font-bold text-[#766F73]">发布范围</span><select value={reviewForm.scope} onChange={(event) => setReviewForm((current) => ({ ...current, scope: event.target.value as MaterialScope }))} className={fieldClass}><option value="全国共享">全国共享</option><option value="区域可用">仅本区域可用</option></select></label><label className="flex items-center gap-2 pt-6 text-xs font-medium text-[#5D565A]"><input type="checkbox" checked={reviewForm.preserveFull} onChange={(event) => setReviewForm((current) => ({ ...current, preserveFull: event.target.checked }))} className="h-4 w-4 accent-[#515BCB]" />保留完整转写快照</label></div>
              <div className="flex justify-end gap-2 border-t border-[#E9E4DF] pt-4"><Button variant="outline" onClick={() => setReviewSource(null)}>取消</Button><Button disabled={!reviewForm.title.trim() || !reviewForm.summary.trim() || !reviewForm.transcript.trim() || !reviewForm.albumId} onClick={confirmPromote} className="bg-[#515BCB] text-white hover:bg-[#444DB2]">确认进入黄金素材</Button></div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={albumDialogOpen}
        onOpenChange={(open) => {
          setAlbumDialogOpen(open);
          if (!open) {
            setAlbumForm({ name: '', description: '' });
            setAlbumFormError('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="border-b border-[#E9E4DF] pb-4 pr-8">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#242124]"><FolderPlus className="h-5 w-5 text-[#515BCB]" />新建专辑</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-[#766F73]">专辑名称</span>
              <input required autoFocus value={albumForm.name} onChange={(event) => { setAlbumForm((current) => ({ ...current, name: event.target.value })); setAlbumFormError(''); }} placeholder="例如：高频异议处理" className={fieldClass} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-[#766F73]">专辑说明 <span className="font-normal text-[#9A9396]">（选填）</span></span>
              <textarea value={albumForm.description} onChange={(event) => setAlbumForm((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="说明这组素材适合什么场景或产品" className={`${fieldClass} resize-none`} />
            </label>
            {albumFormError ? <p role="alert" className="text-xs font-medium text-[#B34D4D]">{albumFormError}</p> : null}
            <div className="flex justify-end gap-2 border-t border-[#E9E4DF] pt-4">
              <Button variant="outline" onClick={() => setAlbumDialogOpen(false)}>取消</Button>
              <Button onClick={createAlbum} className="gap-1.5 bg-[#515BCB] text-white hover:bg-[#444DB2]"><FolderPlus className="h-4 w-4" />创建专辑</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(dismissRecommendation)} onOpenChange={(open) => !open && setDismissRecommendation(null)}><DialogContent className="sm:max-w-md"><DialogHeader className="border-b border-[#E9E4DF] pb-4 pr-8"><DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#3F3A3D]"><CircleOff className="h-5 w-5 text-[#766F73]" />不再推荐</DialogTitle></DialogHeader>{dismissRecommendation ? <div className="space-y-4"><p className="text-sm leading-relaxed text-[#5D565A]">这条 AI 推荐会从推荐列表移除，但原始采集和转写仍会保留在“全部采集”。</p><label className="block"><span className="mb-1.5 block text-xs font-bold text-[#766F73]">备注原因（选填）</span><textarea value={dismissReason} onChange={(event) => setDismissReason(event.target.value)} rows={3} placeholder="例如：表达不完整、场景不具备复用性" className={`${fieldClass} resize-none`} /></label><div className="flex justify-end gap-2 border-t border-[#E9E4DF] pt-4"><Button variant="outline" onClick={() => setDismissRecommendation(null)}>取消</Button><Button onClick={confirmDismissRecommendation} className="bg-[#5D565A] text-white hover:bg-[#3F3A3D]">确认不再推荐</Button></div></div> : null}</DialogContent></Dialog>
    </div>
  );
}

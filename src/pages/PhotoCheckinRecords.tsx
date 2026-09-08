import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  Eye,
  ImageOff,
  MapPin,
  Plus,
  RefreshCcw,
  Search,
  Settings2,
  Store,
  Users,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import type { PhotoCheckinPhoto, PhotoCheckinRecord, PhotoCheckinStatus, Role } from '../types';

type BaProfile = {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
  storeId: string;
  storeName: string;
};

type CheckinRow = {
  profile: BaProfile;
  record?: PhotoCheckinRecord;
};

type CheckinPhotoRequirement = {
  id: string;
  name: string;
  description: string;
  count: number;
  prompt: string;
};

const DEFAULT_PHOTO_REQUIREMENTS: CheckinPhotoRequirement[] = [
  { id: 'makeup', name: '妆容照', description: '正面妆容与当日形象', count: 1, prompt: '评估妆容是否完整、整洁、符合品牌形象，光线是否充足，画面是否清晰。' },
  { id: 'counter', name: '柜台出样照', description: '柜台陈列与台面状态', count: 1, prompt: '评估柜台陈列是否完整、整洁，产品是否按规范出样，画面是否能清楚呈现整体状态。' },
];

const fieldClass = 'w-full rounded-lg border border-[#DED7D2] bg-white px-3 py-2 text-sm text-[#242124] outline-none transition-colors placeholder:text-[#A69EA2] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15';

const BA_ROSTER: BaProfile[] = [
  { id: 'BA001', name: 'Siti Aminah', regionId: 'jakarta-south', regionName: '雅加达南区', storeId: 'store-senayan', storeName: 'Jakarta Grand Indonesia' },
  { id: 'BA002', name: 'Budi Santoso', regionId: 'jakarta-south', regionName: '雅加达南区', storeId: 'store-pacific', storeName: 'Jakarta Plaza Senayan' },
  { id: 'BA003', name: 'Ayu Lestari', regionId: 'jakarta-south', regionName: '雅加达南区', storeId: 'store-gandaria', storeName: 'Jakarta Gandaria City' },
  { id: 'BA004', name: 'Dewi Sartika', regionId: 'surabaya', regionName: '泗水区', storeId: 'store-tunjungan', storeName: 'Surabaya Tunjungan Plaza' },
  { id: 'BA005', name: 'Putri Maharani', regionId: 'bali', regionName: '巴厘岛区', storeId: 'store-beachwalk', storeName: 'Bali Beachwalk' },
  { id: 'BA006', name: 'Maya Putri', regionId: 'jakarta-south', regionName: '雅加达南区', storeId: 'store-senayan', storeName: 'Jakarta Grand Indonesia' },
  { id: 'BA007', name: 'Rina Wijaya', regionId: 'jakarta-south', regionName: '雅加达南区', storeId: 'store-pacific', storeName: 'Jakarta Plaza Senayan' },
  { id: 'BA008', name: 'Lia Kartika', regionId: 'jakarta-north', regionName: '雅加达北区', storeId: 'store-kelapa', storeName: 'Jakarta Kelapa Gading' },
  { id: 'BA009', name: 'Nadia Sari', regionId: 'bandung', regionName: '万隆区', storeId: 'store-trans', storeName: 'Bandung Trans Studio' },
  { id: 'BA010', name: 'Dimas Pratama', regionId: 'medan', regionName: '棉兰区', storeId: 'store-sun', storeName: 'Medan Sun Plaza' },
];

const photo = (assetId: string, fileName: string, source: 'camera' | 'album', capturedAt: string, previewUrl: string, aiScore: number, mimeType = 'image/jpeg'): PhotoCheckinPhoto => ({
  assetId,
  fileName,
  mimeType,
  source,
  capturedAt,
  previewUrl,
  aiScore,
});

const CHECKIN_RECORDS: PhotoCheckinRecord[] = [
  {
    id: 'checkin-20260903-001',
    baId: 'BA001',
    baName: 'Siti Aminah',
    regionId: 'jakarta-south',
    regionName: '雅加达南区',
    storeId: 'store-senayan',
    storeName: 'Jakarta Grand Indonesia',
    checkinDate: '2026-09-03',
    submittedAt: '2026-09-03 09:42',
    status: 'completed',
    makeupPhoto: photo('asset-makeup-001', 'BA001_makeup.jpg', 'camera', '2026-09-03 09:40', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85', 92),
    counterPhoto: photo('asset-counter-001', 'BA001_counter.jpg', 'album', '2026-09-03 09:41', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=900&q=85', 88),
  },
  {
    id: 'checkin-20260903-002',
    baId: 'BA002',
    baName: 'Budi Santoso',
    regionId: 'jakarta-south',
    regionName: '雅加达南区',
    storeId: 'store-pacific',
    storeName: 'Jakarta Plaza Senayan',
    checkinDate: '2026-09-03',
    submittedAt: '2026-09-03 08:16',
    status: 'completed',
    makeupPhoto: photo('asset-makeup-002', 'BA002_makeup.jpg', 'album', '2026-09-03 08:11', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85', 86),
    counterPhoto: photo('asset-counter-002', 'BA002_counter.jpg', 'camera', '2026-09-03 08:15', 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=85', 91),
  },
  {
    id: 'checkin-20260903-003',
    baId: 'BA003',
    baName: 'Ayu Lestari',
    regionId: 'jakarta-south',
    regionName: '雅加达南区',
    storeId: 'store-gandaria',
    storeName: 'Jakarta Gandaria City',
    checkinDate: '2026-09-03',
    submittedAt: '2026-09-03 10:08',
    status: 'completed',
    makeupPhoto: photo('asset-makeup-003', 'BA003_makeup.jpg', 'camera', '2026-09-03 10:06', 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=85', 89),
    counterPhoto: photo('asset-counter-003', 'BA003_counter.jpg', 'camera', '2026-09-03 10:07', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=85', 84),
  },
  {
    id: 'checkin-20260903-004',
    baId: 'BA004',
    baName: 'Dewi Sartika',
    regionId: 'surabaya',
    regionName: '泗水区',
    storeId: 'store-tunjungan',
    storeName: 'Surabaya Tunjungan Plaza',
    checkinDate: '2026-09-03',
    submittedAt: '2026-09-03 09:08',
    status: 'completed',
    makeupPhoto: photo('asset-makeup-004', 'BA004_makeup.jpg', 'album', '2026-09-03 09:06', 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=900&q=85', 94),
    counterPhoto: photo('asset-counter-004', 'BA004_counter.jpg', 'camera', '2026-09-03 09:07', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=900&q=85', 93),
  },
  {
    id: 'checkin-20260903-005',
    baId: 'BA005',
    baName: 'Putri Maharani',
    regionId: 'bali',
    regionName: '巴厘岛区',
    storeId: 'store-beachwalk',
    storeName: 'Bali Beachwalk',
    checkinDate: '2026-09-03',
    submittedAt: '2026-09-03 10:12',
    status: 'completed',
    makeupPhoto: photo('asset-makeup-005', 'BA005_makeup.jpg', 'camera', '2026-09-03 10:09', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85', 90),
    counterPhoto: photo('asset-counter-005', 'BA005_counter.jpg', 'album', '2026-09-03 10:11', 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=85', 87),
  },
  {
    id: 'checkin-20260903-006',
    baId: 'BA006',
    baName: 'Maya Putri',
    regionId: 'jakarta-south',
    regionName: '雅加达南区',
    storeId: 'store-senayan',
    storeName: 'Jakarta Grand Indonesia',
    checkinDate: '2026-09-03',
    submittedAt: '2026-09-03 11:26',
    status: 'completed',
    makeupPhoto: photo('asset-makeup-006', 'BA006_makeup.jpg', 'album', '2026-09-03 11:22', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85', 96),
    counterPhoto: photo('asset-counter-006', 'BA006_counter.jpg', 'camera', '2026-09-03 11:25', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=85', 92),
  },
  {
    id: 'checkin-20260902-007',
    baId: 'BA007',
    baName: 'Rina Wijaya',
    regionId: 'jakarta-south',
    regionName: '雅加达南区',
    storeId: 'store-pacific',
    storeName: 'Jakarta Plaza Senayan',
    checkinDate: '2026-09-02',
    submittedAt: '2026-09-02 17:30',
    status: 'completed',
    makeupPhoto: photo('asset-makeup-007', 'BA007_makeup.jpg', 'camera', '2026-09-02 17:27', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85', 83),
    counterPhoto: photo('asset-counter-007', 'BA007_counter.jpg', 'album', '2026-09-02 17:29', 'https://images.unsplash.com/photo-1571781565036-d3f7594c2a5b?auto=format&fit=crop&w=900&q=85', 90),
  },
  {
    id: 'checkin-20260902-008',
    baId: 'BA008',
    baName: 'Lia Kartika',
    regionId: 'jakarta-north',
    regionName: '雅加达北区',
    storeId: 'store-kelapa',
    storeName: 'Jakarta Kelapa Gading',
    checkinDate: '2026-09-02',
    submittedAt: '2026-09-02 16:04',
    status: 'completed',
    makeupPhoto: photo('asset-makeup-008', 'BA008_makeup.jpg', 'album', '2026-09-02 16:00', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=85', 91),
    counterPhoto: photo('asset-counter-008', 'BA008_counter.jpg', 'camera', '2026-09-02 16:03', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=85', 86),
  },
];

const STATUS_META: Record<PhotoCheckinStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  completed: { label: '已打卡', className: 'border-[#BFDCCF] bg-[#EEF8F4] text-[#3B8F72]', icon: CheckCircle2 },
  missing: { label: '未打卡', className: 'border-[#E5DED8] bg-[#F8F5F3] text-[#766F73]', icon: Clock3 },
};

const REGIONAL_SCOPE_ID = 'jakarta-south';
const TODAY = '2026-09-03';

export function PhotoCheckinRecords({ userRole }: { userRole: Role }) {
  const isNational = userRole === 'Super Admin' || userRole === 'HQ Trainer';
  const [dateFrom, setDateFrom] = useState(TODAY);
  const [dateTo, setDateTo] = useState(TODAY);
  const [regionFilter, setRegionFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PhotoCheckinStatus>('all');
  const [search, setSearch] = useState('');
  const [selectedRow, setSelectedRow] = useState<CheckinRow | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [photoRequirements, setPhotoRequirements] = useState<CheckinPhotoRequirement[]>(DEFAULT_PHOTO_REQUIREMENTS);
  const [draftRequirements, setDraftRequirements] = useState<CheckinPhotoRequirement[]>(DEFAULT_PHOTO_REQUIREMENTS);

  useEffect(() => {
    // A role switch can keep this page mounted. Clear the previous selection
    // and filters so a record from the former scope is never left visible.
    setSelectedRow(null);
    setDateFrom(TODAY);
    setDateTo(TODAY);
    setRegionFilter('all');
    setStoreFilter('all');
    setStatusFilter('all');
    setSearch('');
  }, [userRole]);

  const scopedRoster = useMemo(() => BA_ROSTER.filter(ba => isNational || ba.regionId === REGIONAL_SCOPE_ID), [isNational]);
  const normalizedSearch = search.trim().toLowerCase();
  const matchingRoster = useMemo(() => scopedRoster.filter(ba => {
    const matchesRegion = regionFilter === 'all' || ba.regionId === regionFilter;
    const matchesStore = storeFilter === 'all' || ba.storeId === storeFilter;
    const matchesSearch = !normalizedSearch || `${ba.id} ${ba.name} ${ba.storeName}`.toLowerCase().includes(normalizedSearch);
    return matchesRegion && matchesStore && matchesSearch;
  }), [normalizedSearch, regionFilter, scopedRoster, storeFilter]);

  const regionOptions = useMemo(() => Array.from(new Map(scopedRoster.map(ba => [ba.regionId, ba.regionName])).entries()), [scopedRoster]);
  const storeOptions = useMemo(() => Array.from(new Map(scopedRoster.filter(ba => regionFilter === 'all' || ba.regionId === regionFilter).map(ba => [ba.storeId, ba.storeName])).entries()), [regionFilter, scopedRoster]);
  const matchingBaIds = useMemo(() => new Set(matchingRoster.map(ba => ba.id)), [matchingRoster]);

  const periodRecords = useMemo(() => CHECKIN_RECORDS
    .filter(record => matchingBaIds.has(record.baId))
    .filter(record => (!dateFrom || record.checkinDate >= dateFrom) && (!dateTo || record.checkinDate <= dateTo))
    .sort((a, b) => `${b.checkinDate} ${b.submittedAt ?? ''}`.localeCompare(`${a.checkinDate} ${a.submittedAt ?? ''}`)), [dateFrom, dateTo, matchingBaIds]);

  const rows = useMemo<CheckinRow[]>(() => {
    const recordRows = periodRecords
      .filter(record => statusFilter === 'all' || record.status === statusFilter)
      .map(record => ({ profile: matchingRoster.find(ba => ba.id === record.baId)!, record }));
    const recordedBaIds = new Set(periodRecords.map(record => record.baId));
    const missingRows = statusFilter === 'all' || statusFilter === 'missing'
      ? matchingRoster.filter(ba => !recordedBaIds.has(ba.id)).map(profile => ({ profile }))
      : [];
    return [...recordRows, ...missingRows];
  }, [matchingRoster, periodRecords, statusFilter]);

  const summary = useMemo(() => {
    const totalBa = matchingRoster.length;
    const completedBa = new Set(periodRecords.filter(record => record.status === 'completed').map(record => record.baId)).size;
    const recordedBa = new Set(periodRecords.map(record => record.baId));
    const missingBa = matchingRoster.filter(ba => !recordedBa.has(ba.id)).length;
    return { totalBa, completedBa, missingBa, completionRate: totalBa ? Math.round(completedBa / totalBa * 100) : 0 };
  }, [matchingRoster, periodRecords]);

  const resetFilters = () => {
    setDateFrom(TODAY);
    setDateTo(TODAY);
    setRegionFilter('all');
    setStoreFilter('all');
    setStatusFilter('all');
    setSearch('');
  };

  const scopeLabel = isNational ? '全国' : '雅加达南区';
  const periodLabel = dateFrom === dateTo ? dateFrom : `${dateFrom || '不限'} 至 ${dateTo || '不限'}`;
  const requirementLabel = photoRequirements.length ? photoRequirements.map(item => `${item.name} ${item.count} 张`).join(' · ') : '未配置照片要求';

  return (
    <div className="flex min-h-full flex-col gap-5 pt-2">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#242124]">BA 打卡记录</h1>
          </div>
          <p className="mt-1 text-sm text-[#766F73]">查看 {scopeLabel} BA 的每日妆容照与柜台出样照提交情况</p>
        </div>
      </header>

      <Card className="rounded-xl border border-[#E9E4DF] bg-white shadow-sm">
        <CardHeader className="border-b border-[#EFEAE7] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#242124]"><Search className="h-4 w-4 text-rose-500" />筛选记录</CardTitle>
            <Button variant="outline" size="sm" onClick={resetFilters} className="gap-1.5 border-[#E5DED8] text-xs"><RefreshCcw className="h-3.5 w-3.5" />重置筛选</Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <label className="text-xs font-bold text-[#5D565A]">开始日期<input aria-label="开始日期" type="date" value={dateFrom} max={dateTo || undefined} onChange={event => setDateFrom(event.target.value)} className={`${fieldClass} mt-1.5 h-9 py-1.5`} /></label>
            <label className="text-xs font-bold text-[#5D565A]">结束日期<input aria-label="结束日期" type="date" value={dateTo} min={dateFrom || undefined} onChange={event => setDateTo(event.target.value)} className={`${fieldClass} mt-1.5 h-9 py-1.5`} /></label>
            <label className="text-xs font-bold text-[#5D565A]">区域<select aria-label="区域" value={regionFilter} onChange={event => { setRegionFilter(event.target.value); setStoreFilter('all'); }} className={`${fieldClass} mt-1.5 h-9 py-1.5`}><option value="all">全部区域</option>{regionOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
            <label className="text-xs font-bold text-[#5D565A]">门店<select aria-label="门店" value={storeFilter} onChange={event => setStoreFilter(event.target.value)} className={`${fieldClass} mt-1.5 h-9 py-1.5`}><option value="all">全部门店</option>{storeOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
            <label className="text-xs font-bold text-[#5D565A]">状态<select aria-label="状态" value={statusFilter} onChange={event => setStatusFilter(event.target.value as 'all' | PhotoCheckinStatus)} className={`${fieldClass} mt-1.5 h-9 py-1.5`}><option value="all">全部状态</option><option value="completed">已打卡</option><option value="missing">未打卡</option></select></label>
            <label className="text-xs font-bold text-[#5D565A]">BA 搜索<div className="relative mt-1.5"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9396]" /><input aria-label="搜索 BA" value={search} onChange={event => setSearch(event.target.value)} placeholder="姓名 / 工号 / 门店" className={`${fieldClass} h-9 pl-9 py-1.5`} /></div></label>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="范围内 BA" value={summary.totalBa} icon={Users} tone="text-[#242124]" />
        <SummaryCard label="已打卡" value={summary.completedBa} icon={CheckCircle2} tone="text-[#3B8F72]" />
        <SummaryCard label="未打卡" value={summary.missingBa} icon={Clock3} tone="text-[#766F73]" />
        <SummaryCard label="周期内打卡率" value={`${summary.completionRate}%`} icon={Camera} tone="text-rose-600" />
      </div>

      <section className="min-h-0 overflow-hidden rounded-xl border border-[#E9E4DF] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E9E4DF] px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-[#242124]">打卡记录列表</h2>
            <p className="mt-1 text-xs text-[#766F73]">筛选周期：{periodLabel} · 共 {rows.length} 条展示 · 要求：{requirementLabel}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setDraftRequirements(photoRequirements.map(item => ({ ...item }))); setSettingsOpen(true); }} className="gap-1.5 border-[#E5DED8] text-xs"><Settings2 className="h-3.5 w-3.5" />打卡设置</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-xs">
            <thead className="bg-[#F8F5F3] text-[10px] font-bold text-[#766F73]"><tr><th className="px-5 py-3">BA / 工号</th><th className="px-4 py-3">区域</th><th className="px-4 py-3">门店</th><th className="px-4 py-3">打卡日期</th><th className="px-4 py-3">提交时间</th><th className="px-4 py-3">照片状态</th><th className="px-4 py-3">AI 评分</th><th className="px-5 py-3 text-right">操作</th></tr></thead>
            <tbody className="divide-y divide-[#EFEAE7]">
              {rows.map(row => <CheckinTableRow key={row.record?.id ?? `missing-${row.profile.id}`} row={row} onView={() => setSelectedRow(row)} />)}
            </tbody>
          </table>
          {rows.length === 0 && <div className="flex flex-col items-center justify-center px-5 py-16 text-center"><Search className="h-8 w-8 text-[#C7BFBB]" /><p className="mt-3 text-sm font-bold text-[#5D565A]">没有符合条件的记录</p><p className="mt-1 text-xs text-[#9A9396]">调整日期、组织范围或关键词后再试</p></div>}
        </div>
      </section>

      <Dialog open={Boolean(selectedRow)} onOpenChange={open => !open && setSelectedRow(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader className="border-b border-[#E9E4DF] pb-4 pr-8">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#242124]"><Camera className="h-5 w-5 text-rose-500" />BA 打卡详情</DialogTitle>
          </DialogHeader>
          {selectedRow && <CheckinDetail row={selectedRow} />}
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="border-b border-[#E9E4DF] pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#242124]"><Settings2 className="h-5 w-5 text-rose-500" />打卡设置</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <p className="text-sm text-[#766F73]">设置 BA 每次打卡需要上传的照片种类和数量。</p>
            <div className="space-y-3">
              {draftRequirements.map(item => <PhotoRequirementRow key={item.id} item={item} onChange={next => setDraftRequirements(current => current.map(existing => existing.id === item.id ? next : existing))} onRemove={item.id.startsWith('custom-') ? () => setDraftRequirements(current => current.filter(existing => existing.id !== item.id)) : undefined} />)}
            </div>
            <Button type="button" variant="outline" onClick={() => setDraftRequirements(current => [...current, { id: `custom-${Date.now()}`, name: '新照片种类', description: '', count: 1, prompt: '请填写 AI 评价标准。' }])} className="h-12 w-full gap-2 border-dashed border-rose-300 bg-rose-50/40 text-rose-700 hover:bg-rose-50"><Plus className="h-4 w-4" />新增照片种类</Button>
            <div className="flex justify-end gap-2 border-t border-[#EFEAE7] pt-4">
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>取消</Button>
              <Button className="bg-rose-600 text-white hover:bg-rose-700" onClick={() => { setPhotoRequirements(draftRequirements.filter(item => item.name.trim())); setSettingsOpen(false); }}>保存设置</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, tone }: { label: string; value: string | number; icon: typeof Users; tone: string }) {
  return <Card className="rounded-xl border border-[#E9E4DF] bg-white shadow-sm"><CardContent className="flex items-center justify-between p-4"><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#8B8387]">{label}</p><p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p></div><Icon className={`h-5 w-5 ${tone} opacity-80`} /></CardContent></Card>;
}

function CheckinTableRow({ row, onView }: { key?: string; row: CheckinRow; onView: () => void }) {
  const status = row.record?.status ?? 'missing';
  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;

  return <tr className="hover:bg-[#FCFAF8]">
    <td className="px-5 py-3"><div className="font-bold text-[#242124]">{row.profile.name}</div><div className="mt-1 font-mono text-[10px] text-[#9A9396]">{row.profile.id}</div></td>
    <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 text-[#5D565A]"><MapPin className="h-3.5 w-3.5 text-[#9A9396]" />{row.profile.regionName}</span></td>
    <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 text-[#5D565A]"><Store className="h-3.5 w-3.5 text-[#9A9396]" />{row.profile.storeName}</span></td>
    <td className="px-4 py-3 font-medium text-[#3F3A3D]">{row.record?.checkinDate ?? '—'}</td>
    <td className="px-4 py-3 text-[#766F73]">{row.record?.submittedAt ?? '暂无提交'}</td>
    <td className="px-4 py-3"><Badge variant="outline" className={`gap-1 ${meta.className}`}><StatusIcon className="h-3 w-3" />{meta.label}</Badge></td>
    <td className="px-4 py-3">{row.record ? <div className="flex items-center gap-2 whitespace-nowrap"><ScoreItem label="妆容" score={row.record.makeupPhoto?.aiScore} /><span className="h-3 w-px bg-[#E5DED8]" /><ScoreItem label="出样" score={row.record.counterPhoto?.aiScore} /></div> : <span className="text-[#B4ACB0]">—</span>}</td>
    <td className="px-5 py-3 text-right">{row.record ? <Button variant="outline" size="sm" onClick={onView} className="h-8 gap-1.5 border-[#E5DED8] text-xs"><Eye className="h-3.5 w-3.5" />查看详情</Button> : null}</td>
  </tr>;
}

function ScoreItem({ label, score }: { label: string; score?: number }) {
  return <span className="inline-flex items-baseline gap-1"><span className="text-[10px] text-[#8B8387]">{label}</span><strong className="font-mono text-xs font-bold tabular-nums text-[#242124]">{score ?? '—'}</strong></span>;
}

function PhotoRequirementRow({ item, onChange, onRemove }: { key?: string; item: CheckinPhotoRequirement; onChange: (item: CheckinPhotoRequirement) => void; onRemove?: () => void }) {
  return <div className="space-y-3 rounded-lg border border-[#E9E4DF] bg-[#FCFAF8] p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="grid flex-1 gap-2 sm:grid-cols-2">
        <label className="text-xs font-bold text-[#5D565A]">照片名称<input aria-label={`${item.name}名称`} value={item.name} onChange={event => onChange({ ...item, name: event.target.value })} className={`${fieldClass} mt-1.5 h-9 py-1.5`} /></label>
        <label className="text-xs font-bold text-[#5D565A]">上传数量<input aria-label={`${item.name}数量`} type="number" min={1} max={9} value={item.count} onChange={event => onChange({ ...item, count: Math.min(9, Math.max(1, Number(event.target.value) || 1)) })} className={`${fieldClass} mt-1.5 h-9 py-1.5`} /></label>
      </div>
      {onRemove && <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-xs text-[#9B4B4B] hover:bg-red-50 hover:text-red-700">移除</Button>}
    </div>
    <label className="block text-xs font-bold text-[#5D565A]">照片说明<textarea aria-label={`${item.name}说明`} value={item.description} onChange={event => onChange({ ...item, description: event.target.value })} placeholder="说明 BA 需要拍摄的内容" className={`${fieldClass} mt-1.5 min-h-16 resize-y`} /></label>
    <label className="block text-xs font-bold text-[#5D565A]">AI 评价 Prompt<textarea aria-label={`${item.name}AI评价Prompt`} value={item.prompt} onChange={event => onChange({ ...item, prompt: event.target.value })} placeholder="输入 AI 评分时参考的评价标准" className={`${fieldClass} mt-1.5 min-h-20 resize-y`} /></label>
  </div>;
}

function CheckinDetail({ row }: { row: CheckinRow }) {
  const record = row.record;
  const status = record?.status ?? 'missing';
  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-[#E9E4DF] bg-[#F8F5F3] p-4">
      <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600"><Users className="h-5 w-5" /></div><div><h2 className="text-base font-bold text-[#242124]">{row.profile.name}</h2><p className="mt-1 text-xs text-[#766F73]">{row.profile.id} · {row.profile.storeName}</p></div></div>
      <Badge variant="outline" className={`gap-1 ${meta.className}`}><StatusIcon className="h-3.5 w-3.5" />{meta.label}</Badge>
    </div>
    <div className="grid gap-3 sm:grid-cols-3"><InfoItem label="所属区域" value={row.profile.regionName} icon={<MapPin className="h-4 w-4" />} /><InfoItem label="打卡日期" value={record?.checkinDate ?? '暂无记录'} icon={<CalendarDays className="h-4 w-4" />} /><InfoItem label="提交时间" value={record?.submittedAt ?? '暂无提交'} icon={<Clock3 className="h-4 w-4" />} /></div>
    {record ? <div className="grid gap-4 lg:grid-cols-2"><PhotoPanel title="妆容照" description="正面妆容与当日形象" photo={record.makeupPhoto} /><PhotoPanel title="柜台出样照" description="柜台陈列与台面状态" photo={record.counterPhoto} /></div> : <div className="rounded-lg border border-dashed border-[#D8D0CB] bg-[#FCFAF8] px-5 py-12 text-center"><Clock3 className="mx-auto h-8 w-8 text-[#C7BFBB]" /><p className="mt-3 text-sm font-bold text-[#5D565A]">该 BA 在筛选周期内暂无打卡记录</p><p className="mt-1 text-xs text-[#9A9396]">BeautyAI 提交两张照片后，这里会显示完整记录</p></div>}
    {record && <div className="rounded-lg border border-[#E9E4DF] bg-white p-4"><div className="text-xs font-bold text-[#3F3A3D]">提交说明</div><div className="mt-3 grid gap-2 text-xs text-[#766F73] sm:grid-cols-2"><span>记录 ID：<strong className="font-mono text-[#5D565A]">{record.id}</strong></span><span>提交校验：<strong className={status === 'completed' ? 'text-[#3B8F72]' : 'text-[#766F73]'}>{status === 'completed' ? '两张照片齐全' : '暂无提交'}</strong></span></div></div>}
  </div>;
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="rounded-lg border border-[#E9E4DF] bg-white p-3"><div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8B8387]">{icon}{label}</div><div className="mt-1.5 text-sm font-bold text-[#242124]">{value}</div></div>;
}

function PhotoPanel({ title, description, photo }: { title: string; description: string; photo?: PhotoCheckinPhoto }) {
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    setLoadError(false);
  }, [photo?.previewUrl]);
  const sourceLabel = photo?.source === 'camera' ? '相机拍摄' : '相册上传';
  return <section className="rounded-lg border border-[#E9E4DF] bg-white p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-[#242124]">{title}</h3><p className="mt-1 text-xs text-[#9A9396]">{description}</p></div><Badge variant="outline" className={photo ? 'border-[#BFDCCF] bg-[#EEF8F4] text-[#3B8F72]' : 'border-[#E5DED8] bg-[#F8F5F3] text-[#766F73]'}>{photo ? '已上传' : '缺失'}</Badge></div>{photo && !loadError ? <img src={photo.previewUrl} alt={`${title}预览`} loading="lazy" onError={() => setLoadError(true)} className="mt-4 aspect-[16/10] w-full rounded-lg bg-[#F8F5F3] object-cover" /> : <div className="mt-4 flex aspect-[16/10] flex-col items-center justify-center rounded-lg border border-dashed border-[#D8D0CB] bg-[#FCFAF8] text-center">{loadError ? <ImageOff className="h-7 w-7 text-red-400" /> : <Camera className="h-7 w-7 text-[#C7BFBB]" />}<p className="mt-2 text-xs font-bold text-[#766F73]">{loadError ? '照片资源加载失败' : '该照片尚未提交'}</p><p className="mt-1 text-[10px] text-[#9A9396]">{loadError ? '请检查对象存储资源或签名 URL' : '需要 BA 补齐两张照片后才能完成打卡'}</p></div>}{photo && <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#9A9396]"><span className="truncate">{photo.fileName}</span><span>{sourceLabel} · {photo.capturedAt}</span></div>}</section>;
}

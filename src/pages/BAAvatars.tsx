import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Upload, User, FileText, Tag, Image as ImageIcon, Save, CheckCircle, MessageSquare, Bot, Send, RotateCcw, Wand2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { EffectiveStatusBadge, type EffectiveStatus } from '../components/EffectiveStatusBadge';
import { PracticePromptNotice } from '../components/PracticePromptNotice';
import { aiActionTone } from '../lib/visualTones';

type AvatarLanguage = '中文' | '英文' | '印尼语';

const AVATAR_VOICE_OPTIONS: Record<AvatarLanguage, string[]> = {
  中文: ['中文女声 晓雅', '中文女声 晨曦', '中文男声 云泽'],
  英文: ['英文女声 Ava', '英文女声 Emma', '英文男声 Noah'],
  印尼语: ['印尼语女声 Sari', '印尼语女声 Dewi', '印尼语男声 Budi']
};

interface Avatar {
  id: string;
  name: string;
  language: AvatarLanguage;
  voice: string;
  avatarUrl: string;
  imageUrl: string;
  tags: string[];
  prompt: string;
  flow: string;
  effectiveStatus: EffectiveStatus;
}

type PreviewRole = 'assistant' | 'user';

interface PreviewMessage {
  id: string;
  role: PreviewRole;
  text: string;
}

type ScenarioScript = (typeof MOCK_SCENARIO_SCRIPTS)[number];

const TOPIC_KEYS = ['防晒', '祛痘', '底妆'] as const;
type TopicKey = typeof TOPIC_KEYS[number] | '通用';

const containsAny = (text: string, keywords: string[]) => keywords.some(keyword => text.includes(keyword));

const detectTopic = (avatar: Avatar, script: ScenarioScript | null): TopicKey => {
  const source = `${avatar.prompt} ${avatar.flow} ${script?.title ?? ''} ${script?.description ?? ''}`;
  if (containsAny(source, ['防晒', 'sunscreen', 'sun care', 'sun-care'])) return '防晒';
  if (containsAny(source, ['祛痘', '油痘', '痘', 'acne'])) return '祛痘';
  if (containsAny(source, ['底妆', '粉底', '搓泥', 'makeup', 'foundation', 'pilling'])) return '底妆';
  return '通用';
};

const getOpeningLine = (avatar: Avatar, topic: TopicKey) => {
  const copy: Record<AvatarLanguage, Record<TopicKey, string>> = {
    中文: {
      防晒: '你好，我最近想找一款不油、不搓泥的防晒，最好适合通勤。',
      祛痘: '你好，我是油痘肌，想找一款能稳住状态的产品。',
      底妆: '你好，我想看看这款会不会和我的底妆冲突。',
      通用: '你好，我想先看看这款适不适合我。',
    },
    英文: {
      防晒: 'Hi, I am looking for a sunscreen that feels light and will not pill under makeup.',
      祛痘: 'Hi, I have oily acne-prone skin and want something that keeps my skin stable.',
      底妆: 'Hi, I want to see whether this will work with my makeup.',
      通用: 'Hi, I want to see whether this is a good fit for me.',
    },
    印尼语: {
      防晒: 'Halo, saya sedang cari sunscreen yang ringan, tidak lengket, dan tidak bikin makeup bergeser.',
      祛痘: 'Halo, saya punya kulit berminyak dan berjerawat, jadi saya cari produk yang bisa bantu menenangkan kulit.',
      底妆: 'Halo, saya mau lihat apakah produk ini cocok dipakai bareng makeup saya.',
      通用: 'Halo, saya ingin lihat apakah produk ini cocok untuk saya.',
    },
  };

  return copy[avatar.language][topic];
};

const getReplyLine = (avatar: Avatar, topic: TopicKey, input: string) => {
  const text = input.toLowerCase();
  const wantsSample = containsAny(text, ['试用', '小样', '试涂', 'sample', 'try', 'coba']);
  const worriesOil = containsAny(text, ['油', '油腻', 'oily', 'greasy', 'lengket']);
  const worriesMakeup = containsAny(text, ['搓泥', '底妆', 'makeup', 'foundation', 'pilling']);
  const worriesPrice = containsAny(text, ['价格', '预算', '贵', 'price', 'budget', 'mahal']);

  const replyMap: Record<AvatarLanguage, Record<'sample' | 'oil' | 'makeup' | 'price' | 'fallback', Record<TopicKey, string>>> = {
    中文: {
      sample: {
        防晒: '可以先试一下吗？我想看看上脸的感觉。',
        祛痘: '可以先试一点吗？我想看看会不会刺激。',
        底妆: '可以先试一下吗？我想看看会不会起皮。',
        通用: '可以先试一下吗？我想感受一下质地。',
      },
      oil: {
        防晒: '我最担心的就是太油，麻烦帮我挑轻一点的。',
        祛痘: '我最担心的是闷痘或者太厚重。',
        底妆: '我最担心它会不会又油又搓泥。',
        通用: '我比较在意清爽度，太油的我会犹豫。',
      },
      makeup: {
        防晒: '我平时会带妆，所以特别在意会不会搓泥。',
        祛痘: '我也会化妆，太厚的话会影响妆面。',
        底妆: '我平时底妆比较重，最怕叠加之后不服帖。',
        通用: '我会考虑和我平时的妆容搭不搭。',
      },
      price: {
        防晒: '如果价格太高，我可能会先再想想。',
        祛痘: '如果太贵的话，我可能会先选基础款。',
        底妆: '如果价格超出预算，我会考虑更平价的替代。',
        通用: '如果价格太高，我可能会再比较一下。',
      },
      fallback: {
        防晒: '听起来不错，不过我还想再确认一下使用感。',
        祛痘: '听起来可以，不过我还是想确认一下适不适合我。',
        底妆: '听起来不错，不过我还想确认一下和底妆的兼容性。',
        通用: '听起来不错，不过我还想再确认一下细节。',
      },
    },
    英文: {
      sample: {
        防晒: 'Could I try a small amount first? I want to feel the texture.',
        祛痘: 'Could I try a little first? I want to see whether it feels too strong.',
        底妆: 'Could I try it first? I want to see whether it pills.',
        通用: 'Could I try a little first? I want to feel the texture.',
      },
      oil: {
        防晒: 'My biggest concern is that it feels too oily.',
        祛痘: 'My biggest concern is that it feels too heavy or may clog my skin.',
        底妆: 'My biggest concern is whether it becomes oily or pills.',
        通用: 'I care a lot about how lightweight it feels.',
      },
      makeup: {
        防晒: 'I wear makeup every day, so I care a lot about compatibility.',
        祛痘: 'I also wear makeup, so I need something that will not affect the finish.',
        底妆: 'I wear a fuller base, so I really care about layering.',
        通用: 'I need something that works with my usual makeup routine.',
      },
      price: {
        防晒: 'If it is too expensive, I may need to think about it first.',
        祛痘: 'If it is too expensive, I may start with a basic option.',
        底妆: 'If it goes over budget, I will consider a cheaper alternative.',
        通用: 'If it is too expensive, I may compare a few more options.',
      },
      fallback: {
        防晒: 'That sounds good, but I still want to confirm the feel.',
        祛痘: 'That sounds good, but I still want to confirm whether it suits me.',
        底妆: 'That sounds good, but I still want to confirm the makeup compatibility.',
        通用: 'That sounds good, but I still want to confirm a few details.',
      },
    },
    印尼语: {
      sample: {
        防晒: 'Boleh saya coba sedikit dulu? Saya ingin rasakan teksturnya.',
        祛痘: 'Boleh saya coba sedikit dulu? Saya ingin lihat apakah cocok untuk kulit saya.',
        底妆: 'Boleh saya coba dulu? Saya ingin lihat apakah hasilnya pilling.',
        通用: 'Boleh saya coba sedikit dulu? Saya ingin rasakan teksturnya.',
      },
      oil: {
        防晒: 'Yang paling saya khawatirkan itu terasa terlalu berminyak.',
        祛痘: 'Yang paling saya khawatirkan itu terlalu berat atau menyumbat kulit.',
        底妆: 'Yang paling saya khawatirkan itu jadi berminyak atau pilling.',
        通用: 'Saya paling peduli apakah teksturnya terasa ringan.',
      },
      makeup: {
        防晒: 'Saya pakai makeup setiap hari, jadi saya peduli apakah cocok dipakai bareng makeup.',
        祛痘: 'Saya juga pakai makeup, jadi saya butuh yang tidak mengganggu hasil akhirnya.',
        底妆: 'Saya pakai base yang cukup tebal, jadi saya peduli soal layering.',
        通用: 'Saya butuh produk yang cocok dengan rutinitas makeup saya.',
      },
      price: {
        防晒: 'Kalau terlalu mahal, saya mungkin perlu pertimbangkan dulu.',
        祛痘: 'Kalau terlalu mahal, saya mungkin mulai dari opsi yang lebih basic.',
        底妆: 'Kalau lewat budget, saya akan cari alternatif yang lebih murah.',
        通用: 'Kalau terlalu mahal, saya mungkin bandingkan beberapa opsi lagi.',
      },
      fallback: {
        防晒: 'Kedengarannya bagus, tapi saya masih ingin cek feel-nya.',
        祛痘: 'Kedengarannya bagus, tapi saya masih ingin cek apakah cocok untuk saya.',
        底妆: 'Kedengarannya bagus, tapi saya masih ingin cek kecocokan dengan makeup.',
        通用: 'Kedengarannya bagus, tapi saya masih ingin cek beberapa detail.',
      },
    },
  };

  if (wantsSample) return replyMap[avatar.language].sample[topic];
  if (worriesOil) return replyMap[avatar.language].oil[topic];
  if (worriesMakeup) return replyMap[avatar.language].makeup[topic];
  if (worriesPrice) return replyMap[avatar.language].price[topic];
  return replyMap[avatar.language].fallback[topic];
};

const INITIAL_AVATARS: Avatar[] = [
  {
    id: '1',
    name: '职场莉莉',
    language: '印尼语',
    voice: AVATAR_VOICE_OPTIONS['印尼语'][0],
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily&backgroundColor=ffdfbf',
    imageUrl: '',
    tags: ['25-30岁', '混干皮', '女性', '通勤防晒需求'],
    prompt: '你叫莉莉，是一名在雅加达CBD工作的白领。你平时工作很忙，经常对着电脑，皮肤容易干燥并且有肤色不均的问题。你现在想寻找一款既能保湿又能防晒，并且上妆不搓泥的妆前/防晒产品。你的态度比较直接，看重产品的效率和实际效果。',
    flow: '1. 进店询问有没有适合干皮的防晒推荐。\n2. 对BA推荐的产品提出质疑（比如“会不会很油？”或“跟我的粉底会不会搓泥？”）。\n3. 询问有没有小样可以试用，或者要求试涂在手上。\n4. 根据BA的解答专业度决定是否购买。',
    effectiveStatus: 'active'
  },
  {
    id: '2',
    name: '学生小雅',
    language: '印尼语',
    voice: AVATAR_VOICE_OPTIONS['印尼语'][1],
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yaya&backgroundColor=c0aede',
    imageUrl: '',
    tags: ['18-22岁', '油痘肌', '女性', '预算有限'],
    prompt: '你是小雅，一名在读的大学生。你的皮肤是油痘肌，经常长痘痘和闭口，非常苦恼。你每月的护肤预算有限。你希望BA能推荐一些平价但有效祛痘、控油的产品。如果产品太贵，你会犹豫。',
    flow: '1. 在祛痘产品区徘徊，表现出不知所措。\n2. 告诉BA自己的痘痘问题，并强调自己是学生，可能买不起太贵的套盒。\n3. 询问除了护肤品，有没有什么日常护理的建议。\n4. 如果推荐的产品在预算内且听起来合理，会考虑购买单品。',
    effectiveStatus: 'active'
  },
  {
    id: '3',
    name: 'Karina',
    language: '印尼语',
    voice: AVATAR_VOICE_OPTIONS['印尼语'][0],
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karina&backgroundColor=f4d7d7',
    imageUrl: '',
    tags: ['22 tahun', 'berminyak sensitif', 'jerawat berulang', 'AcnePlus'],
    prompt: 'Anda berperan sebagai pelanggan digital bernama Karina, perempuan 22 tahun dengan kulit berminyak dan sensitif. Area T mudah berminyak, pipi cenderung kering dan kemerahan. Masalah utama Anda adalah jerawat berulang di dahi, dagu, dan garis rahang, bekas jerawat kemerahan, dan kadang jerawat bernanah. Anda pernah mencoba salicylic acid, azelaic acid, tea tree oil, dan antibiotik jangka pendek, tetapi hasilnya tidak stabil atau malah iritasi. Anda tertarik pada series Y.O.U AcnePlus karena ingin kulit lebih tenang sebelum interview penting dalam 2-3 minggu. Gaya bicara Anda hati-hati, skeptis, sudah banyak membaca soal ingredients, suka bertanya detail, dan kadang membandingkan dengan The Ordinary atau Paula’s Choice. Anda ingin BA menjelaskan keamanan, efektivitas, urutan pemakaian, waktu hasil terlihat, dan value for money. Jika jawaban BA jelas, Anda bertanya lebih dalam tentang interaksi ingredients dan pemakaian jangka panjang. Jika jawaban BA ragu atau salah, Anda mendesak 1-2 kali dengan sopan. Percakapan selesai hanya jika kekhawatiran inti terjawab dan Anda berkata bahwa Anda mau beli satu rangkaian untuk dicoba; jika tidak, Anda akan bilang ingin pikir-pikir dulu.',
    flow: '1. Perkenalkan kondisi kulit berminyak sensitif dan jerawat berulang, lalu tanya produk AcnePlus mana yang paling cocok.\n2. Saat BA menyebut manfaat produk, minta bukti atau penjelasan ingredients, termasuk keamanan untuk kulit sensitif.\n3. Bandingkan minimal sekali dengan The Ordinary Niacinamide 10% atau Paula’s Choice Salicylic Acid.\n4. Tanyakan skenario pemakaian pagi dan malam, apakah wajib sunscreen, dan kapan hasil realistis terlihat.\n5. Putuskan membeli hanya jika BA mampu menjawab keamanan, efektivitas, cara pakai, dan value for money.',
    effectiveStatus: 'active'
  },
  {
    id: '4',
    name: 'Raisa',
    language: '印尼语',
    voice: AVATAR_VOICE_OPTIONS['印尼语'][1],
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raisa&backgroundColor=d6e7ff',
    imageUrl: '',
    tags: ['28 tahun', 'kombinasi berminyak', 'base makeup', 'shade match'],
    prompt: 'Anda berperan sebagai pelanggan digital bernama Raisa, perempuan 28 tahun yang bekerja sebagai account executive dan sering bertemu klien dari pagi sampai sore. Anda mencari cushion atau foundation yang terlihat rapi di kamera, tahan lama, tidak mudah transfer ke masker, dan tidak membuat area T semakin berminyak. Kulit Anda kombinasi berminyak, pori-pori terlihat di hidung, ada sedikit bekas jerawat, dan undertone Anda cenderung neutral-olive sehingga sering salah pilih shade. Anda pernah kecewa karena foundation terlihat abu-abu setelah beberapa jam, oksidasi, atau cracking di sekitar hidung. Gaya bicara Anda praktis, teliti, dan cukup kritis soal klaim long-lasting. Anda akan menanyakan coverage, hasil akhir, shade, oksidasi, cara set dengan powder, keamanan untuk kulit acne-prone, dan perbedaan dengan Maybelline Fit Me atau Somethinc cushion. Jika BA hanya memberi klaim umum seperti tahan lama atau natural, Anda meminta contoh konkret dan cara pakai. Anda mau membeli jika BA bisa membantu shade matching, menjelaskan teknik aplikasi, dan memberi alasan kenapa produk itu cocok untuk rutinitas kerja Anda.',
    flow: '1. Datang mencari cushion atau foundation untuk kerja harian yang tahan lama dan tidak mudah transfer.\n2. Ceritakan masalah shade sering terlalu abu-abu atau oksidasi, lalu minta bantuan memilih undertone.\n3. Tanyakan coverage, finish, oil control, risiko clogging, dan cara set agar tidak cracking.\n4. Bandingkan dengan Maybelline Fit Me atau Somethinc cushion, terutama dari sisi ketahanan dan shade range.\n5. Minta dicoba di rahang atau pipi, tunggu sebentar untuk cek oksidasi, lalu putuskan berdasarkan penjelasan BA.',
    effectiveStatus: 'active'
  },
  {
    id: '5',
    name: 'Dinda',
    language: '印尼语',
    voice: AVATAR_VOICE_OPTIONS['印尼语'][0],
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dinda&backgroundColor=f9d5e5',
    imageUrl: '',
    tags: ['19 tahun', 'bibir kering', 'lip product', 'warna natural'],
    prompt: 'Anda berperan sebagai pelanggan digital bernama Dinda, perempuan 19 tahun, mahasiswa yang ingin membeli lip tint atau lip cream untuk dipakai kuliah dan hangout. Bibir Anda mudah kering, sering mengelupas, dan warna bibir agak gelap di bagian pinggir, jadi Anda takut produk matte membuat bibir terlihat pecah-pecah atau makin gelap. Anda suka warna natural seperti peach brown, rose nude, atau mauve, tetapi ingin tetap terlihat fresh di foto. Budget Anda terbatas, jadi Anda sangat peduli apakah produk cukup worth it. Gaya bicara Anda ramah tetapi banyak ragu, sering bertanya apakah warnanya cocok untuk kulit sawo matang, apakah transferproof, apakah aman dipakai setiap hari, dan apakah perlu lip balm dulu. Anda akan membandingkan dengan Wardah, Implora, atau Maybelline SuperStay. Jika BA memaksa shade yang terlalu terang atau terlalu bold, Anda akan menolak halus dan minta alternatif yang lebih wearable. Anda akan membeli jika BA bisa menjelaskan tekstur, kenyamanan, ketahanan, cara pemakaian untuk bibir kering, dan membantu memilih warna yang tidak membuat wajah kusam.',
    flow: '1. Ceritakan bahwa Anda mencari lip tint atau lip cream untuk kuliah, tetapi bibir mudah kering dan pinggir bibir agak gelap.\n2. Tanyakan shade natural yang cocok untuk kulit sawo matang dan tidak membuat wajah terlihat kusam.\n3. Uji BA dengan pertanyaan soal transferproof, ketahanan setelah makan, kandungan pelembap, dan apakah perlu lip balm.\n4. Bandingkan dengan Wardah, Implora, atau Maybelline SuperStay dari sisi kenyamanan dan harga.\n5. Minta swatch dua warna paling wearable; beli hanya jika BA bisa memberi alasan shade dan cara pakai yang meyakinkan.',
    effectiveStatus: 'active'
  }
];

const MOCK_SCENARIO_SCRIPTS = [
  {
    id: 'sun-care',
    title: '通勤防晒咨询',
    description: '适合干皮通勤顾客，重点考察防晒质地、上妆兼容和试用引导。',
    outline: '1. 顾客询问有没有适合干皮的防晒推荐。\n2. 顾客担心产品会油腻、搓泥或影响底妆。\n3. BA 需要解释质地、使用顺序和适用肤质。\n4. 顾客要求试涂或询问小样，BA 完成试用引导。'
  },
  {
    id: 'acne-care',
    title: '油痘肌基础护理',
    description: '适合预算有限的年轻顾客，重点考察控油祛痘推荐和价格异议处理。',
    outline: '1. 顾客在祛痘产品区停留，对产品选择犹豫。\n2. 顾客说明油痘肌问题，并强调预算有限。\n3. BA 需要推荐入门组合，并解释使用顺序。\n4. 顾客提出价格顾虑，BA 给出单品优先级建议。'
  }
];

export function BAAvatars() {
  const [avatars, setAvatars] = useState<Avatar[]>(INITIAL_AVATARS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_AVATARS[0].id);
  const [tagInput, setTagInput] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('保存成功');
  const [flowMode, setFlowMode] = useState<'custom' | 'existing'>('custom');
  const [selectedScriptId, setSelectedScriptId] = useState(MOCK_SCENARIO_SCRIPTS[0].id);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewInput, setPreviewInput] = useState('');
  const [previewMessages, setPreviewMessages] = useState<PreviewMessage[]>([]);
  const [previewTyping, setPreviewTyping] = useState(false);
  const replyTimerRef = useRef<number | null>(null);

  const selectedAvatar = avatars.find(a => a.id === selectedId) || avatars[0];
  const selectedScript = flowMode === 'existing'
    ? MOCK_SCENARIO_SCRIPTS.find(item => item.id === selectedScriptId) ?? MOCK_SCENARIO_SCRIPTS[0]
    : null;

  const handleUpdate = (field: keyof Avatar, value: any) => {
    setAvatars(prev => prev.map(a => a.id === selectedId ? { ...a, [field]: value, effectiveStatus: 'pending' } : a));
  };

  const handleLanguageChange = (language: AvatarLanguage) => {
    setAvatars(prev => prev.map(a => (
      a.id === selectedId
        ? { ...a, language, voice: AVATAR_VOICE_OPTIONS[language][0], effectiveStatus: 'pending' }
        : a
    )));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!selectedAvatar.tags.includes(tagInput.trim())) {
        handleUpdate('tags', [...selectedAvatar.tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleUpdate('tags', selectedAvatar.tags.filter(t => t !== tagToRemove));
  };

  const handleSelectScript = (scriptId: string) => {
    const script = MOCK_SCENARIO_SCRIPTS.find(item => item.id === scriptId);
    setSelectedScriptId(scriptId);
    if (script) {
      handleUpdate('flow', script.outline);
    }
  };

  const handleAddNew = () => {
    const newAvatar: Avatar = {
      id: Date.now().toString(),
      name: '新数字人顾客',
      language: '印尼语',
      voice: AVATAR_VOICE_OPTIONS['印尼语'][0],
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}&backgroundColor=e2e8f0`,
      imageUrl: '',
      tags: ['新标签'],
      prompt: '在这里输入数字人的人格设定...',
      flow: '1. ...\n2. ...\n3. ...',
      effectiveStatus: 'pending'
    };
    setAvatars([newAvatar, ...avatars]);
    setSelectedId(newAvatar.id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newAvatars = avatars.filter(a => a.id !== id);
    setAvatars(newAvatars);
    if (selectedId === id && newAvatars.length > 0) {
      setSelectedId(newAvatars[0].id);
    } else if (newAvatars.length === 0) {
      setSelectedId('');
    }
  };

  const handleSave = () => {
    setAvatars(prev => prev.map(a => a.id === selectedId ? { ...a, effectiveStatus: 'active' } : a));
    setToastMessage('保存成功');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleGenerateAvatarImage = () => {
    const seed = encodeURIComponent(`${selectedAvatar.name}-${selectedAvatar.language}-${selectedAvatar.voice}`);
    const imageUrl = `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80&sig=${seed}`;
    handleUpdate('imageUrl', imageUrl);
    setToastMessage('已生成配图');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2200);
  };

  const buildPreviewMessages = (avatar: Avatar, script: ScenarioScript | null): PreviewMessage[] => {
    const topic = detectTopic(avatar, script);
    return [
      {
        id: `${avatar.id}-opening`,
        role: 'assistant',
        text: getOpeningLine(avatar, topic),
      },
    ];
  };

  const resetPreviewConversation = () => {
    if (replyTimerRef.current) {
      window.clearTimeout(replyTimerRef.current);
      replyTimerRef.current = null;
    }
    setPreviewMessages(buildPreviewMessages(selectedAvatar, selectedScript));
    setPreviewInput('');
    setPreviewTyping(false);
  };

  const sendPreviewMessage = () => {
    const text = previewInput.trim();
    if (!text) return;

    const avatar = selectedAvatar;
    const script = selectedScript;
    const topic = detectTopic(avatar, script);
    const reply = getReplyLine(avatar, topic, text);
    const userMessage: PreviewMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text,
    };

    if (replyTimerRef.current) {
      window.clearTimeout(replyTimerRef.current);
    }

    setPreviewMessages(prev => [...prev, userMessage]);
    setPreviewInput('');
    setPreviewTyping(true);

    replyTimerRef.current = window.setTimeout(() => {
      setPreviewMessages(prev => [...prev, {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        text: reply,
      }]);
      setPreviewTyping(false);
      replyTimerRef.current = null;
    }, 650);
  };

  useEffect(() => {
    if (!previewOpen) return;
    resetPreviewConversation();
  }, [previewOpen, selectedAvatar.id, selectedAvatar.language, selectedAvatar.voice, flowMode, selectedScriptId]);

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) {
        window.clearTimeout(replyTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex h-full bg-[#F7F3F1] overflow-hidden pt-2 rounded-xl border border-[#E5DED8]">
      {/* Left Sidebar: List of Avatars */}
      <div className="w-80 bg-white border-r border-[#E5DED8] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#E9E4DF] flex items-center justify-between z-10 bg-white">
          <h2 className="font-bold text-[#242124] tracking-tight">数字人顾客 ({avatars.length})</h2>
          <button
            onClick={handleAddNew}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-rose-600 px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-rose-700"
          >
            <Plus className="h-4 w-4" />
            <span>新建</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {avatars.map(avatar => (
            <div
              key={avatar.id}
              onClick={() => setSelectedId(avatar.id)}
              className={`group flex items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                selectedId === avatar.id
                  ? 'border-rose-600 bg-rose-50/50 shadow-sm'
                  : 'border-transparent bg-[#F8F5F3] hover:bg-[#F1ECE8] hover:border-[#E5DED8]'
              }`}
            >
              <img src={avatar.avatarUrl} alt={avatar.name} className={`w-12 h-12 rounded-full object-cover shrink-0 ${selectedId === avatar.id ? 'ring-2 ring-rose-200' : ''}`} />
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 data-i18n-skip="true" className={`font-bold text-sm truncate ${selectedId === avatar.id ? 'text-rose-950' : 'text-[#242124]'}`}>
                    {avatar.name}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1 mt-0.5 h-4 overflow-hidden">
                  {avatar.tags.slice(0, 2).map((tag, i) => (
                    <span key={i} data-i18n-skip="true" className="text-[9px] px-1.5 py-0.5 bg-white border border-[#E5DED8] text-[#766F73] rounded font-medium">
                      {tag}
                    </span>
                  ))}
                  {avatar.tags.length > 2 && <span className="text-[9px] px-1 text-[#9A9396]">+{avatar.tags.length - 2}</span>}
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(avatar.id, e)}
                className={`ml-2 p-1.5 rounded-md text-[#9A9396] hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 ${selectedId === avatar.id ? 'opacity-100' : ''}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {avatars.length === 0 && (
            <div className="text-center py-10 text-[#9A9396] text-sm">
              暂无数字人顾客，请点击右上角添加
            </div>
          )}
        </div>
      </div>

      {/* Right Content: Edit Selected Avatar */}
      <div className="flex-1 bg-[#F7F3F1] flex flex-col relative">
        {showToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#3B8F72] text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
        )}

        {selectedAvatar ? (
          <>
            <div className="p-6 border-b border-[#E5DED8] bg-white flex items-center justify-between shrink-0">
              <div>
                <h1 className="text-xl font-bold text-[#242124]">编辑数字人：{selectedAvatar.name}</h1>
                <p className="text-xs text-[#766F73] mt-1">配置角色外观、人格设定及互动流程以用于 BA 陪练</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPreviewOpen(true)}
                  className="border-[#E5DED8] bg-white text-[#3F3A3D] hover:bg-[#F8F5F3]"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>对话预览</span>
                </Button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm font-bold text-sm transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>保存配置</span>
                </button>
                <EffectiveStatusBadge status={selectedAvatar.effectiveStatus} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-4xl mx-auto space-y-8">
                <PracticePromptNotice />

                {/* Basic Info & Visuals */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E9E4DF]">
                  <h3 className="text-sm font-bold text-[#242124] mb-6 flex items-center">
                    <User className="h-4 w-4 mr-2 text-rose-500" />
                    基本信息与形象
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* AVATAR IMAGE */}
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-[#766F73] mb-2">静态头像</label>
                      <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-[#E5DED8] bg-[#F8F5F3] hover:bg-[#F1ECE8] transition-colors cursor-pointer flex flex-col items-center justify-center p-4">
                        <img src={selectedAvatar.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover shadow-sm mb-3 group-hover:opacity-50 transition-opacity" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="h-6 w-6 text-rose-600 mb-1" />
                          <span className="text-xs font-bold text-rose-600">更换头像</span>
                        </div>
                      </div>
                    </div>

                    {/* COVER IMAGE UPLOAD */}
                    <div className="col-span-1 md:col-span-2">
                       <div className="flex items-center justify-between mb-2">
                         <label className="block text-xs font-bold text-[#766F73]">上传大图</label>
                         <Button
                           type="button"
                           variant="secondary"
                           size="sm"
                           className={`h-7 ${aiActionTone.buttonClass}`}
                           onClick={handleGenerateAvatarImage}
                         >
                           <Wand2 className={`h-4 w-4 mr-1 ${aiActionTone.iconClass}`} />
                           <span>AI 一键生成配图</span>
                         </Button>
                       </div>
                       <div className="relative h-40 overflow-hidden rounded-xl border-2 border-dashed border-[#E5DED8] bg-[#F8F5F3] hover:bg-[#F1ECE8] transition-colors cursor-pointer flex flex-col items-center justify-center text-[#9A9396] group">
                          {selectedAvatar.imageUrl ? (
                            <img src={selectedAvatar.imageUrl} alt="Generated cover" className="absolute inset-0 h-full w-full object-cover" />
                          ) : (
                            <>
                              <ImageIcon className="h-8 w-8 mb-2 group-hover:text-rose-500 transition-colors" />
                              <span className="text-sm font-bold text-[#5D565A] group-hover:text-rose-600 mb-1">点击上传或拖拽大图至此</span>
                              <span className="text-[10px]">建议上传横版人物大图，用于学员端角色封面</span>
                            </>
                          )}
                       </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-[#E9E4DF] pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
                    <div>
                      <label className="block text-xs font-bold text-[#766F73] mb-2">数字人名称</label>
                      <input
                        type="text"
                        value={selectedAvatar.name}
                        onChange={(e) => handleUpdate('name', e.target.value)}
                        className="w-full px-4 py-2 border border-[#E5DED8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-shadow font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#766F73] mb-2">语种</label>
                      <Select
                        value={selectedAvatar.language}
                        onValueChange={(value) => handleLanguageChange(value as AvatarLanguage)}
                      >
                        <SelectTrigger className="w-full h-10 bg-white border-[#E5DED8] text-sm font-medium text-[#3F3A3D]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="中文">中文</SelectItem>
                          <SelectItem value="英文">英文</SelectItem>
                          <SelectItem value="印尼语">印尼语</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#766F73] mb-2">选择音色</label>
                      <Select
                        value={selectedAvatar.voice}
                        onValueChange={(value) => handleUpdate('voice', value)}
                      >
                        <SelectTrigger className="w-full h-10 bg-white border-[#E5DED8] text-sm font-medium text-[#3F3A3D]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AVATAR_VOICE_OPTIONS[selectedAvatar.language].map(voice => (
                            <SelectItem key={voice} value={voice}>{voice}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E9E4DF]">
                  <h3 className="text-sm font-bold text-[#242124] mb-4 flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-rose-500" />
                    角色标签 (年龄、肤质、需求等)
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedAvatar.tags.map((tag, i) => (
                      <span key={i} data-i18n-skip="true" className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-1.5 focus:outline-none hover:text-rose-800">
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="输入标签并按回车添加..."
                    className="w-full max-w-sm px-4 py-2 border border-[#E5DED8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-shadow"
                  />
                </div>

                {/* Prompts & Flows */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E9E4DF] grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-bold text-[#242124] mb-2 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-[#4F5FD5]" />
                      人格设定 Prompt
                    </h3>
                    <p className="text-[10px] text-[#766F73] mb-4">设定性格、语气及背景，驱动大模型行为</p>
                    <textarea
                      value={selectedAvatar.prompt}
                      onChange={(e) => handleUpdate('prompt', e.target.value)}
                      className="w-full h-64 p-4 border border-[#E5DED8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F5FD5]/20 focus:border-[#4F5FD5] resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#242124] mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-[#B9822B]" />
                      对话流程与剧本大纲
                    </h3>
                    <p className="text-[10px] text-[#766F73] mb-4">可以自定义剧本大纲，也可以从已有场景剧本中选择</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setFlowMode('custom')}
                        className={`h-9 rounded-lg border text-xs font-bold transition-colors ${flowMode === 'custom' ? 'border-[#C89543] bg-[#FFF7EA] text-[#8B621F]' : 'border-[#E5DED8] text-[#766F73] hover:bg-[#F8F5F3]'}`}
                      >
                        自定义大纲
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFlowMode('existing');
                          handleSelectScript(selectedScriptId);
                        }}
                        className={`h-9 rounded-lg border text-xs font-bold transition-colors ${flowMode === 'existing' ? 'border-[#C89543] bg-[#FFF7EA] text-[#8B621F]' : 'border-[#E5DED8] text-[#766F73] hover:bg-[#F8F5F3]'}`}
                      >
                        选择场景剧本
                      </button>
                    </div>
                    {flowMode === 'existing' && (
                      <div className="mb-3 rounded-xl border border-[#F2DEC0] bg-[#FFF7EA]/40 p-3">
                        <label className="block text-[10px] font-bold text-[#8B621F] mb-2">已有场景剧本</label>
                        <select
                          value={selectedScriptId}
                          onChange={(e) => handleSelectScript(e.target.value)}
                          className="w-full h-9 rounded-lg border border-[#E8CCA0] bg-white px-3 text-xs font-bold text-[#3F3A3D] focus:outline-none focus:ring-2 focus:ring-[#B9822B]/20"
                        >
                          {MOCK_SCENARIO_SCRIPTS.map(script => (
                            <option key={script.id} value={script.id} data-i18n-skip="true">{script.title}</option>
                          ))}
                        </select>
                        <p data-i18n-skip="true" className="mt-2 text-[10px] leading-relaxed text-[#766F73]">
                          {MOCK_SCENARIO_SCRIPTS.find(script => script.id === selectedScriptId)?.description}
                        </p>
                      </div>
                    )}
                    <textarea
                      value={selectedAvatar.flow}
                      onChange={(e) => handleUpdate('flow', e.target.value)}
                      className="w-full h-40 p-4 border border-[#E5DED8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B9822B]/20 focus:border-[#B9822B] resize-none leading-relaxed"
                    />
                  </div>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#9A9396]">
            <User className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-medium text-[#766F73]">在左侧选择或创建一个数字人顾客</p>
          </div>
        )}

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="sm:max-w-[1120px] h-[85vh] p-0 overflow-hidden bg-[#FCFAF8]">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-[#E5DED8] bg-white px-6 py-4">
                <DialogTitle className="text-lg font-bold text-[#242124]">对话预览</DialogTitle>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
                <div className="flex min-h-0 flex-col border-r border-[#E5DED8] bg-[#FDFBFA]">
                  <div className="flex items-center justify-between border-b border-[#E5DED8] bg-white px-6 py-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#9A9396]">聊天记录</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetPreviewConversation}
                      className="border-[#E5DED8] bg-white text-[#3F3A3D] hover:bg-[#F8F5F3]"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>重置对话</span>
                    </Button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                    <div className="space-y-4">
                      {previewMessages.map(message => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex max-w-[85%] items-end gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${message.role === 'user' ? 'bg-rose-600 text-white' : 'bg-white text-rose-600 border border-[#E5DED8]'}`}>
                              {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </div>
                            <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${message.role === 'user' ? 'bg-rose-600 text-white rounded-br-md' : 'border border-[#E5DED8] bg-white text-[#242124] rounded-bl-md'}`}>
                              <p data-i18n-skip="true" className="whitespace-pre-wrap">
                                {message.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {previewTyping && (
                        <div className="flex justify-start">
                          <div className="flex items-end gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-rose-600 border border-[#E5DED8]">
                              <Bot className="h-4 w-4" />
                            </div>
                            <div className="rounded-2xl rounded-bl-md border border-[#E5DED8] bg-white px-4 py-3 shadow-sm">
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-[#C9C1C4] animate-bounce [animation-delay:-0.2s]" />
                                <span className="h-2 w-2 rounded-full bg-[#C9C1C4] animate-bounce [animation-delay:-0.1s]" />
                                <span className="h-2 w-2 rounded-full bg-[#C9C1C4] animate-bounce" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[#E5DED8] bg-white p-4">
                    <div className="flex items-end gap-3">
                      <textarea
                        value={previewInput}
                        onChange={(e) => setPreviewInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendPreviewMessage();
                          }
                        }}
                        placeholder="输入消息..."
                        className="min-h-[56px] flex-1 resize-none rounded-lg border border-[#E5DED8] bg-white px-3 py-2 text-sm leading-relaxed outline-none transition-colors placeholder:text-[#9A9396] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
                      />
                      <Button
                        onClick={sendPreviewMessage}
                        className="h-10 bg-rose-600 px-4 text-white hover:bg-rose-700"
                      >
                        <Send className="h-4 w-4" />
                        <span>发送</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="min-h-0 overflow-y-auto bg-[#F8F5F3] px-5 py-5">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 border-b border-[#E5DED8] pb-4">
                      <img
                        src={selectedAvatar.avatarUrl}
                        alt={selectedAvatar.name}
                        className="h-14 w-14 rounded-full object-cover shadow-sm"
                      />
                      <div className="min-w-0">
                        <div data-i18n-skip="true" className="truncate text-sm font-bold text-[#242124]">
                          {selectedAvatar.name}
                        </div>
                        <div className="truncate text-xs text-[#766F73]">
                          {selectedAvatar.language} · {selectedAvatar.voice}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#9A9396]">
                        当前剧本
                      </div>
                      <div className="rounded-xl border border-[#E5DED8] bg-white p-3">
                        <div data-i18n-skip="true" className="text-sm font-bold text-[#242124]">
                          {selectedScript?.title ?? '自定义大纲'}
                        </div>
                        <p data-i18n-skip="true" className="mt-1 text-xs leading-relaxed text-[#766F73]">
                          {selectedScript?.description ?? '使用当前数字人对话流程进行预览'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#9A9396]">
                        人格设定 Prompt
                      </div>
                      <div data-i18n-skip="true" className="rounded-xl border border-[#E5DED8] bg-white p-3 text-xs leading-relaxed text-[#5D565A] max-h-40 overflow-y-auto whitespace-pre-line">
                        {selectedAvatar.prompt}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#9A9396]">
                        对话流程与剧本大纲
                      </div>
                      <div data-i18n-skip="true" className="rounded-xl border border-[#E5DED8] bg-white p-3 text-xs leading-relaxed text-[#5D565A] max-h-40 overflow-y-auto whitespace-pre-line">
                        {selectedAvatar.flow}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#9A9396]">
                        标签
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedAvatar.tags.map(tag => (
                          <span
                            key={tag}
                            data-i18n-skip="true"
                            className="inline-flex items-center rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

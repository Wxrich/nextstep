'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Profile = {
  grade: string;
  schoolTier: string;
  major: string;
  gpa: string;
  english: string;
  budget: string;
  internshipCount: string;
  internshipQuality: string;
  honors: string;
  competition: string;
  stabilityPref: number;
  stressTolerance: number;
  currentMonth: string;
};

const steps = [
  { num: 1, title: '现状画像', desc: '录入你的基本盘' },
  { num: 2, title: '方向对比', desc: '四大出路横向比拼' },
  { num: 3, title: 'AI 专属路线', desc: '生成成长路线图' },
];

const pathComparison = {
  postgraduate: {
    name: '国内考研 / 保研',
    icon: '📚',
    cost: '低 · 2-5万/年',
    difficulty: '极高',
    salary: '硕士起薪平均比本科高 20-40%',
    prepTime: '6-12 个月备考',
    timeLimit: '大三下准备 · 大四上12月初试',
    suitableFor: '想做科研/进大厂核心岗/考公更有优势',
    threshold: '自律性 + 信息搜集 + 应试能力',
    pros: '学历贬值避风港，科研与学术门槛',
    cons: '报录比逐年走低，二战心理压力大',
    color: 'from-blue-500 to-indigo-500',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  civilServant: {
    name: '考公 / 事业编',
    icon: '🏛️',
    cost: '极低 · 仅教材报考费',
    difficulty: '极高',
    salary: '稳定中上，福利完善，地区差异大',
    prepTime: '3-6 个月集中备考',
    timeLimit: '大四上11月底国考 · 大四下3月省考',
    suitableFor: '追求稳定 / 想回老家 / 家庭有资源',
    threshold: '申论写作 + 行测速度 + 面试表达',
    pros: '极高稳定性，福利保障完善',
    cons: '千军万马独木桥，晋升空间受限',
    color: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  job: {
    name: '直接就业',
    icon: '💼',
    cost: '无 · 直接赚钱',
    difficulty: '中等',
    salary: '差异极大，从 5k 到 50k 都有',
    prepTime: '从大一开始积累，大三暑期实习最关键',
    timeLimit: '大三暑假实习 · 大四上秋招/大四下春招',
    suitableFor: '想早点赚钱 / 实践导向 / 不想再读书',
    threshold: '实习经历 + 项目作品 + 面试能力',
    pros: '提早积累社会经验与财富',
    cons: '起步薪资受学校影响大，可能加班',
    color: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  abroad: {
    name: '出国留学 / 出境深造',
    icon: '🌍',
    cost: '极高 · 30-80万/年',
    difficulty: '中等 · 重在软硬背景',
    salary: '海外就业薪资高，回国看学校档次',
    prepTime: '1-2 年（语言+GPA+背景提升）',
    timeLimit: '大三下考语言 · 大四上9月-当年3月申请',
    suitableFor: '家庭条件好 / 想移民 / 进外资企业',
    threshold: 'GPA + 语言成绩 + 推荐信 + 文书',
    pros: '学制短，名校率高，拓宽国际视野',
    cons: '资金开销极大，回国认可度需甄别',
    color: 'from-purple-500 to-pink-500',
    bgLight: 'bg-purple-50 dark:bg-purple-950/40',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
};

export default function CareerHelper() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Profile>({
    grade: '大二上学期',
    schoolTier: '双非一本',
    major: '理工科（计算机/电子/机械等）',
    gpa: '前 30%（中上等）',
    english: 'CET-6 已过 (425+)',
    budget: '5-15万 (可支持国内读研/轻度支持)',
    internshipCount: '0 段（还没实习/科研过）',
    internshipQuality: '暂无',
    honors: '无任何奖项',
    competition: '无竞赛经历',
    stabilityPref: 5,
    stressTolerance: 6,
    currentMonth: '9月开学季（新学年开始）',
  });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMentoringModal, setShowMentoringModal] = useState(false);
  const [payMethod, setPayMethod] = useState<'wechat' | 'alipay'>('alipay');
  const [mentoringPayMethod, setMentoringPayMethod] = useState<'wechat' | 'alipay'>('alipay');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // 初始化主题
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // 分割免费/付费内容
  const splitReport = (text: string) => {
    const startMarker = '🔒 PREMIUM_CONTENT_START 🔒';
    const endMarker = '🔒 PREMIUM_CONTENT_END 🔒';
    const startIdx = text.indexOf(startMarker);
    const endIdx = text.indexOf(endMarker);

    if (startIdx === -1 || endIdx === -1) {
      return { freeContent: text, premiumContent: '', hasPremium: false };
    }
    return {
      freeContent: text.slice(0, startIdx).trim(),
      premiumContent: text.slice(startIdx + startMarker.length, endIdx).trim(),
      hasPremium: true,
    };
  };

  const { freeContent, premiumContent, hasPremium } = report
    ? splitReport(report)
    : { freeContent: '', premiumContent: '', hasPremium: false };

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const startAnalysis = async () => {
    setLoading(true);
    setStep(3);
    setReport('');
    try {
      const res = await fetch('/api/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '分析生成失败');
      setReport(data.report);
    } catch (err) {
      const message = err instanceof Error ? err.message : '分析生成失败，请检查网络或配置';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile({ ...profile, [key]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 text-slate-800 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/20 dark:text-slate-100 transition-colors duration-300">
      {/* 顶部装饰渐变 */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-br from-indigo-100/60 via-purple-100/40 to-pink-100/30 dark:from-indigo-900/30 dark:via-purple-900/20 dark:to-pink-900/10 -z-10 transition-colors duration-500" />

      {/* 头部 */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/60 dark:border-slate-800/60 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
              ⚓
            </div>
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                下一站·启航
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 -mt-0.5">NextStep · 生涯规划助手</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded-full font-medium border border-indigo-100 dark:border-indigo-900/50 transition-colors">
              全大学生涯规划
            </span>
            <button
              onClick={toggleTheme}
              aria-label="切换主题"
              className="theme-toggle-btn w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Hero 标题 */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-800/60 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-xs text-slate-500 dark:text-slate-400 mb-5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI 智能规划 · 从大一到大四全程陪伴
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            规划你的 <span className="text-gradient">大学四年</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-lg mx-auto">
            3 分钟录入个人画像，AI 为你定制从学业提升到毕业出路的全周期成长路线图
          </p>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step > s.num
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30'
                      : step === s.num
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 step-active'
                      : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    step >= s.num ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {s.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-10 md:w-20 h-0.5 mx-2 md:mx-4 rounded-full transition-all duration-500 ${
                    step > s.num
                      ? 'bg-gradient-to-r from-emerald-400 to-indigo-400'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* 步骤 1：录入画像 */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-5 md:px-8 md:py-6">
                <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  第一步：录入你的基本盘
                </h3>
                <p className="text-indigo-100 text-sm mt-1">越真实，AI 给的规划越精准</p>
              </div>

              <div className="p-6 md:p-8 space-y-8">
                {/* 基本信息 */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                    基本信息
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      label="当前年级"
                      value={profile.grade}
                      onChange={(v) => updateProfile('grade', v)}
                      options={[
                        '大一上学期（刚入学）',
                        '大一下学期',
                        '大二上学期',
                        '大二下学期',
                        '大三上学期',
                        '大三下学期',
                        '大三暑假（关键过渡期）',
                        '大四上学期（秋招/考研冲刺）',
                        '大四下学期（春招/答辩）',
                        '已毕业/Gap 中',
                      ]}
                      dark
                    />
                    <SelectField
                      label="学校档次"
                      value={profile.schoolTier}
                      onChange={(v) => updateProfile('schoolTier', v)}
                      options={[
                        'C9/985 高校',
                        '211 高校',
                        '双一流学科高校',
                        '双非一本',
                        '普通二本/三本',
                        '专科院校',
                      ]}
                      dark
                    />
                    <SelectField
                      label="专业大类"
                      value={profile.major}
                      onChange={(v) => updateProfile('major', v)}
                      options={[
                        '理工科（计算机/电子/机械等）',
                        '商科（金融/会计/管理等）',
                        '文科（中文/新闻/外语等）',
                        '医科（临床/口腔/护理等）',
                        '艺术/设计类',
                        '理科（数学/物理/化学等）',
                        '农学/地矿/海洋等小众专业',
                      ]}
                      dark
                    />
                    <SelectField
                      label="绩点 / 综测排名"
                      value={profile.gpa}
                      onChange={(v) => updateProfile('gpa', v)}
                      options={[
                        '前 5%（专业顶尖，稳稳保研）',
                        '前 10%（保研边缘/优等生）',
                        '前 30%（中上等）',
                        '前 50%（中等）',
                        '后 50%（挂科/低绩点）',
                      ]}
                      dark
                    />
                  </div>
                </div>

                {/* 软实力 */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
                    软实力 & 资源
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      label="英语水平"
                      value={profile.english}
                      onChange={(v) => updateProfile('english', v)}
                      options={[
                        'CET-4 未过',
                        'CET-4 已过 / CET-6 未过',
                        'CET-6 已过 (425+)',
                        'CET-6 550+ 或 BEC/口译证书',
                        '雅思 6.5+ / 托福 90+ (具备海外申请实力)',
                        '雅思 7.5+ / 托福 105+ (顶尖水平)',
                      ]}
                      dark
                    />
                    <SelectField
                      label="实习 / 科研经历"
                      value={profile.internshipCount}
                      onChange={(v) => updateProfile('internshipCount', v)}
                      options={[
                        '0 段（还没实习/科研过）',
                        '1 段短期或校内项目',
                        '2 段相关经历',
                        '3 段及以上大厂/名企/核心科研',
                      ]}
                      dark
                    />
                    <SelectField
                      label="实习 / 科研含金量"
                      value={profile.internshipQuality}
                      onChange={(v) => updateProfile('internshipQuality', v)}
                      options={[
                        '暂无',
                        '普通中小公司 / 校级项目',
                        '知名企业实习 / 省级科研',
                        '头部大厂核心岗 / 国家级科研 / 顶会论文',
                      ]}
                      dark
                    />
                    <SelectField
                      label="荣誉奖项情况"
                      value={profile.honors}
                      onChange={(v) => updateProfile('honors', v)}
                      options={[
                        '无任何奖项',
                        '校级奖学金/三好学生',
                        '省级奖项 / 国家励志奖学金',
                        '国家奖学金 / 国家级竞赛奖项',
                        '国际级 / 顶赛奖项',
                      ]}
                      dark
                    />
                    <SelectField
                      label="学科竞赛经历"
                      value={profile.competition}
                      onChange={(v) => updateProfile('competition', v)}
                      options={[
                        '无竞赛经历',
                        '校赛 / 院赛级别',
                        '省赛 / 区域赛（如蓝桥杯省赛、数模省赛）',
                        '国赛（如 ACM 区域赛、挑战杯国赛、数模国赛）',
                        '国际级 / 顶尖赛事获奖',
                      ]}
                      dark
                    />
                    <SelectField
                      label="家庭最大资金预算 (年)"
                      value={profile.budget}
                      onChange={(v) => updateProfile('budget', v)}
                      options={[
                        '5万以内 (需自给自足或极低成本)',
                        '5-15万 (可支持国内读研/轻度支持)',
                        '15-30万 (可考虑非高昂国家留学/中产)',
                        '30万以上 (留学预算充足)',
                        '50万以上 (资金非常充裕)',
                      ]}
                      dark
                    />
                    <SelectField
                      label="当前所处时间节点"
                      value={profile.currentMonth}
                      onChange={(v) => updateProfile('currentMonth', v)}
                      options={[
                        '9月开学季（新学年开始）',
                        '10-11月（秋招/期中）',
                        '12月（期末/考研初试）',
                        '1-2月（寒假/春节）',
                        '3月（春招/开学）',
                        '4-5月（期中/考研复试）',
                        '6月（期末/答辩/毕业季）',
                        '7-8月（暑假 · 实习黄金期）',
                      ]}
                      dark
                    />
                  </div>
                </div>

                {/* 性格偏好 */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
                    性格与偏好
                  </h4>
                  <div className="space-y-6">
                    <SliderField
                      label="工作稳定性偏好"
                      value={profile.stabilityPref}
                      onChange={(v) => updateProfile('stabilityPref', v)}
                      leftLabel="喜欢高风险高回报"
                      rightLabel="必须铁饭碗"
                    />
                    <SliderField
                      label="抗压能力评估"
                      value={profile.stressTolerance}
                      onChange={(v) => updateProfile('stressTolerance', v)}
                      leftLabel="极易焦虑崩溃"
                      rightLabel="越挫越勇"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 md:px-8 pb-6 md:pb-8">
                <button
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-xl hover:shadow-indigo-300 dark:hover:shadow-indigo-800/40 btn-press"
                >
                  下一步：看看四大出路怎么选 →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 步骤 2：方向对比 */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
              <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-5 md:px-8 md:py-6">
                <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">⚖️</span>
                  第二步：核心出路大比拼
                </h3>
                <p className="text-emerald-100 text-sm mt-1">
                  四大方向横向对比，帮你建立全局认知
                </p>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {Object.entries(pathComparison).map(([key, value]) => (
                    <div
                      key={key}
                      className="card-hover bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 relative overflow-hidden transition-colors"
                    >
                      {/* 顶部色条 */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${value.color}`}
                      />
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={`w-11 h-11 rounded-xl ${value.bgLight} flex items-center justify-center text-xl flex-shrink-0`}
                        >
                          {value.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold ${value.textColor} text-base`}>
                            {value.name}
                          </h4>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full inline-block mt-1">
                            关键期：{value.timeLimit}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 dark:text-slate-500 text-xs w-16 flex-shrink-0">
                            💰 资金开销
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 text-xs">{value.cost}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 dark:text-slate-500 text-xs w-16 flex-shrink-0">
                            ⚔️ 难度评级
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 text-xs">{value.difficulty}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 dark:text-slate-500 text-xs w-16 flex-shrink-0">
                            💵 薪资前景
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 text-xs">{value.salary}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 dark:text-slate-500 text-xs w-16 flex-shrink-0">
                            ⏱️ 备考周期
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 text-xs">{value.prepTime}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-slate-400 dark:text-slate-500 text-xs w-16 flex-shrink-0 mt-0.5">
                            🎯 适合人群
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 text-xs">{value.suitableFor}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-slate-400 dark:text-slate-500 text-xs w-16 flex-shrink-0 mt-0.5">
                            🚪 核心门槛
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 text-xs">{value.threshold}</span>
                        </div>
                        <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-slate-700 mt-2 pt-2">
                          <span className="text-slate-400 dark:text-slate-500 text-xs w-16 flex-shrink-0 mt-0.5">
                            ✅ 优势
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 text-xs">{value.pros}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-slate-400 dark:text-slate-500 text-xs w-16 flex-shrink-0 mt-0.5">
                            ❌ 劣势
                          </span>
                          <span className="text-rose-500 dark:text-rose-400 text-xs">{value.cons}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 px-6 md:px-8 pb-6 md:pb-8">
                <button
                  onClick={handlePrev}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium py-3.5 rounded-xl transition btn-press"
                >
                  ← 返回上一步
                </button>
                <button
                  onClick={startAnalysis}
                  className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-xl btn-press"
                >
                  生成 AI 专属路线 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 步骤 3：AI 报告 */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-5 md:px-8 md:py-6">
                <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      AI 正在为你定制成长路线...
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">🚀</span>
                      你的专属大学成长路线图
                    </>
                  )}
                </h3>
                {!loading && report && (
                  <p className="text-indigo-100 text-sm mt-1">
                    基于你的年级和画像量身定制，从现在到毕业全程规划
                  </p>
                )}
              </div>

              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 animate-pulse">
                    ✨
                  </div>
                  <div className="text-center">
                    <p className="text-slate-700 dark:text-slate-200 font-medium">AI 正在为你定制成长路线...</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                      结合你的年级、硬实力、性格偏好，绘制从现在到毕业的路线图
                    </p>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 md:p-8 space-y-6">
                  {/* 免费内容 */}
                  <div className="prose prose-slate dark:prose-invert prose-sm max-w-none prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-headings:font-bold prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3 prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-600 dark:prose-li:text-slate-300 prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400 prose-a:text-indigo-500 dark:prose-a:text-indigo-400 prose-blockquote:border-indigo-300 dark:prose-blockquote:border-indigo-700 prose-blockquote:bg-indigo-50/50 dark:prose-blockquote:bg-indigo-950/30 prose-blockquote:rounded-lg prose-blockquote:py-1 prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-300 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-table:text-slate-600 dark:prose-table:text-slate-300 prose-th:bg-slate-50 dark:prose-th:bg-slate-800">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{freeContent}</ReactMarkdown>
                  </div>

                  {/* 付费会员墙 */}
                  {hasPremium && !isPremium && (
                    <div className="relative rounded-2xl overflow-hidden border border-amber-200 dark:border-amber-800/50">
                      {/* 模糊背景的付费内容预览 */}
                      <div className="blur-lg select-none pointer-events-none opacity-40 px-6 py-6 max-h-[400px] overflow-hidden">
                        <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{premiumContent}</ReactMarkdown>
                        </div>
                      </div>
                      {/* 解锁遮罩 */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-white/80 dark:via-slate-900/85 to-white/95 dark:to-slate-900/95 backdrop-blur-sm">
                        <div className="text-center px-6 max-w-md">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-200 dark:shadow-amber-900/40">
                            👑
                          </div>
                          <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                            解锁会员专享详细规划
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                            查看学期级 / 月度详细成长路线图、每周时间分配表、定制化学习资源推荐等全部深度内容
                          </p>
                          <div className="flex items-center justify-center gap-6 mb-5 text-xs text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <span className="text-emerald-500">✓</span>
                              <span>学期级路线图</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-emerald-500">✓</span>
                              <span>月度任务清单</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-emerald-500">✓</span>
                              <span>资源推荐</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowPaymentModal(true)}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-amber-200 dark:shadow-amber-900/30 btn-press"
                          >
                            👑 立即解锁 · 仅需 19.9 元
                          </button>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
                            一次付费，永久查看该份报告的全部内容
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 已解锁付费内容 */}
                  {hasPremium && isPremium && (
                    <div className="prose prose-slate dark:prose-invert prose-sm max-w-none prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-headings:font-bold prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3 prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-600 dark:prose-li:text-slate-300 prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400 prose-a:text-indigo-500 dark:prose-a:text-indigo-400 prose-blockquote:border-indigo-300 dark:prose-blockquote:border-indigo-700 prose-blockquote:bg-indigo-50/50 dark:prose-blockquote:bg-indigo-950/30 prose-blockquote:rounded-lg prose-blockquote:py-1 prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-300 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-table:text-slate-600 dark:prose-table:text-slate-300 prose-th:bg-slate-50 dark:prose-th:bg-slate-800 border-t-2 border-dashed border-amber-200 dark:border-amber-800/50 pt-6 mt-2">
                      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 text-amber-700 dark:text-amber-400 text-xs px-3 py-1 rounded-full font-medium mb-4">
                        👑 会员专享内容
                      </div>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{premiumContent}</ReactMarkdown>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium py-3 rounded-xl transition btn-press"
                    >
                      🔄 重新评估
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-3 rounded-xl transition btn-press shadow-lg shadow-emerald-100 dark:shadow-emerald-900/30"
                    >
                      🖨️ 导出 / 打印路线图
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 留资卡片 */}
            {!loading && (
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/20 rounded-3xl p-6 md:p-8 border border-indigo-100 dark:border-indigo-900/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-200/30 to-indigo-200/30 dark:from-pink-500/10 dark:to-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="relative">
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                    <span className="text-xl">💬</span>
                    需要一对一带路辅导？
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                    我们已链接 200+ 成功上岸 985 / 常春藤 / 国家部委 / 大厂的优秀师兄师姐，
                    提供简历修改和定向辅导。
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <input
                      type="tel"
                      placeholder="留下你的手机号 / 微信，方便学长学姐联系你"
                      className="flex-1 bg-white/80 dark:bg-slate-800/60 backdrop-blur border border-indigo-200 dark:border-indigo-900/50 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition"
                    />
                    <button
                      onClick={() => setShowMentoringModal(true)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-medium px-6 py-3 rounded-xl transition whitespace-nowrap btn-press shadow-md shadow-indigo-200 dark:shadow-indigo-900/30"
                    >
                      查看辅导套餐 →
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-indigo-100 dark:border-indigo-900/30">
                    <span>📧</span>
                    <span>如需更多咨询，也可发送邮件至：</span>
                    <a
                      href="mailto:2743356935@qq.com"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      2743356935@qq.com
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 支付弹窗 */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部 */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 px-6 py-5 relative">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
              >
                ✕
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                  👑
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">解锁会员专享内容</h3>
                  <p className="text-amber-100 text-sm">一次付费，永久查看这份详细规划</p>
                </div>
              </div>
            </div>

            {/* 价格 & 权益 */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">¥19.9</span>
                <span className="text-sm text-slate-400 line-through">¥39.9</span>
                <span className="text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-medium">
                  限时 5 折
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  '学期级详细路线图',
                  '每月任务清单',
                  '每周时间分配表',
                  '定制化资源推荐',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span className="text-emerald-500 text-sm">✓</span>
                    <span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 支付方式 */}
            <div className="px-6 py-5">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-center">
                请选择支付方式，扫码后自动解锁
              </p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setPayMethod('wechat')}
                  className={`border-2 rounded-xl p-4 text-center transition ${
                    payMethod === 'wechat'
                      ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <div className="text-3xl mb-2">💚</div>
                  <p className={`text-sm font-medium ${payMethod === 'wechat' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>微信支付</p>
                </button>
                <button
                  onClick={() => setPayMethod('alipay')}
                  className={`border-2 rounded-xl p-4 text-center transition ${
                    payMethod === 'alipay'
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="text-3xl mb-2">💙</div>
                  <p className={`text-sm font-medium ${payMethod === 'alipay' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>支付宝</p>
                </button>
              </div>

              {/* 收款码 */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-center mb-4 border border-slate-200 dark:border-slate-700">
                <img
                  src={payMethod === 'wechat' ? '/wechat-qr.jpg' : '/alipay-qr.jpg'}
                  alt={payMethod === 'wechat' ? '微信收款码' : '支付宝收款码'}
                  className="w-36 h-36 mx-auto rounded-lg mb-3 object-cover shadow-md"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {payMethod === 'wechat' ? '微信扫码支付' : '支付宝扫码支付'} ¥19.9 元
                </p>
              </div>

              {/* 验证码输入 */}
              <div className="mb-4">
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2 text-center">
                  支付后请输入验证码解锁内容
                </label>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => {
                    setVerifyCode(e.target.value);
                    setVerifyError('');
                  }}
                  placeholder="请输入验证码"
                  className="w-full text-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 tracking-widest font-mono"
                />
                {verifyError && (
                  <p className="text-xs text-rose-500 text-center mt-2">{verifyError}</p>
                )}
              </div>

              <button
                onClick={async () => {
                  if (!verifyCode.trim()) {
                    setVerifyError('请输入验证码');
                    return;
                  }
                  setVerifying(true);
                  setVerifyError('');
                  try {
                    const res = await fetch('/api/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ code: verifyCode.trim() }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setIsPremium(true);
                      setShowPaymentModal(false);
                      setVerifyCode('');
                      alert('解锁成功！现在你可以查看完整的会员专享内容了。');
                    } else {
                      setVerifyError(data.message || '验证码错误');
                    }
                  } catch {
                    setVerifyError('网络错误，请重试');
                  } finally {
                    setVerifying(false);
                  }
                }}
                disabled={verifying}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl transition btn-press shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {verifying ? '验证中...' : '✅ 输入验证码解锁'}
              </button>

              <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-3">
                支付后联系客服获取验证码，联系邮箱：
                <a
                  href="mailto:2743356935@qq.com"
                  className="text-indigo-500 dark:text-indigo-400 hover:underline"
                >
                  2743356935@qq.com
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 一对一带路辅导弹窗 */}
      {showMentoringModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up overflow-y-auto"
          onClick={() => setShowMentoringModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full my-8 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部 */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-5 relative">
              <button
                onClick={() => setShowMentoringModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
              >
                ✕
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                  🎓
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">1v1 学长姐带路辅导</h3>
                  <p className="text-indigo-100 text-sm">200+ 成功上岸学长学姐，精准匹配</p>
                </div>
              </div>
            </div>

            {/* 服务介绍 */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">你将获得</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  '同方向学长姐 1v1 对接',
                  '简历精修 & 模拟面试',
                  '备考规划 & 资料推荐',
                  '心理疏导 & 经验分享',
                  '全程 1 个月陪伴',
                  '社群资源 & 内推机会',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span className="text-indigo-500 text-sm">✓</span>
                    <span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 套餐选择 */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">选择套餐</h4>
              <div className="space-y-3">
                {/* 体验版 */}
                <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">轻咨询 · 体验版</h5>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                          推荐先试
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">30 分钟语音/文字答疑 + 简历点评</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-slate-800 dark:text-slate-100">¥29.9</div>
                      <div className="text-[10px] text-slate-400 line-through">¥59</div>
                    </div>
                  </div>
                </div>

                {/* 标准版 */}
                <div className="border-2 border-indigo-400 dark:border-indigo-500 rounded-xl p-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30 relative cursor-pointer">
                  <div className="absolute -top-2.5 left-4">
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-medium">
                      🔥 最受欢迎
                    </span>
                  </div>
                  <div className="flex justify-between items-start pt-1">
                    <div>
                      <h5 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">全程辅导 · 标准版</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">1 个月陪伴 + 简历精修 + 3 次深度沟通</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">¥199</div>
                      <div className="text-[10px] text-slate-400 line-through">¥399</div>
                    </div>
                  </div>
                </div>

                {/* VIP 版 */}
                <div className="border-2 border-amber-300 dark:border-amber-600 rounded-xl p-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 relative cursor-pointer">
                  <div className="absolute -top-2.5 left-4">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-medium">
                      👑 VIP 定制
                    </span>
                  </div>
                  <div className="flex justify-between items-start pt-1">
                    <div>
                      <h5 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">定制规划 · VIP 版</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">3 个月全程 + 内推 + 不限次答疑</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-amber-600 dark:text-amber-400">¥499</div>
                      <div className="text-[10px] text-slate-400 line-through">¥999</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 支付方式 */}
            <div className="px-6 py-5">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-center">
                选择支付方式，付款后 24 小时内学长姐联系你
              </p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setMentoringPayMethod('wechat')}
                  className={`border-2 rounded-xl p-4 text-center transition ${
                    mentoringPayMethod === 'wechat'
                      ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <div className="text-3xl mb-2">💚</div>
                  <p className={`text-sm font-medium ${mentoringPayMethod === 'wechat' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>微信支付</p>
                </button>
                <button
                  onClick={() => setMentoringPayMethod('alipay')}
                  className={`border-2 rounded-xl p-4 text-center transition ${
                    mentoringPayMethod === 'alipay'
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="text-3xl mb-2">💙</div>
                  <p className={`text-sm font-medium ${mentoringPayMethod === 'alipay' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>支付宝</p>
                </button>
              </div>

              {/* 收款码 */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-center mb-4 border border-slate-200 dark:border-slate-700">
                <img
                  src={mentoringPayMethod === 'wechat' ? '/wechat-qr.jpg' : '/alipay-qr.jpg'}
                  alt={mentoringPayMethod === 'wechat' ? '微信收款码' : '支付宝收款码'}
                  className="w-36 h-36 mx-auto rounded-lg mb-3 object-cover shadow-md"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {mentoringPayMethod === 'wechat' ? '微信扫码支付' : '支付宝扫码支付'}对应套餐金额
                </p>
              </div>

              <button
                onClick={() => {
                  setShowMentoringModal(false);
                  alert('提交成功！学长学姐会在 24 小时内通过你留下的联系方式联系你，请耐心等待。');
                }}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition btn-press shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30"
              >
                提交预约，等待学长姐联系
              </button>

              <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-3">
                有疑问？发送邮件至：
                <a
                  href="mailto:2743356935@qq.com"
                  className="text-indigo-500 dark:text-indigo-400 hover:underline"
                >
                  2743356935@qq.com
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 底部 */}
      <footer className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
        <p>⚓ 下一站·启航 NextStep · 让大学每一步都走得更笃定</p>
        <p className="mt-1">AI 建议仅供参考，最终决策请结合自身实际情况</p>
      </footer>
    </div>
  );
}

/* --- 子组件 --- */

function SelectField({
  label,
  value,
  onChange,
  options,
  dark = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  dark?: boolean;
}) {
  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${dark ? 'text-slate-200 dark:text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
        {label}
      </label>
      <select
        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition cursor-pointer appearance-none bg-no-repeat bg-right
          ${dark
            ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/50'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/50'
          }`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
          backgroundPosition: 'calc(100% - 14px) center',
          paddingRight: '40px',
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  leftLabel,
  rightLabel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
}) {
  const percent = ((value - 1) / 9) * 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-2.5">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
        <span className="text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          {value} 分
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #6366f1 0%, #a855f7 ${percent}%, #e2e8f0 ${percent}%, #e2e8f0 100%)`,
        }}
      />
      <div className="flex justify-between mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
        <span>1 分 · {leftLabel}</span>
        <span>10 分 · {rightLabel}</span>
      </div>
    </div>
  );
}

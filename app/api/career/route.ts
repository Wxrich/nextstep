import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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

export async function POST(request: Request) {
  try {
    if (!process.env.SILICONFLOW_API_KEY) {
      return NextResponse.json(
        { error: '未配置 SILICONFLOW_API_KEY，请在 .env.local 中设置后再试' },
        { status: 500 }
      );
    }

    // 初始化大模型客户端（使用硅基流动）
    const client = new OpenAI({
      apiKey: process.env.SILICONFLOW_API_KEY,
      baseURL: 'https://api.siliconflow.cn/v1',
    });

    const { profile } = (await request.json()) as { profile: Profile };

    // 获取当前日期，用于计算考试倒计时
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentYear = now.getFullYear();

    // 组织提示词 Prompt
    const prompt = `
    你是一个大学全周期生涯规划导师。请针对以下学生的年级、硬实力和环境，给出犀利、客观、中肯的建议，并根据他们目前所处的阶段，规划从当下到毕业的完整成长路线。

    【今日日期】：${todayStr}（${currentYear}年）
    【学生画像】：
    - 当前年级：${profile.grade}
    - 学校档次：${profile.schoolTier}
    - 专业大类：${profile.major}
    - 绩点排名：${profile.gpa}
    - 英语水平：${profile.english}
    - 实习 / 科研经历：${profile.internshipCount}
    - 实习 / 科研含金量：${profile.internshipQuality}
    - 荣誉奖项：${profile.honors}
    - 学科竞赛：${profile.competition}
    - 家庭资金预算（年）：${profile.budget}
    - 稳定性偏好：${profile.stabilityPref} 分（满分10分，分数越高越倾向体制内/稳定）
    - 抗压能力：${profile.stressTolerance} 分（满分10分，分数越低越建议避开竞争极度白热化的路径）
    - 当前时间节点：${profile.currentMonth}

    【输出格式要求】：
    请严格按照以下结构输出，使用流畅的 markdown 格式。内容不要空洞，必须极具可操作性。语气要像一个靠谱的学长/学姐，讲真话、不贩卖焦虑。

    1. 【阶段诊断】：一句话点出该同学目前处于什么阶段、最大短板和核心优势分别是什么。

    2. 【四大方向匹配度】：结合年级、专业、硬实力等因素，为【考研/保研】、【考公/事业编】、【就业】、【出国深造】四条路径分别打分（满分100分），并用一句话说明推荐或不推荐的核心理由。
       - 注意：如果是大一/大二学生，方向建议应留有探索空间，侧重"打基础"而非"定终身"。
       - 如果是大三及以上，则给出更明确的方向取舍建议。

    3. 【关键考试倒计时日历】：
       以今日日期 ${todayStr} 为基准，列出接下来 12 个月内大学生最关心的重要考试时间和剩余天数。请用表格形式呈现，至少包含以下类别（根据年级和方向有所侧重）：
       - 英语类：CET-4、CET-6、雅思、托福
       - 升学类：考研初试、考研复试
       - 公考类：国考笔试、省考笔试（联考）
       - 职业资格类：教师资格证笔试/面试、计算机二级、初级会计、法考等
       - 其他：秋招/春招黄金期提醒

       表格列包括：| 考试名称 | 预计考试时间 | 距今天数 | 紧迫程度 | 适合人群/备注 |
       紧迫程度用 🔥 数量表示（1-5个火，越多越紧急）。
       只列未来 12 个月内的，已考过的不要列。考试时间请参考近年常规时间安排。

    4. 【成长路线图 · 概要版】（免费可见）：
       根据"当前年级（${profile.grade}）"和"当前时间节点（${profile.currentMonth}）"，给出高层级的规划建议，包含：
       - 【本学期核心任务】：接下来 3 个月最该做的 3-5 件事（按优先级排序，每点一句话概括）
       - 【下学年大方向】：接下来 6-12 个月的重点目标和里程碑（3-4 条）
       - 【该放弃/减少投入的事】：明确指出现在应该砍掉什么、减少什么投入（2-3 条）

    5. 【避坑指南】：指出处于该年级的学生最容易犯的典型错误和心态陷阱（至少 3 条）。

    6. 【一句话总结】：用一句犀利、好记的话，概括这个阶段最该记住的道理。

    ---

    🔒 PREMIUM_CONTENT_START 🔒

    7. 【会员专享 · 学期级详细成长路线图】：
       这是报告中最有价值的部分。请根据学生的当前年级（${profile.grade}）和目标方向，以"学期"为单位，规划从当前学期到毕业的完整路线图。每个学期下面再细化到"每月任务清单"。

       要求：
       - 覆盖从当前学期到毕业的所有学期（大一/大二学生覆盖更多学期，大三/大四学生聚焦剩余学期）
       - 每个学期用 ### 标题，格式如：### 大二上学期（202X年9月-202X年1月）
       - 每个学期下面分月列出具体任务，格式如：
         **9月**：xxx
         **10月**：xxx
         ...以此类推
       - 每月任务必须极度具体：具体到看什么书、刷什么题、投哪些公司、参加什么比赛、联系哪些老师、每天学几个小时等
       - 要根据学生的专业（${profile.major}）、学校档次（${profile.schoolTier}）、目标方向来定制，不能泛泛而谈
       - 每个学期末给出一个"学期验收清单"，列出该学期结束时必须达成的硬指标

       如果是大一/大二学生，规划要兼顾探索和打基础，不要过早定死方向。
       如果是大三及以上，规划要非常聚焦，给出冲刺路线和备选方案。

    8. 【会员专享 · 目标拆解 & 每周时间分配建议】：
       - 将大目标拆解成可执行的周度任务
       - 给出一张典型的"一周时间分配表"，包括：课程学习、英语提升、专业技能、实习/科研、运动休息等各占多少小时
       - 推荐 3-5 个具体的学习资源/书籍/课程/网站（根据专业和方向定制）

    🔒 PREMIUM_CONTENT_END 🔒
    `;

    const completion = await client.chat.completions.create({
      model: 'deepseek-ai/DeepSeek-V3',
      messages: [
        {
          role: 'system',
          content:
            '你是一个犀利、讲大实话的中国大学生全周期规划导师。你懂大一的迷茫、大二的探索、大三的抉择、大四的冲刺。你擅长帮学生做清醒的定位和分阶段的时间规划，从不讲空话，每条建议都具体可执行。你非常熟悉中国大学的各个关键时间节点（考试、竞赛、实习、秋招春招、考研考公等）。',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const report = completion.choices[0].message.content;

    return NextResponse.json({ report });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to generate path suggestions' }, { status: 500 });
  }
}

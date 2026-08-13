import type { Locale } from '../i18n';

export type SocialLink = {
  label: string;
  href: string;
};

export type ResumeItem = {
  title: string;
  org: string;
  orgUrl: string;
  logo: string;
  location: string;
  dateLabel: string;
  description: string;
  current?: boolean;
};

export type HomeProfile = {
  name: string;
  role: string;
  institution: string;
  institutionUrl: string;
  bio: string;
  avatar: string;
  interests: string[];
  social: SocialLink[];
};

export const contactEmail = 'zvictorliu@outlook.com';

const zhProfile: HomeProfile = {
  name: '刘宗炜',
  role: 'Agent 工程',
  institution: '上海交通大学',
  institutionUrl: 'https://www.sjtu.edu.cn/',
  bio: `吾本蜀人，负笈申江。在交大读电子信息硕士，做智能体：搭过 Agent 工作流，写过一套 Harness，也在学评测和 RAG。

本科测控，后来做导航算法，再转到 Agent。赛道换了几次，底层是通的。`,
  avatar: '/images/avatar.jpg',
  interests: ['Agent 框架', 'RAG', '评测'],
  social: [
    { label: '邮件', href: 'mailto:zvictorliu@outlook.com' },
    { label: 'GitHub', href: 'https://github.com/zvictorliu' },
    { label: '技术博客', href: 'https://zvictorliu.github.io/techBlog/' },
  ],
};

const enProfile: HomeProfile = {
  name: 'Zongwei Liu',
  role: 'Agent engineering',
  institution: 'Shanghai Jiao Tong University',
  institutionUrl: 'https://www.sjtu.edu.cn/',
  bio: `I grew up in Sichuan and study electronic information at Shanghai Jiao Tong University. I build agents — workflows, harnesses, and the evaluation around them.

I started in instrumentation, spent time on GNSS, then moved to agents. The stack changed; the underlying logic did not.`,
  avatar: '/images/avatar.jpg',
  interests: ['Agent harness', 'RAG', 'Evaluation'],
  social: [
    { label: 'Email', href: 'mailto:zvictorliu@outlook.com' },
    { label: 'GitHub', href: 'https://github.com/zvictorliu' },
    { label: 'Tech Blog', href: 'https://zvictorliu.github.io/techBlog/' },
  ],
};

const zhEducation: ResumeItem[] = [
  {
    title: '电子信息硕士',
    org: '上海交通大学',
    orgUrl: 'https://www.sjtu.edu.cn/',
    logo: '/media/icons/brands/sjtulogo.svg',
    location: '上海',
    dateLabel: '2024年9月 – 至今',
    description: '导航定位方向，同时把精力转到智能体工程。',
    current: true,
  },
  {
    title: '测控技术与仪器学士',
    org: '上海交通大学',
    orgUrl: 'https://www.sjtu.edu.cn/',
    logo: '/media/icons/brands/sjtulogo.svg',
    location: '上海',
    dateLabel: '2020年9月 – 2024年6月',
    description: '',
  },
];

const enEducation: ResumeItem[] = [
  {
    title: 'MSc in Electronic Information',
    org: 'Shanghai Jiao Tong University',
    orgUrl: 'https://www.sjtu.edu.cn/',
    logo: '/media/icons/brands/sjtulogo.svg',
    location: 'Shanghai',
    dateLabel: 'Sep 2024 – Present',
    description: 'GNSS research, while shifting toward agent engineering.',
    current: true,
  },
  {
    title: 'BSc in Measurement and Instrumentation',
    org: 'Shanghai Jiao Tong University',
    orgUrl: 'https://www.sjtu.edu.cn/',
    logo: '/media/icons/brands/sjtulogo.svg',
    location: 'Shanghai',
    dateLabel: 'Sep 2020 – Jun 2024',
    description: '',
  },
];

const zhExperience: ResumeItem[] = [
  {
    title: 'AI研发实习',
    org: '华测导航',
    orgUrl: 'https://www.chcnav.com/',
    logo: '/media/icons/brands/huace.jpg',
    location: '上海',
    dateLabel: '2025年6月 – 至今',
    description: '把 AI 嵌进团队日常，做提效工具与知识库助手。',
    current: true,
  },
  {
    title: '应用开发实习',
    org: '软银机器人',
    orgUrl: 'https://www.softbankrobotics.com.cn/',
    logo: '/media/icons/brands/softbank-robotics.png',
    location: '上海',
    dateLabel: '2023年6月 – 2023年8月',
    description: '开发 Pepper 机器人应用软件。',
  },
];

const enExperience: ResumeItem[] = [
  {
    title: 'AI Research Intern',
    org: 'CHC Navigation',
    orgUrl: 'https://www.chcnav.com/',
    logo: '/media/icons/brands/huace.jpg',
    location: 'Shanghai',
    dateLabel: 'Jun 2025 – Present',
    description: 'Building AI tools and a knowledge-base assistant inside the team’s daily work.',
    current: true,
  },
  {
    title: 'Development Intern',
    org: 'Softbank Robotics',
    orgUrl: 'https://www.softbankrobotics.com.cn/',
    logo: '/media/icons/brands/softbank-robotics.png',
    location: 'Shanghai',
    dateLabel: 'Jun 2023 – Aug 2023',
    description: 'Developed application software for the Pepper robot.',
  },
];

export const homeByLocale: Record<
  Locale,
  { profile: HomeProfile; education: ResumeItem[]; experience: ResumeItem[] }
> = {
  zh: { profile: zhProfile, education: zhEducation, experience: zhExperience },
  en: { profile: enProfile, education: enEducation, experience: enExperience },
};

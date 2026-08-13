import type { Locale } from '../i18n';

export type SocialLink = {
  label: string;
  href: string;
};

export type PathItem = {
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
  title: string;
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
  title: '研二找实习ing',
  institution: '上海交通大学',
  institutionUrl: 'https://www.sjtu.edu.cn/',
  bio: `我是刘宗炜，来自四川，本科毕业于上海交通大学电院，目前同在上海交通大学攻读硕士。
目前对 AI 智能体开发感兴趣，有意从事相关职业；做过 Agentic Workflow 相关项目，搭建过 Agent Harness 系统，目前也在学习 Agent Evaluation、RAG 等方面的内容。`,
  avatar: '/images/avatar.jpg',
  interests: ['Agent 框架', 'RAG', 'Agent Evaluation'],
  social: [
    { label: '邮件', href: 'mailto:zvictorliu@outlook.com' },
    { label: 'GitHub', href: 'https://github.com/zvictorliu' },
    { label: '技术博客', href: 'https://zvictorliu.github.io/techBlog/' },
  ],
};

const enProfile: HomeProfile = {
  name: 'Zongwei Liu',
  title: 'A postgraduate',
  institution: 'Shanghai Jiao Tong University',
  institutionUrl: 'https://www.sjtu.edu.cn/',
  bio: `Welcome! I am Zongwei Liu, a graduate student at SJTU, majoring in Electronic Information. I am pursuing a master degree in Shanghai Jiao Tong University. Hope I can graduate smoothly and have a beautiful life in the future.`,
  avatar: '/images/avatar.jpg',
  interests: ['AI Agent', 'Linux'],
  social: [
    { label: 'Email', href: 'mailto:zvictorliu@outlook.com' },
    { label: 'GitHub', href: 'https://github.com/zvictorliu' },
    { label: 'Tech Blog', href: 'https://zvictorliu.github.io/techBlog/' },
  ],
};

const zhPath: PathItem[] = [
  {
    title: 'AI研发实习',
    org: '华测导航',
    orgUrl: 'https://www.chcnav.com/',
    logo: '/media/icons/brands/huace.jpg',
    location: '上海',
    dateLabel: '2025年6月 – 至今',
    description: '将 AI 与团队工作结合，开发提效工具。',
    current: true,
  },
  {
    title: '电子信息硕士',
    org: '上海交通大学',
    orgUrl: 'https://www.sjtu.edu.cn/',
    logo: '/media/icons/brands/sjtulogo.svg',
    location: '上海',
    dateLabel: '2024年9月 – 至今',
    description: '从导航定位转向智能体工程。',
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

const enPath: PathItem[] = [
  {
    title: 'AI Research Intern',
    org: 'CHC Navigation',
    orgUrl: 'https://www.chcnav.com/',
    logo: '/media/icons/brands/huace.jpg',
    location: 'Shanghai',
    dateLabel: 'Jun 2025 – Present',
    description: 'Building AI tools that sit inside the team’s daily work.',
    current: true,
  },
  {
    title: 'MSc in Electronic Information',
    org: 'Shanghai Jiao Tong University',
    orgUrl: 'https://www.sjtu.edu.cn/',
    logo: '/media/icons/brands/sjtulogo.svg',
    location: 'Shanghai',
    dateLabel: 'Sep 2024 – Present',
    description: 'Moving from navigation algorithms toward agent engineering.',
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

export const homeByLocale: Record<Locale, { profile: HomeProfile; path: PathItem[] }> = {
  zh: { profile: zhProfile, path: zhPath },
  en: { profile: enProfile, path: enPath },
};

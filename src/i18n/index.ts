// 定义翻译键类型
export type Locale = 'en' | 'zh';

export type TranslationKeys = {
  nav: {
    home: string;
    about: string;
    skills: string;
    education: string;
    experience: string;
    posts: string;
    publications: string;
    contact: string;
  };
  profile: {
    title: string;
  };
  about: {
    biography: string;
    interests: string;
    education: string;
  };
  skills: {
    title: string;
    technical: string;
    hobbies: string;
  };
  education: {
    title: string;
  };
  experience: {
    title: string;
  };
  posts: {
    title: string;
    minRead: string;
    seeAll: string;
  };
  publications: {
    title: string;
    seeAll: string;
  };
  contact: {
    title: string;
    getInTouch: string;
    message: string;
    form: {
      name: string;
      email: string;
      message: string;
      send: string;
    };
  };
};

// 定义语言包类型
type Translations = Record<Locale, TranslationKeys>;

// 英文翻译
const enTranslations: TranslationKeys = {
  nav: {
    home: 'Home',
    about: 'About',
    skills: 'Skills',
    education: 'Education',
    experience: 'Experience',
    posts: 'Posts',
    publications: 'Publications',
    contact: 'Contact'
  },
  profile: {
    title: 'Graduate Student'
  },
  about: {
    biography: 'Biography',
    interests: 'Interests',
    education: 'Education'
  },
  skills: {
    title: 'Skills',
    technical: 'Technical',
    hobbies: 'Hobbies'
  },
  education: {
    title: 'Education'
  },
  experience: {
    title: 'Experience'
  },
  posts: {
    title: 'Recent Posts',
    minRead: 'min read',
    seeAll: 'See all posts'
  },
  publications: {
    title: 'Publications',
    seeAll: 'See all publications'
  },
  contact: {
    title: 'Contact',
    getInTouch: 'Get in Touch',
    message: 'Feel free to reach out if you want to collaborate with me, or simply have a chat.',
    form: {
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send Message'
    }
  }
};

// 中文翻译
const zhTranslations: TranslationKeys = {
  nav: {
    home: '首页',
    about: '关于',
    skills: '技能',
    education: '教育',
    experience: '经历',
    posts: '博客',
    publications: '发表',
    contact: '联系'
  },
  profile: {
    title: '研二找实习ing'
  },
  about: {
    biography: '个人简介',
    interests: '兴趣点',
    education: '教育背景'
  },
  skills: {
    title: '技能',
    technical: '技术',
    hobbies: '爱好'
  },
  education: {
    title: '教育经历'
  },
  experience: {
    title: '工作经历'
  },
  posts: {
    title: '最新博客',
    minRead: '分钟阅读',
    seeAll: '查看所有博客'
  },
  publications: {
    title: '发表情况',
    seeAll: '查看所有发表'
  },
  contact: {
    title: '联系',
    getInTouch: '联系我',
    message: '如果您想与我合作或只是想聊聊，请随时联系我。',
    form: {
      name: '姓名',
      email: '邮箱',
      message: '消息',
      send: '发送消息'
    }
  }
};

// 语言包
const translations: Translations = {
  en: enTranslations,
  zh: zhTranslations
};

export const getLangFromUrl = (url: URL): Locale => {
  const [, lang] = url.pathname.split('/');
  if (lang in translations) return lang as Locale;
  return 'zh'; // 默认返回中文
};

export const useTranslations = (lang: Locale): TranslationKeys => {
  return translations[lang];
};

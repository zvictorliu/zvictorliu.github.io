export type Locale = 'en' | 'zh';

export type TranslationKeys = {
  nav: {
    experience: string;
    education: string;
    work: string;
    about: string;
    room: string;
  };
  brand: string;
  profile: {
    title: string;
  };
  about: {
    biography: string;
    interests: string;
  };
  education: {
    title: string;
  };
  experience: {
    title: string;
  };
  posts: {
    title: string;
    seeAll: string;
  };
  work: {
    title: string;
    homeTitle: string;
    seeAll: string;
    details: string;
    featured: string;
    kindProject: string;
    kindPublication: string;
  };
  publications: {
    title: string;
    seeAll: string;
  };
  contact: {
    title: string;
    message: string;
  };
  room: {
    hint: string;
    skip: string;
  };
};

type Translations = Record<Locale, TranslationKeys>;

const enTranslations: TranslationKeys = {
  nav: {
    experience: 'Experience',
    education: 'Education',
    work: 'Work',
    about: 'About',
    room: 'Room',
  },
  brand: 'Zongwei Liu',
  profile: {
    title: 'Graduate Student',
  },
  about: {
    biography: 'Biography',
    interests: 'Interests',
  },
  education: {
    title: 'Education',
  },
  experience: {
    title: 'Experience',
  },
  posts: {
    title: 'Writing',
    seeAll: 'See all posts',
  },
  work: {
    title: 'Projects',
    homeTitle: 'Work',
    seeAll: 'See all projects',
    details: 'Details',
    featured: 'Selected',
    kindProject: 'Project',
    kindPublication: 'Paper',
  },
  publications: {
    title: 'Publications',
    seeAll: 'See all publications',
  },
  contact: {
    title: 'Contact',
    message: 'Feel free to write. I read everything.',
  },
  room: {
    hint: 'Drag to look around · scroll to zoom',
    skip: 'Click to skip',
  },
};

const zhTranslations: TranslationKeys = {
  nav: {
    experience: '经历',
    education: '教育',
    work: '做过的事',
    about: '关于',
    room: '房间',
  },
  brand: '刘宗炜',
  profile: {
    title: 'Agent 工程',
  },
  about: {
    biography: '个人简介',
    interests: '兴趣点',
  },
  education: {
    title: '教育经历',
  },
  experience: {
    title: '实习经历',
  },
  posts: {
    title: '写作',
    seeAll: '查看所有文章',
  },
  work: {
    title: '项目',
    homeTitle: '做过的事',
    seeAll: '查看所有项目',
    details: '详情',
    featured: '精选',
    kindProject: '项目',
    kindPublication: '论文',
  },
  publications: {
    title: '发表',
    seeAll: '查看所有发表',
  },
  contact: {
    title: '联系',
    message: '请随时联系我',
  },
  room: {
    hint: '拖动视角 · 滚轮缩放',
    skip: '点击跳过',
  },
};

const translations: Translations = {
  en: enTranslations,
  zh: zhTranslations,
};

export const getLangFromUrl = (url: URL): Locale => {
  const [, lang] = url.pathname.split('/');
  if (lang in translations) return lang as Locale;
  return 'zh';
};

export const useTranslations = (lang: Locale): TranslationKeys => {
  return translations[lang];
};

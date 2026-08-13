export type Locale = 'en' | 'zh';

export type TranslationKeys = {
  nav: {
    experience: string;
    education: string;
    work: string;
    about: string;
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
    seeAll: string;
    details: string;
    featured: string;
  };
  publications: {
    title: string;
    seeAll: string;
  };
  contact: {
    title: string;
    message: string;
  };
};

type Translations = Record<Locale, TranslationKeys>;

const enTranslations: TranslationKeys = {
  nav: {
    experience: 'Experience',
    education: 'Education',
    work: 'Projects',
    about: 'About',
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
    seeAll: 'See all projects',
    details: 'Details',
    featured: 'Selected',
  },
  publications: {
    title: 'Publications',
    seeAll: 'See all publications',
  },
  contact: {
    title: 'Contact',
    message: 'Feel free to write. I read everything.',
  },
};

const zhTranslations: TranslationKeys = {
  nav: {
    experience: '经历',
    education: '教育',
    work: '项目',
    about: '关于',
  },
  brand: '刘宗炜',
  profile: {
    title: '研二找实习ing',
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
    title: '项目经历',
    seeAll: '查看所有项目',
    details: '详情',
    featured: '精选',
  },
  publications: {
    title: '发表',
    seeAll: '查看所有发表',
  },
  contact: {
    title: '联系',
    message: '有事请写信，我会读。',
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

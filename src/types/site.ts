// Типы для структуры сайта
export interface SiteSection {
  id: string;
  type: 'header' | 'hero' | 'about' | 'services' | 'contact' | 'footer';
  title: string;
  enabled: boolean;
  order: number;
  data: any;
}

export interface HeaderData {
  logo: string;
  navigation: Array<{
    label: string;
    href: string;
  }>;
  ctaButton?: {
    text: string;
    href: string;
  };
}

export interface HeroData {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  ctaButton?: {
    text: string;
    href: string;
  };
  secondaryButton?: {
    text: string;
    href: string;
  };
}

export interface AboutData {
  title: string;
  description: string;
  image?: string;
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export interface ServiceData {
  title: string;
  description: string;
  icon: string;
  price?: string;
  features: string[];
}

export interface ServicesData {
  title: string;
  subtitle: string;
  services: ServiceData[];
}

export interface ContactData {
  title: string;
  subtitle: string;
  email: string;
  phone: string;
  address: string;
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
}

export interface FooterData {
  logo: string;
  description: string;
  links: Array<{
    title: string;
    links: Array<{
      label: string;
      href: string;
    }>;
  }>;
  copyright: string;
}

export interface SiteConfig {
  site: {
    title: string;
    description: string;
    logo: string;
    favicon: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  sections: SiteSection[];
  pages: Array<{
    id: string;
    title: string;
    slug: string;
    content: string;
    published: boolean;
  }>;
}

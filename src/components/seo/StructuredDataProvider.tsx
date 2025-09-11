/**
 * StructuredDataProvider Component
 * 生成JSON-LD结构化数据，支持多种Schema.org类型
 * Features: WebSite、HowTo、FAQ、BreadcrumbList、Organization等
 */

'use client';

import React from 'react';
import Script from 'next/script';

// Schema.org结构化数据类型
export type StructuredDataType = 
  | 'WebSite'
  | 'Organization'
  | 'HowTo'
  | 'FAQ'
  | 'BreadcrumbList'
  | 'SoftwareApplication'
  | 'Calculator'
  | 'Article';

// 基础Schema接口
export interface BaseSchema {
  '@context': 'https://schema.org';
  '@type': StructuredDataType | string;
}

// 网站Schema
export interface WebSiteSchema extends BaseSchema {
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
  publisher?: OrganizationSchema;
}

// 组织Schema
export interface OrganizationSchema extends BaseSchema {
  '@type': 'Organization';
  name: string;
  url: string;
  description?: string;
  logo?: {
    '@type': 'ImageObject';
    url: string;
    width?: number;
    height?: number;
  };
  sameAs?: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    contactType: string;
    email?: string;
    url?: string;
  };
}

// HowTo Schema
export interface HowToSchema extends BaseSchema {
  '@type': 'HowTo';
  name: string;
  description: string;
  image?: string[];
  totalTime?: string;
  tool?: string[];
  supply?: string[];
  step: Array<{
    '@type': 'HowToStep';
    name: string;
    text: string;
    image?: string;
    url?: string;
  }>;
}

// FAQ Schema
export interface FAQSchema extends BaseSchema {
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

// 面包屑Schema
export interface BreadcrumbListSchema extends BaseSchema {
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

// 软件应用Schema
export interface SoftwareApplicationSchema extends BaseSchema {
  '@type': 'SoftwareApplication';
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  browserRequirements?: string;
  softwareVersion?: string;
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    ratingCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}

// 文章Schema
export interface ArticleSchema extends BaseSchema {
  '@type': 'Article';
  headline: string;
  description: string;
  author: {
    '@type': 'Organization' | 'Person';
    name: string;
  };
  publisher: OrganizationSchema;
  datePublished: string;
  dateModified?: string;
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
  image?: string[];
}

// 结构化数据配置
export interface StructuredDataConfig {
  website?: WebSiteSchema;
  organization?: OrganizationSchema;
  howTo?: HowToSchema;
  faq?: FAQSchema;
  breadcrumb?: BreadcrumbListSchema;
  softwareApplication?: SoftwareApplicationSchema;
  article?: ArticleSchema;
}

// 预定义的结构化数据模板
export class StructuredDataTemplates {
  private static readonly SITE_URL = 'https://statcal.com';
  private static readonly ORGANIZATION_NAME = 'StatCal';

  // 基础网站Schema
  static getWebSiteSchema(): WebSiteSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'StatCal - Statistical Calculators',
      url: this.SITE_URL,
      description: 'Free online statistical calculators for mean, standard deviation, GPA, and more statistical analysis tools.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${this.SITE_URL}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      },
      publisher: this.getOrganizationSchema()
    };
  }

  // 组织Schema
  static getOrganizationSchema(): OrganizationSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.ORGANIZATION_NAME,
      url: this.SITE_URL,
      description: 'Provider of free online statistical calculators and data analysis tools.',
      logo: {
        '@type': 'ImageObject',
        url: `${this.SITE_URL}/logo.png`,
        width: 200,
        height: 60
      },
      sameAs: [
        // 'https://twitter.com/statcal',
        // 'https://github.com/statcal'
      ]
    };
  }

  // Mean Calculator的HowTo Schema
  static getMeanCalculatorHowTo(): HowToSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to Calculate Mean (Average) Online',
      description: 'Step-by-step guide to calculate the arithmetic mean of numbers using our free online calculator.',
      totalTime: 'PT2M',
      tool: ['Mean Calculator', 'Online Calculator'],
      supply: ['Numbers to calculate'],
      step: [
        {
          '@type': 'HowToStep',
          name: 'Enter your numbers',
          text: 'Enter the numbers you want to calculate the mean for, separated by commas or line breaks.',
          url: `${this.SITE_URL}/calculator/mean#input`
        },
        {
          '@type': 'HowToStep',
          name: 'Choose precision',
          text: 'Select the number of decimal places for your result (typically 2-4 decimal places).',
          url: `${this.SITE_URL}/calculator/mean#precision`
        },
        {
          '@type': 'HowToStep',
          name: 'Calculate result',
          text: 'Click the calculate button to get your mean (average) result instantly.',
          url: `${this.SITE_URL}/calculator/mean#calculate`
        },
        {
          '@type': 'HowToStep',
          name: 'View explanation',
          text: 'Review the step-by-step calculation and statistical explanation of the result.',
          url: `${this.SITE_URL}/calculator/mean#explanation`
        }
      ]
    };
  }

  // Standard Deviation Calculator的HowTo Schema
  static getStandardDeviationHowTo(): HowToSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to Calculate Standard Deviation Online',
      description: 'Complete guide to calculate population and sample standard deviation with our free online tool.',
      totalTime: 'PT3M',
      tool: ['Standard Deviation Calculator', 'Statistical Calculator'],
      supply: ['Dataset', 'Numbers for analysis'],
      step: [
        {
          '@type': 'HowToStep',
          name: 'Input your data',
          text: 'Enter your dataset numbers separated by commas, spaces, or line breaks.',
          url: `${this.SITE_URL}/calculator/standard-deviation#input`
        },
        {
          '@type': 'HowToStep',
          name: 'Select calculation type',
          text: 'Choose between population standard deviation (σ) or sample standard deviation (s).',
          url: `${this.SITE_URL}/calculator/standard-deviation#type`
        },
        {
          '@type': 'HowToStep',
          name: 'Configure settings',
          text: 'Set precision, outlier handling, and visualization preferences.',
          url: `${this.SITE_URL}/calculator/standard-deviation#settings`
        },
        {
          '@type': 'HowToStep',
          name: 'Calculate and analyze',
          text: 'Get your standard deviation result with detailed statistical analysis and visualization.',
          url: `${this.SITE_URL}/calculator/standard-deviation#results`
        }
      ]
    };
  }

  // GPA Calculator的HowTo Schema
  static getGPACalculatorHowTo(): HowToSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to Calculate GPA with Multiple Grading Systems',
      description: 'Learn how to calculate your Grade Point Average using 4.0, 4.3, 4.5, and custom grading scales.',
      totalTime: 'PT5M',
      tool: ['GPA Calculator', 'Grade Point Calculator'],
      supply: ['Course grades', 'Credit hours'],
      step: [
        {
          '@type': 'HowToStep',
          name: 'Choose grading system',
          text: 'Select your grading system: 4.0 scale (US), 4.3 scale (Canadian), 4.5 scale, or create custom.',
          url: `${this.SITE_URL}/calculator/gpa#system`
        },
        {
          '@type': 'HowToStep',
          name: 'Add your courses',
          text: 'Enter course names, letter grades, and credit hours for each course.',
          url: `${this.SITE_URL}/calculator/gpa#courses`
        },
        {
          '@type': 'HowToStep',
          name: 'Configure options',
          text: 'Set calculation precision and handle retakes or excluded courses if needed.',
          url: `${this.SITE_URL}/calculator/gpa#options`
        },
        {
          '@type': 'HowToStep',
          name: 'Calculate GPA',
          text: 'Get your calculated GPA with grade distribution analysis and academic performance insights.',
          url: `${this.SITE_URL}/calculator/gpa#results`
        }
      ]
    };
  }

  // Percent Error Calculator的HowTo Schema
  static getPercentErrorCalculatorHowTo(): HowToSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to Calculate Percent Error Between Theoretical and Experimental Values',
      description: 'Step-by-step guide to calculate percentage error between theoretical and experimental values using our online calculator.',
      totalTime: 'PT3M',
      tool: ['Percent Error Calculator', 'Error Analysis Calculator'],
      supply: ['Theoretical value', 'Experimental value'],
      step: [
        {
          '@type': 'HowToStep',
          name: 'Enter theoretical value',
          text: 'Input the expected or theoretical value that serves as your reference point.',
          url: `${this.SITE_URL}/calculator/percent-error#theoretical`
        },
        {
          '@type': 'HowToStep',
          name: 'Enter experimental value',
          text: 'Input the measured or experimental value from your test or observation.',
          url: `${this.SITE_URL}/calculator/percent-error#experimental`
        },
        {
          '@type': 'HowToStep',
          name: 'Set precision',
          text: 'Choose the number of decimal places for your percent error result.',
          url: `${this.SITE_URL}/calculator/percent-error#precision`
        },
        {
          '@type': 'HowToStep',
          name: 'Calculate and analyze',
          text: 'Get your percent error result with detailed calculation steps and accuracy assessment.',
          url: `${this.SITE_URL}/calculator/percent-error#results`
        }
      ]
    };
  }

  // Range Calculator的HowTo Schema
  static getRangeCalculatorHowTo(): HowToSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to Calculate Data Range and Statistical Spread',
      description: 'Learn how to calculate data range, minimum, maximum, and distribution analysis using our statistical calculator.',
      totalTime: 'PT4M',
      tool: ['Range Calculator', 'Statistical Analysis Tool'],
      supply: ['Data set', 'Numbers to analyze'],
      step: [
        {
          '@type': 'HowToStep',
          name: 'Input your data',
          text: 'Enter your numbers separated by commas, spaces, or line breaks for range analysis.',
          url: `${this.SITE_URL}/calculator/range#input`
        },
        {
          '@type': 'HowToStep',
          name: 'Choose analysis level',
          text: 'Select student, teacher, or research mode for different levels of statistical analysis.',
          url: `${this.SITE_URL}/calculator/range#mode`
        },
        {
          '@type': 'HowToStep',
          name: 'Set precision',
          text: 'Configure decimal places for your range and statistical results.',
          url: `${this.SITE_URL}/calculator/range#precision`
        },
        {
          '@type': 'HowToStep',
          name: 'Analyze results',
          text: 'View range, quartiles, outliers, and comprehensive distribution analysis.',
          url: `${this.SITE_URL}/calculator/range#analysis`
        }
      ]
    };
  }

  // 通用FAQ Schema
  static getCalculatorFAQ(): FAQSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Are these calculators free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, all our statistical calculators are completely free to use. No registration or payment required.'
          }
        },
        {
          '@type': 'Question',
          name: 'How accurate are the calculations?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our calculators use precise mathematical algorithms and are tested against official standards. Results are accurate to the decimal precision you select.'
          }
        },
        {
          '@type': 'Question',
          name: 'Can I use these calculators for academic work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, our calculators are designed for students, researchers, and professionals. They provide step-by-step explanations to help you understand the calculations.'
          }
        },
        {
          '@type': 'Question',
          name: 'Do you store my data?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No, all calculations are performed in your browser. We do not store or transmit your data to our servers.'
          }
        },
        {
          '@type': 'Question',
          name: 'What browsers are supported?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our calculators work on all modern browsers including Chrome, Firefox, Safari, and Edge. Mobile devices are fully supported.'
          }
        }
      ]
    };
  }

  // 面包屑导航Schema
  static getBreadcrumbSchema(items: Array<{name: string, url?: string}>): BreadcrumbListSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url ? `${this.SITE_URL}${item.url}` : undefined
      }))
    };
  }

  // 软件应用Schema
  static getSoftwareApplicationSchema(toolName: string, toolPath: string): SoftwareApplicationSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `${toolName} - StatCal`,
      description: `Free online ${toolName.toLowerCase()} for statistical calculations and data analysis.`,
      url: `${this.SITE_URL}${toolPath}`,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web Browser',
      browserRequirements: 'Requires JavaScript',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    };
  }
}

// StructuredDataProvider 组件
interface StructuredDataProviderProps {
  config: StructuredDataConfig;
  className?: string;
}

export const StructuredDataProvider: React.FC<StructuredDataProviderProps> = ({
  config,
  className
}) => {
  // 生成所有结构化数据的JSON-LD
  const generateStructuredData = () => {
    const schemas = [];
    
    if (config.website) schemas.push(config.website);
    if (config.organization) schemas.push(config.organization);
    if (config.howTo) schemas.push(config.howTo);
    if (config.faq) schemas.push(config.faq);
    if (config.breadcrumb) schemas.push(config.breadcrumb);
    if (config.softwareApplication) schemas.push(config.softwareApplication);
    if (config.article) schemas.push(config.article);
    
    return schemas;
  };

  const structuredData = generateStructuredData();

  return (
    <>
      {structuredData.map((schema, index) => (
        <Script
          key={index}
          id={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 0)
          }}
        />
      ))}
    </>
  );
};

// Hook for using structured data
export function useStructuredData(toolId?: string) {
  const getToolConfig = (toolId: string): StructuredDataConfig => {
    const baseConfig: StructuredDataConfig = {
      website: StructuredDataTemplates.getWebSiteSchema(),
      organization: StructuredDataTemplates.getOrganizationSchema(),
      faq: StructuredDataTemplates.getCalculatorFAQ()
    };

    switch (toolId) {
      case 'mean':
        return {
          ...baseConfig,
          howTo: StructuredDataTemplates.getMeanCalculatorHowTo(),
          softwareApplication: StructuredDataTemplates.getSoftwareApplicationSchema(
            'Mean Calculator',
            '/calculator/mean'
          ),
          breadcrumb: StructuredDataTemplates.getBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Calculators', url: '/calculator' },
            { name: 'Mean Calculator' }
          ])
        };

      case 'standard-deviation':
        return {
          ...baseConfig,
          howTo: StructuredDataTemplates.getStandardDeviationHowTo(),
          softwareApplication: StructuredDataTemplates.getSoftwareApplicationSchema(
            'Standard Deviation Calculator',
            '/calculator/standard-deviation'
          ),
          breadcrumb: StructuredDataTemplates.getBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Calculators', url: '/calculator' },
            { name: 'Standard Deviation Calculator' }
          ])
        };

      case 'gpa':
        return {
          ...baseConfig,
          howTo: StructuredDataTemplates.getGPACalculatorHowTo(),
          softwareApplication: StructuredDataTemplates.getSoftwareApplicationSchema(
            'GPA Calculator',
            '/calculator/gpa'
          ),
          breadcrumb: StructuredDataTemplates.getBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Calculators', url: '/calculator' },
            { name: 'GPA Calculator' }
          ])
        };

      case 'percent-error':
        return {
          ...baseConfig,
          howTo: StructuredDataTemplates.getPercentErrorCalculatorHowTo(),
          softwareApplication: StructuredDataTemplates.getSoftwareApplicationSchema(
            'Percent Error Calculator',
            '/calculator/percent-error'
          ),
          breadcrumb: StructuredDataTemplates.getBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Calculators', url: '/calculator' },
            { name: 'Percent Error Calculator' }
          ])
        };

      case 'range':
        return {
          ...baseConfig,
          howTo: StructuredDataTemplates.getRangeCalculatorHowTo(),
          softwareApplication: StructuredDataTemplates.getSoftwareApplicationSchema(
            'Range Calculator',
            '/calculator/range'
          ),
          breadcrumb: StructuredDataTemplates.getBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Calculators', url: '/calculator' },
            { name: 'Range Calculator' }
          ])
        };

      default:
        return baseConfig;
    }
  };

  return {
    getToolConfig,
    StructuredDataTemplates
  };
}

export default StructuredDataProvider;
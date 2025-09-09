/**
 * StructuredDataProvider测试文件
 * 测试JSON-LD结构化数据生成和验证功能
 */

import React from 'react';
import { render } from '@testing-library/react';
import { StructuredDataProvider, StructuredDataTemplates, useStructuredData } from '../StructuredDataProvider';
import { StructuredDataValidator } from '@/lib/seoUtils';

// Mock Next.js Script component
jest.mock('next/script', () => {
  return function MockScript({ children, dangerouslySetInnerHTML, ...props }: any) {
    return (
      <script
        {...props}
        dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      >
        {children}
      </script>
    );
  };
});

describe('StructuredDataTemplates', () => {
  describe('getWebSiteSchema', () => {
    it('should generate valid WebSite schema', () => {
      const schema = StructuredDataTemplates.getWebSiteSchema();
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebSite');
      expect(schema.name).toContain('StatCal');
      expect(schema.url).toBe('https://statcal.com');
      expect(schema.potentialAction).toBeDefined();
    });

    it('should include search action', () => {
      const schema = StructuredDataTemplates.getWebSiteSchema();
      
      expect(schema.potentialAction?.['@type']).toBe('SearchAction');
      expect(schema.potentialAction?.target).toBeDefined();
      expect(schema.potentialAction?.['query-input']).toBe('required name=search_term_string');
    });

    it('should include publisher information', () => {
      const schema = StructuredDataTemplates.getWebSiteSchema();
      
      expect(schema.publisher).toBeDefined();
      expect(schema.publisher?.['@type']).toBe('Organization');
      expect(schema.publisher?.name).toBe('StatCal');
    });
  });

  describe('getOrganizationSchema', () => {
    it('should generate valid Organization schema', () => {
      const schema = StructuredDataTemplates.getOrganizationSchema();
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('StatCal');
      expect(schema.url).toBe('https://statcal.com');
      expect(schema.description).toBeDefined();
    });

    it('should include logo information', () => {
      const schema = StructuredDataTemplates.getOrganizationSchema();
      
      expect(schema.logo).toBeDefined();
      expect(schema.logo?.['@type']).toBe('ImageObject');
      expect(schema.logo?.url).toContain('logo.png');
      expect(schema.logo?.width).toBe(200);
      expect(schema.logo?.height).toBe(60);
    });
  });

  describe('getMeanCalculatorHowTo', () => {
    it('should generate valid HowTo schema for Mean Calculator', () => {
      const schema = StructuredDataTemplates.getMeanCalculatorHowTo();
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('HowTo');
      expect(schema.name).toContain('Mean');
      expect(schema.description).toBeDefined();
      expect(schema.step).toHaveLength(4);
    });

    it('should have detailed steps', () => {
      const schema = StructuredDataTemplates.getMeanCalculatorHowTo();
      
      schema.step.forEach((step, index) => {
        expect(step['@type']).toBe('HowToStep');
        expect(step.name).toBeDefined();
        expect(step.text).toBeDefined();
        expect(step.text.length).toBeGreaterThan(20);
        expect(step.url).toContain('/calculator/mean');
      });
    });

    it('should include tools and supplies', () => {
      const schema = StructuredDataTemplates.getMeanCalculatorHowTo();
      
      expect(schema.tool).toContain('Mean Calculator');
      expect(schema.supply).toContain('Numbers to calculate');
      expect(schema.totalTime).toBe('PT2M');
    });
  });

  describe('getStandardDeviationHowTo', () => {
    it('should generate valid HowTo schema for Standard Deviation', () => {
      const schema = StructuredDataTemplates.getStandardDeviationHowTo();
      
      expect(schema['@type']).toBe('HowTo');
      expect(schema.name).toContain('Standard Deviation');
      expect(schema.step).toHaveLength(4);
      expect(schema.totalTime).toBe('PT3M');
    });
  });

  describe('getGPACalculatorHowTo', () => {
    it('should generate valid HowTo schema for GPA Calculator', () => {
      const schema = StructuredDataTemplates.getGPACalculatorHowTo();
      
      expect(schema['@type']).toBe('HowTo');
      expect(schema.name).toContain('GPA');
      expect(schema.step).toHaveLength(4);
      expect(schema.totalTime).toBe('PT5M');
    });

    it('should mention grading systems', () => {
      const schema = StructuredDataTemplates.getGPACalculatorHowTo();
      
      const firstStep = schema.step[0];
      expect(firstStep.text).toContain('4.0');
      expect(firstStep.text).toContain('4.3');
      expect(firstStep.text).toContain('4.5');
    });
  });

  describe('getCalculatorFAQ', () => {
    it('should generate valid FAQ schema', () => {
      const schema = StructuredDataTemplates.getCalculatorFAQ();
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('FAQPage');
      expect(schema.mainEntity).toBeDefined();
      expect(schema.mainEntity.length).toBeGreaterThanOrEqual(5);
    });

    it('should have well-formed questions and answers', () => {
      const schema = StructuredDataTemplates.getCalculatorFAQ();
      
      schema.mainEntity.forEach(item => {
        expect(item['@type']).toBe('Question');
        expect(item.name).toBeDefined();
        expect(item.name.length).toBeGreaterThan(10);
        expect(item.acceptedAnswer['@type']).toBe('Answer');
        expect(item.acceptedAnswer.text).toBeDefined();
        expect(item.acceptedAnswer.text.length).toBeGreaterThan(20);
      });
    });

    it('should address common user concerns', () => {
      const schema = StructuredDataTemplates.getCalculatorFAQ();
      const questions = schema.mainEntity.map(item => item.name.toLowerCase());
      
      expect(questions.some(q => q.includes('free'))).toBe(true);
      expect(questions.some(q => q.includes('accurate'))).toBe(true);
      expect(questions.some(q => q.includes('data') || q.includes('store'))).toBe(true);
    });
  });

  describe('getBreadcrumbSchema', () => {
    it('should generate valid Breadcrumb schema', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Calculators', url: '/calculator' },
        { name: 'Mean Calculator' }
      ];
      
      const schema = StructuredDataTemplates.getBreadcrumbSchema(items);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(3);
    });

    it('should assign correct positions', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Calculators', url: '/calculator' },
        { name: 'Mean Calculator' }
      ];
      
      const schema = StructuredDataTemplates.getBreadcrumbSchema(items);
      
      schema.itemListElement.forEach((item, index) => {
        expect(item.position).toBe(index + 1);
        expect(item.name).toBe(items[index].name);
      });
    });

    it('should handle items without URLs', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Current Page' }
      ];
      
      const schema = StructuredDataTemplates.getBreadcrumbSchema(items);
      
      expect(schema.itemListElement[0].item).toBe('https://statcal.com/');
      expect(schema.itemListElement[1].item).toBeUndefined();
    });
  });

  describe('getSoftwareApplicationSchema', () => {
    it('should generate valid SoftwareApplication schema', () => {
      const schema = StructuredDataTemplates.getSoftwareApplicationSchema(
        'Mean Calculator',
        '/calculator/mean'
      );
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('SoftwareApplication');
      expect(schema.name).toContain('Mean Calculator');
      expect(schema.url).toBe('https://statcal.com/calculator/mean');
      expect(schema.applicationCategory).toBe('EducationalApplication');
    });

    it('should indicate free pricing', () => {
      const schema = StructuredDataTemplates.getSoftwareApplicationSchema(
        'Test Calculator',
        '/test'
      );
      
      expect(schema.offers?.price).toBe('0');
      expect(schema.offers?.priceCurrency).toBe('USD');
    });
  });
});

describe('StructuredDataProvider Component', () => {
  it('should render without crashing', () => {
    const config = {
      website: StructuredDataTemplates.getWebSiteSchema()
    };
    
    const { container } = render(<StructuredDataProvider config={config} />);
    expect(container).toBeDefined();
  });

  it('should render script tags for each schema', () => {
    const config = {
      website: StructuredDataTemplates.getWebSiteSchema(),
      organization: StructuredDataTemplates.getOrganizationSchema()
    };
    
    const { container } = render(<StructuredDataProvider config={config} />);
    const scriptTags = container.querySelectorAll('script[type="application/ld+json"]');
    
    expect(scriptTags).toHaveLength(2);
  });

  it('should contain valid JSON in script tags', () => {
    const config = {
      website: StructuredDataTemplates.getWebSiteSchema()
    };
    
    const { container } = render(<StructuredDataProvider config={config} />);
    const scriptTag = container.querySelector('script[type="application/ld+json"]');
    
    expect(scriptTag).toBeDefined();
    expect(() => {
      JSON.parse(scriptTag!.innerHTML);
    }).not.toThrow();
  });
});

describe('useStructuredData Hook', () => {
  const TestComponent: React.FC<{ toolId?: string }> = ({ toolId }) => {
    const { getToolConfig, StructuredDataTemplates } = useStructuredData(toolId);
    
    return (
      <div data-testid="test-component">
        {JSON.stringify(getToolConfig(toolId || 'test'))}
      </div>
    );
  };

  it('should return tool-specific configuration for mean calculator', () => {
    const { getByTestId } = render(<TestComponent toolId="mean" />);
    const component = getByTestId('test-component');
    
    const config = JSON.parse(component.textContent || '{}');
    expect(config.howTo).toBeDefined();
    expect(config.howTo.name).toContain('Mean');
  });

  it('should return tool-specific configuration for standard deviation', () => {
    const { getByTestId } = render(<TestComponent toolId="standard-deviation" />);
    const component = getByTestId('test-component');
    
    const config = JSON.parse(component.textContent || '{}');
    expect(config.howTo).toBeDefined();
    expect(config.howTo.name).toContain('Standard Deviation');
  });

  it('should return tool-specific configuration for GPA calculator', () => {
    const { getByTestId } = render(<TestComponent toolId="gpa" />);
    const component = getByTestId('test-component');
    
    const config = JSON.parse(component.textContent || '{}');
    expect(config.howTo).toBeDefined();
    expect(config.howTo.name).toContain('GPA');
  });

  it('should return base configuration for unknown tools', () => {
    const { getByTestId } = render(<TestComponent toolId="unknown" />);
    const component = getByTestId('test-component');
    
    const config = JSON.parse(component.textContent || '{}');
    expect(config.website).toBeDefined();
    expect(config.organization).toBeDefined();
    expect(config.faq).toBeDefined();
    expect(config.howTo).toBeUndefined(); // No specific HowTo for unknown tools
  });

  it('should always include base schemas', () => {
    const { getByTestId } = render(<TestComponent toolId="mean" />);
    const component = getByTestId('test-component');
    
    const config = JSON.parse(component.textContent || '{}');
    expect(config.website).toBeDefined();
    expect(config.organization).toBeDefined();
    expect(config.faq).toBeDefined();
  });

  it('should include breadcrumb for known tools', () => {
    const { getByTestId } = render(<TestComponent toolId="gpa" />);
    const component = getByTestId('test-component');
    
    const config = JSON.parse(component.textContent || '{}');
    expect(config.breadcrumb).toBeDefined();
    expect(config.breadcrumb.itemListElement).toHaveLength(3);
  });

  it('should include software application schema for tools', () => {
    const { getByTestId } = render(<TestComponent toolId="mean" />);
    const component = getByTestId('test-component');
    
    const config = JSON.parse(component.textContent || '{}');
    expect(config.softwareApplication).toBeDefined();
    expect(config.softwareApplication.name).toContain('Mean Calculator');
  });
});

describe('Schema Validation Integration', () => {
  it('should generate valid schemas for all templates', () => {
    const schemas = [
      StructuredDataTemplates.getWebSiteSchema(),
      StructuredDataTemplates.getOrganizationSchema(),
      StructuredDataTemplates.getMeanCalculatorHowTo(),
      StructuredDataTemplates.getStandardDeviationHowTo(),
      StructuredDataTemplates.getGPACalculatorHowTo(),
      StructuredDataTemplates.getCalculatorFAQ()
    ];

    schemas.forEach(schema => {
      const validation = StructuredDataValidator.validateSchema(schema);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  it('should pass validation for breadcrumb schemas', () => {
    const breadcrumb = StructuredDataTemplates.getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Test' }
    ]);

    const validation = StructuredDataValidator.validateSchema(breadcrumb);
    expect(validation.isValid).toBe(true);
  });

  it('should pass validation for software application schemas', () => {
    const softwareApp = StructuredDataTemplates.getSoftwareApplicationSchema(
      'Test Calculator',
      '/test'
    );

    const validation = StructuredDataValidator.validateSchema(softwareApp);
    expect(validation.isValid).toBe(true);
  });
});
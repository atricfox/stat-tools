// 导出基础服务
export { BaseService } from './base';

// 导出类型定义
export type { Calculator, CalculatorGroup, CalculatorWithGroup, CalculatorsQueryOptions, CalculatorsResult } from './calculators';
export type { Category, Term, TermRelationship, GlossaryQueryOptions, GlossaryResult, SearchSuggestion } from './glossary';
export type { ContentType, ContentItem, HowToStep, ContentMetadata, ContentQueryOptions, ContentResult, SearchResult } from './content';
export type { Topic, TopicGuide, TopicFAQ, TopicWithDetails, TopicsQueryOptions, TopicsResult } from './topics';

// 延迟导入服务实例以避免循环依赖
let calculatorsService: any;
let glossaryService: any;
let contentService: any;
let topicsService: any;

// 统一的服务管理器
export class ServiceManager {
    private static instance: ServiceManager;
    private services: Map<string, any> = new Map();
    private initializing = false;

    private constructor() {
        this.initializeServices();
    }

    static getInstance(): ServiceManager {
        if (!ServiceManager.instance) {
            ServiceManager.instance = new ServiceManager();
        }
        return ServiceManager.instance;
    }

    private initializeServices(): void {
        if (this.initializing) return;
        this.initializing = true;

        try {
            // 延迟导入服务以避免循环依赖
            const { calculatorsService } = require('./calculators');
            const { glossaryService } = require('./glossary');
            const { contentService } = require('./content');
            const { topicsService } = require('./topics');

            this.services.set('calculators', calculatorsService);
            this.services.set('glossary', glossaryService);
            this.services.set('content', contentService);
            this.services.set('topics', topicsService);
        } catch (error) {
            console.error('Failed to initialize services:', error);
            throw error;
        } finally {
            this.initializing = false;
        }
    }

    getService<T>(name: 'calculators'): typeof calculatorsService;
    getService<T>(name: 'glossary'): typeof glossaryService;
    getService<T>(name: 'content'): typeof contentService;
    getService<T>(name: 'topics'): typeof topicsService;
    getService<T>(name: string): T {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service '${name}' not found`);
        }
        return service as T;
    }

    // 健康检查
    async healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        services: Record<string, { status: 'healthy' | 'unhealthy'; details?: any }>;
    }> {
        const serviceNames = ['calculators', 'glossary', 'content', 'topics'];
        const results: Record<string, { status: 'healthy' | 'unhealthy'; details?: any }> = {};

        for (const serviceName of serviceNames) {
            try {
                const service = this.getService(serviceName);
                results[serviceName] = await service.healthCheck();
            } catch (error) {
                results[serviceName] = {
                    status: 'unhealthy',
                    details: { error: error.message }
                };
            }
        }

        const allHealthy = Object.values(results).every(r => r.status === 'healthy');

        return {
            status: allHealthy ? 'healthy' : 'unhealthy',
            services: results
        };
    }

    // 清除所有缓存
    clearAllCaches(): void {
        this.services.forEach((service, name) => {
            try {
                if (typeof service.clearCache === 'function') {
                    service.clearCache();
                }
                // 调用特定的清除方法
                switch (name) {
                    case 'calculators':
                        service.clearCalculatorsCache();
                        break;
                    case 'glossary':
                        service.clearGlossaryCache();
                        break;
                    case 'content':
                        service.clearContentCache();
                        break;
                    case 'topics':
                        service.clearTopicsCache();
                        break;
                }
            } catch (error) {
                console.error(`Failed to clear cache for service ${name}:`, error);
            }
        });
    }

    // 获取所有统计信息
    async getAllStatistics(): Promise<{
        calculators: any;
        glossary: any;
        content: any;
        topics: any;
        timestamp: string;
    }> {
        const [calculators, glossary, content, topics] = await Promise.allSettled([
            this.getService('calculators').getStatistics(),
            this.getService('glossary').getStatistics(),
            this.getService('content').getStatistics(),
            this.getService('topics').getStatistics()
        ]);

        return {
            calculators: calculators.status === 'fulfilled' ? calculators.value : null,
            glossary: glossary.status === 'fulfilled' ? glossary.value : null,
            content: content.status === 'fulfilled' ? content.value : null,
            topics: topics.status === 'fulfilled' ? topics.value : null,
            timestamp: new Date().toISOString()
        };
    }
}

// 导出服务管理器实例
export const serviceManager = ServiceManager.getInstance();

// 便捷的导出 - 使用延迟加载以避免循环依赖
export const services = {
    get calculators() { return serviceManager.getService('calculators'); },
    get glossary() { return serviceManager.getService('glossary'); },
    get content() { return serviceManager.getService('content'); },
    get topics() { return serviceManager.getService('topics'); },
    manager: serviceManager
};
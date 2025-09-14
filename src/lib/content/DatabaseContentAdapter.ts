/**
 * Database Content Adapter
 * 适配器模式，将现有的文件系统内容服务与新的数据库服务集成
 */

import { contentService, type ContentItem } from './ContentService';
import {
    buildContentIndex,
    searchContent as fileSearchContent,
    type TContentIndex,
    type SearchOptions,
    type SearchResult
} from './contentIndexer';

// 适配器接口
export interface ContentAdapter {
    // 基础查询方法
    getContentItem(id: number): ContentItem | null;
    getContentItemBySlug(slug: string, type?: string): ContentItem | null;
    queryContent(options?: any): ContentItem[];

    // 搜索功能
    searchContent(query: string, options?: any): ContentItem[];
    getRelatedContent(contentId: number, limit?: number): ContentItem[];

    // 统计和推荐
    getContentStats(): any;
    getPopularContent(limit?: number): ContentItem[];
    getLatestContent(limit?: number): ContentItem[];

    // 特定内容类型方法
    getHowToSteps(contentId: number): any[];
    getCaseDetails(contentId: number): any;

    // 索引兼容性方法
    buildContentIndex(): Promise<TContentIndex[]>;
    searchWithIndex(index: TContentIndex[], options: SearchOptions): SearchResult[];
}

/**
 * 数据库内容适配器实现
 */
export class DatabaseContentAdapter implements ContentAdapter {
    private useDatabase: boolean = true;

    constructor(useDatabase: boolean = true) {
        this.useDatabase = useDatabase;
    }

    /**
     * 动态切换数据源
     */
    setDataSource(useDatabase: boolean): void {
        this.useDatabase = useDatabase;
    }

    getContentItem(id: number): ContentItem | null {
        if (!this.useDatabase) {
            // 回退到文件系统查询
            return this.getFilesystemContentById(id);
        }
        return contentService.getContentItem(id);
    }

    getContentItemBySlug(slug: string, type?: string): ContentItem | null {
        if (!this.useDatabase) {
            return this.getFilesystemContentBySlug(slug, type);
        }
        return contentService.getContentItemBySlug(slug, type);
    }

    queryContent(options: any = {}): ContentItem[] {
        if (!this.useDatabase) {
            return this.getFilesystemContent(options);
        }
        return contentService.queryContent(options);
    }

    searchContent(query: string, options: any = {}): ContentItem[] {
        if (!this.useDatabase) {
            // 回退到文件系统搜索
            return this.getFilesystemSearchContent(query, options);
        }
        return contentService.searchContent(query, options);
    }

    getRelatedContent(contentId: number, limit: number = 5): ContentItem[] {
        if (!this.useDatabase) {
            return this.getFilesystemRelatedContent(contentId, limit);
        }
        return contentService.getRelatedContent(contentId, limit);
    }

    getContentStats(): any {
        if (!this.useDatabase) {
            return this.getFilesystemStats();
        }
        return contentService.getContentStats();
    }

    getPopularContent(limit: number = 5): ContentItem[] {
        if (!this.useDatabase) {
            return this.getFilesystemPopularContent(limit);
        }
        return contentService.getPopularContent(limit);
    }

    getLatestContent(limit: number = 5): ContentItem[] {
        if (!this.useDatabase) {
            return this.getFilesystemLatestContent(limit);
        }
        return contentService.getLatestContent(limit);
    }

    getHowToSteps(contentId: number): any[] {
        if (!this.useDatabase) {
            return this.getFilesystemHowToSteps(contentId);
        }
        return contentService.getHowToSteps(contentId);
    }

    getCaseDetails(contentId: number): any {
        if (!this.useDatabase) {
            return this.getFilesystemCaseDetails(contentId);
        }
        return contentService.getCaseDetails(contentId);
    }

    async buildContentIndex(): Promise<TContentIndex[]> {
        if (this.useDatabase) {
            // 从数据库构建索引
            return this.buildDatabaseContentIndex();
        }
        return buildContentIndex();
    }

    searchWithIndex(index: TContentIndex[], options: SearchOptions): SearchResult[] {
        return fileSearchContent(index, options);
    }

    /**
     * 从数据库构建内容索引（兼容文件系统接口）
     */
    private async buildDatabaseContentIndex(): Promise<TContentIndex[]> {
        const items = contentService.queryContent({ limit: 1000 });

        return items.map(item => ({
            type: item.type,
            slug: item.slug,
            title: item.title,
            summary: item.summary,
            tags: item.tags,
            updated: item.updatedAt,
            url: this.getContentUrl(item.type, item.slug)
        }));
    }

    /**
     * 根据内容类型生成URL
     */
    private getContentUrl(type: string, slug: string): string {
        switch (type) {
            case 'howto':
                return `/how-to/${slug}`;
            case 'faq':
                return `/faq#${slug}`;
            case 'case':
                return `/cases/${slug}`;
            default:
                return `/${type}/${slug}`;
        }
    }

    // 文件系统回退方法
    private getFilesystemContentById(id: number): ContentItem | null {
        // 简单实现，可以通过索引映射
        console.warn('Using filesystem fallback for getContentItemById');
        return null;
    }

    private getFilesystemContentBySlug(slug: string, type?: string): ContentItem | null {
        // 简单实现，可以通过文件系统读取
        console.warn('Using filesystem fallback for getContentItemBySlug');
        return null;
    }

    private getFilesystemContent(options: any): ContentItem[] {
        // 简单实现，可以通过文件系统读取
        console.warn('Using filesystem fallback for queryContent');
        return [];
    }

    private getFilesystemSearchContent(query: string, options: any): ContentItem[] {
        // 简单实现，可以通过文件搜索
        console.warn('Using filesystem fallback for searchContent');
        return [];
    }

    private getFilesystemRelatedContent(contentId: number, limit: number): ContentItem[] {
        console.warn('Using filesystem fallback for getRelatedContent');
        return [];
    }

    private getFilesystemStats(): any {
        console.warn('Using filesystem fallback for getContentStats');
        return {
            totalItems: 0,
            byType: {},
            byDifficulty: {},
            byIndustry: {},
            totalRelationships: 0,
            totalSteps: 0
        };
    }

    private getFilesystemPopularContent(limit: number): ContentItem[] {
        console.warn('Using filesystem fallback for getPopularContent');
        return [];
    }

    private getFilesystemLatestContent(limit: number): ContentItem[] {
        console.warn('Using filesystem fallback for getLatestContent');
        return [];
    }

    private getFilesystemHowToSteps(contentId: number): any[] {
        console.warn('Using filesystem fallback for getHowToSteps');
        return [];
    }

    private getFilesystemCaseDetails(contentId: number): any {
        console.warn('Using filesystem fallback for getCaseDetails');
        return null;
    }
}

/**
 * 内容服务工厂
 */
export class ContentServiceFactory {
    private static instance: DatabaseContentAdapter | null = null;

    /**
     * 获取内容适配器实例
     */
    static getInstance(useDatabase?: boolean): DatabaseContentAdapter {
        if (!this.instance) {
            // 默认使用数据库，但可以通过环境变量控制
            const useDb = useDatabase ?? process.env.USE_DATABASE_CONTENT !== 'false';
            this.instance = new DatabaseContentAdapter(useDb);
        }
        return this.instance;
    }

    /**
     * 重置实例（主要用于测试）
     */
    static resetInstance(): void {
        this.instance = null;
    }
}

// 导出默认实例
export const contentAdapter = ContentServiceFactory.getInstance();

// 为了向后兼容，也导出旧的服务方法
export {
    buildContentIndex,
    searchContent as searchContentWithIndex,
    getPopularContent as getPopularFilesystemContent,
    getLatestContent as getLatestFilesystemContent,
    groupContentByType,
    groupContentByTag,
    getSearchSuggestions
} from './contentIndexer';
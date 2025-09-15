import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '@/lib/services/content';

/**
 * Content API - 获取内容列表
 * 支持分页、过滤、搜索和排序
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // 解析查询参数
        const options = {
            typeId: searchParams.get('typeId') ? parseInt(searchParams.get('typeId')!) : undefined,
            typeName: searchParams.get('typeName') || undefined,
            status: searchParams.get('status') || 'published',
            search: searchParams.get('search') || undefined,
            tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
            sortBy: (searchParams.get('sortBy') as any) || 'title',
            sortOrder: (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'ASC',
            page: parseInt(searchParams.get('page') || '1'),
            pageSize: Math.min(parseInt(searchParams.get('pageSize') || '20'), 100) // 限制最大页面大小
        };

        // 验证分页参数
        if (options.page < 1) options.page = 1;
        if (options.pageSize < 1) options.pageSize = 20;

        const result = await contentService.getContentItems(options);

        return NextResponse.json({
            success: true,
            data: result,
            meta: {
                page: result.page,
                pageSize: result.pageSize,
                total: result.total,
                totalPages: result.totalPages,
                hasMore: result.page < result.totalPages
            }
        });

    } catch (error) {
        console.error('Content API Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch content items',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
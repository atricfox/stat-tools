import { NextRequest, NextResponse } from 'next/server';
import { glossaryService } from '@/lib/services/glossary';

/**
 * Glossary API - 获取术语列表
 * 支持分页、过滤、搜索和排序
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // 解析查询参数
        const options = {
            categoryId: searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined,
            categoryName: searchParams.get('categoryName') || undefined,
            firstLetter: searchParams.get('firstLetter') || undefined,
            search: searchParams.get('search') || undefined,
            sortBy: (searchParams.get('sortBy') as any) || 'title',
            sortOrder: (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'ASC',
            page: parseInt(searchParams.get('page') || '1'),
            pageSize: Math.min(parseInt(searchParams.get('pageSize') || '20'), 100)
        };

        // 验证分页参数
        if (options.page < 1) options.page = 1;
        if (options.pageSize < 1) options.pageSize = 20;

        const result = await glossaryService.getTerms(options);

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
        console.error('Glossary API Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch glossary terms',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
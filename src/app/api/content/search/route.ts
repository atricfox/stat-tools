import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '@/lib/services/content';

/**
 * Content Search API - 搜索内容
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const query = searchParams.get('q')?.trim();
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // 限制最大结果数

        if (!query) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing search query',
                    message: 'Search query parameter "q" is required'
                },
                { status: 400 }
            );
        }

        const results = await contentService.searchContent(query, limit);

        return NextResponse.json({
            success: true,
            data: results,
            meta: {
                query,
                count: results.length,
                limit
            }
        });

    } catch (error) {
        console.error('Content Search API Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to search content',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
import { NextResponse } from 'next/server';
import { contentService } from '@/lib/services/content';

/**
 * Content Statistics API - 获取内容统计信息
 */
export async function GET() {
    try {
        const stats = await contentService.getStatistics();

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Content Statistics API Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch content statistics',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
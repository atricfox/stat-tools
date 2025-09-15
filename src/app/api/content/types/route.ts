import { NextResponse } from 'next/server';
import { contentService } from '@/lib/services/content';

/**
 * Content Types API - 获取所有内容类型
 */
export async function GET() {
    try {
        const types = await contentService.getContentTypes();

        return NextResponse.json({
            success: true,
            data: types,
            meta: {
                count: types.length
            }
        });

    } catch (error) {
        console.error('Content Types API Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch content types',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
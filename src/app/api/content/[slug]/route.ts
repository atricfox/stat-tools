import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '@/lib/services/content';

/**
 * Individual Content API - 根据slug获取单个内容项
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params;
        const { searchParams } = new URL(request.url);

        // 可选：根据类型过滤
        const typeName = searchParams.get('type') || undefined;

        let content;
        if (typeName) {
            // 如果指定了类型，尝试通过类型和slug获取
            const items = await contentService.getContentByType(typeName, {
                pageSize: 1,
                search: slug
            });
            content = items.items.find(item => item.slug === slug) || null;
        } else {
            // 直接通过slug获取
            content = await contentService.getContentItemBySlug(slug);
        }

        if (!content) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Content not found',
                    message: `No content found with slug: ${slug}`
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: content
        });

    } catch (error) {
        console.error('Individual Content API Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch content',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
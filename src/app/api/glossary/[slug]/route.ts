import { NextRequest, NextResponse } from 'next/server';
import { glossaryService } from '@/lib/services/glossary';

/**
 * Individual Glossary Term API - 根据slug获取单个术语
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params;

        const term = await glossaryService.getTermBySlug(slug);

        if (!term) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Term not found',
                    message: `No glossary term found with slug: ${slug}`
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: term
        });

    } catch (error) {
        console.error('Individual Glossary Term API Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch glossary term',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
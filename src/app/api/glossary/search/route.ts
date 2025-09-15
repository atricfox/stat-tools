import { NextRequest, NextResponse } from 'next/server';
import { glossaryService } from '@/lib/services/glossary';

/**
 * Glossary Search API - 搜索术语
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const query = searchParams.get('q')?.trim();
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

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

        const results = await glossaryService.searchTerms(query, limit);

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
        console.error('Glossary Search API Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to search glossary terms',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
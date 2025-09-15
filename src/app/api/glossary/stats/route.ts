import { NextResponse } from 'next/server';
import { glossaryService } from '@/lib/services/glossary';

/**
 * Glossary Statistics API - 获取术语统计信息
 */
export async function GET() {
    try {
        const stats = await glossaryService.getStatistics();

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Glossary Statistics API Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch glossary statistics',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
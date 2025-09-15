import { NextResponse } from 'next/server';
import { glossaryService } from '@/lib/services/glossary';

/**
 * Glossary First Letters API - 获取首字母索引
 */
export async function GET() {
    try {
        const letters = await glossaryService.getFirstLetters();

        return NextResponse.json({
            success: true,
            data: letters,
            meta: {
                count: letters.length
            }
        });

    } catch (error) {
        console.error('Glossary First Letters API Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch glossary first letters',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
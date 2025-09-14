/**
 * 修复案例数据迁移
 * 将content_items表中的案例内容迁移到case_details表
 */

import Database from 'better-sqlite3';
import { getDatabase } from '../src/lib/db/client';

function fixCaseDataMigration() {
    const db = getDatabase();

    try {
        console.log('🔧 开始修复案例数据迁移...');

        // 获取所有案例内容
        const cases = db.prepare(`
            SELECT id, content
            FROM content_items
            WHERE type_id = 3
        `).all();

        console.log(`找到 ${cases.length} 个案例需要迁移`);

        for (const caseItem of cases) {
            try {
                const contentData = JSON.parse(caseItem.content || '{}');

                // 插入或更新case_details数据
                db.prepare(`
                    INSERT OR REPLACE INTO case_details (
                        content_id, problem, solution, results, lessons,
                        tools_used, background, challenge, approach,
                        results_detail, key_insights, recommendations
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    caseItem.id,
                    contentData.challenge || '',
                    contentData.challenge || '', // solution暂时使用challenge
                    JSON.stringify([]), // results数组
                    JSON.stringify([]), // lessons数组
                    JSON.stringify(['/calculator/gpa', '/calculator/cumulative-gpa']), // tools_used
                    contentData.background || '',
                    contentData.challenge || '',
                    JSON.stringify(contentData.approach || {}),
                    JSON.stringify(contentData.results_detail || {}),
                    JSON.stringify(contentData.key_insights || []),
                    JSON.stringify(contentData.recommendations || [])
                );

                console.log(`  ✓ 迁移案例 ID ${caseItem.id}`);

            } catch (error) {
                console.error(`  ✗ 迁移案例 ID ${caseItem.id} 失败:`, error);
            }
        }

        console.log('✅ 案例数据迁移完成');

    } catch (error) {
        console.error('案例数据迁移失败:', error);
    } finally {
        db.close();
    }
}

// 执行迁移
if (require.main === module) {
    fixCaseDataMigration();
}

export { fixCaseDataMigration };
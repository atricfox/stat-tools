#!/usr/bin/env tsx

/**
 * 主题数据迁移脚本
 * 迁移主题数据从 TypeScript 配置到 SQLite 数据库
 */

import { BaseMigration, MigrationResult } from '../../src/lib/migration/base';
import Database from 'better-sqlite3';
import { getDatabase } from '../../src/lib/db/client';
import { TOPICS, type TopicConfig, type TopicId } from '../../src/lib/hub/topics';

interface TopicGuide {
    title: string;
    text: string;
}

interface TopicFAQ {
    q: string;
    a: string;
}

export class TopicsMigration extends BaseMigration {
    private topicsData: Record<TopicId, TopicConfig>;

    constructor() {
        super();
        this.topicsData = TOPICS;
    }

    protected getDatabaseConnection(): Database.Database {
        const db = getDatabase();
        db.exec('PRAGMA foreign_keys = OFF');
        return db;
    }

    getName(): string {
        return 'TopicsMigration';
    }

    getVersion(): string {
        return '1.0.0';
    }

    getDescription(): string {
        return '迁移主题数据从 TypeScript 配置到 SQLite 数据库';
    }

    /**
     * 验证数据格式
     */
    private validateData(): void {
        const topicIds = Object.keys(this.topicsData);

        if (topicIds.length === 0) {
            throw new Error('主题数据为空');
        }

        for (const [topicId, topic] of Object.entries(this.topicsData)) {
            if (!topic.id || !topic.title || !topic.description || !topic.route) {
                throw new Error(`主题 ${topicId} 缺少必需字段`);
            }

            if (!Array.isArray(topic.groupNames)) {
                throw new Error(`主题 ${topicId} 的 groupNames 必须是数组`);
            }

            if (topic.guides && !Array.isArray(topic.guides)) {
                throw new Error(`主题 ${topicId} 的 guides 必须是数组`);
            }

            if (topic.faqs && !Array.isArray(topic.faqs)) {
                throw new Error(`主题 ${topicId} 的 faqs 必须是数组`);
            }
        }

        this.logger.log('✅ 主题数据验证通过');
    }

    /**
     * 迁移主题数据
     */
    private async migrateTopics(): Promise<Map<TopicId, number>> {
        return this.safeExecute('迁移主题数据', async () => {
            const topicMap = new Map<TopicId, number>();

            for (const [topicId, topic] of Object.entries(this.topicsData)) {
                const result = this.db.prepare(`
                    INSERT OR REPLACE INTO topics
                    (slug, title, description)
                    VALUES (?, ?, ?)
                `).run(
                    topic.id,
                    topic.title,
                    topic.description
                );

                const insertedTopic = this.db.prepare(`
                    SELECT id FROM topics WHERE slug = ?
                `).get(topic.id);

                if (insertedTopic) {
                    topicMap.set(topicId as TopicId, insertedTopic.id);
                    this.logger.log(`迁移主题: ${topic.title} (ID: ${insertedTopic.id})`);
                }
            }

            this.logger.log(`✅ 已迁移 ${topicMap.size} 个主题`);
            return topicMap;
        });
    }

    /**
     * 迁移主题指南
     */
    private async migrateTopicGuides(topicMap: Map<TopicId, number>): Promise<void> {
        return this.safeExecute('迁移主题指南', async () => {
            let totalGuides = 0;

            for (const [topicId, topic] of Object.entries(this.topicsData)) {
                const topicDbId = topicMap.get(topicId as TopicId);
                if (!topicDbId || !topic.guides) continue;

                for (let i = 0; i < topic.guides.length; i++) {
                    const guide = topic.guides[i];

                    const result = this.db.prepare(`
                        INSERT OR REPLACE INTO topic_guides
                        (topic_id, title, description, sort_order)
                        VALUES (?, ?, ?, ?)
                    `).run(
                        topicDbId,
                        guide.title,
                        guide.text,
                        i + 1
                    );

                    totalGuides++;
                    this.logger.log(`迁移指南: ${guide.title} (主题: ${topic.title})`);
                }
            }

            this.logger.log(`✅ 已迁移 ${totalGuides} 个主题指南`);
        });
    }

    /**
     * 迁移主题常见问题
     */
    private async migrateTopicFAQs(topicMap: Map<TopicId, number>): Promise<void> {
        return this.safeExecute('迁移主题常见问题', async () => {
            let totalFAQs = 0;

            for (const [topicId, topic] of Object.entries(this.topicsData)) {
                const topicDbId = topicMap.get(topicId as TopicId);
                if (!topicDbId || !topic.faqs) continue;

                for (let i = 0; i < topic.faqs.length; i++) {
                    const faq = topic.faqs[i];

                    const result = this.db.prepare(`
                        INSERT OR REPLACE INTO topic_faqs
                        (topic_id, question, answer, sort_order)
                        VALUES (?, ?, ?, ?)
                    `).run(
                        topicDbId,
                        faq.q,
                        faq.a,
                        i + 1
                    );

                    totalFAQs++;
                    this.logger.log(`迁移FAQ: ${faq.q.substring(0, 50)}... (主题: ${topic.title})`);
                }
            }

            this.logger.log(`✅ 已迁移 ${totalFAQs} 个主题常见问题`);
        });
    }

    /**
     * 迁移主题与计算器分组的关系
     */
    private async migrateTopicCalculatorGroups(topicMap: Map<TopicId, number>): Promise<void> {
        return this.safeExecute('迁移主题-计算器分组关系', async () => {
            let totalRelations = 0;

            for (const [topicId, topic] of Object.entries(this.topicsData)) {
                const topicDbId = topicMap.get(topicId as TopicId);
                if (!topicDbId || topic.groupNames.length === 0) continue;

                for (const groupName of topic.groupNames) {
                    // 查找对应的计算器分组
                    const calculatorGroup = this.db.prepare(`
                        SELECT id FROM calculator_groups WHERE group_name = ?
                    `).get(groupName);

                    if (calculatorGroup) {
                        // 创建主题与计算器分组的关系
                        // 注意：这里我们使用一个关系表来存储主题和计算器分组的关系
                        // 由于现有 schema 中没有直接的表，我们可以使用元数据表或创建新的关系表
                        const result = this.db.prepare(`
                            INSERT OR REPLACE INTO content_metadata
                            (content_id, meta_key, meta_value)
                            VALUES (?, ?, ?)
                        `).run(
                            topicDbId, // 使用主题 ID 作为 content_id
                            'related_calculator_groups',
                            JSON.stringify([groupName])
                        );

                        totalRelations++;
                        this.logger.log(`关联主题与计算器分组: ${topic.title} <-> ${groupName}`);
                    } else {
                        this.logger.logWarning(`找不到计算器分组: ${groupName} (主题: ${topic.title})`);
                    }
                }
            }

            this.logger.log(`✅ 已建立 ${totalRelations} 个主题-计算器分组关系`);
        });
    }

    /**
     * 执行迁移
     */
    async migrate(): Promise<MigrationResult> {
        this.logger.log(`🚀 开始 ${this.getName()} 迁移...`);

        try {
            // 验证数据
            await this.validateData();

            // 执行迁移步骤
            const topicMap = await this.migrateTopics();
            await this.migrateTopicGuides(topicMap);
            await this.migrateTopicFAQs(topicMap);
            await this.migrateTopicCalculatorGroups(topicMap);

            // 验证迁移结果
            const isValid = await this.validate();

            if (!isValid) {
                throw new Error('迁移验证失败');
            }

            this.logger.logComplete(this.stats);
            return {
                success: true,
                message: '主题数据迁移成功完成',
                stats: this.stats
            };
        } catch (error) {
            this.logger.logError('迁移失败', error, 0);
            return {
                success: false,
                message: error.message,
                stats: this.stats,
                error
            };
        }
    }

    /**
     * 验证迁移结果
     */
    async validate(): Promise<boolean> {
        return this.safeExecute('验证主题迁移', async () => {
            const expectedTopics = Object.keys(this.topicsData).length;
            const actualTopics = this.getRecordCount('topics');

            if (actualTopics !== expectedTopics) {
                throw new Error(`主题数量不匹配: 期望 ${expectedTopics}, 实际 ${actualTopics}`);
            }

            let expectedGuides = 0;
            let expectedFAQs = 0;

            // 统计期望的指南和FAQ数量
            for (const topic of Object.values(this.topicsData)) {
                if (topic.guides) expectedGuides += topic.guides.length;
                if (topic.faqs) expectedFAQs += topic.faqs.length;
            }

            const actualGuides = this.getRecordCount('topic_guides');
            const actualFAQs = this.getRecordCount('topic_faqs');

            if (actualGuides !== expectedGuides) {
                throw new Error(`指南数量不匹配: 期望 ${expectedGuides}, 实际 ${actualGuides}`);
            }

            if (actualFAQs !== expectedFAQs) {
                throw new Error(`FAQ数量不匹配: 期望 ${expectedFAQs}, 实际 ${actualFAQs}`);
            }

            // 验证每个主题的基本数据
            for (const [topicId, topic] of Object.entries(this.topicsData)) {
                const dbTopic = this.db.prepare(`
                    SELECT * FROM topics WHERE slug = ?
                `).get(topic.id);

                if (!dbTopic) {
                    throw new Error(`找不到主题: ${topic.title}`);
                }

                if (dbTopic.title !== topic.title) {
                    throw new Error(`主题标题不匹配: ${topic.title}`);
                }

                if (dbTopic.description !== topic.description) {
                    throw new Error(`主题描述不匹配: ${topic.title}`);
                }
            }

            this.logger.log(`✅ 验证通过: ${actualTopics} 个主题, ${actualGuides} 个指南, ${actualFAQs} 个FAQ`);
            return true;
        });
    }

    /**
     * 回滚迁移
     */
    async rollback(): Promise<boolean> {
        this.logger.log('🔄 开始回滚主题迁移...');

        try {
            return this.safeExecute('回滚主题迁移', async () => {
                // 删除主题关系数据
                const metadataCount = this.db.prepare(`
                    SELECT COUNT(*) as count FROM content_metadata
                    WHERE meta_key = 'related_calculator_groups'
                `).get();

                if (metadataCount.count > 0) {
                    this.db.exec(`
                        DELETE FROM content_metadata
                        WHERE meta_key = 'related_calculator_groups'
                    `);
                    this.logger.log(`已删除 ${metadataCount.count} 个主题关系记录`);
                }

                // 删除主题FAQ
                const faqCount = this.getRecordCount('topic_faqs');
                this.db.exec('DELETE FROM topic_faqs');
                this.logger.log(`已删除 ${faqCount} 个主题FAQ`);

                // 删除主题指南
                const guideCount = this.getRecordCount('topic_guides');
                this.db.exec('DELETE FROM topic_guides');
                this.logger.log(`已删除 ${guideCount} 个主题指南`);

                // 删除主题
                const topicCount = this.getRecordCount('topics');
                this.db.exec('DELETE FROM topics');
                this.logger.log(`已删除 ${topicCount} 个主题`);

                // 验证回滚
                const remainingTopics = this.getRecordCount('topics');
                const remainingGuides = this.getRecordCount('topic_guides');
                const remainingFAQs = this.getRecordCount('topic_faqs');

                if (remainingTopics > 0 || remainingGuides > 0 || remainingFAQs > 0) {
                    throw new Error('回滚不完整，仍有残留数据');
                }

                this.logger.log('✅ 主题迁移回滚成功');
                return true;
            });
        } catch (error) {
            this.logger.logError('回滚失败', error, 0);
            return false;
        }
    }
}

/**
 * 主执行函数
 */
async function main() {
    const migration = new TopicsMigration();

    try {
        const result = await migration.migrate();

        if (result.success) {
            console.log('\n🎉 主题迁移成功完成！');
            console.log(`📊 迁移统计: ${result.stats.getSuccessCount()} 个操作成功`);
            process.exit(0);
        } else {
            console.log('\n💥 主题迁移失败:', result.message);
            process.exit(1);
        }
    } catch (error) {
        console.error('\n💥 迁移过程中发生异常:', error);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        console.error('执行过程中发生错误:', error);
        process.exit(1);
    });
}
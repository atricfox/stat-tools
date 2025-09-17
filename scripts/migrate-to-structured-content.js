#!/usr/bin/env node
/**
 * Script to migrate existing content to structured format
 * Extracts structured information from markdown content and stores in slim_content_details
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

class ContentStructureExtractor {
  constructor(dbPath) {
    this.db = new Database(dbPath);
  }

  /**
   * Extract structured data from How-to content
   */
  extractHowtoStructure(content) {
    const structure = {
      steps: [],
      examples: [],
      tips: [],
      relatedTools: []
    };

    // Extract steps from content
    const stepPattern = /###?\s*Step\s+(\d+):\s*([^\n]+)\n((?:(?!###?\s*Step|##\s*[^#])[\s\S])*)/gi;
    let stepMatch;
    let stepCounter = 1;

    while ((stepMatch = stepPattern.exec(content)) !== null) {
      const [, stepNum, stepName, stepContent] = stepMatch;
      
      // Extract description, tips, and warnings from step content
      const description = stepContent.replace(/\*\*(.*?)\*\*/g, '$1').trim();
      
      const step = {
        stepId: `step-${stepCounter}`,
        name: `Step ${stepNum}: ${stepName}`,
        description: description.split('\n\n')[0].trim(),
      };

      // Look for tips in the content
      const tipMatch = stepContent.match(/(?:tip|hint|note):\s*([^\n]+)/i);
      if (tipMatch) {
        step.tip = tipMatch[1];
      }

      // Look for warnings
      const warningMatch = stepContent.match(/(?:warning|caution|important):\s*([^\n]+)/i);
      if (warningMatch) {
        step.warning = warningMatch[1];
      }

      structure.steps.push(step);
      stepCounter++;
    }

    // If no explicit steps found, try to extract from numbered sections
    if (structure.steps.length === 0) {
      const generalStepPattern = /^#+\s*(\d+\.?\s*[^:]+):?\s*([\s\S]*?)(?=^#+|\Z)/gm;
      let generalMatch;
      stepCounter = 1;

      while ((generalMatch = generalStepPattern.exec(content)) !== null) {
        const [, title, stepContent] = generalMatch;
        
        structure.steps.push({
          stepId: `step-${stepCounter}`,
          name: title.trim(),
          description: stepContent.trim().split('\n\n')[0].replace(/\*\*(.*?)\*\*/g, '$1').trim(),
        });
        stepCounter++;
      }
    }

    // Extract examples
    const examplePattern = /###?\s*Example\s*(?:\d+)?:\s*([^\n]+)\n((?:(?!###?\s*Example|##\s*[^#])[\s\S])*)/gi;
    let exampleMatch;

    while ((exampleMatch = examplePattern.exec(content)) !== null) {
      const [, exampleTitle, exampleContent] = exampleMatch;
      
      const dataMatch = exampleContent.match(/\*\*Data\*\*:\s*([^\n]+)/);
      const calcMatch = exampleContent.match(/\*\*Calculation\*\*:\s*([^\n]+)/) || 
                       exampleContent.match(/\*\*Steps\*\*:\s*([\s\S]*?)(?=\n\n|\Z)/);
      const resultMatch = exampleContent.match(/\*\*(?:Mean|Result|Answer)\*\*:\s*([^\n]+)/);
      
      structure.examples.push({
        title: exampleTitle,
        description: exampleContent.trim().split('\n\n')[0].trim(),
        data: dataMatch ? dataMatch[1] : '',
        calculation: calcMatch ? calcMatch[1] : '',
        result: resultMatch ? resultMatch[1] : ''
      });
    }

    // Extract tips and common mistakes
    const tipsSection = content.match(/##\s*(?:Tips|Common Mistakes|When to Be Careful)[\s\S]*?([\s\S]*?)(?=##|\Z)/i);
    if (tipsSection) {
      const tipItems = tipsSection[1].match(/[-•]\s*([^\n]+)/g);
      if (tipItems) {
        structure.tips = tipItems.map(tip => tip.replace(/^[-•]\s*/, '').trim());
      }
    }

    // Extract related tools
    const relatedMatch = content.match(/\[([^\]]+)\]\(([^)]+)\)/g);
    if (relatedMatch) {
      structure.relatedTools = relatedMatch.map(link => {
        const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
        return {
          name: match[1],
          url: match[2]
        };
      }).filter(tool => tool.url.startsWith('/calculator'));
    }

    return structure;
  }

  /**
   * Extract structured data from Case Study content
   */
  extractCaseStudyStructure(content) {
    const structure = {
      case: {
        problem: '',
        solution: '',
        background: '',
        challenge: '',
        approach: {},
        results: [],
        resultsDetail: {},
        lessons: [],
        keyInsights: [],
        recommendations: [],
        toolsUsed: []
      }
    };

    // Extract background/context
    const backgroundMatch = content.match(/##\s*(?:Background|Context|Student Profile|Project Background)[\s\S]*?([\s\S]*?)(?=##|\Z)/i);
    if (backgroundMatch) {
      structure.case.background = backgroundMatch[1].trim();
    }

    // Extract problem/challenge
    const problemMatch = content.match(/##\s*(?:Problem|Challenge|Initial Situation)[\s\S]*?([\s\S]*?)(?=##|\Z)/i);
    if (problemMatch) {
      structure.case.problem = problemMatch[1].trim();
    }

    // Extract solution/strategy
    const solutionMatch = content.match(/##\s*(?:Solution|Strategy|Strategic Solution|Implementation)[\s\S]*?([\s\S]*?)(?=##|\Z)/i);
    if (solutionMatch) {
      structure.case.solution = solutionMatch[1].trim();
    }

    // Extract challenge details
    const challengeMatch = content.match(/###\s*Challenge[\s\S]*?([\s\S]*?)(?=###|##|\Z)/i);
    if (challengeMatch) {
      structure.case.challenge = challengeMatch[1].trim();
    }

    // Extract results
    const resultsMatch = content.match(/##\s*(?:Results|Outcomes|Final Results|Implementation Results)[\s\S]*?([\s\S]*?)(?=##|\Z)/i);
    if (resultsMatch) {
      const resultItems = resultsMatch[1].match(/[-•]\s*([^\n]+)/g);
      if (resultItems) {
        structure.case.results = resultItems.map(item => item.replace(/^[-•]\s*/, '').trim());
      }
    }

    // Extract lessons learned
    const lessonsMatch = content.match(/##\s*(?:Lessons|Analysis & Lessons|Key Success Factors)[\s\S]*?([\s\S]*?)(?=##|\Z)/i);
    if (lessonsMatch) {
      const lessonItems = lessonsMatch[1].match(/[-•]\s*([^\n]+)/g);
      if (lessonItems) {
        structure.case.lessons = lessonItems.map(item => item.replace(/^[-•]\s*/, '').trim());
      }
    }

    // Extract key insights
    const insightsMatch = content.match(/##\s*(?:Key Insights|Insights|Analysis)[\s\S]*?([\s\S]*?)(?=##|\Z)/i);
    if (insightsMatch) {
      const insightItems = insightsMatch[1].match(/[-•]\s*([^\n]+)/g);
      if (insightItems) {
        structure.case.keyInsights = insightItems.map(item => item.replace(/^[-•]\s*/, '').trim());
      }
    }

    // Extract recommendations
    const recommendationsMatch = content.match(/##\s*(?:Recommendations|Best Practices)[\s\S]*?([\s\S]*?)(?=##|\Z)/i);
    if (recommendationsMatch) {
      const recItems = recommendationsMatch[1].match(/[-•]\s*([^\n]+)/g);
      if (recItems) {
        structure.case.recommendations = recItems.map(item => item.replace(/^[-•]\s*/, '').trim());
      }
    }

    // Extract tools used
    const toolsMatch = content.match(/##\s*Tools Used[\s\S]*?([\s\S]*?)(?=##|\Z)/i);
    if (toolsMatch) {
      const toolItems = toolsMatch[1].match(/[-•]\s*([^\n]+)/g);
      if (toolItems) {
        structure.case.toolsUsed = toolItems.map(item => item.replace(/^[-•]\s*/, '').trim());
      }
    }

    // Extract approach details
    const approachMatch = content.match(/##\s*(?:Approach|Strategy|Method)[\s\S]*?([\s\S]*?)(?=##|\Z)/i);
    if (approachMatch) {
      structure.case.approach = {
        description: approachMatch[1].trim(),
        methodology: 'Statistical Analysis'
      };
    }

    return structure;
  }

  /**
   * Process all content and migrate to structured format
   */
  async migrateContent() {
    console.log('Starting content migration to structured format...');

    // Get all howto and case content
    const contentQuery = this.db.prepare(`
      SELECT id, slug, title, content, type 
      FROM slim_content 
      WHERE type IN ('howto', 'case')
      ORDER BY id
    `);

    const contents = contentQuery.all();
    console.log(`Found ${contents.length} items to migrate`);

    // Clear existing data
    const clearQuery = this.db.prepare('DELETE FROM slim_content_details');
    clearQuery.run();

    const insertQuery = this.db.prepare(`
      INSERT INTO slim_content_details (content_id, details) 
      VALUES (?, ?)
    `);

    let migratedCount = 0;

    for (const item of contents) {
      console.log(`Processing ${item.type}: ${item.title}`);

      try {
        let structuredData;

        if (item.type === 'howto') {
          structuredData = this.extractHowtoStructure(item.content);
        } else {
          structuredData = this.extractCaseStudyStructure(item.content);
        }

        // Insert structured data
        insertQuery.run(item.id, JSON.stringify(structuredData));
        migratedCount++;

        console.log(`✓ Migrated ${item.slug}`);
      } catch (error) {
        console.error(`✗ Error processing ${item.slug}:`, error);
      }
    }

    console.log(`\n✓ Migration completed: ${migratedCount}/${contents.length} items migrated`);
  }

  /**
   * Test structured data extraction
   */
  async testExtraction() {
    const testQuery = this.db.prepare(`
      SELECT id, slug, title, content, type 
      FROM slim_content 
      WHERE id IN (3, 4)
    `);

    const testItems = testQuery.all();

    for (const item of testItems) {
      console.log(`\n=== Testing ${item.type}: ${item.title} ===`);
      
      let structuredData;
      if (item.type === 'howto') {
        structuredData = this.extractHowtoStructure(item.content);
        console.log(`Extracted ${structuredData.steps.length} steps`);
        console.log(`Extracted ${structuredData.examples?.length || 0} examples`);
      } else {
        structuredData = this.extractCaseStudyStructure(item.content);
        console.log(`Problem: ${structuredData.case.problem.substring(0, 100)}...`);
        console.log(`Results: ${structuredData.case.results.length} items`);
      }

      console.log('Structured data sample:', JSON.stringify(structuredData, null, 2).substring(0, 500) + '...');
    }
  }

  close() {
    this.db.close();
  }
}

// Main execution
async function main() {
  const dbPath = path.join(process.cwd(), 'data', 'statcal.db');
  
  if (!fs.existsSync(dbPath)) {
    console.error('Database not found at:', dbPath);
    process.exit(1);
  }

  const extractor = new ContentStructureExtractor(dbPath);

  const args = process.argv.slice(2);
  if (args.includes('--test')) {
    await extractor.testExtraction();
  } else {
    await extractor.migrateContent();
  }

  extractor.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ContentStructureExtractor };
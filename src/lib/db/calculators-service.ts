import { Database } from 'better-sqlite3';
import { TCalculatorsJson, TCalculatorGroup, TCalculatorItem } from '@/lib/hub/calculatorsSchema';

export interface CalculatorsService {
  getCalculatorsData(): Promise<TCalculatorsJson>;
  getCalculatorGroups(): Promise<TCalculatorGroup[]>;
  getCalculatorsByGroup(groupName: string): Promise<TCalculatorItem[]>;
}

class SQLiteCalculatorsService implements CalculatorsService {
  constructor(private db: Database) {}

  async getCalculatorsData(): Promise<TCalculatorsJson> {
    // Get all groups ordered by sort_order
    const groupsQuery = `
      SELECT id, group_name, display_name, sort_order, updated_at
      FROM calculator_groups
      ORDER BY sort_order
    `;
    const groupRows = this.db.prepare(groupsQuery).all() as any[];

    // Get all calculators ordered by group and sort_order
    const calculatorsQuery = `
      SELECT c.*, cg.group_name
      FROM calculators c
      JOIN calculator_groups cg ON c.group_id = cg.id
      ORDER BY cg.sort_order, c.sort_order
    `;
    const calculatorRows = this.db.prepare(calculatorsQuery).all() as any[];

    // Group calculators by group_name
    const groups: TCalculatorGroup[] = groupRows.map(group => {
      const calculators = calculatorRows
        .filter(calc => calc.group_name === group.group_name)
        .map(calc => ({
          name: calc.name,
          url: calc.url,
          description: calc.description,
          is_hot: Boolean(calc.is_hot),
          is_new: Boolean(calc.is_new),
          sort_order: calc.sort_order
        }));

      return {
        group_name: group.group_name,
        display_name: group.display_name,
        sort_order: group.sort_order,
        items: calculators
      };
    });

    // Get the latest update timestamp
    const lastmodQuery = `
      SELECT MAX(updated_at) as lastmod
      FROM (
        SELECT updated_at FROM calculator_groups
        UNION ALL
        SELECT updated_at FROM calculators
      )
    `;
    const lastmodResult = this.db.prepare(lastmodQuery).get() as { lastmod: string };

    return {
      groups,
      lastmod: lastmodResult.lastmod || new Date().toISOString()
    };
  }

  async getCalculatorGroups(): Promise<TCalculatorGroup[]> {
    // Reuse the main method for consistency
    const data = await this.getCalculatorsData();
    return data.groups;
  }

  async getCalculatorsByGroup(groupName: string): Promise<TCalculatorItem[]> {
    const query = `
      SELECT
        c.name,
        c.url,
        c.description,
        c.is_hot,
        c.is_new,
        c.sort_order
      FROM calculators c
      JOIN calculator_groups cg ON c.group_id = cg.id
      WHERE cg.group_name = ?
      ORDER BY c.sort_order
    `;

    const rows = this.db.prepare(query).all(groupName) as any[];

    return rows.map(row => ({
      name: row.name,
      url: row.url,
      description: row.description,
      is_hot: Boolean(row.is_hot),
      is_new: Boolean(row.is_new),
      sort_order: row.sort_order
    }));
  }
}

// Factory function for service creation
export function createCalculatorsService(db: Database): CalculatorsService {
  return new SQLiteCalculatorsService(db);
}
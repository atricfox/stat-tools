import { z } from 'zod';

// Schema for individual calculator item
export const CalculatorItem = z.object({
  name: z.string(),
  url: z.string().startsWith('/calculator/'),
  description: z.string(),
  is_hot: z.boolean(),
  is_new: z.boolean(),
  sort_order: z.number(),
});

// Schema for calculator group
export const CalculatorGroup = z.object({
  group_name: z.string(),
  display_name: z.string(),
  sort_order: z.number(),
  items: z.array(CalculatorItem),
});

// Schema for the full calculators.json structure
export const CalculatorsJson = z.object({
  groups: z.array(CalculatorGroup),
  lastmod: z.string(),
});

export type TCalculatorItem = z.infer<typeof CalculatorItem>;
export type TCalculatorGroup = z.infer<typeof CalculatorGroup>;
export type TCalculatorsJson = z.infer<typeof CalculatorsJson>;
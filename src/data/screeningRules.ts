/**
 * Screening Rules Definition
 * Each rule corresponds to a field extracted by Content Understanding
 */

export interface ScreeningRule {
  fieldName: string;      // Field name from CU API (e.g., 'gender')
  displayName: string;    // Chinese display name (e.g., '性别')
  rule: string;          // Rule description (e.g., '需要是男性')
}

export const SCREENING_RULES: ScreeningRule[] = [
  {
    fieldName: '性别',
    displayName: '性别',
    rule: '需要是男性'
  },
  {
    fieldName: '患病时长',
    displayName: '患病时长',
    rule: '需要超过2年'
  },
  {
    fieldName: 'HIV阳性',
    displayName: 'HIV阳性',
    rule: '不能为阳性或无记录'
  },
  {
    fieldName: '药物过敏史',
    displayName: '药物过敏史',
    rule: '无药物过敏史'
  },
  {
    fieldName: '体温',
    displayName: '体温',
    rule: '近期没有发烧（超过37度）'
  }
];

/**
 * Get rule by field name
 */
export const getRuleByFieldName = (fieldName: string): ScreeningRule | undefined => {
  return SCREENING_RULES.find(r => r.fieldName.toLowerCase() === fieldName.toLowerCase());
};

/**
 * Get all rules as a formatted string for AI context
 */
export const getFormattedRulesForAI = (): string => {
  return SCREENING_RULES
    .map((r, idx) => `${idx + 1}. ${r.displayName}(${r.fieldName}): ${r.rule}`)
    .join('\n');
};

export const SCREENING_CRITERIA = {
  id: 'ad_phase3',
  name: '特应性皮炎III期试验入组标准',
  inclusion: [
    {
      id: 'age',
      name: '年龄',
      criteria: '18-65岁',
      type: 'range'
    },
    {
      id: 'diagnosis',
      name: '诊断',
      criteria: '确诊特应性皮炎≥1年',
      type: 'boolean'
    },
    {
      id: 'easi',
      name: 'EASI评分',
      criteria: '≥16 (中重度)',
      type: 'numeric'
    },
    {
      id: 'iga',
      name: 'IGA评分',
      criteria: '≥3',
      type: 'numeric'
    }
  ],
  exclusion: [
    {
      id: 'infection',
      name: '活动性感染',
      criteria: '无活动性感染',
      type: 'boolean'
    },
    {
      id: 'hbsag',
      name: '乙肝表面抗原',
      criteria: 'HBsAg阴性',
      type: 'boolean'
    },
    {
      id: 'hiv',
      name: 'HIV',
      criteria: 'HIV阴性',
      type: 'boolean'
    },
    {
      id: 'pregnancy',
      name: '妊娠',
      criteria: '非妊娠期',
      type: 'boolean'
    }
  ]
};

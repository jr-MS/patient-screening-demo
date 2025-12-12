import { ScreeningResult, ScreeningIndicator, SourceLocation } from '../types';
import { ContentUnderstandingResult, AnalyzerField } from '../hooks/useContentUnderstanding';
import { getRuleByFieldName } from './screeningRules';

/**
 * Extract original document markdown from CU response
 */
const extractDocumentMarkdown = (cuResult: ContentUnderstandingResult): string => {
  const markdown =
    cuResult.result?.contents?.[0]?.markdown ||
    cuResult.contents?.[0]?.markdown ||
    cuResult.analyzedDocument?.markdown ||
    '';
  
  console.log('📄 Document markdown available:', !!markdown, 'length:', markdown?.length || 0);
  return markdown || '';
};

/**
 * Extract context around spans in the original markdown
 */
const extractContextFromSpans = (
  spans: AnalyzerField['spans'] | undefined,
  documentMarkdown: string
): string => {
  if (!spans || spans.length === 0 || !documentMarkdown) {
    return '';
  }

  try {
    const span = spans[0]; // Use first span
    const contextStart = Math.max(0, span.offset - 30);
    const contextEnd = Math.min(documentMarkdown.length, span.offset + span.length + 30);
    
    const beforeText = documentMarkdown.substring(contextStart, span.offset);
    const extractedText = documentMarkdown.substring(span.offset, span.offset + span.length);
    const afterText = documentMarkdown.substring(span.offset + span.length, contextEnd);
    
    // Add markers to show the extracted text
    const marked = `...${beforeText}【${extractedText}】${afterText}...`;
    
    console.log(`  Span context at offset ${span.offset}, length ${span.length}: "${marked}"`);
    return marked;
  } catch (e) {
    console.error('Failed to extract context from spans:', e);
    return '';
  }
};

/**
 * Transform Content Understanding API response to ScreeningResult
 */
export const transformCUResultToScreeningResult = (
  cuResult: ContentUnderstandingResult,
  patientId: string = 'CU-ANALYSIS-001'
): ScreeningResult => {
  const fields =
    cuResult.contents?.[0]?.fields ||
    cuResult.result?.contents?.[0]?.fields ||
    cuResult.analyzedDocument?.fields ||
    // cuResult.result?.analyzedDocument?.fields ||
    // cuResult.result?.fields ||
    cuResult.fields ||
    {};
  const indicators: ScreeningIndicator[] = [];
  
  console.log('Transformer received fields:', Object.keys(fields).length, 'fields');

  // Try to extract document markdown for context
  const documentMarkdown = extractDocumentMarkdown(cuResult);

  // Map each field to an indicator
  Object.entries(fields).forEach(([fieldName, fieldData]: [string, any]) => {
    const field: AnalyzerField = fieldData;
    const confidence = typeof field.confidence === 'number' ? field.confidence : undefined;
    const value =
      field.valueString ??
      (typeof field.valueNumber === 'number' ? String(field.valueNumber) : undefined) ??
      (typeof field.valueBoolean === 'boolean' ? String(field.valueBoolean) : undefined) ??
      field.fieldValue ??
      '未检测到';

    // Determine status based on presence and confidence
    let status: 'pass' | 'warning' | 'fail' = value === '未检测到' ? 'warning' : 'pass';
    if (typeof confidence === 'number' && confidence < 0.5) {
      status = 'warning';
    }

    const sourceLocations: SourceLocation[] = normalizeSources(field.source);
    const rule = getRuleByFieldName(fieldName)?.rule;
    const context = extractContextFromSpans(field.spans, documentMarkdown);
    
    console.log(`  Field: "${fieldName}" -> Rule: ${rule ? '✓ found' : '✗ not found'}, Context: ${context ? '✓ found' : '✗ none'}`);

    const indicator: ScreeningIndicator = {
      id: fieldName.toLowerCase().replace(/\s+/g, '_'),
      name: formatFieldName(fieldName),
      value,
      status,
      confidence,
      rule,
      context,
      criteria: `已从文档中提取: ${fieldName}`,
      highlightRange: { start: 0, end: 0 },
      note: sourceLocations.length > 0 ? `在第 ${sourceLocations[0].page} 页检测到` : undefined,
      sourceLocations
    };

    indicators.push(indicator);
  });

  // Calculate summary
  const passCount = indicators.filter(i => i.status === 'pass').length;
  const totalCount = indicators.length;

  return {
    patientId,
    indicators,
    summary: {
      passCount,
      totalCount,
      recommendation: `成功从文档中提取 ${totalCount} 项信息。点击左侧指标查看原文位置。`,
      concerns: indicators
        .filter(i => i.status === 'warning')
        .map(i => {
          const confidenceText = typeof i.confidence === 'number' ? `置信度 ${Math.round(i.confidence * 100)}%` : '置信度未知';
          return `${i.name}: ${i.note || '未检测到或置信度较低'}（${confidenceText}）`;
        })
    }
  };
};

// Normalize CU source into SourceLocation[]
const normalizeSources = (source: AnalyzerField['source']): SourceLocation[] => {
  if (!source) return [];

  if (Array.isArray(source)) {
    return source.map(item => ({
      page: item.page || 1,
      boundingBox: item.boundingBox,
      text: item.text || '来源'
    }));
  }

  if (typeof source === 'string') {
    // Example: "D(1,0.6370,5.3954,7.6201,5.4415,7.6182,5.7305,0.6351,5.6844);D(1,1.6019,5.8111,...)"
    // Split multiple D() segments
    const segments = source.split(';').map(s => s.trim()).filter(s => s.startsWith('D('));
    const locations: SourceLocation[] = [];

    for (const segment of segments) {
      const numbers = segment.match(/[-\d.]+/g)?.map(Number) || [];
      const page = numbers[0] || 1;

      if (numbers.length >= 9) {
        // Extract 4 corner points: (x1,y1), (x2,y2), (x3,y3), (x4,y4)
        const xs = [numbers[1], numbers[3], numbers[5], numbers[7]];
        const ys = [numbers[2], numbers[4], numbers[6], numbers[8]];

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        // Coordinates are in inches (0-8.27 width range for A4)
        // Convert to PDF points (72 points per inch)
        const pointsPerInch = 72;

        locations.push({
          page,
          text: segment,
          boundingBox: {
            x: minX * pointsPerInch,
            y: minY * pointsPerInch,
            w: (maxX - minX) * pointsPerInch,
            h: (maxY - minY) * pointsPerInch,
          },
        });
      }
    }

    return locations.length > 0 ? locations : [{
      page: 1,
      text: source,
    }];
  }

  return [];
};

/**
 * Format field names from API response to readable Chinese
 */
const formatFieldName = (fieldName: string): string => {
  const nameMap: { [key: string]: string } = {
    'patient_age': '患者年龄',
    'patient_name': '患者姓名',
    'patient_id': '患者编号',
    'diagnosis': '诊断',
    'diagnosis_date': '诊断日期',
    'symptoms': '症状',
    'medical_history': '病史',
    'current_medications': '当前用药',
    'allergies': '过敏信息',
    'lab_results': '实验室结果',
    'vital_signs': '生命体征',
    'physical_examination': '体格检查',
  };

  return nameMap[fieldName.toLowerCase()] || fieldName;
};

# 患者筛查系统 - Patient Screening System


### 产品概述
基于 AI 的临床试验患者筛查工具，自动化分析电子病历并匹配入组/排除标准，提升患者筛选效率。
本项目是一个前端 Demo，按临床试验入组/排除标准进行规则匹配，并在结果中支持原文定位高亮，方便人工复核。

## 代码使用说明

### 1) 环境要求
- Node.js（建议 18+）

### 2) 安装依赖
```bash
npm install
```

### 3) 配置环境变量
```bash
cp .env.example .env
```
然后在 `.env` 里填入（或更新）所需的 Azure 资源配置。

### 4) 本地启动
```bash
npm run dev
```

### 5) 构建与预览
```bash
npm run build
npm run preview
```

## 常用入口（代码）
- 页面路由：`/screening`
- 页面组件：`src/pages/Screening.tsx`
- 相关组件：`src/components/Screening/*`
- Demo 数据：`src/data/demoMedicalRecord.ts`、`src/data/screeningCriteria.ts`

## 备注
本 Demo 用于技术能力展示，不构成医疗建议；筛查结果需人工复核。
# 上海工资税后收入计算器

一个面向上海牛马的税后收入测算工具。通过四步向导，逐月计算税前工资、个人五险一金、专项附加扣除、累计预扣个税和年度汇算后的最终到手收入。

![Nuxt 4](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt)
![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vuedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Tauri 2](https://img.shields.io/badge/Tauri-2-24C8DB?logo=tauri)

![工资税后收入计算器界面](./img/screenshot1.png)
![工资税后收入计算器界面](./img/screenshot2.png)
![工资税后收入计算器界面](./img/screenshot3.png)
![工资税后收入计算器界面](./img/screenshot4.png)

## 功能

- 支持上海 2023–2026 年社保与公积金上下限分段计算。
- 支持固定月薪或 12 个月分别录入，适合包含奖金、调薪等场景。
- 支持自定义养老、医疗、失业、住房公积金和补充公积金个人比例。
- 支持子女教育、婴幼儿照护、赡养老人、住房租金、住房贷款利息和学历继续教育等专项附加扣除。
- 按累计预扣法展示每月个税与实发工资，并估算年度汇算退税或补税。
- 实时展示月均税前、五险一金、预扣个税和最终到手收入。
- 导出年度汇总、逐月明细和政策参数 Excel 工作簿。
- 支持静态网站构建和 Tauri 桌面应用。
- 所有计算均在本地完成，不上传工资数据。

> 计算结果仅供测算，不构成纳税申报或法律意见。实际结果可能受到单位申报基数、四舍五入口径、其他综合所得及政策调整影响，请以实际申报结果为准。

## 计算口径

月度累计预扣采用以下基本关系：

```text
累计应纳税所得额
= 累计收入
- 累计基本减除费用（5,000 元/月）
- 累计个人五险一金
- 累计专项附加扣除
- 累计其他税前扣除

本月预扣个税
= 累计应纳税额 - 此前月份已预扣税额

本月实发工资
= 税前工资 - 个人五险一金 - 本月预扣个税
```

社保与公积金申报工资会分别限制在所选年度、所处半年度的政策上下限内。年度最终到手收入还会纳入年度汇算口径下的预计退税或补税。

## 技术栈

- Nuxt 4、Vue 3、TypeScript
- Tailwind CSS 4
- `xlsx-js-style` Excel 导出
- Tauri 2 桌面封装
- Lucide 图标

## 本地开发

需要 Node.js 和 pnpm。桌面端构建还需要 Rust 与 Tauri 系统依赖。

```bash
pnpm install
pnpm dev
```

默认开发地址为 `http://localhost:3000`。

常用命令：

```bash
pnpm lint       # ESLint 检查
pnpm typecheck  # Vue / TypeScript 类型检查
pnpm build      # Nuxt 生产构建
pnpm generate   # 生成静态站点
pnpm preview    # 预览生产构建
pnpm tauri:build
```

## 项目结构

```text
income-calc-main/
├─ app/
│  ├─ assets/css/                 # Tailwind 入口与计算器视觉系统
│  ├─ components/                 # 向导、步骤导航和实时工资条
│  ├─ composables/                # 页面状态与计算流程编排
│  ├─ pages/                      # Nuxt 页面
│  └─ utils/                      # 税务计算、上海政策和 Excel 导出
├─ img/                           # README 截图
├─ public/                        # 图标等公开静态资源
├─ src-tauri/                     # Tauri 桌面应用配置与 Rust 入口
├─ AGENTS.md                      # AI 协作开发约定
├─ nuxt.config.ts
└─ package.json
```

## 维护提示

- 政策数据位于 `app/utils/shanghaiPolicy.ts`。
- 核心税务计算位于 `app/utils/taxCalculator.ts`。
- 页面交互状态位于 `app/composables/useSalaryCalculator.ts`。
- 更新政策或公式后，应覆盖边界工资、半年政策切换、专项扣除和年度汇算场景，并运行全部检查命令。
- 界面发生明显变化后，请同步更新 `img/screenshot.png`。

## License

[MIT](./LICENSE)

# 工资到手计算器

> 工资条不会说谎，但它通常惜字如金。这个项目负责把它翻译成人话。

[![Nuxt 4](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt)](https://nuxt.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vuedotjs)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tauri 2](https://img.shields.io/badge/Tauri-2-24C8DB?logo=tauri)](https://tauri.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/ikiwihome/income-calc?style=social)](https://github.com/ikiwihome/income-calc)

一个认真计算工资、偶尔安慰打工人的开源税后收入计算器。

选择城市和年度，填入工资、五险一金与专项附加扣除，它会按月算出预扣个税、实发工资和年度汇算结果。奖金、调薪、上下半年基数变化也能分别处理——毕竟工资可以一成不变，政策通常不配合。

**[在线体验](https://salary.ikimi.cc)** · **[报告问题](https://github.com/ikiwihome/income-calc/issues)** · 如果它帮你看懂了一次工资条，欢迎点个 ⭐，让下一位打工人少按几次计算器。

## 为什么值得一试？

- **不是“月薪乘十二”**：使用累计预扣法逐月计算个税，并估算年度汇算退税或补税。
- **奖金和调薪都接得住**：可统一填写月薪，也可分别录入 12 个月收入。
- **政策按城市、年度和半年匹配**：支持 2023–2026 年政策，并区分 1–6 月和 7–12 月的社保、公积金基数。
- **五险一金不搞一刀切**：社保与公积金基数分别应用上下限，缴存比例也可按单位实际情况修改。
- **专项附加扣除不漏项**：覆盖子女教育、婴幼儿照护、赡养老人、住房租金、住房贷款利息和继续教育等常用项目。
- **结果能带走**：可导出包含年度汇总、逐月明细和政策参数的 Excel 工作簿。
- **工资只和你的浏览器谈心**：计算在本地完成，不上传工资数据。
- **网页和桌面端都能跑**：支持静态站点构建，也支持 Tauri 桌面应用。

## 支持城市

目前支持以下城市：

| 华北 | 华东 | 华南 |
| --- | --- | --- |
| 北京 | 上海、杭州、南京、合肥、芜湖 | 广州、深圳 |

覆盖年度为 **2023–2026 年**。部分尚未公布的新政策区间会明确标记为“暂行”，并沿用最近已公布标准，不会假装自己从未来拿到了红头文件。

想增加其他城市？欢迎提交 [Issue](https://github.com/ikiwihome/income-calc/issues) 或 Pull Request。政策来源请尽量附上官方链接——“我同事说是这样”暂时不能进入计算引擎。

## 界面预览

<table>
  <tr>
    <td><img src="./img/screenshot1.png" alt="选择城市、年度和工资" /></td>
    <td><img src="./img/screenshot2.png" alt="确认五险一金基数" /></td>
  </tr>
  <tr>
    <td><img src="./img/screenshot3.png" alt="填写专项附加扣除" /></td>
    <td><img src="./img/screenshot4.png" alt="查看年度到手收入" /></td>
  </tr>
</table>

## 它怎么算？

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

社保和公积金申报工资会分别限制在所选城市、年度及半年度的政策上下限内。金额在计算过程中保留完整精度，只在展示时格式化，避免几分钱一路滚成一杯奶茶。

> [!IMPORTANT]
> 本项目用于个人测算，不构成纳税申报、法律或财务意见。单位申报基数、取整口径、其他综合所得及政策调整都可能影响最终结果，请以单位工资条、主管部门及实际申报结果为准。

## 本地运行

需要 [Node.js](https://nodejs.org/) 和 [pnpm](https://pnpm.io/)。本项目固定使用 pnpm，请不要混用 npm 或 Yarn，也不要提交其他锁文件——锁文件打架时，没有一方会主动缴纳调解费。

```bash
git clone https://github.com/ikiwihome/income-calc.git
cd income-calc
pnpm install
pnpm dev
```

打开 `http://localhost:3000` 即可。

### 常用命令

```bash
pnpm dev          # 启动开发服务器
pnpm lint         # ESLint 检查
pnpm typecheck    # Vue / TypeScript 类型检查
pnpm build        # 生产构建
pnpm generate     # 生成静态站点
pnpm preview      # 预览生产构建
pnpm tauri:build  # 构建桌面应用
```

### 生成静态站点

```bash
pnpm generate
```

生成结果位于 `.output/public`，可以部署到 Vercel、Netlify、Cloudflare Pages、GitHub Pages 或任意静态文件服务器。服务器不需要懂个税，只需要会把文件发给浏览器。

### 构建桌面应用

桌面端还需要安装 [Rust](https://www.rust-lang.org/tools/install) 和对应平台的 [Tauri 系统依赖](https://tauri.app/start/prerequisites/)。

```bash
pnpm tauri:build
```

如果出现 `cargo metadata ... program not found`，通常不是税算错了，而是系统还找不到 Rust/Cargo。

## 技术栈

- Nuxt 4、Vue 3、TypeScript
- Tailwind CSS 4
- `xlsx-js-style` Excel 导出
- Tauri 2 桌面封装
- Lucide 图标

## 项目结构

```text
income-calc/
├─ app/
│  ├─ assets/css/                 # Tailwind 入口与计算器视觉系统
│  ├─ components/                 # 四步向导与实时工资条
│  ├─ composables/                # 表单状态和计算流程编排
│  ├─ pages/                      # Nuxt 页面
│  └─ utils/
│     ├─ cityPolicies.ts          # 各城市、年度和半年度政策参数
│     ├─ taxCalculator.ts         # 纯税务计算逻辑
│     └─ exportSalaryWorkbook.ts  # Excel 工作簿生成
├─ img/                           # README 截图
├─ public/                        # 公开静态资源
├─ src-tauri/                     # Tauri 桌面应用
├─ AGENTS.md                      # AI 与协作者开发约定
├─ nuxt.config.ts
└─ package.json
```

## 一起完善它

这是一个对“差不多”比较敏感的项目。欢迎贡献代码、政策来源、边界案例和界面改进：

1. Fork 本仓库并创建分支。
2. 保持修改范围清晰，政策调整请注明城市、年度、上下半年和官方来源。
3. 提交前运行：

   ```bash
   pnpm lint
   pnpm typecheck
   pnpm build
   ```

4. 发起 Pull Request，说明改了什么、为什么，以及你验证过哪些场景。

不会写代码也没关系：[提交 Issue](https://github.com/ikiwihome/income-calc/issues) 同样是在给项目加班，而且这次是自愿的。

## Star History

如果这个项目对你有帮助，点一个 Star 就够了。它不会让税变少，但会让维护者更有动力继续追政策。

[![Star History Chart](https://api.star-history.com/svg?repos=ikiwihome/income-calc&type=Date)](https://star-history.com/#ikiwihome/income-calc&Date)

## License

[MIT](./LICENSE) — 可以自由使用和改进，但请不要把测算结果包装成官方结论。

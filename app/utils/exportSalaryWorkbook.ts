import type { CalculationResult, ContributionRates } from './taxCalculator'
import type { ShanghaiPolicy } from './shanghaiPolicy'

type ExportSalaryWorkbookInput = {
  year: number
  result: CalculationResult
  averageMonthlyNet: number
  rates: ContributionRates
  policy: ShanghaiPolicy
}

type StyledCell = {
  s?: Record<string, unknown>
}

export async function exportSalaryWorkbook(input: ExportSalaryWorkbookInput) {
  const XLSX = await import('xlsx-js-style')
  const workbook = XLSX.utils.book_new()
  const currencyFormat = '#,##0.00'
  const baseStyle = {
    font: { name: '微软雅黑', sz: 11, color: { rgb: '34423D' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: { bottom: { style: 'thin', color: { rgb: 'E4EAE7' } } },
  }
  const headerStyle = {
    font: { name: '微软雅黑', sz: 11, bold: true, color: { rgb: '245642' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'EAF5F0' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: 'CFE1D9' } },
      bottom: { style: 'thin', color: { rgb: 'CFE1D9' } },
    },
  }
  const titleStyle = {
    font: { name: '微软雅黑', sz: 15, bold: true, color: { rgb: '173F31' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'DDEFE7' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  }
  const applyStyle = (sheet: Record<string, unknown>, range: string, style: Record<string, unknown>) => {
    const decoded = XLSX.utils.decode_range(range)
    for (let row = decoded.s.r; row <= decoded.e.r; row += 1) {
      for (let col = decoded.s.c; col <= decoded.e.c; col += 1) {
        const cell = sheet[XLSX.utils.encode_cell({ r: row, c: col })] as StyledCell | undefined
        if (cell) cell.s = { ...(cell.s || {}), ...style }
      }
    }
  }

  const summaryRows = [
    [`上海工资税后收入测算（${input.year} 年）`, null],
    ['指标', '金额（元）'],
    ['全年税前工资', input.result.annualGross],
    ['个人五险一金', input.result.annualContributions],
    ['月度已预扣个税', input.result.annualWithheldTax],
    ['年度应纳个税', input.result.annualSettlementTax],
    [input.result.estimatedRefund >= 0 ? '预计退税' : '预计补税', Math.abs(input.result.estimatedRefund)],
    ['全年工资实发', input.result.annualCashReceived],
    ['最终到手收入', input.result.finalAnnualIncome],
    ['月均实发', input.averageMonthlyNet],
    ['专项附加扣除合计', input.result.annualSpecialDeduction],
  ]
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows)
  summarySheet['!cols'] = [{ wch: 24 }, { wch: 20 }]
  summarySheet['!rows'] = [{ hpt: 32 }, { hpt: 25 }, ...Array(summaryRows.length - 2).fill({ hpt: 23 })]
  summarySheet['!merges'] = [XLSX.utils.decode_range('A1:B1')]
  applyStyle(summarySheet, `A1:B${summaryRows.length}`, baseStyle)
  applyStyle(summarySheet, 'A1:B1', titleStyle)
  applyStyle(summarySheet, 'A2:B2', headerStyle)
  applyStyle(summarySheet, 'A9:B9', {
    font: { name: '微软雅黑', sz: 12, bold: true, color: { rgb: '176C4E' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'F0F8F4' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  })
  for (let row = 3; row <= summaryRows.length; row += 1) {
    const cell = summarySheet[`B${row}`]
    if (cell) cell.z = currencyFormat
  }
  XLSX.utils.book_append_sheet(workbook, summarySheet, '年度汇总')

  const monthHeaders = [
    '月份', '税前工资',
    '养老保险', '医疗保险', '失业保险', '住房公积金', '补充公积金', '五险一金合计',
    '专项附加扣除', '其他税前扣除', '适用预扣率', '本月个税', '实发工资',
  ]
  const monthRows = input.result.months.map((month) => [
    `${month.month} 月`, month.gross,
    month.pension, month.medical, month.unemployment, month.housing,
    month.supplementalHousing, month.contributions,
    month.specialDeduction, month.otherDeduction, month.taxRate, month.tax, month.net,
  ])
  const monthSheet = XLSX.utils.aoa_to_sheet([monthHeaders, ...monthRows])
  monthSheet['!cols'] = [
    { wch: 8 }, { wch: 14 },
    ...Array(5).fill({ wch: 13 }), { wch: 15 },
    { wch: 16 }, { wch: 15 }, { wch: 13 }, { wch: 13 }, { wch: 15 },
  ]
  monthSheet['!autofilter'] = { ref: `A1:M${monthRows.length + 1}` }
  monthSheet['!rows'] = [{ hpt: 30 }, ...Array(monthRows.length).fill({ hpt: 25 })]
  applyStyle(monthSheet, `A1:M${monthRows.length + 1}`, baseStyle)
  applyStyle(monthSheet, 'A1:M1', headerStyle)
  applyStyle(monthSheet, `C1:G${monthRows.length + 1}`, {
    fill: { patternType: 'solid', fgColor: { rgb: 'EAF2F8' } },
  })
  applyStyle(monthSheet, 'C1:G1', {
    font: { name: '微软雅黑', sz: 11, bold: true, color: { rgb: '28566E' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'D6E8F3' } },
  })
  applyStyle(monthSheet, `H1:H${monthRows.length + 1}`, {
    font: { name: '微软雅黑', sz: 11, bold: true, color: { rgb: '204A5F' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'DDEBF2' } },
  })
  applyStyle(monthSheet, 'H1:H1', {
    fill: { patternType: 'solid', fgColor: { rgb: 'BCD8E6' } },
  })
  for (let row = 2; row <= monthRows.length + 1; row += 1) {
    for (let col = 1; col < monthHeaders.length; col += 1) {
      const cell = monthSheet[XLSX.utils.encode_cell({ r: row - 1, c: col })]
      if (cell) cell.z = col === 10 ? '0.0%' : currencyFormat
    }
  }
  XLSX.utils.book_append_sheet(workbook, monthSheet, '逐月明细')

  const policyRows: Array<Array<string | number>> = [
    [`上海工资计算参数（${input.year} 年）`, '', '', '', ''],
    ['期间', '社保下限', '社保上限', '公积金下限', '公积金上限'],
    ...input.policy.periods.map((period, index) => [
      index === 0 ? '1–6 月' : '7–12 月',
      period.socialMin, period.socialMax, period.housingMin, period.housingMax,
    ]),
    [],
    ['个人缴费比例', '比例'],
    ['养老保险', input.rates.pension / 100],
    ['医疗保险', input.rates.medical / 100],
    ['失业保险', input.rates.unemployment / 100],
    ['住房公积金', input.rates.housing / 100],
    ['补充公积金', input.rates.supplementalHousing / 100],
  ]
  const policySheet = XLSX.utils.aoa_to_sheet(policyRows)
  policySheet['!cols'] = [{ wch: 34 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }]
  policySheet['!rows'] = [{ hpt: 32 }, ...Array(policyRows.length - 1).fill({ hpt: 23 })]
  policySheet['!merges'] = [XLSX.utils.decode_range('A1:E1')]
  applyStyle(policySheet, `A1:E${policyRows.length}`, baseStyle)
  applyStyle(policySheet, 'A1:E1', titleStyle)
  for (const headerRow of [2, 6]) applyStyle(policySheet, `A${headerRow}:E${headerRow}`, headerStyle)
  for (let row = 7; row <= 11; row += 1) {
    const cell = policySheet[`B${row}`]
    if (cell) cell.z = '0.0%'
  }
  XLSX.utils.book_append_sheet(workbook, policySheet, '政策参数')

  const workbookData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', compression: true })
  const downloadUrl = URL.createObjectURL(new Blob([workbookData], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }))
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = `上海工资到手收入测算_${input.year}.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
}

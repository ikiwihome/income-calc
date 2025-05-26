<template>
  <div class="calculator-container">
    <div class="theme-toggle">
      <Button variant="ghost" size="icon" @click="toggleDarkMode" class="mode-button">
        <Sun v-if="!isDarkMode" class="h-5 w-5" />
        <Moon v-else class="h-5 w-5" />
      </Button>
    </div>
    <h1>2025年最新工资税后收入计算器</h1>
    <h2 class="subtitle">一个可以精确到分的税后收入计算器</h2>

    <div class="top-row">
      <div class="form-group">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <h3>选择年度<span class="help-icon">?</span></h3>
            </TooltipTrigger>
            <TooltipContent>
              <p>选择计算使用的税务年度<br>不同年度的社保和公积金缴费基数不同</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Select v-model="year">
          <SelectTrigger>
            <SelectValue placeholder="选择年度" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="y in years" :value="y" :key="y">
                {{ y }}年
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div class="form-group">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <h3>所在省市<span class="help-icon">?</span></h3>
            </TooltipTrigger>
            <TooltipContent>
              <p>选择所在省市以获取当地社保公积金缴纳标准</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Select v-model="city">
          <SelectTrigger>
            <SelectValue placeholder="选择省市" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="(_, cityName) in cities" :value="cityName" :key="cityName">
                {{ cityName }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="input-section">
      <div class="form-group">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <h3>月度工资<span class="help-icon">?</span></h3>
            </TooltipTrigger>
            <TooltipContent>
              <p>输入每月扣除五险一金前的税前工资<br>1月输入后会自动填充到其他月份</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div v-for="(salary, index) in monthlySalaries" :key="index" class="monthly-salary">
          <span>{{ index + 1 }}月:</span>
          <Input type="number" v-model.number="monthlySalaries[index]"
            @blur="index === 0 ? handleFirstMonthBlur() : null" />
          <span>元</span>
        </div>
      </div>

      <div class="form-group">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <h3>五险一金个人缴纳比例<span class="help-icon">?</span></h3>
            </TooltipTrigger>
            <TooltipContent>
              <p>根据当地政策设置各项社保和公积金的个人缴纳比例<br>缴费基数每年7月份调整</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colspan="1"></TableCell>
              <TableCell colspan="1"></TableCell>
              <TableCell colspan="1">1~6月</TableCell>
              <TableCell colspan="1">7~12月</TableCell>
            </TableRow>
            <TableRow>
              <TableCell rowspan="2">社保<br>缴费基数</TableCell>
              <TableCell>下限</TableCell>
              <TableCell><Input type="number" v-model.number="insuranceRates.socialMinBase1" /></TableCell>
              <TableCell><Input type="number" v-model.number="insuranceRates.socialMinBase2" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>上限</TableCell>
              <TableCell><Input type="number" v-model.number="insuranceRates.socialMaxBase1" /></TableCell>
              <TableCell><Input type="number" v-model.number="insuranceRates.socialMaxBase2" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell rowspan="2">公积金<br>缴费基数</TableCell>
              <TableCell>下限</TableCell>
              <TableCell><Input type="number" v-model.number="insuranceRates.housingMinBase1" /></TableCell>
              <TableCell><Input type="number" v-model.number="insuranceRates.housingMinBase2" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>上限</TableCell>
              <TableCell><Input type="number" v-model.number="insuranceRates.housingMaxBase1" /></TableCell>
              <TableCell><Input type="number" v-model.number="insuranceRates.housingMaxBase2" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div class="deduction-item">
          <Label>养老保险:</Label>
          <Input type="number" v-model.number="insuranceRates.pensionPercentage" />
          <span>%</span>
        </div>
        <div class="deduction-item">
          <Label>医疗保险:</Label>
          <Input type="number" v-model.number="insuranceRates.medicalPercentage" />
          <span>%</span>
        </div>
        <div class="deduction-item">
          <Label>失业保险:</Label>
          <Input type="number" v-model.number="insuranceRates.unemploymentPercentage" />
          <span>%</span>
        </div>
        <div class="deduction-item">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Label>住房公积金:<span class="help-icon">?</span></Label>
              </TooltipTrigger>
              <TooltipContent>
                <p>改变公积金个人缴纳比例时<br>对应公积金基数上下限也会更新</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Input type="number" v-model.number="insuranceRates.HousingFundPercentage" />
          <span>%</span>
        </div>
        <div class="deduction-item">
          <Label>补充公积金:</Label>
          <Input type="number" v-model.number="insuranceRates.supplementHousingFundPercentage" />
          <span>%</span>
        </div>
      </div>

      <div class="form-group">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <h3>专项附加扣除<span class="help-icon">?</span></h3>
            </TooltipTrigger>
            <TooltipContent>
              <p>根据个人情况填写可享受的专项附加扣除项目</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Label class="my-4">请选择申报方式：</Label>
        <RadioGroup v-model="declarationMethod" class="tax-method">
          <div class="flex items-center space-x-2">
            <RadioGroupItem value="employer" id="employer" />
            <Label for="employer">通过扣缴义务人申报</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span class="help-icon">?</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>每月由单位在工资中预扣专项附加扣除</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div class="text-gray-500 text-sm mt-1 ml-7">
            专项附加扣除由所在单位在每月扣除
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem value="self" id="self" />
            <Label for="self">综合所得年度自行申报</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span class="help-icon">?</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>年度汇算清缴时在个人所得税App自行申报扣除</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div class="text-gray-500 text-sm mt-1 ml-7">
            计算结果中每月专项附加扣除为0<br>年度汇算清缴时在个人所得税App自行申报扣除
          </div>
        </RadioGroup>
        <div class="additional-deduction-item">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Label>子女教育:<span class="help-icon">?</span></Label>
              </TooltipTrigger>
              <TooltipContent>
                <p>满3岁子女全日制学历教育支出<br>2000元/月/每个子女 定额扣除，可双方各扣除50%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Select v-model.number="specialDeductions.childrenEducation">
            <SelectTrigger>
              <SelectValue class="specialdeductionsselect" placeholder="选择金额" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem :value="0">0</SelectItem>
                <SelectItem :value="1000">1000</SelectItem>
                <SelectItem :value="2000">2000</SelectItem>
                <SelectItem :value="4000">4000</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <span>元/月</span>
          <div class="date-range" v-if="specialDeductions.childrenEducation > 0">
            <span>适用月份:</span>
            <Select class="month-select" v-model.number="specialDeductionMonths.childrenEducationStart"
              @update:modelValue="validateMonthRange('childrenEducation')">
              <SelectTrigger>
                <SelectValue placeholder="开始月份" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="m in 12" :value="m" :key="m">
                    {{ m }}月
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select class="month-select" v-model.number="specialDeductionMonths.childrenEducationEnd"
              @update:modelValue="validateMonthRange('childrenEducation')">
              <SelectTrigger>
                <SelectValue placeholder="结束月份" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="m in 12" :value="m" :key="m">
                    {{ m }}月
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div class="error-message" v-if="monthRangeErrors.childrenEducation">开始月份不能大于结束月份</div>
          </div>
        </div>
        <div class="additional-deduction-item">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Label>住房贷款利息:<span class="help-icon">?</span></Label>
              </TooltipTrigger>
              <TooltipContent>
                <p>首套住房贷款利息支出<br>1000元/月定额扣除，可双方各扣除50%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Select v-model.number="specialDeductions.housingLoan">
            <SelectTrigger>
              <SelectValue class="specialdeductionsselect" placeholder="选择金额" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem :value="0">0</SelectItem>
                <SelectItem :value="500">500</SelectItem>
                <SelectItem :value="1000">1000</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <span>元/月</span>
          <div class="date-range" v-if="specialDeductions.housingLoan > 0">
            <span>适用月份:</span>
            <Select class="month-select" v-model.number="specialDeductionMonths.housingLoanStart"
              @update:modelValue="validateMonthRange('housingLoan')">
              <SelectTrigger>
                <SelectValue placeholder="开始月份" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="m in 12" :value="m" :key="m">
                    {{ m }}月
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select class="month-select" v-model.number="specialDeductionMonths.housingLoanEnd"
              @update:modelValue="validateMonthRange('housingLoan')">
              <SelectTrigger>
                <SelectValue placeholder="结束月份" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="m in 12" :value="m" :key="m">
                    {{ m }}月
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div class="error-message" v-if="monthRangeErrors.housingLoan">开始月份不能大于结束月份</div>
          </div>
        </div>
        <div class="additional-deduction-item">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Label>住房租金:<span class="help-icon">?</span></Label>
              </TooltipTrigger>
              <TooltipContent>
                <p>1.直辖市、省会等特定城市：1500元/月<br>2.市辖区户籍人口＞100万：1100元/月<br>3.市辖区户籍人口≤100万：800元/月</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Select v-model.number="specialDeductions.housingRent">
            <SelectTrigger>
              <SelectValue class="specialdeductionsselect" placeholder="选择金额" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem :value="0">0</SelectItem>
                <SelectItem :value="800">800</SelectItem>
                <SelectItem :value="1100">1100</SelectItem>
                <SelectItem :value="1500">1500</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <span>元/月</span>
          <div v-if="specialDeductions.housingRent > 0">
            <div class="date-range">
              <span>适用月份:</span>
              <Select class="month-select" v-model.number="specialDeductionMonths.housingRentStart"
                @update:modelValue="validateMonthRange('housingRent')">
                <SelectTrigger>
                  <SelectValue placeholder="开始月份" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem v-for="m in 12" :value="m" :key="m">
                      {{ m }}月
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select class="month-select" v-model.number="specialDeductionMonths.housingRentEnd"
                @update:modelValue="validateMonthRange('housingRent')">
                <SelectTrigger>
                  <SelectValue placeholder="结束月份" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem v-for="m in 12" :value="m" :key="m">
                      {{ m }}月
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div class="error-message" v-if="monthRangeErrors.housingRent">开始月份不能大于结束月份</div>
            </div>
          </div>
        </div>
        <div class="additional-deduction-item">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Label>赡养老人:<span class="help-icon">?</span></Label>
              </TooltipTrigger>
              <TooltipContent>
                <p>赡养60岁以上老人<br>独生子女3000元/月定额扣除<br>非独生子女不超过1500元/月定额扣除</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Select v-model.number="specialDeductions.elderlySupport">
            <SelectTrigger>
              <SelectValue class="specialdeductionsselect" placeholder="选择金额" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem :value="0">0</SelectItem>
                <SelectItem :value="1000">1000</SelectItem>
                <SelectItem :value="1500">1500</SelectItem>
                <SelectItem :value="3000">3000</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <span>元/月</span>
          <div class="date-range" v-if="specialDeductions.elderlySupport > 0">
            <span>适用月份:</span>
            <Select class="month-select" v-model.number="specialDeductionMonths.elderlySupportStart"
              @update:modelValue="validateMonthRange('elderlySupport')">
              <SelectTrigger>
                <SelectValue placeholder="开始月份" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="m in 12" :value="m" :key="m">
                    {{ m }}月
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select class="month-select" v-model.number="specialDeductionMonths.elderlySupportEnd"
              @update:modelValue="validateMonthRange('elderlySupport')">
              <SelectTrigger>
                <SelectValue placeholder="结束月份" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="m in 12" :value="m" :key="m">
                    {{ m }}月
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div class="error-message" v-if="monthRangeErrors.elderlySupport">开始月份不能大于结束月份</div>
          </div>
        </div>
        <div class="additional-deduction-item">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Label>3岁以下婴幼儿照护:<span class="help-icon">?</span></Label>
              </TooltipTrigger>
              <TooltipContent>
                <p>3岁以下婴幼儿照护支出<br>2000元/月/每个婴幼儿定额扣除，可双方各扣除50%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Select v-model.number="specialDeductions.infantCare">
            <SelectTrigger>
              <SelectValue class="specialdeductionsselect" placeholder="选择金额" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem :value="0">0</SelectItem>
                <SelectItem :value="1000">1000</SelectItem>
                <SelectItem :value="2000">2000</SelectItem>
                <SelectItem :value="4000">4000</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <span>元/月</span>
          <div class="date-range" v-if="specialDeductions.infantCare > 0">
            <span>适用月份:</span>
            <Select class="month-select" v-model.number="specialDeductionMonths.infantCareStart"
              @update:modelValue="validateMonthRange('infantCare')">
              <SelectTrigger>
                <SelectValue placeholder="开始月份" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="m in 12" :value="m" :key="m">
                    {{ m }}月
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select class="month-select" v-model.number="specialDeductionMonths.infantCareEnd"
              @update:modelValue="validateMonthRange('infantCare')">
              <SelectTrigger>
                <SelectValue placeholder="结束月份" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="m in 12" :value="m" :key="m">
                    {{ m }}月
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div class="error-message" v-if="monthRangeErrors.infantCare">开始月份不能大于结束月份</div>
          </div>
        </div>
        <div class="additional-deduction-item">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Label>继续教育:<span class="help-icon">?</span></Label>
              </TooltipTrigger>
              <TooltipContent>
                <p>学历继续教育每月400元，不超过48个月<br>职业资格教育每年3600元定额扣除</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Input type="number" v-model.number="specialDeductions.continuingEducation" />
          <span>元/月</span>
          <div class="date-range" v-if="specialDeductions.continuingEducation > 0">
            <span>适用月份:</span>
            <Select class="month-select" v-model.number="specialDeductionMonths.continuingEducationStart"
              @update:modelValue="validateMonthRange('continuingEducation')">
              <SelectTrigger>
                <SelectValue placeholder="开始月份" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="m in 12" :value="m" :key="m">
                    {{ m }}月
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select class="month-select" v-model.number="specialDeductionMonths.continuingEducationEnd"
              @update:modelValue="validateMonthRange('continuingEducation')">
              <SelectTrigger>
                <SelectValue placeholder="结束月份" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="m in 12" :value="m" :key="m">
                    {{ m }}月
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div class="error-message" v-if="monthRangeErrors.continuingEducation">开始月份不能大于结束月份</div>
          </div>
        </div>
        <div class="additional-deduction-item">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Label>大病医疗:<span class="help-icon">?</span></Label>
              </TooltipTrigger>
              <TooltipContent>
                <p>医保报销后个人负担超15000元部分<br>80000元限额内据实扣除</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Input type="number" v-model.number="specialDeductions.seriousIllness" />
          <span>元/年</span>
        </div>
      </div>

      <div class="action-buttons">
        <Button class="calc-button" @click="calculate">计算</Button>
      </div>
    </div>

    <div class="result-section" v-if="results">
      <h2>计算结果</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead rowspan="2">月份</TableHead>
            <TableHead rowspan="2">税前工资</TableHead>
            <TableHead rowspan="2">缴费基数</TableHead>
            <TableHead colspan="4">五险一金</TableHead>
            <TableHead rowspan="2">专项扣除</TableHead>
            <TableHead rowspan="2">累计专项扣除</TableHead>
            <TableHead rowspan="2">累计专项<br>附加扣除</TableHead>
            <TableHead rowspan="2">预扣税率</TableHead>
            <TableHead rowspan="2">应纳税额</TableHead>
            <TableHead rowspan="2">税后工资</TableHead>
          </TableRow>
          <TableRow>
            <TableHead>公积金<br>(含补充)</TableHead>
            <TableHead>养老保险</TableHead>
            <TableHead>医疗保险</TableHead>
            <TableHead>失业保险</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="(result, index) in results.monthlyResults" :key="index">
            <TableCell>{{ index + 1 }}月</TableCell>
            <TableCell>{{ result.grossSalary.toFixed(0) }}</TableCell>
            <TableCell>{{ result.baseAmount.toFixed(0) }}</TableCell>
            <TableCell>{{ (result.insurance?.HousingFundPercentage +
              result.insurance?.supplementHousingFundPercentage).toFixed(0) }}
            </TableCell>
            <TableCell>{{ result.insurance?.pensionPercentage.toFixed(2) }}</TableCell>
            <TableCell>{{ result.insurance?.medicalPercentage.toFixed(2) }}</TableCell>
            <TableCell>{{ result.insurance?.unemploymentPercentage.toFixed(2) }}</TableCell>
            <TableCell>{{ (result.insurance?.HousingFundPercentage + result.insurance?.supplementHousingFundPercentage +
              result.insurance?.pensionPercentage + result.insurance?.medicalPercentage +
              result.insurance?.unemploymentPercentage).toFixed(2) }}</TableCell>
            <TableCell>{{ result.cumulativeDeduction.toFixed(2) }}</TableCell>
            <TableCell>{{ result.cumulativeSpecialDeduction.toFixed(0) }}</TableCell>
            <TableCell>{{ (result.taxRate * 100).toFixed(0) }}%</TableCell>
            <TableCell>{{ result.tax.toFixed(2) }}</TableCell>
            <TableCell>{{ result.netSalary.toFixed(2) }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { calculateMonthlySalary } from '@/utils/taxCalculator'
import insuranceData from '@/stores/insuranceData.json'

interface CityConfig {
  insuranceRates: {
    pensionPercentage: number
    medicalPercentage: number
    unemploymentPercentage: number
    HousingFundPercentage: number
    supplementHousingFundPercentage: number
  }
  baseConfig: Array<{
    year: number
    periods: Array<{
      startMonth: number
      baseMin: number
      baseMax: number
      housingFundRates?: Array<{
        rate: number
        minBase: number
        maxBase: number
      }>
    }>
  }>
  socialMinBase?: number
  socialMaxBase?: number
  housingMinBase?: number
  housingMaxBase?: number
}

interface Cities {
  [key: string]: CityConfig
}

const cities: Cities = insuranceData.cities as unknown as Cities
const year = ref(2024)
const years = Array.from({ length: 3 }, (_, i) => 2023 + i)
const city = ref('上海')

const monthlySalaries = ref(Array(12).fill(0))

// 1月输入框失去焦点时复制数值到2-12月
function handleFirstMonthBlur() {
  const firstMonthValue = monthlySalaries.value[0]
  if (firstMonthValue > 0) {
    for (let i = 1; i < 12; i++) {
      if (monthlySalaries.value[i] === 0) {
        monthlySalaries.value[i] = firstMonthValue
      }
    }
  }
}
const declarationMethod = ref<'employer' | 'self'>('employer')
const specialDeductions = ref({
  childrenEducation: 0,
  seriousIllness: 0,
  housingLoan: 0,
  housingRent: 0,
  elderlySupport: 0,
  infantCare: 0,
  continuingEducation: 0
})

const specialDeductionMonths = ref({
  childrenEducationStart: 1,
  childrenEducationEnd: 12,
  housingLoanStart: 1,
  housingLoanEnd: 12,
  housingRentStart: 1,
  housingRentEnd: 12,
  elderlySupportStart: 1,
  elderlySupportEnd: 12,
  infantCareStart: 1,
  infantCareEnd: 12,
  continuingEducationStart: 1,
  continuingEducationEnd: 12
})

const monthRangeErrors = ref({
  childrenEducation: false,
  housingLoan: false,
  housingRent: false,
  elderlySupport: false,
  infantCare: false,
  continuingEducation: false
})

const insuranceRates = ref({
  ...cities[city.value].insuranceRates,
  supplementHousingFundPercentage: 0, // 默认0%
  socialMinBase1: cities[city.value].socialMinBase,
  socialMinBase2: cities[city.value].socialMinBase,
  socialMaxBase1: cities[city.value].socialMaxBase,
  socialMaxBase2: cities[city.value].socialMaxBase,
  housingMinBase1: cities[city.value].housingMinBase,
  housingMinBase2: cities[city.value].housingMinBase,
  housingMaxBase1: cities[city.value].housingMaxBase,
  housingMaxBase2: cities[city.value].housingMaxBase
})

// 根据年份和城市更新社保公积金基数
function updateInsuranceBases() {
  const cityData = cities[city.value] as CityConfig
  if (!cityData || !cityData.baseConfig) return

  // 查找匹配年份的配置
  const yearConfig = cityData.baseConfig.find((config) => config.year === year.value)
  if (!yearConfig) return

  // 更新1-6月和7-12月的基数
  const period1 = yearConfig.periods.find((p) => p.startMonth === 1)
  const period2 = yearConfig.periods.find((p) => p.startMonth === 7) || period1

  // 获取当前公积金比例对应的上下限
  const getHousingLimits = (period?: {
    housingFundRates?: Array<{
      rate: number
      minBase: number
      maxBase: number
    }>
  }) => {
    if (!period?.housingFundRates?.length) return { min: 0, max: 0 }
    const rateConfig = period.housingFundRates.find(
      (r) => r.rate === insuranceRates.value.HousingFundPercentage
    )
    return rateConfig ? { min: rateConfig.minBase, max: rateConfig.maxBase } : { min: 0, max: 0 }
  }

  const period1Limits = getHousingLimits(period1)
  const period2Limits = getHousingLimits(period2)

  insuranceRates.value = {
    ...insuranceRates.value,
    socialMinBase1: period1?.baseMin || 0,
    socialMaxBase1: period1?.baseMax || 0,
    housingMinBase1: period1Limits.min,
    housingMaxBase1: period1Limits.max,
    socialMinBase2: period2?.baseMin || 0,
    socialMaxBase2: period2?.baseMax || 0,
    housingMinBase2: period2Limits.min,
    housingMaxBase2: period2Limits.max
  }
}

// 监听公积金比例变化，更新对应的上下限
watch(() => insuranceRates.value.HousingFundPercentage, () => {
  updateInsuranceBases()
})

// 初始化时和year/city变化时更新基数
updateInsuranceBases()
watch([year, city], updateInsuranceBases)

const isDarkMode = ref(false)

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark', isDarkMode.value)
}

onMounted(() => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }
})

const results = ref<any>(null)

function validateMonthRange(type: string) {
  if (type === 'seriousIllness') return

  const months = specialDeductionMonths.value
  const startKey = `${type}Start` as keyof typeof months
  const endKey = `${type}End` as keyof typeof months

  if (months[startKey] > months[endKey]) {
    monthRangeErrors.value[type as keyof typeof monthRangeErrors.value] = true
    months[endKey] = months[startKey]
  } else {
    monthRangeErrors.value[type as keyof typeof monthRangeErrors.value] = false
  }
}

function calculate() {

  let calculation = null
  try {
    // 调用计算函数
    calculation = calculateMonthlySalary({
      year: year.value,
      city: city.value,
      monthlySalary: monthlySalaries.value,
      insuranceRates: insuranceRates.value,
      specialDeductions: declarationMethod.value === 'employer' ? [{
        ...specialDeductions.value,
        deductionMonths: {
          ...specialDeductionMonths.value
        }
      }] : [],
    })

    results.value = calculation

  } catch (error: unknown) {
    if (error instanceof Error) {
      alert('计算发生错误: ' + error.message);
    } else {
      alert('计算发生未知错误');
    }
  }
}

</script>

<style scoped>
/* 隐藏number输入框的增减按钮 */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.theme-toggle {
  position: relative;
  z-index: 10;
}

/* 基础样式 */
.calculator-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  background: #ffffff05;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 响应式断点 */
@media (max-width: 1024px) {
  .calculator-container {
    padding: 0.8rem;
  }
}

@media (max-width: 768px) {
  .calculator-container {
    padding: 0.5rem;
    border-radius: 0;
    box-shadow: none;
  }
}

h1 {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: 600;
}

.subtitle {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  font-weight: 400;
}

.top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.input-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 1024px) {

  .top-row,
  .input-section {
    gap: 0.8rem;
  }
}

@media (max-width: 768px) {
  .top-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .input-section {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}

.form-group {
  margin-bottom: 1rem;
  background: #cbcbcb19;
  padding: 1rem;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .form-group {
    padding: 0.8rem;
  }
}

.form-group h3 {
  margin-right: 1rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}


input[type="number"] {
  width: 100px;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s;
  text-align: center;
  font-size: 16px;
}

select:focus,
input[type="number"]:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.monthly-salary {
  display: grid;
  grid-template-columns: 150px 100px 70px;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.monthly-salary span {
  text-align: center;
}

.additional-deduction-item {
  margin-bottom: 1rem;
  display: grid;
  grid-template-columns: 180px auto 1fr;
  align-items: center;
  gap: 0.5rem;
}

.additional-deduction-item input[type="number"] {
  width: 100px;
  margin-right: 0;
}

.additional-deduction-item span:last-child {
  z-index: 1;
  pointer-events: none;
}

.deduction-item {
  margin-bottom: 1rem;
  display: grid;
  grid-template-columns: 150px 110px 40px;
  align-items: center;
  gap: 0.5rem;
}

.deduction-item input[type="number"] {
  width: 80px;
  margin-right: 0;
}

.deduction-item span:last-child {
  z-index: 1;
  pointer-events: none;
}

@media (max-width: 768px) {
  .monthly-salary {
    grid-template-columns: 150px 120px 60px;
    gap: 0.3rem;
  }

  .deduction-item {
    grid-template-columns: 150px 100px 40px;
    gap: 0.3rem;
  }

  .monthly-salary span,
  .deduction-item span {
    text-align: center;
  }
}

.specialdeductionsselect {
  width: 50px !important;
  justify-content: center;
}

.date-range {
  display: grid;
  grid-template-columns: 120px 1fr 1fr;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  margin-top: 0rem;
  margin-bottom: 1rem;
}

.date-range span {
  margin-left: 2rem;
}

@media (max-width: 768px) {
  .date-range {
    display: grid;
    grid-template-columns: 120px 1fr 1fr;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .date-range span {
    margin-bottom: 0.2rem;
  }
}

.date-range input {
  width: 70px;
}

.action-buttons {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.calc-button {
  width: 200px;
  height: 60px;
}

.result-section {
  margin-top: 2rem;
  grid-column: 1 / -1;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  table {
    display: block;
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  table thead {
    display: table-header-group;
  }

  table tr {
    display: table-row;
  }

  table th,
  table td {
    display: table-cell;
    padding: 0.5rem;
    text-align: center;
  }

  table th {
    background: #cbcbcb19;
    color: white;
  }
}

th {
  background: #cbcbcb19;
  padding: 0.75rem;
  text-align: center;
}

td {
  padding: 0.75rem;
  text-align: center;
}

.tax-method {
  display: block;
  margin-bottom: 2rem;
}

.tax-method label {
  display: block;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.tax-method label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.tax-method input[type="radio"] {
  width: auto;
}

.error-message {
  color: #e53e3e;
  width: 300px;
  font-size: 0.875rem;
  margin-left: 5rem;
  margin-top: 0.25rem;
}

.help-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  background-color: #4299e1;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
  cursor: help;
  transform: translateY(-4px);
  transition: all 0.2s;
}

.help-icon:hover {
  background-color: #3182ce;
}

.mode-button:hover {
  background: transparent;
}
</style>

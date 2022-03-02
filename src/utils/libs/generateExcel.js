// npm i xlsx -S
import XLSX from 'xlsx'

const generateExcel = (elTableDom, excelName, filter) => {
  const book = XLSX.utils.table_to_book(elTableDom.querySelector('.el-table__header-wrapper > table'))
  const wsBody = XLSX.utils.table_to_sheet(elTableDom.querySelector('.el-table__body-wrapper > table'), {raw: true})
  const data = JSON.parse(JSON.stringify(XLSX.utils.sheet_to_json(wsBody, {header: 1}))).filter(filter)
  XLSX.utils.sheet_add_json(book.Sheets['Sheet1'], data, {origin: 'A2', skipHeader: true})
  XLSX.writeFile(book, `${excelName}.xlsx`)
}

/**
 * 将ElTable中的页面数据导出到excel
 * @param tableRef
 * @param excelName
 * @param filter 过滤器
 */
export const generateTableExcel = (tableRef, excelName = 'tableData', filter = (_value) => true) => {
  generateExcel(tableRef.$el, excelName, filter)
}

/**
 * data = [['a', 'b', 'c'], [ 11, 12, 13 ], [ 21, 22, 23 ]]
 */
/**
 * 将数据导出到excel
 * @param data, eg: [['a', 'b', 'c'], [ 11, 12, 13 ], [ 21, 22, 23 ]]
 * @param excelName
 */
export const generateDataExcel = (data, excelName = 'data') => {
  const book = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(data)
  XLSX.utils.book_append_sheet(book, worksheet, 'Sheet1')
  XLSX.writeFile(book, `${excelName}.xlsx`)
}
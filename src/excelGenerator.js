const ExcelJS = require('exceljs');

async function generateExcel(testCases) {
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Test Cases');

worksheet.columns = [
{ header: 'TC #', key: 'tcNumber', width: 12 },
{ header: 'Scenario Name', key: 'scenarioName', width: 30 },
{ header: 'Test Case Name', key: 'testCaseName', width: 35 },
{ header: 'Steps', key: 'steps', width: 50 },
{ header: 'Expected Result', key: 'expectedResult', width: 40 }
];

testCases.forEach((testCase) => {
worksheet.addRow(testCase);
});

worksheet.getRow(1).font = { bold: true };
worksheet.getRow(1).alignment = { vertical: 'middle' };

return workbook.xlsx.writeBuffer();
}

module.exports = { generateExcel };
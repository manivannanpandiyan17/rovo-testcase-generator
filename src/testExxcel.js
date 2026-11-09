const { generateExcel } = require('./excelGenerator');

async function main() {
const testCases = [
{
tcNumber: 'TC001',
scenarioName: 'Valid Login',
testCaseName: 'Login with valid credentials',
steps: '1. Open login page\n2. Enter username\n3. Enter password\n4. Click Login',
expectedResult: 'User should successfully log in'
},
{
tcNumber: 'TC002',
scenarioName: 'Invalid Login',
testCaseName: 'Login with incorrect password',
steps: '1. Open login page\n2. Enter username\n3. Enter incorrect password\n4. Click Login',
expectedResult: 'An error message should be displayed'
}
];

const buffer = await generateExcel(testCases);

const fs = require('fs');
fs.writeFileSync('test-cases.xlsx', buffer);

console.log('Excel file generated successfully!');
}

main().catch(console.error);
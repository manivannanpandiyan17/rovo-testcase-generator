const { generateExcel } = require('./excelGenerator');
const api = require('@forge/api');
const { route } = api;
const FormData = require('form-data');

const EXCEL_MIME_TYPE =
'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function response(statusCode, message) {
return {
statusCode,
headers: {
'Content-Type': ['application/json']
},
body: JSON.stringify(message)
};
}

async function processRequest(event) {
try {
// 1. Authenticate incoming request
const headers = event.headers || {};

const authorizationValues =
headers.authorization || headers.Authorization;

const authHeader = Array.isArray(authorizationValues)
? authorizationValues[0]
: authorizationValues;

const secret = process.env.WEBTRIGGER_SECRET;

if (!secret || authHeader !== `Bearer ${secret}`) {
return response(401, { error: 'Unauthorized' });
}

// 2. Parse incoming JSON
const payload = JSON.parse(event.body || '{}');

const { issueKey, testCases } = payload;

if (
!issueKey ||
typeof issueKey !== 'string' ||
!Array.isArray(testCases) ||
testCases.length === 0
) {
return response(400, {
error: 'issueKey and non-empty testCases array are required'
});
}

// 3. Generate Excel
const excelBuffer = Buffer.from(
await generateExcel(testCases)
);

// 4. Create multipart form
const form = new FormData();

form.append('file', excelBuffer, {
filename: `${issueKey}-test-cases.xlsx`,
contentType: EXCEL_MIME_TYPE,
knownLength: excelBuffer.length
});

// 5. Serialize complete multipart body
const multipartBody = form.getBuffer();

// 6. Prepare multipart headers
const multipartHeaders = form.getHeaders();

const requestHeaders = {
Accept: 'application/json',
'X-Atlassian-Token': 'no-check',
'Content-Type': multipartHeaders['content-type'],
'Content-Length': String(multipartBody.length)
};

// 7. Upload attachment to Jira
const jiraResponse = await api.asApp().requestJira(
route`/rest/api/3/issue/${issueKey}/attachments`,
{
method: 'POST',
headers: requestHeaders,
body: multipartBody
}
);

// 8. Handle Jira response
if (!jiraResponse.ok) {
const errorText = await jiraResponse.text();

console.error(
'Jira attachment failed:',
jiraResponse.status,
errorText
);

return response(jiraResponse.status, {
error: 'Jira attachment upload failed',
details: errorText
});
}

// 9. Confirm attachment
const attachments = await jiraResponse.json();

console.log('Excel attached successfully:', issueKey);

return response(200, {
message: 'Excel attached successfully',
issueKey,
attachments
});

} catch (error) {
console.error('Processing error:', error);

return response(500, {
error: 'Internal processing error'
});
}
}

exports.runSync = async (event) => processRequest(event);

exports.runAsync = async (event) => processRequest(event);
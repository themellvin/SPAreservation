const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The block starts with `) : settingsTab === 'webhooks' ? (` and ends before `) : (` for the database section.
// Let's use string manipulation to find these indices and splice them out.

const startIndex = content.indexOf(") : settingsTab === 'webhooks' ? (");
const endIndex = content.indexOf(") : (\n                <section className=\"space-y-6\">\n                  <div className=\"border-b border-outline-variant pb-2\">\n                    <h3 className=\"text-headline-lg font-headline-lg text-on-surface flex items-center gap-2\">\n                      <span className=\"material-symbols-outlined text-primary\">database</span>\n                      Data Sources");

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + ") : (" + content.substring(endIndex + 5);
  fs.writeFileSync(filePath, content);
  console.log("Webhooks section removed successfully!");
} else {
  console.log("Could not find bounds.");
  console.log(startIndex, endIndex);
}

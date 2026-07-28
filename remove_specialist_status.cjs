const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the Toggle button
content = content.replace(
  /<button \n\s*onClick=\{[^\}]+\}\n\s*className=\{`px-2 py-0\.5 rounded text-\[10px\] font-bold transition-all flex-1 \$\{usr\.status === 'active' \? 'bg-primary\/10 hover:bg-primary\/20 text-primary' : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'\}`\}\n\s*>\n\s*Toggle\n\s*<\/button>/g,
  ''
);

// 2. Remove the Active/Inactive indicator
content = content.replace(
  /<div className="mt-1 flex items-center gap-1">\n\s*<span className=\{`w-2 h-2 rounded-full \$\{usr\.status === 'active' \? 'bg-emerald-500' : 'bg-outline-variant'\}`\} \/>\n\s*<span className="text-\[10px\] font-semibold">\{usr\.status === 'active' \? 'Active' : 'Inactive'\}<\/span>\n\s*<\/div>/g,
  ''
);

// 3. Remove status filter from all dropdowns and lists
content = content.replace(/\.filter\(s => s\.status === 'active'\)/g, '');
content = content.replace(/\.filter\(s=>s\.status === 'active'\)/g, '');
content = content.replace(/s\.status === 'active' && /g, '');
content = content.replace(/s => s\.status === 'active' && /g, 's => ');
content = content.replace(/s=>s\.status === 'active' && /g, 's=>');

// 4. Handle specific lines
content = content.replace(/if \(spec\.status === 'active' && spec\.calUserId\)/g, "if (spec.calUserId)");
content = content.replace(/const otherActiveSpecs = specialists\.filter\(s => s\.status === 'active' && s\.therapist_name !== targetSpecialistName\);/g, "const otherActiveSpecs = specialists.filter(s => s.therapist_name !== targetSpecialistName);");
content = content.replace(/filterSpecActive === 'Active' \? usr\.status === 'active' : usr\.status !== 'active'/g, "true");

// 5. Remove handleToggleSpecialistActive function
content = content.replace(
  /const handleToggleSpecialistActive = \(id: string\) => \{\n\s*setSpecialists\(prev => prev.map\(s => \(s.therapist_id \|\| s.id\) === id \? \{ \.\.\.s, status: s.status === 'active' \? 'inactive' : 'active' \} : s\)\);\n\s*triggerNotification\('Specialist status toggled.'\);\n\s*\};\n/g,
  ''
);

fs.writeFileSync(filePath, content);
console.log('Done!');

import fs from 'fs';

const p = './src/App.tsx';
let content = fs.readFileSync(p, 'utf8');
content = content.replace(/label="([^"]+)"/g, 'label={<EditableText isTestMode={isTestMode} defaultText="$1" />}');
fs.writeFileSync(p, content);

const p2 = './src/components/ManagerReviewForm.tsx';
let content2 = fs.readFileSync(p2, 'utf8');
content2 = content2.replace(/label="([^"]+)"/g, 'label={<EditableText isTestMode={isTestMode} defaultText="$1" />}');
fs.writeFileSync(p2, content2);

console.log('done');

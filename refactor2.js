import fs from 'fs';

let p = './src/App.tsx';
let content = fs.readFileSync(p, 'utf8');

// Replace inner text of labels
content = content.replace(/<label className="block text-\[11px\] text-gray-500 mb-1">([^<]+)<\/label>/g, 
  '<label className="block text-[11px] text-gray-500 mb-1"><EditableText isTestMode={isTestMode} defaultText="$1" /></label>');

// Also find any <span> or <div> that might be a header.
content = content.replace(/<div className="text-xs font-bold text-gray-800 mb-[4px] pb-1 border-b border-gray-100">([^<]+)<\/div>/g, 
  '<div className="text-xs font-bold text-gray-800 mb-[4px] pb-1 border-b border-gray-100"><EditableText isTestMode={isTestMode} defaultText="$1" /></div>');

content = content.replace(/<span className="font-semibold text-gray-500">([^<]+)<\/span>/g,
  '<span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="$1" /></span>');

content = content.replace(/<div className="font-semibold text-gray-700 mb-1">([^<]+)<\/div>/g,
  '<div className="font-semibold text-gray-700 mb-1"><EditableText isTestMode={isTestMode} defaultText="$1" /></div>');

fs.writeFileSync(p, content);

console.log('done');

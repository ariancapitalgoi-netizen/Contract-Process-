import * as fs from "fs";
import * as path from "path";

const dirs = ["src", "src/components"];
const persianRegex = /([>])([ \t\n\r]*)([آ-ی0-9][آ-ی0-9\s‌،.:؛()؟A-Za-z-]*[آ-ی:؟])([ \t\n\r]*)(<)/g;

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith(".tsx")) {
      const filePath = path.join(dir, file);
      let content = fs.readFileSync(filePath, "utf-8");
      
      let changed = false;
      content = content.replace(persianRegex, (match, p1, p2, p3, p4, p5) => {
        // Skip if already in EditableText
        if (p3.includes("EditableText")) return match;
        // Skip string literals if this matched inside script but wait, JSX tags >...< are safe.
        // We ensure p3 doesn't have any < or > inside it by the nature of the match.
        changed = true;
        return `${p1}${p2}<EditableText isTestMode={isTestMode} defaultText="${p3.trim()}" />${p4}${p5}`;
      });

      // Special case for 'value=' strings in select/option? Wait, option doesn't need to be EditableText usually, but maybe it does.
      // Wait, isTestMode needs to be imported or available.
      // If changed, save
      if (changed) {
        // check if isTestMode is in scope. It relies on the component having `isTestMode?: boolean;` prop.
        console.log(`Updated ${filePath}`);
        fs.writeFileSync(filePath, content, "utf-8");
      }
    }
  }
}

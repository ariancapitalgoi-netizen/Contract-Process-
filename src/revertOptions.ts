import * as fs from "fs";
import * as path from "path";

const dirs = ["src", "src/components"];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith(".tsx")) {
      const filePath = path.join(dir, file);
      let content = fs.readFileSync(filePath, "utf-8");
      
      let changed = false;
      content = content.replace(/<option([^>]*)><EditableText [^>]*defaultText="([^"]+)" \/><\/option>/g, (match, p1, p2) => {
        changed = true;
        return `<option${p1}>${p2}</option>`;
      });

      if (changed) {
        console.log(`Updated ${filePath}`);
        fs.writeFileSync(filePath, content, "utf-8");
      }
    }
  }
}

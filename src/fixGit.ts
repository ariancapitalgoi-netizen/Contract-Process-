import * as fs from "fs";

let text = fs.readFileSync("src/components/SoftwareGuide.tsx", "utf-8");
text = text.replace(/<EditableText isTestMode=\{isTestMode\} defaultText="(.*?)" \/>/g, "$1");
fs.writeFileSync("src/components/SoftwareGuide.tsx", text);

text = fs.readFileSync("src/components/JalaliDatePicker.tsx", "utf-8");
text = text.replace(/<EditableText isTestMode=\{isTestMode\} defaultText="(.*?)" \/>/g, "$1");
fs.writeFileSync("src/components/JalaliDatePicker.tsx", text);


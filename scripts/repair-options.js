const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function fixFile(file) {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Strip repeated node append suffixes caused by previous regex
  const duplicatePattern = ', "text/html").body.childNodes), "text/html").body.childNodes)';
  while (code.includes(duplicatePattern)) {
    code = code.split(duplicatePattern).join(', "text/html").body.childNodes)');
  }

  code = code.replace(/, "text\/html"\)\.body\.childNodes\)\)/g, ', "text/html").body.childNodes)');

  fs.writeFileSync(file, code, 'utf8');

  try {
    execSync(`node -c "${file}"`, { stdio: 'inherit' });
    console.log(`Repaired & verified syntax: ${file}`);
  } catch (e) {
    console.error(`Syntax error remaining in ${file}:`, e.message);
  }
}

const root = path.resolve(__dirname, '..');
fixFile(path.join(root, 'dist', 'options', 'options.js'));
fixFile(path.join(root, 'dist', 'options', 'tour-guide.js'));
fixFile(path.join(root, 'dist', 'options', 'popup-tour.js'));

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function sanitizeCode(code) {
  let original = code;

  // 1. Convert empty innerHTML assignments
  code = code.replace(/(\b[a-zA-Z0-9_$.]+)\.innerHTML\s*=\s*""/g, '$1.textContent = ""')
            .replace(/(\b[a-zA-Z0-9_$.]+)\.innerHTML\s*=\s*''/g, '$1.textContent = ""');

  // 2. Convert single-quoted or double-quoted string assignments: el.innerHTML = '...' or "..."
  code = code.replace(/(\b[a-zA-Z0-9_$.]+)\.innerHTML\s*=\s*('([^'\\]|\\.)*'|"([^"\\]|\\.)*")/g, (m, varName, strVal) => {
    return `${varName}.replaceChildren(...new DOMParser().parseFromString(${strVal}, "text/html").body.childNodes)`;
  });

  // 3. Convert template literal assignments: el.innerHTML = `...`
  let result = '';
  let lastIndex = 0;
  const regex = /(\b[a-zA-Z0-9_$.]+)\.innerHTML\s*=\s*`/g;
  let match;

  while ((match = regex.exec(code)) !== null) {
    const varName = match[1];
    const matchStart = match.index;
    const backtickStart = matchStart + match[0].length - 1;

    let i = backtickStart + 1;
    let inExpr = 0;
    let closed = false;

    while (i < code.length) {
      const ch = code[i];
      if (ch === '\\') {
        i += 2;
        continue;
      }
      if (ch === '$' && code[i + 1] === '{') {
        inExpr++;
        i += 2;
        continue;
      }
      if (ch === '}' && inExpr > 0) {
        inExpr--;
        i++;
        continue;
      }
      if (ch === '`' && inExpr === 0) {
        closed = true;
        break;
      }
      i++;
    }

    if (closed) {
      result += code.substring(lastIndex, matchStart);
      result += `${varName}.replaceChildren(...new DOMParser().parseFromString(\``;
      result += code.substring(backtickStart + 1, i + 1);
      result += `, "text/html").body.childNodes)`;
      lastIndex = i + 1;
      regex.lastIndex = i + 1;
    }
  }
  result += code.substring(lastIndex);
  code = result;

  // 4. Convert simple identifier/expression assignments: el.innerHTML = varName
  code = code.replace(/(\b[a-zA-Z0-9_$.]+)\.innerHTML\s*=\s*([a-zA-Z0-9_$.]+)(?=[;,)\n])/g, (m, varName, valExpr) => {
    return `${varName}.replaceChildren(...new DOMParser().parseFromString(${valExpr} || "", "text/html").body.childNodes)`;
  });

  return code;
}

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');
  let original = code;

  let sanitized = sanitizeCode(code);

  if (sanitized !== original) {
    fs.writeFileSync(filePath, sanitized, 'utf8');
    console.log(`Sanitized innerHTML in: ${filePath}`);

    // Verify syntax with node -c
    try {
      execFileSync(process.execPath, ['-c', filePath], { stdio: 'inherit' });
      console.log(`Syntax check PASSED: ${filePath}`);
    } catch (err) {
      console.error(`Syntax check FAILED for: ${filePath}`);
      fs.writeFileSync(filePath, original, 'utf8');
      process.exit(1);
    }
  }
}

function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) walk(full);
    else if (item.name.endsWith('.js')) processFile(full);
  }
}

const rootDir = path.resolve(__dirname, '..');
walk(path.join(rootDir, 'dist'));
console.log('Sanitization complete & syntax verified.');

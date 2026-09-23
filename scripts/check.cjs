#!/usr/bin/env node
/**
 * 构建前静态自检：npm run check
 *
 * 为什么需要它：这个环境里装不了 node 依赖、跑不了 npm run build，
 * 所以用「真语法解析 + 链接一致性」兜住最容易出问题的地方。
 *
 * 做两件事：
 *   1. 抽出每个 <script> 块做语法校验
 *      - is:inline / define:vars → 浏览器普通脚本，用 vm.Script 解析。
 *        这是唯一能抓出「顶层 return」的语义：.cjs 在 CommonJS 里会被包成函数，顶层 return 是合法的，抓不到。
 *      - 其余脚本 → Astro 会打包成 ES 模块，写成临时 .mjs 用 node --check 校验
 *        （模块语义下 import.meta、顶层 await 都合法）
 *   2. 检查站内链接是否都过了 withBase()，防止部署到子路径后 404
 *
 * 自测：node scripts/check.cjs --self-test
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** 校验一段脚本，通过返回 null，否则返回错误描述 */
function checkScript(code, isClassic, tmpDir, seq) {
  if (isClassic) {
    try {
      new vm.Script(code);
      return null;
    } catch (error) {
      return error.message;
    }
  }

  const tmpFile = path.join(tmpDir, `block-${seq}.mjs`);
  fs.writeFileSync(tmpFile, code);
  try {
    execFileSync(process.execPath, ['--check', tmpFile], { stdio: 'pipe' });
    return null;
  } catch (error) {
    return (error.stderr || '').toString().trim().split('\n').slice(0, 4).join(' | ');
  }
}

// ─────────────────────────────────────────────────────────────
// 自测：确认这个工具真的能抓到问题，而不是永远返回「通过」
// ─────────────────────────────────────────────────────────────
if (process.argv.includes('--self-test')) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'self-test-'));
  const cases = [
    ['普通脚本顶层 return', 'if (true) return;', true, true],
    ['普通脚本里的 import.meta', 'const x = import.meta.env.BASE_URL;', true, true],
    ['普通脚本正常代码', 'const a = 1; console.log(a);', true, false],
    ['模块里的 import.meta', 'const x = import.meta.env.BASE_URL;', false, false],
    ['模块里的顶层 await', 'const x = await Promise.resolve(1);', false, false],
    ['模块里的语法错误', 'const a = ;', false, true],
  ];

  let wrong = 0;
  cases.forEach(([label, code, isClassic, shouldFail], i) => {
    const didFail = checkScript(code, isClassic, tmp, i) !== null;
    const ok = didFail === shouldFail;
    if (!ok) wrong++;
    console.log(`${ok ? '✓' : '✗'} ${label}  →  ${didFail ? '报错' : '通过'}`);
  });
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(wrong === 0 ? '\n自测通过：检查器行为符合预期' : `\n自测失败：${wrong} 个用例行为不符`);
  process.exit(wrong === 0 ? 0 : 1);
}

// ─────────────────────────────────────────────────────────────
// 正式检查
// ─────────────────────────────────────────────────────────────

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-check-'));
let failures = 0;
function fail(message) {
  console.log(`✗ ${message}`);
  failures++;
}

// 1. 脚本语法
const scriptTargets = walk(path.join(root, 'src'))
  .filter((f) => f.endsWith('.astro'))
  .concat([path.join(root, 'design-preview.html')]);

const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/g;
let scriptCount = 0;

for (const file of scriptTargets) {
  const source = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);
  let match;

  while ((match = scriptRe.exec(source)) !== null) {
    const attrs = match[1];
    const code = match[2];
    if (!code.trim()) continue;

    const isClassic = /is:inline/.test(attrs) || /define:vars/.test(attrs);
    const kind = isClassic ? 'inline/classic' : 'module';
    const error = checkScript(code, isClassic, tmpDir, scriptCount);
    scriptCount++;

    if (error) fail(`${rel}  第 ${scriptCount} 个 script 块 [${kind}]  ${error}`);
  }
}

// 2. 站内链接与导入一致性
for (const file of walk(path.join(root, 'src'))) {
  const rel = path.relative(root, file);
  const source = fs.readFileSync(file, 'utf8');

  // 定义 withBase 的文件本身不需要导入它
  if (!rel.endsWith('site.config.mjs')) {
    const uses = /withBase\(/.test(source);
    const imports = /import\s*\{[^}]*withBase[^}]*\}\s*from/.test(source);
    if (uses && !imports) fail(`${rel}  用了 withBase() 但没有导入`);
    if (imports && !uses) fail(`${rel}  导入了 withBase 但没有使用`);
  }

  source
    .split('\n')
    .map((line, i) => ({ text: line.trim(), no: i + 1 }))
    .filter(({ text }) => /href="\/|href=\{`\/|src="\/|url\("\/|"\/pagefind/.test(text))
    .forEach(({ text, no }) => {
      fail(`${rel}:${no}  硬编码站内路径，应该用 withBase()  →  ${text}`);
    });
}

fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(
  failures === 0
    ? `\n✓ 自检通过：${scriptCount} 个脚本块语法正确，站内链接无硬编码路径`
    : `\n发现 ${failures} 处问题`
);

process.exit(failures === 0 ? 0 : 1);

/*
 * Regenerate assets/search-index.js from the static HTML pages.
 *
 * Usage:
 *   node tools/build-search-index.js
 *
 * No dependencies. The generated file powers the site-wide search in assets/app.js.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = fs.readdirSync(root).filter((file) => file.endsWith('.html'));

const keywordMap = {
  'playwright.html|pw-syntax': 'syntax usage quick reference cheat sheet playwright',
  'playwright.html|5-5-3': 'cli command npx playwright test headed ui debug grep project reporter last-failed codegen show-report show-trace',
  'playwright.html|5-5-4': 'getByRole getByLabel getByPlaceholder getByText getByAltText getByTitle getByTestId locator filter nth first last and or strict mode',
  'playwright.html|5-5-5': 'action click dblclick fill press pressSequentially check uncheck selectOption hover dragTo setInputFiles focus scrollIntoViewIfNeeded evaluate',
  'playwright.html|5-5-6': 'assertion toBeVisible toBeHidden toBeEnabled toBeDisabled toBeChecked toHaveText toContainText toHaveValue toHaveAttribute toHaveClass toHaveCount toHaveURL toHaveTitle toHaveScreenshot expect.soft expect.poll not',
  'playwright.html|5-5-7': 'test structure describe beforeEach afterEach test.step skip fixme only tag data-driven test.use',
  'playwright.html|5-5-8': 'fixture custom fixture base.extend loggedInPage',
  'playwright.html|5-5-9': 'page object model pom class login page dashboard page',
  'playwright.html|5-5-10': 'playwright.config.ts config testDir timeout retries workers reporter baseURL trace screenshot video projects webServer devices',
  'playwright.html|5-5-11': 'api testing request get post put delete status json headers token form multipart',
  'playwright.html|5-5-12': 'python pytest-playwright sync_api expect page',
  'playwright.html|5-5-13': 'debug debugging inspector page.pause ui mode trace viewer reporter screenshot visual comparison update-snapshots',
  'playwright.html|5-5-14': 'network mocking route fulfill abort continue unroute waitForResponse waitForRequest mock api error 500',
  'playwright.html|5-5-15': 'authentication storage state storageState auth.json login session',
  'playwright.html|5-5-16': 'parallelism workers fullyParallel serial retries projects test isolation',
  'playwright.html|5-5-17': 'ci cd github actions workflow yaml playwright.yml',
  'playwright.html|5-5-18': 'best practices waitForTimeout locator isolated trace mock ci',
};

function decodeEntities(value) {
  const named = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  };
  return String(value || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)))
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] || match);
}

function stripTags(value) {
  return decodeEntities(String(value || '').replace(/<[^>]*>/g, ' '));
}

function clean(value, max) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

function sectionText(sectionHtml) {
  return stripTags(
    sectionHtml
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<div class="code-header">[\s\S]*?<\/div>/gi, ' ')
      .replace(/<button\b[\s\S]*?<\/button>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
  );
}

function sectionCode(sectionHtml) {
  const blocks = [];
  const re = /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi;
  let match;
  while ((match = re.exec(sectionHtml))) blocks.push(stripTags(match[1]));
  return blocks.join(' ');
}

function sectionSubheads(sectionHtml) {
  const heads = [];
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  let match;
  while ((match = re.exec(sectionHtml))) heads.push(stripTags(match[1]));
  return heads.join(' | ');
}

function pageHead(html) {
  const head = html.match(/<div class="page-head">([\s\S]*?)<\/div>/i);
  if (head) {
    const h1 = head[1].match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const lede = head[1].match(/<p class="page-lede"[^>]*>([\s\S]*?)<\/p>/i);
    return {
      title: stripTags(h1 ? h1[1] : ''),
      lede: stripTags(lede ? lede[1] : ''),
    };
  }
  const hero = html.match(/<section[^>]*id="idx-hero"[^>]*>([\s\S]*?)<\/section>/i);
  if (hero) {
    const h1 = hero[1].match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const lede = hero[1].match(/<p class="hero-sub"[^>]*>([\s\S]*?)<\/p>/i);
    return {
      title: stripTags(h1 ? h1[1] : ''),
      lede: stripTags(lede ? lede[1] : ''),
    };
  }
  return { title: '', lede: '' };
}

const index = [];

for (const file of files) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const pageTitle = stripTags((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || file);
  const head = pageHead(html);

  index.push({
    page: file,
    pageTitle,
    id: '',
    title: head.title || pageTitle,
    text: clean(head.lede, 700),
    code: '',
    subheads: '',
    keywords: '',
    kind: 'page',
  });

  const sectionRe = /<section\b([^>]*)>([\s\S]*?)<\/section>/gi;
  let section;
  while ((section = sectionRe.exec(html))) {
    const attrs = section[1];
    if (!/data-searchable/.test(attrs)) continue;

    const body = section[2];
    const heading = body.match(/<h2[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/i) ||
      body.match(/<h1[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h1>/i) ||
      body.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) ||
      body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

    const sectionId = (attrs.match(/\bid="([^"]+)"/) || [])[1] || '';
    const headingId = heading && heading.length === 3 ? heading[1] : '';
    const headingHtml = heading ? (heading.length === 3 ? heading[2] : heading[1]) : '';
    const title = stripTags(headingHtml);
    if (!title) continue;

    const id = headingId || sectionId;
    index.push({
      page: file,
      pageTitle,
      id,
      title: clean(title, 180),
      text: clean(sectionText(body), 700),
      code: clean(sectionCode(body), 900),
      subheads: clean(sectionSubheads(body), 320),
      keywords: keywordMap[file + '|' + id] || '',
      kind: 'section',
    });
  }
}

const output = '/* Generated by tools/build-search-index.js — do not edit by hand. */\n' +
  'window.QA_SEARCH_INDEX = ' + JSON.stringify(index) + ';\n';

fs.writeFileSync(path.join(root, 'assets', 'search-index.js'), output, 'utf8');
console.log('Wrote assets/search-index.js with ' + index.length + ' entries (' + output.length + ' bytes).');

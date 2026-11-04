# QA Playbook — Software Testing & QA + Playwright Cheat Sheet

เว็บไซต์ **static site** สำหรับเปิดดูระหว่างสอบวิชา **Software Testing and Quality Assurance** ที่ครอบคลุมทฤษฎีการทดสอบซอฟต์แวร์และการใช้งาน **Playwright** (ทั้ง UI และ API)

หลักการ: **หาเจอเร็ว, มีสูตร/ตาราง/ตัวอย่างที่คำนวณให้ดู, copy โค้ดได้ทันที, ทำตามได้ทีละ step**

## เทคโนโลยี

| ส่วน | ใช้ |
|---|---|
| Markup | HTML5 หลายหน้า (ไม่ใช้ SPA framework) |
| Styling | CSS ของโปรเจกต์เอง (`assets/style.css`) — design system แบบ soft violet, ไม่มี build step |
| Interactivity | Vanilla JavaScript (`assets/app.js`, `assets/tools.js`) |
| Search | Site-wide index (`assets/search-index.js`) + UI ใน `assets/app.js` |
| Syntax highlight | highlight.js ผ่าน CDN (cdnjs) + ธีม `atom-one-dark` |
| ฟอนต์ | Poppins + Noto Sans Thai + Instrument Serif + JetBrains Mono (Google Fonts) |
| Build tool | **ไม่ใช้** (ห้าม npm/Vite/Webpack ในตัวเว็บ) |
| Backend | **ไม่มี** (เปิด `index.html` ได้เลย) |

## วิธีเปิด

- ดับเบิลคลิก `index.html` ได้เลย
- หรือเปิด local server:

```bash
cd testing-cheatsheet
python -m http.server 5500
```

แล้วเปิด `http://localhost:5500/`

## โครงสร้างหน้า (Page Map)

| หน้า | เนื้อหา |
|---|---|
| `index.html` | Hero, แผนผังภาพรวม, Quick Start Playwright 5 นาที, ตารางสรุปสูตร |
| `fundamentals.html` | QA vs QC, Verification vs Validation, principles, levels, types, metrics |
| `test-design.html` | EP, BVA, Decision Table, State Transition, Use Case, Pairwise, Error Guessing, Cause-Effect |
| `white-box.html` | CFG, Coverage, Cyclomatic Complexity, Basis Path, Mutation |
| `documents.html` | Test Case, Bug Report, Test Plan, Test Summary, RTM, Risk-based testing |
| `playwright.html` | Playwright Syntax & Usage quick reference + ตั้งแต่ติดตั้งถึง CI (หัวข้อ 5.5.0 – 5.5.18) |
| `playwright-recipes.html` | สูตรโค้ด Playwright 16 หัวข้อ (Login, TodoMVC, Form, Table, Cart, API, Mock, Visual, Responsive) |
| `tools.html` | เครื่องมือคำนวณ/สร้างอัตโนมัติ 8 เครื่อง |
| `troubleshooting.html` | อาการ → สาเหตุ → วิธีแก้ |
| `checklist.html` | Checklist ติ้๊กใน localStorage + Reset |
| `links.html` | Official docs + practice sites |
| `glossary.html` | ศัพท์ไทย–อังกฤษ |

## Search ทั้งเว็บ

ช่องค้นหาที่ navbar ค้นหาข้อมูลจากทุกหน้า ไม่ใช่แค่หน้าปัจจุบัน:

- พิมพ์คำค้น → แสดงผลลัพธ์สูงสุด 10 รายการ พร้อมชื่อหน้า/หัวข้อ/snippet
- กด `↑` `↓` เพื่อเลือก, `Enter` เพื่อเปิด, `Esc` เพื่อปิด
- เปิด search เร็ว ๆ ด้วย `/` หรือ `Ctrl/Cmd + K`
- ผลลัพธ์ค้นจากหัวข้อ เนื้อหา และ code block (เช่น `getByRole`, `toBeVisible`, `page.route`)

ดัชนีค้นหาอยู่ที่ `assets/search-index.js` — สร้างจากทุกหน้า HTML ด้วย:

```bash
node tools/build-search-index.js
```

## Playwright Syntax & Usage

หน้า `playwright.html` มี section **Playwright Syntax & Usage — Quick Reference** อยู่บนสุด สรุป:

- โครงสร้าง test, `describe`, hooks, `test.step`, tag, `test.use`
- Locator syntax (`getByRole`, `getByLabel`, `filter`, `nth`, ...)
- Action syntax (`click`, `fill`, `press`, `selectOption`, ...)
- Assertion syntax (`toBeVisible`, `toHaveText`, `toHaveURL`, ...)
- Wait / network / mocking, config, fixtures, POM
- ตัวอย่างใช้งานจริง Login + Mock API และตารางนำทางไปหัวข้อลึก

## Quick Start Playwright

```bash
npm init playwright@latest
npx playwright install
npx playwright test
npx playwright show-report
```

## สูตรสรุปที่นิยม

- V(G) = E − N + 2P (หรือ decision nodes + 1; หรือ regions)
- Decision table rules = 2^n
- BVA test values = min−1, min, min+1, max−1, max, max+1
- Coverage % = (executed / total) × 100

## การติดตั้ง/ใช้งาน

- เปิด `index.html` ได้เลย (double-click) หรือ `python -m http.server 5500`
- ทุกหน้ามี navbar, site-wide search, dark mode, sidebar, code copy, key points
- ใช้งานได้ทั้งแบบ file:// และ http://

## Version ที่ใช้ในเนื้อหา

- Playwright Test ~1.64.1 (docs อัปเดต 4 พ.ค.–4 พ.ย. 2026)
- Node.js 22.x / 24.x / 26.x

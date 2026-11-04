# SPEC: Software Testing & QA + Playwright Cheat-Sheet Website

> เอกสารนี้คือ spec ให้ AI coding agent (opencode) สร้างเว็บไซต์ทั้งหมดตามที่ระบุ
> อ่านทั้งไฟล์ก่อนเริ่มทำ ทำตามลำดับใน "Build Order" และห้ามข้ามหัวข้อที่ระบุว่า REQUIRED

---

## 1. Goal

สร้างเว็บไซต์ **static site** สำหรับเปิดดูระหว่างสอบวิชา **Software Testing and Quality Assurance** ที่ครอบคลุม 2 ส่วน:

1. **ทฤษฎี/เทคนิคการทดสอบซอฟต์แวร์** (ออกแบบ test case, coverage, bug report, test plan ฯลฯ)
2. **การใช้งาน Playwright** (เขียน automated test สำหรับเว็บ ทั้ง UI และ API)

หลักการ: **หาเจอเร็ว, มีสูตร/ตาราง/ตัวอย่างที่คำนวณให้ดู, copy โค้ดได้ทันที, ทำตามได้ทีละ step**
ข้อสอบอาจเป็นทั้งข้อเขียน (ออกแบบ test case, คำนวณ coverage, อธิบายแนวคิด) และปฏิบัติ (เขียน Playwright test) จึงต้องมีทั้งสองด้านที่ใช้ได้จริง

---

## 2. Tech Stack ของตัวเว็บ (ห้ามเปลี่ยน)

| ส่วน | ใช้ |
|---|---|
| Markup | HTML5 หลายหน้า (ไม่ใช้ SPA framework) |
| Styling | Tailwind CSS ผ่าน CDN: `<script src="https://cdn.tailwindcss.com"></script>` |
| Interactivity | Vanilla JavaScript (`assets/app.js` และ `assets/tools.js`) |
| Syntax highlight | highlight.js ผ่าน CDN (cdnjs) |
| Build tool | **ไม่ใช้** (ห้ามใช้ npm, Vite, Webpack ในตัวเว็บ) |
| Backend ของเว็บนี้ | **ไม่มี** (เปิด `index.html` ได้เลย) |

ต้องใช้งานได้ทั้งแบบดับเบิลคลิกเปิดไฟล์ และ `python -m http.server`

---

## 3. Project Structure

```
testing-cheatsheet/
├── index.html                 # หน้าแรก + Quick Start + สารบัญ
├── fundamentals.html          # REQUIRED: พื้นฐาน software testing / QA
├── test-design.html           # REQUIRED: เทคนิคออกแบบ test case (black-box)
├── white-box.html             # REQUIRED: white-box + coverage + cyclomatic complexity
├── documents.html             # REQUIRED: template เอกสาร (test case, bug report, test plan)
├── playwright.html            # REQUIRED: Playwright ตั้งแต่ติดตั้งถึง CI
├── playwright-recipes.html    # REQUIRED: สูตรโค้ด Playwright พร้อม copy ตามสถานการณ์
├── tools.html                 # REQUIRED: เครื่องมือคำนวณ/สร้างอัตโนมัติ (ดู 5.7)
├── troubleshooting.html       # REQUIRED: error ที่เจอบ่อยของ Playwright
├── checklist.html             # REQUIRED: checklist ตอนสอบ
├── glossary.html              # OPTIONAL: ศัพท์ไทย-อังกฤษ
├── links.html                 # REQUIRED: ลิงก์ official docs
├── assets/
│   ├── app.js                 # copy button, search, dark mode, sidebar, checklist
│   ├── tools.js               # logic ของเครื่องมือในหน้า tools.html
│   └── style.css
└── README.md
```

---

## 4. Global UI Requirements

ทุกหน้าต้องมี:

1. **Top navbar** แบบ sticky ลิงก์ไปทุกหน้า + ปุ่ม dark/light mode + ช่อง search
2. **Sidebar** สารบัญ (จอใหญ่) สร้างจาก `h2` อัตโนมัติ บนมือถือเป็นปุ่มเมนู
3. **Code block** ทุกอันมี label ชื่อไฟล์ (เช่น `tests/login.spec.ts`), ปุ่ม **Copy** (แสดง "Copied!" 1.5 วินาที), และ syntax highlight
4. **Search** กรอง `section[data-searchable]` ฝั่ง client
5. **Dark mode** ด้วย Tailwind `darkMode: 'class'` จำค่าใน `localStorage`
6. **Responsive** (ตาราง/โค้ดกว้างให้เลื่อนในกล่องตัวเอง ห้ามให้ทั้งหน้าเลื่อนแนวนอน)
7. ภาษาเนื้อหา: **ไทยผสมศัพท์เทคนิคอังกฤษ** (ศัพท์สำคัญเขียนคู่ เช่น "การแบ่งกลุ่มข้อมูล (Equivalence Partitioning)")
8. ฟอนต์: `Noto Sans Thai` + `JetBrains Mono` พร้อม fallback (`system-ui, sans-serif` / `monospace`)
9. กล่อง **"สรุปท่องจำ (Key Points)"** ท้ายแต่ละ section สำคัญ เป็น bullet 3–5 ข้อ

---

## 5. Content Spec

### 5.1 `fundamentals.html` (REQUIRED)

เขียนกระชับ เป็นตาราง/การ์ด/รายการ ครอบคลุม:

- **นิยาม**: Testing vs QA vs QC, Verification vs Validation (ตารางเทียบ + ตัวอย่าง), Error / Defect (Bug) / Failure (ความสัมพันธ์: Error → Defect → Failure)
- **7 Testing Principles ของ ISTQB** (ครบทั้ง 7 ข้อ พร้อมคำอธิบายบรรทัดเดียว)
- **SDLC vs STLC** และขั้นตอน STLC (Requirement analysis → Test planning → Test case design → Environment setup → Test execution → Test closure)
- **V-Model** (แสดงด้วย inline SVG หรือ HTML/Tailwind: ฝั่ง development จับคู่กับฝั่ง testing)
- **ระดับการทดสอบ (Test Levels)**: Unit, Integration, System, Acceptance (UAT, Alpha, Beta) + ใครทำ/ทดสอบอะไร
- **ประเภทการทดสอบ (Test Types)**: Functional, Non-functional (Performance, Load, Stress, Security, Usability, Compatibility), Regression, Smoke, Sanity, Retesting (Confirmation), Exploratory, Ad-hoc, A/B (เทียบ Smoke vs Sanity และ Regression vs Retesting เป็นตาราง)
- **Static vs Dynamic testing** (Review, Walkthrough, Inspection)
- **Black-box vs White-box vs Grey-box**
- **Test Pyramid** (Unit มาก → Integration → E2E น้อย) พร้อมเหตุผลและแผนภาพ
- **Manual vs Automation**: ข้อดี/ข้อเสีย เมื่อไหร่ควร automate (regression, ทำซ้ำบ่อย) เมื่อไหร่ไม่ควร
- **TDD vs BDD**: วงจร Red-Green-Refactor, Given-When-Then พร้อมตัวอย่าง Gherkin สั้นๆ
- **Defect Life Cycle**: New → Assigned → Open → Fixed → Retest → Verified → Closed (และ Reopened / Rejected / Deferred) แสดงเป็นแผนภาพ
- **Severity vs Priority**: ตารางนิยาม + ตัวอย่าง 4 กรณี (high-high, high-low, low-high, low-low)
- **Quality attributes ISO/IEC 25010** (รายชื่อ 8 characteristics แบบสั้น)
- **Metrics**: Defect density, Defect detection percentage (DDP), Test coverage, Pass rate, พร้อมสูตรและตัวอย่างคำนวณ 1 ข้อ
- **Entry / Exit criteria, Suspension / Resumption criteria**

---

### 5.2 `test-design.html` (REQUIRED)

แต่ละเทคนิคมีโครงเดียวกัน: **นิยาม → ขั้นตอนทำ → ตัวอย่างคำนวณทีละบรรทัด → ตาราง test case ที่ได้ → ข้อควรระวัง**

ใช้ตัวอย่างที่สอดคล้องกัน เช่น "ฟอร์มสมัครสมาชิก: อายุ 18–60 ปีเท่านั้น, รหัสผ่านยาว 8–16 ตัวอักษร"

1. **Equivalence Partitioning (EP)**: แบ่ง valid/invalid class, เลือกตัวแทน 1 ค่าต่อ class
2. **Boundary Value Analysis (BVA)**: แบบ 2-value และ **3-value** (min-1, min, min+1, max-1, max, max+1) แสดงทั้งสองแบบ และอธิบาย **Robust BVA / Worst-case BVA** สั้นๆ
3. **Decision Table Testing**: สร้างตาราง conditions/actions จาก rules จริง 1 ตัวอย่าง (เช่น ส่วนลดตามประเภทสมาชิก + ยอดซื้อ), วิธีลด rule (collapse) และจำนวน rule = 2^n
4. **State Transition Testing**: state diagram + state table (รวมช่อง invalid transition) ตัวอย่าง "ล็อกอินผิด 3 ครั้งแล้วบัญชีถูกล็อก", คำนวณ coverage ระดับ 0-switch
5. **Use Case Testing**: main flow / alternative flow / exception flow → test case
6. **Pairwise / Combinatorial Testing**: อธิบายแนวคิด + ตารางตัวอย่าง (Browser × OS × Language) และบอกว่าลดจำนวนเคสได้อย่างไร
7. **Error Guessing / Exploratory Testing**: แนวคิดสั้นๆ + checklist ค่าที่ควรลอง (ค่าว่าง, ช่องว่าง, ตัวอักษรพิเศษ, ยาวเกิน, SQL injection string พื้นฐาน, emoji, ตัวเลขติดลบ)
8. **Cause-Effect Graph** (สั้นๆ เชื่อมกับ Decision Table)

ท้ายหน้ามี **"ตารางเลือกเทคนิคให้เหมาะกับโจทย์"**: ถ้าโจทย์เป็น … ให้ใช้ …

---

### 5.3 `white-box.html` (REQUIRED)

- **Control Flow Graph (CFG)**: วิธีวาด (node, edge, region) จากโค้ด พร้อมตัวอย่างโค้ดสั้นๆ (if / while / for) → CFG (ใช้ inline SVG)
- **Coverage ทุกชนิด** พร้อมนิยาม ลำดับความเข้มข้น และสูตร:
  - Statement Coverage = (statements ที่ execute / ทั้งหมด) × 100
  - Branch (Decision) Coverage
  - Condition Coverage
  - Decision/Condition Coverage
  - Multiple Condition Coverage (จำนวน = 2^n)
  - MC/DC (อธิบายด้วยตัวอย่าง `A && (B || C)` พร้อมตารางค่าความจริง)
  - Path Coverage
- **Cyclomatic Complexity** — ครบ 3 สูตร:
  - V(G) = E − N + 2P
  - V(G) = จำนวน decision (predicate) nodes + 1
  - V(G) = จำนวน regions
  - ตัวอย่างคำนวณเต็ม 2 ข้อ (ด้วยโค้ดจริง → CFG → V(G) → Independent paths)
  - ตารางตีความค่า (1–10 ง่าย, 11–20 ปานกลาง, 21–50 ซับซ้อน, >50 เสี่ยงมาก)
- **Basis Path Testing**: ขั้นตอนหา independent paths และสร้าง test case ให้ครบ
- **ตัวอย่างโจทย์ฝึก + เฉลยละเอียด** อย่างน้อย 3 ข้อ (เช่น ฟังก์ชันหาเกรด, ฟังก์ชันตรวจ leap year, ฟังก์ชัน login) ที่ให้โค้ด → วาด CFG → หา V(G) → ออกแบบ test case ให้ได้ branch coverage 100%
- **Mutation Testing** (แนวคิดสั้นๆ: mutant, killed/survived, mutation score)

---

### 5.4 `documents.html` (REQUIRED)

Template ที่ copy ได้ (ทั้งแบบตาราง Markdown และแบบ HTML table) พร้อมตัวอย่างที่กรอกแล้ว:

1. **Test Case template**: Test Case ID, Title, Module, Preconditions, Test Steps, Test Data, Expected Result, Actual Result, Status, Priority, Type (positive/negative), Remarks
2. **Bug / Defect Report template**: Bug ID, Title, Environment (OS/Browser/Version), Steps to Reproduce, Expected vs Actual, Severity, Priority, Status, Attachments (screenshot/video/log), Reported by/date, Assigned to + ตัวอย่างที่เขียนดีและตัวอย่างที่เขียนแย่ (เทียบกัน)
3. **Test Plan** (อิง IEEE 829 แบบย่อ): Objective, Scope (in/out), Test approach, Test items, Features to be tested, Entry/Exit criteria, Environment, Schedule, Resources/Roles, Risks & mitigation, Deliverables
4. **Test Summary Report**: จำนวนเคส pass/fail/blocked, defect ตาม severity, coverage, ข้อสรุป/ข้อแนะนำ
5. **Traceability Matrix (RTM)**: Requirement ↔ Test Case ↔ Defect
6. **Risk-based testing**: ตาราง Likelihood × Impact

---

### 5.5 `playwright.html` (REQUIRED, สำคัญที่สุดฝั่งปฏิบัติ)

ก่อนเขียนหน้านี้ ให้ agent **เปิด https://playwright.dev/docs/intro และหน้าที่เกี่ยวข้องเพื่อตรวจคำสั่งและ API ล่าสุด** ถ้าขัดกับ spec ให้ยึด official docs และใส่หมายเหตุเวอร์ชันไว้ในหน้า

ภาษาหลักคือ **TypeScript (`@playwright/test`)** และมีส่วน **Python (`pytest-playwright`)** เป็นทางเลือกเมื่อโจทย์บังคับ (ดู 5.5.12)

แต่ละ step มี: คำอธิบาย 1–2 บรรทัด → code block → ผลลัพธ์ที่ควรเห็น

**5.5.0 Prerequisites**: `node -v` (ต้องเป็นเวอร์ชันที่ docs ระบุ), `npm -v`

**5.5.1 ติดตั้งและเริ่มโปรเจกต์**
- `npm init playwright@latest` (อธิบายตัวเลือกที่ถูกถาม: TypeScript, tests folder, GitHub Actions, install browsers)
- โครงสร้างไฟล์ที่ได้ (`playwright.config.ts`, `tests/`, `tests-examples/`)
- ติดตั้ง browser ภายหลัง: `npx playwright install` (และ `--with-deps` บน Linux)

**5.5.2 Test แรก**
- ตัวอย่างโครง `test('...', async ({ page }) => { ... })` พร้อม `import { test, expect } from '@playwright/test'`
- ตัวอย่างเต็มที่รันได้จริงกับ `https://playwright.dev` (goto → ตรวจ title → คลิกลิงก์ → ตรวจ heading)

**5.5.3 คำสั่ง CLI สำคัญ (ตาราง)**
- `npx playwright test` / ระบุไฟล์ / `-g "ชื่อเทสต์"` / `--project=chromium` / `--headed` / `--debug` / `--ui` / `--workers=1` / `--retries=2` / `--reporter=html` / `--grep @smoke` / `--last-failed`
- `npx playwright show-report`
- `npx playwright codegen <url>` (บันทึก action เป็นโค้ด)
- `npx playwright show-trace trace.zip`

**5.5.4 Locators (เน้นเป็นพิเศษ)**
- ลำดับที่แนะนำ: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` > `getByAltText` > `getByTitle` > `getByTestId` > CSS/XPath (ใช้เป็นทางเลือกสุดท้าย)
- ตารางตัวอย่างโค้ดของแต่ละ locator
- chaining/filter: `locator.filter({ hasText })`, `.first()`, `.nth(n)`, `.last()`, `locator('li').filter(...)`
- strict mode violation คืออะไร และวิธีแก้

**5.5.5 Actions**
- `goto`, `click`, `dblclick`, `fill`, `type`/`pressSequentially`, `press`, `check`/`uncheck`, `selectOption`, `hover`, `dragTo`, `setInputFiles`, `focus`, `scrollIntoViewIfNeeded`
- จัดการ dialog (`page.on('dialog', ...)`), หลายแท็บ/popup (`context.waitForEvent('page')`), iframe (`frameLocator`), file upload/download (`waitForEvent('download')`)

**5.5.6 Assertions (Web-first assertions)**
- ตารางครบ: `toBeVisible`, `toBeHidden`, `toBeEnabled`, `toBeDisabled`, `toBeChecked`, `toHaveText`, `toContainText`, `toHaveValue`, `toHaveAttribute`, `toHaveClass`, `toHaveCount`, `toHaveURL`, `toHaveTitle`, `toHaveScreenshot`
- อธิบาย **auto-waiting และ auto-retrying assertions** เทียบกับ non-retrying (`expect(await x.textContent())`) ว่าทำไมแบบแรกดีกว่า
- `expect.soft`, `expect.poll`, `.not`, การกำหนด timeout เฉพาะ assertion

**5.5.7 Test structure**
- `test.describe`, `test.beforeEach/afterEach/beforeAll/afterAll`, `test.step`, `test.skip/fixme/only`, `test.fail`, tag (`@smoke`), การทดสอบแบบวนลูป (data-driven) ด้วย array + `for...of`
- การใช้ `test.use({...})` เปลี่ยน viewport/locale/geolocation

**5.5.8 Fixtures**: อธิบายแนวคิด และตัวอย่างสร้าง custom fixture 1 ตัว (เช่น `loggedInPage`)

**5.5.9 Page Object Model (POM)**
- โครงสร้างโฟลเดอร์ `pages/LoginPage.ts`, `pages/DashboardPage.ts`
- โค้ดคลาสเต็ม (constructor รับ `Page`, locators เป็น property, methods เป็น actions)
- ตัวอย่างเทสต์ที่ใช้ POM เทียบกับแบบไม่ใช้ POM
- ข้อดี: ลดโค้ดซ้ำ, แก้ที่เดียว, อ่านง่าย

**5.5.10 `playwright.config.ts`**
- ตัวอย่างไฟล์ครบ: `testDir`, `timeout`, `expect.timeout`, `fullyParallel`, `retries`, `workers`, `reporter`, `use` (`baseURL`, `trace`, `screenshot`, `video`, `headless`), `projects` (chromium/firefox/webkit + mobile emulation เช่น `devices['Pixel 5']`), `webServer`
- อธิบายแต่ละ option ด้วยตาราง

**5.5.11 API Testing (สำคัญ)**
- ใช้ `request` fixture: GET/POST/PUT/DELETE, ตรวจ status (`response.ok()`, `response.status()`), `await response.json()`, ตรวจ body ด้วย `expect`
- ตัวอย่างเต็มทดสอบ CRUD กับ public API ที่ใช้ทดสอบได้ (เช่น `https://jsonplaceholder.typicode.com` หรือ `https://reqres.in` ตรวจความพร้อมใช้งานก่อนเลือก)
- ส่ง headers/token, `baseURL`, `data` / `form` / `multipart`
- ผสม API + UI (เตรียมข้อมูลด้วย API แล้วตรวจผลใน UI)

**5.5.12 ทางเลือก Python**: ติดตั้ง `pip install pytest-playwright` + `playwright install`, ตัวอย่าง test แรก (`def test_x(page: Page)`), `expect(page).to_have_title(...)`, รันด้วย `pytest --headed`, ตารางเทียบ syntax TS ↔ Python ของ action/assertion ที่ใช้บ่อย

**5.5.13 Debugging & Reporting**
- `--debug`, Playwright Inspector, `await page.pause()`, UI Mode (`--ui`)
- **Trace Viewer**: ตั้ง `trace: 'on-first-retry'` / `'retain-on-failure'`, เปิดดู timeline/DOM snapshot/network
- screenshot (`page.screenshot({ path, fullPage: true })`), video, HTML report, ตัวเลือก reporter (list, dot, line, html, json, junit)
- Visual comparison: `toHaveScreenshot()` + `--update-snapshots`

**5.5.14 Network & Mocking**
- `page.route()` ปิด/ดัก/mock response (`route.fulfill`, `route.abort`, `route.continue`)
- `page.waitForResponse`, `page.waitForRequest`
- ตัวอย่างจำลอง API ล่ม (500) แล้วตรวจว่า UI แสดง error

**5.5.15 Authentication & Storage State**
- `global-setup` หรือ setup project: login ครั้งเดียว บันทึก `storageState` แล้วนำมาใช้ซ้ำ (`use: { storageState: 'playwright/.auth/user.json' }`)

**5.5.16 Parallelism, Retries, Projects**: อธิบาย worker, `fullyParallel`, test isolation (แต่ละ test ได้ browser context ใหม่), `test.describe.configure({ mode: 'serial' })` และเมื่อไหร่ควรใช้

**5.5.17 CI/CD**: ตัวอย่าง `.github/workflows/playwright.yml` ครบ (checkout, setup-node, `npm ci`, `npx playwright install --with-deps`, `npx playwright test`, upload artifact ของ `playwright-report`)

**5.5.18 Best Practices (กล่อง Key Points)**: ทดสอบแบบที่ผู้ใช้เห็น, test ต้อง isolated, ใช้ locator ที่ทนทาน, ไม่ใช้ `waitForTimeout`/sleep, ใช้ web-first assertions, mock third-party, ใช้ trace เมื่อ CI พัง

**ท้ายหน้า:** ตาราง **เปรียบเทียบ Playwright vs Selenium vs Cypress** (auto-wait, ภาษา, browser รองรับ, ความเร็ว, multi-tab, API testing, ความยากในการตั้งค่า) อย่างเป็นกลาง

---

### 5.6 `playwright-recipes.html` (REQUIRED)

สูตรสำเร็จตามสถานการณ์ แต่ละสูตรเป็น "โจทย์ → โค้ดเต็ม copy ได้" อย่างน้อยหัวข้อต่อไปนี้ (ให้ใช้เว็บทดสอบสาธารณะที่เสถียร เช่น `https://demo.playwright.dev/todomvc`, `https://www.saucedemo.com`, `https://the-internet.herokuapp.com` ตรวจว่าเว็บยังเปิดอยู่ก่อนใส่ลงไปเสมอ):

1. ทดสอบ **Login** (สำเร็จ / รหัสผ่านผิด / ช่องว่าง) แบบ data-driven
2. ทดสอบ **TodoMVC**: เพิ่ม / ทำเครื่องหมายเสร็จ / แก้ไข / ลบ / filter
3. ทดสอบ **Form validation** (ช่องว่าง, อีเมลผิดรูปแบบ, ขอบเขต BVA ของตัวเลข) — เชื่อมกับเทคนิคใน `test-design.html`
4. ทดสอบ **ตาราง** (นับแถว, ดึงค่าของคอลัมน์, sort)
5. **Shopping cart flow** (เพิ่มสินค้า → ตรวจจำนวนใน badge → checkout) บน saucedemo
6. **Dropdown / Checkbox / Radio / Date picker**
7. **File upload / download**
8. **Alert / confirm / prompt dialog**
9. **หลายแท็บ / popup / iframe**
10. **Hover / drag & drop / keyboard shortcut**
11. **API test CRUD** (ครบ 4 method) และตัวอย่าง **API + UI รวมกัน**
12. **Mock API response** และจำลอง error 500
13. **Visual regression** ด้วย `toHaveScreenshot`
14. **Responsive test** (เปลี่ยน viewport / mobile emulation)
15. **Accessibility check เบื้องต้น** (ใช้ `getByRole` เป็นตัวตรวจ และกล่าวถึง `@axe-core/playwright` เป็นทางเลือก)
16. **Wait strategies**: เมื่อไหร่ใช้ `waitForSelector`, `waitForURL`, `waitForResponse`, `waitForLoadState` (เทียบกับ auto-wait)

ท้ายหน้า: **"ปรับสูตรให้เข้ากับโจทย์สอบ"** บอกจุดที่ต้องเปลี่ยน (URL, locator, ข้อมูลทดสอบ, expected result)

---

### 5.7 `tools.html` + `assets/tools.js` (REQUIRED)

เครื่องมือเล็กๆ ทำงานฝั่ง client ล้วน ช่วยประหยัดเวลาตอนสอบ:

1. **BVA Generator**: กรอก min, max → ได้ค่าทดสอบแบบ 2-value, 3-value, robust (แสดงเป็นตารางพร้อมปุ่ม copy)
2. **EP Helper**: กรอกช่วง valid (min–max) → แสดง class: invalid ต่ำกว่า / valid / invalid สูงกว่า พร้อมตัวแทนแนะนำ
3. **Decision Table Generator**: กรอกจำนวน condition (1–5) และชื่อ → สร้างตารางครบทุก rule (2^n) แล้วเว้นช่อง action ให้กรอกเอง
4. **Cyclomatic Complexity Calculator**: กรอก E, N, P → ได้ V(G); และอีกโหมดกรอกจำนวน decision nodes → ได้ V(G) = d + 1
5. **Coverage Calculator**: กรอกจำนวน executed / total → ได้ % (statement/branch/condition เลือก label ได้)
6. **Test Case Template Generator**: กรอก ID/Title/Steps/Expected → สร้างแถว Markdown table พร้อมปุ่ม copy
7. **Bug Report Generator**: กรอกช่อง → สร้างข้อความ bug report พร้อม copy
8. **Playwright Test Skeleton Generator**: กรอก URL, ชื่อเทสต์, เลือก action พื้นฐาน → สร้างโค้ด `.spec.ts` โครงเริ่มต้นพร้อม copy

ทุกเครื่องมือต้องตรวจ input (ตัวเลขถูกต้อง, min < max) และแสดงข้อความผิดพลาดที่เข้าใจง่าย

---

### 5.8 `troubleshooting.html` (REQUIRED)

รูปแบบ **อาการ → สาเหตุ → วิธีแก้** อย่างน้อย 15 รายการ:
- `Executable doesn't exist ... playwright install`
- `Timeout 30000ms exceeded` (locator ผิด / element ไม่โผล่ / โหลดช้า) และวิธี debug
- `strict mode violation: locator resolved to N elements`
- `Error: expect(received).toBeVisible() failed`
- `page.goto: net::ERR_CONNECTION_REFUSED` (server ยังไม่รัน / `webServer` config)
- `Test timeout of 30000ms exceeded` vs `expect timeout` (ต่างกันอย่างไร)
- Test ผ่านในเครื่องแต่ตกบน CI (flaky: เวลา, ข้อมูลร่วม, viewport)
- Flaky test: สาเหตุที่พบบ่อยและวิธีแก้ (ไม่ใช้ sleep, ใช้ web-first assertion, แยก data)
- element ถูกบัง / `element is not stable` / `intercepts pointer events`
- iframe หา element ไม่เจอ (ต้องใช้ `frameLocator`)
- `Cannot find module '@playwright/test'` (ยังไม่ `npm install`)
- `TypeError: ... is not a function` จาก `await` หายไป
- login state ไม่คงอยู่ (ลืม storageState)
- `toHaveScreenshot` ไม่ตรงบนเครื่องอื่น (OS/ฟอนต์ต่างกัน → ต้อง update snapshot)
- Port ถูกใช้ / browser ไม่เปิดบน Linux (`--with-deps`)
- ใช้ `npx playwright test` แล้วไม่พบเทสต์ (ชื่อไฟล์ต้องลงท้าย `.spec.ts` หรืออยู่ใน `testDir`)
- API test ได้ 403/401 (header/token/UA)

---

### 5.9 `checklist.html` (REQUIRED)

Checklist ติ๊กได้ **บันทึกใน `localStorage`** แบ่งกลุ่ม:
- **ก่อนเริ่มสอบ**: อ่านโจทย์ครบ, ระบุ system under test, ตรวจ Node/npm/browsers ติดตั้งแล้ว
- **ข้อเขียน / ออกแบบ Test Case**: ระบุ requirement → เลือกเทคนิค → ทำ EP → ทำ BVA → ใส่ทั้ง positive/negative → กรอก Expected Result ให้ชัด → ตรวจ coverage ของ requirement
- **ข้อ white-box**: วาด CFG → นับ node/edge/predicate → คำนวณ V(G) ด้วยอย่างน้อย 2 สูตรเพื่อตรวจสอบ → หา independent paths → ออกแบบ test case
- **Playwright**: init project → config baseURL → เขียน test ทีละเคส → รัน → ตรวจ report → เก็บ trace/screenshot ถ้าจำเป็น
- **ก่อนส่ง**: รัน `npx playwright test` ทั้งชุดอีกรอบ, ลบ `test.only`, ตรวจชื่อไฟล์/โฟลเดอร์ตามที่โจทย์กำหนด, แนบ report/screenshot ถ้าถูกขอ
- ปุ่ม **Reset checklist**
- **เคล็ดลับบริหารเวลา** 5–6 ข้อ

---

### 5.10 `links.html` (REQUIRED)

ลิงก์ official จัดกลุ่ม พร้อมคำอธิบาย 1 บรรทัด (ตรวจว่า URL ถูกต้อง ห้ามแต่งเอง):
- Playwright: https://playwright.dev/docs/intro (Locators, Assertions, API testing, Test configuration, Trace viewer, Page object models, CI, Python)
- ISTQB: https://www.istqb.org (Glossary, Syllabus)
- MDN: https://developer.mozilla.org (HTML/ARIA roles สำหรับเข้าใจ `getByRole`)
- Selenium: https://www.selenium.dev/documentation/
- Cypress: https://docs.cypress.io
- เว็บฝึกทดสอบ: https://demo.playwright.dev/todomvc, https://www.saucedemo.com, https://the-internet.herokuapp.com, https://jsonplaceholder.typicode.com

ทุกลิงก์เปิดแท็บใหม่ (`target="_blank" rel="noopener noreferrer"`)

---

### 5.11 `index.html`

- Hero สั้นๆ + คำอธิบาย 1 ประโยค
- **แผนผังภาพรวมวิชา**: Fundamentals → Test Design (Black-box) → White-box → Documents → Playwright (แสดงเป็นการ์ดเชื่อมลิงก์)
- **Quick Start Playwright 5 นาที**: คำสั่งเรียงลำดับตั้งแต่ติดตั้งถึงเปิด report
- **ตารางสรุปสูตร/สิ่งที่ต้องจำ** (V(G) 3 สูตร, coverage, 2^n, BVA 2/3-value, severity vs priority)
- การ์ดลิงก์ไปทุกหน้า

---

### 5.12 `glossary.html` (OPTIONAL)

ศัพท์ไทย–อังกฤษพร้อมคำอธิบายสั้น อย่างน้อย 40 คำ เรียงตามตัวอักษร พร้อมช่อง search

---

## 6. `assets/app.js` Requirements

ฟังก์ชันที่ต้องมี (vanilla JS):
- `initTheme()`, `initCopyButtons()` (ใช้ `navigator.clipboard.writeText` พร้อม fallback `document.execCommand('copy')` เผื่อเปิดผ่าน `file://`), `initSearch()`, `initSidebar()` (IntersectionObserver), `initChecklist()`
- เรียกทุกฟังก์ชันใน `DOMContentLoaded` และห่อ `try/catch` แยกกัน

`assets/tools.js`: แยกฟังก์ชันคำนวณเป็น pure functions (เช่น `generateBVA(min,max)`, `cyclomaticFromEdges(E,N,P)`) เพื่อให้ตรวจผลได้ง่าย พร้อมคอมเมนต์ตัวอย่าง input/output

---

## 7. Constraints / Rules สำหรับ Agent

1. **ความถูกต้องสำคัญกว่าความสวย** โค้ดตัวอย่าง Playwright ทุกอันต้องรันได้จริง (import ครบ, `async/await` ครบ) ห้ามใช้ `...` แทนโค้ดที่จำเป็น
2. ก่อนเขียนคำสั่ง/API ของ Playwright ให้ **ตรวจกับ https://playwright.dev/docs** (ใช้ web fetch/search ถ้ามี) อย่าเดาจากความจำ
3. **ตัวอย่างคำนวณทฤษฎีต้องถูกต้อง** (BVA, decision table, V(G), coverage) ให้คำนวณซ้ำด้วยสองวิธีเมื่อทำได้ (เช่น V(G) จาก E−N+2 และจาก decision+1 ต้องได้ค่าเท่ากัน) และห้ามแต่งตัวเลขโดยไม่ตรวจ
4. ห้ามคัดลอกเนื้อหา documentation ยาวๆ ให้สรุปด้วยตัวเอง + ลิงก์ต้นทาง
5. ห้ามใช้ external resource นอกจาก `cdn.tailwindcss.com`, `cdnjs.cloudflare.com`, `fonts.googleapis.com` / `fonts.gstatic.com` (ลิงก์ `<a>` ไปเว็บอื่นได้)
6. `localStorage` ใช้เฉพาะ theme และ checklist
7. HTML semantic (`header`, `nav`, `main`, `section`, `footer`) มี `<meta charset>` และ `viewport` ทุกไฟล์
8. ใช้ **relative path** เท่านั้น
9. เว็บที่ใช้เป็นตัวอย่างทดสอบ (saucedemo ฯลฯ) ให้ตรวจก่อนว่ายังเปิดอยู่ และ locator/ข้อความตรงกับหน้าจริง ถ้าตรวจไม่ได้ให้ระบุหมายเหตุว่า "ต้องปรับ locator ตามหน้าเว็บจริง"
10. ถ้าเวลา/ขนาดจำกัด ให้ทำตามลำดับ: `playwright.html` → `test-design.html` → `white-box.html` → `playwright-recipes.html` → `documents.html` → `fundamentals.html` → `tools.html` → `troubleshooting.html` → `checklist.html` → `index.html` → `links.html` → `glossary.html`

---

## 8. Build Order

1. สร้างโครงโฟลเดอร์และไฟล์ตาม Section 3
2. เขียน `assets/app.js`, `assets/tools.js`, `assets/style.css`
3. เขียน `playwright.html` (ใช้เป็นต้นแบบ layout: navbar, sidebar, code-block)
4. เขียน `test-design.html`, `white-box.html`
5. เขียน `playwright-recipes.html`
6. เขียน `documents.html`, `fundamentals.html`
7. เขียน `tools.html`
8. เขียน `troubleshooting.html`, `checklist.html`
9. เขียน `links.html`, `index.html`, (optional) `glossary.html`
10. เขียน `README.md` (วิธีเปิด: ดับเบิลคลิก `index.html` หรือ `python -m http.server 5500`)
11. รัน self-check ตาม Section 9

---

## 9. Acceptance Criteria

- [ ] เปิด `index.html` แล้วลิงก์ไปทุกหน้าได้ ไม่มี 404 ภายใน
- [ ] ทุกหน้ามี navbar, search, dark mode toggle ที่ทำงานได้
- [ ] ปุ่ม Copy ทำงานทุก code block (ทดสอบทั้ง `file://` และ `http://`)
- [ ] `playwright.html` มีหัวข้อ 5.5.1–5.5.18 ครบ และคำสั่งตรงกับ docs ล่าสุด
- [ ] ตัวอย่าง Playwright ทุกอันมี import และ async/await ครบ ไม่มี syntax error
- [ ] `test-design.html` มีเทคนิคครบ 8 ข้อ พร้อมตัวอย่างคำนวณที่ตรวจแล้วถูกต้อง
- [ ] `white-box.html` มี coverage ครบทุกชนิด, สูตร V(G) ครบ 3 สูตร และโจทย์ฝึกพร้อมเฉลย ≥ 3 ข้อ ที่ V(G) ทุกสูตรให้ค่าตรงกัน
- [ ] `tools.html` ครบ 8 เครื่องมือ ทำงานถูกต้องและมี input validation (ทดสอบ BVA ด้วย min=18, max=60 ต้องได้ 17, 18, 19, 59, 60, 61)
- [ ] `troubleshooting.html` มี ≥ 15 รายการ
- [ ] Checklist จำสถานะหลัง refresh และ reset ได้
- [ ] ใช้งานได้บนมือถือ ไม่มี horizontal scroll ของทั้งหน้า
- [ ] ไม่มี error สีแดงใน browser console
- [ ] ลิงก์ภายนอกทั้งหมดเป็น URL จริง

เมื่อเสร็จให้สรุปสั้นๆ ว่าทำหน้าไหนเสร็จ หน้าไหนข้าม และสมมติฐานเรื่องเวอร์ชัน Playwright/Node ที่ใช้

// assets/tools.js - Utility functions for white-box testing
// Pure functions for calculations (BVA, coverage, etc.)
// Exported on window.QA for the tools page

(function () {
  'use strict';

  function generateBVA(min, max) {
    // Boundary Value Analysis - 2-value & 3-value style set
    if (typeof min !== 'number' || typeof max !== 'number' || isNaN(min) || isNaN(max)) {
      return { error: 'กรุณากรอกตัวเลขให้ถูกต้อง' };
    }
    if (min > max) {
      return { error: 'ค่า min ต้องไม่มากกว่า max' };
    }
    var values = [min - 1, min, min + 1, max - 1, max, max + 1];
    // Robust BVA: add extremes far from boundary
    var robust = [min - 2, min, min + 1, max - 1, max, max + 1, max + 2];
    return { values: values, robust: robust };
  }

  function generateEP(validMin, validMax) {
    // Equivalence Partitioning: invalid-low, valid, invalid-high
    if (typeof validMin !== 'number' || typeof validMax !== 'number') {
      return { error: 'กรุณากรอกช่วงค่าที่ถูกต้อง (min - max)' };
    }
    if (validMin > validMax) {
      return { error: 'min ต้องไม่มากกว่า max' };
    }
    var classes = [
      { name: 'Invalid (ต่ำกว่า min)', value: validMin - 1, valid: false },
      { name: 'Valid', value: validMin, valid: true },
      { name: 'Invalid (มากกว่า max)', value: validMax + 1, valid: false }
    ];
    return { classes: classes };
  }

  function generateDecisionTable(numConditions) {
    // Decision table: 2^n rules
    var rules = [];
    var n = Math.max(1, Math.min(5, numConditions || 2));
    var conditionNames = [];
    for (var i = 0; i < n; i++) {
      conditionNames.push('C' + (i + 1));
    }
    for (var r = 0; r < Math.pow(2, n); r++) {
      var row = { rule: 'R' + (r + 1), conditions: {}, action: '' };
      var bits = r;
      for (var c = 0; c < n; c++) {
        row.conditions[conditionNames[c]] = ((bits >> (n - 1 - c)) & 1) === 1;
      }
      rules.push(row);
    }
    return { conditions: conditionNames, rules: rules, count: rules.length };
  }

  function cyclomaticFromEdges(edges, nodes, projects) {
    if (typeof edges !== 'number' || typeof nodes !== 'number') {
      return { error: 'กรุณากรอกจำนวนจำลอง (E, N) ให้เป็นตัวเลข' };
    }
    var p = projects === undefined ? 1 : projects;
    return { vG: edges - nodes + 2 * p };
  }

  function cyclomaticFromDecisions(decisionNodes) {
    var d = Array.isArray(decisionNodes) ? decisionNodes.length : decisionNodes;
    if (typeof d !== 'number' || d < 0 || isNaN(d)) {
      return { error: 'กรุณากรอกจำนวน decision nodes' };
    }
    if (d === 0) {
      return { vG: 1 };
    }
    return { vG: d + 1 };
  }

  function calculateBranchCoverage(executed, total) {
    if (!total) {
      return { error: 'total statements ต้องไม่เป็น 0' };
    }
    return { percent: Math.round((executed / total) * 100) };
  }

  function calculateConditionCoverage(conditions, coveredConditions) {
    if (!conditions) {
      return { error: 'กรุณากรอกจำนวน conditions' };
    }
    if (!coveredConditions) {
      return { error: 'กรุณากรอกจำนวน conditions ที่ covered' };
    }
    if (coveredConditions > conditions) {
      return { error: 'covered มากกว่าจะทั้งหมด ไม่ถูกต้อง' };
    }
    return { percent: Math.round((coveredConditions / conditions) * 100) };
  }

  function calculateMutationScore(killedMutants, totalMutants) {
    if (!totalMutants) {
      return { error: 'จำนวน mutants ต้องไม่เป็น 0' };
    }
    if (killedMutants > totalMutants) {
      return { error: 'killed มากกว่าจะรวม ไม่ถูกต้อง' };
    }
    return { percent: Math.round((killedMutants / totalMutants) * 100) };
  }

  function generateTestCaseRow(testCase) {
    // Returns markdown table row string for test case template
    var tc = testCase || {};
    var id = tc.id || 'TC-001';
    var title = tc.title || '';
    var module = tc.module || '';
    var preconditions = tc.preconditions || '-';
    var steps = tc.steps || '-';
    var data = tc.data || '-';
    var expected = tc.expected || '-';
    var actual = '-';
    var status = 'Pending';
    var priority = tc.priority || 'Medium';
    var type = tc.type || 'Positive';
    var remarks = tc.remarks || '-';
    return '| ' + [id, title, module, preconditions, steps, data, expected, actual, status, priority, type, remarks].map(function (v) {
      return String(v).replace(/\|/g, '\\|');
    }).join(' | ') + ' |';
  }

  function generateBugReport(bug) {
    var b = bug || {};
    return [
      'Bug ID: ' + (b.id || '-'),
      'Title: ' + (b.title || '-'),
      'Environment: ' + (b.environment || '-'),
      'Steps to Reproduce: ' + (b.steps || '-'),
      'Expected: ' + (b.expected || '-'),
      'Actual: ' + (b.actual || '-'),
      'Severity: ' + (b.severity || '-'),
      'Priority: ' + (b.priority || '-'),
      'Status: ' + (b.status || '-'),
      'Reported by: ' + (b.reportedBy || '-') + ' / ' + (b.date || '-'),
      'Assigned to: ' + (b.assignedTo || '-'),
      'Attachments: ' + (b.attachments || '-')
    ].join('\n');
  }

  function generatePlaywrightSkeleton(url, testName, action) {
    var actionCode = action || 'goto';
    return [
      "import { test, expect } from '@playwright/test';",
      '',
      'test(' + JSON.stringify(testName || 'my test') + ', async ({ page }) => {',
      "  await page.goto(" + JSON.stringify(url || 'https://example.com') + ");",
      '  // ' + action + ' action here',
      '  await expect(page).toHaveTitle(/.*expected.*/);',
      '});'
    ].join('\n');
  }

  window.QA = {
    generateBVA: generateBVA,
    generateEP: generateEP,
    generateDecisionTable: generateDecisionTable,
    cyclomaticFromEdges: cyclomaticFromEdges,
    cyclomaticFromDecisions: cyclomaticFromDecisions,
    calculateBranchCoverage: calculateBranchCoverage,
    calculateConditionCoverage: calculateConditionCoverage,
    calculateMutationScore: calculateMutationScore,
    generateTestCaseRow: generateTestCaseRow,
    generateBugReport: generateBugReport,
    generatePlaywrightSkeleton: generatePlaywrightSkeleton
  };
})();

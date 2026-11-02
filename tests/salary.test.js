import assert from 'node:assert/strict';
import {test} from 'node:test';
import {formatSalary} from '../src/services/jobs.js';
test('salary labels preserve existing units and handle missing packages',()=>{assert.equal(formatSalary('8 LPA'),'8 LPA');assert.equal(formatSalary(8),'8 LPA');assert.equal(formatSalary(''),'Not specified');assert.equal(formatSalary('50000 per month'),'50000 per month');});

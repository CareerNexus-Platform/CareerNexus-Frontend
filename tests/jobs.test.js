import test from 'node:test';
import assert from 'node:assert/strict';
import { isPastDeadline } from '../src/services/jobs.js';
test('date-only deadlines remain open for their entire local calendar day',()=>{const now=new Date(2026,9,22,23,59);assert.equal(isPastDeadline('2026-10-22',now),false);assert.equal(isPastDeadline('2026-10-21',now),true);assert.equal(isPastDeadline('2026-10-23',now),false);});
test('missing or invalid deadlines do not incorrectly close an opportunity',()=>{assert.equal(isPastDeadline(null),false);assert.equal(isPastDeadline('invalid'),false);});

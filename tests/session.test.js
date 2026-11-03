import test from 'node:test';
import assert from 'node:assert/strict';
import { getSession, safeReturnPath, workspaceHome } from '../src/services/session.js';
const now = 1800000000000;
function storage(claims, overrides={}) { const token=['e30',Buffer.from(JSON.stringify(claims)).toString('base64url'),'signature'].join('.'); const values={token,userId:'alice',role:'student',...overrides}; return { getItem:key=>values[key]??null }; }
const claims={sub:'alice',role:'student',exp:now/1000+3600};
test('valid sessions use the token identity and expiration',()=>{assert.equal(getSession(storage(claims),now).userId,'alice');});
test('expired, malformed and mismatched sessions are rejected',()=>{assert.equal(getSession(storage({...claims,exp:now/1000-1}),now),null);assert.equal(getSession(storage(claims,{token:'invalid'}),now),null);assert.equal(getSession(storage(claims,{userId:'bob'}),now),null);assert.equal(getSession(storage(claims,{role:'admin'}),now),null);});
test('return navigation stays within the authenticated workspace',()=>{const session={role:'student',userId:'alice'};assert.equal(safeReturnPath('/student/alice/apply-jobs?jobId=3',session),'/student/alice/apply-jobs?jobId=3');for(const path of ['//evil.test','https://evil.test','/admin','/student/bob/home','/student/alice/../bob/home','/student/alice/%2e%2e/bob/home'])assert.equal(safeReturnPath(path,session),null);assert.equal(safeReturnPath('/student/resources',session),'/student/resources');});
test('administrators and other roles resolve to their own home',()=>{assert.equal(workspaceHome({role:'admin',userId:'root'}),'/admin');assert.equal(workspaceHome({role:'tpo',userId:'placement'}),'/tpo/placement/home');assert.equal(safeReturnPath('/admin/create-user',{role:'admin'}),'/admin/create-user');});


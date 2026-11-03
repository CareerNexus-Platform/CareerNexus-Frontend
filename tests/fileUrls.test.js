import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveFileUrl } from '../src/services/fileUrls.js';
test('cloud resume URLs are preserved rather than prefixed with the backend',()=>{assert.equal(resolveFileUrl('https://storage.example.com/resume.pdf','http://localhost:8080'),'https://storage.example.com/resume.pdf');});
test('legacy relative resume paths resolve once against the API origin',()=>{assert.equal(resolveFileUrl('/cv.pdf','http://localhost:8080'),'http://localhost:8080/uploads/resumes/cv.pdf');assert.equal(resolveFileUrl('/uploads/resumes/cv.pdf','http://localhost:8080'),'http://localhost:8080/uploads/resumes/cv.pdf');});
test('empty and executable URLs are never offered as downloads',()=>{assert.equal(resolveFileUrl(null,'http://localhost:8080'),null);assert.equal(resolveFileUrl('javascript:alert(1)','http://localhost:8080'),null);});

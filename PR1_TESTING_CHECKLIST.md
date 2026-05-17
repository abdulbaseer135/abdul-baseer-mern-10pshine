# PR 1: Testing & Verification Checklist

## Pre-Deployment Testing

### Backend Setup
- [ ] Install dependencies: `cd backend && npm install uuid`
- [ ] No TypeScript/compilation errors
- [ ] All tests pass (if applicable)

### Database Indexes
- [ ] Verify indexes created on collection:
  ```bash
  db.notes.getIndexes()
  # Should show: userId+createdAt, noteId, shareToken
  ```

### Model Tests
- [ ] Note model creates with valid `noteId`
- [ ] Note model generates UUID if `noteId` not provided
- [ ] User model pre-delete middleware registered
- [ ] Note can't have duplicate `noteId` (unique constraint)

---

## Core Feature Testing

### ✅ Bug Fix: Delete Wrong Note
**Test 1: Create duplicate title notes**
```bash
1. Create Note A: title="My Meeting", userId=User1, _id=111, noteId=uuid-a
2. Create Note B: title="My Meeting", userId=User1, _id=222, noteId=uuid-b
3. DELETE /api/v1/notes/111
4. Verify: Only Note A deleted, Note B still exists ✅
```

**Test 2: Ownership filter**
```bash
1. User1 creates Note A
2. User2 tries: DELETE /api/v1/notes/{noteA_id}
3. Verify: 404 "Note not found" ✅
```

### ✅ Cascade Delete
**Test 3: Delete user → notes deleted**
```bash
1. Create User A with notes N1, N2, N3
2. DELETE /api/v1/users/me (as User A)
3. Verify in DB:
   - User A deleted ✅
   - Notes N1, N2, N3 deleted ✅
4. Check logs: "Deleted 3 notes for user {id}" ✅
```

### ✅ Note Identity (noteId)
**Test 4: New notes get noteId**
```bash
1. Create Note via API
2. Verify response includes noteId field ✅
3. Verify noteId is UUID format ✅
4. Create another note → different noteId ✅
```

### ✅ Export Includes noteId
**Test 5: Export includes portable IDs**
```bash
1. Create Note A with noteId=uuid-a
2. GET /api/v1/notes/export
3. Verify JSON includes:
   - _id ✅
   - noteId ✅
   - title, content, timestamps ✅
4. Save file as notes.json
```

### ✅ Import Duplicate Detection
**Test 6: Import same file twice**
```bash
First Import:
1. POST /api/v1/notes/import with notes.json
2. Verify: Response has importedCount=3, skippedCount=0 ✅

Second Import (same file):
3. POST /api/v1/notes/import with same notes.json
4. Verify response:
   - importedCount=0 ✅
   - skippedCount=3 ✅
   - skipped array shows each duplicate with reason ✅
```

### ✅ Import Preserves Identity
**Test 7: Imported notes keep noteId**
```bash
1. Export notes.json with noteId values
2. DELETE all notes
3. POST /api/v1/notes/import with notes.json
4. Verify:
   - Notes created with same noteId ✅
   - Counts show 3 imported ✅
5. Export again → same noteIds preserved ✅
```

### ✅ Import Security (Force userId)
**Test 8: Can't import as other user**
```javascript
// Craft malicious import
const maliciousImport = {
  notes: [{
    title: "Hacked",
    content: "...",
    userId: "other_user_id"  // Try to assign to someone else
  }]
};

1. POST /api/v1/notes/import with maliciousImport
2. Verify: Note created with current user's ID ✅
   - userId = req.user._id (NOT req.body.userId)
```

### ✅ Import Validation
**Test 9: Invalid import rejected**
```bash
# Empty array
POST /api/v1/notes/import { "notes": [] }
→ 400 "Invalid import file — notes array required" ✅

# Missing title
POST /api/v1/notes/import { "notes": [{ content: "test" }] }
→ Skipped with reason "Missing title" ✅

# Invalid JSON
POST /api/v1/notes/import with corrupted file
→ 400 "Invalid JSON file" ✅
```

---

## Ownership & Security Testing

### ✅ Note Access Control
**Test 10: User isolation**
```bash
User A:
1. Create 3 notes
2. GET /api/v1/notes → returns 3 notes ✅

User B:
3. GET /api/v1/notes → returns 0 notes (different user) ✅
4. GET /api/v1/notes/{noteA_id} → 404 ✅
5. PUT /api/v1/notes/{noteA_id} → 403 ✅
6. DELETE /api/v1/notes/{noteA_id} → 403 ✅
```

### ✅ Note Update Ownership
**Test 11: Can't update other user's note**
```bash
User A note: _id=111
User B:
1. PUT /api/v1/notes/111 { title: "Hacked" }
2. Verify: 403 "Not authorized" ✅
3. Verify in DB: Note title unchanged ✅
```

### ✅ Shared Notes Still Work
**Test 12: Public sharing unaffected**
```bash
1. Create note (User A)
2. PATCH /api/v1/notes/{id}/share (turn ON)
3. Verify: isPublic=true, shareToken generated ✅
4. GET /api/v1/notes/shared/{token} (public)
5. Verify: Note returned without auth ✅
6. PATCH /api/v1/notes/{id}/share (turn OFF)
7. Verify: isPublic=false, shareToken cleared ✅
8. GET /api/v1/notes/shared/{token}
9. Verify: 404 "Note not found" ✅
```

---

## Frontend Testing

### ✅ React Keys
**Test 13: React renders notes correctly**
```javascript
1. In DevTools, check NoteCard components
2. Verify: key={note._id} used ✅
3. Create note → appears in list
4. Delete note → removed from list without errors ✅
5. Edit note → updates in place without full refresh ✅
```

### ✅ Delete Operation
**Test 14: Frontend delete uses _id**
```bash
1. List 2 notes with same title
2. Delete first one
3. Verify:
   - Correct note deleted ✅
   - Second note still there ✅
   - No re-rendering errors ✅
```

### ✅ Import UI
**Test 15: Frontend import shows results**
```bash
1. Create notes_backup.json with 5 notes
2. Import notes_backup.json
3. Verify: Toast shows "5 note(s) imported successfully!" ✅
4. Import same file again
5. Verify: Toast shows "5 duplicate(s) skipped" ✅
6. Verify: List updated correctly ✅
```

### ✅ Export UI
**Test 16: Frontend export downloads file**
```bash
1. Create 3 notes
2. Click Export button
3. Verify:
   - File downloaded: notes_YYYY-MM-DD.json ✅
   - File contains all 3 notes ✅
   - File includes noteId field ✅
4. Open JSON → valid format ✅
```

---

## Migration Testing

### ✅ Backfill Migration
**Test 17: Migration script works**
```bash
# Before running migration:
1. Manually insert note without noteId:
   db.notes.insertOne({ title: "Old Note", userId: ObjectId(...), noteId: null })

# Run migration:
2. node src/migrations/backfillNoteId.js
3. Verify output:
   - "Found 1 notes without noteId" ✅
   - "Updated: 1, Errors: 0" ✅

# Verify in DB:
4. db.notes.findOne({ title: "Old Note" })
5. Verify: noteId field has UUID value ✅

# Run again:
6. node src/migrations/backfillNoteId.js
7. Verify: "Migration already complete" ✅
```

### ✅ Migration Safety
**Test 18: Migration doesn't affect existing data**
```bash
# Before migration:
1. db.notes.countDocuments() → returns X

# After migration:
2. db.notes.countDocuments() → returns X ✅
3. No data loss ✅
4. All fields preserved ✅
```

---

## Performance Testing

### ✅ Index Performance
**Test 19: List notes is faster**
```bash
# Create 1000 notes for User A
1. for i in {1..1000}; do POST /api/v1/notes with data; done

# Test query performance:
2. GET /api/v1/notes (page 1)
   - Should return in <100ms ✅
   - Uses index on { userId, createdAt } ✅

3. Use MongoDB explain:
   db.notes.find({ userId: ObjectId(...) }).explain("executionStats")
   → Should show "COLLSCAN" NOT used ✅
   → Should use IXSCAN on compound index ✅
```

### ✅ Import Performance
**Test 20: Import 100 notes in reasonable time**
```bash
1. Create import file with 100 notes
2. POST /api/v1/notes/import
3. Verify:
   - Response < 5 seconds ✅
   - All 100 imported ✅
   - DB query log shows index usage ✅

4. Import same file again
5. Verify:
   - Response < 5 seconds ✅
   - 100 skipped ✅
   - Duplicate check used index ✅
```

---

## Data Integrity Testing

### ✅ No Duplicate noteIds
**Test 21: noteId uniqueness enforced**
```bash
1. Create note N1, get noteId=uuid-123
2. Manually try to create note with same noteId:
   db.notes.insertOne({ title: "...", noteId: "uuid-123" })
3. Verify: Error "duplicate key error" ✅
4. DB prevents duplicate ✅
```

### ✅ All Notes Have noteId
**Test 22: Every note has noteId**
```bash
1. db.notes.find({ noteId: null }).count()
2. After migration: should return 0 ✅
```

### ✅ Referential Integrity
**Test 23: All notes have userId**
```bash
1. db.notes.find({ userId: null }).count()
2. Should return 0 (required field) ✅
```

---

## Error Handling Testing

### ✅ Invalid Note IDs
**Test 24: Bad note ID handling**
```bash
# Invalid ObjectId format
1. GET /api/v1/notes/invalid-id
2. Verify: 400 "Invalid note id" ✅

# Valid ObjectId but not found
3. GET /api/v1/notes/507f1f77bcf86cd799439999
4. Verify: 404 "Note not found" ✅
```

### ✅ Bad Imports
**Test 25: Import error handling**
```bash
1. POST /api/v1/notes/import { "notes": "not an array" }
2. Verify: 400 with clear message ✅

2. POST /api/v1/notes/import with large file (100MB)
3. Verify: Handled gracefully (timeout or limit) ✅
```

---

## Logging & Monitoring

### ✅ Delete Logging
**Test 26: Cascade delete logs**
```bash
1. Delete user account
2. Check logs:
   - "User account deleted successfully" ✅
   - "Deleted X notes for user {id}" ✅
```

### ✅ Import Logging
**Test 27: Import operations logged**
```bash
1. POST /api/v1/notes/import
2. Check logs:
   - "Creating new note" entries ✅
   - "Checking if noteId exists" entries ✅
```

---

## Rollback Testing

### ✅ Rollback Safety
**Test 28: Can rollback if needed**
```bash
# If deployment needs to rollback:
1. Revert code to previous commit
2. App still works ✅
3. Old notes without noteId still accessible ✅
4. No database schema errors ✅
```

---

## Browser/E2E Testing

### ✅ User Workflows
**Test 29: Complete user flow**
```
1. Sign up → New user
2. Create note → Create modal works
3. List notes → Shows in grid with _id key
4. Edit note → Modal opens with _id
5. Save note → Updates correctly
6. Delete note → Deleted via _id
7. Export notes → File downloads with noteId
8. Delete account → Confirms cascade delete happened ✅
```

**Test 30: Multiple users**
```
1. User A creates 5 notes
2. User B logs in
3. Verify User B sees 0 notes ✅
4. User B creates 3 notes
5. Verify User A still has 5, User B has 3 ✅
6. User B imports User A's exported file
7. Verify: User B now has 8 notes ✅
8. User B's notes have different noteIds ✅
```

---

## Summary Checklist

### Backend ✅
- [ ] All tests pass
- [ ] No errors on startup
- [ ] Indexes created
- [ ] Migration script works
- [ ] Logging shows correct behavior

### Database ✅
- [ ] Indexes verified with `getIndexes()`
- [ ] Old notes backfilled with noteId
- [ ] No null noteIds remain
- [ ] No duplicate noteIds
- [ ] All notes have userId

### Frontend ✅
- [ ] React keys use `_id`
- [ ] Delete uses correct note `_id`
- [ ] Export shows noteId
- [ ] Import shows results correctly
- [ ] No console errors

### Security ✅
- [ ] Users can't access other users' notes
- [ ] Delete filters by ownership
- [ ] Import forces correct userId
- [ ] Cascade delete works

### Performance ✅
- [ ] List notes is fast (<100ms)
- [ ] Queries use indexes
- [ ] Import is efficient

### Deployment ✅
- [ ] All files committed
- [ ] Dependencies installed
- [ ] Migration run successfully
- [ ] System tested and verified

---

## Test Data

### Sample SQL for manual testing
```javascript
// Create test users
db.users.insertOne({ email: "user1@test.com", password: "...", name: "User 1" })
db.users.insertOne({ email: "user2@test.com", password: "...", name: "User 2" })

// Create test notes
db.notes.insertOne({
  title: "Test",
  content: "Content",
  userId: ObjectId("...user1..."),
  noteId: "550e8400-e29b-41d4-a716-446655440000"
})

// Create note without noteId (for migration testing)
db.notes.insertOne({
  title: "Old Note",
  content: "Should get migrated",
  userId: ObjectId("...user1..."),
  noteId: null
})
```

---

## Sign-Off

- [ ] QA: All tests pass
- [ ] Backend: Code review approved
- [ ] Frontend: Code review approved
- [ ] Database: Migration verified
- [ ] Deployment: Ready for production

**Deployment Date**: ________________
**Deployed By**: ________________
**Verified By**: ________________

---

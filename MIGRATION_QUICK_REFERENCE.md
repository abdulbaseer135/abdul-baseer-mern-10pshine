# Quick Migration Reference
## Copy-Paste Code Patterns

---

## 📌 **Core Patterns for Your App**

### **Pattern 1: Primary Action Button**

**Copy This:**
```jsx
<button className="btn-primary">
  Save Changes
</button>

// With icon:
<button className="btn-primary flex items-center gap-2">
  <SaveIcon className="w-4 h-4" />
  Save
</button>

// Loading state:
<button className="btn-primary disabled:opacity-50" disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</button>
```

**Use in:** LoginPage, SignupPage, DashboardPage (new note, save note)

---

### **Pattern 2: Secondary/Cancel Button**

**Copy This:**
```jsx
<button className="btn-secondary">
  Cancel
</button>

// With icon:
<button className="btn-ghost flex items-center gap-2">
  <ArrowLeftIcon className="w-4 h-4" />
  Back
</button>
```

**Use in:** All pages with forms

---

### **Pattern 3: Danger/Delete Button**

**Copy This:**
```jsx
<button className="btn-danger">
  Delete Account
</button>

// With confirmation dialog first:
<button 
  className="btn-danger"
  onClick={() => setShowDeleteConfirm(true)}
>
  Delete
</button>
```

**Use in:** ProfilePage (account deletion), Dashboard (note deletion)

---

### **Pattern 4: Text Input Field**

**Copy This:**
```jsx
<input
  type="text"
  className="input-base"
  placeholder="Enter name"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// With label:
<div className="flex flex-col gap-2">
  <label className="text-sm font-medium text-text-primary">
    Full Name
  </label>
  <input type="text" className="input-base" />
</div>

// With error state:
<input
  type="email"
  className={`input-base ${hasError ? 'input-error' : ''}`}
  onChange={handleChange}
  onBlur={() => validateEmail()}
/>
{hasError && (
  <p className="text-xs text-destructive-primary mt-1">
    Invalid email format
  </p>
)}

// Disabled:
<input
  type="text"
  className="input-base"
  value={email}
  disabled
/>
```

**Use in:** LoginPage, SignupPage, ProfilePage, all forms

---

### **Pattern 5: Textarea / Rich Editor**

**Copy This:**
```jsx
<textarea
  className="input-base"
  placeholder="Write your note..."
  rows={10}
  value={content}
  onChange={(e) => setContent(e.target.value)}
/>
```

**Use in:** NoteEditorPage

---

### **Pattern 6: Note Card (Dashboard)**

**Copy This:**
```jsx
// Old:
<div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.07] rounded-2xl shadow-xl...p-6">
  <h3>{note.title}</h3>
</div>

// New:
<div className="card p-6 cursor-pointer hover:shadow-md transition-shadow">
  <h3 className="font-semibold text-text-primary mb-2">
    {note.title}
  </h3>
  <p className="text-sm text-text-secondary line-clamp-3">
    {note.content}
  </p>
  <p className="text-xs text-text-tertiary mt-3">
    {formatDate(note.updatedAt)}
  </p>
</div>
```

**Use in:** DashboardPage

---

### **Pattern 7: Modal Dialog**

**Copy This:**
```jsx
{showModal && (
  <div>
    {/* Overlay */}
    <div
      className="modal-overlay"
      onClick={() => setShowModal(false)}
    />
    
    {/* Content */}
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="modal-content w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Confirm Action
        </h2>
        
        <p className="text-sm text-text-secondary mb-6">
          Are you sure you want to delete this?
        </p>
        
        {/* Button Group */}
        <div className="flex gap-3 justify-end">
          <button
            className="btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button
            className="btn-danger"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
)}
```

**Use in:** ProfilePage (delete account), DashboardPage (delete note)

---

### **Pattern 8: Tabs (Profile Page)**

**Copy This:**
```jsx
// Old:
<div className="flex gap-2 mb-6">
  <button className={`px-4 py-2 ${activeTab === 'profile' ? '...' : '...'}`}>
    Profile
  </button>
</div>

// New:
const [activeTab, setActiveTab] = useState('profile');

<div className="tabs mb-6">
  {['profile', 'password', 'danger'].map((tab) => (
    <button
      key={tab}
      className={`tab-btn ${activeTab === tab ? 'tab-btn-active' : ''} ${
        tab === 'danger' ? 'tab-btn-danger' : ''
      } ${activeTab === 'danger' && tab === 'danger' ? 'tab-btn-danger-active' : ''}`}
      onClick={() => setActiveTab(tab)}
    >
      {tab === 'profile' && 'Profile'}
      {tab === 'password' && 'Password'}
      {tab === 'danger' && 'Danger Zone'}
    </button>
  ))}
</div>

{/* Tab Content */}
{activeTab === 'profile' && <div>Profile form...</div>}
{activeTab === 'password' && <div>Password form...</div>}
{activeTab === 'danger' && <div>Danger zone...</div>}
```

**Use in:** ProfilePage

---

### **Pattern 9: Danger Zone Section**

**Copy This:**
```jsx
<div className="danger-zone">
  <div className="mb-4">
    <h3 className="font-semibold text-destructive-primary mb-1">
      Delete Account
    </h3>
    <p className="text-sm text-text-secondary">
      This action cannot be undone. All your notes will be deleted permanently.
    </p>
  </div>
  
  <button
    className="btn-danger"
    onClick={() => setShowDeleteConfirm(true)}
  >
    Delete My Account
  </button>
</div>
```

**Use in:** ProfilePage

---

### **Pattern 10: Form Section with Label**

**Copy This:**
```jsx
<div className="space-y-4">
  {/* Password Field */}
  <div>
    <label className="text-sm font-medium text-text-primary block mb-2">
      Current Password
    </label>
    <input
      type="password"
      className="input-base"
      placeholder="Enter current password"
    />
  </div>
  
  {/* New Password Field */}
  <div>
    <label className="text-sm font-medium text-text-primary block mb-2">
      New Password
    </label>
    <input
      type="password"
      className="input-base"
      placeholder="Enter new password"
    />
  </div>
  
  {/* Button Group */}
  <div className="flex gap-3 pt-4">
    <button className="btn-secondary flex-1">Cancel</button>
    <button className="btn-primary flex-1">Update Password</button>
  </div>
</div>
```

**Use in:** ProfilePage (password change), all forms

---

### **Pattern 11: Loading/Skeleton State**

**Copy This:**
```jsx
// Shimmer skeleton for cards:
<div className="card p-6">
  <div className="skeleton-shimmer h-6 w-2/3 rounded mb-3" />
  <div className="skeleton-shimmer h-4 w-full rounded mb-2" />
  <div className="skeleton-shimmer h-4 w-4/5 rounded" />
</div>

// Loading button:
<button className="btn-primary disabled:opacity-50" disabled={isLoading}>
  {isLoading ? (
    <>
      <span className="inline-block animate-spin mr-2">⟳</span>
      Loading...
    </>
  ) : (
    'Save'
  )}
</button>
```

---

### **Pattern 12: Badge/Pill**

**Copy This:**
```jsx
// Email verified badge:
<div className="badge-success">
  ✓ Email Verified
</div>

// Admin badge:
<div className="badge-danger">
  👤 Admin
</div>

// Draft status:
<div className="badge-neutral">
  Draft
</div>
```

**Use in:** ProfilePage, DashboardPage

---

### **Pattern 13: Panel (For Sections)**

**Copy This:**
```jsx
// Main panel:
<div className="panel p-6">
  <h2 className="text-lg font-semibold text-text-primary mb-4">
    Profile Information
  </h2>
  
  {/* Nested content */}
  <div className="space-y-4">
    <div className="panel-nested p-4">
      <p className="text-sm text-text-secondary">
        Email: {user.email}
      </p>
    </div>
  </div>
</div>
```

---

### **Pattern 14: Empty State**

**Copy This:**
```jsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="text-5xl mb-4">📝</div>
  <h3 className="text-lg font-semibold text-text-primary mb-2">
    No Notes Yet
  </h3>
  <p className="text-sm text-text-secondary mb-6">
    Create your first note to get started.
  </p>
  <button className="btn-primary">
    Create Note
  </button>
</div>
```

---

### **Pattern 15: Search Input**

**Copy This:**
```jsx
<div className="relative">
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
  <input
    type="text"
    className="input-base pl-9"
    placeholder="Search notes..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>
```

---

## 🔄 **Global Find & Replace Patterns**

### **For VS Code Find & Replace (Ctrl+H):**

**Find:** `bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-lg shadow-indigo-500/25`

**Replace:** `btn-primary`

---

**Find:** `px-4 py-2\.5 rounded-xl text-sm bg-gray-50 dark:bg-white/\[0\.04\] border border-gray-200 dark:border-white/\[0\.08\]`

**Replace:** `input-base`

---

**Find:** `bg-white dark:bg-\[#141414\] border border-gray-200/60 dark:border-white/\[0\.07\] rounded-2xl shadow-xl shadow-gray-200/60 dark:shadow-black/40`

**Replace:** `card`

---

**Find:** `transform: translateY\(-1px\)` (for button hover)

**Replace:** *(delete — not in new system)*

---

**Find:** `transform: translateY\(-3px\)` (for card hover)

**Replace:** *(delete — not in new system)*

---

**Find:** `box-shadow: 0 0 0 3px rgba\(99, 102, 241, 0\.15\)`

**Replace:** *(delete — use outline instead)*

---

## 📋 **By Component File**

### **LoginPage.jsx**
- [ ] Button: `btn-primary`
- [ ] Inputs: `input-base`
- [ ] Links: already styled (keep)
- [ ] Remove input shadows/glows

### **SignupPage.jsx**
- [ ] Button: `btn-primary`
- [ ] Inputs: `input-base`
- [ ] Strength meter: keep logic, clean styling
- [ ] Remove all custom input styling

### **ForgotPasswordPage.jsx**
- [ ] Email input: `input-base`
- [ ] Button: `btn-primary`
- [ ] Success message: keep styling

### **OTPVerificationPage.jsx**
- [ ] OTP digit inputs: `input-base`
- [ ] Submit button: `btn-primary`
- [ ] Resend button: `btn-ghost`

### **ResetPasswordPage.jsx**
- [ ] Password inputs: `input-base`
- [ ] Submit button: `btn-primary`
- [ ] Cancel button: `btn-secondary`
- [ ] Strength meter: update styling

### **ProfilePage.jsx**
- [ ] Tabs: use `.tabs` + `.tab-btn`
- [ ] Profile inputs: `input-base`
- [ ] Save button: `btn-primary`
- [ ] Cancel button: `btn-secondary`
- [ ] Change password inputs: `input-base`
- [ ] Password buttons: `btn-primary` / `btn-secondary`
- [ ] Danger zone: `.danger-zone` class
- [ ] Delete button: `btn-danger`
- [ ] Email verified badge: `badge-success`
- [ ] Remove all card/panel inline styles

### **DashboardPage.jsx**
- [ ] Note cards: `.card` class
- [ ] New note button: `btn-primary`
- [ ] Delete note button: `btn-danger` (if inline)
- [ ] Search: `input-base`
- [ ] Remove note card hover lift effects

### **NoteEditorPage.jsx**
- [ ] Editor panel: `.panel`
- [ ] Save button: `btn-primary`
- [ ] Cancel button: `btn-secondary`
- [ ] Delete button: `btn-danger`

---

## ✅ **Testing Checklist**

After updates:

```
[ ] Light mode looks clean and premium
[ ] Dark mode has good contrast
[ ] Button hover states work
[ ] Button active states work
[ ] Button disabled states work
[ ] Input focus ring appears
[ ] Tab switching works
[ ] Modal opens/closes
[ ] No console errors
[ ] Mobile looks good
[ ] Touch targets are 44px+ on mobile
[ ] All text is readable (WCAG AA contrast)
[ ] Focus navigation works (Tab key)
[ ] All animations are smooth (200ms)
[ ] No glow effects visible
```

---

## 🎯 **Expected Result**

After applying these patterns:

✅ **Premium SaaS feel** like Linear, Notion, Vercel
✅ **Consistent styling** across all pages
✅ **Professional interactions** (no flashy effects)
✅ **Better dark mode** with clear surface hierarchy
✅ **Accessible** (proper contrast, focus states)
✅ **Maintainable** (reusable utility classes)
✅ **Responsive** (works on mobile, tablet, desktop)

---

**Time estimate:** 2-3 hours to update all components

**Recommendation:** Do Priority 1 files first (auth pages, profile, dashboard) then test before doing others.


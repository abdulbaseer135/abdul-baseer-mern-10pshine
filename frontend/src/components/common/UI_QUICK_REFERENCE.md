/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UI SYSTEM QUICK REFERENCE
 * Copy-paste patterns for common use cases
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ════════════════════════════════════════════════════════════════════════════
// 1. BUTTONS — Quick Copy Patterns
// ════════════════════════════════════════════════════════════════════════════

// Primary CTA
<Button onClick={handleClick}>Create Note</Button>

// With icon
<Button icon={PlusIcon}>Add Item</Button>

// Loading state
<Button disabled icon={Loader}>Saving...</Button>

// Size variants
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>

// Style variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Delete</Button>
<Button variant="success">Confirm</Button>

// Disabled
<Button disabled>Unavailable</Button>

// ════════════════════════════════════════════════════════════════════════════
// 2. TEXT INPUTS — Quick Copy Patterns
// ════════════════════════════════════════════════════════════════════════════

// Basic input
<TextInput
  label="Title"
  placeholder="Enter title..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// With error
<TextInput
  label="Email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
/>

// With helper text
<TextInput
  label="Username"
  placeholder="johndoe"
  helperText="3-20 characters, letters and numbers only"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>

// With success state
<TextInput
  label="Username"
  value={username}
  success={isAvailable}
  helperText="Username is available!"
  onChange={(e) => setUsername(e.target.value)}
/>

// With icon
<TextInput
  label="Password"
  type="password"
  icon={LockIcon}
  placeholder="••••••••"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

// Disabled/readonly
<TextInput
  label="ID"
  disabled
  value={id}
/>

// ════════════════════════════════════════════════════════════════════════════
// 3. SEARCH INPUTS
// ════════════════════════════════════════════════════════════════════════════

<SearchInput
  placeholder="Search notes..."
  icon={SearchIcon}
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>

// ════════════════════════════════════════════════════════════════════════════
// 4. FORM FIELDS — Complete Field Example
// ════════════════════════════════════════════════════════════════════════════

<FormField
  label="Email Address"
  required
  error={errors.email}
  helperText="We'll send a confirmation email"
>
  <TextInput
    placeholder="you@example.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormField>

// ════════════════════════════════════════════════════════════════════════════
// 5. PILLS / TAGS — Quick Copy Patterns
// ════════════════════════════════════════════════════════════════════════════

// Removable tag
<Pill color="indigo" onRemove={() => removeTag(tag)}>
  {tag}
</Pill>

// Clickable category
<Pill color="green" onClick={() => selectCategory('work')}>
  Work
</Pill>

// Inactive pill
<Pill color="slate" isActive={false}>
  Archived
</Pill>

// All color options
<Pill color="indigo">Indigo</Pill>
<Pill color="red">Red</Pill>
<Pill color="green">Green</Pill>
<Pill color="amber">Amber</Pill>
<Pill color="slate">Slate</Pill>

// ════════════════════════════════════════════════════════════════════════════
// 6. SEGMENTED CONTROL — Tab-like Selector
// ════════════════════════════════════════════════════════════════════════════

<SegmentedControl
  options={[
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Archived', value: 'archived' },
  ]}
  value={selectedFilter}
  onChange={setSelectedFilter}
/>

// With icons
<SegmentedControl
  options={[
    { label: 'Grid', value: 'grid', icon: GridIcon },
    { label: 'List', value: 'list', icon: ListIcon },
  ]}
  value={viewMode}
  onChange={setViewMode}
/>

// ════════════════════════════════════════════════════════════════════════════
// 7. CARDS — All Variants
// ════════════════════════════════════════════════════════════════════════════

// Default card
<Card>
  <div className="p-4">Card content</div>
</Card>

// Elevated card (more shadow)
<Card variant="elevated">
  <div className="p-4">Important content</div>
</Card>

// Interactive card (hover lift)
<Card variant="interactive" onClick={handleClick}>
  <div className="p-4">Click to open</div>
</Card>

// Featured card (premium look)
<Card variant="featured">
  <div className="p-6">Featured content</div>
</Card>

// Compact card (dense layouts)
<Card variant="compact">
  <p className="text-sm">Compact content</p>
</Card>

// ════════════════════════════════════════════════════════════════════════════
// 8. MODAL / DIALOG
// ════════════════════════════════════════════════════════════════════════════

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  title="Create New Note"
  onClose={() => setIsOpen(false)}
  size="md" // sm | md | lg
  footer={
    <div className="flex gap-2">
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleCreate}>
        Create
      </Button>
    </div>
  }
>
  {/* Modal content goes here */}
  <TextInput label="Title" placeholder="..." />
  <TextInput label="Description" placeholder="..." />
</Modal>

// Open modal button
<Button onClick={() => setIsOpen(true)}>
  Open Dialog
</Button>

// ════════════════════════════════════════════════════════════════════════════
// 9. EMPTY STATE
// ════════════════════════════════════════════════════════════════════════════

<EmptyState
  icon={InboxIcon}
  title="No notes yet"
  description="Create your first note to get started"
  action={
    <Button icon={PlusIcon} onClick={handleCreate}>
      Create Note
    </Button>
  }
/>

// ════════════════════════════════════════════════════════════════════════════
// 10. ALERTS / NOTIFICATIONS
// ════════════════════════════════════════════════════════════════════════════

// Success message
<Alert
  type="success"
  title="Saved!"
  message="Your changes have been saved."
  icon={CheckCircleIcon}
  onClose={() => setShowAlert(false)}
/>

// Error message
<Alert
  type="error"
  title="Error"
  message="Something went wrong. Please try again."
  icon={AlertCircleIcon}
/>

// Warning message
<Alert
  type="warning"
  title="Unsaved changes"
  message="You have unsaved changes."
  icon={AlertTriangleIcon}
/>

// Info message
<Alert
  type="info"
  title="Tip"
  message="You can use Ctrl+S to save quickly."
  icon={InfoIcon}
/>

// ════════════════════════════════════════════════════════════════════════════
// 11. BADGES / LABELS
// ════════════════════════════════════════════════════════════════════════════

<Badge variant="accent">In Review</Badge>
<Badge variant="success">Published</Badge>
<Badge variant="danger">Urgent</Badge>
<Badge variant="neutral">Draft</Badge>

// ════════════════════════════════════════════════════════════════════════════
// 12. HELPER TEXT & LABELS
// ════════════════════════════════════════════════════════════════════════════

<Label required htmlFor="email">
  Email Address
</Label>
<TextInput id="email" placeholder="..." />
<HelperText>We'll never share your email</HelperText>

// Error helper
<HelperText error>Invalid email format</HelperText>

// Success helper
<HelperText success>Email verified</HelperText>

// ════════════════════════════════════════════════════════════════════════════
// 13. PANELS & CONTAINERS
// ════════════════════════════════════════════════════════════════════════════

<Panel>
  <div className="p-4">Standard panel</div>
</Panel>

<Panel nested>
  <div className="p-4">Nested panel (lighter)</div>
</Panel>

// ════════════════════════════════════════════════════════════════════════════
// 14. DANGER ZONE / DESTRUCTIVE AREAS
// ════════════════════════════════════════════════════════════════════════════

<DangerZone>
  <h3 className="font-semibold text-red-700 dark:text-red-300 mb-2">
    Delete Account
  </h3>
  <p className="text-sm text-red-600 dark:text-red-400 mb-4">
    This action cannot be undone.
  </p>
  <Button variant="danger" icon={TrashIcon}>
    Delete Permanently
  </Button>
</DangerZone>

// ════════════════════════════════════════════════════════════════════════════
// 15. COMPLETE FORM EXAMPLE
// ════════════════════════════════════════════════════════════════════════════

const MyForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'work',
    tags: [],
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await saveForm(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {/* Title */}
      <TextInput
        label="Title"
        required
        placeholder="Note title..."
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        error={errors.title}
        helperText="Give your note a descriptive title"
      />

      {/* Category */}
      <FormField label="Category">
        <SegmentedControl
          options={[
            { label: 'Work', value: 'work' },
            { label: 'Personal', value: 'personal' },
          ]}
          value={formData.category}
          onChange={(val) => setFormData({ ...formData, category: val })}
        />
      </FormField>

      {/* Tags */}
      <FormField label="Tags">
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <Pill
              key={tag}
              color="indigo"
              onRemove={() =>
                setFormData({
                  ...formData,
                  tags: formData.tags.filter((t) => t !== tag),
                })
              }
            >
              {tag}
            </Pill>
          ))}
        </div>
      </FormField>

      {/* Description */}
      <FormField label="Description">
        <textarea
          className="input-base"
          rows="6"
          placeholder="Describe your note..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </FormField>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button variant="secondary">Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Note'}
        </Button>
      </div>
    </form>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PURE TAILWIND / CSS CLASSES — No Component Wrapper
// Use these when you don't need React component features
// ════════════════════════════════════════════════════════════════════════════

/**
 * BUTTONS (CSS only)
 */
// <button className="btn-primary">Click me</button>
// <button className="btn-secondary">Secondary</button>
// <button className="btn-ghost">Ghost</button>
// <button className="btn-danger">Delete</button>
// <button className="btn-success">Confirm</button>

/**
 * INPUTS (CSS only)
 */
// <input className="input-base" placeholder="Type..." />
// <input className="input-base input-error" placeholder="Invalid..." />
// <input className="input-base input-success" placeholder="Valid..." />

/**
 * LABELS (CSS only)
 */
// <label className="label-base">Normal Label</label>
// <label className="label-base label-required">Required Field</label>

/**
 * HELPER TEXT (CSS only)
 */
// <p className="helper-text">This is helpful information</p>
// <p className="helper-text-error">• This is an error</p>
// <p className="helper-text-success">✓ Success message</p>

/**
 * PILLS (CSS only)
 */
// <span className="pill-base pill-indigo">Tag</span>
// <span className="pill-base pill-red">Important</span>
// <span className="pill-base pill-green">Done</span>

/**
 * CARDS (CSS only)
 */
// <div className="card">Basic card</div>
// <div className="card-elevated">Elevated card</div>
// <div className="card-interactive">Click card</div>

/**
 * SEGMENTED CONTROL (CSS only)
 */
// <div className="segmented-control">
//   <button className="segmented-control-item segmented-control-item-active">Active</button>
//   <button className="segmented-control-item">Inactive</button>
// </div>

/**
 * EMPTY STATE (CSS only)
 */
// <div className="empty-state">
//   <svg className="empty-state-icon" .../>
//   <h3 className="empty-state-title">No items</h3>
//   <p className="empty-state-description">Create one to get started</p>
// </div>

/**
 * BADGES (CSS only)
 */
// <span className="badge-accent">Accent</span>
// <span className="badge-danger">Danger</span>
// <span className="badge-success">Success</span>
// <span className="badge-neutral">Neutral</span>

// ════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM PRINCIPLES
// ════════════════════════════════════════════════════════════════════════════

/**
 * SPACING SCALE
 * 1 = 4px   |  2 = 8px   |  3 = 12px  |  4 = 16px
 * 6 = 24px  |  8 = 32px  | 12 = 48px
 *
 * Use: gap-3, gap-4, px-3, py-2, mb-4, mt-6, etc.
 */

/**
 * COLOR USAGE
 * Primary (Indigo)    → Main actions, links, focus states
 * Success (Green)     → Positive actions, confirmations
 * Danger (Red)        → Destructive actions, errors
 * Warning (Amber)     → Warnings, cautions
 * Info (Blue)         → Information, secondary actions
 * Neutral (Slate)     → Text, borders, backgrounds
 */

/**
 * DARK MODE
 * Always use dark: prefix for color changes
 * Example: bg-white dark:bg-slate-900
 * Shadows increase opacity in dark mode
 * Text lightens, backgrounds darken
 */

/**
 * STATES
 * Hover     → Slightly darker color, shadow-sm → shadow-md
 * Focus     → Keyboard outline visible
 * Active    → Darker color maintained
 * Disabled  → opacity-50, cursor-not-allowed
 * Error     → Red border, red text
 * Success   → Green border, green text
 */

/**
 * TYPOGRAPHY HIERARCHY
 * label-base          → 10px, semibold (form labels)
 * Button/Pill text    → 12-14px, semibold
 * Body text           → 14px, regular
 * Heading             → 16-20px, semibold
 * Helper text         → 12px, gray color
 */

/**
 * COMPONENTS TO USE
 * Button              → Use <Button> component
 * TextInput           → Use <TextInput> component (validation support)
 * SearchInput         → Use <SearchInput> component (icon placement)
 * Pill/Tag            → Use <Pill> component (easy remove/select)
 * SegmentedControl    → Use component (multi-state management)
 * Card                → Use <Card> (variants handled)
 * Modal               → Use <Modal> component (overlay + animation)
 * EmptyState          → Use <EmptyState> (standard layout)
 * Alert               → Use <Alert> component (types + icon support)
 * Badge               → Use <Badge> (style variants)
 * FormField           → Use for complex multi-part fields
 * Label/HelperText    → Use for accessible forms
 */

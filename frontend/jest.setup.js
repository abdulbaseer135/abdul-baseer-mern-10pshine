// Mock @tiptap modules to avoid TypeScript parsing errors
jest.mock('@tiptap/react', () => ({
  useEditor: () => ({
    commands: {},
    isActive: () => false,
  }),
  EditorContent: () => null,
}));

jest.mock('@tiptap/starter-kit', () => ({
  default: {},
}));

jest.mock('@tiptap/extension-placeholder', () => ({
  default: {},
}));

// Setup file is loaded automatically by jest

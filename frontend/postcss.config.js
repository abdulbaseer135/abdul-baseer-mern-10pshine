module.exports = {
  plugins: [
    require('@tailwindcss/postcss')(),
    require('autoprefixer')(),
    {
      postcssPlugin: 'preserve-generated-css-source',
      OnceExit(root) {
        // Tailwind can generate declarations without source metadata. Vite's
        // URL rewriter expects it even for declarations containing no URLs.
        root.walkDecls((declaration) => {
          if (!declaration.source && root.source) declaration.source = root.source;
        });
      },
    },
  ],
};

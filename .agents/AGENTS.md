# PROJECT CODING & STRUCTURE RULES FOR AGENT

Whenever working in this workspace, the AI Agent must follow these rules:

1. **Unified Typography Rule**:
   - MUST use a single, unified font stack (`'Plus Jakarta Sans'`, sans-serif) across all HTML pages, Next.js components, headings, buttons, inputs, and elements.

2. **Modular CSS Rule**:
   - Do NOT write a single monolithic `style.css` file.
   - Separate CSS per page module under `css/` (for static site) and `src/app/globals.css` (for Next.js App Router):
     - `css/common.css` / `globals.css`: Global variables, font import, reset, typography, header, footer, common buttons.
     - `css/home.css`: Page specific styles for `index.html`.
     - `css/product-list.css`: Page specific styles for `product-list.html`.
     - `css/product-detail.css`: Page specific styles for `product-detail.html`.
     - `css/cart.css`: Page specific styles for `cart.html` & `wishlist.html`.
     - `css/checkout.css`: Page specific styles for `checkout.html`.
     - `css/auth.css`: Page specific styles for `auth.html`.
     - `css/admin.css`: Page specific styles for `admin.html`.

3. **JavaScript Separation**:
   - `js/main.js`: Common navigation, header/footer logic, mobile drawer.
   - `js/products.js`: Product mock data, search & filter functions.
   - `js/cart.js`: Cart & wishlist operations with `localStorage`.
   - `js/admin.js`: Mock admin dashboard logic.

4. **HTML Linking**:
   - Every HTML file must include `css/common.css` first, then its specific `css/[page].css`.
   - Use relative paths for all assets (`assets/images/products/...`).

5. **Anti-AI Slop**:
   - Consistent primary accent color via CSS Variables (`--primary-color: #2e7d32`).
   - Clean spacing (8px grid), rounded corners, soft shadows.
   - Real images from `assets/images/`, NO placeholder gray boxes, NO default purple gradients, NO random emoji icons.

6. **Strict Next.js Migration Standard (Zero UI Change)**:
   - When refactoring the project to Next.js (App Router), ALWAYS follow the exact mapping table and strict rules defined in [NEXTJS_MIGRATION_RULES.md](file:///c:/Users/binhp/OneDrive/Desktop/MINI-SHOP/NEXTJS_MIGRATION_RULES.md).
   - DO NOT alter any visual design, CSS styling, colors (`--primary-color: #2e7d32`), typography (`Plus Jakarta Sans`), margins, or padding.
   - Preserves 100% of HTML class names, IDs, structure, and localStorage logic. Refactor code structure ONLY.


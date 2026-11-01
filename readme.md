# SHOPEASY WEBSITE - SETUP GUIDE

## 1. PROJECT SETUP

1. Create a folder named `ShopEasy`.
2. Create these files inside it:
   - `index.html`
   - `style.css`
   - `script.js`
   - `admin.html`
   - `admin.js`
   - `supabase-config.js`
   - `README.txt`
3. Copy the provided code into the matching files.
4. Open `supabase-config.js` and add your Supabase Project URL and Publishable Key.
5. Save all files.

## 2. RUN THE WEBSITE

1. Open the ShopEasy project folder.
2. Run the website using a local development server (for example, VS Code Live Server).
3. Open `index.html` in your browser.

## 3. CUSTOMER WEBSITE

- Customers can view available products.
- Browse products by category.
- Search for products.
- View product prices and images.
- Click **Order on WhatsApp** to contact the store.

## 4. ADMIN DASHBOARD

1. Open `admin.html`.
2. Log in using your registered Supabase owner account.
3. Manage your store:
   - Change store name and WhatsApp number.
   - Add or delete product categories.
   - Add new products.
   - Edit or delete existing products.
4. Log out when finished.

## 5. DATABASE AND STORAGE

- Supabase stores product, category, and store settings data.
- Admin authentication is handled through Supabase Auth.
- Row Level Security (RLS) protects administrative operations.
- Product images are added using image URLs; image files are not uploaded by this setup.

## 6. IMPORTANT

- Keep your Supabase Publishable Key in `supabase-config.js`.
- Never expose your Supabase Secret or service_role key in frontend code.
- Do not share your admin login credentials.
- Use a hosting service to make the website publicly accessible.
- Test the customer website and admin dashboard before using it for real orders.
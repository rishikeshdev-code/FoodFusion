# 🔥 FoodFusion - Gourmet Food Ordering & Live Database Portal

FoodFusion is a modern web application for ordering food, featuring live order checkout, real-time OTP verification, and a secret Admin Database Portal for managing registered users and orders.

---

## 🌟 Features

- **Gourmet Food Catalog**: Search, filter by category, sort by price/rating.
- **Direct Buy & Cart Flow**: Smooth 3D card payment simulation with live order creation.
- **Secret Admin Database Portal**: Accessible via `?admin=true` or `?db=rishikesh` with passcode lock `REMOVED_SECRET`.
- **Database Management**: Full view and delete capabilities (`🗑️ Delete`) for registered users and order history.
- **Free Multi-Platform Hosting**: Built-in support for Vercel, Netlify, and GitHub Pages.

---

## 🔐 Admin Database Portal Access & Security

- **Passcode**: `REMOVED_SECRET`
- **Private Access URLs**:
  - `http://localhost:5173/?admin=true`
  - `https://rishikeshdev-code.github.io/FoodFusion/?admin=true`
  - `https://your-domain.vercel.app/?db=rishikesh`

*Only users entering the correct passcode `REMOVED_SECRET` can view passwords, user list, or delete records.*

---

## 🌐 Free Hosting & Deployment Options

### Option 1: Vercel (Recommended - 1-Click Free Hosting)
1. Push your repository to GitHub (`rishikeshdev-code/FoodFusion`).
2. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
3. Select `FoodFusion` from your GitHub repositories and click **Deploy**.
4. Vercel will automatically build and publish your app with free SSL certificate!

### Option 2: Netlify (Free Hosting)
1. Go to [Netlify.com](https://netlify.com) and click **Import from Git**.
2. Choose your repository `FoodFusion`.
3. Netlify will detect `netlify.toml` automatically and deploy your site!

### Option 3: GitHub Pages
1. Push to GitHub: `git push -u origin main`
2. GitHub Actions (`.github/workflows/deploy.yml`) will build and deploy automatically to:
   🔗 **https://rishikeshdev-code.github.io/FoodFusion/**

---

## 📌 How to Add Custom Domain (`foodfusion.com`)

If you purchase `foodfusion.com` (or `foodfusiondatabase.com`) from Namecheap, Cloudflare, or GoDaddy:
1. In Vercel / Netlify / GitHub Pages settings, click **Domains** -> **Add Custom Domain**.
2. Enter `foodfusion.com`.
3. Add the DNS CNAME/A records provided by Vercel or Netlify to your domain registrar settings.
4. Your website will be live on `https://foodfusion.com`!

---

## 📌 How to Pin Repo on GitHub (`rishikeshdev-code`)

1. Go to your GitHub Profile: `https://github.com/rishikeshdev-code`
2. Under **Pinned**, click **Customize your pins**.
3. Select **FoodFusion** and click **Save pins**.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start both frontend & backend concurrently
npm run dev

# Build for production
npm run build
```

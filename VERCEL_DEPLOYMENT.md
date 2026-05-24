# Jade and Bloom: Vercel Deployment Guide

## ✅ What's Been Done

Your repository has been configured for Vercel deployment:

1. ✅ **vercel.json** - Vercel configuration for monorepo
2. ✅ **.vercelignore** - Files to exclude from deployment
3. ✅ Your existing Express backend in `artifacts/api-server/`
4. ✅ Your Vite frontend in `artifacts/jade-bloom/`

---

## 🚀 Deployment Steps

### Step 1: Add Environment Variables

Before deploying, your Vercel project needs these environment variables:

```
SHOPIFY_API_TOKEN=shpat_xxxxx
SHOPIFY_STORE=thejadeandbloom.myshopify.com
DATABASE_URL=your_database_url
RESEND_API_KEY=re_xxxxx
INSTAGRAM_HANDLE=the.jadeandbloom
WHATSAPP_BUSINESS_ID=xxxxx
WHATSAPP_PHONE_ID=xxxxx
WHATSAPP_ACCESS_TOKEN=xxxxx
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel Dashboard (Easiest)**

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import GitHub repo: `Shopify-Seamless-Integration`
4. Vercel auto-detects `vercel.json`
5. Add environment variables from Step 1
6. Click **"Deploy"** ✅

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and add environment variables
```

### Step 3: Connect Custom Domain

1. In Vercel project → **Settings** → **Domains**
2. Add: `www.thejadeandbloom.com`
3. Vercel shows CNAME record
4. In GoDaddy DNS, add:
   ```
   Name: www
   Value: cname.vercel-dns.com.
   TTL: 3600
   ```
5. Wait 10-30 mins for DNS propagation ✅

---

## 📊 Architecture

```
Frontend (Vite React)
├─ artifacts/jade-bloom/
└─ Builds to: artifacts/jade-bloom/dist/public/

Backend (Express.js)
├─ artifacts/api-server/
├─ Routes:
│  ├─ /api/health
│  ├─ /api/auth
│  ├─ /api/reviews
│  ├─ /api/leads
│  ├─ /api/whatsapp
│  └─ /api/refund-claims
└─ Builds to: artifacts/api-server/dist/

Vercel Configuration
├─ vercel.json (build + routes)
└─ .vercelignore (exclude files)
```

---

## 🔍 API Routes

Your backend has these endpoints:

| Route | Purpose |
|-------|---------|
| `GET /api/health` | Health check |
| `POST /api/auth` | Customer authentication (OTP) |
| `GET /api/reviews` | Fetch product reviews |
| `POST /api/leads` | Capture lead data |
| `POST /api/whatsapp` | Send WhatsApp messages |
| `POST /api/refund-claims` | Handle refund claims |

---

## 💰 Cost Savings

| Service | Replit | Vercel |
|---------|--------|--------|
| **Frontend hosting** | ₹580/month | ₹0 |
| **Backend hosting** | Included | ₹0 (serverless) |
| **Database** | Extra | Extra |
| **Annual cost** | ₹6,960+ | ₹0 |

**You save ₹6,960/year!** 🎉

---

## ✅ Pre-Deployment Checklist

- [ ] All dependencies in `package.json` are correct
- [ ] Environment variables are ready
- [ ] Shopify API token is valid
- [ ] Resend API key is valid
- [ ] Database connection works
- [ ] Frontend builds locally: `pnpm run build`
- [ ] Backend builds locally: `pnpm -r run build`

---

## 🧪 Test Locally First

```bash
# Install dependencies
pnpm install

# Build everything
pnpm run build

# The output should show:
# ✅ artifacts/jade-bloom/dist/public/ (frontend)
# ✅ artifacts/api-server/dist/ (backend)
```

---

## 🚨 Troubleshooting

### Build Fails
- Check `pnpm-lock.yaml` is committed
- Verify all `package.json` files have correct dependencies
- Run `pnpm install` locally and commit lock file

### API Routes Return 404
- Verify Express server is building correctly
- Check environment variables are set
- Ensure CORS is configured properly
- Test locally first

### Frontend Not Loading
- Check `artifacts/jade-bloom/dist/public/` exists after build
- Verify `vercel.json` has correct `outputDirectory`
- Check Vite build is successful

### Custom Domain Not Working
- Wait 30 mins for DNS propagation
- Verify CNAME record in GoDaddy
- Check domain is added in Vercel settings

---

## 📱 After Deployment

1. ✅ Test website: www.thejadeandbloom.com
2. ✅ Test API: www.thejadeandbloom.com/api/health
3. ✅ Test auth: Login with OTP
4. ✅ Test checkout: Add to cart and checkout
5. ✅ Monitor logs: Vercel dashboard → Logs

---

## 🔐 Security Notes

⚠️ **Never commit secrets!**
- Keep `.env` files out of Git
- Use Vercel's environment variable dashboard
- Regenerate API keys if accidentally exposed

---

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify environment variables are set
3. Test API locally: `pnpm run dev`
4. Check database connection
5. Contact Vercel support if needed

---

**You're ready to deploy!** 🚀

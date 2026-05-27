# Deploying RSVP Manager — Make It Public

## Architecture
- **Frontend** → Vercel (free)
- **Backend API** → Render (free)
- **Database** → MongoDB Atlas (free 512MB)

---

## Step 1 — MongoDB Atlas (Database)

1. Go to https://cloud.mongodb.com and sign up free
2. Click **"Build a Database"** → choose **Free (M0)**
3. Pick a region (closest to you)
4. Set a username and password — save these
5. Under **Network Access** → click **"Add IP Address"** → choose **"Allow Access from Anywhere"** (0.0.0.0/0)
6. Click **"Connect"** → **"Drivers"** → copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/rsvpmanager?retryWrites=true&w=majority
   ```
   Replace `<username>` and `<password>` with yours.

---

## Step 2 — Push Code to GitHub

```bash
# In your project root (rsvpmanager folder)
git init
git add .
git commit -m "Initial production deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rsvpmanager.git
git push -u origin main
```

> Create the repo at https://github.com/new first (name it `rsvpmanager`, keep it public or private).

---

## Step 3 — Deploy Backend on Render

1. Go to https://render.com and sign up (use GitHub login)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo → select `rsvpmanager`
4. Configure:
   - **Name:** `rsvpmanager-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Under **Environment Variables**, add these:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `MONGODB_URI` | your Atlas connection string |
   | `JWT_SECRET` | any long random string (32+ chars) |
   | `JWT_REFRESH_SECRET` | another long random string |
   | `FRONTEND_URL` | *(leave blank for now — fill after Step 4)* |

6. Click **"Create Web Service"**
7. Wait ~3 minutes for it to deploy
8. Copy your backend URL — it looks like: `https://rsvpmanager-backend.onrender.com`
9. Test it: open `https://rsvpmanager-backend.onrender.com/health` — you should see `{"status":"OK",...}`

---

## Step 4 — Deploy Frontend on Vercel

1. Go to https://vercel.com and sign up (use GitHub login)
2. Click **"Add New Project"** → import your `rsvpmanager` repo
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://rsvpmanager-backend.onrender.com` |

5. Click **"Deploy"**
6. Wait ~1 minute
7. Copy your frontend URL — it looks like: `https://rsvpmanager.vercel.app`

---

## Step 5 — Connect Frontend ↔ Backend

Go back to **Render** → your backend service → **Environment** tab:

- Set `FRONTEND_URL` = `https://rsvpmanager.vercel.app`

Click **"Save Changes"** — Render will auto-redeploy.

---

## Step 6 — Test Everything

Open your Vercel URL in a browser:
- ✅ Home page loads
- ✅ Sign up works
- ✅ Login works
- ✅ Create event works
- ✅ Dashboard shows data

---

## Optional: Custom Domain

### On Vercel:
1. Go to your project → **Settings** → **Domains**
2. Add your domain (e.g. `rsvpmanager.com`)
3. Update your DNS records as shown

### On Render:
1. Go to your service → **Settings** → **Custom Domains**
2. Add your API subdomain (e.g. `api.rsvpmanager.com`)
3. Update `FRONTEND_URL` and `VITE_API_URL` accordingly

---

## Optional: Email (SMTP)

Add these to Render environment variables to enable email notifications:

| Key | Value |
|-----|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | your Gmail address |
| `SMTP_PASS` | your Gmail App Password* |
| `SMTP_FROM` | `noreply@yourdomain.com` |

*To get a Gmail App Password: Google Account → Security → 2-Step Verification → App Passwords

---

## Troubleshooting

**Backend shows "Application failed to respond"**
- Check Render logs — usually a missing env variable
- Make sure `MONGODB_URI` is correct and Atlas allows all IPs

**Frontend shows blank page or API errors**
- Open browser DevTools → Console
- Check `VITE_API_URL` is set correctly in Vercel
- Make sure `FRONTEND_URL` in Render matches your Vercel URL exactly

**CORS errors in browser**
- `FRONTEND_URL` in Render must exactly match your Vercel URL (no trailing slash)
- Example: `https://rsvpmanager.vercel.app` ✅ not `https://rsvpmanager.vercel.app/` ❌

**Render free tier goes to sleep**
- Free Render services sleep after 15 min of inactivity
- First request after sleep takes ~30 seconds to wake up
- Upgrade to Starter ($7/mo) to keep it always on

---

## Summary

| Service | URL Pattern | Cost |
|---------|-------------|------|
| Frontend (Vercel) | `https://your-app.vercel.app` | Free |
| Backend (Render) | `https://your-app.onrender.com` | Free |
| Database (Atlas) | Cloud hosted | Free (512MB) |

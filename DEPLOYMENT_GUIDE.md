# NexaLink CRM — Production Deployment & Configuration Guide

This guide covers everything required to deploy the **NexaLink CRM** on any hosting server (cPanel, Shared Hosting with Node.js, VPS with Ubuntu/Debian/CentOS, Nginx/Apache, or Cloud hosting).

---

## 📦 Package Contents

| Item / Directory | Description |
| :--- | :--- |
| `nexalink_crm.sql` | Full MySQL database schema + initial demo dataset & admin account |
| `backend/` | Compiled Node.js / Express backend with production `dist/`, `package.json`, `.env.example` |
| `frontend_dist/` | Production-ready React 18 single-page application (SPA) build with `.htaccess` |
| `ecosystem.config.js` | PM2 process configuration for high-availability cluster mode |
| `nginx.conf.example` | Production Nginx reverse proxy configuration |

---

## 🔑 Default Demo Login Credentials
- **Email:** `demo@nexalink.com`
- **Password:** `password123`
- **Role:** Administrator (`superadmin` access)

---

## 🚀 Step 1: Database Setup (MySQL)

### Option A: Via phpMyAdmin (cPanel / DirectAdmin / Plesk)
1. Log into your hosting control panel and open **phpMyAdmin** (or **MySQL Databases**).
2. Create a new database (e.g. `youruser_nexalink`).
3. Create a MySQL user with a strong password and grant **ALL PRIVILEGES** to the database.
4. Open phpMyAdmin, select your newly created database, go to the **Import** tab.
5. Choose file `nexalink_crm.sql` and click **Import** (or **Go**).

### Option B: Via SSH / Terminal
```bash
# Log in to MySQL and create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS nexalink_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import the SQL file
mysql -u your_db_user -p nexalink_crm < nexalink_crm.sql
```

---

## ⚙️ Step 2: Configure Environment Variables (`.env`)

In the `backend/` folder, copy `.env.example` to `.env` and fill in your actual production values:

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

### What needs to be updated in `backend/.env`:

```env
# Application Server Port (Change if required by your hosting environment)
PORT=5000
NODE_ENV=production

# Your Domain URLs (Replace with your actual domain/subdomain)
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Database Connection Details
DB_HOST=localhost            # Usually 'localhost' or '127.0.0.1' on cPanel/VPS
DB_PORT=3306
DB_USER=your_db_username     # The MySQL username created in Step 1
DB_PASSWORD=your_db_password # The MySQL password created in Step 1
DB_NAME=your_db_name         # The database name created in Step 1

# Security Key (Generate a random 32+ character string)
JWT_SECRET=replace_with_a_secure_32_char_random_secret_string
JWT_EXPIRES_IN=7d

# Optional AI Features (Leave 'built_in' for zero-cost offline smart heuristic engine)
AI_PROVIDER=built_in
AI_API_KEY=
```

---

## 🌐 Step 3: Hosting Options & Setup

### 🟢 Method 1: cPanel / CloudLinux "Setup Node.js App"

1. In cPanel, click **Setup Node.js App**.
2. Click **Create Application**:
   - **Node.js version:** Select `18.x`, `20.x`, or higher.
   - **Application mode:** `Production`.
   - **Application root:** `nexalink/backend` (or wherever you uploaded the `backend/` directory).
   - **Application URL:** your domain or subdomain (e.g. `api.yourdomain.com` or `yourdomain.com`).
   - **Application startup file:** `dist/server.js`.
3. Click **Create**.
4. In the application settings, click **Run NPM Install** (or access terminal and run `npm install --omit=dev` inside the application root).
5. Add the Environment variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, etc.) in the Environment Variables section on cPanel.
6. Click **Restart**.
7. For the Frontend:
   - Upload all files from `frontend_dist/` (including `.htaccess`) into your domain's `public_html/` folder.

---

### 🟢 Method 2: VPS / Dedicated Server (Ubuntu/Debian) with Nginx & PM2

#### 1. Upload & Install Backend Dependencies
```bash
# Upload project to /var/www/nexalink
cd /var/www/nexalink/backend
npm install --omit=dev
```

#### 2. Start Backend with PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start server using ecosystem configuration
cd /var/www/nexalink
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 3. Configure Nginx
Create `/etc/nginx/sites-available/nexalink.conf`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Static React Frontend
    root /var/www/nexalink/frontend_dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # Backend Node.js API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA Routing Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/nexalink.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. Add Free SSL via Let's Encrypt (Certbot)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

### 🟢 Method 3: Single-Port Unified Deployment (Zero Proxy Configuration)

The compiled backend includes a built-in static file handler that will automatically serve the React frontend directly from `backend/public/` on the same port!

1. Upload `backend/` to your server.
2. Ensure `backend/public/` contains the contents of `frontend_dist/`.
3. In `backend/.env`, set `PORT=80` (or `PORT=5000`).
4. Run:
   ```bash
   cd backend
   npm install --omit=dev
   node dist/server.js
   ```
5. Visiting `http://your-server-ip:5000` (or your domain) will directly load the full NexaLink CRM frontend and handle all `/api` calls on the same host!

---

## 📋 Summary of Where & What to Update

| File / Location | What to Update | Purpose |
| :--- | :--- | :--- |
| `backend/.env` | `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Connects Node.js backend to your MySQL database |
| `backend/.env` | `JWT_SECRET` | Secret key used to sign and verify user authentication tokens |
| `backend/.env` | `APP_URL` & `FRONTEND_URL` | Configures CORS headers and permitted origins |
| `backend/.env` | `PORT` | Defines the listening port for Node.js (default `5000`) |
| `public_html/` (cPanel) or `/var/www/...` (VPS) | Upload contents of `frontend_dist/` + `.htaccess` | Serves client React UI with clean URL routing |
| MySQL Database | Import `nexalink_crm.sql` | Installs database schema and initial seed data |

---

## ✅ Post-Deployment Verification Checklist

1. **Check Database Connection:** View Node.js logs (`pm2 logs` or cPanel error logs) to verify:
   `🚀 NexaLink CRM Server running at http://localhost:5000`
2. **Visit the Frontend:** Navigate to your website URL in browser.
3. **Login:** Log in with `demo@nexalink.com` / `password123`.
4. **Test Core Features:**
   - Add a contact in Contacts tab
   - Create a Goal & Task in Goals/Kanban view
   - Schedule a Meeting in Calendar view
   - Test AI Assistant suggestions tab
   - Change theme or profile details in Settings.

# Google Cloud SQL Setup Guide for Vista Travel Platform

## 📋 Prerequisites
- Google Account (you have this ✅)
- Credit card for Google Cloud (required for Cloud SQL, but free tier available)

---

## 🚀 Step-by-Step Google Cloud Console Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** at the top
3. Click **"NEW PROJECT"**
4. Enter project name: **"vista-travel"**
5. Click **"CREATE"**
6. Select your new project

---

### Step 2: Enable Cloud SQL Admin API

1. Go to **Navigation Menu** (☰) → **APIs & Services** → **Library**
2. Search for **"Cloud SQL Admin API"**
3. Click **"ENABLE"**

---

### Step 3: Create Cloud SQL Instance

1. Go to **Navigation Menu** (☰) → **SQL**
2. Click **"CREATE INSTANCE"**
3. Choose **"Choose PostgreSQL"**
4. Fill in the details:

| Field | Value |
|-------|-------|
| **Instance ID** | `vista-db` |
| **Password** | Click "Generate" and SAVE THIS PASSWORD! |
| **Database version** | PostgreSQL 15 |
| **Region** | Choose closest to your users (e.g., `us-central1`) |
| **Machine type** | **Development** → 1 vCPU, 4GB (cheapest option) |
| **Storage type** | SSD |
| **Storage capacity** | 20 GB |

5. Click **"CREATE INSTANCE"** (takes 5-10 minutes)

---

### Step 4: Create Database

1. Once instance is ready, click on it
2. Go to **"Databases"** tab
3. Click **"CREATE DATABASE"**
4. Database name: `vista_travel`
5. Click **"CREATE"**

---

### Step 5: Create Database User

1. Go to **"Users"** tab
2. Click **"ADD USER ACCOUNT"**
3. Choose **"Built-in authentication"**
4. Username: `vista_admin`
5. Password: Create a strong password (SAVE THIS!)
6. Click **"ADD"**

---

### Step 6: Configure Network Access (IMPORTANT!)

1. Go to **"Connections"** tab
2. Under **"Public IP"**, click **"ADD NETWORK"**
3. Enter:
   - Name: `allow-all` (for development)
   - Network: `0.0.0.0/0` (allows all IPs - tighten this later)
4. Click **"DONE"**
5. Click **"SAVE"**

---

### Step 7: Get Connection Details

You'll need these values for the `.env` file:

| Value | Where to find |
|-------|---------------|
| **Public IP** | Overview tab → "Connect to this instance" → Public IP address |
| **Instance Connection Name** | Overview tab → "Connect to this instance" → Connection name |
| **Database Name** | `vista_travel` (you created this) |
| **Username** | `vista_admin` (you created this) |
| **Password** | The password you saved in Step 5 |

---

## 📝 Connection String Format

Your `DATABASE_URL` will look like:

```
postgresql://vista_admin:YOUR_PASSWORD@PUBLIC_IP:5432/vista_travel?sslmode=no-verify
```

Replace:
- `YOUR_PASSWORD` - The password you created
- `PUBLIC_IP` - The IP address from Step 7

---

## ✅ Checklist

- [ ] Google Cloud project created
- [ ] Cloud SQL Admin API enabled
- [ ] PostgreSQL instance created (`vista-db`)
- [ ] Database created (`vista_travel`)
- [ ] User created (`vista_admin`)
- [ ] Network access configured (Public IP)
- [ ] Connection details saved

---

## 🔒 Security Notes (For Production)

1. **Restrict IP Access**: Replace `0.0.0.0/0` with your server's IP
2. **Use Private IP**: For production, use VPC peering
3. **Enable SSL**: Configure SSL certificates
4. **Use Cloud SQL Auth Proxy**: More secure than direct IP connection

---

## 📞 Next Steps

Once you have completed the setup above, provide me with:
1. **Public IP Address** of your Cloud SQL instance
2. **Password** for `vista_admin` user

I will then configure the application to connect to your database.

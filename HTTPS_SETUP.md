# HTTPS Development Setup for WhatsApp Signup

## The Problem

Facebook login (including WhatsApp Embedded Signup) **requires HTTPS**. You cannot use it on `http://localhost`.

The error you're seeing:
```
The method FB.login can no longer be called from http pages.
```

## Solution Options

### Option 1: Use ngrok (Recommended for Testing)

Ngrok creates a secure HTTPS tunnel to your localhost:

1. **Install ngrok**:
   ```bash
   # Download from https://ngrok.com/download
   # Or use npm
   npm install -g ngrok
   ```

2. **Run your dev server**:
   ```bash
   npm run dev
   ```

3. **In a new terminal, start ngrok**:
   ```bash
   ngrok http 3000
   ```

4. **Use the HTTPS URL** provided by ngrok (e.g., `https://abc123.ngrok.io`)

5. **Update Facebook App**:
   - Go to Facebook App Dashboard
   - Add the ngrok HTTPS URL to allowed domains
   - Update redirect URLs

### Option 2: local-ssl-proxy (Simple Local HTTPS)

1. **Install**:
   ```bash
   npm install -g local-ssl-proxy
   ```

2. **Run dev server**:
   ```bash
   npm run dev
   ```

3. **Start SSL proxy**:
   ```bash
   local-ssl-proxy --source 3001 --target 3000
   ```

4. **Access at**: `https://localhost:3001`

5. **Accept self-signed certificate** warning in browser

### Option 3: Next.js with HTTPS (Most Setup)

1. **Install mkcert** for local SSL certificates:
   ```bash
   # Windows (via chocolatey)
   choco install mkcert
   
   # After installation
   mkcert -install
   mkcert localhost
   ```

2. **Create custom server** (`server.js`):
   ```javascript
   const { createServer } = require('https')
   const { parse } = require('url')
   const next = require('next')
   const fs = require('fs')
   
   const dev = process.env.NODE_ENV !== 'production'
   const app = next({ dev })
   const handle = app.getRequestHandler()
   
   const httpsOptions = {
     key: fs.readFileSync('./localhost-key.pem'),
     cert: fs.readFileSync('./localhost.pem'),
   }
   
   app.prepare().then(() => {
     createServer(httpsOptions, (req, res) => {
       const parsedUrl = parse(req.url, true)
       handle(req, res, parsedUrl)
     }).listen(3000, (err) => {
       if (err) throw err
       console.log('> Ready on https://localhost:3000')
     })
   })
   ```

3. **Update package.json**:
   ```json
   {
     "scripts": {
       "dev": "node server.js",
       "dev:http": "next dev"
     }
   }
   ```

### Option 4: Test in Production

Deploy to Vercel/Netlify which automatically provides HTTPS:

```bash
# Deploy to Vercel
vercel

# Or push to GitHub and connect to Vercel
```

## Recommended Approach

For development/testing: **Use ngrok** (Option 1)
- ✅ Zero configuration
- ✅ Real HTTPS certificate
- ✅ Easy to share with team
- ✅ Works with Facebook webhooks

For production: **Deploy to Vercel/Netlify** (Option 4)
- ✅ Automatic HTTPS
- ✅ No SSL certificate management
- ✅ Production-ready

## Quick Start with ngrok

```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# You'll get output like:
# Forwarding https://abc123.ngrok.io -> http://localhost:3000
```

Then:
1. Open the HTTPS URL in your browser
2. Login to your app
3. Click "Connect WhatsApp"
4. The Facebook login should work!

## Important Notes

> [!WARNING]
> - You CANNOT test Facebook login on `http://localhost`
> - You MUST use HTTPS for OAuth flows
> - Self-signed certificates work for testing but browsers will show warnings

> [!TIP]
> Remember to update your Facebook App settings with the HTTPS URL:
> - App Domains
> - Valid OAuth Redirect URIs
> - Website URL

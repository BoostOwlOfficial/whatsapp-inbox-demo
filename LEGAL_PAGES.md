# Privacy Policy and Terms of Service

## URLs for Meta App Configuration

### Privacy Policy
```
https://your-domain.vercel.app/privacy
```

### Terms of Service
```
https://your-domain.vercel.app/terms
```

## Pages Created

1. **Privacy Policy** - `/app/privacy/page.tsx`
   - Covers data collection and usage
   - WhatsApp Business API compliance
   - User rights and data protection
   - Contact information

2. **Terms of Service** - `/app/terms/page.tsx`
   - Service description
   - User responsibilities
   - Prohibited activities
   - Liability and termination

## How to Use

### 1. Update Contact Information

Edit both files and replace:
- `privacy@boostowl.io` with your privacy contact email
- `support@boostowl.io` with your support email
- `https://boostowl.io` with your company website

### 2. Deploy to Vercel

```bash
git add .
git commit -m "Add Privacy Policy and Terms of Service"
git push origin main
```

### 3. Add to Meta App Dashboard

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Select your app
3. Go to **App Settings** → **Basic**
4. Add URLs:
   - **Privacy Policy URL**: `https://your-domain.vercel.app/privacy`
   - **Terms of Service URL**: `https://your-domain.vercel.app/terms`
5. Save changes

### 4. Verify Pages

Visit the URLs to ensure they're accessible:
- `https://your-domain.vercel.app/privacy`
- `https://your-domain.vercel.app/terms`

## What's Included

### Privacy Policy Covers:
- ✅ Information collection
- ✅ Data usage and storage
- ✅ Third-party sharing (WhatsApp/Meta, Supabase, Vercel)
- ✅ User rights (access, deletion, export)
- ✅ Security measures
- ✅ Data retention
- ✅ Contact information

### Terms of Service Covers:
- ✅ Service description
- ✅ WhatsApp Business API compliance
- ✅ User responsibilities
- ✅ Prohibited activities
- ✅ Message content responsibility
- ✅ Liability limitations
- ✅ Termination rights
- ✅ Governing law

## Customization

### Important Sections to Review:

1. **Contact Information** (both files)
   - Update email addresses
   - Update company website

2. **Company-Specific Details**
   - Add your company name
   - Add jurisdiction/governing law
   - Add specific business practices

3. **Data Retention** (Privacy Policy)
   - Specify retention periods if you have specific policies

4. **Service Fees** (Terms of Service)
   - Add pricing/billing terms if applicable

## Meta Requirements

These pages satisfy Meta's requirements for:
- ✅ Privacy Policy URL (required)
- ✅ Terms of Service URL (required)
- ✅ WhatsApp Business API compliance
- ✅ Data handling transparency
- ✅ User rights disclosure

## Legal Disclaimer

**Important:** These are template documents. You should:
- Review with a legal professional
- Customize for your specific business
- Ensure compliance with local laws (GDPR, CCPA, etc.)
- Update regularly as your service evolves

## Testing

After deployment, test the pages:

```bash
# Check Privacy Policy
curl https://your-domain.vercel.app/privacy

# Check Terms of Service
curl https://your-domain.vercel.app/terms
```

Both should return 200 OK with HTML content.

## Next Steps

1. ✅ Pages created
2. ⏳ Update contact information
3. ⏳ Deploy to Vercel
4. ⏳ Add URLs to Meta App Dashboard
5. ⏳ Review with legal team (recommended)
6. ⏳ Test accessibility

Your Privacy Policy and Terms of Service are ready for Meta submission!

# BatDongSan.Digital - Deploy Checklist

## Pre-Deploy

### Supabase Setup
- [ ] Create production Supabase project
- [ ] Run schema.sql in SQL Editor
- [ ] Enable Email authentication (Settings → Auth)
- [ ] Configure Storage bucket (property-images)
- [ ] Test RLS policies work correctly

### Environment Variables
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] NEXT_PUBLIC_APP_URL
- [ ] OPENAI_API_KEY (optional)

### Code Quality
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds

---

## Vercel Deploy

### Option A: GitHub Integration (Recommended)
```bash
# 1. Create GitHub repo
git remote add github https://github.com/USERNAME/bds.git
git push -u github main

# 2. Go to vercel.com
# 3. Import from GitHub
# 4. Add environment variables
# 5. Deploy
```

### Option B: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## Post-Deploy

### Verify Functionality
- [ ] Landing page loads
- [ ] Registration works
- [ ] Login works
- [ ] Can create property
- [ ] Can create customer
- [ ] Watermark tool works
- [ ] Microsite loads (public property)
- [ ] Images upload correctly

### Performance
- [ ] Check Lighthouse score
- [ ] Verify mobile responsiveness
- [ ] Test load times

### Security
- [ ] RLS policies active
- [ ] No exposed secrets
- [ ] HTTPS enabled

---

## Custom Domain (Optional)

1. Vercel Dashboard → Domains
2. Add your domain
3. Update DNS records:
   - A record: `76.76.21.21`
   - CNAME: `cname.vercel-dns.com`
4. Wait for SSL certificate

---

## Monitoring

### Vercel Analytics
- Enable in Project Settings

### Supabase Dashboard
- Monitor database usage
- Check API requests
- Review auth logs

---

## Rollback

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

---

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

---

*Checklist Version: 1.0*
*Created: 2026-01-14*

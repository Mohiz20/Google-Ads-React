# Google IMA Ads TV Demo

This is a [Next.js](https://nextjs.org) project that demonstrates Google IMA (Interactive Media Ads) SDK integration for video advertising.

## Features

- ✅ Google IMA SDK integration
- ✅ Ad blocker detection and user notification
- ✅ Robust error handling
- ✅ Video player with ad support
- ✅ Development-friendly debugging

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Troubleshooting Ad Blocking Issues

### Common Error: `net::ERR_BLOCKED_BY_CLIENT`

This error occurs when:
1. **Ad Blocker is Active**: Browser extensions like uBlock Origin, AdBlock Plus block the IMA SDK
2. **Privacy Settings**: Strict browser privacy settings block advertising scripts
3. **Network Policies**: Corporate firewalls or DNS filters block ad-related domains

### Solutions:

#### For Development:
1. **Disable Ad Blocker**: Temporarily disable for `localhost:3000`
2. **Whitelist Domain**: Add exception for Google IMA domains:
   - `imasdk.googleapis.com`
   - `googletagservices.com`
   - `doubleclick.net`

#### For Production:
1. **Implement Fallbacks**: Use the provided error handling components
2. **User Education**: Show notices when ads are blocked
3. **Alternative Revenue**: Provide subscription options

### Built-in Solutions:

This project includes:
- **AdBlockerNotice Component**: Automatically detects and notifies users
- **Robust Error Handling**: Graceful degradation when IMA fails
- **Loading States**: Clear feedback during SDK initialization
- **CSP Headers**: Proper security headers for ad loading

## Project Structure

```
src/
├── components/
│   ├── AdBlockerNotice.js    # Ad blocker detection & notification
│   └── VideoAdPlayer.js      # Complete video + ads implementation
├── pages/
│   └── index.js              # Main demo page
└── utils/
    └── imaLoader.js          # IMA SDK loading utilities
```

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.

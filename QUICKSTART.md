# Quick Start Guide

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- **Pages**: All routes are in `app/` directory (App Router)
- **Components**: Reusable components in `components/`
- **Content**: Business data in `src/content/content.json`
- **Assets**: Static files in `public/` directory

## Key Features

✅ Next.js 14 with App Router and TypeScript
✅ TailwindCSS with custom brand colors
✅ shadcn/ui components
✅ Responsive design (mobile-first)
✅ SEO optimized with metadata and schema
✅ Local business schema markup
✅ All pages implemented (Home, Menu, Visit, About, Contact)

## Customization

### Update Content
Edit `src/content/content.json` to update:
- Business information
- Address and phone
- Opening hours
- Social media links

### Update Brand Colors
Edit `tailwind.config.ts` to modify brand colors.

### Update Images
Replace images in `public/assets/gallery/` and `public/logos/`.

## Deployment

The project is ready for deployment on Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Deploy automatically

Or deploy manually:
```bash
npm run build
npm start
```

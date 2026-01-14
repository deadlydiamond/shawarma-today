# Leaf & Bean Café Website

A premium, timeless marketing website for Leaf & Bean Café, an independent neighbourhood café in Morningside, Edinburgh.

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Fonts**: Cinzel (headings), Inter (body)
- **Deployment**: Vercel

## Project Structure

```
coffee/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with fonts and metadata
│   ├── page.tsx           # Home page
│   ├── menu/              # Menu page
│   ├── visit/             # Visit/contact info page
│   ├── about/             # About page
│   ├── contact/           # Contact form page
│   └── globals.css        # Global styles and Tailwind
├── components/
│   ├── layout/            # Header and Footer components
│   └── ui/                # Reusable UI components (Button, Card)
├── lib/
│   └── utils.ts           # Utility functions (cn helper)
├── src/
│   └── content/
│       └── content.json    # Content data (address, hours, etc.)
├── assets/                # Images and media
│   ├── gallery/           # Gallery images
│   ├── images/            # General images
│   └── logos/             # Logo files
├── favicons/              # Favicon files
└── data/                  # Additional data files
```

## Brand Guidelines

### Colors
- **Gold Primary**: `#D4AF37`
- **Gold Secondary**: `#C9A227`
- **Black Primary**: `#0B0B0C`
- **Charcoal**: `#141414`
- **Cream Background**: `#F5F1E8`
- **Coffee Brown**: `#5A4634`

### Typography
- **Headings**: Cinzel (uppercase, 0.04em letter spacing)
- **Body**: Inter (400 weight)
- **Buttons**: Inter (600 weight, uppercase)

### Design Principles
- Minimal and calm
- High contrast for readability
- Strong hierarchy
- Generous spacing
- Timeless, not trendy
- No visual clutter

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
npm start
```

## Content Management

Content is managed in `src/content/content.json`. Update this file to change:
- Business name and tagline
- Address and contact information
- Opening hours
- Social media links

## Assets

- **Logos**: Place logo files in `/logos/` directory
- **Gallery Images**: Place gallery images in `/assets/gallery/`
- **Favicons**: Place favicon files in `/favicons/` directory

## SEO

The site includes:
- Proper meta tags and Open Graph data
- Local business schema markup
- Semantic HTML structure
- Optimized images

## Deployment

The site is configured for deployment on Vercel. Simply connect your repository to Vercel for automatic deployments.

## License

This is a client-commissioned project. All rights reserved.

# Microsoft 365 Message Center Viewer

A modern, user-friendly interface for tracking Microsoft 365 service updates, announcements, and changes.

🌐 **Live Demo**: [https://message.cengizyilmaz.net](https://message.cengizyilmaz.net)

## Features

- 📊 **Real-time Updates**: Track all Microsoft 365 service announcements
- 🔍 **Advanced Filtering**: Filter by service, category, severity, and date range
- 🌓 **Dark Mode**: Automatic theme switching based on system preferences
- 📱 **Responsive Design**: Optimized for all devices
- 🚀 **Fast Performance**: Lazy loading and optimized bundle sizes
- 🔐 **SEO Optimized**: Full SEO support with dynamic sitemaps
- 📈 **Analytics**: Google Analytics integration

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Zustand
- **Routing**: React Router v6
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/MS365MessageCenter.git
cd MS365MessageCenter
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Deployment

### GitHub Pages Deployment

This project is configured for GitHub Pages deployment with custom domain support.

1. **Build the project**:
```bash
npm run build
```

2. **Deploy to GitHub Pages**:
```bash
npm run deploy
```

3. **GitHub Repository Settings**:
- Go to Settings > Pages
- Source: Deploy from a branch
- Branch: gh-pages / (root)
- Custom domain: message.cengizyilmaz.net (if using)

4. **Important Files**:
- `404.html`: Handles SPA routing on GitHub Pages
- `.nojekyll`: Prevents Jekyll processing
- `CNAME`: Contains custom domain (auto-generated)

### Manual Deployment

If you prefer manual deployment:

1. Build the project: `npm run build`
2. The `dist` folder contains all files ready for deployment
3. Upload the contents of `dist` to your web server

## Project Structure

```
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript types
│   ├── services/       # API services
│   └── config/         # Configuration files
├── scripts/            # Build scripts
│   ├── generate-sitemap.js  # Dynamic sitemap generation
│   └── post-build.js        # Post-build tasks
└── data/               # Data files
```

## Key Features

### Dynamic Routing
- SEO-friendly URLs with message ID and slug
- Automatic 404 handling
- GitHub Pages SPA support

### Performance Optimizations
- Code splitting with lazy loading
- Optimized bundle sizes
- Preconnect to external domains
- Image lazy loading

### SEO Features
- Dynamic sitemap generation
- Structured data (JSON-LD)
- Open Graph tags
- Twitter Card support
- Canonical URLs

## Troubleshooting

### Messages Not Loading
- Ensure `messages.json` exists in the public folder
- Check browser console for errors
- Verify the JSON format is correct

### 404 Errors on GitHub Pages
- Make sure `404.html` is in the dist folder
- The `.nojekyll` file must be present
- Wait a few minutes for GitHub Pages to update

### Custom Domain Issues
- Add CNAME record pointing to `[username].github.io`
- Enable HTTPS in GitHub Pages settings
- Clear browser cache after DNS propagation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Cengiz Yılmaz**
- GitHub: [@cengizyilmaz1](https://github.com/cengizyilmaz1)
- Twitter: [@cengizyilmaz_](https://twitter.com/cengizyilmaz_)
- LinkedIn: [cengizyilmazz](https://linkedin.com/in/cengizyilmazz)

## Acknowledgments

- Microsoft 365 Message Center for providing the data
- React community for the amazing ecosystem
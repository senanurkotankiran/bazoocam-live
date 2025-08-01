# Bazoocam Live - Multi-language Chat Applications Blog

A modern, SEO-optimized blog platform for video chat applications built with Next.js 14, TypeScript, MongoDB, and internationalization support.

## 🚀 Features

- **Multi-language Support**: English, French, Spanish, Italian
- **SEO Optimized**: Dynamic meta tags, JSON-LD schema, canonical URLs
- **Admin Panel**: Full CMS with rich text editor
- **Modern Stack**: Next.js 14 App Router, TypeScript, MongoDB
- **Responsive Design**: Tailwind CSS with mobile-first approach
- **Performance**: ISR, SSR, Image optimization
- **URL Structure**: SEO-friendly .html URLs (`/apps/camzey.html`)

## 📋 Requirements

- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

## 🛠 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd bazoocam-live
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/bazoocam-live
BAZOOCAM_LIVE_NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key
ADMIN_EMAIL=admin@bazoocam.live
ADMIN_PASSWORD=admin123
```

4. **Start MongoDB** (if using local instance)
```bash
mongod
```

5. **Set up admin user**
```bash
curl -X POST http://localhost:3000/api/setup
```

6. **Start development server**
```bash
npm run dev
```

Visit http://localhost:3000

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   │   ├── apps/          # Blog posts
│   │   └── page.tsx       # Homepage
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities
├── models/                # MongoDB models
├── types/                 # TypeScript types
└── messages/              # Translation files
```

## 🌍 Internationalization

### URL Structure
- English (default): `/apps/camzey.html`
- French: `/fr/apps/camzey.html`
- Spanish: `/es/apps/camzey.html`
- Italian: `/it/apps/camzey.html`

### Adding New Languages
1. Add locale to `src/middleware.ts`
2. Create translation file in `messages/{locale}.json`
3. Update `supportedLocales` in `src/types/index.ts`

## 📝 Content Management

### Admin Panel
Access: http://localhost:3000/admin

**Default Credentials:**
- Email: admin@bazoocam.live
- Password: admin123

### Creating Blog Posts
1. Login to admin panel
2. Go to "Posts" → "Add New"
3. Fill content for each language
4. Add SEO meta tags
5. Configure FAQs and alternatives
6. Publish

### Content Structure
- **Multi-language content**: All text fields support multiple languages
- **SEO Meta**: Title, description, keywords per language
- **Rich content**: Pros/cons, alternatives, FAQs
- **Media**: Image upload and optimization

## 🎨 Styling

Built with Tailwind CSS:
- Responsive design
- Custom color scheme
- Typography optimization
- Component utilities

### Custom Classes
```css
.container     # Max-width container
.btn          # Button base
.btn-primary  # Primary button
.card         # Card component
```

## 🔧 API Endpoints

### Public APIs
- `GET /api/posts` - Get published posts
- `GET /api/posts/[slug]` - Get single post

### Admin APIs (Protected)
- `GET /admin/posts` - List all posts
- `POST /admin/posts` - Create post
- `PUT /admin/posts/[id]` - Update post
- `DELETE /admin/posts/[id]` - Delete post

### Setup
- `POST /api/setup` - Create initial admin user

## 📊 SEO Features

### Meta Tags
- Dynamic title/description per language
- OpenGraph tags
- Twitter Card
- Canonical URLs
- hreflang attributes

### JSON-LD Schema
- Article Schema
- FAQ Schema  
- Breadcrumb Schema
- Organization Schema

### Performance
- Image optimization (Next.js Image)
- ISR (Incremental Static Regeneration)
- Font optimization
- CSS optimization

## 🚀 Deployment

### Vercel (Recommended)
1. Connect repository to Vercel
2. Set environment variables
3. Deploy

### Manual Deployment
```bash
npm run build
npm start
```

### Environment Variables (Production)
```env
MONGODB_URI=mongodb+srv://...
BAZOOCAM_LIVE_NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=production-secret
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-password
```

## 🧪 Development

### Available Scripts
```bash
npm run dev         # Development server
npm run build       # Production build
npm run start       # Production server
npm run lint        # ESLint check
npm run type-check  # TypeScript check
```

### Code Structure
- Use TypeScript for all files
- Follow Next.js App Router patterns
- Implement proper error handling
- Use Tailwind for styling
- Follow accessibility guidelines

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check MongoDB is running
mongod --dbpath /data/db
```

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Translation Missing**
- Check all translation keys exist in message files
- Verify locale configuration in middleware

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

For support, email admin@bazoocam.live or create an issue in the repository. 
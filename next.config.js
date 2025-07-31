// next.config.js
const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'www.bazoocam.live'],
    formats: ['image/webp', 'image/avif'],
  },

  // Webpack optimizations for better chunk loading
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize client-side chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          quill: {
            test: /[\\/]node_modules[\\/](react-quill|quill)[\\/]/,
            name: 'quill',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }
    return config;
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react-quill', 'quill'],
  },

  async rewrites() {
    return [
      // Apps detail pages only
      {
        source: '/apps/:slug((?!.*\\.html$).*)',
        destination: '/apps/:slug.html',
      },
      {
        source: '/:locale/apps/:slug((?!.*\\.html$).*)',
        destination: '/:locale/apps/:slug.html',
      },
      // Contact page - .html URL'sini actual page'e yönlendir
      {
        source: '/contact.html',
        destination: '/contact',
      },
      {
        source: '/:locale/contact.html',
        destination: '/:locale/contact',
      },
      // Privacy page - .html URL'sini actual page'e yönlendir
      {
        source: '/privacy.html',
        destination: '/privacy',
      },
      {
        source: '/:locale/privacy.html',
        destination: '/:locale/privacy',
      }
    ];
  },

  async redirects() {
    return [
      // Prevent double .html
      {
        source: '/apps/:slug(.*\\.html\\.html.*)',
        destination: '/apps/:slug.html',
        permanent: true,
      },
      {
        source: '/:locale/apps/:slug(.*\\.html\\.html.*)',
        destination: '/:locale/apps/:slug.html',
        permanent: true,
      },
      // Redirect non-.html contact to .html
      {
        source: '/contact',
        destination: '/contact.html',
        permanent: true,
      },
      {
        source: '/:locale/contact',
        destination: '/:locale/contact.html',
        permanent: true,
      },
      // Redirect non-.html privacy to .html
      {
        source: '/privacy',
        destination: '/privacy.html',
        permanent: true,
      },
      {
        source: '/:locale/privacy',
        destination: '/:locale/privacy.html',
        permanent: true,
      },
      // Prevent double .html for contact and privacy
      {
        source: '/contact.html.html',
        destination: '/contact.html',
        permanent: true,
      },
      {
        source: '/:locale/contact.html.html',
        destination: '/:locale/contact.html',
        permanent: true,
      },
      {
        source: '/privacy.html.html',
        destination: '/privacy.html',
        permanent: true,
      },
      {
        source: '/:locale/privacy.html.html',
        destination: '/:locale/privacy.html',
        permanent: true,
      }
    ];
  }
};

module.exports = withNextIntl(nextConfig);

# Bazoocam Live - Kurulum Rehberi

Bu rehber, Bazoocam Live projesini sıfırdan kurmanız için gerekli tüm adımları içerir.

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler
- Node.js 18 veya üzeri
- MongoDB (yerel veya cloud)
- Git

### 2. Projeyi İndirin
```bash
# Projeyi klonlayın
git clone <repository-url>
cd bazoocam-live

# Bağımlılıkları yükleyin
npm install
```

### 3. MongoDB Kurulumu

#### Yerel MongoDB (Önerilen - Geliştirme için)
```bash
# macOS (Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Ubuntu/Debian
sudo apt update
sudo apt install mongodb

# Windows
# MongoDB Community Server'ı indirin: https://www.mongodb.com/try/download/community
```

MongoDB'yi başlatın:
```bash
# macOS/Linux
sudo systemctl start mongod
# veya
mongod

# Windows
# MongoDB Compass veya Windows Services'ten başlatın
```

#### Cloud MongoDB (Atlas)
1. [MongoDB Atlas](https://cloud.mongodb.com/) hesabı oluşturun
2. Yeni cluster oluşturun (ücretsiz tier yeterli)
3. Connection string'i kopyalayın

### 4. Environment Ayarları
`.env.local` dosyasını oluşturun:
```bash
cp .env.local.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
# Yerel MongoDB için
MONGODB_URI=mongodb://localhost:27017/bazoocam-live

# Cloud MongoDB için (Atlas)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bazoocam-live

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=super-gizli-anahtar-buraya-yazin

# Admin kullanıcı bilgileri
ADMIN_EMAIL=admin@bazoocam.live
ADMIN_PASSWORD=admin123

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. İlk Admin Kullanıcısını Oluşturun
```bash
# Proje çalışırken başka terminal'de:
curl -X POST http://localhost:3000/api/setup
```

### 6. Projeyi Başlatın
```bash
npm run dev
```

Proje http://localhost:3000 adresinde çalışacak.

## 📋 Temel Kullanım

### Admin Paneline Giriş
1. http://localhost:3000/admin/login adresine gidin
2. Email: `admin@bazoocam.live`
3. Şifre: `admin123`

### İlk Blog Yazısı Oluşturma
1. Admin paneline giriş yapın
2. "Posts" → "Add New" butonuna tıklayın
3. Tüm diller için içerik girin:
   - Başlık (Title)
   - İçerik (Content) 
   - Açıklama (Description)
   - SEO Meta bilgileri
4. FAQ ekleyin
5. Artılar/eksiler ekleyin
6. "Publish" ile yayınlayın

### URL Yapısı Testi
Blog yazısı oluşturduktan sonra:
- İngilizce: `/apps/yazı-slug.html`
- Fransızca: `/fr/apps/yazı-slug.html`
- İspanyolca: `/es/apps/yazı-slug.html`
- İtalyanca: `/it/apps/yazı-slug.html`

## 🌍 Çoklu Dil Desteği

### Yeni Dil Ekleme
1. `src/middleware.ts` dosyasında dil kodunu ekleyin
2. `messages/` klasöründe yeni dil dosyası oluşturun
3. `src/types/index.ts` dosyasında `supportedLocales` listesine ekleyin

Örnek: Almanca eklemek için
```typescript
// src/middleware.ts
locales: ['en', 'fr', 'es', 'it', 'de']

// messages/de.json oluşturun
{
  "navigation": {
    "home": "Startseite",
    // ...
  }
}

// src/types/index.ts
{ locale: 'de', name: 'Deutsch', flag: '🇩🇪' }
```

## 📊 SEO Optimizasyonu

### Otomatik SEO Özellikleri
- ✅ Dinamik meta tag'lar
- ✅ JSON-LD schema (Article, FAQ, Breadcrumb)
- ✅ OpenGraph ve Twitter Card
- ✅ Canonical URL'ler
- ✅ hreflang attribute'ları
- ✅ Sitemap oluşturma

### Manuel SEO Ayarları
Her blog yazısı için:
1. Title tag (dil bazlı)
2. Meta description (dil bazlı)
3. Keywords (dil bazlı)
4. Canonical URL
5. Featured image (OpenGraph için)

## 🎨 Tema Özelleştirme

### Renk Değişikliği
`tailwind.config.js` dosyasında primary renklerini değiştirin:
```javascript
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',  // Ana renk
    600: '#2563eb',
    700: '#1d4ed8',
  },
}
```

### CSS Özelleştirme
`src/app/globals.css` dosyasında custom CSS ekleyin:
```css
@layer components {
  .my-custom-class {
    @apply bg-blue-500 text-white;
  }
}
```

## 🔧 Geliştirme Komutları

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Production sunucusu
npm start

# TypeScript kontrol
npm run type-check

# Linting
npm run lint
```

## 📱 Responsive Tasarım

Proje tamamen responsive olarak tasarlanmıştır:
- Mobile first yaklaşım
- Tailwind CSS breakpoint'leri
- Flexbox ve Grid layout
- Optimized görsel boyutları

## 🐛 Sorun Giderme

### MongoDB Bağlantı Hatası
```bash
# MongoDB servisini kontrol edin
sudo systemctl status mongod

# MongoDB'yi yeniden başlatın
sudo systemctl restart mongod
```

### Build Hataları
```bash
# Next.js cache'ini temizleyin
rm -rf .next
npm run build
```

### TypeScript Hataları
```bash
# Bağımlılıkları yeniden yükleyin
rm -rf node_modules package-lock.json
npm install
```

### Environment Hatası
- `.env.local` dosyasının mevcut olduğundan emin olun
- Tüm gerekli değişkenlerin tanımlandığından emin olun
- Özel karakterler için URL encoding kullanın

## 🚀 Production Deployment

### Vercel (Önerilen)
1. GitHub'a push yapın
2. Vercel'de repository'yi bağlayın
3. Environment değişkenlerini ayarlayın
4. Deploy edin

### Manuel Deployment
```bash
# Build oluşturun
npm run build

# PM2 ile başlatın (isteğe bağlı)
npm install pm2 -g
pm2 start npm --name "bazoocam-live" -- start
```

## 📈 Performans Optimizasyonu

### Otomatik Optimizasyonlar
- ✅ Image optimization (Next.js Image)
- ✅ Font optimization (next/font)
- ✅ Bundle optimization
- ✅ ISR (Incremental Static Regeneration)
- ✅ Automatic code splitting

### Manuel Optimizasyonlar
1. Görselleri WebP formatında kullanın
2. CDN için Next.js Image domains ayarlayın
3. Database index'lerini optimize edin
4. Cache stratejilerini ayarlayın

## 📞 Destek

Sorunlarınız için:
- GitHub Issues açın
- admin@bazoocam.live adresine yazın
- Discord/Telegram kanallarımıza katılın

---

Happy coding! 🎉 
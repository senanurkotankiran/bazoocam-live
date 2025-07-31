# Dinamik Dil Yönetim Sistemi

Bu dokümantasyon, Bazoocam Live projesine eklenen dinamik dil yönetim sistemini açıklamaktadır.

## 🎯 Özellikler;




### Eklenen Ana Özellikler
- ✅ Admin panelinden yeni dil ekleme
- ✅ Dil düzenleme ve silme
- ✅ Otomatik çeviri dosyası oluşturma
- ✅ Dinamik konfigürasyon güncelleme
- ✅ Çeviri yönetimi arayüzü
- ✅ Cache sistemi ile performans optimizasyonu
- ✅ Fallback dil desteği

## 📁 Eklenen Dosyalar

### 1. Models
- `src/models/Language.ts` - Dil modeli ve şeması

### 2. API Endpoints
- `src/app/api/admin/languages/route.ts` - Dil listesi ve oluşturma
- `src/app/api/admin/languages/[id]/route.ts` - Tekil dil operasyonları
- `src/app/api/admin/translations/[locale]/route.ts` - Çeviri yönetimi

### 3. Admin Panel Sayfaları
- `src/app/admin/languages/page.tsx` - Dil yönetimi ana sayfa
- `src/app/admin/languages/new/page.tsx` - Yeni dil ekleme
- `src/app/admin/languages/[id]/page.tsx` - Dil düzenleme
- `src/app/admin/translations/[locale]/page.tsx` - Çeviri düzenleme

### 4. Utility Fonksiyonları
- `src/lib/languages.ts` - Server-side dil yönetimi
- `src/lib/clientLanguages.ts` - Client-side dil yönetimi

### 5. Scripts
- `scripts/seed-languages.js` - Başlangıç dilleri oluşturma

## 🚀 Kurulum ve Çalıştırma

### 1. Veritabanı Başlatma
```bash
# Mevcut dilleri eklemek için
npm run seed:languages
```

### 2. Geliştirme Sunucusu
```bash
npm run dev
```

### 3. Admin Panel Erişimi
- URL: `http://localhost:3000/admin/languages`
- Mevcut admin hesabınızla giriş yapın

## 📋 Kullanım Kılavuzu

### Yeni Dil Ekleme
1. Admin panelinde "Languages" bölümüne gidin
2. "Add New Language" butonuna tıklayın
3. Dil bilgilerini doldurun:
   - **Dil Kodu**: ISO kodları (örn: tr, de, pt-BR)
   - **İngilizce Adı**: Dil adının İngilizce karşılığı
   - **Yerel Adı**: Dilin kendi dilindeki adı
   - **Bayrak**: Emoji veya simge
4. Aktif/Varsayılan seçeneklerini belirleyin
5. "Add Language" butonuna tıklayın

### Çeviri Yönetimi
1. Dil listesinde "Translations" linkine tıklayın
2. Çeviri anahtarlarını düzenleyin
3. "Save Changes" ile kaydedin

### Otomatik Güncellemeler
Yeni dil eklendiğinde sistem otomatik olarak:
- Çeviri dosyası oluşturur (`messages/{kod}.json`)
- `middleware.ts` dosyasını günceller
- `i18n.ts` konfigürasyonunu günceller
- `types/index.ts` dosyasındaki `supportedLocales` listesini günceller

## 🔧 Teknik Detaylar

### Veri Modeli
```typescript
interface ILanguage {
  code: string;          // Dil kodu (örn: 'tr', 'en')
  name: string;          // İngilizce adı
  nativeName: string;    // Yerel adı
  flag: string;          // Bayrak emoji
  isActive: boolean;     // Aktif mi?
  isDefault: boolean;    // Varsayılan dil mi?
  createdAt: Date;
  updatedAt: Date;
}
```

### Cache Sistemi
- **Süre**: 5 dakika
- **Amaç**: Veritabanı sorgularını azaltma
- **Temizleme**: Dil güncelleme işlemlerinde otomatik

### API Güvenliği
- Tüm admin API'leri NextAuth authentication gerektirir
- Session kontrolü middleware ile yapılır

## 🔄 Mevcut Sistemle Entegrasyon

### Güncellenen Komponentler
- `src/components/admin/AdminNavigation.tsx` - Dil yönetimi linki eklendi
- `src/app/admin/posts/new/page.tsx` - Dinamik dil desteği
- `package.json` - Yeni script eklendi

### Geriye Uyumluluk
- Mevcut sabit kodlanmış diller korundu
- Fallback sistem ile hata durumlarında varsayılan diller kullanılır
- Mevcut çeviri dosyaları etkilenmez

## ⚠️ Önemli Notlar

### Uygulama Yeniden Başlatma
Yeni dil ekledikten sonra aşağıdaki durumlarda uygulamayı yeniden başlatmanız gerekebilir:
- Next.js middleware değişiklikleri
- i18n konfigürasyon güncellemeleri
- TypeScript type güncellemeleri

### Dosya İzinleri
Sistem aşağıdaki dosyaları güncelleyebilmek için yazma iznine ihtiyaç duyar:
- `src/middleware.ts`
- `src/i18n.ts`
- `src/types/index.ts`
- `messages/*.json`

### Production Ortamı
Production ortamında:
- Dosya yazma işlemleri güvenlik nedeniyle kısıtlı olabilir
- Manuel deployment gerekebilir
- CDN cache temizleme işlemi yapılmalı

## 🐛 Sorun Giderme

### Yaygın Sorunlar

**1. Dil eklenemiyor**
- Admin yetkilerini kontrol edin
- Veritabanı bağlantısını kontrol edin
- Console log'larını inceleyin

**2. Çeviriler görünmüyor**
- Çeviri dosyasının varlığını kontrol edin
- Cache temizleme işlemi yapın
- Uygulama yeniden başlatmayı deneyin

**3. Middleware hataları**
- `middleware.ts` dosyasının syntax'ını kontrol edin
- TypeScript hatalarını çözün
- Development server'ı yeniden başlatın

### Log Kontrolü
```bash
# Development log'ları
npm run dev

# API endpoint test
curl -X GET http://localhost:3000/api/admin/languages
```

## 📈 Gelecek Geliştirmeler

### Önerilen Özellikler
- [ ] Toplu çeviri import/export
- [ ] Çeviri tamamlanma oranı gösterimi
- [ ] Google Translate API entegrasyonu
- [ ] Çeviri onay sistemi
- [ ] Dil bazında SEO optimizasyonu
- [ ] RTL dil desteği

### API Genişletmeleri
- [ ] Çeviri geçmişi tracking
- [ ] Çeviri istatistikleri
- [ ] Dil kullanım analitikleri

## 💻 Geliştirici Notları

### Yeni Dil Ekleme API
```typescript
POST /api/admin/languages
{
  "code": "tr",
  "name": "Turkish",
  "nativeName": "Türkçe",
  "flag": "🇹🇷",
  "isActive": true,
  "isDefault": false
}
```

### Çeviri Güncelleme API
```typescript
PUT /api/admin/translations/tr
{
  "navigation": {
    "home": "Ana Sayfa",
    "apps": "Uygulamalar"
  }
}
```

### Client-side Kullanım
```typescript
import { fetchActiveLanguages } from '@/lib/clientLanguages';

const languages = await fetchActiveLanguages();
// [{ locale: 'en', name: 'English', flag: '🇺🇸' }, ...]
```

## 📞 Destek

Sistem ile ilgili sorunlar için:
1. GitHub Issues açın
2. Log dosyalarını ekleyin
3. Repro adımlarını belirtin
4. Ortam bilgilerini paylaşın

---

**Not**: Bu sistem Next.js 14, MongoDB ve NextAuth kullanarak geliştirilmiştir. Farklı konfigürasyonlarda ek ayarlamalar gerekebilir. 
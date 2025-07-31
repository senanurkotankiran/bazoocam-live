const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// PageSEO Schema
const PageSEOSchema = new mongoose.Schema(
  {
    pageKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: Map,
      of: String,
      required: true
    },
    description: {
      type: Map,
      of: String,
      required: true
    },
    keywords: {
      type: Map,
      of: String
    },
    jsonLd: {
      type: mongoose.Schema.Types.Mixed
    },
    canonical: String,
    robots: {
      type: String,
      default: 'index, follow'
    }
  },
  {
    timestamps: true
  }
);

const PageSEO = mongoose.models.PageSEO || mongoose.model('PageSEO', PageSEOSchema);

const samplePageSEOData = [
  {
    pageKey: 'homepage',
    title: new Map([
      ['en', 'Bazoocam Live - Best Video Chat Applications & Platforms'],
      ['fr', 'Bazoocam Live - Meilleures Applications de Chat Vidéo'],
      ['es', 'Bazoocam Live - Mejores Aplicaciones de Chat de Vídeo'],
      ['it', 'Bazoocam Live - Migliori Applicazioni di Chat Video'],
      ['tr', 'Bazoocam Live - En İyi Video Chat Uygulamaları ve Platformları']
    ]),
    description: new Map([
      ['en', 'Discover the best live video chat applications and platforms. Find perfect alternatives to popular chat apps like Chatroulette, Omegle and more.'],
      ['fr', 'Découvrez les meilleures applications de chat vidéo en direct. Trouvez des alternatives parfaites aux applications de chat populaires comme Chatroulette, Omegle et plus.'],
      ['es', 'Descubre las mejores aplicaciones de chat de vídeo en directo. Encuentra alternativas perfectas a las aplicaciones de chat populares como Chatroulette, Omegle y más.'],
      ['it', 'Scopri le migliori applicazioni di chat video dal vivo. Trova alternative perfette alle app di chat popolari come Chatroulette, Omegle e altro.'],
      ['tr', 'En iyi canlı video sohbet uygulamalarını ve platformlarını keşfedin. Chatroulette, Omegle gibi popüler sohbet uygulamaları için mükemmel alternatifleri bulun.']
    ]),
    keywords: new Map([
      ['en', 'video chat, live chat, webcam chat, random chat, chatroulette, omegle alternatives, online chat'],
      ['fr', 'chat vidéo, chat en direct, chat webcam, chat aléatoire, chatroulette, alternatives omegle, chat en ligne'],
      ['es', 'chat de vídeo, chat en vivo, chat con cámara web, chat aleatorio, chatroulette, alternativas omegle, chat en línea'],
      ['it', 'chat video, chat dal vivo, chat webcam, chat casuale, chatroulette, alternative omegle, chat online'],
      ['tr', 'video sohbet, canlı sohbet, web kamera sohbet, rastgele sohbet, chatroulette, omegle alternatifleri, çevrimiçi sohbet']
    ]),
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Bazoocam Live",
      "url": "https://www.bazoocam.live",
      "description": "En iyi video sohbet uygulamalarını ve platformlarını keşfedin",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.bazoocam.live/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Bazoocam Live",
        "url": "https://www.bazoocam.live"
      }
    },
    canonical: 'https://www.bazoocam.live',
    robots: 'index, follow'
  },
  {
    pageKey: 'contact',
    title: new Map([
      ['en', 'Contact Us - Get in Touch with Bazoocam Live Team'],
      ['fr', 'Contactez-nous - Entrez en contact avec l\'équipe Bazoocam Live'],
      ['es', 'Contáctanos - Ponte en contacto con el equipo de Bazoocam Live'],
      ['it', 'Contattaci - Mettiti in contatto con il team di Bazoocam Live'],
      ['tr', 'Bize Ulaşın - Bazoocam Live Ekibine Ulaşın']
    ]),
    description: new Map([
      ['en', 'Get in touch with our team for support, inquiries, partnerships or any questions about Bazoocam Live video chat platform.'],
      ['fr', 'Contactez notre équipe pour obtenir du support, des renseignements, des partenariats ou toute question sur la plateforme de chat vidéo Bazoocam Live.'],
      ['es', 'Ponte en contacto con nuestro equipo para soporte, consultas, asociaciones o cualquier pregunta sobre la plataforma de chat de vídeo Bazoocam Live.'],
      ['it', 'Contatta il nostro team per supporto, richieste, partnership o qualsiasi domanda sulla piattaforma di chat video Bazoocam Live.'],
      ['tr', 'Bizimle iletişime geçin. Bazoocam Live ekibine destek, sorularınız veya işbirliği için ulaşın.']
    ]),
    keywords: new Map([
      ['en', 'contact, support, help, customer service, bazoocam live contact, video chat support'],
      ['fr', 'contact, support, aide, service client, contact bazoocam live, support chat vidéo'],
      ['es', 'contacto, soporte, ayuda, servicio al cliente, contacto bazoocam live, soporte chat de vídeo'],
      ['it', 'contatto, supporto, aiuto, servizio clienti, contatto bazoocam live, supporto chat video'],
      ['tr', 'iletişim, destek, yardım, müşteri hizmeti, bazoocam live iletişim, video sohbet desteği']
    ]),
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact Bazoocam Live",
      "url": "https://www.bazoocam.live/contact",
      "description": "Contact the Bazoocam Live team for support and inquiries",
      "mainEntity": {
        "@type": "Organization",
        "name": "Bazoocam Live",
        "url": "https://www.bazoocam.live",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "availableLanguage": ["English", "French", "Spanish", "Italian"]
        }
      }
    },
    canonical: 'https://www.bazoocam.live/contact',
    robots: 'index, follow'
  },
  {
    pageKey: 'privacy',
    title: new Map([
      ['en', 'Privacy Policy - How Bazoocam Live Protects Your Data'],
      ['fr', 'Politique de Confidentialité - Comment Bazoocam Live Protège Vos Données'],
      ['es', 'Política de Privacidad - Cómo Bazoocam Live Protege Tus Datos'],
      ['it', 'Politica sulla Privacy - Come Bazoocam Live Protegge i Tuoi Dati'],
      ['tr', 'Gizlilik Politikası - Bazoocam Live Verilerinizi Nasıl Korur']
    ]),
    description: new Map([
      ['en', 'Read our comprehensive privacy policy to understand how we collect, use, and protect your personal data on Bazoocam Live video chat platform.'],
      ['fr', 'Lisez notre politique de confidentialité complète pour comprendre comment nous collectons, utilisons et protégeons vos données personnelles sur la plateforme de chat vidéo Bazoocam Live.'],
      ['es', 'Lee nuestra política de privacidad completa para entender cómo recopilamos, usamos y protegemos tus datos personales en la plataforma de chat de vídeo Bazoocam Live.'],
      ['it', 'Leggi la nostra politica sulla privacy completa per capire come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali sulla piattaforma di chat video Bazoocam Live.'],
      ['tr', 'Bazoocam Live video sohbet platformunda kişisel verilerinizi nasıl topladığımızı, nasıl kullandığımızı ve nasıl koruduğumuzu anlamak için tam gizlilik politikamızı okuyun.']
    ]),
    keywords: new Map([
      ['en', 'privacy policy, data protection, user privacy, cookies, gdpr, personal data, bazoocam live privacy'],
      ['fr', 'politique de confidentialité, protection des données, confidentialité des utilisateurs, cookies, rgpd, données personnelles, confidentialité bazoocam live'],
      ['es', 'política de privacidad, protección de datos, privacidad del usuario, cookies, rgpd, datos personales, privacidad bazoocam live'],
      ['it', 'politica sulla privacy, protezione dei dati, privacy dell\'utente, cookie, gdpr, dati personali, privacy bazoocam live'],
      ['tr', 'gizlilik politikası, veri koruma, kullanıcı gizliliği, çerezler, gdpr, kişisel veriler, bazoocam live gizliliği']
    ]),
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Privacy Policy - Bazoocam Live",
      "url": "https://www.bazoocam.live/privacy",
      "description": "Privacy policy and data protection information for Bazoocam Live",
      "publisher": {
        "@type": "Organization",
        "name": "Bazoocam Live",
        "url": "https://www.bazoocam.live"
      },
      "dateModified": new Date().toISOString(),
      "inLanguage": "en-US"
    },
    canonical: 'https://www.bazoocam.live/privacy',
    robots: 'index, follow'
  }
];

async function seedPageSEO() {
  try {
    // Connect to MongoDB
   await connectDB();

      // Check if languages already exist
      const existingPageSEO = await PageSEO.countDocuments();
    
      if (existingPageSEO > 0) {
        console.log(`Found ${existingPageSEO} existing page SEO. Skipping seed.`);
        process.exit(0);
      }else{
         
    // Insert sample data
    await PageSEO.insertMany(samplePageSEOData);
    console.log('Sample page SEO data inserted successfully');
      }
   
    
  } catch (error) {
    console.error('Error seeding page SEO data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedPageSEO(); 
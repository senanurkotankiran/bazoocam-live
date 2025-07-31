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

// FAQ Schema
const HomepageFAQSchema = new mongoose.Schema({
  question: {
    type: Map,
    of: String,
    required: true
  },
  answer: {
    type: Map,
    of: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const HomepageFAQ = mongoose.models.HomepageFAQ || mongoose.model('HomepageFAQ', HomepageFAQSchema);

// Sample FAQs
const sampleFAQs = [
  {
    question: {
      en: "What is Bazoocam.live?",
      tr: "Bazoocam.live nedir?",
      fr: "Qu'est-ce que Bazoocam.live ?",
      es: "¿Qué es Bazoocam.live?",
      it: "Cos'è Bazoocam.live?"
    },
    answer: {
      en: "Bazoocam.live is a platform for random video chats with people from around the world.",
      tr: "Bazoocam.live, dünya çapında insanlarla rastgele video sohbetler için bir platformdur.",
      fr: "Bazoocam.live est une plateforme de chats vidéo aléatoires avec des personnes du monde entier.",
      es: "Bazoocam.live es una plataforma para chats de video aleatorios con personas de todo el mundo.",
      it: "Bazoocam.live è una piattaforma per chat video casuali con persone di tutto il mondo."
    },
    order: 1,
    isActive: true
  },
  {
    question: {
      en: "Is Bazoocam.live free?",
      tr: "Bazoocam.live ücretsiz mi?",
      fr: "Bazoocam.live est-il gratuit ?",
      es: "¿Es Bazoocam.live gratis?",
      it: "Bazoocam.live è gratuito?"
    },
    answer: {
      en: "Yes, Bazoocam.live offers free access with optional premium features.",
      tr: "Evet, Bazoocam.live isteğe bağlı premium özelliklerle ücretsiz erişim sunar.",
      fr: "Oui, Bazoocam.live offre un accès gratuit avec des fonctionnalités premium optionnelles.",
      es: "Sí, Bazoocam.live ofrece acceso gratuito con características premium opcionales.",
      it: "Sì, Bazoocam.live offre accesso gratuito con funzionalità premium opzionali."
    },
    order: 2,
    isActive: true
  },
  {
    question: {
      en: "How do I start chatting?",
      tr: "Sohbete nasıl başlarım?",
      fr: "Comment commencer à discuter ?",
      es: "¿Cómo empiezo a chatear?",
      it: "Come iniziare a chattare?"
    },
    answer: {
      en: "Click the Start Chat button, and you're ready to connect!",
      tr: "Sohbete Başla düğmesine tıklayın ve bağlanmaya hazırsınız!",
      fr: "Cliquez sur le bouton Commencer le chat, et vous êtes prêt à vous connecter !",
      es: "¡Haz clic en el botón Iniciar chat y estarás listo para conectar!",
      it: "Clicca sul pulsante Inizia chat e sei pronto per connetterti!"
    },
    order: 3,
    isActive: true
  }
];

async function addSampleFAQs() {
  try {
    await connectDB();
    
    // Check if languages already exist
    const existingFAQs = await HomepageFAQ.countDocuments();
    
    if (existingFAQs > 0) {
      console.log(`Found ${existingFAQs} existing FAQs. Skipping seed.`);
      process.exit(0);
    }
    else{
          // Add sample FAQs
    for (const faqData of sampleFAQs) {
      const faq = new HomepageFAQ({
        question: new Map(Object.entries(faqData.question)),
        answer: new Map(Object.entries(faqData.answer)),
        order: faqData.order,
        isActive: faqData.isActive
      });
      
      await faq.save();
      console.log(`Added FAQ: ${faqData.question.en}`);
    }
    
    }
  
    console.log('All sample FAQs added successfully!');
     
  } catch (error) {
    console.error('Error adding sample FAQs:', error);
    process.exit(1);
  }
}

addSampleFAQs(); 
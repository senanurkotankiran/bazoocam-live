import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Language from '@/models/Language';
import fs from 'fs/promises';
import path from 'path';
import {  ensureDefaultLanguagesExist } from '@/lib/languages';

// GET - Fetch all languages
 export async function GET() {
  try {
    await dbConnect();
    
    // Ensure default language exists
    await ensureDefaultLanguagesExist();
    
    const languages = await Language.find()
      .sort({ isDefault: -1, name: 1 })
      .lean();

    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(JSON.stringify(languages))
    });
  } catch (error) {
    console.error('Error fetching languages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch languages' },
      { status: 500 }
    );
  }
}
 





// POST - Create new language
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const body = await request.json();
    const { code, name, nativeName, flag, isActive = true, isDefault = false, translations } = body;

    // Check if language code already exists
    const existingLanguage = await Language.findOne({ code });
    if (existingLanguage) {
      return NextResponse.json(
        { success: false, error: 'Language code already exists' },
        { status: 400 }
      );
    }

    // Create language entry
    const language = new Language({
      code,
      name,
      nativeName,
      flag,
      isActive,
      isDefault
    });

    await language.save();

    // Create translation file with custom translations or template
    await createTranslationFile(code, translations);

    // Update config files
    await updateConfigFiles();

 

    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(JSON.stringify(language))
    });
  } catch (error) {
    console.log('Error creating language:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create language' },
      { status: 500 }
    );
  }
}

// Helper function to create translation file
async function createTranslationFile(code: string, customTranslations?: any) {
  try {
    const messagesDir = path.join(process.cwd(), 'messages');
    const newFilePath = path.join(messagesDir, `${code}.json`);
    
    // Check if translation file already exists
    try {
      await fs.access(newFilePath);
      console.log(`Translation file already exists: ${newFilePath}, skipping creation`);
      return; // File exists, don't overwrite it
    } catch (error) {
      // File doesn't exist, continue with creation
    }
    
    let translationData;
    
    if (customTranslations && Object.keys(customTranslations).length > 0) {
      // Use custom translations from form
      translationData = customTranslations;
    } else {
      // Read the English translation file as base template
      const enFilePath = path.join(messagesDir, 'en.json');
      
      try {
        const enFileContent = await fs.readFile(enFilePath, 'utf-8');
        const enTranslations = JSON.parse(enFileContent);
        
        // Use English translations as base template
        translationData = enTranslations;
      } catch (error) {
        console.warn('Could not read en.json, using fallback template:', error);
        
        // Fallback to default template if en.json doesn't exist
        translationData = {
          "navigation": {
            "home": "Home",
            "apps": "Apps", 
            "privacy": "Privacy",
            "contact": "Contact"
          },
          "common": {
            "readMore": "Read More",
            "startChat": "Start Chat",
            "exploreApps": "Explore Apps",
            "onlineUsers": "Online Users",
            "share": "Share",
            "like": "Like",
            "description": "Description",
            "features": "Features",
            "alternatives": "Alternatives",
            "pros": "Pros",
            "cons": "Cons",
            "faq": "FAQ",
            "previous": "Previous",
            "next": "Next",
            "page": "Page",
            "of": "of",
            "noPostsFound": "No posts found",
            "noPostsInCategory": "No posts available in this category for the selected language."
          },
          "home": {
            "readMore": "Read More",
            "title": "Welcome to Bazoocam.live",
            "subtitle": "Experience exciting and interactive video chats now!",
            "aboutPlatform": {
              "mainTitle": "Bazoocam.live: A Fast and Fun Way to Meet New People",
              "mainDescription": "Bazoocam.live is a lively video chat platform that connects you with random strangers from around the world in real time. With just one click, you're instantly placed in a live conversation—no registration, no hassle. Whether you're looking to kill time, meet new people, or just have a spontaneous chat, Bazoocam.live makes it simple and exciting. The platform is browser-based and works smoothly across all devices, offering a seamless chatting experience from desktop or mobile.",
              "title2": "Engaging Features That Keep It Fun",
              "featuresDescription": "To make each interaction more enjoyable, Bazoocam.live includes playful filters, AR masks, and a clean, user-friendly interface. These elements add a layer of creativity and entertainment while helping users express themselves anonymously. Whether you're laughing over a silly filter or just enjoying a natural conversation, the platform keeps things light, spontaneous, and fun.",
              "title3": "Privacy and Safety at Its Core",
              "privacyDescription": "Your safety matters. Bazoocam.live prioritizes user privacy and has built-in moderation tools to keep the environment respectful. You can report inappropriate behavior instantly, helping maintain a positive space for everyone. With anonymous chats and no need to share personal info, you can explore new conversations with confidence and peace of mind."
            },
            "topPlatformsTitle": "Explore Our Top Video Chat Platforms",
            "howItWorksTitle": "How Bazoocam Works",
            "howItWorksDescription": "Bazoocam connects you to random people for real-time video chats. Click Start Chat to begin!",
            "whyChooseTitle": "Why Choose Bazoocam?",
            "whyChooseDescription": "Bazoocam offers a seamless and fun way to meet people worldwide. Try it today!",
            "tipsTitle": "Top Tips for Video Chat",
            "tipsDescription": "Ensure a good internet connection and a friendly attitude for the best experience!",
            "faqTitle": "FAQs",
            "readyTitle": "Are you ready for a video chat?",
            "menOnline": "men",
            "womenOnline": "women",
            "totalOnline": "Total:",
            "onlineNow": "online",
            "readyButton": "Yes, I am ready!",
            "connectDescription": "Bazoocam.live connects people from around the world for exciting and interactive video chat experiences. Join now and start connecting!"
          },
          "contact": {
            "title": "Contact Us",
            "subtitle": "Get in touch with us",
            "formTitle": "Send us a message",
            "name": "Name",
            "email": "Email",
            "subject": "Subject",
            "message": "Message",
            "sendMessage": "Send Message",
            "getInTouch": "Get in Touch",
            "description": "We are here to help and answer any questions you may have. We look forward to hearing from you.",
            "emailLabel": "Email",
            "emailValue": "contact@bazoocam.live",
            "responseTimeLabel": "Response Time",
            "responseTimeValue": "Within 24 hours",
            "supportLabel": "Support",
            "supportValue": "Available worldwide"
          },
          "privacy": {
            "title": "Privacy Policy",
            "subtitle": "Your privacy is important to us",
            "infoCollectTitle": "Information We Collect",
            "infoCollectText": "We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support.",
            "infoUseTitle": "How We Use Your Information",
            "infoUseItem1": "To provide, maintain, and improve our services",
            "infoUseItem2": "To process transactions and send related information",
            "infoUseItem3": "To send technical notices and support messages",
            "infoUseItem4": "To communicate with you about products, services, and events",
            "infoSharingTitle": "Information Sharing",
            "infoSharingText": "We do not sell, trade, or transfer your personal information to third parties without your consent, except as described in this policy.",
            "dataSecurityTitle": "Data Security",
            "dataSecurityText": "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
            "contactTitle": "Contact Us",
            "contactText": "If you have any questions about this Privacy Policy, please contact us at privacy@bazoocam.live.",
            "lastUpdated": "Last updated: December 2024"
          },
          "apps": {
            "title": "Video Chat Applications",
            "subtitle": "Explore all video chat apps",
            "searchPlaceholder": "Search apps...",
            "noResults": "No apps found",
            "loading": "Loading apps..."
          },
          "post": {
            "readTime": "min read",
            "publishedOn": "Published on",
            "updatedOn": "Updated on",
            "author": "Author",
            "category": "Category",
            "tags": "Tags",
            "rating": "Rating",
            "votes": "votes",
            "tableOfContents": "Table of Contents",
            "relatedPosts": "Related Posts",
            "sharePost": "Share this post",
            "topAlternativesTitle": "Top Alternatives to",
            "rated": "Rated:",
            "reviews": "reviews",
            "prosAndConsTitle": "Pros & Cons",
            "alternativeApplicationsTitle": "Alternative Applications",
            "faqsTitle": "FAQs"
          },
          "startChat": {
            "modalTitle": "Start Chatting on",
            "modalDescription": "You're about to be redirected to",
            "modalRedirectText": "to start video chatting with random people from around the world.",
            "continueButton": "Continue to",
            "cancelButton": "Cancel",
            "readyToChatTitle": "Ready to Chat Anonymously?",
            "stayHereText": "Before you go to",
            "whyNotStayText": "why not stay here and start chatting instead?",
            "goToButton": "Go to",
            "orStayHereText": "Or, just stay here and",
            "startChatText": "with someone right away!",
            "startChatButton": "Start Chat",
            "usersOnlineText": "Over 214K users are online.",
            "startVideoCallText": "Start your video call now!",
            "yesImReadyButton": "Yes, I'm Ready!"
          },
          "footer": {
            "about": "About",
            "Other Applications": "Other Applications",
            "legal": "Legal",
            "followUs": "Follow Us",
            "newsletter": "Newsletter",
            "subscribe": "Subscribe",
            "allRightsReserved": "All rights reserved"
          },
          "meta": {
            "defaultTitle": "Bazoocam Live - Best Video Chat Applications",
            "defaultDescription": "Discover the best live video chat applications and platforms. Find perfect alternatives to popular chat apps."
          }
        };
      }
    }

    // Write translation file only if it doesn't exist
    await fs.writeFile(newFilePath, JSON.stringify(translationData, null, 2), 'utf-8');
    
    console.log(`Created translation file: ${newFilePath}`);
  } catch (error) {
    console.error('Error creating translation file:', error);
    throw error;
  }
}

// Helper function to update config files
async function updateConfigFiles() {
  try {
    // Get active languages
    const activeLanguages = await Language.find({ isActive: true }).lean();
    const languageCodes = activeLanguages.map(lang => lang.code);

    // Update middleware.ts
    await updateMiddleware(languageCodes, activeLanguages.find(lang => lang.isDefault)?.code || 'en');

    // Update i18n.ts
    await updateI18nConfig(languageCodes, activeLanguages.find(lang => lang.isDefault)?.code || 'en');

    // Update types/index.ts
    await updateTypesFile(activeLanguages);

  } catch (error) {
    console.error('Error updating config files:', error);
    throw error;
  }
}

// Update middleware.ts
async function updateMiddleware(locales: string[], defaultLocale: string) {
  const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
  const middlewareContent = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ${JSON.stringify(locales)};
const defaultLocale = '${defaultLocale}';

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname;

  // Skip middleware for admin, api, static files
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Check if the pathname starts with a locale
  const localeInPath = locales.find(
    (locale) => pathname.startsWith(\`/\${locale}/\`) || pathname === \`/\${locale}\`
  );

  // If there's a locale in path
  if (localeInPath) {
    // If it's the default locale, redirect to remove the prefix
    if (localeInPath === defaultLocale) {
      const newPath = pathname.slice(3) || '/'; // Remove /locale
      return NextResponse.redirect(new URL(newPath, request.url));
    }
    // For other locales, continue normally
    return NextResponse.next();
  }

  // If no locale in path, assume it's the default locale
  // Rewrite to /defaultLocale internally but don't change the URL
  const url = request.nextUrl.clone();
  url.pathname = \`/\${defaultLocale}\${pathname}\`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|admin).*)']
}; 
`;

  await fs.writeFile(middlewarePath, middlewareContent, 'utf-8');
}

// Update i18n.ts
async function updateI18nConfig(locales: string[], defaultLocale: string) {
  const i18nPath = path.join(process.cwd(), 'src', 'i18n.ts');
  const i18nContent = `import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

const locales = ${JSON.stringify(locales)}
const defaultLocale = '${defaultLocale}'

export default getRequestConfig(async ({ locale }: { locale?: string }) => {
  // if locale is missing, use defaultLocale
  const code = locale ?? defaultLocale

  if (!locales.includes(code)) {
    notFound()
  }

  return {
    locale: code,
    messages: (await import(\`../messages/\${code}.json\`)).default
  }
})
`;

  await fs.writeFile(i18nPath, i18nContent, 'utf-8');
}

// Update types/index.ts
async function updateTypesFile(languages: any[]) {
  const typesPath = path.join(process.cwd(), 'src', 'types', 'index.ts');
  
  // Read current types file
  const currentContent = await fs.readFile(typesPath, 'utf-8');
  
  // Find the supportedLocales export and replace it
  const supportedLocalesArray = languages.map(lang => 
    `  { locale: '${lang.code}', name: '${lang.name}', flag: '${lang.flag}' }`
  ).join(',\n');

  const newSupportedLocales = `export const supportedLocales: Locale[] = [
${supportedLocalesArray},
];`;

  // Replace the existing supportedLocales export
  const updatedContent = currentContent.replace(
    /export const supportedLocales: Locale\[\] = \[[\s\S]*?\];/,
    newSupportedLocales
  );

  await fs.writeFile(typesPath, updatedContent, 'utf-8');
} 
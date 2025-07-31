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

    // Config files are now dynamically read from database, no need to update them

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
    const messagesPath = path.join(process.cwd(), 'messages', `${code}.json`);
    
    // Check if file already exists
    try {
      await fs.access(messagesPath);
      console.log(`Translation file for ${code} already exists`);
      return;
    } catch {
      // File doesn't exist, create it
    }

    // Default template translations
    const defaultTranslations = {
      "common": {
        "welcome": "Welcome",
        "home": "Home",
        "about": "About",
        "contact": "Contact",
        "login": "Login",
        "logout": "Logout",
        "register": "Register",
        "search": "Search",
        "submit": "Submit",
        "cancel": "Cancel",
        "save": "Save",
        "delete": "Delete",
        "edit": "Edit",
        "loading": "Loading...",
        "error": "Error",
        "success": "Success",
        "back": "Back",
        "next": "Next",
        "previous": "Previous",
        "close": "Close",
        "open": "Open",
        "yes": "Yes",
        "no": "No",
        "ok": "OK"
      },
      "navigation": {
        "menu": "Menu",
        "dashboard": "Dashboard",
        "profile": "Profile",
        "settings": "Settings",
        "help": "Help",
        "support": "Support"
      },
      "forms": {
        "email": "Email",
        "password": "Password",
        "confirmPassword": "Confirm Password",
        "firstName": "First Name",
        "lastName": "Last Name",
        "phone": "Phone",
        "address": "Address",
        "city": "City",
        "country": "Country",
        "zipCode": "ZIP Code",
        "required": "This field is required",
        "invalidEmail": "Please enter a valid email",
        "passwordMismatch": "Passwords do not match",
        "minLength": "Minimum length is {min} characters",
        "maxLength": "Maximum length is {max} characters"
      },
      "errors": {
        "notFound": "Page not found",
        "serverError": "Server error",
        "unauthorized": "Unauthorized",
        "forbidden": "Forbidden",
        "badRequest": "Bad request",
        "networkError": "Network error",
        "timeout": "Request timeout"
      },
      "messages": {
        "welcomeMessage": "Welcome to our application",
        "loginSuccess": "Successfully logged in",
        "logoutSuccess": "Successfully logged out",
        "registrationSuccess": "Registration successful",
        "updateSuccess": "Updated successfully",
        "deleteSuccess": "Deleted successfully",
        "saveSuccess": "Saved successfully",
        "operationFailed": "Operation failed",
        "pleaseWait": "Please wait...",
        "confirmDelete": "Are you sure you want to delete this item?",
        "changesNotSaved": "You have unsaved changes. Are you sure you want to leave?"
      }
    };

    // Merge custom translations with default ones
    const finalTranslations = customTranslations 
      ? { ...defaultTranslations, ...customTranslations }
      : defaultTranslations;

    // Ensure messages directory exists
    const messagesDir = path.dirname(messagesPath);
    try {
      await fs.access(messagesDir);
    } catch {
      await fs.mkdir(messagesDir, { recursive: true });
    }

    // Write translation file
    await fs.writeFile(messagesPath, JSON.stringify(finalTranslations, null, 2), 'utf-8');
    console.log(`Created translation file for ${code}`);
  } catch (error) {
    console.error(`Error creating translation file for ${code}:`, error);
    throw error;
  }
} 
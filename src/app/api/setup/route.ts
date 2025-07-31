import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';

export async function POST() {
  try {
    await dbConnect();

    // Check if admin user already exists
    const existingAdmin = await AdminUser.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json({ 
        message: 'Admin user already exists',
        email: existingAdmin.email 
      });
    }

    // Create default admin user
    const email = process.env.ADMIN_EMAIL || 'admin@bazoocam.live';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    
    const hashedPassword = await bcrypt.hash(password, 12);

    const adminUser = new AdminUser({
      email,
      passwordHash: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();

    return NextResponse.json({ 
      message: 'Admin user created successfully',
      email: adminUser.email
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
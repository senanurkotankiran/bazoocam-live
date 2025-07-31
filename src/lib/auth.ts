import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await dbConnect();
          
          // Check if AdminUser table is empty
          const userCount = await AdminUser.countDocuments();
          
          // If table is empty, allow default admin login
          if (userCount === 0) {
            const defaultEmail = 'admin@bazoocam.live';
            const defaultPassword = 'admin123';
            
            if (credentials.email.toLowerCase() === defaultEmail && 
                credentials.password === defaultPassword) {
              return {
                id: 'default-admin',
                email: defaultEmail,
                role: 'admin',
              };
            }
            return null;
          }
          
          // Normal authentication flow when users exist
          const user = await AdminUser.findOne({ 
            email: credentials.email.toLowerCase() 
          });

          if (!user) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password, 
            user.passwordHash
          );

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin-login',
  },
};
 
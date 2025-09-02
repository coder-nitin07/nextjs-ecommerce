import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: any) {
                await connectDB();

                const user = await User.findOne({ email: credentials.email });
                if (!user) {
                    throw new Error("Invalid email or password");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Invalid email or password");
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                (session.user as any).id = token.sub;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },

    pages: {
        signIn: "/auth/signin", // optional custom page
    },

    session: {
        strategy: "jwt",
    },

    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };








// data flow -
// 2. Session data flow (step by step)
//   Let’s trace what happens when a user logs in with email + password 👇

//     1. User submits login form → calls signIn("credentials", { email, password }).

//     2. NextAuth runs your CredentialsProvider → authorize()
//         - You connect to DB, check email, bcrypt password.
//         - If correct → return { id, name, email, role }.
//         - If wrong → throw error.

//     3. NextAuth creates a JWT → runs the jwt callback:
//         - Adds your custom fields into the token (e.g., token.role = user.role).
//         - Stored in a secure cookie in the browser.

//     4. Frontend calls useSession() or getSession()
//         - NextAuth takes the JWT from the cookie.
//         - Runs the session callback.
//         - Copies fields from token into session.user.

//     5. Frontend gets session data
//         const { data: session } = useSession();
//         console.log(session.user); 
//         // { id: "...", name: "...", email: "...", role: "User" }
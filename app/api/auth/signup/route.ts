import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

type SignupRequestBody = {
    name: string,
    email: string,
    password: string,
    role?: 'User' | 'Merchant' | 'Admin'
};

export async function POST(req: Request){
    try {
        await connectDB();

        const { name, email, password, role }: SignupRequestBody = await req.json();

        if(!name || !email || !password){
            return NextResponse.json(
                { message: 'Please filled all the fields' },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ email });
        if(existingUser){
            return NextResponse.json(
                { message: 'Email already exist' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "User"
        })

        const { password: _, ...newUser } = user.toObject();

        return NextResponse.json(
            { message: 'User Created Successfully', user: newUser },
            { status: 201 }
        );
    } catch (err) {
        console.log('Error in signup: ', err);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
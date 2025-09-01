import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";


type LoginRequestBody = {
    email: string,
    password: string
}

export async function POST(req: Request){
    try {
        await connectDB();

        const { email, password }: LoginRequestBody = await req.json();

        if(!email || !password){
            return NextResponse.json(
                { message: 'Please fill all the fields' },
                { status: 400 }
            )
        }

        const existingUser = await User.findOne({ email });
        if(!existingUser){
            return NextResponse.json(
                { message: 'Incorrect email or password' },
                { status: 400 }
            )
        }

        const comparePassword = await bcrypt.compare(password, existingUser.password);
        if(!comparePassword){
            return NextResponse.json(
                { message: 'Incorrect email or password' },
                { status: 400 }
            )
        }

        const { password: _password, ...userData } = existingUser.toObject();
        return NextResponse.json(
            { message: 'User login successfully', user: userData },
            { status: 200 }
        )
    } catch (err) {
        console.log('Error while login: ', err);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
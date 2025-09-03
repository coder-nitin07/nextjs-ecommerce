import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

type ProductRequestBody = {
    name: string,
    description: string,
    price: number,
    stock: number,
    images: string[],
    category: 'Shirts' | 'Pants' | 'Trousers' | 'Saree'
}

export async function POST(req: Request) {
    try {
        await connectDB();

        
        // Get the session from NextAuth
        const session = await getServerSession(authOptions);
        console.log("Session inside product API:", JSON.stringify(session, null, 2));
        if(!session || session.user.role !== 'Merchant'){
            return NextResponse.json(
                { message: 'Unauthorized: Only merchant can add products' },
                { status: 401 }
            )
        }

        const merchantId = session.user.id;

        const { name, description, price, stock, images, category }: ProductRequestBody = await req.json();

        if(!name || !description || !price || !stock || !category){
            return NextResponse.json(
                { message: 'Please fill all the fields' },
                { status: 400 }
            )
        }

        if(!images || images.length === 0){
            return NextResponse.json(
                { message: 'Please provide images of the Product' },
                { status: 400 }
            )
        }

        const product = await Product.create({
            name,
            description,
            price,
            stock,
            images,
            category,
            merchantId
        })

        return NextResponse.json(
            { message: 'Product Created Successfully', product: product },
            { status: 201 }
        )
    } catch (err) {
        console.log('Error while create product', err);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 })
    }
}
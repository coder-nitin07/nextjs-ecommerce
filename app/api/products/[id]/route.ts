import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import Product from "@/models/Product";

// Get Product By ID
export async function GET(
    req: Request,
    { params }: { params: { id: string } }  
){
    try {
        await connectDB();

        const { id } = params;
        
        const getProduct = await Product.findById(id);
        if(!getProduct){
            return NextResponse.json(
                { message: 'Product not found' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { message: 'Product Fetched Successfully', product: getProduct },
            { status: 200 }
        )
    } catch (err) {
        console.log('Error while Fetch Product by ID', err);
        return NextResponse.json({ message: 'Server Error' },  { status: 500 });
    }
}
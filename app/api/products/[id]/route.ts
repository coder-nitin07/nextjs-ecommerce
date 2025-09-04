import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import Product from "@/models/Product";
import mongoose from "mongoose";

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

// Update Product by ID
export async function PUT(
    req: Request,
    { params } : { params: { id: string } }  
){
    try {
        await connectDB();
        
        const { id } = await params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return NextResponse.json(
                { message: 'Invalid Product ID' },
                { status: 400 }
            )
        }

        const session = await getServerSession(authOptions);
        if(!session || session.user.role !== 'Merchant'){
            return NextResponse.json(
                { message: 'Unauthorized, you can not be update the product' },
                { status: 400 }
            )
        }

        const getProduct =  await Product.findById(id);
        if(!getProduct){
            return NextResponse.json(
                { message: 'Product not found' },
                { status: 404 }
            )
        }
        
        const { name, description, price, stock, images, category } = await req.json();
        const updates: Record<string, any> = {};
        if(typeof name === 'string') updates.name = name;
        if(typeof description === 'string') updates.description = description;

        if(typeof price === 'number'){
            if(price <= 0){
                return NextResponse.json({ message: 'Price should be above then 0' }, { status: 400 })
            }

            updates.price = price;
        }

        if(typeof stock === 'number'){
            if(stock <= 0){
                return NextResponse.json({ message: 'Stock should be above then 0' }, { status: 400 })
            }

            updates.stock = stock;
        }

        if(Array.isArray(images)) updates.images = images;
        if(typeof category === 'string') updates.category = category;

        

        const updatedProduct = await Product.findByIdAndUpdate(
            { _id: id, merchantId: new mongoose.Types.ObjectId(session.user.id) },
            updates,
            { new: true, runValidators: true }
        )

        if(!updatedProduct){
            return NextResponse.json(
                { message: 'Product not found' },
                { status: 404 }
            )
        }



        return NextResponse.json(
            { message: 'Update Product Successfully', product: updatedProduct },
            { status: 200 }
        )
    } catch (err) {
        console.log('Error while Update Product', err);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 })
    }
}
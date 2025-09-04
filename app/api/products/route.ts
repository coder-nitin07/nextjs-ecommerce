import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { getMerchantProducts } from "@/app/services/product/getMerchantProducts";
import cloudinary from "@/lib/cloudinary";
import mongoose from "mongoose";

// type ProductRequestBody = {
//     name: string,
//     description: string,
//     price: number,
//     stock: number,
//     images: string[],
//     category: 'Shirts' | 'Pants' | 'Trousers' | 'Saree'
// }

// Create Product API
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

        // const { name, description, price, stock, images, category }: ProductRequestBody = await req.json();

        // Get From Data
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = Number(formData.get('price'));
        const stock = Number(formData.get('stock'));
        const category = formData.get('category') as string;
        const imageFiles = formData.getAll('images') as File[];

        if(!name || !description || !price || !stock || !category){
            return NextResponse.json(
                { message: 'Please fill all the fields' },
                { status: 400 }
            )
        }

        if(!imageFiles || imageFiles.length === 0){
            return NextResponse.json(
                { message: 'Please provide images of the Product' },
                { status: 400 }
            )
        }

        // Upload Image to Cloudinary
        const uploadImages : string[] = [];
        for(const file of imageFiles){
            const buffer = Buffer.from(await file.arrayBuffer());
            const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

            const uploadRes = await cloudinary.uploader.upload(base64, {
                folder: "nextjs_ecommerce/products",
                resource_type: "image",
            });

            uploadImages.push({ url: uploadRes.secure_url, public_id: uploadRes.public_id});
        }

        const product = await Product.create({
            name,
            description,
            price,
            stock,
            images: uploadImages,
            category,
            merchantId: new mongoose.Types.ObjectId(merchantId)
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


// Get Products API
export async function GET(req: Request) {
    try {
        await connectDB();

        const url = new URL(req.url);
        const merchantOnly = url.searchParams.get('merchant') === 'true';
        let products;

        if(merchantOnly){
            
            return await getMerchantProducts();
        } else{
            products = await Product.find().sort({ createdAt: -1 });
        }
        
        if (!products || products.length === 0) {
            return NextResponse.json({ message: 'No Products Found' }, { status: 404 });
        }

        return NextResponse.json(
            { message: 'Product Fetched Successfully', products: products },
            { status: 200 }
        )
    } catch (err) {
        console.log('Error while fetch All products', err);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 })
    }   
}
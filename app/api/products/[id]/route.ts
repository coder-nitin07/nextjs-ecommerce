import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import Product from "@/models/Product";
import mongoose from "mongoose";
import cloudinary from "@/lib/cloudinary";

// Get Product By ID
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const { id } = params;

        const getProduct = await Product.findById(id);
        if (!getProduct) {
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
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}

// Update Product by ID
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: 'Invalid Product ID' },
                { status: 400 }
            )
        }

        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'Merchant') {
            return NextResponse.json(
                { message: 'Unauthorized, you can not be update the product' },
                { status: 400 }
            )
        }

        const getProduct = await Product.findById(id);
        if (!getProduct) {
            return NextResponse.json(
                { message: 'Product not found' },
                { status: 404 }
            )
        }

        // const { name, description, price, stock, category } = await req.json();
        // const updates: Record<string, any> = {};
        // if (typeof name === 'string') updates.name = name;
        // if (typeof description === 'string') updates.description = description;

        // if (typeof price === 'number') {
        //     if (price <= 0) {
        //         return NextResponse.json({ message: 'Price should be above then 0' }, { status: 400 })
        //     }

        //     updates.price = price;
        // }

        // if (typeof stock === 'number') {
        //     if (stock <= 0) {
        //         return NextResponse.json({ message: 'Stock should be above then 0' }, { status: 400 })
        //     }

        //     updates.stock = stock;
        // }

        // if (typeof category === 'string') updates.category = category;
        

        const formData = await req.formData();
        const updates: Record<string, any> = {};

        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = Number(formData.get('price'));
        const stock = Number(formData.get('stock'));
        const category = formData.get('category') as string;

        if(name) updates.name = name;
        if (description) updates.description = description;
        if (price && price > 0) updates.price = price;
        if (stock && stock > 0) updates.stock = stock;
        if (category) updates.category = category;


        // Handle Images
        const newImageFiles = formData.getAll('images') as File[];
        let uploadedImages = getProduct.images;

        if(newImageFiles.length > 0){
            // Delete Old Image
            for(const img of getProduct.images){
                await cloudinary.uploader.destroy(img.public_id);
            }

            uploadedImages = [];
            for(const file of newImageFiles){
                const buffer = Buffer.from(await file.arrayBuffer());
                const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

                const uploadRes = await cloudinary.uploader.upload(base64, {
                folder: "nextjs_ecommerce/products",
                });

                uploadedImages.push({ url: uploadRes.secure_url, public_id: uploadRes.public_id });
            }
        }


        const updatedProduct = await Product.findByIdAndUpdate(
            { _id: id, merchantId: new mongoose.Types.ObjectId(session.user.id) },
             {
                ...updates,
                images: uploadedImages,
            },
            { new: true, runValidators: true }
        )

        if (!updatedProduct) {
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

// Delete Product by ID
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: 'Invalid Product ID' },
                { status: 400 }
            )
        }

        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'Merchant' && session.user.role !== 'Admin') {
            return NextResponse.json(
                { message: 'Unauthorized, you can not be delete the product' },
                { status: 400 }
            )
        } 

        const getProduct = await Product.findById(id);
        if (!getProduct) {
            return NextResponse.json(
                { message: 'Product not found' },
                { status: 400 }
            )
        }

        let deletedProduct;
        
        if(session.user.role === 'Merchant'){
            deletedProduct = await Product.findOneAndDelete(
                { 
                    _id: id, 
                    merchantId: new mongoose.Types.ObjectId(session.user.id) 
                }
            ) 
        } else if(session.user.role === 'Admin'){
            deletedProduct = await Product.findByIdAndDelete(id);
        }

        if (!deletedProduct) {
            return NextResponse.json(
                { message: "Product not found or not owned by merchant" },
                { status: 404 }
            );
        }

         // Destroy images from Cloudinary
        if (deletedProduct.images && deletedProduct.images.length > 0) {
            for (const img of deletedProduct.images) {
                await cloudinary.uploader.destroy(img.public_id);
            }
        }

        return NextResponse.json(
            { message: 'Product Deleted Successfully', product: deletedProduct },
            { status: 200 }
        )
    } catch (err) {
        console.log('Error while deleting Product', err);
        return NextResponse.json(
            { message: 'Server Error' },
            { status: 500 }
        )
    }
}
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const getMerchantProducts = async () => {

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Merchant") {
        return NextResponse.json(
            { message: "Unauthorized: Only merchants can view their products" },
            { status: 401 }
        );
    }

    const merchantId = new mongoose.Types.ObjectId(session.user.id);

    const products = await Product.find({ merchantId }).sort({ createdAt: -1 });

    if (!products || products.length === 0) {
        return NextResponse.json({ message: "No Products Found" }, { status: 404 });
    }

    return NextResponse.json(
        { message: "Merchant products fetched successfully", products },
        { status: 200 }
    );
};
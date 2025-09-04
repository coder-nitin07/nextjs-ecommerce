import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICart extends Document{
    userId: mongoose.Types.ObjectId,
    products: {
        productId: mongoose.Types.ObjectId;
        price: number;
        image: string;
        quantity: number;
    }[]
}

const CartSchema : Schema<ICart> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
        products: [
            {
                productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product'  },
                price: { type: Number, required: true },
                image: { type: String, required: true },
                quantity: { type: Number, required: true, default: 1 }
            }
        ]
    },
    { timestamps: true }
);

const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
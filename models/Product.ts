import mongoose, { Document, Model, Schema } from "mongoose"

export interface IProduct extends Document{
    name: string,
    description: string,
    price: number,
    stock: number,
    images: string[],
    category: 'Shirts' | 'Pants' | 'Trousers' | 'Saree',
    merchantId:  mongoose.Types.ObjectId
}

const productSchema : Schema<IProduct> = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true  },
        stock: { type: Number, required: true  },
        images: [{ type: String, required: true  }],
        category: { type: String, enum: [ 'Shirts', 'Pants', 'Trousers', 'Saree' ] ,required: true  },
        merchantId: { type: Schema.Types.ObjectId, required: true, ref: 'User'  }
    },
    { timestamps: true }
);

const Product : Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);

export default Product;
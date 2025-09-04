import Product, { IProduct } from "@/models/Product";
import { FilterQuery, SortOrder } from "mongoose";

type QueryOptions = {
    page?: number;
    limit?: number;
    search?: string;
  sort?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
};

export async function getFilteredProducts(query: QueryOptions) {
    const filter: FilterQuery<IProduct> = {};

    // search
    if(query.search){
        filter.$or = [
            { name: { $regex: query.search, $options: "i" } },
            { description: { $regex: query.search, $options: "i" } },
        ];
    }

    // Category filder
    if(query.category){
        filter.category = query.category
    };

    
    
    // Price range
    if(query.minPrice !== undefined || query.maxPrice !== undefined){
        filter.price = {};


        if(query.minPrice !== undefined) filter.price.$gte = query.minPrice;
        if(query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
    }


    // Stock availabilty
    if(query.inStock === true){
        filter.stock = { $gt: 0 }
    }


    // Sorting
    let sort: Record<string, SortOrder> = { createdAt: -1 }; // default newSet
    if(query.sort === 'price_asc') sort = { price: 1 };
    if(query.sort === 'price_desc') sort = { price: -1 };
    if(query.sort === 'newest') sort = { createdAt: -1 };


    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
                                    .sort(sort)
                                    .skip(skip)
                                    .limit(limit);



    const total = await Product.countDocuments(filter);

    return {
        products,
        pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
        }
    }
}
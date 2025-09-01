import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document{
    name: string,
    email: string,
    password: string,
    role: 'User' | 'Merchant' | 'Admin',
    createdAt: Date
}

const userSchema : Schema<IUser> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, enum: [ 'User', 'Merchant', 'Admin' ], default: 'User' },
    },
    { timestamps: true }
);

const User : Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
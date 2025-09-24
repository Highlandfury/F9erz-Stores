import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _Id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    imageURL: { type: String, required: true },
    cartItems: { type: Object, default: {} },
/*    isSeller: { type: Boolean, default: false },
    address: { type: String, default: "" },
    phone: { type: String, default: "" }, */
}, { minimize: false })

const User = mongoose.models.user || mongoose.model("User", userSchema)

export default User;
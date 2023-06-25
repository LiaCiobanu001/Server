import mongoose from "mongoose";

//creare colectie user
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, required: true },
    allCars: [{ type: mongoose.Schema.Types.ObjectId, ref: "Car" }],
});

const userModel = mongoose.model("User", UserSchema);

export default userModel;

import mongoose from "mongoose";

//creare colectie masina
const CarSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    carType: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    photo: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const carModel = mongoose.model("Car", CarSchema);

export default carModel;

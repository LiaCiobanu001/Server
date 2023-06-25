import Car from "../mongodb/models/car.js";
import User from "../mongodb/models/user.js";

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//functia pt cautarea tuturor masinilor
const getAllCars = async (req, res) => {
    const {
        _end,
        _order,
        _start,
        _sort,
        title_like = "",
        carType = "",
    } = req.query;

    const query = {};

    if (carType !== "") {
        query.carType = carType;
    }

    if (title_like) {
        query.title = { $regex: title_like, $options: "i" };
    }

    try {
        const count = await Car.countDocuments({ query });

        const cars = await Car.find(query)
            .limit(_end)
            .skip(_start)
            .sort({ [_sort]: _order });

        res.header("x-total-count", count);
        res.header("Access-Control-Expose-Headers", "x-total-count");

        res.status(200).json(cars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// functia pt afisarea detaliilor masinilor
const getCarDetail = async (req, res) => {
    const { id } = req.params;
    const carExists = await Car.findOne({ _id: id }).populate(
        "creator",
    );

    if (carExists) {
        res.status(200).json(carExists);
    } else {
        res.status(404).json({ message: "Car not found" });
    }
};

//functia pentru crearea masinii
const createCar = async (req, res) => {
    try {
        const {
            title,
            description,
            carType,
            location,
            price,
            photo,
            email,
        } = req.body;

        const session = await mongoose.startSession();
        session.startTransaction();

        const user = await User.findOne({ email }).session(session);

        if (!user) throw new Error("User not found");

        const photoUrl = await cloudinary.uploader.upload(photo);

        const newCar = await Car.create({
            title,
            description,
            carType,
            location,
            price,
            photo: photoUrl.url,
            creator: user._id,
        });

        user.allCars.push(newCar._id);
        await user.save({ session });

        await session.commitTransaction();

        res.status(200).json({ message: "Car created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//functie pentru update masina
const updateCar = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, carType, location, price, photo } =
            req.body;

        const photoUrl = await cloudinary.uploader.upload(photo);

        await Car.findByIdAndUpdate(
            { _id: id },
            {
                title,
                description,
                carType,
                location,
                price,
                photo: photoUrl.url || photo,
            },
        );

        res.status(200).json({ message: "Cae updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//functia pentru stergerea masinii
const deleteCar = async (req, res) => {
    try {
        const { id } = req.params;

        const carToDelete = await Car.findById({ _id: id }).populate(
            "creator",
        );

        if (!carToDelete) throw new Error("Car not found");

        const session = await mongoose.startSession();
        session.startTransaction();

        carToDelete.remove({ session });
        carToDelete.creator.allCars.pull(carToDelete);

        await carToDelete.creator.save({ session });
        await session.commitTransaction();

        res.status(200).json({ message: "Car deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    getAllCars,
    getCarDetail,
    createCar,
    updateCar,
    deleteCar,
};

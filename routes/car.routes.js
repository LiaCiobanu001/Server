import express from "express";

import {
    createCar,
    deleteCar,
    getAllCars,
    getCarDetail,
    updateCar,
} from "../controllers/car.controller.js";

const router = express.Router();

// crearea rutelor pentru toate functiile aferente masinilor
router.route("/").get(getAllCars);
router.route("/:id").get(getCarDetail);
router.route("/").post(createCar);
router.route("/:id").patch(updateCar);
router.route("/:id").delete(deleteCar);

export default router;

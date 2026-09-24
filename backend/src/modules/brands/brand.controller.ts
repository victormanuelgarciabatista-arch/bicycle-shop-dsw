import { Request, Response, NextFunction } from "express";
import { BrandService } from "./brand.service";

export class BrandController {

    static async getAll(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const Brands = await BrandService.findAll();

            res.json(Brands);
        } catch (error) {
            next(error);
        }
    }


    static async getById(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const id = Number(req.params.id);

            const Brand = await BrandService.findById(id);

            if (!Brand) {
                res.status(404).json({
                    message: "Marca no encontrada",
                });

                return;
            }

            res.json(Brand);

        } catch (error) {
            next(error);
        }
    }


    static async create(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { name } = req.body;

            if (!name) {
                res.status(400).json({
                    message: "nombre es obligatorio",
                });

                return;
            }

            const Brand = await BrandService.create({
                name,
            });

            res.status(201).json(Brand);

        } catch (error) {
            next(error);
        }
    }

    static async update(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const id = Number(req.params.id);

            const Brand = await BrandService.findById(id);

            if (!Brand) {
                res.status(404).json({
                    message: "Marca no encontrada",
                });

                return;
            }

            const updatedBrand = await BrandService.update(
                Brand,
                req.body
            );

            res.json(updatedBrand);

        } catch (error) {
            next(error);
        }
    }


    static async delete(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const id = Number(req.params.id);

            const Brand = await BrandService.findById(id);

            if (!Brand) {
                res.status(404).json({
                    message: "Marca no encontrada",
                });

                return;
            }

            await BrandService.delete(Brand);

            res.status(204).send();

        } catch (error) {
            next(error);
        }
    }
}
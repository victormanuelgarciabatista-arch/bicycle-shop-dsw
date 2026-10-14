import { Request, Response, NextFunction } from "express";
import { ModelService } from "./model.service";

export class ModelController {

    static async getAll(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const Models = await ModelService.findAll();

            res.json(Models);
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

            const Model = await ModelService.findById(id);

            if (!Model) {
                res.status(404).json({
                    message: "Model not found",
                });

                return;
            }

            res.json(Model);

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
                    message: "name is required",
                });

                return;
            }

            const Model = await ModelService.create({
                name,
            });

            res.status(201).json(Model);

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

            const Model = await ModelService.findById(id);

            if (!Model) {
                res.status(404).json({
                    message: "Model not found",
                });

                return;
            }

            const updatedModel = await ModelService.update(
                Model,
                req.body
            );

            res.json(updatedModel);

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

            const Model = await ModelService.findById(id);

            if (!Model) {
                res.status(404).json({
                    message: "Model not found",
                });

                return;
            }

            await ModelService.delete(Model);

            res.status(204).send();

        } catch (error) {
            next(error);
        }
    }
}
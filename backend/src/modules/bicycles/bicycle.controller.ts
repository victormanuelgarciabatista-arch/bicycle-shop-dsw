import { Request, Response, NextFunction } from "express";
import { BicycleService } from "./bicycle.service";

export class BicycleController {

  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const bicycles = await BicycleService.findAll();

      res.json(bicycles);
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

      const bicycle = await BicycleService.findById(id);

      if (!bicycle) {
        res.status(404).json({
          message: "Bicicleta no encontrada",
        });

        return;
      }

      res.json(bicycle);

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
      const { brandId, model, description, price, stock } = req.body;

      if (!brandId || !model || price === undefined) {
        res.status(400).json({
          message: "brandId, model y price son obligatorios",
        });

        return;
      }

      const bicycle = await BicycleService.create({
        brandId,
        model,
        description,
        price,
        stock,
      });

      res.status(201).json(bicycle);

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

      const bicycle = await BicycleService.findById(id);

      if (!bicycle) {
        res.status(404).json({
          message: "Bicicleta no encontrada",
        });

        return;
      }

      const updatedBicycle = await BicycleService.update(
        bicycle,
        req.body
      );

      res.json(updatedBicycle);

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

      const bicycle = await BicycleService.findById(id);

      if (!bicycle) {
        res.status(404).json({
          message: "Bicicleta no encontrada",
        });

        return;
      }

      await BicycleService.delete(bicycle);

      res.status(204).send();

    } catch (error) {
      next(error);
    }
  }
}
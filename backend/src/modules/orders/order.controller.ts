import { Request, Response, NextFunction } from "express";
import { OrderService } from "./order.service";

export class OrderController {

    static async getAll(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const Orders = await OrderService.findAll();

            res.json(Orders);
        } catch (error) {
            next(error);
        }
    }

    static async getByCustomerId(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const customerId = Number(req.params.id);
            const Orders = await OrderService.findByCustomerId(customerId);

            res.json(Orders);
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

            const Order = await OrderService.findById(id);

            if (!Order) {
                res.status(404).json({
                    message: "Order not found",
                });

                return;
            }

            res.json(Order);

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
            const { customerId, orderDate, status } = req.body;

            if (!customerId || !orderDate || !status) {
                res.status(400).json({
                    message: "customerId, orderDate, and status are required",
                });

                return;
            }

            const Order = await OrderService.create({
                customerId: customerId,
                orderDate: orderDate,
                status: status,
            });

            res.status(201).json(Order);

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

            const Order = await OrderService.findById(id);

            if (!Order) {
                res.status(404).json({
                    message: "Order not found",
                });

                return;
            }

            const updatedOrder = await OrderService.update(
                Order,
                req.body
            );

            res.json(updatedOrder);

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

            const Order = await OrderService.findById(id);

            if (!Order) {
                res.status(404).json({
                    message: "Order not found",
                });

                return;
            }

            await OrderService.delete(Order);

            res.status(204).send();

        } catch (error) {
            next(error);
        }
    }
}
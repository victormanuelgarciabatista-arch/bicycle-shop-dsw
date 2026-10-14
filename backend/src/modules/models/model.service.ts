import { Model } from "./model.model";

export class ModelService {

    static async findAll() {
        return Model.findAll({
            order: [["id", "ASC"]],
        });
    }

    static async findById(id: number) {
        return Model.findByPk(id);
    }

    static async create(data: {
        name: string;

    }) {
        return Model.create(data);
    }


    static async update(
        Model: Model,
        data: {
            name?: string;

        }
    ) {
        return Model.update(data);
    }


    static async delete(Model: Model) {
        await Model.destroy();
    }
}
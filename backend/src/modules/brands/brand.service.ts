import { Brand } from "./brand.model";

export class BrandService {

    static async findAll() {
        return Brand.findAll({
            order: [["id", "ASC"]],
        });
    }

    static async findById(id: number) {
        return Brand.findByPk(id);
    }

    static async create(data: {
        name: string;

    }) {
        return Brand.create(data);
    }


    static async update(
        Brand: Brand,
        data: {
            name?: string;

        }
    ) {
        return Brand.update(data);
    }


    static async delete(Brand: Brand) {
        await Brand.destroy();
    }
}
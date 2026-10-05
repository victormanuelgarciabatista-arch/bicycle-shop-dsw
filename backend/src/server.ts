import { app } from "./app";
import { sequelize } from "./config/database";
import { env } from "./config/env";
import { defineAssociations } from "./models/associations";

// Importamos los modelos para que Sequelize los registre.
import "./modules/bicycles/bicycle.model";
import "./modules/brands/brand.model";
import "./modules/bicycle-details/bicycle-detail.model";
import "./modules/customers/customer.model";
import "./modules/orders/order.model";


async function startServer() {
  try {

    await defineAssociations();

    await sequelize.authenticate();

    console.log("Conexión con MySQL establecida.");

    // Definimos las asociaciones entre los modelos.
    //await sequelize.sync();

    await sequelize.sync({ force: true }).then(() => {
      console.log("Models synchronized.");
    });

    app.listen(env.PORT, () => {
      console.log(
        `Server working in http://localhost:${env.PORT}`
      );
    });

  } catch (error) {

    console.error(
      "The application could not be started.:",
      error
    );

    process.exit(1);
  }
}

startServer();
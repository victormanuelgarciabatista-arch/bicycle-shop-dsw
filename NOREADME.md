# GUÍA DE SUPERVIVENCIA — EXAMEN BICYCLE SHOP (Sequelize + Bruno)

> **Para mañana:** lee primero [«¿Qué me están pidiendo?»](#1-traducir-el-enunciado-sin-bloquearte), luego ve al apartado que necesites. Esta guía está hecha para **tu backend real**, no para un proyecto inventado. **Ejemplo nuevo de entrenamiento: `Category` con `description` que admite `NULL`.** No sabemos qué entidad elegirá el profesor.
>
> **ATENCIÓN:** esto es una guía de patrones, no una garantía de que todos los posibles ejercicios sean iguales. Antes de copiar, comprueba nombres de columnas, alias y el ERD entregado en el examen.

## ÍNDICE — HAZ CLIC EN TU DUDA

### Estoy bloqueado, ¿por dónde empiezo?
- [1. Traducir el enunciado: ¿qué archivos toco?](#1-traducir-el-enunciado-sin-bloquearte)
- [2. Mapa de mi proyecto: qué hace cada archivo](#2-mapa-real-del-proyecto)
- [3. Las 5 palabras de Sequelize que debes entender](#3-las-cinco-palabras-clave)

### Me piden crear una entidad nueva y un CRUD
- [4. Crear Category con name y description NULL](#4-entidad-nueva-category-con-un-campo-null)
- [5. CRUD completo: service](#5-crud-service)
- [6. CRUD completo: controller](#6-crud-controller)
- [7. CRUD completo: routes y registro](#7-crud-routes-y-registro)
- [8. Bruno desde cero: GET, POST, PUT, DELETE](#8-bruno-desde-cero)
- [9. Qué significa NULL y cómo probarlo](#9-null-sin-confusiones)

### Me dan un dibujo con patas de gallo
- [10. Leer el ERD: círculo, palito y pata de gallo](#10-leer-el-diagrama-erd)
- [11. Relación 1:N — Category y Bicycle](#11-relacion-uno-a-muchos)
- [12. Relación 1:1](#12-relacion-uno-a-uno)
- [13. Relación N:M — tabla intermedia](#13-relacion-muchos-a-muchos)

### Me piden consultas
- [14. Receta universal: service → controller → route → Bruno](#14-receta-universal-de-consultas)
- [15. Consultas de una tabla: findAll, findByPk, where](#15-consultas-sin-relaciones)
- [16. Operadores: mayor, menor, igual, entre, LIKE, NULL, AND y OR](#16-diccionario-de-operadores)
- [17. Consultas con una relación: include](#17-include-de-una-relacion)
- [18. Dos relaciones a la vez](#18-dos-includes-al-mismo-nivel)
- [19. Relaciones dentro de relaciones: include anidado](#19-include-anidado)
- [20. Filtros en una tabla relacionada y required](#20-filtrar-en-tablas-relacionadas)
- [21. Buscar por URL: req.params y req.query](#21-parametros-de-consulta)
- [22. Recetario: 14 tipos de consultas de examen](#22-recetario-rapido-de-consultas)

### Me piden lo del preexamen
- [23. Ejercicio 2: bicicletas con Brand y Model](#23-preexamen-bicicletas-con-marca-y-modelo)
- [24. Ejercicio 3: bicicletas con precio > 100](#24-preexamen-precio-mayor-que-100)
- [25. Ejercicio 4: pedidos, precio < 100 y peso > 20](#25-preexamen-pedidos-precio-y-peso)

### Me piden una entidad de ENVÍOS (Shipment)
- [30. Entender la entidad Shipment y su relación con Order](#30-envios-que-es-shipment-y-como-se-relaciona)
- [31. Crear Shipment con trackingNumber que admite NULL](#31-envios-modelo-con-null)
- [32. CRUD completo de Shipment: service, controller y routes](#32-envios-crud-completo)
- [33. Registrar Shipment y probar todo en Bruno](#33-envios-registro-y-pruebas-en-bruno)
- [34. Consultas de envíos: de fácil a difícil](#34-envios-consultas-resueltas)
- [35. Cambiar la relación 1:N por 1:1 si el ERD lo exige](#35-envios-si-el-profesor-dibuja-otra-relacion)
- [36. Mini examen de envíos y checklist](#36-envios-mini-examen)
- [37. ENUM y NULL explicados desde cero (sin confundirlos)](#37-envios-enum-y-null-desde-cero)
- [38. Consultas de examen combinando ENUM, NULL y relaciones](#38-consultas-enum-null-y-relaciones)
- [39. Bruno: pruebas buenas y errores con ENUM y NULL](#39-bruno-pruebas-de-enum-y-null)

### Antes de entregar
- [26. Errores típicos y cómo solucionarlos](#26-errores-tipicos)
- [27. Git: rama pre-examen](#27-git-y-entrega)
- [28. Simulacro de práctica y soluciones](#28-simulacro-para-practicar)
- [29. Checklist final de 60 segundos](#29-checklist-final)

---

## 1. Traducir el enunciado sin bloquearte

**Paso 1: subraya el verbo.**

| El profesor dice… | Significa… | Qué modifico |
|---|---|---|
| «Crea una entidad y CRUD» | Nueva tabla + cinco operaciones | model, service, controller, routes, registro |
| «Relaciona A con B» | Crear asociación y quizá clave foránea | models + `associations.ts` |
| «Devuelve todas las…» | `findAll()` | service + controller + route |
| «Devuelve una por id» | `findByPk(id)` | service + controller + route |
| «Con su marca / modelo / cliente» | `include` | service + controller + route; verificar asociación |
| «Precio mayor que 100» | `where` + `Op.gt` | service + controller + route |
| «Pedidos que incluyan bicicletas…» | Empieza en `Order` y usa `include` | order.service + controller + routes |
| «… y cuyo peso…» | Otro filtro, posiblemente otro `include` | mirar **dónde está weight** |
| «Admite NULL» | El campo no es obligatorio | `allowNull: true` + tipo `| null` |

**Paso 2: encuentra la entidad que debe devolverse.** «Devuelve pedidos» → `Order.findAll()`. «Devuelve bicicletas» → `Bicycle.findAll()`.

**Paso 3: localiza cada atributo en su tabla.** En TU proyecto: `Bicycle.price`, `Bicycle.brandId`, `Bicycle.model` (texto actualmente); `BicycleDetail.weight`; `Order` representa pedidos.

**Paso 4: dibuja el camino:** `Order → Bicycle → BicycleDetail`. Cada flecha suele convertirse en un `include`.

## 2. Mapa real del proyecto

Tu backend está en `backend/src/`:

```text
src/
  modules/
    brands/brand.model.ts
    brands/brand.service.ts
    brands/brand.controller.ts
    brands/brand.routes.ts
    bicycles/bicycle.*.ts
    bicycle-details/bicycle-detail.*.ts
    orders/order.*.ts
    order-items/order-item.*.ts
    customers/customer.*.ts
  models/associations.ts
  routes/index.ts
  server.ts
  app.ts
```

**Piensa en una tienda:**

- **model:** define cómo es la ficha de datos / tabla.
- **associations:** indica cómo se conectan las fichas.
- **service:** consulta o modifica datos con Sequelize.
- **controller:** lee la petición HTTP y responde JSON.
- **routes:** asigna una URL a un controller.
- **routes/index.ts:** registra módulos nuevos.
- **server.ts:** importa modelos, conecta y sincroniza.
- **Bruno:** cliente para probar las URLs.

**Truco:** una **consulta nueva de un módulo existente** normalmente necesita solo **service + controller + route**. Una **entidad nueva** necesita también **model + asociaciones si procede + registro de módulo/modelo**.

## 3. Las cinco palabras clave

```ts
return Bicycle.findAll({
  where: { price: { [Op.gt]: 100 } },
  include: [{ model: Brand, as: 'brand' }],
  order: [['id', 'ASC']]
});
```

- `findAll`: «dame una lista».
- `where`: «pero solo los que cumplan…».
- `Op.gt`: «mayor que».
- `include`: «añade los datos de otra entidad».
- `as`: «nombre exacto de la relación en `associations.ts`».

`order` solo ordena; no filtra. `required: true` dentro de `include` exige coincidencia en la tabla relacionada.

---

## 4. Entidad nueva: Category con un campo NULL

**Ejemplo de entrenamiento (no confirmado por el profesor):** `Category` con `id`, `name` obligatorio y `description` opcional. Una categoría agrupa bicicletas. Usamos el patrón real de tu `Brand` (Sequelize v6 + TypeScript).

**Crear carpeta** `src/modules/categories/`. Primer archivo: `category.model.ts`:

```ts
import {
  Model, DataTypes, InferAttributes,
  InferCreationAttributes, CreationOptional
} from 'sequelize';
import { sequelize } from '../../config/database';

export class Category extends Model<
  InferAttributes<Category>,
  InferCreationAttributes<Category>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  // CreationOptional permite omitir el campo al crear;
  // null permite guardarlo explícitamente como NULL.
  declare description: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Category.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
}, {
  sequelize,
  tableName: 'categories',
  timestamps: true
});
```

**Explicación línea a línea de lo importante:**

- `Category extends Model`: Category será un modelo de Sequelize.
- `id`: número que se crea solo (`autoIncrement`).
- `name`: texto **obligatorio** (`allowNull: false`).
- `description`: texto o `null` (`string | null`).
- `CreationOptional`: al crear una categoría, puedes omitir `description`.
- `defaultValue: null`: si omites la descripción, el valor predeterminado será `null`.
- `tableName: 'categories'`: nombre de tabla.

**¡No confundas!** `allowNull: true` significa «puede ser NULL», **no** «siempre debe ser NULL». Si el profesor exige literalmente que **siempre** sea NULL, eso es una regla distinta que necesita validación/restricción adicional.

## 5. CRUD: service

Archivo `src/modules/categories/category.service.ts`. Este archivo **habla con la base de datos**:

```ts
import { Category } from './category.model';

export class CategoryService {
  static async findAll() {
    return Category.findAll({ order: [['id', 'ASC']] });
  }

  static async findById(id: number) {
    return Category.findByPk(id);
  }

  static async create(data: { name: string; description?: string | null }) {
    return Category.create(data);
  }

  static async update(
    category: Category,
    data: { name?: string; description?: string | null }
  ) {
    return category.update(data);
  }

  static async delete(category: Category) {
    await category.destroy();
  }
}
```

**Memoriza estas cinco operaciones:**

| Acción | Sequelize |
|---|---|
| Listar | `Category.findAll()` |
| Uno | `Category.findByPk(id)` |
| Crear | `Category.create(data)` |
| Actualizar | `category.update(data)` |
| Eliminar | `category.destroy()` |

## 6. CRUD: controller

Archivo `src/modules/categories/category.controller.ts`. Este archivo **recibe y responde**:

```ts
import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service';

export class CategoryController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await CategoryService.findAll());
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ message: 'ID no válido' }); return;
      }
      const category = await CategoryService.findById(id);
      if (!category) {
        res.status(404).json({ message: 'Categoría no encontrada' }); return;
      }
      res.json(category);
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      if (typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ message: 'name obligatorio' }); return;
      }
      if (description !== undefined && description !== null &&
          typeof description !== 'string') {
        res.status(400).json({ message: 'description debe ser texto o null' }); return;
      }
      const category = await CategoryService.create({
        name,
        description: description ?? null
      });
      res.status(201).json(category);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ message: 'ID no válido' }); return;
      }
      const category = await CategoryService.findById(id);
      if (!category) {
        res.status(404).json({ message: 'Categoría no encontrada' }); return;
      }
      const { name, description } = req.body;
      if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
        res.status(400).json({ message: 'name no válido' }); return;
      }
      if (description !== undefined && description !== null &&
          typeof description !== 'string') {
        res.status(400).json({ message: 'description no válido' }); return;
      }
      const updated = await CategoryService.update(category, {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {})
      });
      res.json(updated);
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ message: 'ID no válido' }); return;
      }
      const category = await CategoryService.findById(id);
      if (!category) {
        res.status(404).json({ message: 'Categoría no encontrada' }); return;
      }
      await CategoryService.delete(category);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
```

**Fíjate:** `req.params.id` viene de la URL; `req.body` viene del JSON enviado desde Bruno; `res.json()` devuelve JSON; `next(error)` pasa el fallo al manejador de errores.

## 7. CRUD: routes y registro

Archivo `src/modules/categories/category.routes.ts`:

```ts
import { Router } from 'express';
import { CategoryController } from './category.controller';
const router = Router();
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post('/', CategoryController.create);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.delete);
export default router;
```

**Registrar rutas en `src/routes/index.ts`** (sin borrar las existentes):

```ts
import categoryRoutes from '../modules/categories/category.routes';
// dentro de las declaraciones router.use:
router.use('/categories', categoryRoutes);
```

**Registrar el modelo en `src/server.ts`**, junto a los otros imports de modelos:

```ts
import './modules/categories/category.model';
```

**Si también creas relación Category–Bicycle:** ve a [11](#11-relacion-uno-a-muchos) y registra asociaciones **antes** de sincronizar. `app.ts` ya monta `/api`; no necesitas volver a montar las rutas allí.

## 8. Bruno desde cero

1. Arranca MySQL y el backend desde la carpeta `backend`: `npm install` (si hace falta) y `npm run dev`.
2. Abre **Bruno** y crea/abre una colección.
3. Crea una petición nueva; elige método (`GET`, `POST`, `PUT`, `DELETE`).
4. Introduce URL. Si tu servidor usa puerto 3000: `http://localhost:3000/api/categories`.
5. Para `POST` y `PUT`, abre **Body → JSON** y envía el objeto.
6. Pulsa **Send** y observa el **status** y el **JSON**.

| Prueba | Método | URL | Body | Esperado |
|---|---|---|---|---|
| Crear | POST | `/api/categories` | `{"name":"Montaña","description":null}` | 201 + categoría |
| Listar | GET | `/api/categories` | ninguno | 200 + lista |
| Buscar | GET | `/api/categories/1` | ninguno | 200 + objeto, o 404 |
| Editar | PUT | `/api/categories/1` | `{"description":"Bicis MTB"}` | 200 + objeto |
| Eliminar | DELETE | `/api/categories/1` | ninguno | 204 |

**IMPORTANTE:** el ID real puede no ser 1; cópialo de la respuesta al crear. Si aparece `Cannot GET`, revisa URL, ruta y registro. Si aparece `[]`, la petición puede funcionar pero no haber datos.

## 9. NULL sin confusiones

| Concepto | Qué quiere decir | Ejemplo |
|---|---|---|
| `allowNull: false` | Campo obligatorio en BD | `name` |
| `allowNull: true` | Se permite `NULL` | `description` |
| `string \| null` | Tipo TS admite texto o `null` | `declare description: ...` |
| `CreationOptional` | Se puede omitir al llamar a `create` | `description` con default |
| `defaultValue: null` | Si no envías valor, se usa `null` | descripción omitida |
| `where: { description: null }` | Buscar filas con `NULL` | categorías sin descripción |
| `[Op.ne]: null` | Buscar filas que **no** son `NULL` | categorías con descripción |

**Prueba A en Bruno:** `{"name":"Ciudad","description":null}`. **Prueba B:** `{"name":"Carretera","description":"Ligeras"}`. **Prueba C:** `{"name":"Paseo"}`. Con el modelo y controller de esta guía, las tres son válidas.

**Un `NULL` en un atributo NO significa que la relación sea opcional.** La opcionalidad de una relación depende de la clave foránea y de lo que diga el ERD.

---

## 10. Leer el diagrama ERD

En notación «pata de gallo», **lee los símbolos de cada extremo**:

| Símbolo al extremo | Lectura | Cantidad |
|---|---|---|
| `o|` | cero o uno | 0..1 |
| `||` | exactamente uno | 1..1 |
| `o<` | cero o muchos | 0..N |
| `|<` | uno o muchos | 1..N |

`o` = cero permitido; `|` = uno; `<` = muchos (pata de gallo). Los símbolos indican **mínimo y máximo**, no nombres de funciones de Sequelize. **Lee los dos extremos** para decidir 1:1, 1:N o N:M.

**Ejemplo:** una marca tiene muchas bicicletas, cada bicicleta tiene una marca → `Brand.hasMany(Bicycle)` y `Bicycle.belongsTo(Brand)`.

**Ojo:** que el dibujo ponga **uno o muchos** no garantiza por sí solo que la BD impida tener cero hijos; Sequelize `hasMany` no aplica automáticamente ese mínimo. Es una regla del negocio que puede necesitar comprobaciones adicionales.

## 11. Relación uno a muchos

**Suposición para practicar:** una Category puede agrupar muchas Bicycle y cada Bicycle tiene una Category.

**Paso A — añadir `categoryId` en `src/modules/bicycles/bicycle.model.ts`**:

En la clase:

```ts
declare categoryId: number; // si la categoría es obligatoria
```

Dentro de `Bicycle.init({ ... })`:

```ts
categoryId: {
  type: DataTypes.INTEGER.UNSIGNED,
  allowNull: false,
  references: { model: 'categories', key: 'id' }
},
```

**Paso B — `src/models/associations.ts`:** importa `Category` arriba y añade dentro de `defineAssociations()`:

```ts
Category.hasMany(Bicycle, { foreignKey: 'categoryId', as: 'bicycles' });
Bicycle.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
```

**Paso C — consulta desde Bicycle:**

```ts
return Bicycle.findAll({
  include: [{ model: Category, as: 'category' }]
});
```

**Paso D — consulta desde Category:**

```ts
return Category.findAll({
  include: [{ model: Bicycle, as: 'bicycles' }]
});
```

**Si el ERD dice que una bicicleta puede NO tener categoría**, `categoryId` debe poder ser `null` (`declare categoryId: number | null` y `allowNull: true`). Esto **no** tiene nada que ver con `Category.description`.

## 12. Relación uno a uno

Ya existe en tu proyecto: una bicicleta tiene una ficha técnica `BicycleDetail`.

```ts
Bicycle.hasOne(BicycleDetail, {
  foreignKey: 'bicycleId', as: 'detail'
});
BicycleDetail.belongsTo(Bicycle, {
  foreignKey: 'bicycleId', as: 'bicycle'
});
```

La clave `bicycleId` está en `BicycleDetail`, con `unique: true` en tu modelo. **Consultar:**

```ts
return Bicycle.findAll({
  include: [{ model: BicycleDetail, as: 'detail' }]
});
```

**Piensa:** Bicycle = ficha principal; BicycleDetail = ficha de características.

## 13. Relación muchos a muchos

Ya existe `Order ↔ Bicycle`: un pedido puede contener varias bicicletas y una bicicleta puede aparecer en varios pedidos. Se usa la tabla intermedia `OrderItem`.

```ts
Order.belongsToMany(Bicycle, {
  through: OrderItem, foreignKey: 'orderId',
  otherKey: 'bicycleId', as: 'bicycles'
});
Bicycle.belongsToMany(Order, {
  through: OrderItem, foreignKey: 'bicycleId',
  otherKey: 'orderId', as: 'orders'
});
```

**Consulta desde pedidos:**

```ts
return Order.findAll({
  include: [{ model: Bicycle, as: 'bicycles' }]
});
```

**Truco:** N:M casi siempre te hace pensar «¿dónde está la tabla intermedia?».

---

## 14. Receta universal de consultas

**No pegues una consulta suelta en routes.** El recorrido normal de tu proyecto es:

1. **SERVICE:** método que llama a Sequelize.
2. **CONTROLLER:** método que llama al service y responde JSON.
3. **ROUTES:** endpoint `router.get('/nombre', Controller.metodo)`.
4. **BRUNO:** GET a `/api/<modulo>/nombre`.

**Plantilla reutilizable con Bicycle** (sustituye el `findAll` por la consulta que te pidan):

**`bicycle.service.ts` — dentro de `BicycleService`:**

```ts
static async miConsulta() {
  return Bicycle.findAll({
    where: { price: { [Op.gt]: 100 } }
  });
}
```

Importa `Op` desde `'sequelize'` **arriba del service**.

**`bicycle.controller.ts` — dentro de `BicycleController`:**

```ts
static async miConsulta(req: Request, res: Response, next: NextFunction) {
  try {
    const datos = await BicycleService.miConsulta();
    res.json(datos);
  } catch (error) { next(error); }
}
```

**`bicycle.routes.ts` — antes de `/:id`:**

```ts
router.get('/mi-consulta', BicycleController.miConsulta);
```

**Bruno:** `GET http://localhost:3000/api/bicycles/mi-consulta`.

**Si la consulta es sobre pedidos:** usa `OrderService`, `OrderController`, `order.routes.ts` y `/api/orders/...`. **Si el módulo ya existe, NO lo registres otra vez en `routes/index.ts`.**

## 15. Consultas sin relaciones

Ejemplos **para colocar dentro de métodos del service** (cada `return` es un ejemplo separado):

```ts
// Todas las bicicletas
return Bicycle.findAll();

// Una bicicleta por ID
return Bicycle.findByPk(id);

// Solo las que tengan stock 0
return Bicycle.findAll({ where: { stock: 0 } });

// Solo nombre de modelo y precio (en el proyecto ORIGINAL model es texto)
return Bicycle.findAll({ attributes: ['id', 'model', 'price'] });

// Ordenar por precio de mayor a menor
return Bicycle.findAll({ order: [['price', 'DESC']] });

// Diez primeros
return Bicycle.findAll({ limit: 10 });
```

## 16. Diccionario de operadores

**Import arriba del service:** `import { Op } from 'sequelize';`.

| Enunciado | Código dentro de `where` |
|---|---|
| Mayor que 100 | `price: { [Op.gt]: 100 }` |
| Menor que 100 | `price: { [Op.lt]: 100 }` |
| Mayor o igual que 100 | `price: { [Op.gte]: 100 }` |
| Menor o igual que 100 | `price: { [Op.lte]: 100 }` |
| Distinto de 100 | `price: { [Op.ne]: 100 }` |
| Entre 50 y 200 | `price: { [Op.between]: [50, 200] }` |
| Contiene «Trek» | `model: { [Op.like]: '%Trek%' }` (solo si `model` es texto) |
| Es NULL | `description: null` |
| No es NULL | `description: { [Op.ne]: null }` |

**Dos condiciones AND** (ambas deben cumplirse):

```ts
return Bicycle.findAll({
  where: { price: { [Op.lt]: 100 }, stock: { [Op.gt]: 0 } }
});
```

**Dos condiciones OR** (basta una):

```ts
return Bicycle.findAll({
  where: { [Op.or]: [
    { price: { [Op.lt]: 100 } },
    { stock: 0 }
  ] }
});
```

**Cuidado:** `Op.gt` es `>` (100 NO entra); `Op.gte` es `>=` (100 SÍ entra).

## 17. Include de una relación

«Devuelve bicicletas **con su marca**». En tu `associations.ts` existe `Bicycle.belongsTo(Brand, { as: 'brand' })`.

```ts
return Bicycle.findAll({
  include: [{ model: Brand, as: 'brand' }]
});
```

**Traducción:** trae Bicycle y para cada una añade su objeto `brand`. `as: 'brand'` no es un nombre inventado: debe ser idéntico al de la asociación.

## 18. Dos includes al mismo nivel

«Devuelve bicicletas **con su marca y su detalle**»:

```ts
return Bicycle.findAll({
  include: [
    { model: Brand, as: 'brand' },
    { model: BicycleDetail, as: 'detail' }
  ]
});
```

**Pista:** si las dos relaciones salen **directamente desde Bicycle**, son dos objetos dentro del mismo array `include`.

## 19. Include anidado

«Devuelve pedidos con bicicletas y, dentro de cada bicicleta, su marca»:

```ts
return Order.findAll({
  include: [{
    model: Bicycle,
    as: 'bicycles',
    include: [{ model: Brand, as: 'brand' }]
  }]
});
```

**Pista:** `Order → Bicycle → Brand`: segundo `include` **dentro** del primero. Si el enunciado dice «pedidos con su cliente Y sus bicicletas», ambos `include` salen de Order y van al mismo nivel.

## 20. Filtrar en tablas relacionadas

**Ejemplo:** bicicletas cuya ficha técnica tiene `frameMaterial = 'Carbon'`:

```ts
return Bicycle.findAll({
  include: [{
    model: BicycleDetail,
    as: 'detail',
    where: { frameMaterial: 'Carbon' },
    required: true
  }]
});
```

`where` dentro del `include` filtra la tabla **BicycleDetail**, no Bicycle. `required: true` exige que exista una ficha coincidente. `required: false` conserva bicicletas aunque no tengan ficha coincidente (pueden aparecer con `detail: null`).

**Recuerda:** poner un `where` en un `include` suele hacer que Sequelize lo trate como obligatorio salvo que declares `required: false`; para evitar dudas, **escríbelo explícitamente**.

## 21. Parámetros de consulta

**A. Por URL (`req.params`)**: `/api/bicycles/price-over/100`.

```ts
// SERVICE:
static async overPrice(min: number) {
  return Bicycle.findAll({ where: { price: { [Op.gt]: min } } });
}

// CONTROLLER:
static async overPrice(req: Request, res: Response, next: NextFunction) {
  try {
    const min = Number(req.params.min);
    if (!Number.isFinite(min)) {
      res.status(400).json({ message: 'Precio no válido' }); return;
    }
    res.json(await BicycleService.overPrice(min));
  } catch (error) { next(error); }
}

// ROUTES, ANTES de '/:id':
router.get('/price-over/:min', BicycleController.overPrice);
```

**B. Por query string (`req.query`)**: `/api/bicycles/search?min=100`. En el controller lee `Number(req.query.min)`. La ruta sería `router.get('/search', ...)`. **No confundas:** `params` viene de `/:min`; `query` viene de `?min=100`.

## 22. Recetario rápido de consultas

**Estos son fragmentos del SERVICE**; para hacerlos accesibles desde Bruno, añade siempre controller + route según [14](#14-receta-universal-de-consultas). Importa los modelos y `Op` necesarios arriba del archivo.

| El profesor pide… | Patrón Sequelize |
|---|---|
| 1. Todos | `Bicycle.findAll()` |
| 2. Uno | `Bicycle.findByPk(id)` |
| 3. Precio mayor | `Bicycle.findAll({where:{price:{[Op.gt]:100}}})` |
| 4. Precio menor | `Bicycle.findAll({where:{price:{[Op.lt]:100}}})` |
| 5. Precio entre | `Bicycle.findAll({where:{price:{[Op.between]:[50,200]}}})` |
| 6. Dos condiciones | `Bicycle.findAll({where:{stock:{[Op.gt]:0},price:{[Op.lt]:200}}})` |
| 7. Una u otra | `Bicycle.findAll({where:{[Op.or]:[{stock:0},{price:{[Op.lt]:100}}]}})` |
| 8. Marca | `Bicycle.findAll({include:[{model:Brand,as:'brand'}]})` |
| 9. Detalle | `Bicycle.findAll({include:[{model:BicycleDetail,as:'detail'}]})` |
| 10. Marca y detalle | `Bicycle.findAll({include:[{model:Brand,as:'brand'},{model:BicycleDetail,as:'detail'}]})` |
| 11. Pedidos con bicicletas | `Order.findAll({include:[{model:Bicycle,as:'bicycles'}]})` |
| 12. Pedidos con cliente | `Order.findAll({include:[{model:Customer,as:'customer'}]})` |
| 13. Ordenar | `Bicycle.findAll({order:[['price','DESC']]})` |
| 14. Solo NULL | `Bicycle.findAll({where:{description:null}})` |

**¿No aparece la consulta exacta?** Combina los bloques: elige tabla inicial → `where` de esa tabla → `include` para relaciones → `where` dentro del `include` para filtros en otra tabla.

---

## 23. Preexamen: bicicletas con marca y modelo

El PDF del profesor pide **Bicycle + Brand + nueva entidad Model**. **Tu ZIP original todavía tiene `Bicycle.model` como campo de texto**, no una relación. **Primero hay que crear `Model`, su clave `modelId` y la asociación** según el ERD exacto del examen. No inventes atributos del diagrama.

**Cuando exista la entidad `Model` y el alias `model`:**

```ts
// ARRIBA del bicycle.service.ts, si faltan:
import { Brand } from '../brands/brand.model';
import { Model as BicycleModel } from '../models/model.model';

// DENTRO de BicycleService:
static async withBrandAndModel() {
  return Bicycle.findAll({
    include: [
      { model: Brand, as: 'brand' },
      { model: BicycleModel, as: 'model' }
    ]
  });
}
```

**Ejemplo de asociación 1:N** (solo si el ERD dice que cada bicicleta pertenece a un modelo):

```ts
BicycleModel.hasMany(Bicycle, { foreignKey: 'modelId', as: 'bicycles' });
Bicycle.belongsTo(BicycleModel, { foreignKey: 'modelId', as: 'model' });
```

**¡Cuidado!** Si mantienes el atributo `model` de texto en Bicycle y además quieres usar `as: 'model'`, puede haber un **conflicto de nombre entre atributo y alias**. Una solución es renombrar/migrar el atributo antiguo y usar `modelId`; otra es usar un alias distinto (`bicycleModel`) y cambiar el `include` de acuerdo con ese alias. **No cambies nombres a ciegas**: adapta al ERD y a los datos del examen.

**Controller + route** siguiendo [14](#14-receta-universal-de-consultas), por ejemplo método `getWithBrandAndModel` que llame al service, ruta `/with-brand-model` antes de `/:id`, Bruno `GET /api/bicycles/with-brand-model`.

## 24. Preexamen: precio mayor que 100

**Service (`bicycle.service.ts`)**:

```ts
import { Op } from 'sequelize'; // arriba, si no existe

// Dentro de BicycleService:
static async over100() {
  return Bicycle.findAll({
    where: { price: { [Op.gt]: 100 } }
  });
}
```

**Controller (`bicycle.controller.ts`)**:

```ts
static async getOver100(req: Request, res: Response, next: NextFunction) {
  try { res.json(await BicycleService.over100()); }
  catch (error) { next(error); }
}
```

**Routes (`bicycle.routes.ts`)**, antes de `/:id`:

```ts
router.get('/over-100', BicycleController.getOver100);
```

**Bruno:** `GET http://localhost:3000/api/bicycles/over-100`.

## 25. Preexamen: pedidos, precio y peso

**Enunciado:** pedidos que **incluyan** bicicletas con **precio < 100** y **peso > 20**. **En tu proyecto:** precio está en `Bicycle`; peso en `BicycleDetail`; Order ↔ Bicycle es N:M por `OrderItem`.

**Dibuja antes de escribir:** `Order → Bicycle (price < 100) → BicycleDetail (weight > 20)`.

**Service (`order.service.ts`)**:

```ts
// ARRIBA del archivo, si faltan:
import { Op } from 'sequelize';
import { Bicycle } from '../bicycles/bicycle.model';
import { BicycleDetail } from '../bicycle-details/bicycle-detail.model';

// DENTRO de OrderService:
static async withCheapHeavyBicycles() {
  return Order.findAll({
    include: [{
      model: Bicycle,
      as: 'bicycles',
      required: true,
      where: { price: { [Op.lt]: 100 } },
      include: [{
        model: BicycleDetail,
        as: 'detail',
        required: true,
        where: { weight: { [Op.gt]: 20 } }
      }]
    }]
  });
}
```

**Por qué funciona:** `Order.findAll()` devuelve pedidos; el primer `include` entra en sus bicicletas y filtra `price`; el segundo `include`, **dentro del primero**, entra en el detalle **de esas mismas bicicletas** y filtra `weight`. Los `required: true` impiden devolver pedidos sin coincidencias. La lista de bicicletas incluida contendrá las que cumplen el filtro, **no necesariamente todas las bicicletas originales del pedido**.

**Controller (`order.controller.ts`)**:

```ts
static async getCheapHeavy(req: Request, res: Response, next: NextFunction) {
  try { res.json(await OrderService.withCheapHeavyBicycles()); }
  catch (error) { next(error); }
}
```

**Routes (`order.routes.ts`)**, antes de `/:id`:

```ts
router.get('/cheap-heavy', OrderController.getCheapHeavy);
```

**Bruno:** `GET http://localhost:3000/api/orders/cheap-heavy`.

**Si sale `[]`:** verifica que EXISTEN pedidos con bicicletas que cumplan **ambas** condiciones, que tengan ficha técnica y que las asociaciones se cargan. Un array vacío no siempre es un error.

---

## 26. Errores típicos

| Error o síntoma | Qué revisar |
|---|---|
| `Cannot GET /api/...` | Ruta, método GET, puerto, `routes/index.ts`, orden antes de `/:id` |
| `... is not associated to ...` | Asociación no declarada o `as` diferente |
| `Unknown column` | Falta columna en BD; modelo `.init` o clave foránea incorrectos |
| `Cannot find name Op` | `import { Op } from 'sequelize'` |
| `Cannot find name Brand` | Import de modelo en service |
| 400 en POST | Campo obligatorio o JSON inválido |
| 404 en GET `/:id` | El ID no existe o se interpretó mal la ruta |
| `[]` | Puede no haber filas que cumplan las condiciones |
| `null` en include | No hay relación asociada; comprobar clave foránea y datos |
| Se borran los datos al reiniciar | **Tu `server.ts` tiene `sequelize.sync({ force: true })`** |
| Alias `model` en conflicto | Ya existe el atributo de texto `Bicycle.model` en el ZIP original |

**Aviso crítico de tu proyecto:** `sequelize.sync({ force: true })` **elimina y recrea tablas en cada arranque**. Para practicar con datos persistentes, habla con el profesor sobre usar una configuración de desarrollo segura; no cambies el comportamiento en mitad del examen sin comprender las consecuencias. Si ya tienes datos importantes, haz copia antes.

## 27. Git y entrega

El preexamen pide rama `pre-examen`. En la terminal, desde la carpeta del repositorio:

```bash
git status
git switch -c pre-examen
git add .
git commit -m "Pre-examen: CRUD y consultas"
git push -u origin pre-examen
```

Si la rama ya existe, usa `git switch pre-examen` en vez de crearla. Revisa `git status` antes de añadir; **no subas `.env` ni secretos**. Confirma en GitHub que aparece la rama y los archivos.

## 28. Simulacro para practicar

**No mires la solución hasta intentarlo.**

1. Crea entidad `Category` con `name` obligatorio y `description` que admita `NULL`. CRUD completo. **Solución:** [4](#4-entidad-nueva-category-con-un-campo-null) a [9](#9-null-sin-confusiones).
2. Devuelve bicicletas con su marca y su detalle. **Solución:** [18](#18-dos-includes-al-mismo-nivel).
3. Devuelve bicicletas con `stock > 0` y `price < 200`. **Solución:** [16](#16-diccionario-de-operadores).
4. Devuelve pedidos que incluyan bicicletas con `price < 200` cuyo detalle tenga `weight > 15`. **Solución:** copia el patrón de [25](#25-preexamen-pedidos-precio-y-peso), cambia 100→200 y 20→15.
5. Devuelve categorías sin descripción. **Solución en service:** `Category.findAll({ where: { description: null } })`; después controller y route según [14](#14-receta-universal-de-consultas).

**Prueba final de comprensión:** si piden «pedidos con cliente y bicicletas», empieza por `Order.findAll`, pon dos `include` al mismo nivel (`customer` y `bicycles`). Si piden «pedidos con bicicletas y su detalle», el `include` de `detail` va **dentro** del de `bicycles`.

## 29. Checklist final

- [ ] ¿Sé **qué entidad** quiere que devuelva la consulta?
- [ ] ¿He localizado **cada campo** en su tabla real?
- [ ] ¿La relación existe en `associations.ts` y su `as` coincide?
- [ ] ¿Mi consulta está **dentro de la clase Service**?
- [ ] ¿El import de `Op` y de los modelos está **arriba del archivo**?
- [ ] ¿He añadido método al **Controller**?
- [ ] ¿He añadido endpoint en **Routes**, antes de `/:id`?
- [ ] Si es entidad nueva: ¿**model, service, controller, routes, registro y asociaciones**?
- [ ] Si hay atributo NULL: ¿`allowNull: true`, tipo TS y POST en Bruno con `null`?
- [ ] ¿He probado en **Bruno** y revisado el JSON/status?
- [ ] ¿He comprobado `git status`, commit, push y la rama pedida?

---

**FRASE PARA RECORDAR EN EL EXAMEN:** «¿Qué quiero devolver? → ¿Dónde están los campos? → ¿Cómo se conectan las tablas? → `findAll` + `where` + `include` → controller → route → Bruno».

**Base de esta guía:** ZIP `bicycle-shop-dsw-entrega-5`, NOREADME aportado y prueba de examen del 08/10/2026. El ejemplo `Category` es **hipotético**; el ERD exacto y los atributos de la entidad nueva se decidirán en el examen. Los fragmentos no han sido probados con tu MySQL en ejecución.


---

## 30. ENVÍOS: qué es Shipment y cómo se relaciona

**Ejemplo de entrenamiento inventado:** el profesor podría pedir una entidad `Shipment` (envío). **No está en tu ZIP original ni está confirmada para el examen.** Conservamos el ejemplo `Category` y TODO lo anterior: este es un capítulo adicional.

Imagina que una tienda vende bicicletas. `Order` es **el pedido** del cliente; `Shipment` es **un envío físico** de ese pedido. Un pedido podría enviarse en varios paquetes. Por eso elegimos **1:N** como ejemplo:

```text
Order (1)  ------------------< Shipment (muchos)
  id                             id
  customerId                     orderId  <-- clave foránea
                                 name
                                 trackingNumber  <-- PUEDE SER NULL
                                 status
```

**Traducción para el examen:** «Un pedido puede tener varios envíos» → `Order.hasMany(Shipment)`; «cada envío pertenece a un pedido» → `Shipment.belongsTo(Order)`; **`orderId` está en Shipment**, el lado muchos.

El atributo nullable será `trackingNumber`: al preparar el envío puede que aún no sepamos el número de seguimiento. **`NULL` significa 'sin dato', no la cadena de texto `"null"`.**

| Campo | Tipo | Obligatorio | Para qué sirve |
|---|---|---|---|
| `id` | entero | automático | Identificador del envío |
| `orderId` | entero | sí | Pedido al que pertenece |
| `name` | texto | sí | Nombre del envío, p. ej. «Paquete principal» |
| `trackingNumber` | texto o `null` | **no** | Código de seguimiento si ya existe |
| `status` | **ENUM** | sí | Solo `pending`, `sent` o `delivered` |

> Si el ERD del examen indica **una sola entrega por pedido**, la relación será 1:1 y NO debes copiar ciegamente la 1:N: mira el [apartado 35](#35-envios-si-el-profesor-dibuja-otra-relacion).

## 31. ENVÍOS: modelo con NULL y ENUM

Crea la carpeta `backend/src/modules/shipments/` y el archivo `shipment.model.ts`. Es un ejemplo con el mismo estilo de Sequelize + TypeScript que tus modelos.

```ts
import {
  Model, DataTypes, InferAttributes,
  InferCreationAttributes, CreationOptional
} from 'sequelize';
import { sequelize } from '../../config/database';

export class Shipment extends Model<
  InferAttributes<Shipment>,
  InferCreationAttributes<Shipment>
> {
  declare id: CreationOptional<number>;
  declare orderId: number;
  declare name: string;
  declare trackingNumber: CreationOptional<string | null>;
  declare status: CreationOptional<'pending' | 'sent' | 'delivered'>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Shipment.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  trackingNumber: {
    type: DataTypes.STRING(120),
    allowNull: true,
    defaultValue: null
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'delivered'),
    allowNull: false,
    defaultValue: 'pending'
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
}, {
  sequelize,
  tableName: 'shipments',
  timestamps: true
});
```

**Lee estas tres líneas sin miedo:** `declare trackingNumber: CreationOptional<string | null>` permite omitirlo al crear y representa un texto o `null`; `allowNull: true` permite NULL en MySQL; `defaultValue: null` asigna NULL por defecto. **No es lo mismo** que escribir `"null"` entre comillas en Bruno.

## 32. ENVÍOS: CRUD completo

**Recuerda:** `service` trabaja con Sequelize, `controller` recibe y responde, `routes` crea la dirección web.

### A. `shipment.service.ts`

```ts
import { Shipment } from './shipment.model';

export type ShipmentInput = {
  orderId: number;
  name: string;
  trackingNumber?: string | null;
  status?: 'pending' | 'sent' | 'delivered';
};

export class ShipmentService {
  static async findAll() {
    return Shipment.findAll();
  }
  static async findById(id: number) {
    return Shipment.findByPk(id);
  }
  static async create(data: ShipmentInput) {
    return Shipment.create(data);
  }
  static async update(shipment: Shipment, data: Partial<ShipmentInput>) {
    return shipment.update(data);
  }
  static async delete(shipment: Shipment) {
    await shipment.destroy();
  }
}
```

**¿Qué significa `Partial`?** Que al actualizar no tienes que mandar todos los campos. Por ejemplo, puedes actualizar solo `trackingNumber`.

### B. `shipment.controller.ts`

```ts
import { Request, Response, NextFunction } from 'express';
import { ShipmentService } from './shipment.service';

const validStatuses = ['pending', 'sent', 'delivered'];

export class ShipmentController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try { res.json(await ShipmentService.findAll()); }
    catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ message: 'ID incorrecto' }); return;
      }
      const shipment = await ShipmentService.findById(id);
      if (!shipment) {
        res.status(404).json({ message: 'Envío no encontrado' }); return;
      }
      res.json(shipment);
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, name, trackingNumber, status } = req.body;
      if (!Number.isInteger(orderId) || orderId <= 0 ||
          typeof name !== 'string' || !name.trim() ||
          (trackingNumber != null && typeof trackingNumber !== 'string') ||
          (status !== undefined && !validStatuses.includes(status))) {
        res.status(400).json({ message: 'Datos de envío incorrectos' }); return;
      }
      const created = await ShipmentService.create({
        orderId, name, trackingNumber: trackingNumber ?? null, status
      });
      res.status(201).json(created);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ message: 'ID incorrecto' }); return;
      }
      const shipment = await ShipmentService.findById(id);
      if (!shipment) {
        res.status(404).json({ message: 'Envío no encontrado' }); return;
      }
      const { orderId, name, trackingNumber, status } = req.body;
      if ((orderId !== undefined && (!Number.isInteger(orderId) || orderId <= 0)) ||
          (name !== undefined && (typeof name !== 'string' || !name.trim())) ||
          (trackingNumber !== undefined && trackingNumber !== null && typeof trackingNumber !== 'string') ||
          (status !== undefined && !validStatuses.includes(status))) {
        res.status(400).json({ message: 'Datos de actualización incorrectos' }); return;
      }
      const updated = await ShipmentService.update(shipment, req.body);
      res.json(updated);
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ message: 'ID incorrecto' }); return;
      }
      const shipment = await ShipmentService.findById(id);
      if (!shipment) {
        res.status(404).json({ message: 'Envío no encontrado' }); return;
      }
      await ShipmentService.delete(shipment);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
```

**Ojo:** este controller hace validaciones básicas para estudiar; en una aplicación real también validarías que el `orderId` exista y limitarías exactamente qué propiedades se pueden actualizar. La base de datos puede rechazar un `orderId` inexistente si hay una restricción de clave foránea.

### C. `shipment.routes.ts`

```ts
import { Router } from 'express';
import { ShipmentController } from './shipment.controller';

const router = Router();

// Las rutas especiales de consultas se añadirán AQUÍ,
// antes de /:id. Mira el apartado 34.
router.get('/', ShipmentController.getAll);
router.get('/:id', ShipmentController.getById);
router.post('/', ShipmentController.create);
router.put('/:id', ShipmentController.update);
router.delete('/:id', ShipmentController.delete);

export default router;
```

## 33. ENVÍOS: registro y pruebas en Bruno

### A. Asociación en `src/models/associations.ts`

Arriba, importa el nuevo modelo:

```ts
import { Shipment } from '../modules/shipments/shipment.model';
```

Dentro de `defineAssociations()`, añade:

```ts
Order.hasMany(Shipment, { foreignKey: 'orderId', as: 'shipments' });
Shipment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
```

**Regla:** `as: 'order'` es el nombre que pondrás al incluir `Order` desde `Shipment`. `as: 'shipments'` es el nombre que pondrás al incluir envíos desde `Order`.

### B. Registrar modelo y rutas

En `src/server.ts`, con los otros imports de modelos:

```ts
import './modules/shipments/shipment.model';
```

En `src/routes/index.ts`, con los otros imports:

```ts
import shipmentRoutes from '../modules/shipments/shipment.routes';
```

Y junto a los otros `router.use`:

```ts
router.use('/shipments', shipmentRoutes);
```

No necesitas tocar `app.ts`: en tu proyecto las rutas ya se montan bajo `/api`.

**ATENCIÓN:** tu `server.ts` original usa `sequelize.sync({ force: true })`, que **borra y recrea las tablas en cada arranque**. No lo olvides al crear datos para probar. Si modificas la sincronización, hazlo conscientemente y siguiendo las indicaciones del profesor; no uses `force` sobre datos que necesites conservar.

### C. Bruno, paso a paso

Asegúrate primero de que existe un `Order` con `id = 1`. Si no, crea uno con el endpoint de pedidos que ya tienes. Ajusta el puerto si no es 3000.

| Qué haces | Método | URL | Body |
|---|---|---|---|
| Crear envío | POST | `http://localhost:3000/api/shipments` | JSON de abajo |
| Ver todos | GET | `http://localhost:3000/api/shipments` | ninguno |
| Ver uno | GET | `http://localhost:3000/api/shipments/1` | ninguno |
| Cambiar seguimiento | PUT | `http://localhost:3000/api/shipments/1` | JSON de abajo |
| Eliminar | DELETE | `http://localhost:3000/api/shipments/1` | ninguno |

**POST, Body → JSON:**

```json
{
  "orderId": 1,
  "name": "Paquete principal",
  "trackingNumber": null,
  "status": "pending"
}
```

**PUT, Body → JSON:**

```json
{
  "trackingNumber": "SEUR12345",
  "status": "sent"
}
```

**Prueba del NULL:** en el POST escribe `null` sin comillas; después haz GET y comprueba que aparece `"trackingNumber": null`. Si el POST falla, mira el error de la terminal, el `orderId` y que el servidor esté arrancado.

## 34. ENVÍOS: consultas resueltas

**Receta universal:** 1) ¿Qué quieres devolver? → empieza por ese modelo. 2) ¿Dónde están los datos para filtrar? → `where` en ese modelo o en el `include`. 3) Añade **service + controller + route**. 4) Comprueba en Bruno.

En los ejemplos siguientes, **añade cada método dentro de `ShipmentService`** salvo cuando se indique `OrderService`. Pon estos imports arriba del archivo correspondiente, sin duplicarlos:

```ts
import { Op } from 'sequelize';
import { Order } from '../orders/order.model';
// Para consultas desde OrderService:
// import { Shipment } from '../shipments/shipment.model';
```

### Consulta A. Todos los envíos SIN seguimiento (NULL)

**Enunciado:** «Devuelve envíos cuyo trackingNumber sea NULL».

```ts
static async withoutTracking() {
  return Shipment.findAll({
    where: { trackingNumber: null }
  });
}
```

**Por qué:** `where` filtra; `null` es un valor especial. No uses `'null'` como texto.

### Consulta B. Envíos CON seguimiento (NO NULL)

```ts
static async withTracking() {
  return Shipment.findAll({
    where: { trackingNumber: { [Op.ne]: null } }
  });
}
```

**Por qué:** `Op.ne` significa «distinto de». Con `null`, Sequelize genera una comprobación de no-nulo.

### Consulta C. Envíos de un pedido concreto

```ts
static async byOrderId(orderId: number) {
  return Shipment.findAll({ where: { orderId } });
}
```

**Controller:** convierte `req.params.orderId` a número y comprueba que sea entero positivo. **Route:** `router.get('/by-order/:orderId', ShipmentController.byOrderId);` antes de `/:id`. Más abajo tienes un patrón completo de controller.

### Consulta D. Envíos CON la información de su pedido

```ts
static async withOrder() {
  return Shipment.findAll({
    include: [{ model: Order, as: 'order' }]
  });
}
```

**Por qué:** el resultado principal son envíos, pero también quieres el pedido. `as: 'order'` coincide con `Shipment.belongsTo(Order, ...)`.

### Consulta E. Envíos enviados y todavía sin seguimiento

```ts
static async sentWithoutTracking() {
  return Shipment.findAll({
    where: {
      status: 'sent',
      trackingNumber: null
    }
  });
}
```

**Por qué:** dos propiedades dentro del mismo `where` equivalen a **Y (AND)**: se tienen que cumplir las dos.

### Consulta F. Pedidos que TENGAN al menos un envío pendiente

Esta consulta empieza por `Order`, porque el enunciado pide **pedidos**. Añade a `OrderService`:

```ts
static async ordersWithPendingShipments() {
  return Order.findAll({
    include: [{
      model: Shipment,
      as: 'shipments',
      where: { status: 'pending' },
      required: true
    }]
  });
}
```

**Por qué:** `required: true` deja fuera los pedidos sin envíos pendientes. El `where` está **dentro del include**, porque `status` es un campo de `Shipment`.

### Consulta G. Pedidos con cliente y envíos (varias relaciones)

En `OrderService`, importa también `Customer` si falta:

```ts
static async ordersWithCustomerAndShipments() {
  return Order.findAll({
    include: [
      { model: Customer, as: 'customer' },
      { model: Shipment, as: 'shipments' }
    ]
  });
}
```

**Por qué:** son **dos includes al mismo nivel**: desde `Order` hacia `Customer` y desde `Order` hacia `Shipment`.

### Consulta H. Envíos con pedido y bicicletas del pedido (include anidado)

En `ShipmentService`, importa `Bicycle` si falta:

```ts
static async shipmentsWithOrderBicycles() {
  return Shipment.findAll({
    include: [{
      model: Order,
      as: 'order',
      include: [{ model: Bicycle, as: 'bicycles' }]
    }]
  });
}
```

**Por qué:** empiezas en `Shipment`, pasas a `Order` y **dentro** de Order pasas a `Bicycle`. El `as: 'bicycles'` es el que ya tiene tu proyecto en `Order.belongsToMany(Bicycle, ...)`.

### Consulta I. Pedidos con envíos cuyo nombre contiene una palabra

En `OrderService`:

```ts
static async ordersWithNamedShipment(texto: string) {
  return Order.findAll({
    include: [{
      model: Shipment,
      as: 'shipments',
      where: { name: { [Op.like]: `%${texto}%` } },
      required: true
    }]
  });
}
```

**Por qué:** `Op.like` busca coincidencias de texto; `%` significa «cualquier secuencia de caracteres». Recuerda importar `Op` en el service.

### Conectar una consulta completa: ejemplo A, en los TRES archivos

**Service**: ya has añadido `withoutTracking()` en `ShipmentService`.

**Controller:** dentro de `ShipmentController`:

```ts
static async getWithoutTracking(req: Request, res: Response, next: NextFunction) {
  try {
    const datos = await ShipmentService.withoutTracking();
    res.json(datos);
  } catch (error) { next(error); }
}
```

**Routes:** en `shipment.routes.ts`, **antes de `router.get('/:id', ...)`**:

```ts
router.get('/without-tracking', ShipmentController.getWithoutTracking);
```

**Bruno:** `GET http://localhost:3000/api/shipments/without-tracking`.

### Conectar una consulta con parámetro: ejemplo C

**Controller:** dentro de `ShipmentController`:

```ts
static async byOrderId(req: Request, res: Response, next: NextFunction) {
  try {
    const orderId = Number(req.params.orderId);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      res.status(400).json({ message: 'orderId incorrecto' }); return;
    }
    res.json(await ShipmentService.byOrderId(orderId));
  } catch (error) { next(error); }
}
```

**Routes**, antes de `/:id`:

```ts
router.get('/by-order/:orderId', ShipmentController.byOrderId);
```

**Bruno:** `GET http://localhost:3000/api/shipments/by-order/1`.

**Para D, E, G, H, I y F:** usa exactamente el mismo patrón de **service → controller → route**, cambiando el nombre del método. Si el service está en `OrderService`, el controller y la ruta nuevos van en **`order.controller.ts` y `order.routes.ts`**, no en Shipment. Mira también el [apartado 14](#14-receta-universal-de-consultas).

## 35. ENVÍOS: si el profesor dibuja otra relación

**No adivines el tipo de relación por el nombre Shipment: manda el dibujo.**

- **1:N**: un pedido tiene muchos envíos → `Order.hasMany(Shipment)` + `Shipment.belongsTo(Order)`; `orderId` en Shipment. Es el ejemplo que hemos desarrollado.
- **1:1**: un pedido tiene como máximo un envío → `Order.hasOne(Shipment)` + `Shipment.belongsTo(Order)`; `orderId` en Shipment con `unique: true` para impedir varios envíos del mismo pedido.
- **N:M**: un envío puede agrupar varios pedidos y cada pedido estar en varios envíos → se necesita una tabla intermedia, por ejemplo `OrderShipment`, con `orderId` y `shipmentId`, y dos `belongsToMany`. **En ese diseño no copies el `orderId` directo de Shipment del ejemplo 1:N sin revisar el ERD.**

**Círculo y palito:** el círculo significa mínimo 0 (opcional), el palito significa 1 y la pata de gallo significa muchos. **Un atributo `trackingNumber` nullable NO cambia automáticamente una relación 1:N en 0:N.** Son dos cosas diferentes.

## 36. ENVÍOS: mini examen

Prueba sin mirar las soluciones y luego vuelve al enlace indicado.

1. **CRUD:** crea `Shipment` con `name` obligatorio y `trackingNumber` nullable. [Solución](#31-envios-modelo-con-null) y [CRUD](#32-envios-crud-completo).
2. **Consulta fácil:** envíos sin número de seguimiento. [Solución A](#34-envios-consultas-resueltas).
3. **Consulta de relación:** envíos con su pedido. [Solución D](#34-envios-consultas-resueltas).
4. **Consulta con filtro de otra tabla:** pedidos con envíos pendientes. [Solución F](#34-envios-consultas-resueltas).
5. **Consulta anidada:** envíos con pedido y bicicletas del pedido. [Solución H](#34-envios-consultas-resueltas).

**Checklist de envíos antes de entregar:**

- [ ] He creado los cuatro archivos de Shipment.
- [ ] `trackingNumber` permite `NULL` en TypeScript y Sequelize.
- [ ] He importado Shipment en `associations.ts` y añadido la relación correcta según el ERD.
- [ ] He registrado modelo en `server.ts` y rutas en `routes/index.ts`.
- [ ] Mis consultas están en el service y tienen controller y endpoint.
- [ ] Las rutas especiales están antes de `/:id`.
- [ ] He probado POST con `trackingNumber: null` y los GET en Bruno.
- [ ] He comprobado el resultado y la consola antes de subir a GitHub.

**Regla para mañana:** «¿Devuelvo envíos? → `Shipment.findAll()`. ¿Devuelvo pedidos? → `Order.findAll()`. ¿Filtro datos de la otra entidad? → `include` con `where` y, si quiero exigir coincidencia, `required: true`.»


---

## 37. ENVÍOS: ENUM y NULL desde cero

**Esta es la versión de Shipment que practicaremos para el examen.** Tiene DOS campos diferentes:

- **`trackingNumber` admite NULL:** todavía no conocemos el código de seguimiento. **No es el ID del pedido**: `orderId` sigue siendo obligatorio para la relación 1:N que hemos elegido como ejemplo.
- **`status` es ENUM:** solo admite `'pending'`, `'sent'` o `'delivered'` y **NO** admite NULL en este ejemplo.

| Campo | ¿Qué significa? | ¿Qué pongo en Sequelize? | ¿Qué envío desde Bruno? |
|---|---|---|---|
| `orderId` | A qué pedido pertenece | `allowNull: false` | `1` (si existe el pedido) |
| `name` | Nombre del envío | `allowNull: false` | `"Paquete principal"` |
| `trackingNumber` | Número de seguimiento aún desconocido | `allowNull: true`, `defaultValue: null` | `null` sin comillas |
| `status` | Estado, solo entre tres opciones | `DataTypes.ENUM(...)` | `"pending"` |

**El código ya está completo en el [apartado 31](#31-envios-modelo-con-null)**. Estas son las dos piezas que más debes reconocer:

```ts
// En la CLASE Shipment, arriba de Shipment.init(...):
declare trackingNumber: CreationOptional<string | null>;
declare status: CreationOptional<'pending' | 'sent' | 'delivered'>;

// Dentro de Shipment.init({ ... }):
trackingNumber: {
  type: DataTypes.STRING(120),
  allowNull: true,
  defaultValue: null
},
status: {
  type: DataTypes.ENUM('pending', 'sent', 'delivered'),
  allowNull: false,
  defaultValue: 'pending'
}
```

**Traducción palabra por palabra:**

1. `DataTypes.STRING(120)` = texto de hasta 120 caracteres.
2. `allowNull: true` = se permite guardar el valor especial `NULL`.
3. `defaultValue: null` = si no indicas ese campo al crear, su valor inicial será `NULL`.
4. `DataTypes.ENUM('pending', 'sent', 'delivered')` = solo se aceptan esos tres estados.
5. `defaultValue: 'pending'` = si no indicas estado, comienza pendiente.
6. `allowNull: false` = el estado no puede ser `NULL`.

**OJO: `NULL` no es `"null"`.** `null` sin comillas significa ausencia de dato; `"null"` entre comillas es un texto de cuatro letras.

**¿Y si el profesor pide que el propio ENUM pueda ser NULL?** En ese caso, modifica **ambas partes**, no solo una:

```ts
// En la clase:
declare status: CreationOptional<'pending' | 'sent' | 'delivered' | null>;

// En Shipment.init:
status: {
  type: DataTypes.ENUM('pending', 'sent', 'delivered'),
  allowNull: true,
  defaultValue: null
}
```

No hagas ese cambio si el examen indica que `status` es obligatorio. **Un campo nullable no significa que todos los campos deban admitir NULL.**

## 38. Consultas ENUM + NULL + relaciones, paso a paso

**Antes de cada consulta:** importa `Op` de `sequelize` solo si utilizas un operador (`Op.ne`, `Op.or`, etc.). Los métodos siguientes van **dentro de `ShipmentService`**, salvo los que empiezan con `Order.findAll()`, que van dentro de `OrderService`. Después aplica el patrón [service → controller → route → Bruno](#14-receta-universal-de-consultas).

### A. Envíos pendientes (filtrar un ENUM)

```ts
static async pendingShipments() {
  return Shipment.findAll({
    where: { status: 'pending' }
  });
}
```

**Piensa:** «quiero envíos» → `Shipment.findAll`; «que estén pendientes» → `where` en `status`.

### B. Envíos sin número de seguimiento (filtrar NULL)

```ts
static async shipmentsWithoutTracking() {
  return Shipment.findAll({
    where: { trackingNumber: null }
  });
}
```

**Piensa:** «sin dato» → `null`, nunca la palabra `'null'`.

### C. Envíos pendientes Y sin seguimiento (dos condiciones)

```ts
static async pendingWithoutTracking() {
  return Shipment.findAll({
    where: {
      status: 'pending',
      trackingNumber: null
    }
  });
}
```

**Piensa:** dos campos dentro del mismo `where` = tienen que cumplirse **LOS DOS**.

### D. Envíos enviados O entregados (`Op.or`)

```ts
import { Op } from 'sequelize'; // ARRIBA del archivo, fuera de la clase

static async sentOrDelivered() {
  return Shipment.findAll({
    where: {
      [Op.or]: [
        { status: 'sent' },
        { status: 'delivered' }
      ]
    }
  });
}
```

**Piensa:** `Op.or` = vale una condición **O** la otra.

### E. Envíos CON seguimiento y estado enviado (`Op.ne`)

```ts
static async sentWithTracking() {
  return Shipment.findAll({
    where: {
      status: 'sent',
      trackingNumber: { [Op.ne]: null }
    }
  });
}
```

**Piensa:** `Op.ne` con `null` busca los que **NO** son nulos.

### F. Pedidos con al menos un envío entregado (relación 1:N)

**Este método va en `OrderService`, no en `ShipmentService`:**

```ts
static async ordersWithDeliveredShipments() {
  return Order.findAll({
    include: [{
      model: Shipment,
      as: 'shipments',
      where: { status: 'delivered' },
      required: true
    }]
  });
}
```

**Piensa en este orden:** «devuelve pedidos» → `Order.findAll`; «con envíos» → `include: Shipment`; «entregados» → `where` **dentro del include**; «que tengan al menos uno» → `required: true`.

### G. Pedidos con envíos pendientes y sin seguimiento (relación + ENUM + NULL)

```ts
static async ordersPendingWithoutTracking() {
  return Order.findAll({
    include: [{
      model: Shipment,
      as: 'shipments',
      required: true,
      where: {
        status: 'pending',
        trackingNumber: null
      }
    }]
  });
}
```

**Esta consulta es un modelo muy útil para el examen:** filtras por **dos atributos de la entidad relacionada** y devuelves la entidad principal.

**¡IMPORTANTE!** Los alias `as: 'shipments'` y `as: 'order'` funcionan **si has creado las asociaciones del [apartado 33](#33-envios-registro-y-pruebas-en-bruno)**. Si el profesor cambia el dibujo ERD, revisa las relaciones antes de copiar.

### Ejemplo completo de conexión de la consulta C

**Service:** copia `pendingWithoutTracking()` dentro de `ShipmentService`.

**Controller:** dentro de `ShipmentController`:

```ts
static async getPendingWithoutTracking(
  req: Request, res: Response, next: NextFunction
) {
  try {
    const datos = await ShipmentService.pendingWithoutTracking();
    res.json(datos);
  } catch (error) {
    next(error);
  }
}
```

**Routes:** antes de `router.get('/:id', ...)`:

```ts
router.get('/pending-without-tracking', ShipmentController.getPendingWithoutTracking);
```

**Bruno:** `GET http://localhost:3000/api/shipments/pending-without-tracking` (ajusta el puerto).

## 39. Bruno: pruebas de ENUM y NULL

Primero implementa el CRUD del [apartado 32](#32-envios-crud-completo), registra rutas y relaciones en el [apartado 33](#33-envios-registro-y-pruebas-en-bruno) y comprueba que existe el pedido `1`.

### Prueba 1 — Correcta: ENUM válido y campo NULL

**POST** `http://localhost:3000/api/shipments` → **Body → JSON**:

```json
{
  "orderId": 1,
  "name": "Primer paquete",
  "trackingNumber": null,
  "status": "pending"
}
```

**Esperado:** crea el envío; al consultar el registro, `trackingNumber` aparece como `null`.

### Prueba 2 — Correcta: ENUM válido y texto en el campo nullable

```json
{
  "orderId": 1,
  "name": "Segundo paquete",
  "trackingNumber": "ENV-001",
  "status": "sent"
}
```

**Esperado:** crea un envío con seguimiento. **Permitir NULL no obliga a usar NULL.**

### Prueba 3 — Incorrecta: valor que no pertenece al ENUM

```json
{
  "orderId": 1,
  "name": "Paquete imposible",
  "trackingNumber": null,
  "status": "flying"
}
```

**Esperado:** ese estado **no debe aceptarse**. El código HTTP concreto depende de las validaciones y del manejo de errores de tu API. Si se guarda, revisa la validación y el tipo real de la columna en la base de datos.

### Prueba 4 — Incorrecta: NULL en el ENUM obligatorio

```json
{
  "orderId": 1,
  "name": "Paquete sin estado",
  "trackingNumber": null,
  "status": null
}
```

**Esperado:** falla porque `status` tiene `allowNull: false` en este ejemplo.

### Prueba 5 — Sin enviar campos opcionales

```json
{
  "orderId": 1,
  "name": "Paquete automático"
}
```

**Esperado:** `trackingNumber` toma `null` y `status` toma `'pending'` por sus valores predeterminados, siempre que el controller no sobrescriba esos campos.

**Si falla algo:** revisa si tu controller está enviando los campos al service, si tu service los pasa a `Shipment.create(...)`, si el modelo tiene el `ENUM` y `allowNull` correctos, y si la tabla de MySQL corresponde a la definición actual. Recuerda que `sync({ force: true })` borra datos al reiniciar.

**Regla final para mañana:** `ENUM = elegir de una lista`; `NULL = se permite no tener dato`; `include = traer otra entidad`; `where = filtrar`; `required: true = exigir coincidencia relacionada`.

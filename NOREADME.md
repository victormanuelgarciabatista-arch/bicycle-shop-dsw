# CHULETA CORTA — EXAMEN SEQUELIZE (2.º DAW)

**Solo backend.** Basada en tu proyecto Bicycle Shop y el PDF del profesor. **Objetivo:** saber QUÉ archivo tocar y QUÉ pegar. Ejemplo inventado para practicar: `Payment` (pago).

## 1. Si me quedo en blanco

| Me piden… | ¿Qué hago? |
|---|---|
| **Un módulo nuevo** | Crear 4 archivos: `model`, `service`, `controller`, `routes`. Registrar modelo en `server.ts` y rutas en `routes/index.ts`. |
| **Una relación** | Revisar campo `...Id` en el modelo y añadir asociaciones en `models/associations.ts`. |
| **Una consulta nueva** | Añadir **3 cosas**: método en `service` → método en `controller` → endpoint en `routes`. |
| **Una consulta con varias tablas** | Comprobar primero la asociación y usar `include` con el **mismo `as`**. |

**IMPORTANTE:** `app.ts` ya monta las rutas con `/api`; normalmente NO hay que tocarlo. Si el módulo ya existe, NO vuelvas a registrarlo en `server.ts` ni `routes/index.ts`.

## 2. El ejemplo más importante: consulta COMPLETA en 3 archivos

**Enunciado:** «Mostrar bicicletas con su marca». Tu proyecto ya tiene la relación `Brand` ↔ `Bicycle`. Para aprender, llamaremos a la consulta `getWithBrands`.

### PASO A — Comprobar `src/models/associations.ts`

```ts
// Una marca tiene MUCHAS bicicletas.
Brand.hasMany(Bicycle, { foreignKey: 'brandId', as: 'bicycles' });
// Una bicicleta pertenece a UNA marca.
Bicycle.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' });
```

**NO dupliques estas líneas:** ya existen en tu proyecto. `brandId` está en Bicycle; `brand` es el alias que usaremos en `include`.

### PASO B — `src/modules/bicycles/bicycle.service.ts`

Añadir **dentro de** `export class BicycleService { ... }`:

```ts
// Si Brand no está importado, añadir arriba:
import { Brand } from '../brands/brand.model';

// DENTRO de BicycleService (el import va FUERA de la clase):
static async findWithBrands() {
  return Bicycle.findAll({
    include: [{
      model: Brand,  // Tabla relacionada
      as: 'brand'    // IGUAL que en associations.ts
    }],
    order: [['id', 'ASC']] // Ordenar por id ascendente
  });
}
```

### PASO C — `src/modules/bicycles/bicycle.controller.ts`

Asegúrate de que está importado `BicycleService`. Añade **dentro de** `BicycleController`:

```ts
static async getWithBrands(req: Request, res: Response, next: NextFunction) {
  try {
    // Llamamos al service que hace la consulta a MySQL.
    const datos = await BicycleService.findWithBrands();
    res.json(datos); // Devolvemos los resultados como JSON.
  } catch (error) {
    next(error); // El middleware gestiona el error.
  }
}
```

### PASO D — `src/modules/bicycles/bicycle.routes.ts`

```ts
// Pon esta ruta ANTES de router.get('/:id', ...),
// para que 'with-brands' no se confunda con un id.
router.get('/with-brands', BicycleController.getWithBrands);
```

### PASO E — Probar en Bruno (sin tocar el frontend)

1. Abre **Bruno** y crea o abre una **colección** para tu API.
2. Crea una petición nueva de tipo **GET**.
3. Escribe la URL `http://localhost:3000/api/bicycles/with-brands` (**solo si tu PORT es 3000**; si no, usa el puerto de tu `.env`).
4. Arranca el backend, pulsa **Send** y comprueba la respuesta: deberían aparecer bicicletas con su objeto `brand`.
5. Si recibes un error, comprueba primero la URL, el puerto, la ruta, el controller y los errores de la terminal.

**Para una petición POST o PUT en Bruno:** elige el método, abre **Body → JSON**, escribe el objeto JSON y pulsa **Send**. Para DELETE normalmente basta la URL con el ID; revisa cómo está definida tu ruta.

**REGLA DE ORO:** para cualquier consulta nueva, cambia **service + controller + routes**. La asociación solo si aún no existe.

## 3. ¿Qué relación me están pidiendo?

### 1:N — Uno tiene muchos (Brand → Bicycle)

```ts
// associations.ts
Brand.hasMany(Bicycle, { foreignKey: 'brandId', as: 'bicycles' });
Bicycle.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' });
```

**Dónde va la clave:** `brandId` en `Bicycle` (lado MUCHOS). En el modelo, declara `brandId` en la clase y en `.init(...)`.

### 1:1 — Uno tiene uno (Bicycle → BicycleDetail)

```ts
Bicycle.hasOne(BicycleDetail, { foreignKey: 'bicycleId', as: 'detail' });
BicycleDetail.belongsTo(Bicycle, { foreignKey: 'bicycleId', as: 'bicycle' });
```

**Dónde va la clave:** `bicycleId` en `BicycleDetail`. Si debe ser realmente 1:1, añade `unique: true` a esa columna (además de la clave foránea).

### N:M — Muchos a muchos (Order ↔ Bicycle)

```ts
// Hay una TABLA INTERMEDIA: OrderItem (orderId + bicycleId).
Order.belongsToMany(Bicycle, {
  through: OrderItem, foreignKey: 'orderId', otherKey: 'bicycleId', as: 'bicycles'
});
Bicycle.belongsToMany(Order, {
  through: OrderItem, foreignKey: 'bicycleId', otherKey: 'orderId', as: 'orders'
});
// Si queremos consultar también directamente los renglones de la tabla intermedia:
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Bicycle.hasMany(OrderItem, { foreignKey: 'bicycleId', as: 'orderItems' });
OrderItem.belongsTo(Bicycle, { foreignKey: 'bicycleId', as: 'bicycle' });
```

**Truco:** `foreignKey` = columna de la tabla intermedia que apunta al modelo desde el que haces la asociación. `otherKey` = columna que apunta al otro modelo. **No repitas estas asociaciones:** ya existen en tu proyecto.

## 4. Consultas que pueden caer: SOLO cambia el método del SERVICE

En todos los casos, después **crea el controller y la route como en el apartado 2**, cambiando el nombre y los parámetros.

### A) Todos, uno, filtros y orden

```ts
// Todos
return Bicycle.findAll();
// Uno por id
return Bicycle.findByPk(id);
// Precio mayor que 500: importar Op desde 'sequelize'
return Bicycle.findAll({ where: { price: { [Op.gt]: 500 } } });
// Stock entre 1 y 10
return Bicycle.findAll({ where: { stock: { [Op.between]: [1, 10] } } });
// Orden descendente por precio
return Bicycle.findAll({ order: [['price', 'DESC']] });
// Solo ciertas columnas
return Bicycle.findAll({ attributes: ['id', 'model', 'price'] });
// Paginación: 10 primeros, saltando 10
return Bicycle.findAll({ limit: 10, offset: 10 });
```

### B) Buscar texto (`Op.like`)

```ts
import { Op } from 'sequelize'; // Import arriba del service.

// Busca bicicletas cuyo modelo contenga el texto recibido.
static async searchByModel(texto: string) {
  return Bicycle.findAll({
    where: { model: { [Op.like]: `%${texto}%` } }
  });
}
```

**Controller** (dentro de BicycleController):

```ts
static async searchByModel(req: Request, res: Response, next: NextFunction) {
  try {
    const texto = String(req.params.texto); // Lee :texto de la URL.
    res.json(await BicycleService.searchByModel(texto));
  } catch (error) { next(error); }
}
```

**Routes** (ANTES de `/:id`):

```ts
router.get('/search/:texto', BicycleController.searchByModel);
```

**Bruno:** `GET /api/bicycles/search/Trek` (con el host y puerto de tu servidor).

### C) Filtrar usando OTRA tabla (1:1)

```ts
// En BicycleService: importa BicycleDetail si falta.
static async byMaterial(material: string) {
  return Bicycle.findAll({
    include: [{
      model: BicycleDetail,
      as: 'detail',                 // Alias definido en associations.ts
      where: { frameMaterial: material }, // Filtra en la tabla relacionada
      required: true               // Solo bicicletas con detalle coincidente
    }]
  });
}
```

**Controller:** lee `req.params.material`, llama `BicycleService.byMaterial(material)` y responde `res.json(...)`. **Route:** `router.get('/material/:material', BicycleController.byMaterial);` antes de `/:id`. **Bruno:** `GET /api/bicycles/material/Carbon`.

### D) Pedidos de un cliente, ordenados (1:N)

```ts
// En OrderService: importar Customer si falta.
static async byCustomer(customerId: number) {
  return Order.findAll({
    where: { customerId },  // Filtrar pedidos por cliente
    include: [{ model: Customer, as: 'customer', attributes: ['id', 'name', 'email'] }],
    order: [['orderDate', 'DESC']] // Más recientes primero
  });
}
```

**Controller:** `const id = Number(req.params.customerId);` → `res.json(await OrderService.byCustomer(id));` dentro de `try/catch`. **Route:** `router.get('/customer/:customerId', OrderController.byCustomer);` antes de `/:id`. **Bruno:** `GET /api/orders/customer/1`.

### E) Pedidos con bicicletas (N:M)

```ts
// En OrderService: importar Bicycle si falta.
static async withBicycles() {
  return Order.findAll({
    include: [{ model: Bicycle, as: 'bicycles' }] // Pasa por OrderItem
  });
}
```

**Controller:** `res.json(await OrderService.withBicycles())` dentro de `try/catch`. **Route:** `router.get('/with-bicycles', OrderController.withBicycles);` antes de `/:id`.

### F) Tres tablas (Order → Customer y Order → Bicycle → Brand)

```ts
// En OrderService: importar Customer, Bicycle y Brand si faltan.
static async fullOrders() {
  return Order.findAll({
    include: [
      { model: Customer, as: 'customer' },
      { model: Bicycle, as: 'bicycles', include: [
        { model: Brand, as: 'brand' }
      ] }
    ]
  });
}
```

**Controller:** `res.json(await OrderService.fullOrders())` dentro de `try/catch`. **Route:** `router.get('/full', OrderController.fullOrders);` antes de `/:id`.

### G) Estadísticas

```ts
// Total de bicicletas
return Bicycle.count();
// Precio medio (puede devolver número o null)
return Bicycle.avg('price');
// Stock total
return Bicycle.sum('stock');
// Precio máximo y mínimo
return Bicycle.max('price');
return Bicycle.min('price');
```

Para devolver estadísticas juntas, haz un método `static async stats()` en BicycleService que devuelva `{ total: await Bicycle.count(), media: await Bicycle.avg('price'), stock: await Bicycle.sum('stock') }`. Luego controller y route como en el apartado 2.

## 5. Si piden un MÓDULO NUEVO (por ejemplo Payments)

**No inventes una arquitectura:** abre `src/modules/brands/` y copia el patrón de sus cuatro archivos. Sustituye nombres y campos.

1. **`payment.model.ts`:** copia la estructura de `brand.model.ts`; cambia `Brand` por `Payment`, `tableName` a `'payments'`, y define en la clase y en `.init(...)` los campos `id`, `orderId`, `amount`, `method` y fechas. `orderId` será `DataTypes.INTEGER.UNSIGNED`, `amount` puede ser `DataTypes.DECIMAL(10, 2)`, `method` `DataTypes.STRING`.
2. **`payment.service.ts`:** copia el patrón de `brand.service.ts`. Usa `Payment.findAll()`, `Payment.findByPk(id)`, `Payment.create(data)`, `payment.update(data)` y `payment.destroy()`.
3. **`payment.controller.ts`:** copia el patrón de `brand.controller.ts`. Cambia `BrandService` por `PaymentService`, y lee `orderId`, `amount`, `method` de `req.body` al crear.
4. **`payment.routes.ts`:** copia `brand.routes.ts`. Cambia `BrandController` por `PaymentController`. Mantén GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`.
5. **`src/routes/index.ts`:** importa `paymentRoutes` desde `../modules/payments/payment.routes` y añade `router.use('/payments', paymentRoutes);`.
6. **`src/server.ts`:** añade `import './modules/payments/payment.model';` con los otros imports de modelos.
7. **`src/models/associations.ts`:** importa `Payment` y añade:

```ts
// Un pedido puede tener muchos pagos; un pago pertenece a un pedido.
Order.hasMany(Payment, { foreignKey: 'orderId', as: 'payments' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
```

8. **Bruno:** primero asegúrate de que existe el pedido con ID `1`. Crea una petición **POST** a `http://localhost:3000/api/payments` (ajusta el puerto). En **Body → JSON** escribe:

```json
{
  "orderId": 1,
  "amount": 50,
  "method": "card"
}
```

Pulsa **Send**. Luego crea una petición **GET** a `http://localhost:3000/api/payments` para comprobar que se ha guardado. Estos endpoints solo funcionarán cuando hayas creado y registrado el módulo Payments.

**Nota:** Payments es un **ejemplo nuevo**, no un módulo ya presente en tu proyecto. Copiar los cuatro archivos exige adaptar también los nombres de los métodos, los tipos y las validaciones; no basta con renombrar el archivo.

## 6. Errores típicos: mirar aquí antes de desesperarse

| Error | Qué revisar |
|---|---|
| `... is not associated to ...` | Falta asociación, falta import o `as` distinto en `include`. |
| `Cannot GET /api/...` | ¿Existe la ruta? ¿Está registrada en `routes/index.ts`? ¿Pusiste la ruta especial ANTES de `/:id`? |
| `Unknown column` | ¿Existe el campo en `.init(...)`? ¿Coincide `foreignKey`? ¿Se actualizó la tabla? |
| `Cannot find name` | Falta importar el modelo, `Op` o la clase service. |
| `404` buscando id | Comprueba que el registro existe y que el parámetro es correcto. |
| Datos desaparecen al reiniciar | Tu `server.ts` usa `sequelize.sync({ force: true })`: **elimina y recrea tablas**. No lo uses con datos que quieras conservar. |

## 7. Checklist final del examen

- [ ] El módulo nuevo tiene sus **4 archivos**.
- [ ] El modelo tiene los campos en la clase y en `.init(...)`.
- [ ] He registrado modelo en `server.ts` y rutas en `routes/index.ts` **solo si el módulo es nuevo**.
- [ ] La clave foránea está en la tabla correcta.
- [ ] La asociación está en `associations.ts`.
- [ ] En `include`, el `as` es idéntico al de la asociación.
- [ ] La consulta nueva tiene **service + controller + route**.
- [ ] Las rutas especiales van **antes de `/:id`**.
- [ ] He probado el endpoint en Bruno.
- [ ] He comprobado los errores de terminal antes de entregar.

**RECUERDA:** `MODEL = tabla` · `ASSOCIATIONS = relaciones` · `SERVICE = consulta` · `CONTROLLER = petición/respuesta` · `ROUTES = URL`.


---

# 8. ASOCIACIONES SIN LIARSE (LEE ESTO SI EL PROFESOR PIDE UNA RELACIÓN)

## Paso 1: traducir la frase

| Frase del examen | Tipo | Código en `src/models/associations.ts` | ¿Dónde está el `...Id`? |
|---|---|---|---|
| «Una marca tiene muchas bicicletas» | 1:N | `Brand.hasMany(Bicycle)` + `Bicycle.belongsTo(Brand)` | `brandId` en **Bicycle** |
| «Una bicicleta tiene una ficha técnica» | 1:1 | `Bicycle.hasOne(BicycleDetail)` + `BicycleDetail.belongsTo(Bicycle)` | `bicycleId` en **BicycleDetail** |
| «Un pedido tiene muchas bicicletas y una bicicleta muchos pedidos» | N:M | `belongsToMany` en ambos lados, con `through: OrderItem` | `orderId` y `bicycleId` en **OrderItem** |

**Traducción:** `hasOne` = tiene uno; `hasMany` = tiene muchos; `belongsTo` = pertenece a uno; `belongsToMany` = muchos con muchos.

## Paso 2: ¿qué significa cada palabra?

- `foreignKey: 'brandId'`: **nombre real de la columna** que conecta las tablas.
- `as: 'brand'`: **apodo** de la relación; en el `include` debe escribirse **exactamente igual**.
- `through: OrderItem`: tabla intermedia de una relación N:M.
- `otherKey: 'bicycleId'`: la **otra** clave de la tabla intermedia.

## Paso 3: copiar el patrón que toque (dentro de `defineAssociations()`)

**1:N — Marca y bicicletas** (ya existe: NO duplicar):

```ts
// Una marca tiene muchas bicicletas.
Brand.hasMany(Bicycle, {
  foreignKey: 'brandId', // Esta columna está en Bicycle
  as: 'bicycles'          // Alias plural: colección de bicicletas
});
// Cada bicicleta pertenece a una marca.
Bicycle.belongsTo(Brand, {
  foreignKey: 'brandId', // MISMA columna
  as: 'brand'             // Alias singular: una marca
});
```

**1:1 — Bicicleta y detalle** (ya existe: NO duplicar):

```ts
Bicycle.hasOne(BicycleDetail, {
  foreignKey: 'bicycleId', // Está en BicycleDetail
  as: 'detail'             // Alias para consultar el detalle
});
BicycleDetail.belongsTo(Bicycle, {
  foreignKey: 'bicycleId',
  as: 'bicycle'
});
// Si quieres impedir DOS fichas para una bicicleta,
// bicycleId debe tener UNIQUE en la base de datos/modelo.
```

**N:M — Pedidos y bicicletas** (ya existe: NO duplicar):

```ts
Order.belongsToMany(Bicycle, {
  through: OrderItem,       // Tabla intermedia
  foreignKey: 'orderId',    // Columna del pedido en OrderItem
  otherKey: 'bicycleId',    // Columna de la bicicleta en OrderItem
  as: 'bicycles'            // Desde Order quiero sus bicicletas
});
Bicycle.belongsToMany(Order, {
  through: OrderItem,
  foreignKey: 'bicycleId',  // ¡Aquí se invierten las claves!
  otherKey: 'orderId',
  as: 'orders'              // Desde Bicycle quiero sus pedidos
});
```

**Si la relación es NUEVA:** importa los dos modelos arriba de `associations.ts`, añade estas líneas **dentro** de `defineAssociations()`, y declara el campo `...Id` en el modelo correspondiente (propiedad TypeScript y definición `.init`). En N:M crea primero el modelo de la tabla intermedia. Comprueba que el servidor importa el modelo nuevo y llama a `defineAssociations()` antes de sincronizar.

# 9. CONSULTA NUEVA: LOS 3 ARCHIVOS QUE HAY QUE RELLENAR

**Regla del examen:** `SERVICE` busca → `CONTROLLER` recibe/responde → `ROUTES` crea la URL. Si la relación ya existe, **NO cambies** `associations.ts` ni `server.ts`.

## Ejemplo A: «Mostrar bicicletas de una marca con los datos de la marca»

**A1. `src/modules/bicycles/bicycle.service.ts`**. Añade el método **dentro de `BicycleService`**. El import de Brand va **arriba del archivo**, si no está ya.

```ts
// ARRIBA: import { Brand } from '../brands/brand.model';
// DENTRO DE class BicycleService:
static async findByBrandIdWithBrand(brandId: number) {
  return Bicycle.findAll({
    where: { brandId },       // Solo bicicletas de esa marca
    include: [{
      model: Brand,           // Tabla que quiero unir
      as: 'brand'             // Igual que Bicycle.belongsTo(... as: 'brand')
    }],
    order: [['id', 'ASC']]    // De menor a mayor ID
  });
}
```

**A2. `src/modules/bicycles/bicycle.controller.ts`**. Añade **dentro de `BicycleController`**:

```ts
static async getByBrandIdWithBrand(req: Request, res: Response, next: NextFunction) {
  try {
    const brandId = Number(req.params.brandId); // Leer número de la URL
    if (!Number.isInteger(brandId) || brandId <= 0) {
      res.status(400).json({ message: 'brandId no válido' });
      return;
    }
    const datos = await BicycleService.findByBrandIdWithBrand(brandId);
    res.json(datos);          // Mandar resultado a Bruno
  } catch (error) {
    next(error);              // Pasar error al middleware
  }
}
```

**A3. `src/modules/bicycles/bicycle.routes.ts`**. Añade **ANTES** de `router.get('/:id', ...)`:

```ts
router.get('/by-brand/:brandId', BicycleController.getByBrandIdWithBrand);
// :brandId es un parámetro que lee req.params.brandId
```

**A4. Bruno:** `GET http://localhost:3000/api/bicycles/by-brand/1` (ajusta el puerto). **No se crea ruta nueva en `routes/index.ts`** porque bicycles ya está registrado.

## Ejemplo B: «Bicicletas cuyo detalle tiene material Carbon» (1:1)

**B1. Service**: ya tienes un método muy parecido, `findAllEagerlyByFrameMaterial`. El patrón es:

```ts
// Dentro de BicycleService:
static async findByMaterial(material: string) {
  return Bicycle.findAll({
    include: [{
      model: BicycleDetail,
      as: 'detail',              // Alias definido en Bicycle.hasOne
      where: { frameMaterial: material }, // Filtrar tabla asociada
      required: true            // Solo bicis que tengan detalle coincidente
    }]
  });
}
```

**B2. Controller**:

```ts
// Dentro de BicycleController:
static async getByMaterial(req: Request, res: Response, next: NextFunction) {
  try {
    const material = String(req.params.material);
    const datos = await BicycleService.findByMaterial(material);
    res.json(datos);
  } catch (error) { next(error); }
}
```

**B3. Routes**: antes de `/:id`:

```ts
router.get('/by-material/:material', BicycleController.getByMaterial);
```

**B4. Bruno:** `GET http://localhost:3000/api/bicycles/by-material/Carbon`.

## Ejemplo C: «Pedidos con su cliente y bicicletas» (3 tablas y N:M)

**C1. `src/modules/orders/order.service.ts`**. Importa `Customer` y `Bicycle` arriba, si faltan; dentro de `OrderService` añade:

```ts
static async findWithCustomerAndBicycles() {
  return Order.findAll({
    include: [
      { model: Customer, as: 'customer' }, // Order.belongsTo(Customer)
      { model: Bicycle, as: 'bicycles' }   // Order.belongsToMany(Bicycle)
    ],
    order: [['id', 'ASC']]
  });
}
```

**C2. `src/modules/orders/order.controller.ts`**. Dentro de `OrderController`:

```ts
static async getWithCustomerAndBicycles(req: Request, res: Response, next: NextFunction) {
  try {
    const datos = await OrderService.findWithCustomerAndBicycles();
    res.json(datos);
  } catch (error) { next(error); }
}
```

**C3. `src/modules/orders/order.routes.ts`**. Antes de `/:id`:

```ts
router.get('/with-relations', OrderController.getWithCustomerAndBicycles);
```

**C4. Bruno:** `GET http://localhost:3000/api/orders/with-relations`.

## Cómo transformar cualquier consulta sin perderte

| El profesor pide... | Qué cambio en el **SERVICE** | ¿Controller y Routes? |
|---|---|---|
| «Solo los que tengan precio mayor que 100» | `where: { price: { [Op.gt]: 100 } }` | Crear método en ambos; importar `Op` de `sequelize` en service |
| «Nombre contiene 'bi'» | `where: { name: { [Op.like]: '%bi%' } }` | Leer `req.params.texto` y crear `'/buscar/:texto'` |
| «Ordenar de más reciente a antiguo» | `order: [['orderDate', 'DESC']]` | Igual que cualquier consulta nueva |
| «Traer marca y detalles» | `include: [{model: Brand, as:'brand'}, {model: BicycleDetail, as:'detail'}]` | Igual; los dos alias deben existir |
| «Solo campos nombre y email del cliente» | Dentro del `include` de Customer: `attributes: ['name','email']` | Igual |
| «Solo registros con relación existente» | En el `include`: `required: true` | Igual |
| «Limitar a diez» | `limit: 10` | Igual |

**ATENCIÓN:** la tabla anterior son *trozos* de consultas para adaptar, no métodos completos. Para hacer una consulta nueva siempre usa el esquema A/B/C: **service → controller → routes → Bruno**.

# 10. MINI-CHECKLIST DE 30 SEGUNDOS

1. ¿He leído si me piden **una asociación nueva** o **solo una consulta**?
2. ¿El `...Id` está en la tabla correcta? ¿Está en la clase y en `.init()`?
3. ¿`as` en `include` coincide letra por letra con `associations.ts`?
4. ¿Puse el método dentro de la clase **Service** y sus imports arriba?
5. ¿Puse el método dentro de **Controller** y llamo al Service?
6. ¿Puse la URL en **Routes**, antes de `/:id`?
7. ¿El módulo ya existe? Entonces **NO** volver a registrarlo en `server.ts` ni `routes/index.ts`.
8. ¿He probado en **Bruno** y mirado el error de la terminal si falla?

**Ojo con tu proyecto:** en `bicycle.routes.ts` ya hay rutas `'/eagerly/...'` escritas después de `/:id`. Para las nuevas rutas usa el orden seguro: **rutas específicas primero; `/:id` después**. Si haces una consulta con un `id` o una ruta especial, revisa el orden.

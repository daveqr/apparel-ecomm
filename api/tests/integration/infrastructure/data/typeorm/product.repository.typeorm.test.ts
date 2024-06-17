import {DataSource} from "typeorm";
import {CategoryEntity} from "../../../../../src/infrastructure/data/typeorm/entities/category.entity";
import {ProductEntity} from "../../../../../src/infrastructure/data/typeorm/entities/product.entity";
import TypeORMProductRepository from "../../../../../src/infrastructure/data/typeorm/product.repository.typeorm";
import {v4 as uuidv4} from "uuid";
import {faker} from "@faker-js/faker";
import Product from "../../../../../src/core/models/product.model";

const testDataSource = new DataSource({
    type: "sqlite",
    database: ":memory:",
    synchronize: true,
    entities: [CategoryEntity, ProductEntity],
    logging: false,
});

beforeAll(async () => {
    await testDataSource.initialize();
});

afterAll(async () => {
    await testDataSource.destroy();
});

beforeEach(async () => {
    await testDataSource.synchronize(true);
});

describe("TypeORMProductRepository", () => {
    let productRepository: TypeORMProductRepository;

    beforeEach(() => {
        productRepository = new TypeORMProductRepository(testDataSource);
    });

    async function populateSingleProduct() {
        const categoryEntity = new CategoryEntity();
        categoryEntity.name = faker.lorem.word();
        categoryEntity.description = faker.lorem.sentence();
        categoryEntity.slug = faker.lorem.slug();
        categoryEntity.uuid = uuidv4();

        const productEntity = new ProductEntity();
        productEntity.name = faker.commerce.productName();
        productEntity.description = faker.lorem.paragraph();
        productEntity.categories = [categoryEntity];
        productEntity.slug = faker.lorem.slug();
        productEntity.uuid = uuidv4();
        categoryEntity.products = [productEntity];

        await testDataSource.getRepository(ProductEntity).save(productEntity);
        await testDataSource.getRepository(CategoryEntity).save(categoryEntity);

        return productEntity;
    }

    it('should find products', async () => {
        // Given
        const productEntity1 = await populateSingleProduct();
        const productEntity2 = await populateSingleProduct();

        // When
        const products = await productRepository.find();

        // Then
        expect(products).toHaveLength(2);

        expect(products[0].name).toBe(productEntity1.name);
        expect(products[0].description).toBe(productEntity1.description);
        expect(products[0].categories).toHaveLength(1);
        expect(products[0].categories[0].name).toBe(productEntity1.categories[0].name);

        expect(products[1].name).toBe(productEntity2.name);
        expect(products[1].description).toBe(productEntity2.description);
        expect(products[1].categories).toHaveLength(1);
        expect(products[1].categories[0].name).toBe(productEntity2.categories[0].name);
    });

    it('should find product by uuid', async () => {
        // Given
        const productEntity = await populateSingleProduct();

        // When
        const foundProduct = await productRepository.findByUuid(productEntity.uuid);

        // Then
        expect(foundProduct).not.toBeNull();
        expect(foundProduct).toBeInstanceOf(Product);
        expect(foundProduct?.uuid).toBe(foundProduct?.uuid);
        expect(foundProduct?.name).toBe(foundProduct?.name);
        expect(foundProduct?.description).toBe(foundProduct?.description);
        expect(foundProduct?.categories).toHaveLength(1);
        expect(foundProduct?.categories[0].name).toBe(foundProduct?.categories[0].name);
    });

    it('should return null when product with non-existent UUID is queried', async () => {
        // Given
        const productEntity = await populateSingleProduct();

        // When
        const foundProduct = await productRepository.findByUuid("unknown");

        // Then
        expect(foundProduct).toBeNull();
    });
});
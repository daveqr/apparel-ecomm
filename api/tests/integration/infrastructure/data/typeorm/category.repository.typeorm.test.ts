import {DataSource} from "typeorm";
import {CategoryEntity} from "../../../../../src/infrastructure/data/typeorm/entities/category.entity";
import {ProductEntity} from "../../../../../src/infrastructure/data/typeorm/entities/product.entity";
import HighlightedCategoryEntity
    from "../../../../../src/infrastructure/data/typeorm/entities/highlighted-category.entity";
import TypeORMCategoryRepository from "../../../../../src/infrastructure/data/typeorm/category.repository.typeorm";

const testDataSource = new DataSource({
    type: "sqlite",
    database: ":memory:",
    synchronize: true,
    entities: [CategoryEntity, ProductEntity, HighlightedCategoryEntity],
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

describe("SQLiteCategoryRepository", () => {
    let repository: TypeORMCategoryRepository;

    beforeEach(() => {
        repository = new TypeORMCategoryRepository(testDataSource);
    });

    async function createTestProductAndAssociateWithCategory(category: CategoryEntity) {
        const product = new ProductEntity();
        product.name = "Test Product";
        product.slug = "test-product";
        category.products = [product];

        await testDataSource.getRepository(ProductEntity).save(product);
        await testDataSource.getRepository(CategoryEntity).save(category);
    }

    it("should find categories", async () => {
        // Given
        const category = new CategoryEntity();
        category.name = "Test Category";
        category.slug = "test-category";

        await createTestProductAndAssociateWithCategory(category);

        // When
        const categories = await repository.find();

        // Then
        expect(categories.length).toBe(1);
        expect(categories[0].name).toBe("Test Category");
        expect(categories[0].products.length).toBe(1);
        expect(categories[0].products[0].name).toBe("Test Product");
    });

    it("should find highlighted categories", async () => {
        // Given
        const category = new CategoryEntity();
        category.name = "Test Category";
        category.slug = "test-category";

        const highlighted = new HighlightedCategoryEntity(category);
        highlighted.position = 1;

        await createTestProductAndAssociateWithCategory(category);
        await testDataSource.getRepository(HighlightedCategoryEntity).save(highlighted);

        // When
        const highlightedCategories = await repository.findHighlightedCategories();

        // Then
        expect(highlightedCategories.length).toBe(1);
        expect(highlightedCategories[0].name).toBe("Test Category");
        expect(highlightedCategories[0].products.length).toBe(1);
        expect(highlightedCategories[0].products[0].name).toBe("Test Product");
        expect(highlightedCategories[0].position).toBe(1);
    });
});

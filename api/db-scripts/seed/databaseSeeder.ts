import {AppDataSource} from "../../src/data-source";
import {CategoryEntity} from "../../src/entities/category.entity";
import {ProductEntity} from "../../src/entities/product.entity";
import {Repository} from "typeorm";

// @ts-ignore
import categoriesData from './data/categories.json';

// @ts-ignore
import productsData from './data/products.json';
import slugify from "slugify";

const seedDatabase = async () => {
    async function insertProducts(categoryMap: {
        [key: string]: CategoryEntity
    }, productRepo: Repository<ProductEntity>) {
        const products = [];
        for (const productData of productsData) {
            const productCategories = productData.categories.map((name: string) => categoryMap[name]);
            const product: ProductEntity = productRepo.create({
                ...productData,
                categories: productCategories
            }) as unknown as ProductEntity;
            product.slug = slugifyValue(product.name);
            products.push(product);
        }
        await productRepo.save(products);
    }

    function slugifyValue(value: string) {
        return slugify(value, {lower: true, remove: /[*+~.()'"!:@]/g});
    }

    async function insertCategories(categoryRepo: Repository<CategoryEntity>) {
        const categories = [];
        for (const categoryData of categoriesData) {
            const category: CategoryEntity = categoryRepo.create(categoryData) as unknown as CategoryEntity;
            category.slug = slugifyValue(category.name);
            categories.push(category);
        }
        await categoryRepo.save(categories);
        return categories;
    }

    function createCategoryMap(categories: any[]) {
        const categoryMap: { [key: string]: CategoryEntity } = {};
        for (const category of categories) {
            categoryMap[category.name] = category;
        }
        return categoryMap;
    }

    try {
        await AppDataSource.initialize();

        const productRepo = AppDataSource.getRepository(ProductEntity);
        const categoryRepo = AppDataSource.getRepository(CategoryEntity);
        await productRepo.clear();
        await categoryRepo.clear();

        const categories = await insertCategories(categoryRepo);
        const categoryMap = createCategoryMap(categories);
        await insertProducts(categoryMap, productRepo);

        console.log("Database seeded successfully");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        await AppDataSource.destroy();
    }
};

seedDatabase();

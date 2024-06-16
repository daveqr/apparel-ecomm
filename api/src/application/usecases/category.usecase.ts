import {CategoryRepository} from "../../domain/repositories/category.repository";
import {CategoryDto} from "../dtos/category.dto";
import CategoryService from "../../domain/services/category.service";
import Category from "../../domain/models/category.model";
import HighlightedCategory from "../../domain/models/highlighted-category.model";
import HighlightedCategoryDto from "../dtos/highlighted-category.dto";

class CategoryUseCase {
    private categoryRepository: CategoryRepository;
    private categoryService: CategoryService;

    constructor(categoryRepository: CategoryRepository, categoryService: CategoryService) {
        this.categoryRepository = categoryRepository;
        this.categoryService = categoryService;
    }

    async find(isDetailed: boolean): Promise<CategoryDto[]> {
        const categories: Category[] = await this.categoryService.findAllCategories(isDetailed);

        return categories.map(category => this.toCategoryDto(category));
    }

    async findHighlightedCategories(): Promise<HighlightedCategoryDto[]> {
        const categories: HighlightedCategory[] = await this.categoryService.findHighlightedCategories();

        return categories.map(category => this.toHighlightedCategoryDto(category));
    }

    async findCategoryById(categoryId: string): Promise<CategoryDto | null> {
        try {
            const category = await this.categoryRepository.findByIdWithProductLinks(categoryId);

            return category ? this.toCategoryDto(category) : null;
        } catch (error) {
            throw error;
        }
    }

    private toHighlightedCategoryDto(category: HighlightedCategory): HighlightedCategoryDto {
        const categoryDto = new HighlightedCategoryDto();

        categoryDto.uuid = category.uuid;
        categoryDto.name = category.name;
        categoryDto.slug = category.slug;
        categoryDto.position = category.position;
        categoryDto.description = category.description;
        categoryDto.products = category.products;

        return categoryDto;
    }

    private toCategoryDto(category: Category): CategoryDto {
        const categoryDto = new CategoryDto();

        categoryDto.uuid = category.uuid;
        categoryDto.name = category.name;
        categoryDto.slug = category.slug;
        categoryDto.description = category.description;
        categoryDto.products = category.products;

        // if (isDetailed) {
        //     categoryDTO.editionName = category.edition.name;
        //     categoryDTO.editionDescription = category.edition.description;
        //     categoryDTO.products = category.products.map(product => {
        //         const productDTO = new ProductDTO();
        //         productDTO.id = product._id;
        //         productDTO.name = product.name;
        //         return productDTO;
        //     });
        // }

        return categoryDto;
    }
}

export default CategoryUseCase;
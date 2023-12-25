import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const newProduct = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
      });
      await this.productRepository.save(newProduct);
      return { ...newProduct, images };
    } catch (error) {
      this.handlerDBException(error, 'Unexpected error creating product');
    }
  }

  async findAll(paginationDTO: PaginationDTO) {
    const { limit = 10, offset = 0 } = paginationDTO;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: ['images'],
      order: {
        title: 'ASC',
      },
    });

    return products.map((product) => ({
      ...product,
      images: product.images.map((image) => image.url),
    }));
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term))
      product = await this.productRepository.findOneBy({ id: term });
    else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where(
          'LOWER(title) LIKE LOWER(:title) or LOWER(slug) LIKE LOWER(:slug)',
          {
            title: `%${term.trim()}%`,
            slug: `%${term.trim()}%`,
          },
        )
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
      // product = await this.productRepository.findOneBy({ slug: term });
    }

    if (!product) throw new NotFoundException(`Product with ${term} not found`);
    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...product } = await this.findOne(term);
    return {
      ...product,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toProductUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toProductUpdate,
    });

    if (!product) throw new NotFoundException(`Product with ${id} not found`);

    // create query runner
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handlerDBException(error, 'Unexpected error updating product');
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handlerDBException(error: any, message: string) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    if (error.code === '23503') throw new BadRequestException(error.detail);
    if (error.code === '23502') throw new BadRequestException(error.detail);
    console.log(error);
    this.logger.error(error);
    throw new InternalServerErrorException(message);
  }
}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const newProduct = this.productRepository.create(createProductDto);
      await this.productRepository.save(newProduct);
      return newProduct;
    } catch (error) {
      this.handlerDBException(error, 'Unexpected error creating product');
    }
  }

  // TODO: Paginar los resultados
  findAll(paginationDTO: PaginationDTO) {
    const { limit = 10, offset = 0 } = paginationDTO;
    return this.productRepository.find({
      take: limit,
      skip: offset,
      // TODO: Relaciones
      order: {
        title: 'ASC',
      },
    });
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term))
      product = await this.productRepository.findOneBy({ id: term });
    else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where(
          'LOWER(title) LIKE LOWER(:title) or LOWER(slug) LIKE LOWER(:slug)',
          {
            title: `%${term.trim()}%`,
            slug: `%${term.trim()}%`,
          },
        )
        .getOne();
      // product = await this.productRepository.findOneBy({ slug: term });
    }

    if (!product) throw new NotFoundException(`Product with ${term} not found`);
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product ${updateProductDto}`;
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

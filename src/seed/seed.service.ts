import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productService: ProductsService) {}

  async runSeed() {
    await this.insertNewProducts();
    return 'Seed executed';
  }

  private async insertNewProducts() {
    await this.productService.deleteAllProducts();

    const seedProducts = initialData.products;
    const insertPromise = [];

    seedProducts.forEach((seedProduct) => {
      insertPromise.push(this.productService.create(seedProduct));
    });

    await Promise.all(insertPromise);

    return true;
  }
}

import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {
  getStaticFile(type: string, fileName: string) {
    const path = join(__dirname, '../../../static/', type, fileName);
    console.log(path, existsSync(path));
    if (!existsSync(path)) {
      throw new BadRequestException('Image not found');
    }

    return path;
  }
}

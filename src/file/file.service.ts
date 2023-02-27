import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import multer, { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { v4 as uuid } from 'uuid';
import { File } from './entities/file.entity';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File) private readonly filerepository: Repository<File>,
  ) {}
  async create(
    file: Express.Multer.File,
    entityData: Partial<File>,
  ): Promise<any> {
    const fileName = uuid() + extname(file.originalname);
    const fileUrl = `uploads/${fileName}`;

    const entity = new File();

    entity.name = entityData.name;
    entity.description = entityData.description;
    entity.url = fileUrl;
    entity.type = file.mimetype;

    const storage = diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        cb(null, fileName);
      },
    });

    await this.filerepository.save(entity);

    return new Promise((resolve) => {
      const upload = multer({ storage }).single('file');
      return resolve(upload);
    });
  }

  async findAll(
    page = 1,
    perPage = 12,
  ): Promise<{
    items: File[];
    totalCount: number;
    page: number;
    perPage: number;
  }> {
    const [items, totalCount] = await this.filerepository.findAndCount({
      take: perPage,
      skip: (page - 1) * perPage,
      where: { deletedAt: null },
      order: { createdAt: 'DESC' },
    });
    return { items, totalCount, page, perPage };
  }

  async findOne(id: string): Promise<any> {
    const fileId = await this.filerepository.findOneBy({ id });
    if (!fileId) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
  }

  async search(query: string): Promise<{ items: File[]; totalCount: number }> {
    const [items, totalCount] = await this.filerepository.findAndCount({
      where: [{ name: `%${query}%` }, { description: `%${query}%` }],
      order: { createdAt: 'DESC' },
    });
    return { items, totalCount };
  }

  async update(id: string, file: File): Promise<any> {
    const updateId = await this.filerepository.update(id, file);
    if (!updateId) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
  }

  async remove(id: string): Promise<void> {
    const deleteId = await this.filerepository.delete({ id });
    if (!deleteId) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
  }
}

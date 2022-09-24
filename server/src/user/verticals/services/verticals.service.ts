import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import findIndex from 'lodash/findIndex';
import { AdminJwtPayload } from '../../../authentication/types/jwt-payload.types';
import { Repository } from 'typeorm';
import { Vertical } from '../entities/vertical.entity';
import { CreateVerticalDto } from '../validation/create-vertical.dto';

@Injectable()
export class VerticalsService {

  constructor(
    @InjectRepository(Vertical)
    private readonly verticalModal: Repository<Vertical>
  ) { }

  async getAllVerticals(userId: string) {
    return this.verticalModal.find({
      where: {
        contractor: userId
      }
    });
  }

  async create(createVerticalDto: CreateVerticalDto, user: AdminJwtPayload) {
    const verticals = await this.getAllVerticals(user.id);
    for (let name of createVerticalDto.name) {
      if (findIndex(verticals, { name }) === -1) {
        const vertical = await this.verticalModal.create({
          name,
          contractor: user.id
        });
        await this.verticalModal.save(vertical);
      }
    }
    return this.getAllVerticals(user.id);
  }

  async delete(id: string, user: AdminJwtPayload) {
    const vertical = await this.verticalModal.find({
      where: {
        id: id,
        contractor: user.id
      }
    });
    if (!vertical) {
      throw new NotFoundException(`Vertical with id #${id} not found`);
    }
    return this.verticalModal.remove(vertical);
  }
}

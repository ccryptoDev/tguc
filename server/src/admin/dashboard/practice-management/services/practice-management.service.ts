import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  getRepository,
  Repository,
  WhereExpressionBuilder,
} from 'typeorm';

import moment from 'moment';

import { PracticeManagement } from '../entities/practice-management.entity';
import { LoggerService } from '../../../../logger/services/logger.service';
import GetAllPracticeManagementsDto from '../validation/getAllPracticeManagements.dto';
import AddPracticeManagementDto from '../validation/addPracticeManagement.dto';
import { AppService } from '../../../../app.service';
import { State } from '../../../../user/entities/state.entity';
import UpdatePracticeManagementDto from '../validation/updatePracticeManagement.dto';

@Injectable()
export class PracticeManagementService {
  constructor(
    @InjectRepository(PracticeManagement)
    private readonly practiceManagementModel: Repository<PracticeManagement>,
    @InjectRepository(State)
    private readonly stateModel: Repository<State>,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  async getPracticeManagementByURL(url: string, requestId: string) {
    this.logger.log(
      'Getting practice management by url with params',
      `${PracticeManagementService.name}#getPracticeManagementByURL`,
      requestId,
    );
    const practice: PracticeManagement =
      await this.practiceManagementModel.findOne({
        where: {
          url,
        },
        select: ['id', 'practiceName', 'location', 'stateCode'],
      });
    if (!practice) {
      const errorMessage = `Could not find practice management for url ${url}`;
      this.logger.error(
        errorMessage,
        `${PracticeManagement.name}#getPracticeManagementByURL`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    this.logger.log(
      'Got practice management:',
      `${PracticeManagementService.name}#getPracticeManagementByURL`,
      requestId,
      practice,
    );

    return practice;
  }

  async getAllNames(requestId: string) {
    this.logger.log(
      'Getting all practice management names',
      `${PracticeManagementService.name}#getAllNames`,
      requestId,
    );
    const practiceNames: PracticeManagement[] =
      await this.practiceManagementModel.find({
        select: ['practiceName', 'id'],
        order: {
          practiceName: 'ASC',
        },
      });
    if (!practiceNames || practiceNames.length <= 0) {
      throw new NotFoundException(
        undefined,
        'Practice management collection is empty',
      );
    }
    this.logger.log(
      'Got practice management names:',
      `${PracticeManagementService.name}#getAllNames`,
      requestId,
      practiceNames,
    );

    return practiceNames;
  }

  async getAllPracticeManagements(
    getAllPracticeManagementsDto: GetAllPracticeManagementsDto,
    requestId: string,
  ) {
    this.logger.log(
      'Getting all practice managements with params:',
      `${PracticeManagementService.name}#getAllPracticeManagements`,
      requestId,
      { getAllPracticeManagementsDto },
    );
    const { page, perPage, search } = getAllPracticeManagementsDto;

    const practiceManagementsResponse: [PracticeManagement[], number] =
      await getRepository(PracticeManagement)
        .createQueryBuilder('practiceManagement')
        .where(
          new Brackets((whereExpressionBuilder: WhereExpressionBuilder) => {
            whereExpressionBuilder.where(
              'practiceManagement.isDeleted = :isDeleted',
              { isDeleted: false },
            );

            if (search) {
              whereExpressionBuilder.andWhere(
                new Brackets(
                  (andWhereExpressionBuilder: WhereExpressionBuilder) => {
                    andWhereExpressionBuilder
                      .where(`practiceManagement.region ILIKE '%${search}%'`)
                      .orWhere(
                        `practiceManagement.managementRegion ILIKE '%${search}%'`,
                      )
                      .orWhere(
                        `practiceManagement.location ILIKE '%${search}%'`,
                      )
                      .orWhere(`practiceManagement.address ILIKE '%${search}%'`)
                      .orWhere(`practiceManagement.city ILIKE '%${search}%'`)
                      .orWhere(`practiceManagement.zip ILIKE '%${search}%'`)
                      .orWhere(`practiceManagement.phone ILIKE '%${search}%'`)
                      .orWhere(`practiceManagement.name ILIKE '%${search}%'`)
                      .orWhere(`practiceManagement.url ILIKE '%${search}%'`)
                      .orWhere(
                        `practiceManagement.regionalManager ILIKE '%${search}%'`,
                      );
                  },
                ),
              );
            }
          }),
        )
        .take(perPage)
        .skip((page - 1) * perPage)
        .orderBy('practiceManagement.createdAt', 'DESC')
        .getManyAndCount();
    const response = {
      items: practiceManagementsResponse[0],
      total: practiceManagementsResponse[1],
    };

    this.logger.log(
      'Got practice managements:',
      `${PracticeManagementService.name}#getAllPracticeManagements`,
      requestId,
      response,
    );

    return response;
  }

  async addPracticeManagement(
    addPracticeManagementDto: AddPracticeManagementDto,
    requestId: string,
  ) {
    this.logger.log(
      'Adding practice management with params: ',
      `${PracticeManagement.name}#addPracticeManagement`,
      requestId,
      addPracticeManagementDto,
    );

    const { address, zip, phone, stateCode } = addPracticeManagementDto;
    const isValidState = await this.stateModel.findOne({
      stateCode: stateCode,
    });
    if (!isValidState) {
      const errorMessage = 'Invalid state code';
      this.logger.error(
        errorMessage,
        `${PracticeManagement.name}#addPracticeManagement`,
        requestId,
      );
      throw new BadRequestException(
        this.appService.errorHandler(400, errorMessage, requestId),
      );
    }

    const existingPracticeManagement =
      await this.practiceManagementModel.findOne({
        where: [{ address }, { zip }, { phone }],
      });
    if (existingPracticeManagement) {
      const errorMessage = 'Practice management already exists';
      this.logger.error(
        errorMessage,
        `${PracticeManagement.name}#addPracticeManagement`,
        requestId,
      );
      throw new BadRequestException(
        this.appService.errorHandler(400, errorMessage, requestId),
      );
    }

    let newPracticeManagement = this.practiceManagementModel.create({
      ...addPracticeManagementDto,
    });
    newPracticeManagement = await this.practiceManagementModel.save(
      newPracticeManagement,
    );

    const response = {
      practiceManagementId: newPracticeManagement.id,
    };
    this.logger.log(
      'Added practice management: ',
      `${PracticeManagement.name}#addPracticeManagement`,
      requestId,
      newPracticeManagement,
    );

    return response;
  }

  async getPracticeManagementById(id: string, requestId: string) {
    this.logger.log(
      'Getting practice management with params:',
      `${PracticeManagement.name}#getPracticeManagementById`,
      requestId,
      { id },
    );
    const practiceManagementDocument: PracticeManagement | null =
      await this.practiceManagementModel.findOne(id);
    if (!practiceManagementDocument) {
      const errorMessage = `Could not find practice management for id ${id}`;
      this.logger.error(
        errorMessage,
        `${PracticeManagement.name}#getPracticeManagementById`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    this.logger.log(
      'Got practice management:',
      `${PracticeManagement.name}#getPracticeManagementById`,
      requestId,
      practiceManagementDocument,
    );

    return practiceManagementDocument;
  }

  async updatePracticeManagementById(
    id: string,
    updatePracticeManagementDto: UpdatePracticeManagementDto,
    requestId: string,
  ) {
    this.logger.log(
      'Updating practice management with params:',
      `${PracticeManagement.name}#updatePracticeManagementById`,
      requestId,
      { id, updatePracticeManagementDto },
    );

    if (updatePracticeManagementDto.openDate) {
      (updatePracticeManagementDto.openDate as any) = moment(
        updatePracticeManagementDto.openDate,
      ).toISOString();
    }

    const practiceManagement: PracticeManagement | null =
      await this.practiceManagementModel.findOne({ where: { id } });
    if (!practiceManagement) {
      const errorMessage = `Could not find practice management id ${id}`;
      this.logger.error(
        errorMessage,
        `${PracticeManagement.name}#updatePracticeManagementById`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    await this.practiceManagementModel.update(
      { id: id },
      updatePracticeManagementDto as any,
    );

    this.logger.log(
      'Updated admin:',
      `${PracticeManagement.name}#updatePracticeManagementById`,
      requestId,
      practiceManagement,
    );

    return practiceManagement;
  }
}

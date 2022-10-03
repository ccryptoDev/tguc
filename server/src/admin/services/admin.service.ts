import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import moment from 'moment';
import passwordGenerator from 'generate-password';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  getRepository,
  Repository,
  UpdateResult,
  WhereExpressionBuilder,
} from 'typeorm';

import { AppService } from '../../app.service';
import { LoggerService } from '../../logger/services/logger.service';
import { Roles } from '../../authentication/roles/entities/roles.entity';
import { Admin } from '../entities/admin.entity';
import { CreateAdminDto } from '../validation/create-admin.dto';
import { PracticeManagement } from '../dashboard/practice-management/entities/practice-management.entity';
import { SendGridService } from '../../email/services/sendgrid.service';
import { NunjucksService } from '../../html-parser/services/nunjucks.service';
import { AdminJwtPayload } from '../../authentication/types/jwt-payload.types';
import GetAllUsersDto from '../dashboard/validation/GetAllUsers.dto';
import { UpdateAdminDto } from '../validation/update-admin.dto';
import Config from '../../app.config';
import { Counters } from '../../counters/entities/counters.entity';
import { CountersService } from '../../counters/services/counters.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminModel: Repository<Admin>,
    @InjectRepository(Roles)
    private readonly rolesModel: Repository<Roles>,
    @InjectRepository(PracticeManagement)
    private readonly practiceManagementModel: Repository<PracticeManagement>,
    private readonly nunjucksService: NunjucksService,
    private readonly sendGridService: SendGridService,
    private readonly configService: ConfigService,
    private readonly countersService: CountersService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) { }

  async createAdmin(
    createAdminDto: CreateAdminDto,
    authUser: AdminJwtPayload,
    requestId: string,
  ) {
    const {
      userName,
      email,
      phoneNumber,
      role,
      practiceManagement: practiceManagementId,
      initialPassword,
    } = createAdminDto;
    this.logger.log(
      'Creating admin user with params:',
      `${AdminService.name}#createNewUser`,
      requestId,
      createAdminDto,
    );
    const user: Admin | null = await this.adminModel.findOne({
      where: {
        email,
      },
    });
    if (user) {
      const errorMessage = 'User already exists';
      this.logger.error(
        errorMessage,
        `${AdminService.name}#createNewUser`,
        requestId,
      );
      throw new BadRequestException(
        this.appService.errorHandler(400, errorMessage, requestId),
      );
    }

    const adminData: any = {};
    adminData.userName = userName;
    adminData.email = email;
    adminData.isDeleted = false;
    adminData.phoneNumber = phoneNumber;
    // const initialPassword: string = await this.generateInitialPassword();
    adminData.password = await this.generateEncryptedPassword(initialPassword);
    const prefix =
      role === 'Merchant Staff' ? 'AT' : role === 'Merchant' ? 'CTR' : 'AD';
    const userReferenceData: Counters =
      await this.countersService.getNextSequenceValue('admin', requestId);
    adminData.userReference = `${prefix}_${userReferenceData.sequenceValue}`;
    const roleDocument: Roles | null = await this.rolesModel.findOne({
      roleName: role,
    });
    if (!roleDocument) {
      const errorMessage = `Role ${role} not found`;
      this.logger.error(
        errorMessage,
        `${AdminService.name}#createNewUser`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    adminData.role = roleDocument.id;
    const practiceManagement: PracticeManagement | null =
      await this.practiceManagementModel.findOne(practiceManagementId);
    if (!practiceManagement) {
      this.logger.error(
        'Practice management not found',
        `${AdminService.name}#createNewUser`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Practice id ${PracticeManagement} not found`,
          requestId,
        ),
      );
    }
    adminData.practiceManagement = practiceManagement;
    let adminPayload = {
      userName: adminData.userName,
      email: adminData.email,
      isDeleted: adminData.isDeleted,
      phoneNumber: adminData.phoneNumber,
      password: adminData.password,
      role: adminData.role,
      userReference: adminData.userReference,
      practiceManagement: adminData.practiceManagement,
    };
    if (
      roleDocument.roleName === 'Merchant Staff' &&
      authUser.role === 'Merchant'
    ) {
      adminPayload = Object.assign(adminPayload, {
        contractor: authUser.id,
      });
    }
    const newAdmin: Admin = this.adminModel.create(adminPayload);
    await this.adminModel.save(newAdmin);

    const context = {
      userName: adminData.userName,
      email: adminData.email,
      password: initialPassword,
      roleName: roleDocument.roleName,
      businessName: practiceManagement?.practiceName,
      link: `${this.configService.get<string>('baseUrl')}/admin/login`,
      baseUrl: Config().baseUrl,
    };
    const template =
      context.roleName === 'Merchant'
        ? 'emails/application-contractor-approved.html'
        : (context.roleName === 'Merchant Staff'
          ? 'emails/agent-welcome.html'
          : 'emails/admin-welcome.html');

    const subject =
      context.roleName === 'Merchant'
      ? 'Welcome as a qualified TGUC Contractor!'
        : (context.roleName === 'Merchant Staff'
          ? 'TGUC Financial Agent Invite'
          : 'TGUC Financial Application');
    const html: string = await this.nunjucksService.htmlToString(
      template,
      context,
    );
    const fromName = this.configService.get<string>('sendGridFromName');
    const fromEmail = this.configService.get<string>('sendGridFromEmail');
    await this.sendGridService.sendEmail(
      `${fromName} <${fromEmail}>`,
      context.email,
      subject,
      html,
      requestId,
    );

    const response = {
      adminId: newAdmin.id,
    };

    return response;
  }

  async getAllAdmins(
    admin: AdminJwtPayload,
    getAllAdminsDto: GetAllUsersDto,
    requestId: string,
  ) {
    this.logger.log(
      'Getting all admins with params:',
      `${AdminService.name}#getAllAdmins`,
      requestId,
      { admin, getAllAdminsDto },
    );
    const { page, perPage, search } = getAllAdminsDto;
    const adminsResponse: [Admin[], number] = await getRepository(Admin)
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.role', 'role')
      .leftJoinAndSelect('admin.practiceManagement', 'practiceManagement')
      .where(
        new Brackets((whereExpressionBuilder: WhereExpressionBuilder) => {
          whereExpressionBuilder.where('admin.isDeleted = :isDeleted', {
            isDeleted: false,
          }).andWhere('role.roleName != :role', {
            role: 'Merchant Staff'
          });

          if (search) {
            whereExpressionBuilder.andWhere(
              new Brackets(
                (andWhereExpressionBuilder: WhereExpressionBuilder) => {
                  andWhereExpressionBuilder
                    .where(`admin.userName ILIKE '%${search}%'`)
                    .orWhere(`admin.email ILIKE '%${search}%'`)
                    .orWhere(`admin.phoneNumber ILIKE '%${search}%'`)
                    .orWhere(`role.roleName ::text ILIKE '%${search}%'`)
                    .orWhere(`practiceManagement.location ILIKE '%${search}%'`);
                },
              ),
            );
          }
        }),
      )
      .take(perPage)
      .skip((page - 1) * perPage)
      .orderBy('admin.createdAt', 'DESC')
      .getManyAndCount();

    const admins = adminsResponse[0].map((admin: any) => {
      return {
        id: admin?.id,
        userName: admin?.userName,
        email: admin?.email,
        phone: admin?.phoneNumber,
        role: admin?.role.roleName,
        location: admin?.practiceManagement?.location || 'Alchemy',
        createdDate: moment(admin.createdAt).format('MM/DD/YYYY hh:mm a'),
      };
    });
    const response = { rows: admins, totalRows: adminsResponse[1] };
    this.logger.log(
      'Got admins:',
      `${AdminService.name}#getAllAdmins`,
      requestId,
      response,
    );

    return response;
  }

  async getAllAgents(
    admin: AdminJwtPayload,
    getAllAdminsDto: GetAllUsersDto,
    requestId: string,
  ) {
    this.logger.log(
      'Getting all admins with params:',
      `${AdminService.name}#getAllAgents`,
      requestId,
      { admin, getAllAdminsDto },
    );
    const { page, perPage, search } = getAllAdminsDto;
    const adminsResponse: [Admin[], number] = await getRepository(Admin)
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.role', 'role')
      .leftJoinAndSelect('admin.contractor', 'contractor')
      .leftJoinAndSelect('admin.practiceManagement', 'practiceManagement')
      .where(
        new Brackets((whereExpressionBuilder: WhereExpressionBuilder) => {
          whereExpressionBuilder.where('admin.isDeleted = :isDeleted', {
            isDeleted: false,
          });
          whereExpressionBuilder.andWhere('role.roleName = :adminRole', {
            adminRole: 'Merchant Staff',
          });
          if (admin.role === 'Merchant') {
            whereExpressionBuilder.andWhere(
              'admin.contractor = :contractorId',
              {
                contractorId: admin.id,
              },
            );
          }
          if (search) {
            whereExpressionBuilder.andWhere(
              new Brackets(
                (andWhereExpressionBuilder: WhereExpressionBuilder) => {
                  andWhereExpressionBuilder
                    .where(`admin.userName ILIKE '%${search}%'`)
                    .orWhere(`admin.email ILIKE '%${search}%'`)
                    .orWhere(`admin.phoneNumber ILIKE '%${search}%'`)
                    .orWhere(`admin.userReference ILIKE '%${search}%'`)
                    .orWhere(`contractor.userReference ILIKE '%${search}%'`)
                    .orWhere(`practiceManagement.location ILIKE '%${search}%'`);
                },
              ),
            );
          }
        }),
      )
      .take(perPage)
      .skip((page - 1) * perPage)
      .orderBy('admin.createdAt', 'DESC')
      .getManyAndCount();

    const admins = adminsResponse[0].map((admin: any) => {
      return {
        id: admin?.id,
        userName: admin?.userName,
        email: admin?.email,
        phone: admin?.phoneNumber,
        role: admin?.role.roleName,
        contractor: admin?.contractor?.userReference,
        agentReference: admin?.userReference,
        createdDate: moment(admin.createdAt).format('MM/DD/YYYY hh:mm a'),
      };
    });
    const response = { rows: admins, totalRows: adminsResponse[1] };
    this.logger.log(
      'Got agents:',
      `${AdminService.name}#getAllAgents`,
      requestId,
      response,
    );

    return response;
  }

  async deleteAgent(id: string, requestId: string) {
    const agent = await this.adminModel.preload({
      id,
      isDeleted: true,
    });
    if (!agent) {
      const errorMessage = `Agent #${id} not found`;
      this.logger.error(
        'Error:',
        `${AdminService.name}#deleteAgent`,
        requestId,
        errorMessage,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    return this.adminModel.save(agent);
  }

  async getAdminById(id: string, requestId: string) {
    this.logger.log(
      'Getting admin with params:',
      `${AdminService.name}#getAdminById`,
      requestId,
      { id },
    );
    const admin: Admin | null = await this.adminModel.findOne({
      where: {
        id,
      },
      relations: ['role', 'practiceManagement'],
    });

    if (!admin) {
      const errorMessage = `Could not find user id ${id}`;
      this.logger.error(
        errorMessage,
        `${AdminService.name}#getAdminById`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    delete admin.password;

    this.logger.log(
      'Got admin:',
      `${AdminService.name}#getAdminById`,
      requestId,
      admin,
    );

    return admin;
  }

  async updateAdminById(
    id: string,
    updateAdminDto: UpdateAdminDto,
    requestId: string,
  ) {
    this.logger.log(
      'Updating admin with params:',
      `${AdminService.name}#getAdminById`,
      requestId,
      { id, ...updateAdminDto },
    );
    const role: Roles | null = await this.rolesModel.findOne({
      roleName: updateAdminDto.role,
    });
    if (!role) {
      const errorMessage = `Could not find role ${updateAdminDto.role}`;
      this.logger.error(
        errorMessage,
        `${AdminService.name}#getAdminById`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    if (updateAdminDto.password) {
      updateAdminDto.password = await this.generateEncryptedPassword(updateAdminDto.password);
    } else {
      delete updateAdminDto['password'];
    }
    const updateResult: UpdateResult = await this.adminModel.update(
      { id },
      { ...updateAdminDto, role: role.id },
    );
    if (updateResult.affected === 0) {
      const errorMessage = `Could not find user id ${id}`;
      this.logger.error(
        errorMessage,
        `${AdminService.name}#getAdminById`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    const admin: Admin = await this.adminModel.findOne(id);

    this.logger.log(
      'Updated admin:',
      `${AdminService.name}#getAdminById`,
      requestId,
      admin,
    );

    return admin;
  }

  async generateEncryptedPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async generateInitialPassword(): Promise<string> {
    return passwordGenerator.generate({
      length: 10,
      numbers: true,
      uppercase: true,
      strict: true,
    });
  }
}

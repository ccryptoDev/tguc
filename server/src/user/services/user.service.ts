import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';

import { LoggerService } from '../../logger/services/logger.service';
import {
  ApplyDto,
  UpdatedApplyDto,
} from '../../loans/application/validation/apply.dto';
import { ContractorApplyDto } from '../../loans/application/validation/contractorApply.dto';
import { User } from '../entities/user.entity';
import { Admin } from '../../admin/entities/admin.entity';
import { Roles } from '../../authentication/roles/entities/roles.entity';
import { State } from '../entities/state.entity';
import { ActivityService } from '../activity/services/activity.service';
import { CountersService } from '../../counters/services/counters.service';
import { Counters } from '../../counters/entities/counters.entity';
import { AppService } from '../../app.service';
import { ScreenTracking } from '../screen-tracking/entities/screen-tracking.entity';
import { PaymentManagement } from '../../loans/payments/payment-management/payment-management.entity';
import { PracticeManagement } from '../../admin/dashboard/practice-management/entities/practice-management.entity';
import crypto from 'crypto';
import { ESignature } from '../esignature/entities/esignature.entity';
import { S3Service } from '../../file-storage/services/s3.service';
import {
  SetZipcodeAndRadiusDto,
  UpdatePasswordAndPhonesDto,
} from '../validation/update-user-data.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
    @InjectRepository(Admin)
    private readonly adminModel: Repository<Admin>,
    @InjectRepository(Roles)
    private readonly rolesModel: Repository<Roles>,
    @InjectRepository(State)
    private readonly stateModel: Repository<State>,
    @InjectRepository(ScreenTracking)
    private readonly screenTrackingModel: Repository<ScreenTracking>,
    @InjectRepository(PaymentManagement)
    private readonly paymentManagementModel: Repository<PaymentManagement>,
    @InjectRepository(PracticeManagement)
    private readonly practiceManagementModel: Repository<PracticeManagement>,
    @InjectRepository(ESignature)
    private readonly esignatureModel: Repository<ESignature>,
    private readonly s3Service: S3Service,
    private readonly countersService: CountersService,
    private readonly userActivityService: ActivityService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  async getUserByEmail(email: string) {
    return await this.userModel.findOne({
      where: {
        email: email,
      },
      relations: ['practiceManagement'],
    });
  }

  waitFor = (ms) => new Promise((r) => setTimeout(r, ms));

  async stateFetch(userSSN: User[], statNumber: number, requestFrom: string) {
    userSSN.forEach(async (userV) => {
      const screenSSN: ScreenTracking = await this.screenTrackingModel.findOne({
        where: {
          user: userV.id,
          isCompleted: true,
        },
      });

      if (screenSSN && requestFrom != 'Login') {
        const paidStatus: PaymentManagement =
          await this.paymentManagementModel.findOne({
            user: userV.id,
          });

        if (paidStatus.status == 'paid' || paidStatus.status == 'expired') {
        } else if (
          paidStatus.status == 'in-repayment non-prime' ||
          paidStatus.status == 'in-repayment prime' ||
          paidStatus.status == 'approved'
        ) {
          statNumber = statNumber + 1;
        } else {
          statNumber = statNumber + 1;
        }
      } else {
      }
    });
    await this.waitFor(1000);

    return statNumber;
  }

  async ssnValidatenext(
    applyDto: string,
    requestId: string,
    requestFrom: string,
  ) {
    let statNumber: number;
    statNumber = 0;
    try {
      // const userSSN: User = await this.userModel.findOne({
      //   ssnNumber: applyDto,
      //   isExistingLoan: true,
      // });

      const userSSN: User[] = await this.userModel.find({
        ssnNumber: applyDto,
        isExistingLoan: true,
      });

      const sFetch = await this.stateFetch(userSSN, statNumber, requestFrom);
      statNumber = sFetch;
      if (statNumber > 0) {
        const errorCode = 400;
        let errorMessage =
          'There is already an existing application with Alchemy.';
        if (requestFrom == 'Login') {
          errorMessage =
            'There is already an existing application with Alchemy.';
        }
        throw new BadRequestException(
          this.appService.errorHandler(errorCode, errorMessage, requestId),
        );
      }

      //return statNumber;
    } catch (error) {
      this.logger.log(
        'Error:SSNValidation',
        `${applyDto}.SSNValidation`,
        requestId,
        error,
      );
      throw error;
    }
  }

  async createNewUser(user: ApplyDto | ContractorApplyDto, requestId: string) {
    this.logger.log(
      'Creating new user with params:',
      `${UserService.name}.createNewUser`,
      requestId,
      user,
    );
    try {
      const existingUser: User = await this.userModel.findOne({
        where: {
          email: user.email,
        },
      });

      if (existingUser) {
        const screenTracking: ScreenTracking | null =
          await this.screenTrackingModel.findOne({
            where: { user: existingUser.id },
          });
        if (
          (screenTracking && screenTracking.creditScore) ||
          (screenTracking &&
            screenTracking.declineReasons &&
            screenTracking.declineReasons.length >= 1)
        ) {
          throw new BadRequestException(
            this.appService.errorHandler(
              400,
              `You already have an account with Alchemy, please sign in with your existing account.`,
              requestId,
            ),
          );
        }

        return existingUser;
      }

      if (!user.practiceManagement) {
        let createdPm = this.practiceManagementModel.create({
          url: '',
        });
        createdPm = await this.practiceManagementModel.save(createdPm);
        const practiceManagement = createdPm;
        if (!practiceManagement) {
          this.logger.error(
            'Practice management not found',
            `${UserService.name}#createNewUser`,
            requestId,
          );
          throw new NotFoundException(
            this.appService.errorHandler(
              404,
              `PracticeManagement not found for practiceId: ${user.practiceManagement}`,
              requestId,
            ),
          );
        }

        user.practiceManagement = practiceManagement.id;
      } else {
        const practiceManagement = await this.practiceManagementModel.findOne({
          id: user.practiceManagement,
          isDeleted: false,
        });
        if (!practiceManagement) {
          this.logger.error(
            'Practice management not found',
            `${UserService.name}#createNewUser`,
            requestId,
          );
          throw new NotFoundException(
            this.appService.errorHandler(
              404,
              `PracticeManagement not found for practiceId: ${user.practiceManagement}`,
              requestId,
            ),
          );
        }
      }
      return this.setupUser(user, requestId);
    } catch (error) {
      this.logger.log(
        'Error:',
        `${UserService.name}.createNewUser`,
        requestId,
        error,
      );
      throw error;
    }
  }

  async updateUser(user: UpdatedApplyDto, requestId: string) {
    this.logger.log(
      'Updating user with params:',
      `${UserService.name}.updateUser`,
      requestId,
      user,
    );
    try {
      const existingUser: User = await this.userModel.findOne({
        where: {
          id: user.userId,
        },
      });
      if (!existingUser) {
        this.logger.error(
          'User not found',
          `${UserService.name}#updateUser`,
          requestId,
        );
        throw new NotFoundException(
          this.appService.errorHandler(
            404,
            `User not found for userId: ${user.userId}`,
            requestId,
          ),
        );
      }

      const userUpdated = await this.userModel.update(
        { id: user.userId },
        {
          city: user.city,
          state: user.state,
          zipCode: user.zip,
          street: user.street,
          requestedAmount: user.requestedAmount,
        },
      );

      return userUpdated;
    } catch (error) {
      this.logger.log(
        'Error:',
        `${UserService.name}.updateUser`,
        requestId,
        error,
      );
      throw error;
    }
  }

  async setupUser(
    userData: ApplyDto | ContractorApplyDto,
    requestId: string,
  ): Promise<User> {
    const userReferenceData: Counters =
      await this.countersService.getNextSequenceValue('user', requestId);
    const userReference = `USR_${userReferenceData.sequenceValue}`;
    const newUser = new User();
    newUser.city = userData.city;
    newUser.dateOfBirth = userData.dateOfBirth;
    // newUser.driversLicenseNumber = userData.driversLicenseNumber;
    // newUser.driversLicenseState = userData.driversLicenseState;
    newUser.email = userData.email;
    newUser.firstName = userData.firstName;
    newUser.lastName = userData.lastName;
    // newUser.middleName = userData.middleName;
    newUser.phones = userData.phones;
    newUser.practiceManagement = userData.practiceManagement;
    newUser.ssnNumber = userData.ssnNumber;
    newUser.state = userData.state;
    newUser.street = userData.street;
    newUser.unitApt = userData.unitApt;
    newUser.zipCode = userData.zipCode;
    newUser.userReference = userReference;
    newUser.password = userData.password;
    newUser.passwordRaw = userData.password;
    // For borrower only
    if (userData?.referredBy) {
      const adminData = await this.adminModel.findOne({
        id: userData.referredBy,
      });
      if (adminData) {
        newUser.referredBy = adminData;
      }
    }

    const roleData = await this.rolesModel.findOne({ roleName: 'User' });
    if (roleData) {
      newUser.role = roleData;
    }
    newUser.password = await this.encryptPassword(newUser.password);
    const state = await this.stateModel.findOne({
      stateCode: newUser.state,
    });
    if (state) {
      newUser._state = state;
    }
    const savedUser = await this.userModel.save(newUser);

    const userRequest = {
      userId: savedUser.id,
      logData: `User registration successful - ${savedUser.email}`,
    };
    const userSubject = 'Registration Success';
    const userDescription = 'User registration.';

    this.userActivityService.createUserActivity(
      userRequest,
      userSubject,
      userDescription,
      requestId,
    );

    return savedUser;
  }

  /**
   * Hash the user's password
   * @param user User
   */
  async encryptPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  generateRandomPassword(length = 16): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Direct call to database to find one user
   * @param query key:value pair
   */
  async findOne(query: Record<string, unknown>): Promise<User> {
    return this.userModel.findOne(query);
  }

  async getInfo(userId: string, requestId: string) {
    this.logger.log(
      'Get user info:',
      `${UserService.name}#getInfo`,
      requestId,
      userId,
    );
    const user = await this.userModel.findOne(
      { id: userId },
      { relations: ['screenTracking'] },
    );
    const st = user.screenTracking as ScreenTracking;
    const userInfo = {
      userReference: user.userReference,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user?.[0]?.[0]?.phone,
      dateOfBirth: user.dateOfBirth,
      street: user.street,
      zipCode: user.zipCode,
      state: user.state,
      ssnNumber: user.ssnNumber,
      registeredDate: (user as any).createdAt,
      lastProfileUpdateTime: (user as any).updatedAt,
      annualIncome: (st?.incomeAmount ?? 0) * 12,
      monthlyIncome: st?.incomeAmount ?? 0,
      anticipatedFinancedAmount: st?.offerData?.financedAmount ?? 0,
      preDTIdebt: st?.preDTIMonthlyAmount ?? 0,
      preDTIdebtPercent: st?.preDTIPercentValue ?? 0,
      declineReasons: st?.declineReasons,
    };

    return userInfo;
  }

  async getApplicationInformation(screenTrackingId: string, requestId: string) {
    this.logger.log(
      'Getting application information with params:',
      `${UserService.name}#getApplicationInformation`,
      requestId,
      { screenTrackingId },
    );
    const ScreenTracking: ScreenTracking | null =
      await this.screenTrackingModel.findOne(
        { id: screenTrackingId },
        { relations: ['user'] },
      );

    if (!ScreenTracking) {
      this.logger.error(
        'ScreenTracking not found',
        `${UserService.name}#getApplicationInformation`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `ScreenTracking id ${screenTrackingId} not found.`,
          requestId,
        ),
      );
    }

    const user = ScreenTracking.user as User;

    let ricSignature: string | undefined;
    const esignature: ESignature | null = await this.esignatureModel.findOne({
      user,
    });
    if (esignature) {
      const signature = await this.s3Service.downloadFile(
        esignature.signaturePath,
        requestId,
      );
      ricSignature = `data:${
        signature.ContentType
      };base64,${signature.Body.toString('base64')}`;
    }

    const response = {
      userId: user.id,
      address: user.street,
      street: user.street,
      annualIncome: ScreenTracking.incomeAmount,
      approvedUpTo: ScreenTracking.approvedUpTo,
      applicationReference: ScreenTracking.applicationReference,
      city: user.city,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      firstName: user.firstName,
      isCompleted: ScreenTracking.isCompleted,
      lastName: user.lastName,
      lastStep: ScreenTracking.lastLevel,
      phones: user.phones,
      referenceNumber: user.userReference,
      requestedAmount: ScreenTracking.requestedAmount,
      ricSignature,
      screenTrackingId: ScreenTracking.id,
      selectedOffer: ScreenTracking.offerData,
      ssn: user.ssnNumber,
      state: user.state,
      zip: user.zipCode,
    };
    this.logger.log(
      'Got application information:',
      `${UserService.name}#getApplicationInformation`,
      requestId,
      response,
    );

    return response;
  }

  async getApplicationInformationByUserId(userId: string, requestId: string) {
    const ScreenTracking: ScreenTracking | null =
      await this.screenTrackingModel.findOne({
        where: {
          user: userId,
        },
      });

    if (!ScreenTracking) {
      this.logger.error(
        'ScreenTracking not found',
        `${UserService.name}#getApplicationInformation`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `ScreenTracking with the userId ${userId} not found.`,
          requestId,
        ),
      );
    }
    return ScreenTracking;
  }

  async getUserByPMId(pmId: string): Promise<User> {
    const paymentManagementDocument: PaymentManagement | null =
      await this.paymentManagementModel.findOne({ id: pmId });
    const user = await this.userModel.findOne({
      where: {
        id: paymentManagementDocument.user,
      },
    });
    return user;
  }

  async updatePasswordAndPhones(
    userId: string,
    updatePasswordAnPhonesDto: UpdatePasswordAndPhonesDto,
    requestId: string,
  ): Promise<void> {
    const { password, phones } = updatePasswordAnPhonesDto;
    this.logger.log(
      'Updating user password and phones with params:',
      `${UserService.name}#updatePasswordAndPhones`,
      requestId,
      { ...updatePasswordAnPhonesDto, userId },
    );
    const user: User = await this.userModel.findOne({ id: userId });
    if (!user) {
      const errorMessage = `User id ${userId} not found`;
      this.logger.error(
        errorMessage,
        `${UserService.name}#updatePasswordAndPhones`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    const encryptedPassword: string = await this.encryptPassword(password);
    const result: UpdateResult = await this.userModel.update(
      {
        id: userId,
      },
      { password: encryptedPassword, phones },
    );
    if (result.affected <= 0) {
      this.logger.log(
        'No data updated',
        `${UserService.name}#updatePasswordAndPhones`,
        requestId,
      );
    } else {
      this.logger.log(
        'User data updated successfully',
        `${UserService.name}#updatePasswordAndPhones`,
        requestId,
      );
    }
  }

  async getIdByToken(userId: string, requestId: string) {
    const sts = await this.screenTrackingModel.find({ user: userId });
    const user: any =
      (await this.userModel.findOne(userId)) ||
      (await this.adminModel.findOne({
        where: {
          id: userId,
        },
        relations: ['role', 'practiceManagement'],
      })) ||
      {};
    const role: any = await this.rolesModel.findOne(user.role);
    const pms = await this.paymentManagementModel.find({ user: user.id });

    const response = {
      userId,
      screenTrackings: sts,
      paymentManagements: pms,
      ...user,
      ...role,
    };

    this.logger.log(
      'Got dashboard information:',
      `${UserService.name}#getIdByToken`,
      requestId,
      response,
    );
    return response;
  }

  async setZipcodeAndRadius(
    adminId: string,
    setZipcodeAndRadiusDto: SetZipcodeAndRadiusDto,
    requestId: string,
  ): Promise<void> {
    const { zipcodeAndRadius } = setZipcodeAndRadiusDto;
    console.log('zipcodeAndRadius', zipcodeAndRadius);
    this.logger.log(
      'Setting zipcode and radius with params:',
      `${UserService.name}#setZipcodeAndRadius`,
      requestId,
      { ...setZipcodeAndRadiusDto, adminId },
    );
    const admin: Admin = await this.adminModel.findOne({ id: adminId });
    if (!admin) {
      const errorMessage = `admin id ${adminId} not found`;
      this.logger.error(
        errorMessage,
        `${UserService.name}#setZipcodeAndRadius`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    const result: UpdateResult = await this.adminModel.update(
      {
        id: adminId,
      },
      { zipcodeAndRadius: zipcodeAndRadius },
    );
    if (result.affected <= 0) {
      this.logger.log(
        'No data updated',
        `${UserService.name}#setZipcodeAndRadius`,
        requestId,
      );
    } else {
      this.logger.log(
        'User zipcode updated successfully',
        `${UserService.name}#setZipcodeAndRadius`,
        requestId,
      );
    }
  }

  async getZipcodes(adminId: string, requestId: string): Promise<Admin> {
    const zipcodes = await this.adminModel.findOne({ id: adminId });
    if (!zipcodes) {
      const errorMessage = `admin id ${adminId} not found`;
      this.logger.error(
        errorMessage,
        `${UserService.name}#getZipcodes`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    return zipcodes;
  }

  async updateUserRules(body: any, adminId: string, requestId: string) {
    const admin: Admin = await this.adminModel.findOne({ id: adminId });
    if (!admin) {
      const errorMessage = `admin id ${adminId} not found`;
      this.logger.error(
        errorMessage,
        `${UserService.name}#setZipcodeAndRadius`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    const sc: UpdateResult = await this.adminModel.update(
      {
        id: adminId,
      },
      { offers: body },
    );
    if (!sc) {
      this.logger.log(
        'screenTrackingModel not found',
        `${UserService.name}#updateUserRules`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `UserServicenot found for screenTrackingModelid ${adminId}`,
          requestId,
        ),
      );
    }
    return sc;
  }

  async userApproveWorkCompletion(userId: string, requestId) {
    const user: User | any = await this.userModel.findOne({
      where: {
        id: userId,
      },
      relations: ['screenTracking'],
    });
    if (!user) {
      const errorMessage = `user id ${userId} not found`;
      this.logger.error(
        errorMessage,
        `${UserService.name}#setWorkCompletion`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    const pm = await this.paymentManagementModel.update(
      {
        user: user.id,
      },
      {
        status: 'pending-disbursement',
      },
    );
    if (pm) {
      await this.screenTrackingModel.update(
        {
          id: user.screenTracking.id,
        },
        {
          isAwaitingWorkCompletion: false,
        },
      );
    }
    return pm;
  }

  async userDeniedWorkCompletion(userId: string, requestId) {
    const user: User | any = await this.userModel.findOne({
      where: {
        id: userId,
      },
      relations: ['screenTracking'],
    });
    if (!user) {
      const errorMessage = `user id ${userId} not found`;
      this.logger.error(
        errorMessage,
        `${UserService.name}#setWorkCompletion`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    const sc = await this.screenTrackingModel.update(
      {
        id: user.screenTracking.id,
      },
      {
        isAwaitingWorkCompletion: false,
      },
    );
    return sc;
  }
}

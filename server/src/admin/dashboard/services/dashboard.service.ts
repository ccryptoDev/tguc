import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  getRepository,
  In,
  Repository,
  Brackets,
  WhereExpressionBuilder,
} from 'typeorm';
import moment from 'moment';

import { LoggerService } from '../../../logger/services/logger.service';
import { ScreenTracking } from '../../../user/screen-tracking/entities/screen-tracking.entity';
import { PaymentManagement } from '../../../loans/payments/payment-management/payment-management.entity';
import { User } from '../../../user/entities/user.entity';
import { AppService } from '../../../app.service';
import { LedgerService } from '../../../loans/ledger/services/ledger.service';
import { PaymentService } from '../../../loans/payments/services/payment.service';
import { ChangePaymentAmountDto } from '../dtos/change-payment-amount.dto';
import { ESignature } from '../../../user/esignature/entities/esignature.entity';
import { S3Service } from '../../../file-storage/services/s3.service';
import { IPaymentScheduleItem } from '../../../loans/payments/payment-management/payment-schedule-item.interface';
import { AdminJwtPayload } from '../../../authentication/types/jwt-payload.types';
import GetAllUsersDto from '../validation/GetAllUsers.dto';
import { Role } from '../../../authentication/roles/role.enum';
import { PracticeManagement } from '../practice-management/entities/practice-management.entity';
import { AdminService } from '../../services/admin.service';
import { NunjucksService } from '../../../html-parser/services/nunjucks.service';
import { SendGridService } from '../../../email/services/sendgrid.service';
import Config from '../../../app.config';
import { ConfigService } from '@nestjs/config';
import { Admin } from '../../entities/admin.entity';
import { InstntService } from '../../../user/underwriting/instnt/services/instnt.service';
import { MiddeskService } from '../../../user/underwriting/middesk/middesk.service';
import { ExperianHistory } from '../../../user/underwriting/experian/entities/experian-history.entity';
@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(PaymentManagement)
    private readonly PaymentManagementModel: Repository<PaymentManagement>,
    @InjectRepository(PracticeManagement)
    private readonly PracticeManagementModel: Repository<PracticeManagement>,
    @InjectRepository(ScreenTracking)
    private readonly ScreenTrackingModel: Repository<ScreenTracking>,
    @InjectRepository(User)
    private readonly UserModel: Repository<User>,
    @InjectRepository(Admin)
    private readonly AdminModel: Repository<Admin>,
    @InjectRepository(ESignature)
    private readonly esignatureModel: Repository<ESignature>,
    @InjectRepository(ExperianHistory)
    private readonly experianHistory: Repository<ExperianHistory>,
    private readonly s3Service: S3Service,
    private readonly ledgerService: LedgerService,
    private readonly paymentService: PaymentService,
    private readonly instntService: InstntService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
    private readonly adminService: AdminService,
    private readonly nunjucksService: NunjucksService,
    private readonly sendGridService: SendGridService,
    private readonly configService: ConfigService,
    private readonly middeskService: MiddeskService,
  ) { }

  async getAllUsers(
    admin: AdminJwtPayload,
    getAllUsersDto: GetAllUsersDto,
    requestId: string,
  ) {
    this.logger.log(
      'Getting all users with params:',
      `${AdminDashboardService.name}#getAllUsers`,
      requestId,
      { admin, getAllUsersDto },
    );
    const { page, perPage, search } = getAllUsersDto;
    const { role, practiceManagement } = admin;

    const screenTrackingsResponse: [ScreenTracking[], number] =
      await getRepository(ScreenTracking)
        .createQueryBuilder('screenTracking')
        .leftJoinAndSelect('screenTracking.user', 'user')
        .leftJoinAndSelect(
          'screenTracking.practiceManagement',
          'practiceManagement',
        )
        .where(
          new Brackets((whereExpressionBuilder: WhereExpressionBuilder) => {
            if (role === Role.Merchant) {
              whereExpressionBuilder.where(
                'screenTracking.practiceManagement = :practiceManagement',
                { practiceManagement },
              );
            }

            if (search) {
              whereExpressionBuilder.andWhere(
                new Brackets(
                  (andWhereExpressionBuilder: WhereExpressionBuilder) => {
                    andWhereExpressionBuilder
                      .where(`user.firstName ILIKE '%${search}%'`)
                      .orWhere(`user.lastName ILIKE '%${search}%'`)
                      .orWhere(`user.userReference ILIKE '%${search}%'`)
                      .orWhere(`user.email ILIKE '%${search}%'`)
                      .orWhere(
                        `user.phones #>> '{0, phone}' ILIKE '%${search}%'`,
                      )
                      .orWhere(`practiceManagement.name ILIKE '%${search}%'`);
                  },
                ),
              );
            }
            if (search && search.toLowerCase() === 'completed') {
              whereExpressionBuilder.where(
                'screenTracking.isCompleted = :completed',
                { completed: true },
              );
            } else if (search && search.toLowerCase() === 'incomplete') {
              whereExpressionBuilder.where(
                'screenTracking.isCompleted = :completed',
                { completed: false },
              );
            }
          }),
        )
        .take(perPage)
        .skip((page - 1) * perPage)
        .orderBy('user.createdAt', 'DESC')
        .getManyAndCount();

    const users = screenTrackingsResponse[0].map((screenTracking: any) => {
      return {
        id: screenTracking.id,
        userId: screenTracking.user.id,
        userReference: screenTracking.user?.userReference,
        name: `${screenTracking.user?.firstName} ${screenTracking.user?.lastName}`,
        email: screenTracking.user?.email,
        phone: screenTracking.user?.phones[0]?.phone,
        registerStatus: screenTracking?.isCompleted
          ? 'Completed'
          : 'Incomplete',
        practiceName: screenTracking.practiceManagement?.name,
        createdDate: moment(screenTracking.user.createdAt).format(
          'MM/DD/YYYY hh:mm a',
        ),
      };
    });
    const response = { rows: users, totalRows: screenTrackingsResponse[1] };
    this.logger.log(
      'All users response:',
      `${AdminDashboardService.name}#getAllUsers`,
      requestId,
      response,
    );

    return response;
  }

  async getContractorApplicationByStatus(
    role: string,
    practiceManagement: string,
    status: PaymentManagement['status'],
    page: number,
    perPage: number,
    search: string,
    requestId: string,
  ) {
    this.logger.log(
      'Getting complete applications with params:',
      `${AdminDashboardService.name}#getApplicationByStatus`,
      requestId,
      status,
    );

    const applicationsResponse: [PaymentManagement[], number] =
      await getRepository(PaymentManagement)
        .createQueryBuilder('paymentManagement')
        .leftJoinAndSelect('paymentManagement.user', 'user')
        .leftJoinAndSelect('paymentManagement.screenTracking', 'screenTracking')
        .leftJoinAndSelect(
          'paymentManagement.practiceManagement',
          'practiceManagement',
        )
        .where(
          new Brackets((whereExpressionBuilder: WhereExpressionBuilder) => {
            if (typeof status === 'string') {
              whereExpressionBuilder.where(
                'paymentManagement.status = :status',
                { status },
              );
            } else {
              // status is an array
              whereExpressionBuilder.where(
                'paymentManagement.status IN (:...statuses)',
                { statuses: status },
              );
            }

            whereExpressionBuilder.andWhere(
              new Brackets(
                (andWhereExpressionBuilder: WhereExpressionBuilder) => {
                  andWhereExpressionBuilder.where(
                    'screenTracking.isContractor = true',
                  );
                },
              ),
            );

            if (role === Role.Merchant) {
              whereExpressionBuilder.andWhere(
                new Brackets(
                  (andWhereExpressionBuilder: WhereExpressionBuilder) => {
                    andWhereExpressionBuilder.where(
                      'paymentManagement.practiceManagement = :practiceManagement',
                      { practiceManagement },
                    );
                  },
                ),
              );
            }

            if (search) {
              whereExpressionBuilder.andWhere(
                new Brackets(
                  (andWhereExpressionBuilder: WhereExpressionBuilder) => {
                    andWhereExpressionBuilder
                      .where(`user.firstName ILIKE '%${search}%'`)
                      .orWhere(`user.lastName ILIKE '%${search}%'`)
                      .orWhere(`user.userReference ILIKE '%${search}%'`)
                      .orWhere(
                        `screenTracking.applicationReference ILIKE '%${search}%'`,
                      )
                      .orWhere(`user.email ILIKE '%${search}%'`)
                      .orWhere(
                        `user.phones #>> '{0, phone}' ILIKE '%${search}%'`,
                      )
                      .orWhere(
                        `screenTracking.lastLevel ::text ILIKE '%${search}%'`,
                      );
                    // .orWhere(`practiceManagement.name ILIKE '%${search}%'`);

                    if (status !== 'denied' && search.match(/^[0-9\.]{2,}$/)) {
                      andWhereExpressionBuilder.orWhere(
                        'screenTracking.approvedUpTo = :approvedUpTo',
                        { approvedUpTo: +search.replace(/[^0-9]/i, '') },
                      );
                    }
                  },
                ),
              );
            }
          }),
        )
        .take(perPage)
        .skip((page - 1) * perPage)
        .orderBy('paymentManagement.createdAt', 'DESC')
        .getManyAndCount();

    const contractorApplication = applicationsResponse[0];

    const applications = contractorApplication.map(
      (paymentManagement: PaymentManagement) => {
        const screenTracking =
          paymentManagement.screenTracking as ScreenTracking;
        const user = paymentManagement.user as User;
        let paidTransaction = [];
        let currentBalance = 0;
        if (paymentManagement && paymentManagement.paymentSchedule) {
          paidTransaction = paymentManagement.paymentSchedule.filter(
            (payment: any) => payment.status === 'paid',
          );
          const paidPrincipal = paidTransaction.reduce(function (balance, pt) {
            return balance + pt.paidPrincipal;
          }, 0);
          currentBalance =
            screenTracking?.approvedUpTo -
            screenTracking?.offerData?.loanAmount +
            paidPrincipal;
        }

        return {
          id: user.id,
          currentBalance: currentBalance,
          screenTrackingId: screenTracking.id,
          pmId: paymentManagement.id,
          userReference: user.userReference,
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phones[0],
          email: user.email,
          location: user.zipCode,
          loanReference: '0000' + screenTracking.applicationReference,
          practiceName: 'Alchemy',
          interestRate: paymentManagement.interestApplied,
          dateCreated: paymentManagement.createdAt,
          approvedUpTo: screenTracking.approvedUpTo,
          selectedAmount: user?.requestedAmount,
          loanAmount: screenTracking?.offerData?.loanAmount,
          term: screenTracking?.offerData?.term,
          progress: screenTracking.lastLevel,
          status: paymentManagement.status,
          isContractor: screenTracking.isContractor,
        };
      },
    );
    const response = { items: applications, total: applications.length };
    this.logger.log(
      'Applications by status response:',
      `${AdminDashboardService.name}#getApplicationByStatus`,
      requestId,
      applicationsResponse,
    );

    return response;
  }

  async getApplicationByStatus(
    userId: string,
    role: string,
    practiceManagement: string,
    status: PaymentManagement['status'],
    page: number,
    perPage: number,
    search: string,
    requestId: string,
  ) {
    this.logger.log(
      'Getting complete applications with params:',
      `${AdminDashboardService.name}#getApplicationByStatus`,
      requestId,
      status,
    );
    const applicationsResponse: [PaymentManagement[], number] =
      await getRepository(PaymentManagement)
        .createQueryBuilder('paymentManagement')
        .leftJoinAndSelect('paymentManagement.user', 'user')
        .leftJoinAndSelect('user.referredBy', 'referredBy')
        .leftJoinAndSelect(
          'referredBy.practiceManagement',
          'referredByPracticeManagement',
        )
        .leftJoinAndSelect('paymentManagement.screenTracking', 'screenTracking')
        .leftJoinAndSelect(
          'paymentManagement.practiceManagement',
          'practiceManagement',
        )
        .where(
          new Brackets((whereExpressionBuilder: WhereExpressionBuilder) => {
            if (role === Role.Merchant) {
              whereExpressionBuilder.andWhere(
                new Brackets(
                  (andWhereExpressionBuilder: WhereExpressionBuilder) => {
                    andWhereExpressionBuilder
                      .where(
                        'paymentManagement.practiceManagement = :practiceManagement',
                        { practiceManagement },
                      )
                      .orWhere('user.referredBy = :userId', {
                        userId,
                      });
                  },
                ),
              );
            }
            if (typeof status === 'string') {
              whereExpressionBuilder.where(
                'paymentManagement.status = :status',
                { status },
              );
            } else {
              // status is an array
              whereExpressionBuilder.where(
                'paymentManagement.status IN (:...statuses)',
                { statuses: status },
              );
            }
            whereExpressionBuilder.andWhere(
              new Brackets(
                (andWhereExpressionBuilder: WhereExpressionBuilder) => {
                  andWhereExpressionBuilder.where(
                    'screenTracking.isContractor = false',
                  );
                },
              ),
            );
            if (search) {
              whereExpressionBuilder.andWhere(
                new Brackets(
                  (andWhereExpressionBuilder: WhereExpressionBuilder) => {
                    andWhereExpressionBuilder
                      .where(`user.firstName ILIKE '%${search}%'`)
                      .orWhere(`user.lastName ILIKE '%${search}%'`)
                      .orWhere(`user.userReference ILIKE '%${search}%'`)
                      .orWhere(`user.email ILIKE '%${search}%'`)
                      .orWhere(
                        `screenTracking.applicationReference ILIKE '%${search}%'`,
                      )
                      .orWhere(
                        `user.phones #>> '{0, phone}' ILIKE '%${search}%'`,
                      )
                      .orWhere(
                        `screenTracking.lastLevel ::text ILIKE '%${search}%'`,
                      );
                    // .orWhere(`practiceManagement.name ILIKE '%${search}%'`);

                    if (status !== 'denied' && search.match(/^[0-9\.]{2,}$/)) {
                      andWhereExpressionBuilder.orWhere(
                        'screenTracking.approvedUpTo = :approvedUpTo',
                        { approvedUpTo: +search.replace(/[^0-9]/i, '') },
                      );
                    }
                  },
                ),
              );
            }
          }),
        )
        .take(perPage)
        .skip((page - 1) * perPage)
        .orderBy('paymentManagement.createdAt', 'DESC')
        .getManyAndCount();

    const borrowerApplications = applicationsResponse[0];

    const applications = borrowerApplications.map(
      (paymentManagement: PaymentManagement) => {
        const screenTracking =
          paymentManagement.screenTracking as ScreenTracking;
        const user = paymentManagement.user as User;
        let paidTransaction = [];
        let currentBalance = 0;
        if (paymentManagement && paymentManagement.paymentSchedule) {
          paidTransaction = paymentManagement.paymentSchedule.filter(
            (payment: any) => payment.status === 'paid',
          );
          const paidPrincipal = paidTransaction.reduce(function (balance, pt) {
            return balance + pt.paidPrincipal;
          }, 0);
          currentBalance =
            screenTracking?.approvedUpTo -
            screenTracking?.offerData?.loanAmount +
            paidPrincipal;
        }

        const referredBy = user?.referredBy as Admin;
        let practiceName = '';
        if (referredBy) {
          const pm = referredBy?.practiceManagement as PracticeManagement;
          practiceName = pm?.practiceName;
        } else {
          const pm =
            paymentManagement?.practiceManagement as PracticeManagement;
          practiceName = pm?.practiceName;
        }
        return {
          id: user.id,
          currentBalance: currentBalance,
          screenTrackingId: screenTracking.id,
          pmId: paymentManagement.id,
          userReference: user.userReference,
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phones[0],
          email: user.email,
          loanReference: '0000' + screenTracking.applicationReference,
          contractorReference: referredBy?.userReference,
          practiceName: practiceName,
          interestRate: paymentManagement.interestApplied,
          dateCreated: paymentManagement.createdAt,
          approvedUpTo: screenTracking.approvedUpTo,
          selectedAmount: user?.requestedAmount,
          loanAmount: screenTracking?.offerData?.loanAmount,
          term: screenTracking?.offerData?.term,
          progress: screenTracking.lastLevel,
          status: paymentManagement.status,
          isAwaitingWorkCompletion: screenTracking.isAwaitingWorkCompletion,
        };
      },
    );

    const response = { items: applications, total: applications.length };
    this.logger.log(
      'Applications by status response:',
      `${AdminDashboardService.name}#getApplicationByStatus`,
      requestId,
      applicationsResponse,
    );

    return response;
  }

  async getLoanCounters(
    role: string,
    practiceManagement: string,
    requestId: string,
  ) {
    this.logger.log(
      'Getting loan counters:',
      `${AdminDashboardService.name}#getLoanCounters`,
      requestId,
    );

    const approvedAndPendingMatchingCriteria =
      role === Role.Merchant
        ? {
          status: In(['approved', 'pending']),
          practiceManagement,
        }
        : {
          status: In(['approved', 'pending']),
        };
    const repaymentPrimeAndNonPrimeMatchingCriteria =
      role === Role.Merchant
        ? {
          status: In(['in-repayment prime', 'in-repayment non-prime']),
          practiceManagement,
        }
        : {
          status: In(['in-repayment prime', 'in-repayment non-prime']),
        };
    const deniedMatchingCriteria =
      role === Role.Merchant
        ? {
          status: 'denied',
          practiceManagement,
        }
        : {
          status: 'denied',
        };
    const expiredMatchingCriteria =
      role === Role.Merchant
        ? {
          status: 'expired',
          practiceManagement,
        }
        : {
          status: 'expired',
        };
    const result = await Promise.all([
      this.PaymentManagementModel.count({
        where: approvedAndPendingMatchingCriteria,
      }),
      this.PaymentManagementModel.count({
        where: repaymentPrimeAndNonPrimeMatchingCriteria,
      }),
      this.PaymentManagementModel.count({
        where: deniedMatchingCriteria,
      }),
      this.PaymentManagementModel.count({
        where: expiredMatchingCriteria,
      }),
    ]);

    const response = {
      opportunities: result[0],
      inRepayment: result[1],
      denied: result[2],
      expired: result[3],
    };
    this.logger.log(
      'Got loan counters:',
      `${AdminDashboardService.name}#getLoanCounters`,
      requestId,
      response,
    );

    return response;
  }

  async getApplicationInfo(screenTrackingId: string, requestId: string) {
    this.logger.log(
      'Getting application info with params:',
      `${AdminDashboardService.name}#getApplicationInfo`,
      requestId,
      screenTrackingId,
    );

    const screenTrackingDocument = await this.ScreenTrackingModel.findOne({
      where: {
        id: screenTrackingId,
      },
      relations: [
        'user',
        'user.referredBy',
        'user.referredBy.practiceManagement',
      ],
    });
    if (!screenTrackingDocument) {
      const errorMessage = `Could not find screen tracking id ${screenTrackingId}`;
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    if (!screenTrackingDocument.user) {
      const errorMessage = `Could not find user for screen tracking id ${screenTrackingId}`;
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    const user: User = screenTrackingDocument.user as User;
    const PracticeManagementDocument: PaymentManagement =
      await this.PaymentManagementModel.findOne({
        where: { user: user.id },
        relations: ['practiceManagement'],
      });
    let ricSignature: string | undefined;
    const esignature: ESignature | null = await this.esignatureModel.findOne({
      user,
    });
    if (esignature) {
      const signature = await this.s3Service.downloadFile(
        esignature.signaturePath,
        requestId,
      );
      ricSignature = `data:${signature.ContentType
        };base64,${signature.Body.toString('base64')}`;
    }

    // Instnt Report
    const instnt = await this.instntService.findByScreenTrackingId(
      screenTrackingId,
    );
    let formattedInstntRecord = null;
    if (instnt) {
      const user = instnt.user as User;
      const st = instnt.screenTracking as ScreenTracking;
      formattedInstntRecord = {
        id: instnt.id,
        desicion: instnt.decision,
        formKey: instnt.formKey,
        transactionId: instnt.transactionId,
        instntJwt: instnt.instntJwt,
        screenTrackingId: st.id,
        userId: user.id,
      };
    }

    const creditReportDocument = await this.getCreditReport(
      screenTrackingId,
      requestId,
    );

    const rulesDetails = screenTrackingDocument.rulesDetails;

    const midDesk = await this.middeskService.findByLoanId(screenTrackingId);
    const middeskData = [];
    if (midDesk) {
      const middeskReport = JSON.parse(midDesk.report).middesk;
      const tasksRuleKeysMap = new Map([
        ['Business legal name matches what was listed in credit app', ['name']],
        [
          'Business address matches what was listed in credit app',
          ['address_verification'],
        ],
        [
          'Certificate of Good Standing is present',
          ['sos_match', 'sos_active', 'sos_domestic'],
        ],
        ['Business is a US-based/owned business ', ['address_deliverability']],
        [
          "Personal guarantors' names match what was stated in credit app",
          ['person_verification'],
        ],
        ['OFAC check returns a hit', ['watchlist']],
        ['TIN is verified for the business', ['tin']],
      ]);

      for (const [rule, keys] of tasksRuleKeysMap) {
        const correspondingTasks = middeskReport.review.tasks.filter((task) =>
          keys.includes(task.key),
        );
        const taskMessages = [];
        const taskStatuses = [];
        const taskSubLabels = [];

        correspondingTasks.forEach((task) => {
          taskMessages.push(task.message);
          taskStatuses.push(task.status);
          taskSubLabels.push(task.sub_label);
        });

        middeskData.push({
          label: rule,
          message: taskMessages.join('; '),
          status: taskStatuses.every((status) => status === 'success')
            ? 'success'
            : 'failure',
          sub_label: taskSubLabels.join('; '),
        });
      }
    }

    const applicationInfo = {
      // annualIncome: screenTrackingDocument.incomeAmount,
      // city: user.city,
      // dateOfBirth: user.dateOfBirth,
      // email: user.email,
      // financingReferenceNumber: screenTrackingDocument.applicationReference,
      // financingStatus: PracticeManagementDocument.status,
      // lastProfileUpdatedAt: (user as any).updatedAt,
      // monthlyIncome: screenTrackingDocument.incomeAmount / 12,
      // name: `${user.firstName} ${user.lastName}`,
      // phoneNumber: user.phones[0].phone,
      // phoneType: user.phones[0].type,
      // preDTIdebt: screenTrackingDocument.preDTIMonthlyAmount,
      // preDTIdebtInPercents: screenTrackingDocument.preDTIPercentValue,
      // selectedOffer: screenTrackingDocument.offerData,
      // ricSignature: ricSignature,
      // registeredAt: (user as any).createdAt,
      // requestedAmount: screenTrackingDocument.requestedAmount,
      // ssnNumber: user.ssnNumber,
      // state: user.state,
      // street: user.street,
      // unitApt: user.unitApt,
      // userId: user.id,
      // userReference: user.userReference,
      // zipCode: user.zipCode,
      screenTracking: screenTrackingDocument,
      paymentManagement: PracticeManagementDocument,
      user: user,
      referredBy: user?.referredBy,
      creditReport: creditReportDocument,
      rulesDetails: rulesDetails,
      midDesk: middeskData,
      practiceManagement: PracticeManagementDocument.practiceManagement,
      instnt: formattedInstntRecord,
    };

    this.logger.log(
      'Returning application info: ',
      `${AdminDashboardService.name}#getApplicationInfo`,
      requestId,
      applicationInfo,
    );

    return applicationInfo;
  }

  async getCreditReport(screenTrackingId: string, requestId: string) {
    this.logger.log(
      'Getting credit report with params:',
      `${AdminDashboardService.name}#getCreditReport`,
      requestId,
      screenTrackingId,
    );

    const screenTrackingDocument = await this.ScreenTrackingModel.findOne({
      where: { id: screenTrackingId },
      relations: ['user', 'transUnion'],
    });

    if (!screenTrackingDocument) {
      const errorMessage = `Could not find screen tracking id ${screenTrackingId}`;
      throw new BadRequestException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    if (!screenTrackingDocument.user) {
      const errorMessage = `Could not find user for screen tracking id ${screenTrackingId}`;
      throw new BadRequestException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    const user: User = screenTrackingDocument.user as User;
    const creditReport = await this.experianHistory.findOne({
      screenTracking: screenTrackingId,
    });
    const response = {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        ssn: user.ssnNumber,
        creditScore: screenTrackingDocument.creditScore,
      },
      creditReport: creditReport,
    };

    this.logger.log(
      'Got credit report:',
      `${AdminDashboardService.name}#getCreditReport`,
      requestId,
      response,
    );

    return response;
  }

  async getPaymentSchedule(screenTrackingId: string, requestId: string) {
    const paymentManagement: PaymentManagement | null =
      await this.PaymentManagementModel.findOne({
        screenTracking: screenTrackingId,
      });
    const screenTracking: ScreenTracking | null =
      await this.ScreenTrackingModel.findOne(screenTrackingId);
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${AdminDashboardService.name}#getPaymentSchedule`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${screenTrackingId}`,
          requestId,
        ),
      );
    }

    const { status } = paymentManagement;
    if (
      status === 'approved' ||
      status === 'pending' ||
      status === 'denied' ||
      status === 'expired'
    ) {
      return paymentManagement;
    }

    const response: PaymentManagement = await this.checkPromoAvailability(
      paymentManagement,
      requestId,
    );
    const ledger = this.ledgerService.getPaymentLedger(
      response,
      moment().startOf('day').toDate(),
      requestId,
    );
    response.payOffAmount = ledger.payoff;
    response.screenTracking = screenTracking;

    return response;
  }

  async checkPromoAvailability(
    paymentManagement: PaymentManagement,
    requestId: string,
  ): Promise<PaymentManagement> {
    this.logger.log(
      `Checking promo availability for payment management id ${paymentManagement.id}`,
      `${AdminDashboardService.name}#checkPromoAvailability`,
      requestId,
    );
    if (paymentManagement.promoStatus === 'unavailable') {
      this.logger.log(
        'Promo is unavailable',
        `${AdminDashboardService.name}#checkPromoAvailability`,
        requestId,
      );
    } else if (
      moment()
        .startOf('day')
        .isAfter(
          moment(paymentManagement.loanStartDate)
            .add(paymentManagement.promoTermCount, 'months')
            .startOf('day'),
        )
    ) {
      this.logger.log(
        'Setting promoStatus to unavailable',
        `${AdminDashboardService.name}#checkPromoAvailability`,
        requestId,
      );
      await this.PaymentManagementModel.update(
        { id: paymentManagement.id },
        { promoStatus: 'unavailable' },
      );
      this.logger.log(
        'promoStatus set to unavailable',
        `${AdminDashboardService.name}#checkPromoAvailability`,
        requestId,
      );
    } else {
      this.logger.log(
        'Promo is still available',
        `${AdminDashboardService.name}#checkPromoAvailability`,
        requestId,
      );
    }

    return paymentManagement;
  }

  async changeMonthlyPaymentAmount(
    changePaymentAmountDto: ChangePaymentAmountDto,
    requestId: string,
  ) {
    const { screenTracking, amount } = changePaymentAmountDto;
    const paymentManagement: PaymentManagement | null =
      await this.PaymentManagementModel.findOne({
        screenTracking,
      });
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${AdminDashboardService.name}#changeMonthlyPaymentAmount`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${screenTracking}`,
          requestId,
        ),
      );
    }

    const { minimumPaymentAmount, payOffAmount } = paymentManagement;
    if (amount < minimumPaymentAmount || amount > payOffAmount) {
      this.logger.error(
        `Amount should be higher than ${minimumPaymentAmount} and lower than ${payOffAmount}`,
        `${AdminDashboardService.name}#changeMonthlyPaymentAmount`,
        requestId,
      );
      throw new BadRequestException(
        this.appService.errorHandler(
          400,
          `Amount should be higher than ${minimumPaymentAmount} and lower than ${payOffAmount}`,
          requestId,
        ),
      );
    }

    const newPaymentSchedule = this.paymentService.amortizeSchedule(
      amount,
      paymentManagement,
      requestId,
    );

    await this.PaymentManagementModel.update(paymentManagement.id, {
      currentPaymentAmount: amount,
      paymentSchedule: newPaymentSchedule,
    });
  }

  async forgivePayment(screenTrackingId: string, requestId: string) {
    const paymentManagement: PaymentManagement | null =
      await this.PaymentManagementModel.findOne({
        screenTracking: screenTrackingId,
      });
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${AdminDashboardService.name}#getPaymentSchedule`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${screenTrackingId}`,
          requestId,
        ),
      );
    }

    let index = 0;
    paymentManagement.paymentSchedule.forEach((scheduleItem) => {
      const today = moment().startOf('day').toDate();
      if (scheduleItem.status === 'opened' && index == 1) {
        index = 2;
      }
      if (scheduleItem.status === 'opened' && index === 0) {
        index = 1;
        scheduleItem.isWaived = true;
        scheduleItem.status = 'paid';
        scheduleItem.paymentDate = today;
        scheduleItem.paymentReference = 'Waived';
        scheduleItem.payment = scheduleItem.amount;
        scheduleItem.paidInterest = scheduleItem.interest;
        scheduleItem.paidPrincipal = scheduleItem.principal;
        paymentManagement.payOffAmount =
          paymentManagement.payOffAmount - scheduleItem.principal;
        scheduleItem.paymentId = '';
        scheduleItem.payment = scheduleItem.amount;
        scheduleItem.paymentDate = today;
        scheduleItem.transactionMessage = 'Payment is waived';
        scheduleItem.transId = '';
      }
    });

    await this.PaymentManagementModel.save(paymentManagement);
  }

  async forgiveLatefee(screenTrackingId: string, requestId: string) {
    const paymentManagement: PaymentManagement | null =
      await this.PaymentManagementModel.findOne({
        screenTracking: screenTrackingId,
      });
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${AdminDashboardService.name}#getPaymentSchedule`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${screenTrackingId}`,
          requestId,
        ),
      );
    }

    paymentManagement.paymentSchedule.forEach((scheduleItem) => {
      if (scheduleItem.fees != 0 && scheduleItem.status === 'opened') {
        scheduleItem.fees = 0;
      }
    });

    let PaymentManagement =
      this.PaymentManagementModel.create(paymentManagement);
    PaymentManagement = await this.PaymentManagementModel.save(
      PaymentManagement,
    );

    return PaymentManagement;
  }

  async approveContractor(email: string, requestId: string) {
    const user: User | null = await this.UserModel.findOne({
      where: {
        email: email
      },
      relations: ['practiceManagement']
    });
    const practiceManagement = user?.practiceManagement as PracticeManagement;
    await this.adminService.createAdmin(
      {
        userName: user.firstName + ' ' + user.lastName,
        email: user.email,
        phoneNumber: '1231231233',
        role: 'Merchant',
        practiceManagement: practiceManagement?.id,
        initialPassword: user.passwordRaw,
      },
      null,
      requestId,
    );
    const pm = await this.PaymentManagementModel.update(
      {
        user: user.id,
      },
      { status: 'approved' },
    );
    const sc = await this.ScreenTrackingModel.update(
      {
        user: user.id,
      },
      { lastScreen: 'contract-signed' },
    );

    return pm;
  }

  async denyContractor(email: string, requestId: string) {
    const user: User | null = await this.UserModel.findOne({
      where: {
        email: email,
      },
      relations: ['practiceManagement'],
    });
    const pm = await this.PaymentManagementModel.update(
      {
        user: user.id,
      },
      { status: 'denied' },
    );
    const practiceManagement = user?.practiceManagement as PracticeManagement;
    const context = {
      firstName: user.firstName,
      businessName: practiceManagement?.practiceName,
      baseUrl: Config().baseUrl,
    };
    const html: string = await this.nunjucksService.htmlToString(
      'emails/denial.html',
      context,
    );
    const fromName = this.configService.get<string>('sendGridFromName');
    const fromEmail = this.configService.get<string>('sendGridFromEmail');
    await this.sendGridService.sendEmail(
      `${fromName} <${fromEmail}>`,
      user.email,
      'So sorry! TGUC Financial can not qualify you right now but we still have other opportunities available for you!',
      html,
      requestId,
    );

    return pm;
  }

  async updateApplicationState(
    email: string,
    requestId: string,
    status: string,
    sendEmail = true,
  ) {
    const user: User | null = await this.UserModel.findOne({
      where: {
        email: email,
      },
      relations: ['practiceManagement'],
    });
    let obj;
    switch (status) {
      case 'approved':
        obj = {
          status: 'approved',
        };
        break;
      case 'denied':
        obj = {
          status: 'denied',
        };
        break;
      case 'pending':
        obj = {
          status: 'pending',
        };
        break;
      case 'qualified':
        obj = {
          status: 'qualified',
        };
        break;
      case 'non-qualified':
        obj = {
          status: 'non-qualified',
        };
        break;
      default:
        obj = {
          status: 'pending',
        };
        break;
    }
    const pm = await this.PaymentManagementModel.update(
      {
        user: user.id,
      },
      obj,
    );
    const sc = await this.ScreenTrackingModel.update(
      { user: user.id },
      {
        lastScreen:
          status == 'qualified' ? 'sign-contract' : 'waiting-for-approve',
      },
    );
    if (!pm || !sc) {
      this.logger.log(
        'Payment management not found',
        `${AdminDashboardService.name}#updateApplicationState`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${email}`,
          requestId,
        ),
      );
    }
    if (sendEmail === true) {
      const practiceManagement = user?.practiceManagement as PracticeManagement;
      const data = {
        firstName: user.firstName,
        email: user.email,
        lastName: user.lastName,
        businessName: practiceManagement?.practiceName,
        loginLink:
          status === 'qualified'
            ? 'https://tguc.alchemylms.com/application/login'
            : 'https://tguc.alchemylms.com/application/apply-contractor/',
        baseUrl: Config().baseUrl,
      };
      this.sendEmailBasedOnStatusChange(obj.status, data, requestId);
    }
    return pm;
  }

  async sendEmailBasedOnStatusChange(
    status: string,
    data: any,
    requestId: string,
  ) {
    const context = data;
    let html = '';
    switch (status) {
      case 'qualified':
        html = await this.nunjucksService.htmlToString(
          'emails/qualified.html',
          context,
        );
        break;
      case 'approved':
        html = await this.nunjucksService.htmlToString(
          'emails/Welcome.html',
          context,
        );
        break;
      default:
        false;
        break;
    }
    try {
      const fromName = this.configService.get<string>('sendGridFromName');
      const fromEmail = this.configService.get<string>('sendGridFromEmail');
      await this.sendGridService.sendEmail(
        `${fromName} <${fromEmail}>`,
        data.email,
        'TGUC Financial Contractor Application Approval',
        html,
        requestId,
      );
      return true;
    } catch (e) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Error #sendEmailBasedOnStatusChange ${data.email} ${e}`,
          requestId,
        ),
      );
    }
  }

  async deferPayment(screenTrackingId: string, requestId: string) {
    const paymentManagement: PaymentManagement | null =
      await this.PaymentManagementModel.findOne({
        screenTracking: screenTrackingId,
      });
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${AdminDashboardService.name}#getPaymentSchedule`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${screenTrackingId}`,
          requestId,
        ),
      );
    }

    const paymentScheduleItems: IPaymentScheduleItem[] =
      paymentManagement.paymentSchedule.filter(
        (scheduleItem) => scheduleItem.status === 'opened',
      );
    paymentScheduleItems.forEach(
      (scheduleItem, index, paymentScheduleItems) => {
        if (index + 1 < paymentScheduleItems.length) {
          scheduleItem.fees += paymentScheduleItems[index + 1].fees;
          paymentScheduleItems[index + 1].fees = 0;
        }
        scheduleItem.date = moment(scheduleItem.date).add(1, 'months').toDate();
      },
    );
    const updatedPaymentManagement = {
      paymentSchedule: paymentManagement.paymentSchedule,
    };

    await this.PaymentManagementModel.update(
      { id: paymentManagement.id },
      updatedPaymentManagement,
    );
    return PaymentManagement;
  }

  async setWorkCompletion(
    screenTrackingId: string,
    requestId: string,
    status: boolean,
  ) {
    const screenTracking: any | null = await this.ScreenTrackingModel.findOne({
      where: { id: screenTrackingId },
      relations: ['user', 'practiceManagement'],
    });
    if (!screenTracking) {
      this.logger.log(
        'screenTracking not found',
        `${AdminDashboardService.name}#setWorkCompletion`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `screenTracking not found for screenTrackingid ${screenTrackingId}`,
          requestId,
        ),
      );
    }
    const pm = await this.ScreenTrackingModel.update(
      {
        id: screenTracking.id,
      },
      { isAwaitingWorkCompletion: status },
    );
    if (pm && status === true) {
      const borrowerEmail = screenTracking.user.email;
      const data = {
        consumerFirstName: screenTracking.user.firstName,
        contractorBusinessName: screenTracking.practiceManagement.practiceName,
      };
      this.sendEmailFunction(
        borrowerEmail,
        'approval-email-borrower',
        data,
        requestId,
      );
    }
    return pm;
  }

  async sendEmailFunction(
    email: string,
    type = '',
    data: any = {},
    requestId: string,
  ) {
    let subject;
    const context = { ...data, baseUrl: Config().baseUrl };
    const template = await this.getHtmlTemplate(`emails/${type}.html`, context);
    switch (type) {
      case 'approval-email-borrower':
        subject = 'Your project is waiting for approval';
        break;
      case 'approval-email-contractor' || 'approval-email-sale-agent':
        subject = 'Congratulations approved funding is on its way!!!';
      case 'denied-email-contractor' ||
        'denied-email-borrower' ||
        'denied-email-sales-agent' ||
        'denied-email-tguc':
        subject = 'Congratulations approved funding is on its way!!!';
      case 'denied-email-borrower':
        subject = 'Uh oh!!!';
      default:
        break;
    }
    try {
      const fromName = this.configService.get<string>('sendGridFromName');
      const fromEmail = this.configService.get<string>('sendGridFromEmail');
      await this.sendGridService.sendEmail(
        `${fromName} <${fromEmail}>`,
        email,
        subject,
        template,
        requestId,
      );
    } catch (e) {
      throw new NotFoundException(
        this.appService.errorHandler(
          400,
          `Error #sendEmailFunction ${email}`,
          requestId,
        ),
      );
    }
  }

  async getHtmlTemplate(template, context) {
    return await this.nunjucksService.htmlToString(template, context);
  }
}

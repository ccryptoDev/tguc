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
    private readonly s3Service: S3Service,
    private readonly ledgerService: LedgerService,
    private readonly paymentService: PaymentService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
    private readonly adminService: AdminService,
    private readonly nunjucksService: NunjucksService,
    private readonly sendGridService: SendGridService,
    private readonly configService: ConfigService,
  ) {}

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

    const contractorApplication = applicationsResponse[0].filter(
      (application: any) => application.screenTracking.isContractor,
    );

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

    const borrowerApplications = applicationsResponse[0].filter(
      (application: any) => !application.screenTracking.isContractor,
    );

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
      ricSignature = `data:${
        signature.ContentType
      };base64,${signature.Body.toString('base64')}`;
    }

    const creditReportDocument = await this.getCreditReport(
      screenTrackingId,
      requestId,
    );

    let rulesDetails = {
      ruleData: {
        s2_bu_0: {
          passed: false,
          ruleId: 's2_bu_0',
          message: 's2_bu_0: Fico score',
          adjWeight: 0,
          userValue: 515,
          description: 'Fico score',
        },
        s2_bu_1: {
          passed: true,
          ruleId: 's2_bu_1',
          message: 's2_bu_3: Installment tradeline >= 1 then pass',
          adjWeight: 0,
          userValue: 2,
          description: 'Utilization of Installment Trades',
        },
        s2_bu_2: {
          passed: false,
          ruleId: 's2_bu_2',
          message: 's2_bu_3: Revolving Trade Lines >= 3 then pass',
          adjWeight: 0,
          userValue: 2,
          description: 'Revolving Trade Lines',
        },
        s2_bu_5: {
          passed: true,
          ruleId: 's2_bu_5',
          message: 's2_bu_5: Bankruptcies in the Last 36 Months <= 0 then pass',
          adjWeight: 0,
          userValue: 0,
          description: 'Bankruptcies in the Last 36 Months',
        },
        s1_app_1: {
          passed: true,
          ruleId: 's1_app_1',
          message: 's1_app_1: Age >= 18 then pass',
          userValue: 30,
          description: 'Age',
        },
        s1_app_2: {
          passed: true,
          ruleId: 's1_app_2',
          message: 's1_app_2: Monthly Income >= 2000 then pass',
          userValue: 90000,
          description: 'Monthly Income',
        },
      },
      loanApproved: true,
      totalAdjWeight: 0,
      approvedRuleMsg: [
        's1_app_1: Age >= 18 then pass',
        's1_app_2: Monthly Income >= 1000 then pass',
        's2_bu_0: No-hit != true then pass',
        's2_bu_1: Months of Credit History >= 12 then pass',
        's2_bu_2: Active Trade Lines >= 1 then pass',
        's2_bu_3: Revolving Trade Lines >= 1 then pass',
        's2_bu_4: Inquiries in the last 6 Months <= 12 then pass',
        's2_bu_5: Bankruptcies in the Last 24 Months <= 0 then pass',
        's2_bu_6: Foreclosures in the Last 24 Months <= 0 then pass',
        's2_bu_7: Public Records in the Last 24 Months <= 5 then pass',
        's2_bu_8: Trades with 60+ DPD in the Last 24 Months <= 4 then pass',
        's2_bu_9: Trades with 60+ DPD in the Last 6 Months <= 2 then pass',
        's2_bu_10: Utilization of Revolving Trades <= 0.9 then pass',
      ],
      declinedRuleMsg: [],
    };
    let rulesDetails2 = {};
    if (user.firstName.toLocaleUpperCase() == 'JONATHAN') {
      rulesDetails = {
        ruleData: {
          s2_bu_0: {
            passed: true,
            ruleId: 's2_bu_0',
            message: 's2_bu_0: Fico score',
            adjWeight: 0,
            userValue: 824,
            description: 'Fico score',
          },
          s2_bu_1: {
            passed: true,
            ruleId: 's2_bu_1',
            message: 's2_bu_3: Installment tradeline >= 1 then pass',
            adjWeight: 0,
            userValue: 2,
            description: 'Utilization of Installment Trades',
          },
          s2_bu_2: {
            passed: true,
            ruleId: 's2_bu_2',
            message: 's2_bu_3: Revolving Trade Lines >= 3 then pass',
            adjWeight: 0,
            userValue: 18,
            description: 'Revolving Trade Lines',
          },
          s2_bu_5: {
            passed: true,
            ruleId: 's2_bu_5',
            message:
              's2_bu_5: Bankruptcies in the Last 36 Months <= 0 then pass',
            adjWeight: 0,
            userValue: 0,
            description: 'Bankruptcies in the Last 36 Months',
          },
          s1_app_1: {
            passed: true,
            ruleId: 's1_app_1',
            message: 's1_app_1: Age >= 18 then pass',
            userValue: 30,
            description: 'Age',
          },
          s1_app_2: {
            passed: true,
            ruleId: 's1_app_2',
            message: 's1_app_2: Monthly Income >= 2000 then pass',
            userValue: 90000,
            description: 'Monthly Income',
          },
        },
        loanApproved: true,
        totalAdjWeight: 0,
        approvedRuleMsg: [
          's1_app_1: Age >= 18 then pass',
          's1_app_2: Monthly Income >= 1000 then pass',
          's2_bu_0: No-hit != true then pass',
          's2_bu_1: Months of Credit History >= 12 then pass',
          's2_bu_2: Active Trade Lines >= 1 then pass',
          's2_bu_3: Revolving Trade Lines >= 1 then pass',
          's2_bu_4: Inquiries in the last 6 Months <= 12 then pass',
          's2_bu_5: Bankruptcies in the Last 24 Months <= 0 then pass',
          's2_bu_6: Foreclosures in the Last 24 Months <= 0 then pass',
          's2_bu_7: Public Records in the Last 24 Months <= 5 then pass',
          's2_bu_8: Trades with 60+ DPD in the Last 24 Months <= 4 then pass',
          's2_bu_9: Trades with 60+ DPD in the Last 6 Months <= 2 then pass',
          's2_bu_10: Utilization of Revolving Trades <= 0.9 then pass',
        ],
        declinedRuleMsg: [],
      };
      if (screenTrackingDocument.isContractor) {
        rulesDetails2 = {
          ruleData: {
            s2_bu_0: {
              passed: true,
              ruleId: 's2_bu_0',
              message: 's2_bu_0: Fico score',
              adjWeight: 0,
              userValue: 824,
              description: 'Fico score',
            },
          },
          loanApproved: true,
          totalAdjWeight: 0,
          approvedRuleMsg: ['s2_bu_0: No-hit != true then pass'],
          declinedRuleMsg: [],
        };
      }
    } else if (user.firstName.toLocaleUpperCase() == 'SHABNAM') {
      rulesDetails = {
        ruleData: {
          s2_bu_0: {
            passed: false,
            ruleId: 's2_bu_0',
            message: 's2_bu_0: Fico score',
            adjWeight: 0,
            userValue: 515,
            description: 'Fico score',
          },
          s2_bu_1: {
            passed: true,
            ruleId: 's2_bu_1',
            message: 's2_bu_3: Installment tradeline >= 1 then pass',
            adjWeight: 0,
            userValue: 2,
            description: 'Utilization of Installment Trades',
          },
          s2_bu_2: {
            passed: true,
            ruleId: 's2_bu_2',
            message: 's2_bu_3: Revolving Trade Lines >= 3 then pass',
            adjWeight: 0,
            userValue: 15,
            description: 'Revolving Trade Lines',
          },
          s2_bu_5: {
            passed: true,
            ruleId: 's2_bu_5',
            message:
              's2_bu_5: Bankruptcies in the Last 36 Months <= 0 then pass',
            adjWeight: 0,
            userValue: 0,
            description: 'Bankruptcies in the Last 36 Months',
          },
          s1_app_1: {
            passed: true,
            ruleId: 's1_app_1',
            message: 's1_app_1: Age >= 18 then pass',
            userValue: 30,
            description: 'Age',
          },
          s1_app_2: {
            passed: true,
            ruleId: 's1_app_2',
            message: 's1_app_2: Monthly Income >= 2000 then pass',
            userValue: 90000,
            description: 'Monthly Income',
          },
        },
        loanApproved: true,
        totalAdjWeight: 0,
        approvedRuleMsg: [
          's1_app_1: Age >= 18 then pass',
          's1_app_2: Monthly Income >= 1000 then pass',
          's2_bu_0: No-hit != true then pass',
          's2_bu_1: Months of Credit History >= 12 then pass',
          's2_bu_2: Active Trade Lines >= 1 then pass',
          's2_bu_3: Revolving Trade Lines >= 1 then pass',
          's2_bu_4: Inquiries in the last 6 Months <= 12 then pass',
          's2_bu_5: Bankruptcies in the Last 24 Months <= 0 then pass',
          's2_bu_6: Foreclosures in the Last 24 Months <= 0 then pass',
          's2_bu_7: Public Records in the Last 24 Months <= 5 then pass',
          's2_bu_8: Trades with 60+ DPD in the Last 24 Months <= 4 then pass',
          's2_bu_9: Trades with 60+ DPD in the Last 6 Months <= 2 then pass',
          's2_bu_10: Utilization of Revolving Trades <= 0.9 then pass',
        ],
        declinedRuleMsg: [],
      };
      if (screenTrackingDocument.isContractor) {
        rulesDetails2 = {
          ruleData: {
            s2_bu_0: {
              passed: false,
              ruleId: 's2_bu_0',
              message: 's2_bu_0: Fico score',
              adjWeight: 0,
              userValue: 515,
              description: 'Fico score',
            },
          },
          loanApproved: true,
          totalAdjWeight: 0,
          approvedRuleMsg: ['s2_bu_0: No-hit != true then pass'],
          declinedRuleMsg: [],
        };
      }
    } else if (user.firstName.toLocaleUpperCase() == 'STARR') {
      rulesDetails = {
        ruleData: {
          s2_bu_0: {
            passed: true,
            ruleId: 's2_bu_0',
            message: 's2_bu_0: Fico score',
            adjWeight: 0,
            userValue: 750,
            description: 'Fico score',
          },
          s2_bu_1: {
            passed: true,
            ruleId: 's2_bu_1',
            message: 's2_bu_3: Installment tradeline >= 1 then pass',
            adjWeight: 0,
            userValue: 1,
            description: 'Utilization of Installment Trades',
          },
          s2_bu_2: {
            passed: false,
            ruleId: 's2_bu_2',
            message: 's2_bu_3: Revolving Trade Lines >= 3 then pass',
            adjWeight: 0,
            userValue: 2,
            description: 'Revolving Trade Lines',
          },
          s2_bu_5: {
            passed: true,
            ruleId: 's2_bu_5',
            message:
              's2_bu_5: Bankruptcies in the Last 36 Months <= 0 then pass',
            adjWeight: 0,
            userValue: 0,
            description: 'Bankruptcies in the Last 36 Months',
          },
          s1_app_1: {
            passed: true,
            ruleId: 's1_app_1',
            message: 's1_app_1: Age >= 18 then pass',
            userValue: 30,
            description: 'Age',
          },
          s1_app_2: {
            passed: true,
            ruleId: 's1_app_2',
            message: 's1_app_2: Monthly Income >= 2000 then pass',
            userValue: screenTrackingDocument.incomeAmount,
            description: 'Monthly Income',
          },
        },
        loanApproved: true,
        totalAdjWeight: 0,
        approvedRuleMsg: [
          's1_app_1: Age >= 18 then pass',
          's1_app_2: Monthly Income >= 1000 then pass',
          's2_bu_0: No-hit != true then pass',
          's2_bu_1: Months of Credit History >= 12 then pass',
          's2_bu_2: Active Trade Lines >= 1 then pass',
          's2_bu_3: Revolving Trade Lines >= 1 then pass',
          's2_bu_4: Inquiries in the last 6 Months <= 12 then pass',
          's2_bu_5: Bankruptcies in the Last 24 Months <= 0 then pass',
          's2_bu_6: Foreclosures in the Last 24 Months <= 0 then pass',
          's2_bu_7: Public Records in the Last 24 Months <= 5 then pass',
          's2_bu_8: Trades with 60+ DPD in the Last 24 Months <= 4 then pass',
          's2_bu_9: Trades with 60+ DPD in the Last 6 Months <= 2 then pass',
          's2_bu_10: Utilization of Revolving Trades <= 0.9 then pass',
        ],
        declinedRuleMsg: [],
      };
    }
    const midDesk = {
      PhoneNumber: {
        message: 'Unable to verify the submitted Phone Number',
        status: 'warning',
      },
      Liens: {
        message: 'No Liens found',
        status: 'success',
      },
      BusinessName: {
        message: 'Match identified to the submitted Business Name',
        status: 'success',
      },
      OfficeAddress: {
        message: 'Match identified to the submitted Office Address',
        status: 'success',
      },
      SOSFilings: {
        message:
          'The business is Active in the state of the submitted Office Address',
        status: 'success',
      },
      SOSFilings2: {
        message: '1 of 1 filings are Active',
        status: 'success',
      },
      SOSFilings3: {
        message: 'Active domestic filing found',
        status: 'success',
      },
      Watchlist: {
        message: 'No Watchlist hits were identified',
        status: 'success',
      },
      TrueIndustry: {
        message:
          'This business likely does not operate in a high risk industry',
        status: 'success',
      },
      Website: {
        message: 'Website was Online when the business record was ordered',
        status: 'success',
      },
    };
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
      rulesDetails: screenTrackingDocument.isContractor
        ? rulesDetails2
        : rulesDetails,
      midDesk: midDesk,
      practiceManagement: PracticeManagementDocument.practiceManagement,
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
    let creditReport = {};
    if (user.firstName.toLocaleUpperCase() == 'JONATHAN') {
      creditReport = {
        addOnProduct: [
          {
            code: '00W18',
            status: 'defaultDelivered',
            scoreModel: {
              score: {
                factors: {
                  factor: [
                    {
                      code: '003',
                      rank: '1',
                    },
                    {
                      code: '010',
                      rank: '2',
                    },
                    {
                      code: '005',
                      rank: '3',
                    },
                    {
                      code: '030',
                      rank: '4',
                    },
                  ],
                },
                results: '+824',
                derogatoryAlert: 'false',
                fileInquiriesImpactedScore: 'false',
              },
            },
          },
        ],
        createdAt: '2022-02-28T18:01:17.911078-06:00',
        creditCollection: null,
        employment: [
          {
            source: 'file',
            employer: {
              unparsed: 'WELLS FARGO BANK',
            },
            occupation: 'TELLER',
            dateEffective: {
              _: '2022-01-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOnFileSince: {
              _: '2022-01-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
          },
          {
            source: 'file',
            employer: {
              unparsed: 'ABC',
            },
            dateEffective: {
              _: '2022-01-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOnFileSince: {
              _: '2022-01-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
          },
        ],
        firstName: 'JONATHAN',
        houseNumber: [
          {
            source: 'file',
            status: 'current',
            street: {
              name: 'North Birch',
              type: 'RD',
              unit: {
                number: '',
              },
              number: '10655',
            },
            location: {
              city: 'BURBANK',
              state: 'UT',
              zipCode: '91502',
            },
            qualifier: 'personal',
            dateReported: {
              _: '2019-09-04',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
          },
        ],
        id: '64642525-39b7-46ed-8c29-9c60c8c1fc81',
        inquiry: [
          {
            date: {
              _: '2022-02-03',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            subscriber: {
              name: {
                unparsed: 'KUBER FINANC',
              },
              memberCode: '09351169',
              industryCode: 'F',
              inquirySubscriberPrefixCode: '06TR',
            },
            ECOADesignator: 'individual',
          },
        ],
        isNoHit: false,
        lastName: 'CONSUMER',
        middleName: 'H',
        publicRecord: null,
        score: '+824',
        socialSecurity: '*****9990',
        status: 0,
        trade: [
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000235',
              paymentScheduleMonthCount: '120',
            },
            account: {
              type: 'HI',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2012-01-18',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000016000',
            subscriber: {
              name: {
                unparsed: 'COMERICA BK',
              },
              memberCode: '08737114',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '222229142476341',
            accountRating: '01',
            dateEffective: {
              _: '2022-01-25',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000000',
            paymentHistory: '',
          },
          {
            remark: {
              code: 'CBC',
              type: 'affiliate',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2021-12-12',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2018-03-13',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000002738',
            subscriber: {
              name: {
                unparsed: 'PEOPLES UNTD',
              },
              memberCode: '06330016',
              industryCode: 'B',
            },
            creditLimit: '000005800',
            updateMethod: 'manual',
            accountNumber: '222229010041',
            accountRating: '01',
            dateEffective: {
              _: '2022-01-08',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111111111111111111111111111111111111',
                startDate: {
                  _: '2021-12-08',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '46',
              },
            },
            closedIndicator: 'normal',
          },
          {
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2015-10-15',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000005229',
            subscriber: {
              name: {
                unparsed: 'HSBC BANK',
              },
              memberCode: '07991190',
              industryCode: 'B',
            },
            creditLimit: '000011000',
            datePaidOut: {
              _: '2021-11-06',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            updateMethod: 'manual',
            accountNumber: '222225425002',
            accountRating: '01',
            dateEffective: {
              _: '2021-12-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '11111111111111111111111X111111111111111111111111',
                startDate: {
                  _: '2021-11-10',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '48',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2021-11-10',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CBC',
              type: 'affiliate',
            },
            account: {
              type: 'CH',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2015-10-14',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000000687',
            subscriber: {
              name: {
                unparsed: 'HSBC/RS',
              },
              memberCode: '0235197E',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '22222001567',
            accountRating: '01',
            dateEffective: {
              _: '2021-12-09',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111111111111111111111111111111111111111',
                startDate: {
                  _: '2021-11-09',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '48',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2021-11-09',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            account: {
              type: 'CH',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2021-03-14',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000005000',
            subscriber: {
              name: {
                unparsed: 'AMER GEN FIN',
              },
              memberCode: '0640N038',
              industryCode: 'B',
            },
            creditLimit: '000005000',
            updateMethod: 'manual',
            accountNumber: '222226500546',
            accountRating: '01',
            dateEffective: {
              _: '2021-12-08',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'individual',
            currentBalance: '000001181',
            paymentHistory: {
              paymentPattern: {
                text: '1111111X1',
                startDate: {
                  _: '2021-11-08',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '09',
              },
            },
          },
          {
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2021-12-14',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000000000',
            subscriber: {
              name: {
                unparsed: 'PROVDN BNP',
              },
              memberCode: '01LFG001',
              industryCode: 'B',
            },
            creditLimit: '000005000',
            updateMethod: 'manual',
            accountNumber: '2382305235',
            accountRating: '01',
            dateEffective: {
              _: '2021-12-07',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: '',
          },
          {
            pastDue: '000000000',
            dateOpened: {
              _: '2001-03-17',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000002785',
            subscriber: {
              name: {
                unparsed: 'GEMB/M WARD',
              },
              memberCode: '0235008G',
              industryCode: 'D',
            },
            creditLimit: '000005000',
            updateMethod: 'manual',
            accountNumber: '2222242',
            accountRating: '01',
            dateEffective: {
              _: '2021-11-17',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'participant',
            currentBalance: '000000199',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111111111111111111111111111111111111111',
                startDate: {
                  _: '2021-10-17',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '48',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2021-11-11',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000928',
              paymentScheduleMonthCount: '360',
            },
            account: {
              type: 'CV',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2020-05-31',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000118000',
            subscriber: {
              name: {
                unparsed: 'WASH MTG CO',
              },
              memberCode: '0338S003',
              industryCode: 'F',
            },
            updateMethod: 'manual',
            accountNumber: '2222212',
            accountRating: '01',
            dateEffective: {
              _: '2021-11-14',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'mortgage',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000116317',
            paymentHistory: {
              paymentPattern: {
                text: '11111111111111111',
                startDate: {
                  _: '2021-10-14',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '17',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2021-11-08',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000309',
              paymentScheduleMonthCount: '066',
            },
            account: {
              type: 'AU',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2020-10-13',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000015646',
            subscriber: {
              name: {
                unparsed: 'CONTINENTAL',
              },
              memberCode: '01W2N002',
              industryCode: 'F',
            },
            updateMethod: 'manual',
            accountNumber: '22222166717641001',
            accountRating: '01',
            dateEffective: {
              _: '2021-11-13',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'individual',
            currentBalance: '000013211',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111',
                startDate: {
                  _: '2021-10-13',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '12',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2021-11-07',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000260',
              paymentScheduleMonthCount: '066',
            },
            account: {
              type: 'AU',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2021-07-09',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000013375',
            subscriber: {
              name: {
                unparsed: 'CONTINENTAL',
              },
              memberCode: '01W2N002',
              industryCode: 'F',
            },
            updateMethod: 'manual',
            accountNumber: '22222167456951001',
            accountRating: '01',
            dateEffective: {
              _: '2021-11-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'individual',
            currentBalance: '000012753',
            paymentHistory: {
              paymentPattern: {
                text: '111',
                startDate: {
                  _: '2021-10-10',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '03',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2021-11-05',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000281',
              paymentScheduleMonthCount: '084',
            },
            account: {
              type: 'SE',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2021-11-06',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000018000',
            subscriber: {
              name: {
                unparsed: 'JPMCB HOME',
              },
              memberCode: '0348D153',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '22222220000176077',
            accountRating: '01',
            dateEffective: {
              _: '2021-11-09',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000018000',
            paymentHistory: '',
          },
          {
            terms: {
              scheduledMonthlyPayment: '000000015',
              paymentScheduleMonthCount: 'MIN',
            },
            account: {
              type: 'CH',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2009-01-20',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000006700',
            subscriber: {
              name: {
                unparsed: 'SPIEGEL',
              },
              memberCode: '0152B021',
              industryCode: 'B',
            },
            creditLimit: '000006700',
            updateMethod: 'manual',
            accountNumber: '222229',
            accountRating: '01',
            dateEffective: {
              _: '2021-10-18',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'authorizedUser',
            currentBalance: '000000033',
            paymentHistory: {
              paymentPattern: {
                text: '1111111111111',
                startDate: {
                  _: '2021-09-18',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '48',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2020-12-21',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              scheduledMonthlyPayment: '000000010',
              paymentScheduleMonthCount: 'MIN',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2019-11-07',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000000456',
            subscriber: {
              name: {
                unparsed: 'KOHLS/CHASE',
              },
              memberCode: '012EN001',
              industryCode: 'D',
            },
            creditLimit: '000002000',
            updateMethod: 'manual',
            accountNumber: '2222268',
            accountRating: '01',
            dateEffective: {
              _: '2021-10-11',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'participant',
            currentBalance: '000000024',
            paymentHistory: {
              paymentPattern: {
                text: '11111111111111111111111',
                startDate: {
                  _: '2021-09-11',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '23',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2021-10-06',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              scheduledMonthlyPayment: '000000017',
              paymentScheduleMonthCount: 'MIN',
            },
            account: {
              type: 'CH',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2009-11-08',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000000622',
            subscriber: {
              name: {
                unparsed: 'RNB-MERVYN',
              },
              memberCode: '01249003',
              industryCode: 'D',
            },
            creditLimit: '000000800',
            updateMethod: 'manual',
            accountNumber: '2222268',
            accountRating: '01',
            dateEffective: {
              _: '2021-08-06',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000326',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111111111111111111111111111111111111111',
                startDate: {
                  _: '2021-07-06',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '48',
              },
            },
          },
          {
            remark: {
              code: 'CBC',
              type: 'affiliate',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2020-01-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2018-03-15',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000008000',
            subscriber: {
              name: {
                unparsed: 'FST USA BK B',
              },
              memberCode: '07519027',
              industryCode: 'B',
            },
            creditLimit: '000008000',
            updateMethod: 'manual',
            accountNumber: '222221295336',
            accountRating: '01',
            dateEffective: {
              _: '2021-08-04',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111XXXX111111111111',
                startDate: {
                  _: '2021-07-04',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '28',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2018-09-30',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000241',
              paymentScheduleMonthCount: '024',
            },
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'LE',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2021-07-11',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2019-07-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000005790',
            subscriber: {
              name: {
                unparsed: 'FOA LEASING',
              },
              memberCode: '01607092',
              industryCode: 'Q',
            },
            updateMethod: 'manual',
            accountNumber: '2222209434',
            accountRating: '01',
            dateEffective: {
              _: '2021-07-11',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: 'X1X111111111111X111111111',
                startDate: {
                  _: '2021-06-11',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '25',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2021-07-10',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              scheduledMonthlyPayment: '000000030',
              paymentScheduleMonthCount: 'MIN',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2020-01-13',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000001499',
            subscriber: {
              name: {
                unparsed: 'HSBC BANK',
              },
              memberCode: '092WL001',
              industryCode: 'B',
            },
            creditLimit: '000008000',
            updateMethod: 'manual',
            accountNumber: '222220032387',
            accountRating: '01',
            dateEffective: {
              _: '2021-06-18',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'authorizedUser',
            currentBalance: '000001467',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111111',
                startDate: {
                  _: '2021-05-18',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '16',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2021-05-02',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              scheduledMonthlyPayment: '000000049',
              paymentScheduleMonthCount: 'MIN',
            },
            account: {
              type: 'CH',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '1999-01-19',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000002080',
            subscriber: {
              name: {
                unparsed: 'CBUSASEARS',
              },
              memberCode: '06256397',
              industryCode: 'D',
            },
            creditLimit: '000005300',
            updateMethod: 'manual',
            accountNumber: '222222980',
            accountRating: '01',
            dateEffective: {
              _: '2021-05-31',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'individual',
            currentBalance: '000002049',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111111111111111111111111111111111111111',
                startDate: {
                  _: '2021-04-30',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '48',
              },
            },
          },
          {
            pastDue: '000000000',
            dateOpened: {
              _: '2011-04-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000001425',
            subscriber: {
              name: {
                unparsed: 'CTBK/GARDNER',
              },
              memberCode: '01184058',
              industryCode: 'H',
            },
            creditLimit: '000004200',
            datePaidOut: {
              _: '2021-01-27',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            updateMethod: 'manual',
            accountNumber: '2222223',
            accountRating: '01',
            dateEffective: {
              _: '2021-03-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'participant',
            currentBalance: '000000000',
            paymentHistory: '',
            mostRecentPayment: {
              date: {
                _: '2016-05-06',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2020-09-17',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2011-04-12',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000001425',
            subscriber: {
              name: {
                unparsed: 'CCB/GRDWHI',
              },
              memberCode: '01NZ8007',
              industryCode: 'H',
            },
            creditLimit: '000004200',
            updateMethod: 'manual',
            accountNumber: '222227550023',
            accountRating: '01',
            dateEffective: {
              _: '2021-01-11',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'participant',
            currentBalance: '000000000',
            paymentHistory: {
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '48',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2016-06-10',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000306',
              paymentScheduleMonthCount: '060',
            },
            account: {
              type: 'AU',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2020-11-30',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2018-03-16',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000018409',
            subscriber: {
              name: {
                unparsed: 'FRD MOTOR CR',
              },
              memberCode: '03796540',
              industryCode: 'F',
            },
            updateMethod: 'manual',
            accountNumber: '2222273H28',
            accountRating: '01',
            dateEffective: {
              _: '2020-11-30',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: 'X11X11111X1X11X11111X111111111',
                startDate: {
                  _: '2020-10-30',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '32',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2020-10-06',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CBC',
              type: 'affiliate',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2020-04-30',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2020-01-14',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000003915',
            subscriber: {
              name: {
                unparsed: 'CAPITAL ONE',
              },
              memberCode: '01DTV001',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '222227143840',
            accountRating: '01',
            dateEffective: {
              _: '2020-10-15',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '1111111111',
                startDate: {
                  _: '2020-09-15',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '10',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2020-04-03',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000881',
              paymentScheduleMonthCount: '360',
            },
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'CV',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2020-05-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2018-09-24',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000100900',
            subscriber: {
              name: {
                unparsed: 'ABN-AMRO',
              },
              memberCode: '0624P004',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '2222210027233',
            accountRating: '01',
            dateEffective: {
              _: '2020-05-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'mortgage',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '111X111111111111111',
                startDate: {
                  _: '2020-04-01',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '19',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2020-04-13',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2018-06-18',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2017-01-15',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000008000',
            subscriber: {
              name: {
                unparsed: 'FLEET CC',
              },
              memberCode: '0517R022',
              industryCode: 'B',
            },
            creditLimit: '000008000',
            updateMethod: 'manual',
            accountNumber: '222229004200',
            accountRating: '01',
            dateEffective: {
              _: '2020-03-07',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'authorizedUser',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111111111',
                startDate: {
                  _: '2020-02-07',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '18',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2018-06-09',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2018-09-16',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2017-02-28',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            subscriber: {
              name: {
                unparsed: 'CHASE NA',
              },
              memberCode: '0402D017',
              industryCode: 'B',
            },
            creditLimit: '000004500',
            updateMethod: 'manual',
            accountNumber: '222220010119',
            accountRating: '01',
            dateEffective: {
              _: '2019-10-17',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111X1111',
                startDate: {
                  _: '2019-09-17',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '19',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2018-06-08',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CBC',
              type: 'affiliate',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2018-12-02',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2016-01-16',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000005199',
            subscriber: {
              name: {
                unparsed: 'CAPITAL ONE',
              },
              memberCode: '01DTV001',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '222224129347',
            accountRating: '01',
            dateEffective: {
              _: '2019-10-16',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '111111X1XX11111X11XX111111111X11XX1',
                startDate: {
                  _: '2019-09-16',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '46',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2019-01-16',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000786',
              paymentScheduleMonthCount: '360',
            },
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'CV',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2018-09-18',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2013-06-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000079900',
            subscriber: {
              name: {
                unparsed: 'ABN-AMRO',
              },
              memberCode: '0624P004',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '22222763886',
            accountRating: '01',
            dateEffective: {
              _: '2018-09-18',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'mortgage',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: 'X1111111111111111111X1111111111X1111111111',
                startDate: {
                  _: '2018-08-18',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '42',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2018-09-30',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              paymentScheduleMonthCount: '048',
            },
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'AU',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2018-06-19',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2014-06-30',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000005895',
            subscriber: {
              name: {
                unparsed: 'FOA BK',
              },
              memberCode: '062SV017',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '22222971312276369',
            accountRating: '01',
            dateEffective: {
              _: '2018-06-19',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: 'X111111X111111111X1111111X111X1X1XX1111',
                startDate: {
                  _: '2018-05-19',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '39',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2018-06-11',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CBC',
              type: 'affiliate',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2001-09-25',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000001800',
            subscriber: {
              name: {
                unparsed: 'RNB-FIELD1',
              },
              memberCode: '0590S008',
              industryCode: 'D',
            },
            creditLimit: '000001800',
            datePaidOut: {
              _: '2017-02-28',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            updateMethod: 'manual',
            accountNumber: '22222529',
            accountRating: '01',
            dateEffective: {
              _: '2018-03-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'participant',
            currentBalance: '000000000',
            paymentHistory: {
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '12',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2017-02-21',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CBC',
              type: 'affiliate',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2015-01-17',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000000800',
            subscriber: {
              name: {
                unparsed: 'TARGET N.B.',
              },
              memberCode: '06476004',
              industryCode: 'D',
            },
            creditLimit: '000000800',
            datePaidOut: {
              _: '2017-02-28',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            updateMethod: 'manual',
            accountNumber: '22222529',
            accountRating: '01',
            dateEffective: {
              _: '2018-03-09',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'participant',
            currentBalance: '000000000',
            paymentHistory: {
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '12',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2017-02-17',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000163',
              paymentScheduleMonthCount: '048',
            },
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'AU',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2018-03-06',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2016-02-29',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000006361',
            subscriber: {
              name: {
                unparsed: 'FOA BK',
              },
              memberCode: '062SV017',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '22222972061358607',
            accountRating: '01',
            dateEffective: {
              _: '2018-03-06',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: 'X111X111111111X1111111X11',
                startDate: {
                  _: '2018-02-06',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '25',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2018-03-31',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2017-03-05',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2016-12-15',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            subscriber: {
              name: {
                unparsed: 'FLEET CC',
              },
              memberCode: '0517R022',
              industryCode: 'B',
            },
            creditLimit: '000006000',
            updateMethod: 'manual',
            accountNumber: '222229002207',
            accountRating: '01',
            dateEffective: {
              _: '2018-02-15',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000000',
            paymentHistory: {
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '02',
              },
            },
            closedIndicator: 'normal',
          },
          {
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2017-09-19',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2012-08-14',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000002366',
            subscriber: {
              name: {
                unparsed: 'CHEVY CHASE',
              },
              memberCode: '09202010',
              industryCode: 'B',
            },
            creditLimit: '000012800',
            updateMethod: 'manual',
            accountNumber: '222225200441',
            accountRating: '01',
            dateEffective: {
              _: '2018-01-12',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111111111111111111111111',
                startDate: {
                  _: '2017-12-12',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '33',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2017-02-19',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CBC',
              type: 'affiliate',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2000-07-12',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000000710',
            subscriber: {
              name: {
                unparsed: 'JCP-MCCBG',
              },
              memberCode: '01972010',
              industryCode: 'D',
            },
            updateMethod: 'manual',
            accountNumber: '22222833',
            accountRating: '01',
            dateEffective: {
              _: '2017-02-17',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '11111111111111111111111',
                startDate: {
                  _: '2017-01-17',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '23',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              paymentScheduleMonthCount: '010',
            },
            account: {
              type: 'CO',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2016-08-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2011-04-11',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000001425',
            subscriber: {
              name: {
                unparsed: 'BNB/GW',
              },
              memberCode: '085TR001',
              industryCode: 'H',
            },
            updateMethod: 'manual',
            accountNumber: '2222275500230818',
            accountRating: '01',
            dateEffective: {
              _: '2016-08-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'participant',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '1111111111111111111',
                startDate: {
                  _: '2016-07-10',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '19',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2016-06-07',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000204',
              paymentScheduleMonthCount: '042',
            },
            account: {
              type: 'AU',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2011-07-11',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000006658',
            subscriber: {
              name: {
                unparsed: 'HUNTNGTON BK',
              },
              memberCode: '0211Q002',
              industryCode: 'B',
            },
            datePaidOut: {
              _: '2012-08-26',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            updateMethod: 'manual',
            accountNumber: '222229300489',
            accountRating: '01',
            dateEffective: {
              _: '2014-05-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: '',
          },
          {
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2010-10-16',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            subscriber: {
              name: {
                unparsed: 'CITI',
              },
              memberCode: '064DB003',
              industryCode: 'B',
            },
            datePaidOut: {
              _: '2012-05-31',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            updateMethod: 'manual',
            accountNumber: '222220225238',
            accountRating: '01',
            dateEffective: {
              _: '2012-09-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: '',
            mostRecentPayment: {
              date: {
                _: '2012-07-12',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              paymentScheduleMonthCount: '061',
            },
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'AU',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2016-02-29',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2012-08-13',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000015988',
            subscriber: {
              name: {
                unparsed: 'CHRYSLR FIN',
              },
              memberCode: '0624C151',
              industryCode: 'F',
            },
            updateMethod: 'manual',
            accountNumber: '2222257898',
            accountRating: 'UR',
            dateEffective: {
              _: '2016-02-29',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '11111111111',
                startDate: {
                  _: '2016-01-29',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '11',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2016-02-18',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
        ],
        updatedAt: '2022-02-28T18:01:17.911078-06:00',
        userId: '57b623b0-d980-4b28-b6d8-b4f85f83342b',
      };
    } else if (user.firstName.toLocaleUpperCase() == 'SHABNAM') {
      creditReport = {
        addOnProduct: [
          {
            code: '00W18',
            status: 'defaultDelivered',
            scoreModel: {
              score: {
                factors: {
                  factor: [
                    {
                      code: '003',
                      rank: '1',
                    },
                    {
                      code: '010',
                      rank: '2',
                    },
                    {
                      code: '005',
                      rank: '3',
                    },
                    {
                      code: '030',
                      rank: '4',
                    },
                  ],
                },
                results: '515',
                derogatoryAlert: 'false',
                fileInquiriesImpactedScore: 'false',
              },
            },
          },
        ],
        createdAt: '2022-02-28T18:01:17.911078-06:00',
        creditCollection: null,
        employment: [
          {
            source: 'file',
            employer: {
              unparsed: 'WELLS FARGO BANK',
            },
            occupation: 'TELLER',
            dateEffective: {
              _: '2022-01-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOnFileSince: {
              _: '2022-01-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
          },
          {
            source: 'file',
            employer: {
              unparsed: 'ABC',
            },
            dateEffective: {
              _: '2022-01-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOnFileSince: {
              _: '2022-01-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
          },
        ],
        firstName: 'SHABNAM',
        houseNumber: [
          {
            source: 'file',
            status: 'current',
            street: {
              name: 'Greymoor',
              type: 'RD',
              unit: {
                number: '',
              },
              number: '8180',
            },
            location: {
              city: 'Shoal Creek',
              state: 'UT',
              zipCode: '35242',
            },
            qualifier: 'personal',
            dateReported: {
              _: '2019-09-04',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
          },
        ],
        id: '64642525-39b7-46ed-8c29-9c60c8c1fc81',
        inquiry: [
          {
            date: {
              _: '2022-02-03',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            subscriber: {
              name: {
                unparsed: 'KUBER FINANC',
              },
              memberCode: '09351169',
              industryCode: 'F',
              inquirySubscriberPrefixCode: '06TR',
            },
            ECOADesignator: 'individual',
          },
        ],
        isNoHit: false,
        lastName: 'MCCALLEY',
        middleName: 'H',
        publicRecord: null,
        score: '515',
        socialSecurity: '*****8167',
        status: 0,
        trade: [
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000235',
              paymentScheduleMonthCount: '120',
            },
            account: {
              type: 'HI',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2012-01-18',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000016000',
            subscriber: {
              name: {
                unparsed: 'COMERICA BK',
              },
              memberCode: '08737114',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '222229142476341',
            accountRating: '01',
            dateEffective: {
              _: '2022-01-25',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000000',
            paymentHistory: '',
          },
          {
            remark: {
              code: 'CBC',
              type: 'affiliate',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2021-12-12',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2018-03-13',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000002738',
            subscriber: {
              name: {
                unparsed: 'PEOPLES UNTD',
              },
              memberCode: '06330016',
              industryCode: 'B',
            },
            creditLimit: '000005800',
            updateMethod: 'manual',
            accountNumber: '222229010041',
            accountRating: '01',
            dateEffective: {
              _: '2022-01-08',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111111111111111111111111111111111111',
                startDate: {
                  _: '2021-12-08',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '46',
              },
            },
            closedIndicator: 'normal',
          },
          {
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2015-10-15',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000005229',
            subscriber: {
              name: {
                unparsed: 'HSBC BANK',
              },
              memberCode: '07991190',
              industryCode: 'B',
            },
            creditLimit: '000011000',
            datePaidOut: {
              _: '2021-11-06',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            updateMethod: 'manual',
            accountNumber: '222225425002',
            accountRating: '01',
            dateEffective: {
              _: '2021-12-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '11111111111111111111111X111111111111111111111111',
                startDate: {
                  _: '2021-11-10',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '48',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2021-11-10',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CBC',
              type: 'affiliate',
            },
            account: {
              type: 'CH',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2015-10-14',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000000687',
            subscriber: {
              name: {
                unparsed: 'HSBC/RS',
              },
              memberCode: '0235197E',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '22222001567',
            accountRating: '01',
            dateEffective: {
              _: '2021-12-09',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111111111111111111111111111111111111111',
                startDate: {
                  _: '2021-11-09',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '48',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2021-11-09',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            account: {
              type: 'CH',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2021-03-14',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000005000',
            subscriber: {
              name: {
                unparsed: 'AMER GEN FIN',
              },
              memberCode: '0640N038',
              industryCode: 'B',
            },
            creditLimit: '000005000',
            updateMethod: 'manual',
            accountNumber: '222226500546',
            accountRating: '01',
            dateEffective: {
              _: '2021-12-08',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'individual',
            currentBalance: '000001181',
            paymentHistory: {
              paymentPattern: {
                text: '1111111X1',
                startDate: {
                  _: '2021-11-08',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '09',
              },
            },
          },
          {
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2021-12-14',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000000000',
            subscriber: {
              name: {
                unparsed: 'PROVDN BNP',
              },
              memberCode: '01LFG001',
              industryCode: 'B',
            },
            creditLimit: '000005000',
            updateMethod: 'manual',
            accountNumber: '2382305235',
            accountRating: '01',
            dateEffective: {
              _: '2021-12-07',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: '',
          },
          {
            pastDue: '000000000',
            dateOpened: {
              _: '2001-03-17',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000002785',
            subscriber: {
              name: {
                unparsed: 'GEMB/M WARD',
              },
              memberCode: '0235008G',
              industryCode: 'D',
            },
            creditLimit: '000005000',
            updateMethod: 'manual',
            accountNumber: '2222242',
            accountRating: '01',
            dateEffective: {
              _: '2021-11-17',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'participant',
            currentBalance: '000000199',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111111111111111111111111111111111111111',
                startDate: {
                  _: '2021-10-17',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '48',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2021-11-11',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000928',
              paymentScheduleMonthCount: '360',
            },
            account: {
              type: 'CV',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2020-05-31',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000118000',
            subscriber: {
              name: {
                unparsed: 'WASH MTG CO',
              },
              memberCode: '0338S003',
              industryCode: 'F',
            },
            updateMethod: 'manual',
            accountNumber: '2222212',
            accountRating: '01',
            dateEffective: {
              _: '2021-11-14',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'mortgage',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000116317',
            paymentHistory: {
              paymentPattern: {
                text: '11111111111111111',
                startDate: {
                  _: '2021-10-14',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '17',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2021-11-08',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000309',
              paymentScheduleMonthCount: '066',
            },
            account: {
              type: 'AU',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2020-10-13',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000015646',
            subscriber: {
              name: {
                unparsed: 'CONTINENTAL',
              },
              memberCode: '01W2N002',
              industryCode: 'F',
            },
            updateMethod: 'manual',
            accountNumber: '22222166717641001',
            accountRating: '01',
            dateEffective: {
              _: '2021-11-13',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'individual',
            currentBalance: '000013211',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111',
                startDate: {
                  _: '2021-10-13',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '12',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2021-11-07',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000260',
              paymentScheduleMonthCount: '066',
            },
            account: {
              type: 'AU',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2021-07-09',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000013375',
            subscriber: {
              name: {
                unparsed: 'CONTINENTAL',
              },
              memberCode: '01W2N002',
              industryCode: 'F',
            },
            updateMethod: 'manual',
            accountNumber: '22222167456951001',
            accountRating: '01',
            dateEffective: {
              _: '2021-11-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'individual',
            currentBalance: '000012753',
            paymentHistory: {
              paymentPattern: {
                text: '111',
                startDate: {
                  _: '2021-10-10',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '03',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2021-11-05',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000281',
              paymentScheduleMonthCount: '084',
            },
            account: {
              type: 'SE',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2021-11-06',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000018000',
            subscriber: {
              name: {
                unparsed: 'JPMCB HOME',
              },
              memberCode: '0348D153',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '22222220000176077',
            accountRating: '01',
            dateEffective: {
              _: '2021-11-09',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000018000',
            paymentHistory: '',
          },
          {
            terms: {
              scheduledMonthlyPayment: '000000015',
              paymentScheduleMonthCount: 'MIN',
            },
            account: {
              type: 'CH',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2009-01-20',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000006700',
            subscriber: {
              name: {
                unparsed: 'SPIEGEL',
              },
              memberCode: '0152B021',
              industryCode: 'B',
            },
            creditLimit: '000006700',
            updateMethod: 'manual',
            accountNumber: '222229',
            accountRating: '01',
            dateEffective: {
              _: '2021-10-18',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'authorizedUser',
            currentBalance: '000000033',
            paymentHistory: {
              paymentPattern: {
                text: '1111111111111',
                startDate: {
                  _: '2021-09-18',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '48',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2020-12-21',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              scheduledMonthlyPayment: '000000010',
              paymentScheduleMonthCount: 'MIN',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2019-11-07',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000000456',
            subscriber: {
              name: {
                unparsed: 'KOHLS/CHASE',
              },
              memberCode: '012EN001',
              industryCode: 'D',
            },
            creditLimit: '000002000',
            updateMethod: 'manual',
            accountNumber: '2222268',
            accountRating: '01',
            dateEffective: {
              _: '2021-10-11',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'participant',
            currentBalance: '000000024',
            paymentHistory: {
              paymentPattern: {
                text: '11111111111111111111111',
                startDate: {
                  _: '2021-09-11',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '23',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2021-10-06',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              scheduledMonthlyPayment: '000000017',
              paymentScheduleMonthCount: 'MIN',
            },
            account: {
              type: 'CH',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2009-11-08',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000000622',
            subscriber: {
              name: {
                unparsed: 'RNB-MERVYN',
              },
              memberCode: '01249003',
              industryCode: 'D',
            },
            creditLimit: '000000800',
            updateMethod: 'manual',
            accountNumber: '2222268',
            accountRating: '01',
            dateEffective: {
              _: '2021-08-06',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000326',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111111111111111111111111111111111111111',
                startDate: {
                  _: '2021-07-06',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '48',
              },
            },
          },
          {
            remark: {
              code: 'CBC',
              type: 'affiliate',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2020-01-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2018-03-15',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000008000',
            subscriber: {
              name: {
                unparsed: 'FST USA BK B',
              },
              memberCode: '07519027',
              industryCode: 'B',
            },
            creditLimit: '000008000',
            updateMethod: 'manual',
            accountNumber: '222221295336',
            accountRating: '01',
            dateEffective: {
              _: '2021-08-04',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111XXXX111111111111',
                startDate: {
                  _: '2021-07-04',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '28',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2018-09-30',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000241',
              paymentScheduleMonthCount: '024',
            },
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'LE',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2021-07-11',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2019-07-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000005790',
            subscriber: {
              name: {
                unparsed: 'FOA LEASING',
              },
              memberCode: '01607092',
              industryCode: 'Q',
            },
            updateMethod: 'manual',
            accountNumber: '2222209434',
            accountRating: '01',
            dateEffective: {
              _: '2021-07-11',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: 'X1X111111111111X111111111',
                startDate: {
                  _: '2021-06-11',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '25',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2021-07-10',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              scheduledMonthlyPayment: '000000030',
              paymentScheduleMonthCount: 'MIN',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2020-01-13',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000001499',
            subscriber: {
              name: {
                unparsed: 'HSBC BANK',
              },
              memberCode: '092WL001',
              industryCode: 'B',
            },
            creditLimit: '000008000',
            updateMethod: 'manual',
            accountNumber: '222220032387',
            accountRating: '01',
            dateEffective: {
              _: '2021-06-18',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'authorizedUser',
            currentBalance: '000001467',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111111',
                startDate: {
                  _: '2021-05-18',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '16',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2021-05-02',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              scheduledMonthlyPayment: '000000049',
              paymentScheduleMonthCount: 'MIN',
            },
            account: {
              type: 'CH',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '1999-01-19',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000002080',
            subscriber: {
              name: {
                unparsed: 'CBUSASEARS',
              },
              memberCode: '06256397',
              industryCode: 'D',
            },
            creditLimit: '000005300',
            updateMethod: 'manual',
            accountNumber: '222222980',
            accountRating: '01',
            dateEffective: {
              _: '2021-05-31',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'individual',
            currentBalance: '000002049',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111111111111111111111111111111111111111',
                startDate: {
                  _: '2021-04-30',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '48',
              },
            },
          },
          {
            pastDue: '000000000',
            dateOpened: {
              _: '2011-04-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000001425',
            subscriber: {
              name: {
                unparsed: 'CTBK/GARDNER',
              },
              memberCode: '01184058',
              industryCode: 'H',
            },
            creditLimit: '000004200',
            datePaidOut: {
              _: '2021-01-27',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            updateMethod: 'manual',
            accountNumber: '2222223',
            accountRating: '01',
            dateEffective: {
              _: '2021-03-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'participant',
            currentBalance: '000000000',
            paymentHistory: '',
            mostRecentPayment: {
              date: {
                _: '2016-05-06',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2020-09-17',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2011-04-12',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000001425',
            subscriber: {
              name: {
                unparsed: 'CCB/GRDWHI',
              },
              memberCode: '01NZ8007',
              industryCode: 'H',
            },
            creditLimit: '000004200',
            updateMethod: 'manual',
            accountNumber: '222227550023',
            accountRating: '01',
            dateEffective: {
              _: '2021-01-11',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'participant',
            currentBalance: '000000000',
            paymentHistory: {
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '48',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2016-06-10',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000306',
              paymentScheduleMonthCount: '060',
            },
            account: {
              type: 'AU',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2020-11-30',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2018-03-16',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000018409',
            subscriber: {
              name: {
                unparsed: 'FRD MOTOR CR',
              },
              memberCode: '03796540',
              industryCode: 'F',
            },
            updateMethod: 'manual',
            accountNumber: '2222273H28',
            accountRating: '01',
            dateEffective: {
              _: '2020-11-30',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: 'X11X11111X1X11X11111X111111111',
                startDate: {
                  _: '2020-10-30',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '32',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2020-10-06',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CBC',
              type: 'affiliate',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2020-04-30',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2020-01-14',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000003915',
            subscriber: {
              name: {
                unparsed: 'CAPITAL ONE',
              },
              memberCode: '01DTV001',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '222227143840',
            accountRating: '01',
            dateEffective: {
              _: '2020-10-15',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '1111111111',
                startDate: {
                  _: '2020-09-15',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '10',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2020-04-03',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000881',
              paymentScheduleMonthCount: '360',
            },
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'CV',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2020-05-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2018-09-24',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000100900',
            subscriber: {
              name: {
                unparsed: 'ABN-AMRO',
              },
              memberCode: '0624P004',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '2222210027233',
            accountRating: '01',
            dateEffective: {
              _: '2020-05-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'mortgage',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '111X111111111111111',
                startDate: {
                  _: '2020-04-01',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '19',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2020-04-13',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2018-06-18',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2017-01-15',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000008000',
            subscriber: {
              name: {
                unparsed: 'FLEET CC',
              },
              memberCode: '0517R022',
              industryCode: 'B',
            },
            creditLimit: '000008000',
            updateMethod: 'manual',
            accountNumber: '222229004200',
            accountRating: '01',
            dateEffective: {
              _: '2020-03-07',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'authorizedUser',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111111111',
                startDate: {
                  _: '2020-02-07',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '18',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2018-06-09',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2018-09-16',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2017-02-28',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            subscriber: {
              name: {
                unparsed: 'CHASE NA',
              },
              memberCode: '0402D017',
              industryCode: 'B',
            },
            creditLimit: '000004500',
            updateMethod: 'manual',
            accountNumber: '222220010119',
            accountRating: '01',
            dateEffective: {
              _: '2019-10-17',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111X1111',
                startDate: {
                  _: '2019-09-17',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '19',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2018-06-08',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CBC',
              type: 'affiliate',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2018-12-02',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2016-01-16',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000005199',
            subscriber: {
              name: {
                unparsed: 'CAPITAL ONE',
              },
              memberCode: '01DTV001',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '222224129347',
            accountRating: '01',
            dateEffective: {
              _: '2019-10-16',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '111111X1XX11111X11XX111111111X11XX1',
                startDate: {
                  _: '2019-09-16',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '46',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2019-01-16',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000786',
              paymentScheduleMonthCount: '360',
            },
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'CV',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2018-09-18',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2013-06-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000079900',
            subscriber: {
              name: {
                unparsed: 'ABN-AMRO',
              },
              memberCode: '0624P004',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '22222763886',
            accountRating: '01',
            dateEffective: {
              _: '2018-09-18',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'mortgage',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: 'X1111111111111111111X1111111111X1111111111',
                startDate: {
                  _: '2018-08-18',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '42',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2018-09-30',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              paymentScheduleMonthCount: '048',
            },
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'AU',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2018-06-19',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2014-06-30',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000005895',
            subscriber: {
              name: {
                unparsed: 'FOA BK',
              },
              memberCode: '062SV017',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '22222971312276369',
            accountRating: '01',
            dateEffective: {
              _: '2018-06-19',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: 'X111111X111111111X1111111X111X1X1XX1111',
                startDate: {
                  _: '2018-05-19',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '39',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2018-06-11',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CBC',
              type: 'affiliate',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2001-09-25',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000001800',
            subscriber: {
              name: {
                unparsed: 'RNB-FIELD1',
              },
              memberCode: '0590S008',
              industryCode: 'D',
            },
            creditLimit: '000001800',
            datePaidOut: {
              _: '2017-02-28',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            updateMethod: 'manual',
            accountNumber: '22222529',
            accountRating: '01',
            dateEffective: {
              _: '2018-03-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'participant',
            currentBalance: '000000000',
            paymentHistory: {
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '12',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2017-02-21',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CBC',
              type: 'affiliate',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2015-01-17',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000000800',
            subscriber: {
              name: {
                unparsed: 'TARGET N.B.',
              },
              memberCode: '06476004',
              industryCode: 'D',
            },
            creditLimit: '000000800',
            datePaidOut: {
              _: '2017-02-28',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            updateMethod: 'manual',
            accountNumber: '22222529',
            accountRating: '01',
            dateEffective: {
              _: '2018-03-09',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'participant',
            currentBalance: '000000000',
            paymentHistory: {
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '12',
              },
            },
            mostRecentPayment: {
              date: {
                _: '2017-02-17',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000163',
              paymentScheduleMonthCount: '048',
            },
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'AU',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2018-03-06',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2016-02-29',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000006361',
            subscriber: {
              name: {
                unparsed: 'FOA BK',
              },
              memberCode: '062SV017',
              industryCode: 'B',
            },
            updateMethod: 'manual',
            accountNumber: '22222972061358607',
            accountRating: '01',
            dateEffective: {
              _: '2018-03-06',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: 'X111X111111111X1111111X11',
                startDate: {
                  _: '2018-02-06',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '25',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2018-03-31',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2017-03-05',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2016-12-15',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            subscriber: {
              name: {
                unparsed: 'FLEET CC',
              },
              memberCode: '0517R022',
              industryCode: 'B',
            },
            creditLimit: '000006000',
            updateMethod: 'manual',
            accountNumber: '222229002207',
            accountRating: '01',
            dateEffective: {
              _: '2018-02-15',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000000',
            paymentHistory: {
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '02',
              },
            },
            closedIndicator: 'normal',
          },
          {
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2017-09-19',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2012-08-14',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000002366',
            subscriber: {
              name: {
                unparsed: 'CHEVY CHASE',
              },
              memberCode: '09202010',
              industryCode: 'B',
            },
            creditLimit: '000012800',
            updateMethod: 'manual',
            accountNumber: '222225200441',
            accountRating: '01',
            dateEffective: {
              _: '2018-01-12',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '111111111111111111111111111111111',
                startDate: {
                  _: '2017-12-12',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '33',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2017-02-19',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            remark: {
              code: 'CBC',
              type: 'affiliate',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2000-07-12',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000000710',
            subscriber: {
              name: {
                unparsed: 'JCP-MCCBG',
              },
              memberCode: '01972010',
              industryCode: 'D',
            },
            updateMethod: 'manual',
            accountNumber: '22222833',
            accountRating: '01',
            dateEffective: {
              _: '2017-02-17',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'jointContractLiability',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '11111111111111111111111',
                startDate: {
                  _: '2017-01-17',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '23',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              paymentScheduleMonthCount: '010',
            },
            account: {
              type: 'CO',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2016-08-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2011-04-11',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000001425',
            subscriber: {
              name: {
                unparsed: 'BNB/GW',
              },
              memberCode: '085TR001',
              industryCode: 'H',
            },
            updateMethod: 'manual',
            accountNumber: '2222275500230818',
            accountRating: '01',
            dateEffective: {
              _: '2016-08-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'participant',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '1111111111111111111',
                startDate: {
                  _: '2016-07-10',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '19',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2016-06-07',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              scheduledMonthlyPayment: '000000204',
              paymentScheduleMonthCount: '042',
            },
            account: {
              type: 'AU',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2011-07-11',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000006658',
            subscriber: {
              name: {
                unparsed: 'HUNTNGTON BK',
              },
              memberCode: '0211Q002',
              industryCode: 'B',
            },
            datePaidOut: {
              _: '2012-08-26',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            updateMethod: 'manual',
            accountNumber: '222229300489',
            accountRating: '01',
            dateEffective: {
              _: '2014-05-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: '',
          },
          {
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2010-10-16',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            subscriber: {
              name: {
                unparsed: 'CITI',
              },
              memberCode: '064DB003',
              industryCode: 'B',
            },
            datePaidOut: {
              _: '2012-05-31',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            updateMethod: 'manual',
            accountNumber: '222220225238',
            accountRating: '01',
            dateEffective: {
              _: '2012-09-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: '',
            mostRecentPayment: {
              date: {
                _: '2012-07-12',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              paymentScheduleMonthCount: '061',
            },
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'AU',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2016-02-29',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2012-08-13',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000015988',
            subscriber: {
              name: {
                unparsed: 'CHRYSLR FIN',
              },
              memberCode: '0624C151',
              industryCode: 'F',
            },
            updateMethod: 'manual',
            accountNumber: '2222257898',
            accountRating: 'UR',
            dateEffective: {
              _: '2016-02-29',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '11111111111',
                startDate: {
                  _: '2016-01-29',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '11',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2016-02-18',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
        ],
        updatedAt: '2022-02-28T18:01:17.911078-06:00',
        userId: '57b623b0-d980-4b28-b6d8-b4f85f83342b',
      };
    } else if (user.firstName.toLocaleUpperCase() == 'STARR') {
      creditReport = {
        addOnProduct: [
          {
            code: '00W18',
            status: 'defaultDelivered',
            scoreModel: {
              score: {
                factors: {
                  factor: [
                    {
                      code: '003',
                      rank: '1',
                    },
                    {
                      code: '010',
                      rank: '2',
                    },
                    {
                      code: '005',
                      rank: '3',
                    },
                    {
                      code: '030',
                      rank: '4',
                    },
                  ],
                },
                results: '750',
                derogatoryAlert: 'false',
                fileInquiriesImpactedScore: 'false',
              },
            },
          },
        ],
        createdAt: '2022-02-28T18:01:17.911078-06:00',
        creditCollection: null,
        employment: [
          {
            source: 'file',
            employer: {
              unparsed: 'WELLS FARGO BANK',
            },
            occupation: 'TELLER',
            dateEffective: {
              _: '2022-01-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOnFileSince: {
              _: '2022-01-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
          },
          {
            source: 'file',
            employer: {
              unparsed: 'ABC',
            },
            dateEffective: {
              _: '2022-01-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOnFileSince: {
              _: '2022-01-01',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
          },
        ],
        firstName: 'STARR',
        houseNumber: [
          {
            source: 'file',
            status: 'current',
            street: {
              name: 'Lawnwood',
              type: 'AVE',
              unit: {
                number: '',
              },
              number: '23',
            },
            location: {
              city: 'LONGMEADOW',
              state: 'UT',
              zipCode: '01106',
            },
            qualifier: 'personal',
            dateReported: {
              _: '2019-09-04',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
          },
        ],
        id: '64642525-39b7-46ed-8c29-9c60c8c1fc81',
        inquiry: [
          {
            date: {
              _: '2022-02-03',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            subscriber: {
              name: {
                unparsed: 'KUBER FINANC',
              },
              memberCode: '09351169',
              industryCode: 'F',
              inquirySubscriberPrefixCode: '06TR',
            },
            ECOADesignator: 'individual',
          },
        ],
        isNoHit: false,
        lastName: 'LEWIS',
        middleName: '',
        publicRecord: null,
        score: '750',
        socialSecurity: '*****9520',
        status: 0,
        trade: [
          {
            account: {
              type: 'CC',
            },
            pastDue: '000000000',
            dateOpened: {
              _: '2010-10-16',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            subscriber: {
              name: {
                unparsed: 'CITI',
              },
              memberCode: '064DB003',
              industryCode: 'B',
            },
            datePaidOut: {
              _: '2012-05-31',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            updateMethod: 'manual',
            accountNumber: '222220225238',
            accountRating: '01',
            dateEffective: {
              _: '2012-09-10',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'revolving',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: '',
            mostRecentPayment: {
              date: {
                _: '2012-07-12',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
          {
            terms: {
              paymentFrequency: 'monthly',
              paymentScheduleMonthCount: '061',
            },
            remark: {
              code: 'CLO',
              type: 'affiliate',
            },
            account: {
              type: 'AU',
            },
            pastDue: '000000000',
            dateClosed: {
              _: '2016-02-29',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            dateOpened: {
              _: '2012-08-13',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            highCredit: '000015988',
            subscriber: {
              name: {
                unparsed: 'CHRYSLR FIN',
              },
              memberCode: '0624C151',
              industryCode: 'F',
            },
            updateMethod: 'manual',
            accountNumber: '2222257898',
            accountRating: 'UR',
            dateEffective: {
              _: '2016-02-29',
              estimatedDay: 'false',
              estimatedYear: 'false',
              estimatedMonth: 'false',
              estimatedCentury: 'false',
            },
            portfolioType: 'installment',
            ECOADesignator: 'individual',
            currentBalance: '000000000',
            paymentHistory: {
              paymentPattern: {
                text: '11111111111',
                startDate: {
                  _: '2016-01-29',
                  estimatedDay: 'false',
                  estimatedYear: 'false',
                  estimatedMonth: 'false',
                  estimatedCentury: 'false',
                },
              },
              historicalCounters: {
                late30DaysTotal: '00',
                late60DaysTotal: '00',
                late90DaysTotal: '00',
                monthsReviewedCount: '11',
              },
            },
            closedIndicator: 'normal',
            mostRecentPayment: {
              date: {
                _: '2016-02-18',
                estimatedDay: 'false',
                estimatedYear: 'false',
                estimatedMonth: 'false',
                estimatedCentury: 'false',
              },
            },
          },
        ],
        updatedAt: '2022-02-28T18:01:17.911078-06:00',
        userId: '57b623b0-d980-4b28-b6d8-b4f85f83342b',
      };
    }
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
      email: email,
    });
    await this.adminService.createAdmin(
      {
        userName: user.firstName + user.lastName,
        email: user.email,
        phoneNumber: '9565697099',
        role: 'Merchant',
        practiceManagement: '01d4f47b-ea93-48e9-a306-50dd9bac14f8',
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
    sendEmail: boolean = true,
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
    if (!pm) {
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
    let html: string = '';
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
      id: screenTrackingId,
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
    return pm;
  }
}

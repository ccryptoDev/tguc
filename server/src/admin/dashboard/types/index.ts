import { PaymentManagement } from '../../../loans/payments/payment-management/payment-management.entity';
import { User } from '../../../user/entities/user.entity';
import { ScreenTracking } from '../../../user/screen-tracking/entities/screen-tracking.entity';
import { PracticeManagement } from '../practice-management/entities/practice-management.entity';

export type PopulatedPaymentManagement = Omit<
  PaymentManagement,
  'user' | 'screenTracking' | 'practiceManagement'
> & {
  user: User;
  screenTracking: ScreenTracking;
  practiceManagement: PracticeManagement;
};

export type PopulatedScreenTracking = Omit<
  ScreenTracking,
  'user' | 'practiceManagement'
> & {
  user: User;
  practiceManagement: PracticeManagement;
};

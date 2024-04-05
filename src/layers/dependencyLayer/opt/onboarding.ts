import { OnboardingStatus } from './API';

/**
 * gets the last completed onboarding step
 * @param onboardingStatus
 */
export const getOnboardingStepCompleted = (
  onboardingStatus: OnboardingStatus
) => {
  switch (onboardingStatus) {
    case OnboardingStatus.BUSINESS:
      return OnboardingStatus.PROFILE;

    case OnboardingStatus.COMPLETED:
      return OnboardingStatus.BUSINESS;

    default:
      return OnboardingStatus.COMPLETED;
  }
};

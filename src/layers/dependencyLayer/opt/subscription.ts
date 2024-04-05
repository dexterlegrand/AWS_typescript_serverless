const SUBSCRIPTION_FEATURES = {
  standard: {
    monthlyAccessQuantity: 4,
    userSeats: 3,
  },
  premium: {
    monthlyAccessQuantity: 8,
    userSeats: 6,
  },
};

const getRemainingProducts = (user, billing, teamBilling, products) => {
  let plan;
  const userType = user.userType || null;

  if (
    (billing && billing.plan === 'premium') ||
    (teamBilling && teamBilling.plan === 'premium')
  ) {
    plan = 'premium';
  } else {
    plan =
      (billing && billing.plan) || (teamBilling && teamBilling.plan) || null;
  }

  if (
    userType &&
    userType === 'Sellers' &&
    plan &&
    products &&
    products.length >= 0
  ) {
    const monthlyAccessQuantity =
      SUBSCRIPTION_FEATURES[plan].monthlyAccessQuantity - products.length;
    return monthlyAccessQuantity < 0 ? 0 : monthlyAccessQuantity;
  }

  return 0;
};

const getRemainingTeamUsers = (user, billing, teamBilling, teamUsers) => {
  let plan;
  const userType = user.userType || null;

  if (
    (billing && billing.plan === 'premium') ||
    (teamBilling && teamBilling.plan === 'premium')
  ) {
    plan = 'premium';
  } else {
    plan =
      (billing && billing.plan) || (teamBilling && teamBilling.plan) || null;
  }

  console.log('getRemainingTeamUsers plan: ', plan);
  console.log('getRemainingTeamUsers userType: ', userType);

  if (
    userType &&
    userType === 'Sellers' &&
    plan &&
    teamUsers &&
    teamUsers.length >= 0
  ) {
    const monthlyAccessQuantity =
      SUBSCRIPTION_FEATURES[plan].userSeats - teamUsers.length;
    return monthlyAccessQuantity < 0 ? 0 : monthlyAccessQuantity;
  }

  return 0;
};

module.exports = {
  SUBSCRIPTION_FEATURES,
  getRemainingProducts,
  getRemainingTeamUsers,
};

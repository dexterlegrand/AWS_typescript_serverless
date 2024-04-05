const {
  ENV,
  REGION,
  TABLE_ENTITY,
  TABLE_OPTION,
  TABLE_PRODUCT,
  ZAI_WEBHOOK_LISTENER_DOMAIN,
} = process.env;
const isProd = ENV === 'prod';
import {
  createZaiAuthToken,
  CreateZaiAuthTokenResponse,
  isAuthTokenExpired,
} from '/opt/zai';
import { createZaiFee, listZaiFees } from '/opt/zai/fee';
import {
  createZaiWebhook,
  createZaiWebhookSecret,
  GetZaiWebhookResponse,
} from '/opt/zai/webhook';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { Handler } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { batchPut, createRecord } from '/opt/dynamoDB';

const secretManager = new SecretsManagerClient({ region: REGION });

const interests = [
  'Electronics',
  'Home and Garden',
  'Fashion and Apparel',
  'Health and Beauty',
  'Sports and Outdoors',
  'Toys and Games',
  'Automotive and Accessories',
  'Books and Media',
  'Food and Beverages',
  'Pet Supplies',
];
const categories = [
  'Wireless Charging',
  'Smart Home',
  'Outdoor Furniture',
  "Women's Clothing",
  'Skincare',
  'Yoga Mats',
  'Car Care',
  'Mystery Novels',
  'Organic Food',
  'Dog Toys',
  'Headphones',
  'Gardening Tools',
  "Men's Shoes",
  'Makeup Brushes',
  'Fitness Equipment',
  'Board Games',
  'Car Accessories',
  'Cooking Utensils',
  'Snack Foods',
  'Cat Supplies',
  'Laptops',
  'Home Decor',
  'Athletic Wear',
  'Haircare',
  'Camping Gear',
];

const mockProducts = [
  {
    title: 'Smart Wireless Headphones',
    category: 'Electronics',
    description:
      'High-quality headphones with active noise cancellation and wireless charging capability.',
    images: [],
    tags: ['Wireless Charging', 'Headphones'],
    country: 'USA',
    status: 'ACTIVE',
    owner: 'owner',
    price: 200.51,
    createdAt: '2023-10-01T09:45:00Z',
    updatedAt: '2023-10-20T14:20:00Z',
    id: randomUUID(),
  },
  {
    title: 'Eco-friendly Yoga Mat',
    category: 'Sports and Outdoors',
    description:
      'Made from sustainable materials, this yoga mat provides excellent grip and cushioning.',
    images: [],
    tags: ['Yoga Mats', 'Athletic Wear'],
    country: 'Canada',
    status: 'REVIEW',
    owner: 'owner',
    price: 120.54,
    createdAt: '2023-09-15T12:30:00Z',
    updatedAt: '2023-10-15T11:10:00Z',
    id: randomUUID(),
  },
  {
    title: 'Mystery Adventure Novel',
    category: 'Books and Media',
    description:
      'A thrilling page-turner that keeps you at the edge of your seat till the very end.',
    images: [],
    tags: ['Mystery Novels'],
    country: 'UK',
    status: 'DRAFT',
    owner: 'owner',
    price: 50.23,
    createdAt: '2023-08-20T10:20:00Z',
    updatedAt: '2023-10-12T10:10:00Z',
    id: randomUUID(),
  },
  {
    title: 'Organic Cat Food',
    category: 'Pet Supplies',
    description:
      'A blend of high-quality organic ingredients to keep your feline friend healthy and satisfied.',
    images: [],
    tags: ['Organic Food', 'Cat Supplies'],
    country: 'Australia',
    status: 'ACTIVE',
    owner: 'owner',
    price: 15.0,
    createdAt: '2023-07-01T11:35:00Z',
    updatedAt: '2023-10-22T13:15:00Z',
    id: randomUUID(),
  },
  {
    title: "Men's Athletic Shoes",
    category: 'Fashion and Apparel',
    description:
      'Comfortable, durable, and stylish athletic shoes perfect for both workouts and casual wear.',
    images: [],
    tags: ["Men's Shoes", 'Athletic Wear'],
    country: 'Germany',
    status: 'ARCHIVED',
    owner: 'owner',
    price: 45.2,
    createdAt: '2023-06-05T14:55:00Z',
    updatedAt: '2023-10-18T12:45:00Z',
    id: randomUUID(),
  },
];

let zaiAuthToken: CreateZaiAuthTokenResponse;
let zaiClientSecret: string;
let zaiWebhookSecret: string;

const initZai = async () => {
  // get secret from aws secrets manager after init from aws-sdk v3
  try {
    const zaiEnv = isProd ? 'prod' : 'dev';
    const response = await secretManager.send(
      new GetSecretValueCommand({ SecretId: `ZaiSecrets-${zaiEnv}` })
    );
    console.log('ZaiSecrets response: ', response);

    // access zaiClientSecret from secret
    if (response.SecretString) {
      const secrets = JSON.parse(response.SecretString);
      zaiClientSecret = secrets.zaiClientSecret;
      zaiWebhookSecret = secrets.zaiWebhookSecret;
    }
  } catch (err: any) {
    console.log('ERROR get secret: ', err);
    throw new Error(err.message);
  }

  if (isAuthTokenExpired(zaiAuthToken)) {
    try {
      zaiAuthToken = await createZaiAuthToken({ zaiClientSecret });
      console.log('zaiAuthToken: ', zaiAuthToken);
    } catch (err: any) {
      console.log('ERROR createZaiAuthToken: ', err);
      throw new Error(err.message);
    }
  }

  return {
    zaiAuthToken,
    zaiClientSecret,
  };
};

export const handler: Handler = async (event) => {
  console.log('EVENT RECEIVED: ', event);

  if (event.trigger === 'OPTIONS') {
    // interests tags
    try {
      const items = interests.map((interest) => ({
        id: randomUUID(),
        group: 'Interests',
        label: interest,
        value: interest,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __typename: 'Option',
      }));
      await batchPut({ tableName: TABLE_OPTION ?? '', items });
    } catch (err: any) {
      console.log('ERROR batch create interests: ', err);
      throw new Error(err.message);
    }

    // categories
    try {
      const items = categories.map((category) => ({
        id: randomUUID(),
        group: 'Categories',
        label: category,
        value: category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __typename: 'Option',
      }));
      await batchPut({ tableName: TABLE_OPTION ?? '', items });
    } catch (err: any) {
      console.log('ERROR batch create categories: ', err);
      throw new Error(err.message);
    }
  }

  //create mock / existing products
  if (event.trigger === 'PRODUCTS') {
    try {
      await batchPut({ tableName: TABLE_PRODUCT ?? '', items: mockProducts });
    } catch (err: any) {
      console.log('ERROR batch create products: ', err);
      throw new Error(err.message);
    }
  }

  if (event.trigger === 'ZAI_FEE') {
    await initZai();

    // list fee to make sure it doesn't exist

    let zaiFees = [];
    try {
      const data = await listZaiFees(zaiAuthToken?.access_token, {
        limit: 200,
        offset: 0,
      });
      zaiFees = data.fees;
      console.log('zaiFees: ', zaiFees);
    } catch (err: any) {
      console.log('ERROR listZaiFees: ', err);
      throw new Error(err.message);
    }

    // create card fee if it doesn't exist
    if (!zaiFees.find((fee) => fee.name === 'CARD_50')) {
      try {
        const response = await createZaiFee(zaiAuthToken?.access_token, {
          name: 'CARD_50',
          fee_type_id: '2',
          amount: 50, // 0.5%
          to: 'cc', //TODO: ensure correct, might need to assign to buyer
        });
        console.log('createZaiFee response: ', response);
      } catch (err: any) {
        console.log('ERROR createZaiFee: ', err);
        throw new Error(err.message);
      }
    }
  }

  if (event.trigger === 'ZAI_WEBHOOKS') {
    await initZai();

    if (!zaiWebhookSecret) {
      throw new Error(
        'Zai Webhook Secret not found, cannot create webhook endpoints'
      );
    }
    // create zai webhook secret
    try {
      const response = await createZaiWebhookSecret(
        zaiAuthToken?.access_token,
        {
          secret_key: zaiWebhookSecret,
        }
      );
      console.log('createZaiWebhookSecret response: ', response);
    } catch (err: any) {
      console.log('ERROR createZaiWebhookSecret: ', err);
      throw new Error(err.message);
    }

    // create zai webhooks
    const requests: Promise<GetZaiWebhookResponse>[] = [];
    const endpoints = [
      'accounts',
      'batch_transactions',
      'items',
      'users',
      'transactions', //to be notified of incoming funds debited from your user’s bank account and reconciled on the digital wallet that’s associated with the user.
      'disbursements',
      'virtual_accounts',
      'pay_ids',
      'payto_agreements', // to be notified about the agreement status changes
      'payto_payments', // to be notified about payment initiation request status changes.
      'transaction_failure_advice', // to be notified if the PayTo payment reconciliation failed on your user's wallet.
    ];

    const zaiEnv = isProd ? 'prod' : 'dev';
    console.log('ZAI_WEBHOOK_LISTENER_DOMAIN: ', ZAI_WEBHOOK_LISTENER_DOMAIN);

    endpoints.forEach((endpoint) => {
      const request = createZaiWebhook(zaiAuthToken?.access_token, {
        url: `https://${ZAI_WEBHOOK_LISTENER_DOMAIN}` ?? '',
        object_type: endpoint,
        description: `${zaiEnv.toUpperCase()}_${endpoint.toUpperCase()}_WEBHOOK`,
      });

      requests.push(request);
    });

    // create zai webhooks
    try {
      const response = await Promise.all(requests);
      console.log('createZaiWebhook response: ', response);
    } catch (err: any) {
      console.log('ERROR createZaiWebhook promise.all: ', err);
      throw new Error(err.message);
    }
  }

  // create bpay companies
  if (event.trigger === 'ZAI_BPAY_COMPANIES') {
    await initZai();
    // https://www.ato.gov.au/individuals-and-families/paying-the-ato/how-to-pay/other-payment-options
    const bpayCompanies = [
      {
        entity: {
          id: randomUUID(),
          type: 'BPAY',
          taxNumber: '51824753556',
          email: 'payment@ato.gov.au',
          name: 'Australian Tax Office (ATO)',
          address: {
            address1: 'Locked Bag 1936',
            country: 'AUS',
            state: 'NSW',
            postalCode: '1936',
          },
          firstName: 'Australian Tax Office',
          lastName: 'Australian Tax Office',
          phone: '1800815886',
          logo: '', // TODO: get logo from s3 bucket
          billerCode: '75556',
          country: 'AUS',
        },
        //email: {
        //  account: 'payment',
        //  domain: 'ato.gov.au',
        //},
        //user: {
        //  first_name: 'Australian Tax Office',
        //  last_name: 'Australian Tax Office',
        //  //email: `payment+s${generate5DigitNumber()}@ato.gov.au`,
        //  //mobile: '1800815886',
        //  country: 'AUS',
        //},
        company: {
          name: 'Australian Tax Office (ATO)',
          legal_name: 'AUSTRALIAN TAXATION OFFICE',
          tax_number: '51824753556',
          address: 'Locked Bag 1936, ALBURY, NSW 1936',
          phone: '1800815886',
          country: 'AUS',
        },
        //bpay: {
        //  biller_code: '75556',
        //  account_name: '',
        //  bpay_crn: '' //
        //}
      },
    ];

    for (let i = 0; i < bpayCompanies.length; i++) {
      const bpayCompany = bpayCompanies[i];
      const userId = randomUUID();
      const createdAt = new Date().toISOString();
      const entity = {
        ...bpayCompany.entity,
        owner: userId,
        createdAt,
        updatedAt: createdAt,
      };

      try {
        await createRecord(TABLE_ENTITY ?? '', entity);
      } catch (err: any) {
        console.log('ERROR create entity: ', err);
      }

      //const user: CreateZaiUserRequest = {
      //  ...bpayCompany.user,
      //  email: `${bpayCompany.email.account}+${userId}@${bpayCompany.email.domain}`,
      //  id: userId,
      //};
      //const company = {
      //  ...bpayCompany.company,
      //  user_id: userId,
      //  createdAt,
      //  updatedAt: createdAt,
      //};

      // create zai user
      //let zaiUser;
      //try {
      //  zaiUser = await createZaiUser(zaiAuthToken?.access_token, user);
      //} catch (err: any) {
      //  console.log('ERROR create zai user: ', err);
      //}

      //console.log('zaiUser:', zaiUser);
      //if (zaiUser) {
      //  let zaiCompany;
      //  try {
      //    zaiCompany = await createZaiCompany(
      //      zaiAuthToken?.access_token,
      //      company
      //    );
      //  } catch (err: any) {
      //    console.log('ERROR create zai company: ', err);
      //  }
      //
      //  if (zaiCompany?.companies?.id) {
      //    const entity = {
      //      ...bpayCompany.entity,
      //      zaiCompanyId: zaiCompany?.companies?.id,
      //      owner: userId,
      //    };
      //
      //    try {
      //      await createRecord(TABLE_ENTITY ?? '', entity);
      //    } catch (err: any) {
      //      console.log('ERROR create entity: ', err);
      //    }
      //  }
      //}

      //const createEntity = createRecord(TABLE_ENTITY ?? '', bpayCompany.entity);
      //const createUser = createZaiUser(zaiAuthToken?.access_token, user);
      //const createCompany = createZaiCompany(zaiAuthToken?.access_token, company);
      //requests.push(createEntity, createUser, createCompany);
    }
  }
};

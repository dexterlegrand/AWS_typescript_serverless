import { initApi } from '/opt/frankieone';

// Type for state change update
type StateChangeUpdate = {
  checkId: string;
  entityId: string;
  function: string;
  functionResult: string;
  notificationType: string;
  requestId: string;
};

// Type for risk level change
type RiskLevelChange = {
  entityId: string;
  function: string;
  functionResult: string;
  notificationType: string;
  requestId: string;
  message: string;
};

interface FrankieOneHandlerEvent {
  webhookEvent: {
    payload: StateChangeUpdate | RiskLevelChange;
  };
}

export const handler = async (event: FrankieOneHandlerEvent) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  const {
    webhookEvent: { payload },
  } = event;

  const frankieOne = initApi();
  console.log('frankieOne: ', frankieOne);
  console.log('payload: ', payload);

  const requestId = payload.requestId;
  let retrieveResult;
  try {
    const data = await frankieOne.retrieve.retrieveResult(requestId);
    console.log('origHTTPstatus: ', data?.data?.origHTTPstatus);
    if (data.data.payload) {
      retrieveResult = JSON.parse(data.data.payload); //TODO: api type was Record<string, any> however turns out to be a string
    }
    console.log('retrieveResult: ', JSON.stringify(retrieveResult));
  } catch (err: any) {
    console.log('ERROR frankieOne.retrieve.retrieveResult: ', err);
    throw new Error(err.message);
  }

  // TODO: https://apidocs.frankiefinancial.com/docs/business-ownership-issues-list
  const issuesList = retrieveResult?.issues_list;
  console.log('issuesList: ', issuesList);

  if (retrieveResult?.uboResponse) {
    console.log('uboResponse: ', retrieveResult.uboResponse);

    // If there was a fatal error in processing, it will appear here
    const errorMessage = retrieveResult.uboResponse.error_message;

    //The company's registered office.
    const registeredOffice = retrieveResult.uboResponse.registered_office;

    const placeOfBusiness = retrieveResult.uboResponse.place_of_business;

    // This section will list all those individuals who have been determined to
    // have a controlling interest in the company of 25% or more.
    const ultimateBeneficialOwners =
      retrieveResult.uboResponse.ultimate_beneficial_owners;

    // If there are any corporate owners of a company with a controlling interest,
    // then these are listed here
    const nonIndividualBeneficialOwners =
      retrieveResult.uboResponse.non_individual_beneficial_owners;

    // Directors and optionally, company secretaries are listed here.
    //They too can be KYC/AML check as well, and the summary provided below.
    const officeholders = retrieveResult.uboResponse.officeholders;

    // If the business has been checked for sanctions or adverse media, then the
    // summary of those details are given here. Full details of the screening
    // are given in the check results and can also be seen in the Frankie portal.
    const businessScreeningResult =
      retrieveResult.uboResponse.business_screening_result;
  }
};

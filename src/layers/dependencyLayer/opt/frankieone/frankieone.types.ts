/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Wrapper object to contain a single set of AML check results. */
export interface AMLResultSet {
  /**
   * Collection of check results for the entity being found in any adverse media
   *
   * An array sorted by type, then reverse chronological order of some/all background checks done on this entity. Older checks may have been previously done by you or another institution, and if so, these will be listed and appropriately anonymised/obfuscated.
   */
  checkResultsListMedia?: BackgroundCheckResultObjectContainer[];
  /**
   * Collection of check results for the entity being a Politically Exposed Person
   *
   * An array sorted by type, then reverse chronological order of some/all background checks done on this entity. Older checks may have been previously done by you or another institution, and if so, these will be listed and appropriately anonymised/obfuscated.
   */
  checkResultsListPEP?: BackgroundCheckResultObjectContainer[];
  /**
   * Collection of check results for the entity being on a sanctions list
   *
   * An array sorted by type, then reverse chronological order of some/all background checks done on this entity. Older checks may have been previously done by you or another institution, and if so, these will be listed and appropriately anonymised/obfuscated.
   */
  checkResultsListSanctions?: BackgroundCheckResultObjectContainer[];
  /**
   * Collection of check results for the entity being on a watchlist
   *
   * An array sorted by type, then reverse chronological order of some/all background checks done on this entity. Older checks may have been previously done by you or another institution, and if so, these will be listed and appropriately anonymised/obfuscated.
   */
  checkResultsListWatchlists?: BackgroundCheckResultObjectContainer[];
  /** Wraps up a BCRO with its internal ID. */
  groupDetails?: BackgroundCheckResultObjectContainer;
}

/** The results of any AML/Adverse media screening undertaken */
export interface AMLScreeningResult {
  /** The overall result */
  check_result?: 'NOT_SCREENED' | 'CLEAR' | 'POSSIBLE_HIT';
  /**
   * The number of adverse media hits.
   * @example 0
   */
  media_hit_count?: number;
}

export interface Abr {
  abn?: string;
  acn?: string;
  addresses?: MainBusinessPhysicalAddress[];
  businessNames?: BusinessName[];
  charityEndorsements?: CharityEndorsement[];
  charityTypes?: CharityType[];
  description?: string;
  dgrEndorsements?: DgrEndorsement[];
  gst?: GoodsAndServicesTax[];
  historicalChanges?: HistoricalChange[];
  /** @format date-time */
  lastUpdated?: string;
  name?: string;
  /** @format date-time */
  registeredDate?: string;
  status?: string;
  statusEffectiveFrom?: string;
  type?: string;
  typeCode?: string;
  /** @format date-time */
  updatedDate?: string;
}

/** The following fields represent the data you need in order to retrieve the results of the requested function. See the details of the notification API for more. */
export interface AcceptedDocumentResultObject {
  /**
   * If you're calling a processing function of some kind, a check number will be issued. This field will only be present if the function you're calling would normally return a checkId (such as scan, verify, and compare).
   * @format uuid
   */
  checkId?: string;
  /**
   * When an ID document is created/uploaded, it is assigned a documentId. You'll see this in a successful response or successfully accepted response. This can then be referenced in subsequent calls if you're uploading more/updated data.
   * @format uuid
   * @example "84a9a860-68ae-4d7d-9a53-54a1116d5051"
   */
  documentId?: string;
  /** Short description of the function called. */
  function?: string;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
}

/** The following fields represent the data you need in order to retrieve the results of the requested function. See the details of the notification API for more. */
export interface AcceptedEntityResultObject {
  /**
   * If you're calling a processing function of some kind, a check number will be issued. This field will only be present if the function you're calling would normally return a checkId (such as scan, verify, and compare).
   * @format uuid
   */
  checkId?: string;
  /**
   * When an entity is created/uploaded, or generated from a document scan, it is assigned an entityId. This can then be referenced in subsequent calls if you're uploading more/updated data.
   * @format uuid
   * @example "84a9a860-68ae-4d7d-9a53-54a1116d5051"
   */
  entityId?: string;
  /** Short description of the function called. */
  function?: string;
  /** Optional link that can be returned - used by the Push To Mobile service to allow API users to manage the use of the onboarding link themselves. */
  linkURL?: string;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
}

/** The following fields represent the data you need in order to retrieve the results of the requested function. */
export interface AcceptedResultObject {
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
}

export interface ActivityDTO {
  Code?: string;
  Description?: string;
}

export interface ActivityDeclarationDTO {
  Declaration?: string;
  DeclarationDescription?: string;
  Language?: string;
}

/**
 * This object holds the address that was checked and the results associated with said checks.
 * You can also leave the checkResult blank/nil if there are no results for that address if you wish.
 * This is useful for returning results on a freshly crerated entity where the API user would want to confirm that the data has indeed been stored, and be able to capture relevant addressIDs - perhaps to address issues as to why it wasn't checked.
 */
export interface AddressCheckResultObject {
  address?: AddressObject;
  /** An array in reverse chronological order of all checks done on this data point for the given entity. Older checks may have been previously done by you or another institution, and if so, these will be listed. */
  checkResult?: GeneralCheckResultArray;
}

export interface AddressDTO {
  AddressInOneLine?: string;
  AddressLine1?: string;
  AddressLine2?: string;
  AddressLine3?: string;
  AddressLine4?: string;
  AddressLine5?: string;
  CityTown?: string;
  Country?: string;
  Email?: string;
  FaxNumber?: string;
  Line?: ArrayOfAddressLineDTO;
  Postcode?: string;
  RegionState?: string;
  TelephoneNumber?: string;
  Type?: string;
  TypeCode?: string;
  WebsiteUrl?: string;
}

export interface AddressLineDTO {
  Line?: string;
  Type?: string;
  TypeCode?: string;
}

export interface AddressObject {
  /**
   * As addresses are added to an entity, they're assigned an id to assist with tracking.
   *
   * If you're adjusting an address, you will need to include the addressId so as to be able to reference it correctly in the list.
   * @format uuid
   */
  addressId?: string;
  /**
   * Used to indicate what sort address this is, such as residential, business, postal, etc.
   *
   * RESIDENTIAL1-4 can be used to indicate the reverse chronological order of addresses.
   * RESIDENTIAL or RESIDENTIAL1 is the current address
   * RESIDENTIAL2 is the previous address, and so on.
   *
   * For Individual postal/mailing addresses, use POSTAL.
   * For Businesses, use OFFICIAL_CORRESPONDANCE
   */
  addressType?: EnumAddressType;
  /**
   * The name of the building, apartment block, condo, etc
   * @example "Tower of Babel"
   */
  buildingName?: string;
  /** Individual or business name at this address if not the same as the name of the entity to which this address belongs. */
  careOf?: string;
  /**
   * The ISO-3166-1 country. You must use the alpha3 country code (e.g. AUS, USA, IDR, KOR, etc) We'll convert as needed.
   *
   * See: https://en.wikipedia.org/wiki/ISO_3166-1
   * @example "TST"
   */
  country: string;
  /**
   * The date this address was no longer used (if available). Used mostly with business addresses.
   * @format date
   */
  endDate?: string;
  /**
   * Set of key-value pairs that provide arbitrary additional type-specific data. This data will typically not be visible in the Frankie Portal.
   * If updating an existing address, then existing values with the same name will be overwritten. New values will be added.
   *
   * See here for more information about possible values you can use:
   *   https://apidocs.frankiefinancial.com/docs/key-value-pairs
   */
  extraData?: KeyValuePairObject[];
  /**
   * In some cases, the address will need to be supplied in "long form", such as when it is determined from a document scan, or is un-parsable in some way.
   * The service will attempt to convert it to it's constituent parts where possible.
   *
   * WARNING: Use of longForm is not guaranteed to produce perfect results, due to the variety of potential formats. You've been warned.
   * Failure to break down or disambiguate the address will result in an error.
   * @example "42a Test Eagle Road, Testville, TST 123-TST, Testalia"
   */
  longForm?: string;
  /**
   * The post code of the address.
   * @example "123-TST"
   */
  postalCode?: string;
  /**
   * The county, province, cantonment
   * @example "Test County"
   */
  region?: string;
  /**
   * The date this address first because active. Used mostly with business addresses.
   * @format date
   */
  startDate?: string;
  /**
   * The state. Use local abbreviations, such as VIC(toria) or TX (Texas)
   * @example "TS"
   */
  state?: string;
  /**
   * The name of the street
   *
   * This field can in fact be a bit flexible, potentially containing the streetNumber and streetType as well. Most services in use can work it out.
   *
   * If this field has been auto-populated by Google (see writeup here:
   *
   * https://apidocs.frankiefinancial.com/docs/working-with-addresses
   * then the bulk of the address will be in this field.
   *
   * If you can avoid it though, please try and keep things separate.
   * @example "Test Eagle West"
   */
  streetName?: string;
  /**
   * The number on the street. Generally a number, but can also be alphanumeric (e.g. 3A)
   * @example "42a"
   */
  streetNumber?: string;
  /**
   * The street "type" - e.g. Road, St, Ave, Circuit, etc
   * @example "Road"
   */
  streetType?: string;
  /**
   * The suburb in the town/city. Only use this if you require a suburb AND a town/city, otherwise, just use the "town" parameter.
   * @example "Testburb"
   */
  suburb?: string;
  /**
   * The town/village/suburb/city
   * @example "Testville"
   */
  town?: string;
  /**
   * Unit/Apartment/Flat/Suite/etc number
   * @example "Suite 1006"
   */
  unitNumber?: string;
  unstructuredLongForm?: string;
}

export interface ArrayOfActivityDTO {
  ActivityDTO?: ActivityDTO[];
}

export interface ArrayOfActivityDeclarationDTO {
  ActivityDeclarationDTO?: ActivityDeclarationDTO[];
}

export interface ArrayOfAddressDTO {
  Addresses?: AddressDTO[];
}

export interface ArrayOfAddressLineDTO {
  AddressLineDTO?: AddressLineDTO[];
}

export interface ArrayOfCapitalDTO {
  CapitalDTO?: CapitalDTO[];
}

export interface ArrayOfCompanyDTO {
  CompanyDTO?: CompanyDTO[];
}

export interface ArrayOfDirector {
  Director?: Director[];
}

export interface ArrayOfDirectorship {
  Directorship?: Directorship[];
}

export interface ArrayOfPSCDetails {
  PSCDetails?: PSCDetails[];
}

export interface ArrayOfShareholderDetails {
  ShareholderDetails?: ShareholderDetails[];
}

export interface ArrayOfString {
  AddressLine?: string[];
}

export interface ArrayOfString1 {
  AddressLine?: string[];
}

export interface ArrayOfUSOfficerDTO {
  USOfficerDTO?: USOfficerDTO[];
}

/** Defines an association of an entity to it's parent */
export interface AssociationObject {
  /** The association if it's ubo, share-holder, officer etc */
  association?: string;
  /**
   * parent entity ID
   * @format uuid
   */
  parentId?: string;
  roleDescriptions?: string[];
  roles?: string[];
}

export interface AtbData {
  accountAbnHistory?: string[];
  othersAbnHistory?: OthersAbnHistory;
}

export interface AverageOverdue {
  color?: string;
  data?: string[];
  name?: string;
}

/** Contains the details of a background check for a given entity. Background checks include Politically Exposed Person (PEP), sanctions lists, watchlists and adverse media. */
export interface BackgroundCheckResultObject {
  /**
   * Different types of checks available.
   * Note: WATCHLIST can also cover PEP and/or SANCTION as well, depending on source provider used. GROUP is an internal 'meta-check' to store the group details for an AMLResultSet.
   */
  backgroundCheckType?: EnumBackgroundCheckType;
  /** Any additional notes that may relate to the state. Free form notes that may contain JSON blobs needing further interpretation. */
  checkDetails?: KeyValuePairObject[];
  /** How often these checks run. */
  checkFrequency?: EnumBackgroundCheckFrequency;
  /** Unique identifier for every check/comparison/verification. Make sure you reference this ID whenever updating check details. This ID will also be used when pushing check results back to you. */
  checkId?: CheckIDObject;
  /**
   * Service provider that performed the check. Basically the name of the connector, without the leading con_
   * @example "greenid"
   */
  checkPerformedBy?: string;
  /**
   * Code that can be used to determine the underlying nature or data source of the checks performed. This may or may not be known by the connector, or may be a provider specific type (e.g. type "O")
   * @example "DVS"
   */
  checkSource?: string;
  /**
   * Confidence in the current results on a scale of 0 (none) to 100 (as certain as possible). Whole integers only.
   * @format int32
   * @min 0
   * @max 100
   * @example 70
   */
  confidenceLevel?: number;
  /**
   * Current state, based on the most recent check.
   * - "CLEAR": The no checks have ever turned up results
   * - "PAST_HITS": Past checks have returned hits, but now they're clear.
   * - "POSSIBLE_HIT": The most recent checks turned up some results that may be relevant
   * - "ACTIVE_HITS": The current checks are returning definitive hits.
   */
  currentState?: EnumBackgroundCheckState;
  /**
   * The date and time the item was first checked.
   * @format date-time
   * @example "2017-11-12T13:14:15Z+10:00"
   */
  firstCheckDate?: string;
  /**
   * The date and time the item was last checked to provide this result.
   * @format date-time
   * @example "2018-11-12T13:14:15Z+10:00"
   */
  latestCheckDate?: string;
}

/** Wraps up a BCRO with its internal ID. */
export interface BackgroundCheckResultObjectContainer {
  /** Contains the details of a background check for a given entity. Background checks include Politically Exposed Person (PEP), sanctions lists, watchlists and adverse media. */
  bcro?: BackgroundCheckResultObject;
  /**
   * Internal ID of this BCRO. Use this if you need to set the status.
   * @format uuid
   */
  id?: string;
}

export interface BasicStatusResultObject {
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId: RequestIDObject;
  /**
   * Simple message describing the final status of the process. Only to be used in success case responses. Otherwise, use the ErrorObject.
   * @example "Thingy has been successfully processed."
   */
  statusMsg: string;
}

export interface BeneficialOwnerObject {
  /**
   * If this owner was created from a request for a manual association, then this is the identity of the
   * party that requested that association. For requests via the Frankie portal this will default to the portal
   * username. Otherwise, if not given in the request, this will be your company name.
   */
  addedBy?: string;
  /**
   * The entityId of the owner.
   * @format uuid
   */
  entityId?: string;
  percentageHeld?: BeneficialOwnerObjectPercentageHeld;
}

export interface BeneficialOwnerObjectPercentageHeld {
  beneficially?: number;
  jointly?: number;
  nonBeneficially?: number;
  rollupPercentage?: number;
  total?: number;
}

export interface BlockingReasonCandidate {
  address?: string;
  code?: string;
  countryIso?: string;
  registeredName?: string;
  registryDescription?: string;
  subdivision?: string;
}

/** The details of the company being checked */
export interface BusinessDetails {
  ABN: string;
  ACN: string;
  ARBN: string;
  anzsic_code: string;
  asic_company_type?: string;
  business_names?: string[];
  /** @format date */
  date_registered_with_asic?: string;
  /**
   * Frankie's unique identifier for the business.
   *
   * Uses a non-versioned UUID format
   * @format uuid
   * @example "84a9a860-68ae-4d7d-9a53-54a1116d5051"
   */
  entity_id?: string;
  giin: string;
  place_of_business?: AddressObject;
  public_company?: boolean;
  registered_name: string;
  registered_office?: AddressObject;
  regulatory_information?: RegulatoryInformation;
  state_registered_with_asic?: string;
  /** If a company is listed, then this object will be populated with whatever data has been determined. */
  stock_exchange_data?: StockExchangeData;
  trading_names?: string[];
}

export interface BusinessName {
  /** @format date-time */
  effectiveFrom?: string;
  /** @format date-time */
  effectiveTo?: string;
  name?: string;
  type?: string;
}

/** The metadata details of the report generated . */
export interface BusinessReportDetailsObject {
  /** If the report provider generated an ID it goes here */
  providerReportId?: string;
  /**
   * The ISO UTC date and time the report was generated
   * @format date-time
   */
  reportDateTime?: string;
  /** Unique Id used to order report. */
  reportId?: string;
  /** The name of the requested report */
  reportName?: string;
  /** The name of the service provider that generated the report. */
  reportProvider?: string;
  /** Whether the report was successfully run or not */
  reportRun?: boolean;
  /**
   * Any details of what is happening with the report of not run.
   *
   * Will be one of:
   *   - OK  (the report was run)
   *   - LATER  (the report will be sent later as a response notification)
   *   - An error message as to why the report did not work
   */
  reportStatus?: string;
  /** Url to fetch report document. */
  reportUrl?: string;
}

/** The results of the requested reports. */
export interface BusinessReportFetchResponse {
  /**
   * Unique Frankie identifier for the report operation.
   * @format uuid
   */
  checkId?: string;
  /**
   * The ID of the entity this report is belongs to.
   * @format uuid
   */
  entityId?: string;
  /** The collection of the fetched PDF report document(s) (currently just a single entry). */
  reports?: IdentityDocumentObject[];
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
}

/** Details of available reports */
export interface BusinessReportListDetail {
  /**
   * available formats
   * @example "PDF"
   */
  availableFormats?: string;
  /**
   * The name of the service provider offering the report.
   * @example "kyckr"
   */
  provider?: string;
  /**
   * product code with which to order the report.
   * @example "ASICON_QVNJQ19Db21wYW55UHJvZmlsZUhpc3RvcmljYWxfRGF0YXN0cmVhbQ==_QVNJQ19DUEhfRFM=_NjAwMDk0OTYwX1ZPREFGT05FIFBUWSBMVEQ="
   */
  reportCode?: string;
  /**
   * The title of the requested report
   * @example "Current and Historical Company Information"
   */
  reportTitle?: string;
}

/** The results of the available reports. */
export interface BusinessReportListResponse {
  /** The collection of the available reports. */
  availableReports?: ReportDetail[];
  /**
   * Unique Frankie identifier for the report operation.
   * @format uuid
   */
  checkId?: string;
  /**
   * The ID of the entity this report is belongs to.
   * @format uuid
   */
  entityId?: string;
  /** Unique identifier provided by the service. */
  providerCheckId?: string;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
}

/** Details of the organisation for which ownership should be queried. This should at least contain the ACN in the externalIds. */
export interface BusinessReportOrder {
  /** Should the report(s) also be generated as a document (pdf). */
  generateReportDocument?: boolean;
  /** Describes all of the data being used to verify an entity. */
  organisation: EntityObject;
  /**
   * Define the report you wish to run. These reports are different to the business details and UBO queries and are meant to provide deeper detail and background on a business or organisation.
   * Valid report types are:
   *   - creditScore
   *   - creditReport
   *   - reportCode
   */
  reportType: string;
}

/** List of reports available for order */
export interface BusinessReportOrderListResponse {
  /**
   * The ID of the entity the list of reports belongs to.
   * @format uuid
   */
  entityId?: string;
  /** The collection of the available reports. */
  reports?: BusinessReportListDetail[];
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
}

/** Details of the report order status */
export interface BusinessReportOrderStatus {
  /**
   * time of last fetch run
   * @example "0001-01-01 00:00:00 +0000 UTC"
   */
  lastFetchRun?: string;
  /**
   * time of next fetch run
   * @example "0001-01-01 00:00:00 +0000 UTC"
   */
  nextFetchRun?: string;
  /**
   * product code with which to order the report
   * @example "ASICON_QVNJQ19Db21wYW55UHJvZmlsZUhpc3RvcmljYWxfRGF0YXN0cmVhbQ==_QVNJQ19DUEhfRFM=_NjAwMDk0OTYwX1ZPREFGT05FIFBUWSBMVEQ="
   */
  reportCode?: string;
  /**
   * curent status of the report order. eg: Request received, Waiting on Provider
   * @example "Waiting on Provider"
   */
  reportStatus?: string;
  /**
   * title of the final report (optional)
   * @example "provider-reportCode"
   */
  reportTitle?: string;
  /**
   * url of the final report (optional)
   * @example "https://api.latest.frankiefinancial.io:433/compliance/v1.2/document/7d365381-bc12-89da-3681-dafc72112dgt/full?scanDocId=7d365381-bc12-89da-3681-dafc7211sfgh"
   */
  reportUrl?: string;
  /**
   * request Id
   * @example "01G12MZZXKCXN8G6EWK1D4RGA8"
   */
  requestId?: string;
  /**
   * date when order was requested
   * @example "0001-01-01 00:00:00 +0000 UTC"
   */
  requestedDate?: string;
}

/** Results of the entity create or update along with the results of the requested reports. */
export interface BusinessReportResponseDetails {
  /**
   * Unique Frankie identifier for the report operation.
   * @format uuid
   */
  checkId?: string;
  /** Describes all of the data being used to verify an entity. */
  entity?: EntityObject;
  /** Unique identifier provided by the service. */
  providerCheckId?: string;
  /** The collection of requested business reports. */
  reports?: BusinessReportResponseObject[];
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
}

/**
 * Container to hold the details of a report response
 *
 * The actual report object will depend on the requested report.
 */
export interface BusinessReportResponseObject {
  /** @format uuid */
  checkId?: string;
  /** The metadata details of the report generated . */
  details?: BusinessReportDetailsObject;
  /**
   * The requested report object.
   *
   * This will be one of:
   *   - ReportCreditScore
   *   - ReportCreditReport
   *   - ReportPaymentPredictor
   */
  report?: object;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
}

/** The positive result of a report generation request if any. */
export interface BusinessReportResultObject {
  /** @format uuid */
  documentId?: string;
  /** @format uri */
  location?: string;
  /** @format uuid */
  scanDocId?: string;
}

/** The positive result of a business ownership subcription request. */
export interface BusinessSubscriptionResponseObject {
  /** Is the ownership subscription currently active */
  currentlySubscribed: boolean;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
}

export interface CapitalDTO {
  Ammount?: string;
  Currency?: string;
  Type?: string;
  TypeCode?: string;
}

export interface CapitalReserves {
  capitalreserves?: string;
  networth?: string;
  paidupequity?: string;
  profitlossreserve?: string;
  reserves?: string;
  revalutationreserve?: string;
  shareholderfunds?: string;
  sundryreserves?: string;
}

export type CaseEntityProfileResultObject = EntityProfileResultObject;

export type CaseProcessResultObject = ProcessResultObject;

/** Details of a case. */
export interface CaseRecord {
  /**
   * Comma-separated list of alerts associated with this monitoring alert.
   *
   * List of possible alerts supported:
   *
   * * PEP
   * * SANCTION
   * * WATCHLIST
   * * MEDIA
   * * DEATH
   * * CRIME
   * * BLACKLIST
   * * IDTHEFT
   */
  alertList?: string;
  /** Portal user responsible for this case. */
  assignee?: string;
  /** Stores the generic results of a process (check, scan, compare, verify, etc) */
  checkRisk?: ProcessResultObject;
  /** Stores the generic results of a process (check, scan, compare, verify, etc) */
  checkSummary?: ProcessResultObject;
  /**
   * Confidence in the result on a scale of 0 (no match) to 100 (strong/identical match). Whole integers only.
   * @format int32
   * @min 0
   * @max 100
   */
  confidenceLevel?: number;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  createdRequestId?: RequestIDObject;
  /**
   * The date and time the entity was created.
   * @format date-time
   */
  createdTimestamp?: string;
  customerReference?: string;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  deletedRequestId?: RequestIDObject;
  /**
   * The date and time the entity was deleted.
   * @format date-time
   */
  deletedTimestamp?: string;
  /** Additional information flags with regards to this entity and for ongoing processing. This *is* the flag data from the entity. */
  entityFlags?: EFOArray;
  /**
   * Unique entity identifier.
   * @format uuid
   * @example "84a9a860-68ae-4d7d-9a53-54a1116d5051"
   */
  entityId?: string;
  /** Name of the entity. */
  entityName?: string;
  entityProfile?: string;
  /**
   * Contains the results of a check against an entity profile.
   *
   * The entityProfileResult will be returned instead of a checkSummary to provide the full details of the verification process.
   */
  entityProfileResult?: EntityProfileResultObject;
  /**
   * Indicates the type of an entity.
   * - "INDIVIDUAL": An individual.
   * - "TRUST": A trust.
   * - "ORGANISATION": An organisation.
   */
  entityType?: EnumEntityType;
  /** Set of key-value pairs that provide additional data. This is *not* the extra data from the entity. */
  extraData?: KVPOArray;
  /**
   * Array of issues associated with this monitoring alert. Same contents as the case record alert list but as an array rather thand a string. The alert list will become deprecated at some point.
   *
   * List of possible issues supported:
   *
   * * 404
   * * 500
   * * ATT-IDV
   * * ATT-NCMP
   * * ATT-PHT
   * * BANK ACCOUNT
   * * BL
   * * DUP
   * * FRAUD
   * * IWL
   * * M
   * * PEP
   * * PTL
   * * RISK
   * * S
   * * VISA
   * * WL
   */
  issueList?: IssueListImpl;
  orgTypeCode?: string;
  orgTypeDescription?: string;
  profilePolicy?: string;
  /**
   * Only supplied in a summary result. Used to indicate the ovall risk score for the entity at this point in time.
   * @min 0
   * @max 100
   */
  riskLevel?: number;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  transactionParentRequestId?: RequestIDObject;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  transactionRequestId?: RequestIDObject;
  /** transaction disposition based on risk, confidence and final check status */
  transactionStatus?: EnumTransactionStatusKYC;
  /**
   * The date and time of the latest transaction.
   * @format date-time
   */
  transactionTimestamp?: string;
  /** Portal user responsible for this check. */
  transactionUsername?: string;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  updatedRequestId?: RequestIDObject;
  /**
   * The date and time the entity was updated.
   * @format date-time
   */
  updatedTimestamp?: string;
}

/** Contains the list of result IDs within an AML case that we need to update, and the new state we need to update to. */
export interface CaseResultsUpdateObject {
  /**
   * Indicates the status of a check result as set by a user.
   * - "UNKNOWN": The user has not decided so the actual check result applies as normal.
   * - "TRUE_POSITIVE": The check result has been acknowledged as correct but the final effect (accept/reject) has not been decided.
   * - "TRUE_POSITIVE_ACCEPT": The check result is correct but will be ignored. This is also known as 'whitelisting'
   * - "TRUE_POSITIVE_REJECT": The check result is correct and will be used.
   * - "FALSE_POSITIVE": The check result is not applicable and will be ignored.
   * - "STALE": The check result will become invisible, will not be considered
   *   and will not count towards due diligence requirements.
   */
  newStatus?: EnumCheckResultManualStatus;
  /**
   * A list of resultIDs that map into a given AML case.
   *
   * A resultID generally represents a person who turned up in the AML case result set.
   */
  resultIDList?: string[];
}

export interface CharityEndorsement {
  /** @format date-time */
  effectiveFrom?: string;
  /** @format date-time */
  effectiveTo?: string;
  type?: string;
}

export interface CharityType {
  description?: string;
  /** @format date-time */
  effectiveFrom?: string;
  /** @format date-time */
  effectiveTo?: string;
}

/**
 * Describes all of the checks that were carried out against an entity as part of our cascading check process. Because there are a number of steps involved in checking an entity, (including the use of past checks done by you or others), there is an overall summary check result that will tell you the final disposition of the the check you requested.
 *
 * So if you requested a 2+2+governmentID+pep/sanctions/etc (i.e. everything) then there would have been several checks done in order to meet this requirement. Some may have even failed, but eventually we got there. The summary gives the final assessment, based on all available data.
 *
 * Detailed writeups on how this all works can be found here:
 *   https://apidocs.frankiefinancial.com/docs/understanding-check-results
 */
export interface CheckEntityCheckResultObject {
  /**
   * Collection of check results for the entity having been previously blacklisted.
   *
   * An array of matched blacklisted entities sorted by match confidence level (highest first).
   */
  blacklistCheckResults?: ProcessResultObject[];
  /** Contains a list of all checkSummary records (one for each check) */
  checkResultsListSummaries?: ProcessResultObject[];
  /** Stores the generic results of a process (check, scan, compare, verify, etc) */
  checkRisk?: ProcessResultObject;
  /** Stores the generic results of a process (check, scan, compare, verify, etc) */
  checkSummary?: ProcessResultObject;
  /**
   * Collection of check results for the entity having previously been checked.
   *
   * An array of matched checked entities sorted by match confidence level (highest first).
   */
  duplicateCheckResults?: ProcessResultObject[];
  /** Describes all of the data being used to verify an entity. */
  entity?: EntityObject;
  /**
   * Contains the results of a check against an entity profile.
   *
   * The entityProfileResult will be returned instead of a checkSummary to provide the full details of the verification process.
   */
  entityProfileResult?: EntityProfileResultObject;
  /** This will hold all of the check results that were performed against the */
  entityResult?: CheckEntityCheckResultObjectEntityResult;
  /**
   * Collection of fraud check results for the entity.
   *
   * Contains fraud list and/or background result arrays. Other fraud check types will appear over time
   */
  fraudCheckResults?: FraudCheckResultObject;
  /**
   * Collection of check results for the manual KYC.
   *
   * An array of one entry with the manual check result.
   */
  manualCheckResults?: ProcessResultObject[];
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
  /**
   * Collection of check results for the entity having been previously blacklisted in shared blocklist.
   *
   * An array of matched blacklisted entities sorted by match confidence level (highest first).
   */
  sharedBlocklistCheckResults?: ProcessResultObject[];
}

/** This will hold all of the check results that were performed against the */
export interface CheckEntityCheckResultObjectEntityResult {
  /** Collection of address objects. */
  addressesCheck?: AddressCheckResultObject[];
  /**
   * !!!!! DEPRECATED !!!!!
   * Please use the multi-result AMLResultSets structure instead.
   *
   * Note: This single check result structure will be retired in v2.0
   * !!!!! DEPRECATED !!!!!
   *
   * Collection of check results for the entity being found in any adverse media
   *
   * An array sorted by type, then reverse chronological order of some/all background checks done on this entity. Older checks may have been previously done by you or another institution, and if so, these will be listed and appropriately anonymised/obfuscated.
   */
  adverseMediaCheck?: BackgroundCheckResultObject[];
  /** An array of Collections of PEP/Sanctions/WL/Media objects, as AML providers can return multiple results */
  amlResultSets?: AMLResultSet[];
  dateOfBirthCheck?: DOBCheckResultObject;
  /**
   * Unique ID for the entity.
   * @format uuid
   * @example "84a9a860-68ae-4d7d-9a53-54a1116d5051"
   */
  entityId?: string;
  genderCheck?: GenderCheckResultObject;
  /** Collection of identity documents (photos, scans, selfies, etc), and their check results */
  identityDocsCheck?: IdentityDocumentCheckResultObject[];
  nameCheck?: PersonalNameCheckResultObject;
  /**
   * !!!!! DEPRECATED !!!!!
   * Please use the multi-result AMLResultSets structure instead.
   *
   * Note: This single check result structure will be retired in v2.0
   * !!!!! DEPRECATED !!!!!
   *
   * Collection of check results for the entity being a Politically Exposed Person
   *
   * An array sorted by type, then reverse chronological order of some/all background checks done on this entity. Older checks may have been previously done by you or another institution, and if so, these will be listed and appropriately anonymised/obfuscated.
   */
  pepCheck?: BackgroundCheckResultObject[];
  /**
   * !!!!! DEPRECATED !!!!!
   * Please use the multi-result AMLResultSets structure instead.
   *
   * Note: This single check result structure will be retired in v2.0
   * !!!!! DEPRECATED !!!!!
   *
   * Collection of check results for the entity being on a sanctions list
   *
   * An array sorted by type, then reverse chronological order of some/all background checks done on this entity. Older checks may have been previously done by you or another institution, and if so, these will be listed and appropriately anonymised/obfuscated.
   */
  sanctionsCheck?: BackgroundCheckResultObject[];
  /**
   * !!!!! DEPRECATED !!!!!
   * Please use the multi-result AMLResultSets structure instead.
   *
   * Note: This single check result structure will be retired in v2.0
   * !!!!! DEPRECATED !!!!!
   *
   * Collection of check results for the entity being on a watchlist
   *
   * An array sorted by type, then reverse chronological order of some/all background checks done on this entity. Older checks may have been previously done by you or another institution, and if so, these will be listed and appropriately anonymised/obfuscated.
   */
  watchlistCheck?: BackgroundCheckResultObject[];
}

/**
 * Unique identifier for every check/comparison/verification. Make sure you reference this ID whenever updating check details. This ID will also be used when pushing check results back to you.
 * @format uuid
 * @example "54a1116d-68ae-4d7d-9a53-505184a9a860"
 */
export type CheckIDObject = string;

/** Details of the status changes to be made to a check result. */
export interface CheckResultUpdateObject {
  checkClassIds?: string[];
  comment: string;
  /**
   * Indicates the status of a check result as set by a user.
   * - "UNKNOWN": The user has not decided so the actual check result applies as normal.
   * - "TRUE_POSITIVE": The check result has been acknowledged as correct but the final effect (accept/reject) has not been decided.
   * - "TRUE_POSITIVE_ACCEPT": The check result is correct but will be ignored. This is also known as 'whitelisting'
   * - "TRUE_POSITIVE_REJECT": The check result is correct and will be used.
   * - "FALSE_POSITIVE": The check result is not applicable and will be ignored.
   * - "STALE": The check result will become invisible, will not be considered
   *   and will not count towards due diligence requirements.
   */
  status?: EnumCheckResultManualStatus;
}

/** A common pairing of a short code and a long description. */
export interface CodeDescription {
  code?: string;
  description?: string;
}

export interface CompanyDTO {
  Addresses?: ArrayOfAddressDTO;
  Aliases?: ArrayOfString;
  AliasesList?: ListOfString;
  Code?: string;
  CompanyID?: string;
  CompanyNameInEnglish?: string;
  Date?: string;
  Function?: string;
  LegalForm?: string;
  LegalStatus?: string;
  MoreKey?: string;
  Name?: string;
  Official?: boolean;
  RegistrationAuthority?: string;
  RegistrationAuthorityCode?: string;
  Source?: string;
  VirtualID?: string;
}

export interface CompanyProfileDTO {
  Activity?: ArrayOfActivityDTO;
  ActivityDeclaration?: ArrayOfActivityDeclarationDTO;
  Addresses?: ArrayOfAddressDTO;
  AgentAddress?: string;
  AgentName?: string;
  Aliases?: ArrayOfString;
  AliasesList?: ListOfString;
  AppointmentDateOfOfficial?: string;
  Capital?: ArrayOfCapitalDTO;
  Code?: string;
  CompanyNameInEnglish?: string;
  Date?: string;
  Email?: string;
  FaxNumber?: string;
  FiscalCode?: string;
  FoundationDate?: string;
  Functions?: ArrayOfString;
  FunctionsList?: ListOfString;
  Headquarters?: string;
  KeyFigures?: ArrayOfString;
  KeyFiguresList?: ListOfString;
  LastAnnualAccountDate?: string;
  LegalForm?: string;
  LegalFormDeclaration?: string;
  LegalFormDetails?: LegalFormDTO;
  LegalStatus?: string;
  MailingAddress?: string;
  Name?: string;
  NormalisedLegalStatus?: string;
  Official?: boolean;
  RegistrationAuthority?: string;
  RegistrationAuthorityCode?: string;
  RegistrationDate?: string;
  RegistrationNumber?: string;
  SigningDeclaration?: string;
  SigningDeclarationDescription?: string;
  SigningLanguage?: string;
  Source?: string;
  StateOfIncorporation?: string;
  TelephoneNumber?: string;
  VatNumber?: string;
  VirtualId?: string;
  WebsiteURL?: string;
  directorAndShareDetails?: DirectorAndShareDetails;
  officers?: ArrayOfUSOfficerDTO;
}

/**
 * This is the document that we want to compare to the original toDocument.
 *
 * In the case of a selfie-check against a drivers licence:
 *
 *   * compareDocument will be the the selfie
 *   * toDocument will be the drivers licence photo
 */
export interface ComparisonSet {
  compareDocument?: IdentityDocumentObject;
  toDocument?: IdentityDocumentObject;
}

/** Officer court details as returned from an ASIC report. */
export interface CourtDetailsObject {
  applicationNumber?: string;
  /**
   * @min 1000
   * @max 2999
   */
  applicationYear?: number;
  country?: string;
  state?: string;
  /** A common pairing of a short code and a long description. */
  type?: CodeDescription;
}

export interface CourtJudgement {
  /**
   * Court Action
   * The name of the court judgement that was handed down
   */
  action?: string;
  /**
   * Action Date
   * The date of the court ruling
   * @format date-time
   */
  actionDate?: string;
  /**
   * Created Date
   * The date the court judgement was received and published
   * @format date-time
   */
  createdDate?: string;
  /**
   * Judgement Amount
   * The amount the defendant was ordered by the court to pay to the
   * plaintiff
   * @format float
   */
  judgementAmount?: number;
  /**
   * Location
   * The location of the court judgment
   */
  location?: string;
  /**
   * Nature of Claim
   * Nature of the claim
   */
  natureOfClaim?: string;
  /**
   * Nature of Claim Description
   * Additional information regarding the nature of the claim
   */
  natureOfClaimDesc?: string;
  /**
   * The Plaintiff Name
   * The person or company that is taking the defendant to court
   */
  plaintiff?: string;
  /**
   * Court Proceeding Number
   * Court judgement referencing identifier
   */
  proceedingNumber?: string;
  /**
   * State
   * The state jurisdiction of the court judgement
   */
  state?: string;
}

export interface CreditScoreHistory {
  /** @format date-time */
  date?: string;
  score?: number;
}

export interface CreditScoreObject {
  /**
   * Credit Score History
   * Shows the credit score for every month over the last year for this business
   */
  creditScoreHistory?: CreditScoreHistory[];
  /**
   * The Credit Score is a statistically based score indicating an entity's credit worthiness.
   * The score ultimately ranks entities based on their riskiness and is designed to assist you in making more informed and consistent credit decisions.  The score is based between 0 and 850 index points with a higher score considered lower risk while lower scores are deemed to be riskier entities. It should be used in partnership with your internal credit procedures and policies.
   * Please note that the score and recommendation should be used in partnership with your company's internal credit procedures and policies. The score should not be used as the sole reason in making a decision about the entity.
   *
   * 0 = Critical (ACN deregistered or ABN cancelled)
   *
   * 1 - 125 = Entity has a critical status and significant adverse information present. Trading eligibility must be considered.)
   *
   * 126 - 250 = Very High (Entity has a critical status and significant adverse information present. Trading eligibility must be considered)
   *
   * 251 - 450 = High (Entity has a below average creditworthiness score and some adverse information may be present. Trade with caution, monitor closely and consider your payment terms)
   */
  currentCreditScore?: number;
}

export interface DOBCheckResultObject {
  /** An array in reverse chronological order of all checks done on this data point for the given entity. Older checks may have been previously done by you or another institution, and if so, these will be listed. */
  checkResult?: GeneralCheckResultArray;
  dob?: DOBObject;
}

export interface DOBObject {
  /**
   * ISO-3166-1 code for the country of birth. You must use the alpha3 country code (e.g. AUS, USA, IDR, KOR, etc) We'll convert as needed.
   *
   * See https://en.wikipedia.org/wiki/ISO_3166-1
   * @example "AUS"
   */
  country?: string;
  /**
   * Date of Birth in YYYY-MM-DD format
   * @format date
   * @example "1978-11-12"
   */
  dateOfBirth?: string;
  /**
   * Place of birth other than country If locality is given, then country must also be provided.
   * @example "Brisbane"
   */
  locality?: string;
  unstructuredDateOfBirth?: string;
  /**
   * Year of birth or "unknown". This will be autoextracted if dateOfBirth is supplied.
   * @example "1978"
   */
  yearOfBirth?: string;
}

/**
 * Contains any/all details we want to pass on to the device checking service as part of an activity / transaction. A transaction isn't just a payment, but can represent a number of different interaction types. See below for more.
 *
 * NOTE: If you're sending this data, then your recipe or requested checkTypes *MUST* include a "device" checkType. Otherwise this data will be ignored and dropped.
 */
export interface DeviceCheckDetailsObject {
  /**
   * The type of activity we're checking. Choices are:
   *
   * - SIGNUP: Used when an entity is signing up to your service
   * - LOGIN: Used when an already registered entity is logging in to your service
   * - PAYMENT: Used when you wish to check that all is well for a payment
   * - CONFIRMATION: User has confirmed an action and you wish to double check they're still legitimate
   *
   * You can also supply vendor specific activityTypes if you know them. To do this, make the first character an underscore _.
   * So for example, to use BioCatch's LOGIN_3 type, you can send "_LOGIN_3" as a value. Note, if you do this, there is no error checking on the Frankie side, and thus if you supply an incorrect value, the call will fail.
   */
  activityType?: string;
  /**
   * Collection of additional data points you wish to add to the activity check. These are defined in conjunction with the Customer and the device checking service being used.
   *
   * Standard values are supplied upon request:
   *
   * | kvpKey | kvpType | kvpValue |
   * | ------- | -------- | -------- |
   * | detectedIp | general.string | The IP address you detect the transaction coming from |
   * | accountId.src | id.external | Your account identifier. Can be a SHA hash or similar |
   * | accountId.dst | id.external | Target/payee account identifier. Can be a SHA hash or similar |
   * | entityId | id.external | Use this to override the Frankie entityID that would be used to identify |
   * | amount | general.float | Amount involved in the transaction  |
   * | platform  | general.string | One of APP, WEB, MOBILE_WEB. Assumes APP if not supplied |
   * |   |   |
   *
   *
   * Like the activityType, you can also specify vendor specific additional data parameters by adding a leading underscore "_" to the kvpKey. You can set the kvpType to one of the available types, or just use general.string (recommended)
   */
  additionalData?: KeyValuePairObject[];
  /** the unique session based ID that will be checked against the service. */
  checkSessionKey?: string;
}

export interface DeviceObject {
  /** Set of key-value pairs that provide device type-specific data. If updating an existing device, then existing values with the same name will be overwritten. New values will be added. */
  extraData?: KeyValuePairObject[];
  /**
   * Service specific fingerprint for the device, prefixed with the name of the service and a colon (':')
   * @example "sardine:84a9a860-68ae-4d7d-9a53-54a1116d5051"
   */
  fingerprint?: string;
}

export interface DgrEndorsement {
  /** @format date-time */
  endorsedFrom?: string;
  /** @format date-time */
  endorsedTo?: string;
}

export interface Director {
  address1?: string;
  address2?: string;
  address3?: string;
  address4?: string;
  address5?: string;
  address6?: string;
  birthdate?: string;
  directorNumber?: string;
  directorships?: ArrayOfDirectorship;
  name?: string;
  nationality?: string;
  postcode?: string;
  title?: string;
}

export interface DirectorAndShareDetails {
  PersonsOfSignificantControl?: ArrayOfPSCDetails;
  capitalReserves?: CapitalReserves;
  directors?: ArrayOfDirector;
  shareHolderSummary?: ShareholderSummary;
  shareHolders?: ArrayOfShareholderDetails;
}

export interface Directorship {
  appointedDate?: string;
  companyName?: string;
  companyNumber?: string;
  companyStatus?: string;
  function?: string;
}

export interface DirectorshipsObject {
  companyName?: string;
  companyNumber?: string;
  companyStatus?: string;
  function?: string;
  nationality?: string;
  unstructuredAppointedDate?: string;
}

/** Contains the results of a given document upload. */
export interface DocumentChecksResultObject {
  /**
   * This object holds the identityDocument that was checked and the results associated with said checks.
   * You can also leave the checkResult blank/nil if there are no results for that identityDocument if you wish.
   * This is useful for returning results on a freshly crerated entity where the API user would want to confirm that the data has indeed been stored, and be able to capture relevant documentIds - perhaps to address issues as to why it wasn't checked.
   */
  checkResults?: IdentityDocumentCheckResultObject;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId: RequestIDObject;
}

/** Contains the results of a given document upload. */
export interface DocumentCompareResultObject {
  /** Contains the details of a comparison between two documents */
  documentComparisonResults: DocumentComparisonResultObject;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId: RequestIDObject;
}

/** Contains the details of a comparison between two documents */
export interface DocumentComparisonResultObject {
  /**
   * This is a direct copy from the compareDocument object passed in the request. You MUST supply this.
   * @format uuid
   * @example "84a9a860-68ae-4d7d-9a53-54a1116d5051"
   */
  compareDocumentId?: string;
  /** Stores the generic results of a process (check, scan, compare, verify, etc) */
  processResult?: ProcessResultObject;
  /**
   * This is a direct copy from the toDocument object passed in the request. You MUST supply this.
   * @format uuid
   * @example "84a9a860-68ae-4d7d-9a53-54a1116d5051"
   */
  toDocumentId?: string;
}

/** Contains the results of a given document upload. */
export interface DocumentResultObject {
  document: IdentityDocumentObject;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId: RequestIDObject;
}

/**
 * The result of a scan will contain 4 parts
 *
 * * The requestid - that's always there, and is the same that was passed in in the header.
 *
 * * The results of the process and the meta data around it, including confidence levels, service used and the like
 *
 * * extractedDocument - this will be an updated version of the document object passed in for scanning with results of the scan inserted. You can subsequently update this data as needed (say after confirmation with the end-consumer) through the various update functions.
 *
 *   * Any additional data extracted from the service that does not fit into the standard identity document fields will be placed into the extraData KVPs.
 *
 * * extractedEntity - the service will attempt to create the basics of an entity's name, address, DoB, gender from the data returned from the scan.
 *   You can then use this entity data to create a new entity for a wider check if needed.
 *
 *   * Note if you plan on doing this, make sure you include the extractedDocument reference in the "new" entity.
 *
 * * EXTRA SPECIAL NOTE: If no useful data was returned in the scan, extractedDocument will be left unchanged, and extractedEntity will be left out
 */
export interface DocumentScanResultObject {
  extractedDocument?: IdentityDocumentObject;
  /** Describes all of the data being used to verify an entity. */
  extractedEntity?: EntityObject;
  /** Stores the generic results of a process (check, scan, compare, verify, etc) */
  processResult: ProcessResultObject;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId: RequestIDObject;
}

/** Contains the individual search results for a document. */
export interface DocumentSearchResultListItem {
  /** Provides details of the confidence level we have that this is the item we're looking for. */
  confidence?: SearchResultConfidenceObject;
  document?: IdentityDocumentObject;
}

/** Contains the results of a given document search. */
export interface DocumentSearchResultObject {
  /**
   * The list of (potentially) matching documents with confidence levels.
   *
   * If you are the "owner" of the document - i.e. the same CustomerID and CustomerChildID (if relevant) - then the full details of the document will be returned, except for the contents of any attached scans.
   * If you are not the owner of the document, then just the ID and confidence level is returned. You can still use this ID to retrieve any check results (see GET /document/{documentId}/checks)
   */
  documentSearchResults?: DocumentSearchResultListItem[];
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId: RequestIDObject;
}

/** Contains the details of a check on a given data point */
export interface DocumentVerificationResultObject {
  /**
   * This is a direct copy from the document object passed in for verifcation.
   * @format uuid
   * @example "84a9a860-68ae-4d7d-9a53-54a1116d5051"
   */
  documentId?: string;
  /** Stores the generic results of a process (check, scan, compare, verify, etc) */
  processResult?: ProcessResultObject;
}

/**
 * This is the document we wish to verify in some way, along with an entity object that contains some/all of the details we wish to verify.
 *
 * For example, if we're attempting to verify a drivers licence, we generally need to pass in a name, address, DoB, etc as well. the entity gives the structure to be able to do this.
 *
 * Note, only the document in the "document" parameter is to be processed. any additional documents found in the entity (there shouldn't be, but given the way this has been defined, there can be) will be ignored. Only the Name, Address, DoB and Gender fields will be potentially used during the verification process.
 *
 * The EntityObject can take one of two forms.
 *
 *   - It can be a single entityId - in which case the details will be pulled from the database. If using an existing document, then the entity must also own the document or the request will fail.
 *   - You can supply a "single use" entity with fields, etc. In this case the entity details will be used to verify the document, then will be discarded.
 *
 * If you wish to save the entity, use the /entity comments instead to create the entity and attach the document there.
 */
export interface DocumentVerify {
  document?: IdentityDocumentObject;
  /** Describes all of the data being used to verify an entity. */
  entityData?: EntityObject;
}

/** Contains the results of a given document upload. */
export interface DocumentVerifyResultObject {
  /** Contains the details of a check on a given data point */
  documentVerificationResults?: DocumentVerificationResultObject;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId: RequestIDObject;
}

/** Details of the report to be ordered */
export interface DummyA0110 {
  /**
   * The name of the service provider from which to order the report.
   * @example "kyckr"
   */
  provider?: string;
  /**
   * product code with which to order the report. This should come from the reportCode returned in the BusinessReportCatalogue endpoint
   * @example "ASICON_QVNJQ19Db21wYW55UHJvZmlsZUhpc3RvcmljYWxfRGF0YXN0cmVhbQ==_QVNJQ19DUEhfRFM=_NjAwMDk0OTYwX1ZPREFGT05FIFBUWSBMVEQ="
   */
  reportCode?: string;
  /**
   * report format (optional). eg: html, pdf
   * @example "PDF"
   */
  reportFormat?: string;
}

/** Additional information flags with regards to this entity and for ongoing processing. This *is* the flag data from the entity. */
export type EFOArray = EntityFlagObject[];

/**
 * Contains all the details we'll check regarding an Entity. It is assumed that this will grow over time.
 *
 * Current supported check parameters:
 *
 *   - entity: The Entity we're checking. This must be supplied.
 */
export interface EntityCheckDetailsObject {
  /**
   * Contains any/all details we want to pass on to the device checking service as part of an activity / transaction. A transaction isn't just a payment, but can represent a number of different interaction types. See below for more.
   *
   * NOTE: If you're sending this data, then your recipe or requested checkTypes *MUST* include a "device" checkType. Otherwise this data will be ignored and dropped.
   */
  deviceCheckDetails?: DeviceCheckDetailsObject;
  /** Describes all of the data being used to verify an entity. */
  entity: EntityObject;
}

/**
 * Similar to a KVP, the flag has a key (the flag you're indicating) and an integer value.
 *
 * Values are tied to the specific flag (see table below). Generally they're true (1)/false(0) indicators.
 *
 *     | flag | values | Description |
 *     | ------- | -------- | -------- |
 *     | ongoing_pep | 0, 1, 2 | 0 = no, 1 = pep/sanctions, 2 = 1+media |
 *     |  |  |  |
 */
export interface EntityFlagObject {
  /** Name of the flag */
  flag?: string;
  /** flag value. */
  value: number;
}

/** Contains all the details we need to create/update an entity and generate an IDV token */
export interface EntityIDVDetailsObject {
  /**
   * The applicantId previously supplied when creating a token for the first time for an entity.
   * Only required if re-submitting for a fresh token on a previously created applicant.
   */
  applicantId?: string;
  /**
   * If this is for a native application SDK, then we need the applicationId as reported by the SDK. This will then be tied to the token so it cannot be used in another application or handset.
   *
   * You must send either an applicationID or a referrer (see below)
   */
  applicationId?: string;
  /** Describes all of the data being used to verify an entity. */
  entity: EntityObject;
  /**
   * If this is for a web SDK, then you need to supply the referrer domain so that the token can be validated by the IDV service
   *
   * You must send either a referrer or an applicationID (see above)
   */
  referrer?: string;
}

/** Contains the results of a given document entity create/update and IDV token details. */
export interface EntityIDVResultObject {
  /**
   * The applicantId is either the same one that was supplied in the request for a fresh token, or a new one.
   * This ID must be supplied along with the token to your SDK so that it knows who any uploaded documents are for.
   *
   * The latest applicant will also be written to the extraData of the entity as well for safe keeping. Older applicantIds will be overwritten.
   */
  applicantId: string;
  /** Describes all of the data being used to verify an entity. */
  entity: EntityObject;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId: RequestIDObject;
  /** If the requesting customer can support requesting 2 documents. */
  supportTwoDocs?: boolean;
  /**
   * Token to be used in the SDK to authenticate the applicant and application/referrer.
   *
   * Tokens are time limited (1 hour) and can only be used with the applicantId supplied.
   */
  token: string;
}

/** Describes all of the data being used to verify an entity. */
export interface EntityObject {
  /** Collection of address objects. */
  addresses?: AddressObject[];
  dateOfBirth?: DOBObject;
  /**
   * When an entity is first created, it is assigned an ID. When updating an entity, make sure you set the entityId
   * One exception to this is when an entity is created from a document object. It is expected that this object would be passed into a /check or /entity call to set it.
   * @format uuid
   * @example "84a9a860-68ae-4d7d-9a53-54a1116d5051"
   */
  entityId?: string;
  /**
   * If the entity is using the new profiles feature, then their profile name will be found here.
   *
   * Note: If setting a profile, you must ensure that the profile matches a known configuration.
   *
   * See here for valid values:
   *   https://apidocs.frankiefinancial.com/docs/test-entity-verification
   */
  entityProfile?: string;
  /**
   * Indicates the type of an entity.
   * - "INDIVIDUAL": An individual.
   * - "TRUST": A trust.
   * - "ORGANISATION": An organisation.
   */
  entityType?: EnumEntityType;
  /**
   * Set of key-value pairs that provide arbitrary additional type-specific data. You can use these fields to store external IDs, or other non-identity related items if you need to.
   * If updating an existing entity, then existing values with the same name will be overwritten. New values will be added.
   *
   * See here for more information about possible values you can use:
   *   https://apidocs.frankiefinancial.com/docs/key-value-pairs
   */
  extraData?: KeyValuePairObject[];
  /**
   * Used to set additional information flags with regards to this entity and for ongoing processing.
   *
   * Flags might include having the entity (not) participate in regular pep/sanctions screening
   * Others will follow over time.
   */
  flags?: EntityFlagObject[];
  /**
   * Used to indicate of the entity in question is:
   * - "M"ale
   * - "F"emale
   * - "U"nspecified
   * - "O"ther (for want of a better option)
   */
  gender?: EnumGender;
  /** Collection of identity documents (photos, scans, selfies, etc) */
  identityDocs?: IdentityDocumentObject[];
  name?: PersonalNameObject;
  /** Organisation details for entities. Returned from an ASIC report. */
  organisationData?: OrganisationDataObject;
}

/** Summary of all KYC matches for a given set of criteria */
export interface EntityProfileAltKYCMatchResultObject {
  /** A full description for these results */
  description?: string;
  /** Summary of this alternative KYC match counts. */
  kycResults?: EntityProfileKYCMatchResultObject[];
  /** A short human readable name for these results */
  name?: string;
  /**
   * For multiple matching criteria sets, the priority order in which this result set was defined.
   * 1 = highest priority criteria set
   * 2 = second highest priority
   * ...
   * n = lowest priority
   */
  order?: number;
  /**
   * The current state of this alternative KYC check. One of:
   * - PASS: Enough matches to pass.
   * - FAIL: Not enough matches, zero or more, but less than required.
   * - UNCHECKED: No results.
   */
  result?: string;
}

export interface EntityProfileCheckResultMessage {
  /**
   * The class of checks to which this check type belongs.
   * One of:
   * - kyc
   * - aml
   * - fraud
   * - none
   * @example "kyc"
   */
  checkClass?: string;
  /**
   * A single check type that this result message applies to.
   * @example "one_plus"
   */
  checkType?: string;
  /** Alphanumeric code that is unique for each failure message to simplify result processing and display. Values to be decided. */
  code?: string;
  /**
   * Short description of why not passed
   * @example "Partial match"
   */
  message?: string;
  /**
   * A short human readable name for the check type.
   * @example "1+1"
   */
  name?: string;
  /**
   * The current state of the check. One of:
   * - PASS
   * - FAIL
   * - UNCHECKED: Not attempted or service not available. For example AML not attempted if KYC fails.
   * - NA: Not required. For example Visa check when there is no visa document and your account configuration indicates the check can be skipped.
   */
  result?: string;
}

/** Match summary for a single checked address or document */
export interface EntityProfileItemMatchResultObject {
  /**
   * True if an attempt was made to verify
   * @example true
   */
  checked?: boolean;
  /**
   * The number of distinct sources that matched this address or document
   * @example 5
   */
  matchCount?: number;
  /** List of sources that matched. The matchCount will be the number of entries in this list. */
  matchSources?: string[];
  /**
   * The match type that this count and result refer to. For document matches this will be "gov_id" or "other_id". For addresses ir will be "curr_addr" or "prev_addr" depending on the status of the address at the time of the check.
   * @example "gov_id"
   */
  matchType?: string;
  /** List of sources that did not match, only if available from service provider. */
  nonmatchSources?: string[];
  /**
   * True if there is at least one match
   * @example true
   */
  verified?: boolean;
}

/** Summary of all KYC matches for a given set of criteria */
export interface EntityProfileKYCMatchResultObject {
  /**
   * Number of matches for this set of match types. In other words the sum of the matchCounts in the matchTypes map. Note that for match sets that include government ID (gov_id) this will not neccessaily be the count of matched sources.
   * @example 2
   */
  matchCount?: number;
  /**
   * Number of distinct matches (sources and/or matched government ID documents) required for this set of match types.
   * @example 1
   */
  matchCountRequired?: number;
  /**
   * The match types that this overall count and result refer to. Currently one or more of:
   * - name
   * - address
   * - dob
   * - gender
   * - gov_id
   * - other_id
   *
   * These will be keys in a map whose values hold the values for the individual match types. The resultant structure would look like the following. Here dob has zero matches and is not verfied but it was check, so other than the checked flag the value object is simply empty. A completely empty object would imply that match type was not checked.
   *
   *     "matchTypes": {
   *       "address": {
   *         "matchCount": 1,
   *         "matchSources": [ "au-elec-roll" ],
   *         "checked": true,
   *         "verified": true
   *       },
   *       "dob": {
   *         "checked": true
   *       }
   *     }
   *
   * So for a one_plus KYC check there will be two EntityProfileKYCMatchResultObject records. One for 'name' and one for 'address, dob' (like the sample above).
   */
  matchTypes?: Record<string, EntityProfileKYCMatchResultObjectMatchTypes>;
  /**
   * True if there are enough matches to meet the requirement
   * @example false
   */
  verified?: boolean;
}

export interface EntityProfileKYCMatchResultObjectMatchTypes {
  /**
   * True if an attempt was made to verify
   * @example true
   */
  checked?: boolean;
  /**
   * Number of distinct matches for this match type. Note that for government ID (gov_id) this is the count of matched documents, not sources.
   * @example 1
   */
  matchCount?: number;
  /** List of sources that matched. Note that the matchCount is not always a count of the matchSources. Particularly for gov_id, the count is the number of distinct documents matched, not the number of sources. */
  matchSources?: string[];
  /** List of sources that did not match, only if available from service provider. */
  nonmatchSources?: string[];
  /**
   * True if there is at least one match
   * @example true
   */
  verified?: boolean;
}

/**
 * Contains the results of a check against an entity profile.
 *
 * The entityProfileResult will be returned instead of a checkSummary to provide the full details of the verification process.
 */
export interface EntityProfileResultObject {
  /**
   * The recommended onboarding action for this entity after the profile check this result refers to. The action can also be an entity state set by you.
   * - UNCHECKED: New entity with no checks applied
   * - PASS
   * - FAIL
   * - PASS_MANUAL: Manual intervention was applied to achieve a pass
   * - FAIL_MANUAL: Manual intervention was applied but the entity still fails
   * - REFER: Manual intervention required
   * - WAIT: Externally applied state, waiting for more entity details
   * - ARCHIVED: Externally applied state, entity hidden from on onboarding list
   * - INACTIVE: Externally applied state, entity hidden from on onboarding list, indexes and further changes will be blocked.
   */
  actionRecommended?: string;
  /**
   * KYC match counts for each checked address, whether matched or not. The keys in this map are the address IDs. The match type in the value will be either "curr_addr" or "prev_addr". The resultant structure would look like:
   *
   *     "addressResults": {
   *       "addressId": {
   *         "matchType": "curr_addr",
   *         "matchCount": 5,
   *         "verified": true
   *       },
   *       "addressId": {
   *         "matchType": "prev_addr",
   *         "matchCount": 5,
   *         "verified": true
   *       }
   *     }
   */
  addressResults?: Record<string, EntityProfileItemMatchResultObject>;
  /**
   * Collections of KYC match counts.
   *
   * If your recipe / entity profile contains KYC checks with multiple matching criteria, then the results of each criteria
   * set will be here.
   *
   * The first item will be the best result (out of PASS, FAIL or UNCHECKED), if there is a tie then the first item will be
   * the one with the highest priority (lowest order number, see EntityProfileAltKYCMatchResultObject). The first item will
   * also be in the EntityProfileResultObject kycResults, but but without the extra attributes from
   * EntityProfileAltKYCMatchResultObject (name, description, order, result).
   *
   * The items after the first will be the remaining alternatives in priority order (i.e. lowest order value to highest).
   *
   * Note: This will only be populated if you have multiple matching criteria in your recipe/profile.
   */
  alternativeKycResults?: EntityProfileAltKYCMatchResultObject[];
  /** Unique identifier for every check/comparison/verification. Make sure you reference this ID whenever updating check details. This ID will also be used when pushing check results back to you. */
  checkId?: CheckIDObject;
  /**
   * The basic result for each check type required for the profile.
   *
   * The results are listed in the order they are run so you can also see how far progressed through a check process you are.
   */
  checkResults?: EntityProfileCheckResultMessage[];
  /**
   * Comma separated list of checks required for the entity profile.
   * @example "two_plus,id,pep_media"
   */
  checkType?: string;
  /** List of vendors from failed credit header sources. */
  creditHeaderFailures?: string[];
  /**
   * KYC match counts for each checked document, whether matched or not. The keys in this map are the document IDs. The match type in the value will be either "gov_id" or "other_id". The resultant structure would look like:
   *
   * documentResults: {
   *     "documentId" : {
   *       "matchType": "gov_id",
   *       "matchCount": 5,
   *       "verified": true
   *     },
   *     "documentId": {
   *       "matchType": "other_id",
   *       "matchCount": 5,
   *       "verified": true
   *     }
   * }
   */
  documentResults?: Record<string, EntityProfileItemMatchResultObject>;
  /**
   * Unique ID for the entity.
   * @format uuid
   * @example "84a9a860-68ae-4d7d-9a53-54a1116d5051"
   */
  entityId?: string;
  issueList?: string[];
  /**
   * Summary of primary KYC match counts.
   *
   * If you have a recipe that includes multiple potential matching criteria, then this will be the first set of criteria that matched.
   * If the KYC matches failed overall, then this will be the first matching criteria set in the list.
   *
   * All potential matching criteria sets (including this one) will be included in the alternativeKycResults array
   */
  kycResults?: EntityProfileKYCMatchResultObject[];
  /**
   * The date and time of the last check that contributed to this result.
   * @format date-time
   * @example "2018-11-12T13:14:15Z+10:00"
   */
  latestCheckDate?: string;
  /** Indicates if any manual actions have been involved in the check result. */
  manualIntervention?: boolean;
  /**
   * The name of the policy within the profile used for this check. This may or may not incorporate the 'riskPolicy' that is also an attribute in this object.
   * @example "SDD U18"
   */
  policyName?: string;
  /**
   * The name of the profile used for this check.
   * @example "Credit"
   */
  profileName?: string;
  /** Workflow hint by arrangement with Frankie */
  resolverRecommended?: string;
  /**
   * Risk level. One of:
   * - LOW,
   * - MEDIUM,
   * - HIGH,
   * - UACCEPTABLE
   * - or UNKNOWN
   * @example "LOW"
   */
  riskLevel?: string;
  /**
   * Risk policy. Contents depend on account configuration but would typically be one of:
   * - SDD,
   * - CDD,
   * - EDD
   * - or FAIL
   * @example "SDD"
   */
  riskPolicy?: string;
}

/** The following fields represent the fields needed in order to retrieve the downloadable link and its expiry date. */
export interface EntityReportResultObject {
  /**
   * The document id where the report is saved in the entity.
   * @format uuid
   */
  documentId?: string;
  /**
   * The entityId that this report was generated from.
   * @format uuid
   * @example "84a9a860-68ae-4d7d-9a53-54a1116d5051"
   */
  entityId?: string;
  /**
   * Timestamp when the link expires.
   * @format date-time
   */
  linkExpiry?: string;
  /** Downloadable link to the report. */
  linkURL?: string;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
  /**
   * The doc scan id where the report is saved in the document.
   * @format uuid
   */
  scanDocId?: string;
}

/** Contains the results of a given document entity create/update or GET request. */
export interface EntityResultObject {
  /** Describes all of the data being used to verify an entity. */
  entity: EntityObject;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId: RequestIDObject;
}

/** Contains the individual search results for an entity. */
export interface EntitySearchResultListItem {
  /** Provides details of the confidence level we have that this is the item we're looking for. */
  confidence?: SearchResultConfidenceObject;
  /**
   * Customer Child ID that this result belongs to.
   * @format uuid
   */
  customerChildID?: string;
  /**
   * Customer ID that this result belongs to.
   * @format uuid
   */
  customerID?: string;
  /** Array of descriptons of document field matches used to score this search. This is a summary for all the documents for the matched entity. */
  documentMatchTypes?: string[];
  /** If this entity has any level of name match then this is an array of document IDs for the entity where the document has an entity name and it doesn't match any entity names being sought. */
  documentNameMismatches?: string[];
  /** Describes all of the data being used to verify an entity. */
  entity?: EntityObject;
  /** Array of descriptons of entity field matches used to score this search. */
  entityMatchTypes?: string[];
}

/** Contains the results of a given entity search. */
export interface EntitySearchResultObject {
  /**
   * The list of (potentially) matching entities with confidence levels.
   *
   * If you are the "owner" of the entity - i.e. the same CustomerID and CustomerChildID (if relevant) - then by default the full details of the entity and any owned documents will be returned, except for the contents of any attached scans.
   *
   * If you are not the owner of the entity (or linked documents), then just the ID and confidence level is returned. You can still use this ID to retrieve any check results (see GET  /entity/{entityId}/checks and GET /document/{documentId}/checks)
   *
   * If the onlyEntityIds query parameter was set in the search request, then only the IDs and confidence levels will be return in either case.
   */
  entitySearchResults?: EntitySearchResultListItem[];
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId: RequestIDObject;
  /**
   * The number of entity matches, which may be more than are included in these results if the resultLimit query parameter was used or a hard limit on results was reached..
   * @example 1234
   */
  totalEntitiesMatched?: number;
}

/**
 * Used to indicate what sort address this is, such as residential, business, postal, etc.
 *
 * RESIDENTIAL1-4 can be used to indicate the reverse chronological order of addresses.
 * RESIDENTIAL or RESIDENTIAL1 is the current address
 * RESIDENTIAL2 is the previous address, and so on.
 *
 * For Individual postal/mailing addresses, use POSTAL.
 * For Businesses, use OFFICIAL_CORRESPONDANCE
 * @example "RESIDENTIAL1"
 */
export enum EnumAddressType {
  OTHER = 'OTHER',
  RESIDENTIAL = 'RESIDENTIAL',
  RESIDENTIAL1 = 'RESIDENTIAL1',
  RESIDENTIAL2 = 'RESIDENTIAL2',
  RESIDENTIAL3 = 'RESIDENTIAL3',
  RESIDENTIAL4 = 'RESIDENTIAL4',
  BUSINESS = 'BUSINESS',
  POSTAL = 'POSTAL',
  REGISTERED_OFFICE = 'REGISTERED_OFFICE',
  PLACE_OF_BUSINESS = 'PLACE_OF_BUSINESS',
  OFFICIAL_CORRESPONDANCE = 'OFFICIAL_CORRESPONDANCE',
  PLACE_OF_BIRTH = 'PLACE_OF_BIRTH',
}

/**
 * How often these checks run.
 * @example "DAILY"
 */
export enum EnumBackgroundCheckFrequency {
  ADHOC = 'ADHOC',
  YEARLY = 'YEARLY',
  QUARTERLY = 'QUARTERLY',
  MONTHY = 'MONTHY',
  WEEKLY = 'WEEKLY',
  DAILY = 'DAILY',
}

/**
 * Current state, based on the most recent check.
 * - "CLEAR": The no checks have ever turned up results
 * - "PAST_HITS": Past checks have returned hits, but now they're clear.
 * - "POSSIBLE_HIT": The most recent checks turned up some results that may be relevant
 * - "ACTIVE_HITS": The current checks are returning definitive hits.
 * @example "CLEAR"
 */
export enum EnumBackgroundCheckState {
  CLEAR = 'CLEAR',
  PAST_HITS = 'PAST_HITS',
  POSSIBLE_HIT = 'POSSIBLE_HIT',
  ACTIVE_HITS = 'ACTIVE_HITS',
}

/**
 * Different types of checks available.
 * Note: WATCHLIST can also cover PEP and/or SANCTION as well, depending on source provider used. GROUP is an internal 'meta-check' to store the group details for an AMLResultSet.
 * @example "PEP"
 */
export enum EnumBackgroundCheckType {
  PEP = 'PEP',
  SANCTION = 'SANCTION',
  WATCHLIST = 'WATCHLIST',
  MEDIA = 'MEDIA',
  GROUP = 'GROUP',
}

/** Indicates the type of the blocking entity. */
export enum EnumBlockingType {
  ORGANISATION_NOT_FOUND = 'ORGANISATION_NOT_FOUND',
  NO_SHAREHOLDERS_FOUND = 'NO_SHAREHOLDERS_FOUND',
  COUNTRY_NOT_SUPPORTED = 'COUNTRY_NOT_SUPPORTED',
  NON_BENEFICIAL_INDIVIDUAL = 'NON_BENEFICIAL_INDIVIDUAL',
  NON_BENEFICIAL_ORGANISATION = 'NON_BENEFICIAL_ORGANISATION',
  NON_BENEFICIAL_UNKNOWN = 'NON_BENEFICIAL_UNKNOWN',
  CIRCULAR_REFERENCE = 'CIRCULAR_REFERENCE',
  ENTITY_TYPE_UNKOWN = 'ENTITY_TYPE_UNKOWN',
  OTHER = 'OTHER',
}

/**
 * Indicates the status of a check result as set by a user.
 * - "UNKNOWN": The user has not decided so the actual check result applies as normal.
 * - "TRUE_POSITIVE": The check result has been acknowledged as correct but the final effect (accept/reject) has not been decided.
 * - "TRUE_POSITIVE_ACCEPT": The check result is correct but will be ignored. This is also known as 'whitelisting'
 * - "TRUE_POSITIVE_REJECT": The check result is correct and will be used.
 * - "FALSE_POSITIVE": The check result is not applicable and will be ignored.
 * - "STALE": The check result will become invisible, will not be considered
 *   and will not count towards due diligence requirements.
 */
export enum EnumCheckResultManualStatus {
  UNKNOWN = 'UNKNOWN',
  TRUE_POSITIVE = 'TRUE_POSITIVE',
  TRUE_POSITIVE_ACCEPT = 'TRUE_POSITIVE_ACCEPT',
  TRUE_POSITIVE_REJECT = 'TRUE_POSITIVE_REJECT',
  FALSE_POSITIVE = 'FALSE_POSITIVE',
  STALE = 'STALE',
}

/**
 * Check state for an individual data point
 * - "UNCHECKED": Check has not yet been performed
 * - "NOT_SUPPORTED": the requested check type is not supported by this connector.
 * - "CHECKING": Checks are underway.
 * - "UNPROCESSABLE": The data supplied was unprocessable.
 * - "NO_MATCH": All checks complete, no records found that matched the details supplied
 * - "CHECKED_PARTIAL_SUCCESS": All checks complete, but only some succeeded.
 * - "CHECKED_SUCCESS_WITH_NOTES": All checks complete, but there are some notes (e.g. PEP or sanctions).
 * - "CHECKED_SUCCESS_CLEAR": All checks complete, no additional notes
 * - "CHECKED_FAILED": All checks complete, but all failed.
 * @example "CHECKED_PARTIAL_SUCCESS"
 */
export enum EnumCheckResultState {
  UNCHECKED = 'UNCHECKED',
  CHECKING = 'CHECKING',
  UNPROCESSABLE = 'UNPROCESSABLE',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  NO_MATCH = 'NO_MATCH',
  CHECKED_PARTIAL_SUCCESS = 'CHECKED_PARTIAL_SUCCESS',
  CHECKED_SUCCESS_WITH_NOTES = 'CHECKED_SUCCESS_WITH_NOTES',
  CHECKED_SUCCESS_CLEAR = 'CHECKED_SUCCESS_CLEAR',
  CHECKED_FAILED = 'CHECKED_FAILED',
}

/**
 * Current status of a document.
 * - "INITIALISING": the state whilst you're uploading and updating
 * - "SCAN_IN_PROGRESS": the state whilst it's being scanned.
 * - "DOC_SCANNED": the document has been scanned and data extracted as best as possible. It's still possible to update the details and add more scans if you wish.
 * - "DOC_CHECKED": the document has been used as part of a check that has been finalised in some way. You can no longer update this document and any attempt will generate an error.
 * @example "DOC_SCANNED"
 */
export enum EnumDocumentStatus {
  INITIALISING = 'INITIALISING',
  SCAN_IN_PROGRESS = 'SCAN_IN_PROGRESS',
  DOC_SCANNED = 'DOC_SCANNED',
  DOC_CHECKED = 'DOC_CHECKED',
}

/**
 * Indicates the type of an entity.
 * - "INDIVIDUAL": An individual.
 * - "TRUST": A trust.
 * - "ORGANISATION": An organisation.
 */
export enum EnumEntityType {
  INDIVIDUAL = 'INDIVIDUAL',
  TRUST = 'TRUST',
  ORGANISATION = 'ORGANISATION',
}

/**
 * High level indication of the final disposition of a backgrounded function
 * - "COMPLETED": the request completed (not that the final result is a success, just that we completed)
 * - "FAILED": the request failed.
 * - "INCOMPLETE": could not complete the request.
 * @example "COMPLETED"
 */
export enum EnumFunctionStatus {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  INCOMPLETE = 'INCOMPLETE',
}

/**
 * Used to indicate of the entity in question is:
 * - "M"ale
 * - "F"emale
 * - "U"nspecified
 * - "O"ther (for want of a better option)
 * @example "F"
 */
export enum EnumGender {
  U = 'U',
  F = 'F',
  M = 'M',
  O = 'O',
}

/**
 * Valid ID types
 *   - "OTHER": Generic document type. Unspecified.
 *   - "DRIVERS_LICENCE": Driver's licence.
 *   - "PASSPORT": Passport
 *   - "VISA": Visa document (not Visa payment card)
 *   - "IMMIGRATION": Immigration card
 *   - "NATIONAL_ID": Any national ID card
 *   - "TAX_ID": Any national tax identifier
 *   - "NATIONAL_HEALTH_ID": Any national health program ID card (e.g. Medicare, NHS)
 *   - "CONCESSION": State issued concession card
 *   - "HEALTH_CONCESSION": State issued health specific concession card
 *   - "SENIORS_HEALTH_CONCESSION": State issued health specific concession card for seniors
 *   - "PENSION": State issued pension ID
 *   - "MILITARY_ID": Military ID
 *   - "BIRTH_CERT": Birth certificate
 *   - "CITIZENSHIP": Citizenship certificate
 *   - "MARRIAGE_CERT": Marriage certificate
 *   - "DEATH_CERT": Death certificate
 *   - "NAME_CHANGE": Name chage confirmation
 *   - "UTILITY_BILL": Regulated utility bill, such as electricity, gas, etc
 *   - "BANK_STATEMENT": Bank/card statement
 *   - "BANK_ACCOUNT": Bank account
 *   - "INTENT_PROOF": A proof of intent. Generally a photo/video, or a scanned letter
 *   - "ATTESTATION": A document of attestation (e.g. Statutory Declaration). NOTE: these cannot be used as a supporting document
 *   - "SELF_IMAGE": A "selfie" used for comparisions
 *   - "EMAIL_ADDRESS": An email address
 *   - "MSISDN": A mobile phone number
 *   - "DEVICE": A device ID
 *   - "VEHICLE_REGISTRATION": Vehicle registration number
 *   - "PROOF_OF_ADDRESS": Can be any type of document that provides a proof of address
 *   - "HOUSE_REGISTRATION": House registration document
 *   - "YELLOW_HOUSE_REGISTRATION": Yellow House Registration Thor Ror 13
 *   - "WORK_PERMIT": Work permit
 *   - "EMPLOYMENT_CERTIFICATE": Certificate of employment
 *   - "NOTARY_PUBLIC_ID": Notary Public Identification
 *   - "AVIATION_SECURITY_ID": Aviation Security Identification
 *   - "MARITIME_SECURITY_ID": Maritime Security Identification
 * Business related documentation
 *   - "EXTERNAL_ADMIN": Details of appointed administrator.
 *   - "CHARGES": Details of any charges that have been laid against a company or director
 *   - "PRE_ASIC": Any documents that are Pre-ASIC
 *   - "ANNUAL_RETURN": Details of a company's annual return
 *   - "REPORT": Frankie generated report.
 *   - "TRUST_DEED": Corporate trust deed
 *   - "PARTNERSHIP_AGREEMENT": Partnership agreement documents
 *   - "ADMIN_CHANGE": Change of Administrator
 *   - "COMPANY_REPORT": ASIC filed company reports
 * Special document types
 *   - "CHECK_RESULTS": A special document type for specifying results of checks completed other than through Frankie.
 * @example "DRIVERS_LICENCE"
 */
export enum EnumIdType {
  OTHER = 'OTHER',
  DRIVERS_LICENCE = 'DRIVERS_LICENCE',
  PASSPORT = 'PASSPORT',
  VISA = 'VISA',
  IMMIGRATION = 'IMMIGRATION',
  NATIONAL_ID = 'NATIONAL_ID',
  TAX_ID = 'TAX_ID',
  NATIONAL_HEALTH_ID = 'NATIONAL_HEALTH_ID',
  CONCESSION = 'CONCESSION',
  HEALTH_CONCESSION = 'HEALTH_CONCESSION',
  SENIORS_HEALTH_CONCESSION = 'SENIORS_HEALTH_CONCESSION',
  PENSION = 'PENSION',
  MILITARY_ID = 'MILITARY_ID',
  BIRTH_CERT = 'BIRTH_CERT',
  CITIZENSHIP = 'CITIZENSHIP',
  MARRIAGE_CERT = 'MARRIAGE_CERT',
  DEATH_CERT = 'DEATH_CERT',
  NAME_CHANGE = 'NAME_CHANGE',
  MOBILE_PHONE = 'MOBILE_PHONE',
  UTILITY_BILL = 'UTILITY_BILL',
  BANK_STATEMENT = 'BANK_STATEMENT',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  INTENT_PROOF = 'INTENT_PROOF',
  ATTESTATION = 'ATTESTATION',
  SELF_IMAGE = 'SELF_IMAGE',
  EMAIL_ADDRESS = 'EMAIL_ADDRESS',
  MSISDN = 'MSISDN',
  DEVICE = 'DEVICE',
  VEHICLE_REGISTRATION = 'VEHICLE_REGISTRATION',
  PROOF_OF_ADDRESS = 'PROOF_OF_ADDRESS',
  HOUSE_REGISTRATION = 'HOUSE_REGISTRATION',
  YELLOW_HOUSE_REGISTRATION = 'YELLOW_HOUSE_REGISTRATION',
  WORK_PERMIT = 'WORK_PERMIT',
  EMPLOYMENT_CERTIFICATE = 'EMPLOYMENT_CERTIFICATE',
  NOTARY_PUBLIC_ID = 'NOTARY_PUBLIC_ID',
  AVIATION_SECURITY_ID = 'AVIATION_SECURITY_ID',
  MARITIME_SECURITY_ID = 'MARITIME_SECURITY_ID',
  EXTERNAL_ADMIN = 'EXTERNAL_ADMIN',
  CHARGES = 'CHARGES',
  PRE_ASIC = 'PRE_ASIC',
  ANNUAL_RETURN = 'ANNUAL_RETURN',
  REPORT = 'REPORT',
  TRUST_DEED = 'TRUST_DEED',
  PARTNERSHIP_AGREEMENT = 'PARTNERSHIP_AGREEMENT',
  ADMIN_CHANGE = 'ADMIN_CHANGE',
  COMPANY_REPORT = 'COMPANY_REPORT',
  CHECK_RESULTS = 'CHECK_RESULTS',
}

/**
 * Used to describe the contents of the KVP data.
 *
 * The general.* and raw.* types are pretty much what they say on the tin.
 *
 * All raw.* fields will be base64 encoded so as to not interfere with JSON structuring. These are useful for returning/storing large quantities of data that doesn't necessarily require processing now, or may be useful to a calling client.
 *
 * The id.* and pii.* are used to indicate that this is data that can be used to create new document objects, or entities. They should also be treated with the utmost care and attention when it comes to securing them too.
 *
 * id.external can be used to capture an object's ID on an external service, and can potentially be searchable in the index
 * Note - This is different from a result.id.
 *
 * defunct is used to mark an existing KVP deleted when the value must be retained, for example for audit purposes.
 *
 * result.* are used to capture response codes and transaction IDs from external services
 *
 * error.* types can be used when processing a document that returns an error, but doesn't necessarily require a full blown error response.
 * @example "general.string"
 */
export enum EnumKVPType {
  Defunct = 'defunct',
  GeneralString = 'general.string',
  GeneralInteger = 'general.integer',
  GeneralFloat = 'general.float',
  GeneralBool = 'general.bool',
  GeneralDate = 'general.date',
  GeneralDatetime = 'general.datetime',
  RawJsonBase64 = 'raw.json.base64',
  RawXmlBase64 = 'raw.xml.base64',
  RawBase64 = 'raw.base64',
  ErrorCode = 'error.code',
  ErrorMessage = 'error.message',
  ResultCode = 'result.code',
  ResultId = 'result.id',
  IdExternal = 'id.external',
  IdNumberPrimary = 'id.number.primary',
  IdNumberAdditional = 'id.number.additional',
  IdMsisdn = 'id.msisdn',
  IdEmail = 'id.email',
  IdDevice = 'id.device',
  PiiNameFull = 'pii.name.full',
  PiiNameFamilyname = 'pii.name.familyname',
  PiiNameGivenname = 'pii.name.givenname',
  PiiNameMiddlename = 'pii.name.middlename',
  PiiGender = 'pii.gender',
  PiiAddressLongform = 'pii.address.longform',
  PiiAddressShortform = 'pii.address.shortform',
  PiiAddressStreet1 = 'pii.address.street1',
  PiiAddressStreet2 = 'pii.address.street2',
  PiiAddressPostalcode = 'pii.address.postalcode',
  PiiAddressTown = 'pii.address.town',
  PiiAddressSuburb = 'pii.address.suburb',
  PiiAddressRegion = 'pii.address.region',
  PiiAddressState = 'pii.address.state',
  PiiAddressCountry = 'pii.address.country',
  PiiDob = 'pii.dob',
  TransientString = 'transient.string',
}

/**
 * The standard MIME type of the file being uploaded. We'll double-check to be certain, but this can help speed things up
 * @example "image/png"
 */
export enum EnumMIMEType {
  ImageJpeg = 'image/jpeg',
  ImageAvif = 'image/avif',
  ImagePng = 'image/png',
  ImageGif = 'image/gif',
  ImageWebp = 'image/webp',
  ImageTiff = 'image/tiff',
  ImageBmp = 'image/bmp',
  ImageHeic = 'image/heic',
  ImageHeif = 'image/heif',
  ApplicationZip = 'application/zip',
  ApplicationXZip = 'application/x-zip',
  ApplicationXZipCompressed = 'application/x-zip-compressed',
  ApplicationXTar = 'application/x-tar',
  ApplicationXRarCompressed = 'application/x-rar-compressed',
  ApplicationXGzip = 'application/x-gzip',
  ApplicationGzip = 'application/gzip',
  ApplicationXBzip2 = 'application/x-bzip2',
  ApplicationX7ZCompressed = 'application/x-7z-compressed',
  ApplicationPdf = 'application/pdf',
  ApplicationRtf = 'application/rtf',
  ApplicationPostscript = 'application/postscript',
  ApplicationJson = 'application/json',
  AudioMpeg = 'audio/mpeg',
  AudioM4A = 'audio/m4a',
  AudioXWav = 'audio/x-wav',
  AudioAmr = 'audio/amr',
  TextPlain = 'text/plain',
  TextRtf = 'text/rtf',
  ApplicationMsword = 'application/msword',
  ApplicationVndOpenxmlformatsOfficedocumentWordprocessingmlDocument = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ApplicationVndMsExcel = 'application/vnd.ms-excel',
  ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ApplicationVndMsOutlook = 'application/vnd.ms-outlook',
  ApplicationVndMsPowerpoint = 'application/vnd.ms-powerpoint',
  ApplicationVndOasisOpendocumentText = 'application/vnd.oasis.opendocument.text',
  ApplicationVndOpenxmlformatsOfficedocumentPresentationmlPresentation = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  VideoAvi = 'video/avi',
  VideoXM4A = 'video/x-m4a',
  VideoMp4 = 'video/mp4',
  VideoWebm = 'video/webm',
  VideoQuicktime = 'video/quicktime',
  VideoMsvideo = 'video/msvideo',
  VideoXMsvideo = 'video/x-msvideo',
  VideoXMsWmv = 'video/x-ms-wmv',
  VideoMpeg = 'video/mpeg',
}

/**
 * Indicates the type of notification being pushed.
 * - "FUNCTION": A request that you previously backgrounded has completed and this is the notification that is it complete (success is another matter)
 * - "RESULT": Like the FUNCTION notification, this tells you that a previously backgrounded request has completed, and that there is a set of results in the payload pointer.
 * - "EVENT": There has been a stateful change in a document, entity or some other piece of data that we are holding/monitoring for you. This is an indication that you may wish to take some action.
 * - "ALERT": Like the EVENT, except that the severity of the notification indicates that action is almost certainly required.
 */
export enum EnumNotificationType {
  FUNCTION = 'FUNCTION',
  RESULT = 'RESULT',
  EVENT = 'EVENT',
  ALERT = 'ALERT',
}

/**
 * The reason why the scanData in a response is missing.
 * - "NORMAL": The scanData was retrieved and is included. If it is empty then it was never provided or was provided empty.
 * - "EXCLUDED": The retrieval request was not for 'full' data, or the object has 'ScanDelete' set so the scanData is not included
 * - "FAILED": The scanData could not be retrieved from the secure document store.
 *
 * The enumScanDataRetrievalState will not usually be set in a request. If a ScannedDocumentObject in a response has a 'FAILED' retrieval state then that object should not be sent back in a future possible update. It should either be omitted or the original data should be resent if it is available from another source. However it is safe to send the object in an update with the state received in a response. Any state other than 'NORMAL' (or '') will cause the blank scanData to be ignored, but other fields in the object will be updated if needed.
 * @example "NORMAL"
 */
export enum EnumScanDataRetrievalState {
  NORMAL = 'NORMAL',
  EXCLUDED = 'EXCLUDED',
  FAILED = 'FAILED',
}

/**
 * Describes if a scan is of the "F"ront or "B"ack of an ID. If not supplied, Front is always assumed.
 * @example "F"
 */
export enum EnumScanSide {
  F = 'F',
  B = 'B',
}

/**
 * Valid ID document scan general types.
 * - "PHOTO": Any photo
 * - "VIDEO": Any video
 * - "AUDIO": Any audio
 * - "PDF":   PDF or PS (may contain text, images or both)
 * - "DOC":   Word doc, RTF, etc
 * - "ZIP":   Any compressed file(s)
 * @example "PDF"
 */
export enum EnumScanType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  PDF = 'PDF',
  DOC = 'DOC',
  ZIP = 'ZIP',
}

/**
 * Defines how close a match we were able to make based on search results.
 * - "LOW": The item does match the minimum criteria given, but is potentially one of a number of possible hits
 * - "MEDIUM": The item matches multiple search criteria, but there is still some potential ambiguity with other hits
 * - "HIGH": Matches all given search criteria, but there were other potential hits
 * - "DEFINITE": Was the only item to match all given search criteria.
 * @example "HIGH"
 */
export enum EnumSearchResultConfidence {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  DEFINITE = 'DEFINITE',
}

/** transaction disposition based on risk, confidence and final check status */
export enum EnumTransactionStatusKYC {
  PASS = 'PASS',
  REFER = 'REFER',
  FAIL = 'FAIL',
  PASS_MANUAL = 'PASS_MANUAL',
  WAIT = 'WAIT',
  FAIL_MANUAL = 'FAIL_MANUAL',
  BLOCK = 'BLOCK',
  UNCHECKED = 'UNCHECKED',
  ARCHIVED = 'ARCHIVED',
  INACTIVE = 'INACTIVE',
}

export interface ErrorObject {
  /**
   * Server version indication
   * @example "2af478ed"
   */
  commit?: string;
  /**
   * Frankie error code
   * @example "CORE-5990"
   */
  errorCode: string;
  /**
   * Will describe the error
   * @example "Everything went kaflooey. Stay clam."
   */
  errorMsg: string;
  /**
   * Deprecated:
   * HTTP status code. Same as that which is passed back in the header.
   * @example 501
   */
  httpStatusCode?: number;
  issues?: ErrorObjectIssues[];
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId: RequestIDObject;
}

export interface ErrorObjectIssues {
  /**
   * Description of the problem
   * @example "Invalid format. Must be YYYY-MM-DD"
   */
  issue?: string;
  /**
   * Will describe the field or data location of the issue
   * @example "dateOfBirth"
   */
  issueLocation: string;
}

/**
 * Collection of fraud check results for the entity.
 *
 * Contains fraud list and/or background result arrays. Other fraud check types will appear over time
 */
export interface FraudCheckResultObject {
  fraudBackgroundCheckResults?: ProcessResultObject[];
  fraudDeviceResults?: ProcessResultObject[];
  fraudListResults?: ProcessResultObject[];
}

export interface GenderCheckResultObject {
  /** An array in reverse chronological order of all checks done on this data point for the given entity. Older checks may have been previously done by you or another institution, and if so, these will be listed. */
  checkResult?: GeneralCheckResultArray;
  /**
   * Used to indicate of the entity in question is:
   * - "M"ale
   * - "F"emale
   * - "U"nspecified
   * - "O"ther (for want of a better option)
   */
  gender?: EnumGender;
}

/** An array in reverse chronological order of all checks done on this data point for the given entity. Older checks may have been previously done by you or another institution, and if so, these will be listed. */
export type GeneralCheckResultArray = GeneralCheckResultObject[];

/** Contains the details of a check on a given data point */
export interface GeneralCheckResultObject {
  /** Stores the generic results of a process (check, scan, compare, verify, etc) */
  checkProcessResults?: ProcessResultObject;
  /**
   * Who performed the check. If it was the calling customer, the value will be "You".
   * If it was another institution that has previously validated this data, then a generic description of their industry will be provided, such as "Bank", "Insurance", "Other FI".
   * @example "Bank"
   */
  checkRequestedBy?: string;
}

export interface GoodsAndServicesTax {
  /** @format date-time */
  effectiveFrom?: string;
  /** @format date-time */
  effectiveTo?: string;
}

export interface HistoricalChange {
  businessName?: string[];
  /** @format date-time */
  date?: string;
  entityStatus?: string[];
  goodsAndServicesTax?: string[];
  mainBusinessPhysicalAddress?: string[];
  mainName?: string[];
  mainTradingName?: string[];
}

/**
 * This object holds the identityDocument that was checked and the results associated with said checks.
 * You can also leave the checkResult blank/nil if there are no results for that identityDocument if you wish.
 * This is useful for returning results on a freshly crerated entity where the API user would want to confirm that the data has indeed been stored, and be able to capture relevant documentIds - perhaps to address issues as to why it wasn't checked.
 */
export interface IdentityDocumentCheckResultObject {
  /** An array in reverse chronological order of all checks done on this data point for the given entity. Older checks may have been previously done by you or another institution, and if so, these will be listed. */
  checkResult?: GeneralCheckResultArray;
  idDocument?: IdentityDocumentObject;
}

export interface IdentityDocumentObject {
  /**
   * The ISO-3166-alpha3 country code of the issuing national. Once set, this cannot be changed.
   *
   * See https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes for more
   * @example "AUS"
   */
  country: string;
  /**
   * This document's data was initially created from scanned and processed images. The value cannot be set manually and any attempt to do so will just be ignored.
   * @example true
   */
  createdFromScan?: boolean;
  /**
   * Collection of one or more objects that describe scan(s) that need to be put through OCR or facial recognition. These should all be from the one ID document, such as front/back, or page 1, 2, 3, etc. You can upload multiple scans in a single call, or in multiple calls.
   *
   *   Note: if you do upload over multiple calls, make sure you include the documentId (see above), and indicate that this is happening with a "more_data" checkAction
   */
  docScan?: ScannedDocumentObject[];
  /**
   * When an ID document is created/uploaded, it is assigned a documentId. You'll see this in a successful response or successfully accepted response. This can then be referenced in subsequent calls if you're uploading more/updated data.
   * @format uuid
   * @example "84a9a860-68ae-4d7d-9a53-54a1116d5051"
   */
  documentId?: string;
  /**
   * Current status of a document.
   * - "INITIALISING": the state whilst you're uploading and updating
   * - "SCAN_IN_PROGRESS": the state whilst it's being scanned.
   * - "DOC_SCANNED": the document has been scanned and data extracted as best as possible. It's still possible to update the details and add more scans if you wish.
   * - "DOC_CHECKED": the document has been used as part of a check that has been finalised in some way. You can no longer update this document and any attempt will generate an error.
   */
  documentStatus?: EnumDocumentStatus;
  /**
   * Set of key-value pairs that provide ID type-specific data. If updating an existing document, then existing values with the same name will be overwritten. New values will be added.
   *
   * If this document is scanned through OCR or similar processes, then extracted data will be found here (Some may be used to populate other fields like idNumber and idExpiry as well)
   */
  extraData?: KeyValuePairObject[];
  /**
   * The expiry date of the document (if known) in YYYY-MM-DD format.
   * @format date
   * @example "2020-02-01"
   */
  idExpiry?: string;
  /**
   * The issued date of the document (if known) in YYYY-MM-DD format.
   * @format date
   * @example "1972-11-04"
   */
  idIssued?: string;
  /**
   * The ID number of the document (if known).
   * @example "123456789"
   */
  idNumber?: string;
  /** The sub-type of identity document. Very document specific. */
  idSubType?: string;
  /**
   * Valid ID types
   *   - "OTHER": Generic document type. Unspecified.
   *   - "DRIVERS_LICENCE": Driver's licence.
   *   - "PASSPORT": Passport
   *   - "VISA": Visa document (not Visa payment card)
   *   - "IMMIGRATION": Immigration card
   *   - "NATIONAL_ID": Any national ID card
   *   - "TAX_ID": Any national tax identifier
   *   - "NATIONAL_HEALTH_ID": Any national health program ID card (e.g. Medicare, NHS)
   *   - "CONCESSION": State issued concession card
   *   - "HEALTH_CONCESSION": State issued health specific concession card
   *   - "SENIORS_HEALTH_CONCESSION": State issued health specific concession card for seniors
   *   - "PENSION": State issued pension ID
   *   - "MILITARY_ID": Military ID
   *   - "BIRTH_CERT": Birth certificate
   *   - "CITIZENSHIP": Citizenship certificate
   *   - "MARRIAGE_CERT": Marriage certificate
   *   - "DEATH_CERT": Death certificate
   *   - "NAME_CHANGE": Name chage confirmation
   *   - "UTILITY_BILL": Regulated utility bill, such as electricity, gas, etc
   *   - "BANK_STATEMENT": Bank/card statement
   *   - "BANK_ACCOUNT": Bank account
   *   - "INTENT_PROOF": A proof of intent. Generally a photo/video, or a scanned letter
   *   - "ATTESTATION": A document of attestation (e.g. Statutory Declaration). NOTE: these cannot be used as a supporting document
   *   - "SELF_IMAGE": A "selfie" used for comparisions
   *   - "EMAIL_ADDRESS": An email address
   *   - "MSISDN": A mobile phone number
   *   - "DEVICE": A device ID
   *   - "VEHICLE_REGISTRATION": Vehicle registration number
   *   - "PROOF_OF_ADDRESS": Can be any type of document that provides a proof of address
   *   - "HOUSE_REGISTRATION": House registration document
   *   - "YELLOW_HOUSE_REGISTRATION": Yellow House Registration Thor Ror 13
   *   - "WORK_PERMIT": Work permit
   *   - "EMPLOYMENT_CERTIFICATE": Certificate of employment
   *   - "NOTARY_PUBLIC_ID": Notary Public Identification
   *   - "AVIATION_SECURITY_ID": Aviation Security Identification
   *   - "MARITIME_SECURITY_ID": Maritime Security Identification
   * Business related documentation
   *   - "EXTERNAL_ADMIN": Details of appointed administrator.
   *   - "CHARGES": Details of any charges that have been laid against a company or director
   *   - "PRE_ASIC": Any documents that are Pre-ASIC
   *   - "ANNUAL_RETURN": Details of a company's annual return
   *   - "REPORT": Frankie generated report.
   *   - "TRUST_DEED": Corporate trust deed
   *   - "PARTNERSHIP_AGREEMENT": Partnership agreement documents
   *   - "ADMIN_CHANGE": Change of Administrator
   *   - "COMPANY_REPORT": ASIC filed company reports
   * Special document types
   *   - "CHECK_RESULTS": A special document type for specifying results of checks completed other than through Frankie.
   */
  idType: EnumIdType;
  /**
   * If this document was originally populated from scanned data, then manually adjusted (e.g. if the scan's results weren't 100% correct or data was missing), then this will be set to true. The value cannot be set manually and any attempt to do so will just be ignored.
   * @example "false"
   */
  manuallyModified?: boolean;
  /**
   * Regional variant of the ID (e.g. VIC drivers licence)
   *
   * You should always use the local abbreviation for this.
   * E.g.
   *   - VIC for The Australian state of Victoria
   *   - MA for the US state of Massachusetts
   *   - etc
   * @example "VIC"
   */
  region?: string;
}

/** x */
export interface IndividualData {
  /** List of all found addresses associated with this person */
  addresses?: AddressObject[];
  /**
   * If describing an (ultimate) beneficial owner, then if any of the shared held are not benefially held, this field will be set to "false"
   * @example true
   */
  beneficially_held: boolean;
  /**
   * RFC3339 formatted date
   * @format date
   * @example "1969-01-01"
   */
  date_of_birth?: string;
  /**
   * The entityId of the individual
   * @format uuid
   */
  entityId?: string;
  /**
   * Name of the individual
   * @example "JAN MICHAEL VINCENT"
   */
  name?: string;
  /**
   * If describing an (ultimate) beneficial owner, the percentage of the company owned by this Individual
   * @format float
   */
  percent_owned: number;
  /**
   * If this individual has a role as an officeholder, such as director, then this will be described here. May be blank.
   * @example "Director"
   */
  role: string;
  /** Contains the results (if any) of the KYC and AML/Media checks performed */
  screening_result?: ScreeningResult;
}

export interface IndustryCodesObject {
  code?: string;
  description?: string;
}

export interface IndustryDeclarationsObject {
  description?: string;
  language?: string;
}

export interface IndustryPaymentPredictor {
  atbData?: AtbData;
  averageOverdue?: AverageOverdue[];
  displayStateAlert?: boolean;
  noGoodData?: boolean;
  othersAbnHistory?: OthersAbnHistory;
  overdueDays?: number[];
  paymentPredictorNoEnoughData?: boolean;
  paymentPredictorPurchased?: boolean;
  tableOfStats?: TableOfStat;
}

export interface InsolvencyNotice {
  /** @format date-time */
  date?: string;
  id?: string;
  /** @format date-time */
  lastmod?: string;
  publisher?: string;
  reportedBy?: string;
  ruling?: string;
  title?: string;
}

/** Object to supply the country code and company code whose details you wish to retrieve. */
export interface InternationalBusinessProfileCriteria {
  /**
   * This is the company number returned in the search results
   *
   * (InternationalBusinessSearchResponse.Companies.CompanyDTO[n].Code)
   */
  company_code?: string;
  /**
   * The ISO 3166-1 alpha2 country code of country registry you wish to search.
   * This is consistent for all countries except for:
   *
   *   - The United States which requires the state registry to query as well.
   *     - As an example, for a Delaware query, the country code would be "US-DE".
   *     - A Texas query would use "US-TX"
   *   - Canada, which also requires you to supply a territory code too.
   *     - A Yukon query would use CA-YU, Manitoba would use CA-MB
   *     - You can do an all jurisdiction search with CA-ALL
   *
   *   See details here:
   *     https://apidocs.frankiefinancial.com/docs/country-codes-for-international-business-queries
   */
  country: string;
  /** The registration authority code you wish to search on. This will be used when the country you are searching has multiple registration authorities. */
  registration_authority_code?: string;
}

/** This wraps the search response details from Kyckr */
export interface InternationalBusinessProfileResponse {
  CompanyProfile?: CompanyProfileDTO;
  /**
   * Unique ID for the individual check that was run.
   * @format uuid
   */
  checkId?: string;
  /**
   * The date and time this entity was created in our service.
   * @format date-time
   */
  entityCreatedDate?: string;
  /**
   * If the response was successful and we returned a company profile, we save this as an ORGANISATION type entity in our service.
   * We will also save the profile result as a REPORT type document, attached to the entity.
   * @format uuid
   * @example "84a9a860-68ae-4d7d-9a53-54a1116d5051"
   */
  entityId?: string;
  /**
   * The date and time this entity was last updated in our service.
   * @format date-time
   */
  entityUpdatedDate?: string;
  /** service provider response code */
  ibResponseCode?: number;
  ibResponseDetails?: string;
  ibRetrievalLocation?: string;
  /** service provider ID */
  ibTransactionId?: string;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
}

/** Object to supply the country code, business name and number, along with an optional registry parameter to search for. */
export interface InternationalBusinessSearchCriteria {
  /** Flag to use the cache search functionality of provider. */
  cached_search?: boolean;
  /**
   * The ISO 3166-1 alpha2 country code of country registry you wish to search.
   * This is consistent for all countries except for:
   *
   *   - The United States which requires the state registry to query as well.
   *     - As an example, for a Delaware query, the country code would be "US-DE".
   *     - A Texas query would use "US-TX"
   *   - Canada, which also requires you to supply a territory code too.
   *     - A Yukon query would use CA-YU, Manitoba would use CA-MB
   *     - You can do an all jurisdiction search with CA-ALL
   *
   *   See details here:
   *     https://apidocs.frankiefinancial.com/docs/country-codes-for-international-business-queries
   */
  country: string;
  /**
   * Name or name fragment you wish to search for.
   *
   * Note: The less you supply, the more, but less relevant results will be returned.
   *
   * CRITICAL NOTE: This is *NOT* to be used as a progressive search function.
   *
   * You must supply at least one of organisation_name and/or organisation_number.
   * If you supply both, a name search will be conducted first, then the number will be checked against the result set and any remaining results returned.
   */
  organisation_name?: string;
  /** The business number you wish to search on. This should be a unique corporate identifier as per the country registry you're searching. */
  organisation_number?: string;
}

/** This wraps the search response details from Kyckr */
export interface InternationalBusinessSearchResponse {
  Companies?: ArrayOfCompanyDTO;
  ibContinuationKey?: string;
  /** service provider response code */
  ibResponseCode?: number;
  ibResponseDetails?: string;
  /** service provider ID */
  ibTransactionId?: string;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
}

export type IssueList = IssueListImpl;

/**
 * Array of issues associated with this monitoring alert. Same contents as the case record alert list but as an array rather thand a string. The alert list will become deprecated at some point.
 *
 * List of possible issues supported:
 *
 * * 404
 * * 500
 * * ATT-IDV
 * * ATT-NCMP
 * * ATT-PHT
 * * BANK ACCOUNT
 * * BL
 * * DUP
 * * FRAUD
 * * IWL
 * * M
 * * PEP
 * * PTL
 * * RISK
 * * S
 * * VISA
 * * WL
 */
export type IssueListImpl = object;

/** A key/value pair of strings that describe the location of the issue (key) and an issue description (value). Also inclused is a severity */
export interface IssueListItems {
  /**
   * Human readable description of the issue
   * @example "Date of birth not found"
   */
  issue_description?: string;
  /**
   * Where the issue occured. It will describe a location in the response structure
   * @example "ultimate_beneficial_owner.0.date_of_birth"
   */
  issue_location?: string;
  /**
   * The impact of the issue on the process.
   *
   * Is it just informational, such as a trivial different in a name match?
   * Is it a warning to highlight something that is important, but did not prevent the process from completing?
   * Is it a critical issue that prevented the check from completing successfully?
   * Is it a stop condition that prevented the checks from being run at all?
   */
  issue_severity?: 'INFO' | 'WARN' | 'CRIT' | 'STOP';
}

/** Set of key-value pairs that provide additional data. This is *not* the extra data from the entity. */
export type KVPOArray = KeyValuePairObject[];

/** Message bus payload for fo.kyb.monitor.notifications topic */
export interface KYBMonitorNotification {
  /**
   * The UTC date this notication applies to
   * @format date
   */
  createdDate?: string;
  /** The 'issue' from CW daily-notification */
  description?: string;
  /** The 'type' from CW daily-notification */
  notificationType?: string;
  /** The 'organisationName' from CW daily-notification */
  registeredName?: string;
  registrationNumbers: KYBRegistrationNumbers;
}

/** Message bus payload for fo.kyb.monitor.runs topic */
export interface KYBMonitorRun {
  /**
   * The UTC date for which the monitor poll should be done. Default is the current UTC day.
   * @format date
   */
  pollDate?: string;
}

/** Message bus payload for fo.kyb.monitor.requests & responses topics */
export interface KYBMonitorStatus {
  monitoringEnabled: boolean;
  registrationNumbers: KYBRegistrationNumbers;
}

export type KYBRegistrationNumbers = Record<string, string>;

/** The results of a safe harbour KYC check of an individual */
export interface KYCScreeningResult {
  /**
   * The number of address matches
   * @example 1
   */
  address_match_count: number;
  /**
   * The disposition of the 2+2 Safe Harbour check
   * @example "PASS"
   */
  check_result?: 'NOT_SCREENED' | 'PASS' | 'REFER' | 'FAIL';
  /**
   * The number of date of birth matches
   * @example 1
   */
  dob_match_count: number;
  /**
   * The is of matching data sources that produced a success match for the person being screened
   * Example given is not indicative of the actual sources available.
   * @example ["au-elec","ntd","dvs"]
   */
  matching_sources?: string[];
  /**
   * The number of name matches
   * @example 2
   */
  name_match_count: number;
}

/** Individual key-value pair */
export interface KeyValuePairObject {
  /**
   * Name of the data
   * @example "Extra.Information"
   */
  kvpKey?: string;
  /**
   * Used to describe the contents of the KVP data.
   *
   * The general.* and raw.* types are pretty much what they say on the tin.
   *
   * All raw.* fields will be base64 encoded so as to not interfere with JSON structuring. These are useful for returning/storing large quantities of data that doesn't necessarily require processing now, or may be useful to a calling client.
   *
   * The id.* and pii.* are used to indicate that this is data that can be used to create new document objects, or entities. They should also be treated with the utmost care and attention when it comes to securing them too.
   *
   * id.external can be used to capture an object's ID on an external service, and can potentially be searchable in the index
   * Note - This is different from a result.id.
   *
   * defunct is used to mark an existing KVP deleted when the value must be retained, for example for audit purposes.
   *
   * result.* are used to capture response codes and transaction IDs from external services
   *
   * error.* types can be used when processing a document that returns an error, but doesn't necessarily require a full blown error response.
   */
  kvpType?: EnumKVPType;
  /**
   * Value of the data
   * @example "123-456-789A"
   */
  kvpValue?: string;
}

export interface LegalFormDTO {
  Basis?: string;
  Capital?: string;
  Comments?: string;
  Control?: string;
  Incorp?: string;
  Partner?: string;
  Responsibility?: string;
  Stocks?: string;
}

export type ListOfString = string[];

export interface Loan {
  abn?: string;
  acn?: string;
  amount?: string;
  companyName?: string;
  /** @format date-time */
  endAt?: string;
  /** @format date-time */
  startAt?: string;
  status?: string;
  termLength?: number;
  type?: string;
  uuid?: string;
}

export interface MainBusinessPhysicalAddress {
  /** @format date-time */
  effectiveFrom?: string;
  /** @format date-time */
  effectiveTo?: string;
  postcode?: string;
  stateCode?: string;
}

export interface MercantileEnquiry {
  agent?: string;
  company?: string;
  /** @format date-time */
  createdDate?: string;
  /** @format date-time */
  date?: string;
  phone?: string;
  /** @format date-time */
  registeredDate?: string;
}

/** x */
export interface NonIndividualBeneficialOwner {
  /**
   * If describing an (ultimate) beneficial owner, then if any of the shared held are not benefially held, this field will be set to "false"
   * @example true
   */
  beneficially_held: boolean;
  /**
   * The ASIC type of the company/entity
   * @example "APUB"
   */
  entity_type?: string;
  /**
   * Name of the company/entity
   * @example "Widget Trust Corpoation Inc."
   */
  name?: string;
  /**
   * If describing an (ultimate) beneficial owner, the percentage of the company owned
   * @format float
   */
  percent_owned: number;
  /** If a company is listed, then this object will be populated with whatever data has been determined. */
  stock_exchange_data?: StockExchangeData;
}

/** The following fields represent the data you need in order to retrieve the results of the requested function. See the details of the notification API for more. */
export interface NotificationResultObject {
  /**
   * If you're calling a processing function of some kind, a check number will be issued. This field will only be present if the function you're calling would normally return a checkId (such as scan, verify, and compare).
   * @format uuid
   */
  checkId?: string;
  /**
   * Only supplied if the original request was tied to a document. This will be the same ID that was sent in the original acceptance.
   * @format uuid
   */
  documentId?: string;
  /**
   * If the entity in entityId above has had an external service ID attached to it in the entity extraData with kvpKey = customer_reference, then this is that kvpValue
   * @example "AU0123456"
   */
  entityCustomerReference?: string;
  /**
   * Only supplied if the original request was tied to an entity. This will be the same ID that was sent in the original acceptance.
   * @format uuid
   */
  entityId?: string;
  /**
   * Additional fields that contain the detailed data that was used to generate the 'message' field. The actual content
   * will depend on the 'notificationType' and 'function'.
   */
  extraData?: Record<string, any>;
  /**
   * Short description of the original function called, or function that was triggered.
   * @example "entity.create"
   */
  function?: string;
  /**
   * High level indication of the final disposition of a backgrounded function
   * - "COMPLETED": the request completed (not that the final result is a success, just that we completed)
   * - "FAILED": the request failed.
   * - "INCOMPLETE": could not complete the request.
   */
  functionResult?: EnumFunctionStatus;
  /**
   * URI for resource containing more details about the reason for the notification.
   * @format uri
   * @example "https://portal.frankiefinancial.io/entity/3fa85f64-5717-4562-b3fc-2c963f66afa6"
   */
  linkReference?: string;
  /**
   * A brief, human readable message describing the reason for the notification.
   * @example "Entity successfully created"
   */
  message?: string;
  /**
   * Indicates the type of notification being pushed.
   * - "FUNCTION": A request that you previously backgrounded has completed and this is the notification that is it complete (success is another matter)
   * - "RESULT": Like the FUNCTION notification, this tells you that a previously backgrounded request has completed, and that there is a set of results in the payload pointer.
   * - "EVENT": There has been a stateful change in a document, entity or some other piece of data that we are holding/monitoring for you. This is an indication that you may wish to take some action.
   * - "ALERT": Like the EVENT, except that the severity of the notification indicates that action is almost certainly required.
   */
  notificationType?: EnumNotificationType;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
  /** The portal username that initiated the operation that led to this notification. If applicable and available. */
  username?: string;
}

/** Officer details as returned from an ASIC report. */
export interface OfficerObject {
  /**
   * If this officer was created from a request for a manual association, then this is the identity of the
   * party that requested that association. For requests via the Frankie portal this will default to the portal
   * username. Otherwise, if not given in the request, this will be your company name.
   */
  addedBy?: string;
  /** @format date */
  appointmentDate?: string;
  /** @format date */
  ceasedDate?: string | null;
  countryOfResidence?: string;
  /** Officer court details as returned from an ASIC report. */
  courtDetails?: CourtDetailsObject;
  directorId?: string;
  directorships?: DirectorshipsObject[];
  docNumber?: string;
  docNumberQualifier?: string;
  /** @format uuid */
  entityId?: string;
  nationality?: string;
  natureOfControl?: string[];
  status?: string;
  title?: string;
  type?: string;
  typeDescription?: string;
  unstructuredAppointmentDate?: string;
  unstructuredCeasedDate?: string;
  unstructuredNotifiedDate?: string;
}

/** The result of an /business/ownership/query call retrieved via GET /retrieve/response/{requestId} after you receive a notification that the result is ready. */
export interface OrganisationCheckResponseObject {
  /** Used to set additional information flags for this response. */
  flags?: EntityFlagObject[];
  /**
   * Batch identifier for the KYC/AML check results if any.
   * @format uuid
   */
  organisationCheckId?: string;
  /** The results of KYC/AML check on a organisation with a prior ownership query. This will be retrived via GET /retrieve/response/{requestId} after you receive a notification that the results are ready. */
  organisationCheckResult?: OrganisationCheckResultObject;
  /**
   * If an ownership result is provided in this response then this is the date and time the service provided that result.
   * @format date-time
   */
  ownershipCheckDate?: string;
  /**
   * Unique identifier for the ownership check.
   * @format uuid
   */
  ownershipCheckId?: string;
  ownershipQueryError?: ErrorObject;
  ownershipQueryResult?: OwnershipQueryResultObject;
  reportError?: ErrorObject;
  /** The positive result of a report generation request if any. */
  reportResult?: BusinessReportResultObject;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
  uboResponse?: UBOResponse;
}

/** The results of KYC/AML check on a organisation with a prior ownership query. This will be retrived via GET /retrieve/response/{requestId} after you receive a notification that the results are ready. */
export interface OrganisationCheckResultObject {
  /** A map of the entity categories that were selected for checks and an array of the entity IDs for each. The results for each entity ID will be in either the entityCheckResults or entityCheckErrors maps. Entities may appear in more than one category. */
  entityCategories?: Record<string, string[]>;
  /** A map of outright errors (failure to generate any kind of result). These objects will be referenced by entity ID in the entity category map. */
  entityCheckErrors?: Record<string, ErrorObject>;
  /** List of all entities check results (both individuals and organisations) other than outright errors. These objects will be referenced by entity ID in the entity category map. */
  entityCheckResults?: Record<string, CheckEntityCheckResultObject>;
  /**
   * The entityId of the organisation for which this result was created.
   * @format uuid
   */
  entityId?: string;
  /**
   * The unique ID for grouping all new KYC/AML checks in this result. This is only for Frankie internal use.
   * @format uuid
   */
  groupId?: string;
}

/** Organisation details for entities. Returned from an ASIC report. */
export interface OrganisationDataObject {
  adverseCreditDataPresent?: boolean;
  aliases?: string[];
  blockingReasons?: OrganisationDataObjectBlockingReason[];
  /** A common pairing of a short code and a long description. */
  class?: CodeDescription;
  contactDetails?: OrganisationDataObjectContactDetails;
  disclosingEntityIndicator?: boolean;
  /** @format date */
  extractedDate?: string | null;
  includesNonBeneficiallyHeld?: boolean;
  industryCodes?: IndustryCodesObject[];
  industryDeclarations?: IndustryDeclarationsObject[];
  kycCustomerType?: string;
  /** @format date */
  lastCheckDate?: string;
  legalFormDetails?: OrganisationDataObjectLegalFormDetails;
  normalisedLegalStatus?: string;
  ownershipResolved?: boolean;
  registeredName?: string;
  registration?: OrganisationDataObjectRegistration;
  registries?: Registries;
  /** @format date */
  reviewDate?: string | null;
  shareStructure?: ShareStructureObject[];
  /** @format date */
  startDate?: string;
  /** A common pairing of a short code and a long description. */
  status?: CodeDescription;
  /** A common pairing of a short code and a long description. */
  subType?: CodeDescription;
  /** A common pairing of a short code and a long description. */
  subclass?: CodeDescription;
  /** A common pairing of a short code and a long description. */
  type?: CodeDescription;
}

export interface OrganisationDataObjectBlockingReason {
  candidates?: BlockingReasonCandidate[];
  description?: string;
  type?: string;
}

export interface OrganisationDataObjectContactDetails {
  email?: string;
  faxNumber?: string;
  telephoneNumber?: string;
  websiteURL?: string;
}

export interface OrganisationDataObjectLegalFormDetails {
  basis?: string;
  capital?: string;
  comments?: string;
  control?: string;
  incorp?: string;
  partner?: string;
  responsibility?: string;
  stocks?: string;
}

export interface OrganisationDataObjectRegistration {
  countryIso?: string;
  /** @format date */
  date?: string;
  number?: string;
  previousNumber?: string;
  registryCode?: string;
  registryDescription?: string;
  state?: string;
  unstructuredDate?: string;
  unstructuredFoundationDate?: string;
}

export interface OthersAbnHistory {
  getSingleHighestCreditExtended?: number;
  tradeHistory?: TradeHistory[];
}

export interface OwnershipBlockingDetailsObject {
  /** @format uuid */
  entityId?: string;
  /**
   * Indicates the type of an entity.
   * - "INDIVIDUAL": An individual.
   * - "TRUST": A trust.
   * - "ORGANISATION": An organisation.
   */
  entityType?: EnumEntityType;
  percentageOwned?: {
    beneficially?: number;
    nonBeneficially?: number;
    total?: number;
  };
  reasons?: OwnershipBlockingReasonObject[];
}

export interface OwnershipBlockingReasonObject {
  candidates?: BlockingReasonCandidate[];
  circularEntityIds?: string[];
  description?: string;
  /** Indicates the type of the blocking entity. */
  type?: EnumBlockingType;
  unstructuredType?: string;
}

/** The ownership details for one organisation. */
export interface OwnershipDetailsObject {
  /** The beneficial owners of the company, who aren't necessarily UBO's. */
  beneficialOwners?: BeneficialOwnerObject[];
  /** Company office holders. */
  officers?: OfficerObject[];
  /** Describes all of the data being used to verify an entity. */
  organisation?: EntityObject;
  /** This provides information about the different categories or types of shares issued by the company. */
  shareCapitalGroup?: {
    shareCapital?: ShareCapitalObject[];
    /** The total number of shares issued by the organisation of all types. */
    totalNumberOfShares?: number;
    totalShareCapitalValue?: string;
  };
  /** Parcels of shares held by one or more shareholders. */
  shareholdings?: ShareholdingObject[];
  /** The beneficial owners of the company that were added directly via the Frankie API, not from an authoritative business registry. */
  staticBeneficialOwners?: BeneficialOwnerObject[];
  /** The officers or other associated entity roles for the company that were added directly via the Frankie API, not from an authoritative business registry. */
  staticOfficers?: OfficerObject[];
  /** The ultimate beneficial owners of the company. */
  ultimateBeneficialOwners?: BeneficialOwnerObject[];
}

/** Details of the organisation for which ownership should be queried. This should at least contain the ACN in the externalIds. */
export interface OwnershipQuery {
  /**
   * A list of manual associations you wish to make with the business to be queried.
   *
   * If your configuration supports this (ask your customer success representative), you can potentially
   * compare any UBOs or office holders you supply against those found through local registries.
   */
  associations?: StaticEntityAssociationRequest[];
  /** Describes all of the data being used to verify an entity. */
  organisation: EntityObject;
}

/**
 * Frankie internal use only.
 *
 * The result of an /business/ownership/query call as returned by a suitable service connector.
 */
export interface OwnershipQueryResponseObject {
  /**
   * If a result is provided in this response then this is the date and time the service provided that result.
   * @format date-time
   */
  checkDate?: string;
  /** @format uuid */
  checkId?: string;
  ownershipQueryResult?: OwnershipQueryResultObject;
  /** Unique identifier provided by the service. */
  providerCheckId?: string;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
}

export interface OwnershipQueryResultObject {
  /** List of all entities (both individuals and organisations) associated with this ownership result. These objects will be referenced by entityId in the shareholdings and officers lists in the following ownership details. */
  associatedEntities?: Record<string, EntityObject>;
  blockingEntityDetails?: Record<string, OwnershipBlockingDetailsObject>;
  /**
   * List of entity IDs (that should be in the associatedEntities list) who blocked the ultimate beneficial ownership tree traversal. These are likely to be entities that cannot be checked automatically (such as trusts) or who have no UBO's of their own, such as public companies.
   *
   * The presence of data in this array also signifies that the full UBO list is not complete.
   */
  blockingEntityIds?: string[];
  /**
   * The date and time this entity was created in our service.
   * @format date-time
   */
  entityCreatedDate?: string;
  /**
   * The entityId of the organisation for which this result was created. The details will be in the ownershipDetails map with this ID as the key.
   * @format uuid
   */
  entityId?: string;
  /**
   * The date and time this entity was updated in our service.
   * @format date-time
   */
  entityUpdatedDate?: string;
  /** A map of entityId to beneficialOwnerObjects that are not blocking and UBO entities. */
  otherOwners?: Record<string, BeneficialOwnerObject>;
  /** A map of entityId to ownershipDetailsObjects with at least one entry being for the root organisation that the overall result relates to. Any remaining entries will be for further results for organisational owners referenced in the root ownershipDetailsObject and so on. */
  ownershipDetails?: Record<string, OwnershipDetailsObject>;
  uncategorisedEntities?: Record<string, EntityObject>;
}

export interface PSCDetails {
  Address?: string;
  CeasedOn?: string;
  CountryOfResidence?: string;
  /** @format int64 */
  DOBDay?: number;
  /** @format int64 */
  DOBMonth?: number;
  /** @format int64 */
  DOBYear?: number;
  Kind?: string;
  Name?: string;
  Nationality?: string;
  NatureOfControl?: ArrayOfString;
  NatureOfControlList?: ListOfString;
  NotifiedOn?: string;
}

/** A list of direct parent associations of an entity */
export interface ParentAssociationsObject {
  /** A list of direct associations */
  associations?: AssociationObject[];
  /**
   * The entityId of interest.
   * @format uuid
   */
  entityId?: string;
}

/** The result of an /business/{entityId}/parentAssociations call */
export interface ParentAssociationsQueryResult {
  /** A list of all parent associations of entity  */
  parentAssociations?: ParentAssociationsObject[];
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
}

export interface PaymentDefault {
  abn?: string;
  accountAdditionalAbn?: string;
  /** @format date-time */
  accountVerifiedDate?: string;
  /** @format float */
  amountOutstanding?: number;
  /** @format date-time */
  approvedDate?: string;
  company?: string;
  defaultSettled?: boolean;
  doctype?: string;
  documentType?: string;
  /** @format date-time */
  lastUpdated?: string;
  /** @format date-time */
  originalInvoiceDate?: string;
  partPaymentMade?: boolean;
  partpayment?: boolean;
  /** @format date-time */
  paymentDueDate?: string;
  posterAbn?: string;
  posterName?: string;
  settled?: boolean;
  /** @format date-time */
  uploadedDate?: string;
}

export interface PaymentPredictorHistoryItem {
  /** @format date-time */
  date?: string;
  daysBeyondTerms?: number;
}

export interface PersonalNameCheckResultObject {
  /** An array in reverse chronological order of all checks done on this data point for the given entity. Older checks may have been previously done by you or another institution, and if so, these will be listed. */
  checkResult?: GeneralCheckResultArray;
  name?: PersonalNameObject;
}

export interface PersonalNameObject {
  /**
   * In some cases, the name will need to be supplied in "long form", such as when it is determined from a document scan, or is un-parsable in some way.
   * The service will attempt to convert it to it's constituent parts where possible.
   * @example "Jane Cecily Smith"
   */
  displayName?: string;
  /**
   * Family name / Surname of the individual.
   * @example "Smith"
   */
  familyName: string;
  /**
   * First / Given name
   * @example "Jane"
   */
  givenName?: string;
  /**
   * Mr/Ms/Dr/Dame/Dato/etc.
   * @example "Duchess"
   */
  honourific?: string;
  /**
   * Middle name(s) / Initials
   * @example "Cecily"
   */
  middleName?: string;
}

/** Stores the generic results of a process (check, scan, compare, verify, etc) */
export interface ProcessResultObject {
  /**
   * The date and time the item was checked to provide this result.
   * @format date-time
   */
  checkDate?: string;
  /** Unique identifier for every check/comparison/verification. Make sure you reference this ID whenever updating check details. This ID will also be used when pushing check results back to you. */
  checkId?: CheckIDObject;
  /**
   * Service provider that performed the check. Basically the name of the connector, without the leading con_
   * @example "greenid"
   */
  checkPerformedBy?: string;
  /**
   * Code that can be used to determine the underlying nature or data source of the checks performed. This may or may not be known by the connector, or may be a provider specific type (e.g. type "O")
   *
   * Note, this will actually be normalised by the core service into a standfardised result so that we're not accidentally counting sources twice.
   * Original source will then be copied into the KVPs
   * @example "DVS"
   */
  checkSource?: string;
  /**
   * Short indication of the type of check that was done.
   *
   * When used as a summary, it will the the checkType that was requested
   *
   * For granular results, it will be the individual check performed.
   */
  checkType?: string;
  /**
   * Confidence in the result on a scale of 0 (no match) to 100 (strong/identical match). Whole integers only.
   *
   * Negative values are used to indicate untrusted results.
   * @format int32
   * @min 0
   * @max 100
   * @example 70
   */
  confidenceLevel?: number;
  /** The service provider will give us a receipt, transaction id, check number, or some such that gives us a unique id on their side that we can reconcile with */
  providerCheckID?: string;
  /** Any additional notes that may relate to the state. These are returned as typed KVPs */
  resultNotes?: KeyValuePairObject[];
  /**
   * Check state for an individual data point
   * - "UNCHECKED": Check has not yet been performed
   * - "NOT_SUPPORTED": the requested check type is not supported by this connector.
   * - "CHECKING": Checks are underway.
   * - "UNPROCESSABLE": The data supplied was unprocessable.
   * - "NO_MATCH": All checks complete, no records found that matched the details supplied
   * - "CHECKED_PARTIAL_SUCCESS": All checks complete, but only some succeeded.
   * - "CHECKED_SUCCESS_WITH_NOTES": All checks complete, but there are some notes (e.g. PEP or sanctions).
   * - "CHECKED_SUCCESS_CLEAR": All checks complete, no additional notes
   * - "CHECKED_FAILED": All checks complete, but all failed.
   */
  resultState?: EnumCheckResultState;
  /**
   * Only supplied in a summary result. Used to indicate the ovall risk score for the entity at this point in time, based on configurable rules.
   *
   * Some examples might include:
   *
   *   * Current level of ID checks passed
   *   * Device ID scores
   *   * Current PEP/Sanctions/etc checks
   *   * Jurisdictional risk based on addresses, documents and other KVPs
   *   * Fraud check results
   *
   * In this case a higher score is a bad thing. General rule of thumb:
   *
   *   * 0 - 30 = Low Risk
   *   * 31 - 50 = Medium Risk
   *   * 50 - 75 = High Risk
   *   * 75+ = Unacceptable
   * @min 0
   * @max 100
   * @example 75
   */
  riskLevel?: number;
}

/** All valid customers get a puppy. Otherwise, no puppy for you! */
export interface PuppyObject {
  asknicely1?: string;
  asknicely2?: string;
  asknicely3?: string;
  asknicely4?: string;
  asknicely5?: string;
  asknicely6?: string;
  asknicely7?: string;
  /**
   * Server version indication
   * @example "2af478ed"
   */
  commit?: string;
  /**
   * @default true
   * @example true
   */
  puppy: boolean;
}

export interface Registries {
  abr?: Abr;
}

export interface RegulatoryInformation {
  licence_details?: string;
  licence_number?: string;
  licence_verified?: boolean;
  regulatory_body?: string;
}

export interface ReportCreditReport {
  /**
   * Court Actions
   * CreditorWatch aggregate data from courts around Australia to provide a summary of court actions against an entity. When available, details of the action include location, case number, state, plaintiff, nature of the claim, action type and dollar amount.
   */
  courtJudgements?: CourtJudgement[];
  /**
   * Credit Enquiries
   * Credit enquiries provide an indication of the number of times an entity's credit file has been accessed.
   */
  creditEnquiries?: number;
  /**
   * Insolvency Notices
   * Insolvency and other published notices are provided by ASIC.
   * These published notices provide details on external administrations, winding up applications (voluntary or by a court) and proposed company deregistrations, amongst other things.
   * The notices contain important contact details and dates for creditors.
   * These notices are provided directly from the ASIC insolvency notices website.
   * If you require further information, visit:
   *
   *   https://insolvencynotices.asic.gov.au.
   */
  insolvencyNotices?: InsolvencyNotice[];
  /** Loans */
  loans?: Loan[];
  /**
   * Mercantile Enquiries
   * A Mercantile enquiry is an indication that a mercantile agency (or debt collection agency) has conducted an enquiry on this entity for the purpose of debt collection.
   */
  mercantileEnquiries?: MercantileEnquiry[];
  /**
   * Payment Defaults
   * A default indicates that the debtor has failed to make a payment for goods or services. Payment Defaults are unique to CreditorWatch and  can have one of three statuses:
   *
   *   - outstanding
   *   - partial payment
   *   - settled.
   */
  paymentDefaults?: PaymentDefault[];
}

export interface ReportCreditScore {
  creditScore?: {
    abn?: string;
    acn?: string;
    description?: string;
    itemCode?: string;
    scores?: CreditScoreObject;
  };
}

/** The results of the available report. */
export interface ReportDetail {
  availableFormats?: string;
  /** The expected delivery time is in minutes. The report will be available for download once this period is elapsed */
  expectedDeliveryTimeMinutes?: number;
  /**
   * Set of key-value pairs that provide arbitrary additional type-specific data. You can use these fields to store external IDs, or other non-identity related items if you need to.
   * If updating an existing entity, then existing values with the same name will be overwritten. New values will be added.
   *
   * See here for more information about possible values you can use:
   *   https://apidocs.frankiefinancial.com/docs/key-value-pairs
   */
  extraData?: KeyValuePairObject[];
  /** The name of the service provider that generated the report. */
  provider?: string;
  /** If the report provider generated an ID or recipt number for the report, it goes here */
  reportCode?: string;
  /** The title of the requested report */
  reportTitle?: string;
}

export interface ReportPaymentPredictor {
  industryPaymentPredictor?: IndustryPaymentPredictor;
  paymentPredictorHistory?: PaymentPredictorHistoryItem[];
  paymentPredictorStats?: TableOfStat[];
}

/**
 * Unique identifier for every request. Can be used for tracking down answers with technical support.
 *
 * Uses the ULID format (a time-based, sortable UUID)
 *
 * Note: this will be different for every request.
 * @format ulid
 * @example "01BFJA617JMJXEW6G7TDDXNSHX"
 */
export type RequestIDObject = string;

/**
 * When sent a notification or alert, you'll call the /retrive/response/{requestId} function
 *
 * This will return the original response
 */
export interface RetrievedResponseObject {
  /**
   * This will be the HTTP response code that was returned originally (200, 404, etc).
   *
   * In the case where you're requesting the result of a callback (previously backgrounded call), then this is the response that would have been sent, had you waited for the call to finish.
   */
  origHTTPstatus?: number;
  /** This is a placeholder field. It will actually be a JSON object that is the payload that would have been returned (or was returned) in the original request. You'll need to process this as if it were the original response, and act accordingly. */
  payload?: string;
}

/** the document to be attached and optionally scanned (if supported) */
export interface ScannedDocumentObject {
  /**
   * Used as a way of indicating to the service that the original scanned document is not to be kept after it has been processed. We will retain any metadata and the results of processing (where required by regulation or the customer), but the original file uploaded will eventually be remnoved once processing is complete.
   *
   * If ScanDelete is set to true, any call with /full at the end will still not return the file contents, regardless of whether the file has been deleted yet (the deletion process is a background task that can take a few minutes to occur)
   */
  ScanDelete?: boolean;
  /**
   * The date and time the scan was created. Not the date of the scanned document, which should be in the idIssued attribute of the document that owns this scan.
   * @format date-time
   * @example "2020-06-02"
   */
  scanCreated?: string;
  /**
   * Base64 encoded string of a photo or scan of an ID document to be verified. If supplied and of a supported type, the Frankie service will attempt to use OCR tech to extract the data from the scanned doc/image.
   *
   * In a result message, this field will be left blank, unless the "full" action is requested.
   * @format byte
   * @example "VGhpcyBpcyBzb21lIGV4YW1wbGUgZGF0YS4gV29vLCBJIGJldCB5b3UgcmVncmV0IHRoZSB0aW1lIHlvdSB3YXN0ZWQgZGVjb2RpbmcgdGhpcywgaHVoPw=="
   */
  scanData?: string;
  /**
   * The reason why the scanData in a response is missing.
   * - "NORMAL": The scanData was retrieved and is included. If it is empty then it was never provided or was provided empty.
   * - "EXCLUDED": The retrieval request was not for 'full' data, or the object has 'ScanDelete' set so the scanData is not included
   * - "FAILED": The scanData could not be retrieved from the secure document store.
   *
   * The enumScanDataRetrievalState will not usually be set in a request. If a ScannedDocumentObject in a response has a 'FAILED' retrieval state then that object should not be sent back in a future possible update. It should either be omitted or the original data should be resent if it is available from another source. However it is safe to send the object in an update with the state received in a response. Any state other than 'NORMAL' (or '') will cause the blank scanData to be ignored, but other fields in the object will be updated if needed.
   */
  scanDataRetrievalState?: EnumScanDataRetrievalState;
  /**
   * When an document scan is created/uploaded, it is assigned a scanDocId. You'll see this in a successful response or successfully accepted response. This can then be referenced in subsequent calls if you're uploading more/updated data.
   * @format uuid
   * @example "84a9a860-68ae-4d7d-9a53-54a1116d5051"
   */
  scanDocId?: string;
  /**
   * If you're uploading a file where it's important to keep the original filename, then you can provide that here. Otherwise the Frankie service will assign an arbitrary name based on the scanDocIdand an extension based on the MIME type
   * @example "Important Document - ID1234567.pdf"
   */
  scanFilename?: string;
  /** The standard MIME type of the file being uploaded. We'll double-check to be certain, but this can help speed things up */
  scanMIME?: EnumMIMEType;
  /**
   * If uploading multiple pages - it's handy to keep a track of these. There is no enforcement of these numbers at all. You can have 10 page 1's and a page 29 if you wish.
   * @min 0
   * @example 1
   */
  scanPageNum?: number;
  /** Describes if a scan is of the "F"ront or "B"ack of an ID. If not supplied, Front is always assumed. */
  scanSide?: EnumScanSide;
  /**
   * Valid ID document scan general types.
   * - "PHOTO": Any photo
   * - "VIDEO": Any video
   * - "AUDIO": Any audio
   * - "PDF":   PDF or PS (may contain text, images or both)
   * - "DOC":   Word doc, RTF, etc
   * - "ZIP":   Any compressed file(s)
   */
  scanType?: EnumScanType;
}

/** Contains the results (if any) of the KYC and AML/Media checks performed */
export interface ScreeningResult {
  /** The results of any AML/Adverse media screening undertaken */
  aml_result?: AMLScreeningResult;
  /** The results of a safe harbour KYC check of an individual */
  kyc_result?: KYCScreeningResult;
}

/** Provides details of the confidence level we have that this is the item we're looking for. */
export interface SearchResultConfidenceObject {
  /**
   * Defines how close a match we were able to make based on search results.
   * - "LOW": The item does match the minimum criteria given, but is potentially one of a number of possible hits
   * - "MEDIUM": The item matches multiple search criteria, but there is still some potential ambiguity with other hits
   * - "HIGH": Matches all given search criteria, but there were other potential hits
   * - "DEFINITE": Was the only item to match all given search criteria.
   */
  level?: EnumSearchResultConfidence;
  /** Free-form list of descriptions around any partial matches */
  notes?: string[];
  /**
   * Numeric score on a scale of 0 (none) to 100 (as certain as possible) on which the confidence level is based. Whole integers only.
   * @format int32
   * @min 0
   * @max 100
   * @example 70
   */
  score?: number;
}

/** Details of a share capital as returned from an ASIC report. */
export interface ShareCapitalObject {
  amount?: string;
  amountDue?: string;
  /** This will contain a specific code assigned to the class of shares. */
  classCode?: string;
  /** This is a more descriptive field of the class of shares. */
  classTitle?: string;
  currency?: string;
  /** This field can be used classify and identify the nature of supplementary information related to the specific class of shares. */
  detailsType?: string;
  /** This is the specific identification number of the document linked to the class of shares. */
  documentNumber?: string;
  /** This provides further information regarding the document number linked to the class of shares. */
  documentNumberQualifier?: string;
  /** The actual number of shares issued in the specific class type. */
  numberOfShares?: number;
  /** This denotes the total monetary value that is due and payable in this particular class of shares. */
  totalAmountDueAndPayable?: number;
  /** This denotes the total monetary value that is invested in this particular class of shares. */
  totalAmountPaid?: number;
}

/**
 * Describes a collection of shares of a particular type and their attributes,
 * One or more ShareStructures make up a company's shares that are then parcelled out as shareholdings.
 */
export interface ShareStructureObject {
  amountDue?: number;
  amountPaid?: number;
  classCode?: string;
  classTitle?: string;
  docNumber?: string;
  docNumberQualifier?: string;
  sharesIssued?: number;
  status?: string;
}

export interface ShareholderDetails {
  address?: string;
  allInfo?: string;
  currency?: string;
  id?: string;
  name?: string;
  nationality?: string;
  nominalValue?: string;
  percentage?: string;
  shareClass?: string;
  /** @format int64 */
  shareCount?: number;
  shareType?: string;
  shareholderType?: string;
  /** @format int64 */
  totalShareCount?: number;
  /** @format int64 */
  totalShareValue?: number;
  /** @format int64 */
  totalShares?: number;
}

export interface ShareholderSummary {
  shareCapital?: string;
}

/** Details of a shareholding as returned from an ASIC report. */
export interface ShareholdingObject {
  allInfo?: string;
  beneficiallyOwned?: boolean;
  currency?: string;
  docNumber?: string;
  docNumberQualifier?: string;
  fullyPaid?: boolean;
  holderType?: string;
  jointHolding?: boolean | null;
  members?: string[];
  nominalValue?: string;
  nonBeneficiallyOwned?: boolean | null;
  numberHeld?: number;
  percentageHeld?: BeneficialOwnerObjectPercentageHeld;
  shareCapitalClassCode?: string;
  totalShareCount?: number;
  totalShareValue?: number;
  totalShares?: number;
  type?: string;
}

/** A request to create or update an association between an entity and a parent organisation. */
export interface StaticEntityAssociationRequest {
  /**
   * Identity of the party that requested this association. For requests via the Frankie portal this
   * will default to the portal username. Otherwise, if not given, this will be your company name.
   */
  addedBy?: string;
  /** Describes all of the data being used to verify an entity. */
  entity?: EntityObject;
  /**
   * The details of the entity's ownership of the organisation.
   *
   * The percentage held is optional, but at least one of role and percentage held must be included. If the percentage held
   * is null or omitted, then any existing ownership for the entity will be retained. If the percentage held is given, then
   * the percentage held for the entity will be replaced, not merged.
   *
   * The currently assigned ownership percentages can be found in the business ownership query results, in the ownership details for the organisation, in the
   * staticBeneficialOwners array.
   */
  percentageHeld?: {
    beneficially?: number;
    jointly?: number;
    nonBeneficially?: number;
  };
  /**
   * The roles are optional in an association request, but at least one of roles and percentage held must be included. If the roles object is omitted, then
   * any existing roles for the entity will be retained. To delete all roles for the entity use an empty roles array ([]). When updating roles, all the current
   * roles for the entity must be included. They can be obtained from the business ownership query results, by going through the officers array in the ownership
   * details for the organisation and extracting records with the ID of the entity and a non-blank 'addedBy' field.
   */
  roles: StaticEntityAssociationRole[];
}

/** The positive result of an entity association change request. */
export interface StaticEntityAssociationResponse {
  /** Describes all of the data being used to verify an entity. */
  entity?: EntityObject;
  percentageHeld?: BeneficialOwnerObjectPercentageHeld;
  /**
   * Unique identifier for every request. Can be used for tracking down answers with technical support.
   *
   * Uses the ULID format (a time-based, sortable UUID)
   *
   * Note: this will be different for every request.
   */
  requestId?: RequestIDObject;
  /** The current entity association roles. */
  roles?: StaticEntityAssociationRole[];
}

/** A role describing the association between an entity and a parent organisation */
export interface StaticEntityAssociationRole {
  /**
   * A short type codes for the role, f.ex "DR" (Director), "SR" (Secretary), "OTH" (Other).
   * There can only be one association role of each type for each associated entity in an organisation. The types must be between from two to four uppercase letters and digits.
   * Note that some types (including "DR" and "SR") have special meanings when it comes to reporting, identity checks and risk calculations, so use them with caution.
   */
  type?: string;
  /**
   * A description of the type of association between the entity and the organisation. The description must not be blank. The description for each type can include multiple titles if required.
   *
   * "roles": [
   *     {
   *         "type": "DR",
   *         "description": "CEO & CFO"
   *     },
   *         "type": "OTH",
   *         "description": "Wunderkind"
   *     }
   * ]
   */
  typeDescription?: string;
}

/** If a company is listed, then this object will be populated with whatever data has been determined. */
export interface StockExchangeData {
  approved_exchange?: boolean;
  exchange?: string;
  exchange_ticker?: string;
  supporting_document_links?: string[];
  supporting_evidence_in_pdf?: boolean;
}

/** The data that was initially supplied to check in the batch file */
export interface SuppliedData {
  /**
   * Australian Business Number - MUST be 11 digits. Can be supplied in lieu of the ACN
   * @example 99001234321
   */
  abn: string;
  /**
   * Australian Company Number on file - MUST be zero left-padded to 9 digits
   * @example 342225
   */
  acn: string;
  /**
   * The type of company on file. Use the ABR's company types, as given here:
   *
   * https://abr.business.gov.au/Documentation/ReferenceData (entity types)
   */
  company_type: 'PRV' | 'PUB';
  /**
   * Your reference number for this company
   * @example "WBC000ABC123"
   */
  customer_reference: string;
  /**
   * The name of the company to be verified
   * @example "Worldwide Widget Pty. Ltd."
   */
  name: string;
}

/**
 * The results of the comparison of the supplied data (above) to that found on file with the ABR.
 * If the value is missing, then the comparison was not run. There will likely be an issue highlighted in the issues_list
 */
export interface SuppliedDataMatches {
  /**
   * Did the supplied ACN match the ACN on file with the ABR? Only truly relevant if ABN is supplied as well.
   * @example true
   */
  matched_acn: boolean;
  /**
   * Did the supplied company type match the company type on file with the ABR?
   * @example true
   */
  matched_company_type: boolean;
  /**
   * Did the supplied name match (or closely match) the name on file with the ABR
   * @example true
   */
  matched_name: boolean;
}

export interface TableOfStat {
  /** @format float */
  averageBalance?: number;
  /** @format float */
  averageOverdue?: number;
  /** @format float */
  highestCreditExposureCombinedSuppliers?: number;
  /** @format float */
  highestCreditExposureSingleSupplier?: number;
  /** @format float */
  highestOverdueCreditExposure?: number;
  numberOfTradeLines?: number;
}

export interface TradeHistory {
  /** @format float */
  current?: number;
  /** @format date-time */
  extractedDate?: string;
  month?: number;
  /** @format float */
  overdue1To30?: number;
  /** @format float */
  overdue30To60?: number;
  /** @format float */
  overdue60To90?: number;
  /** @format float */
  overdueOver90?: number;
  /** @format float */
  theTotal?: number;
  tradeLines?: number;
}

export interface UBOResponse {
  /**
   * If an ASIC search was conducted, what was the date/time in RFC-3339 format
   * @format date-time
   * @example "2016-08-29T09:12:33.001Z"
   */
  asic_search_timestamp?: string;
  /** The details of the company being checked */
  business_details?: BusinessDetails;
  /** Contains the results (if any) of the KYC and AML/Media checks performed */
  business_screening_result?: ScreeningResult;
  /**
   * Only populated if there was an error whilst trying to initiate the UBO check.
   *
   * Signifies that no other result data will be supplied
   */
  error_message?: string;
  /** A list of issues encountered whilst processing the UBO request and subsequent KYC/AML checks. */
  issues_list?: IssueListItems[];
  /**
   * A list of organisations who have been determined to own a (potentially) beneficial interest the company.
   *
   * The presence of non_individual_beneficial_owners indicates that not all individual ultimate beneficial owners could be determined.
   * Examples may include public companies, listed companies, foreign companies, corporate trusts or other entities whose beneficial owners are not readily available.
   */
  non_individual_beneficial_owners?: NonIndividualBeneficialOwner[];
  /** A list of individuals who serve as current office holders the company */
  officeholders?: IndividualData[];
  /** The data that was initially supplied to check in the batch file */
  supplied_data: SuppliedData;
  /**
   * The results of the comparison of the supplied data (above) to that found on file with the ABR.
   * If the value is missing, then the comparison was not run. There will likely be an issue highlighted in the issues_list
   */
  supplied_data_matches?: SuppliedDataMatches;
  /** A list of individuals who have been determined to own, either directly or indirectly, 25% or more of the company */
  ultimate_beneficial_owners?: IndividualData[];
}

export interface USOfficerDTO {
  Address?: string;
  BusinessAddress?: ArrayOfString1;
  Date?: string;
  MailingAddress?: string;
  Name?: string;
  Title?: string;
  Type?: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  'body' | 'method' | 'query' | 'path'
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (
    securityData: SecurityDataType | null
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string =
    'https://api.kycaml.uat.frankiefinancial.io/compliance/v1.2';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(
      typeof value === 'number' ? value : `${value}`
    )}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => 'undefined' !== typeof query[key]
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key)
      )
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== 'string'
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
            ? JSON.stringify(property)
            : `${property}`
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${
        queryString ? `?${queryString}` : ''
      }`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { 'Content-Type': type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === 'undefined' || body === null
            ? null
            : payloadFormatter(body),
      }
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Frankie Financial API
 * @version 1.15.3
 * @baseUrl https://api.kycaml.uat.frankiefinancial.io/compliance/v1.2
 * @contact <dev-support@frankiefinancial.com>
 *
 * ------
 * This API allows developers to integrate the Frankie Financial Compliance Utility into their applications. The API allows:
 *   - Checking name, address, date of birth against national databases
 *   - Validating Australian driver's licences, passports, medicare, visas and other Australian national ID documents
 *   - Validating Australian electricity bills
 *   - Validating NZ driver's licences
 *   - Validating Chinese bank cards and national ID card
 *   - Validating International passports and national ID documents
 *   - PEP, Sanctions, Watchlist and adverse media checking
 *   - Australian visa checks
 *   - Fraud list and fraud background checks
 *   - ID validation and selfie check comparisons.
 *
 * ------
 *
 * KYB specific services
 *
 *   - Query organisation ownership
 *   - Perform KYC & AML checks on shareholders, beneficial owners and office bearers.
 *   - Query credit score and credit reports
 *   - International company searches
 *   - International company profiles
 *
 * ------
 * The full version of this documentation along with supplemental articles can be found here:
 *   - https://apidocs.frankiefinancial.com/
 *
 * ------
 * Sandbox base URL is:
 *   - https://api.kycaml.uat.frankiefinancial.io/compliance/v1.2
 *
 *   - All calls are the same as production, only with test data. You can download the latest test data here: https://apidocs.frankiefinancial.com/docs/test-data
 *
 *   - Full Swagger definition, along with test data for playing in the sandbox can be obtained once initial commercial discussions have commenced.
 *
 *   - Production and optional UAT access will be opened up only to those with a signed commercial contract.
 *
 * ------
 * Contact us at hello@frankiefinancial.com to speak with a sales rep about issuing a Customer ID and Sandbox api key.
 */
export class Api<
  SecurityDataType extends unknown
> extends HttpClient<SecurityDataType> {
  business = {
    /**
     * @description Using the Company Code retrieved from the search response (see above: https://apidocs.frankiefinancial.com/reference/internationalbusinesssearch) you can pull back the details of the company. The Frankie platform will save the details of the response as an ORGANISATION type entity with the retrieved profile attached as a report which you can potentially re-retrieve later if you wish.
     *
     * @tags Business
     * @name InternationalBusinessProfile
     * @summary (International) Retrieve a business profile from any country.
     * @request POST:/business/international/profile
     * @secure
     */
    internationalBusinessProfile: (
      data: InternationalBusinessProfileCriteria,
      params: RequestParams = {}
    ) =>
      this.request<InternationalBusinessProfileResponse, ErrorObject>({
        path: `/business/international/profile`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Search for a given business name or business number across international business registers. The search will return a list of matching companies that you can then potentially query using the international profile query (see below). Each search result will have a CompanyCode that you use to retrieve the specific company details using the profile function. * Note:* This process will *not* save any details from the search results.
     *
     * @tags Business
     * @name InternationalBusinessSearch
     * @summary (International) Search for a business from any country.
     * @request POST:/business/international/search
     * @secure
     */
    internationalBusinessSearch: (
      data: InternationalBusinessSearchCriteria,
      params: RequestParams = {}
    ) =>
      this.request<InternationalBusinessSearchResponse, ErrorObject>({
        path: `/business/international/search`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Process a request for ownership details for an Australian organisation ONLY. See below for more general international queries. At a minimum, you just need to supply an ACN or ABN and we can retrieve the rest. You also have the option of supplying company name, type (as per ABR types) and both ABN/ACN and we'll attempt to verify that that data matches what is on record before attempting any further verification and validation. KYC/AML for a selection of entities associated with an organisation and/or the organisation itself can optionally be run, but not by default. To enable KYC/AML checks one or more entity categories must be provided. If such a list of entity categories is given then default checks based on configuration will be run for those categories. If a check type is also provided in the request then that type will be used for entities representing individual entities, and the AML subset of that check will be used for organisations if any. Specifying a check type without an entity category will result in an error. *NOTE:* A 202 ACCEPT response will be returned if there are full ownership details to be retrieved or there is entity verification requested. In this case results will be pushed using the Push Notification API below and you will be able to retrieve the results using the Retrieve API. If only basic ownership (profile only) is requested with no entity verification, then the result will be a 200 OK. More details on how to use this API and interpret the results can be found here: https://apidocs.frankiefinancial.com/docs/australian-business-function-overview
     *
     * @tags Business
     * @name BusinessOwnershipQuery
     * @summary (AUS Only) Create Business Entity and Query UBO
     * @request POST:/business/ownership/query
     * @secure
     */
    businessOwnershipQuery: (
      data: OwnershipQuery,
      query?: {
        /**
         * When creating a new check, we need to define the checks we wish to run. If this parameter is not supplied then the check will be based on a configured check type for each entity category.
         *
         * The checkType is make up of a comma separated list of the types of check we wish to run.
         *
         * The order is important, and must be of the form:
         *   - Entity Check (if you're running this). Choose one from the available options
         *   - ID Check (If you want this)
         *   - PEP Checks (again if you want this, choose one of the options)
         *
         * Entity Checks - One of:
         *   - "one_plus": Checks name, address and DoB against a minimum of 1 data source. (also known as a 1+1)
         *   - "two_plus": Checks name, address and DoB against a minimum of 2 independent data sources (also known as a 2+2)
         *
         * ID Checks - One of:
         *   - "id": Checks all of the identity documents, but not necessarily the entity itself independently. Use this in conjunction with a one_plus or two_plus for more.
         *
         * Fraud Checks - One or more  of:
         *   - "fraudlist": Checks to see if the identity appears on any known fraud lists. Should be run after KYC/ID checks have passed.
         *   - "fraudid": Checks external ID services to see if details appear in fraud detection services (e.g. EmailAge or FraudNet)
         *
         * PEP Checks - One of:
         *   - "pep": Will only run PEP/Sanctions checks (no identity verification)
         *   - "pep_media": Will run PEP/Sanctions checks, as well as watchlist and adverse media checks. (no identity verification)
         *
         *   * NOTE: These checks will ONLY run if either the KYC/ID checks have been run prior, or it is the only check requested.
         *
         * Pre-defined combinations (deprecated):
         *   - "full": equivalent to "two_plus,id,pep_media" or "pep_media" if the target is an organisation.
         *   - "default": Currently defined as "two_plus,id" or "pep" if the target is an organisation.
         *
         *   * NOTE: These options are now deprecated and support for these options will be eventually halted. Please specify check_types explicitly.
         *
         * Custom:
         *   - By arrangement with Frankie you can define your own KYC check type.
         *
         *   This will allow you to set the minimum number of matches for:
         *     - name
         *     - date of birth
         *     - address
         *     - government id
         *
         *   This allows for alternatives to the "standard" two_plus or one_plus (note, these can be overridden too).
         *
         * Profile:
         *   - "profile": By arrangement with Frankie you can have a "profile" check type that applies checks according to a profile that you assign to the entity from a predefined set of profiles.
         *
         *   The profile to use will be taken from the entity.entityProfile field if set, or be run through a set of configurable rules to determine which one to use.
         *
         *   Profiles act a little like the Pre-defined combinations above in that they can map to a defined list. But they offer a lot more besides, including rules for determining default settings, inbuild data aging and other configurable features.
         *   They also allow for a new result set top be returned that provides a more detailed and useful breakdown of the check/verification process.
         *
         *   Entity Profiles are the future of checks with Frankie Financial.
         * @uniqueItems true
         */
        checkType?: (
          | 'one_plus'
          | 'two_plus'
          | 'id'
          | 'fraudlist'
          | 'fraudcheck'
          | 'pep'
          | 'pep_media'
          | 'profile'
          | 'full'
          | 'default'
        )[];
        /**
         * A comma separated list that specifies the categories of entities associated with the target organisation that will be checked.
         *
         *   - organisation - Just the organisation itself.
         *   - ubos - All ultimate beneficial owners.
         *   - pseudo_ubos - Use an alternative category when an organisation has no actual UBOs. The actual category to use is defined via configuration, default is no alternative category.
         *   - nibos - Non-Individual Beneficial Owners
         *   - bos_associated - Beneficial owners that have been manually associated, rather than retrieved from registry sources
         *   - direct_owners - All direct owners of the company, both organisations and individuals, may include UBOs for for simple ownership.
         *   - officers - All officers of the company
         *   - officers_directors - All directors of the company
         *   - officers_secretaries - All secretaries of the company
         *   - officers_other - All non-director officers of the company
         *   - officers_associated - All officers of the company that were associated manually, rather than retrieved from registry sources
         *   - all - All direct and indirect owners, both organisations and individuals (including UBOs), and officers of all organisations.
         * @uniqueItems true
         */
        entityCategories?: (
          | 'organisation'
          | 'ubos'
          | 'pseudo_ubos'
          | 'nibos'
          | 'bos_associated'
          | 'direct_owners'
          | 'officers'
          | 'officers_directors'
          | 'officers_secretaries'
          | 'officers_other'
          | 'officers_associated'
          | 'all'
        )[];
        /**
         * The result level allows you to specify the level of detail returned for the entity check. You can choose summary or full.
         * @default "summary"
         */
        resultLevel?: 'summary' | 'full';
        /**
         * Should a validation check be run before the ownership query. The default is specified via configuration. The validation checks to see if the provided organisation is suitable for an ownership query by looking for the ACN in public data sources.
         * Options are:
         * - "on": Validate only when ACN is not provided. This is the typical default.
         * - "acn": Validate even if ACN is provided.
         * - "only": Like "acn" but only do validation query, don't proceed with ownership query. This option cannot be set as the default via configuration.
         * - "off": Never validate. The Ownership query will then fail if an ACN is not provided.
         */
        validation?: 'on' | 'off' | 'only' | 'acn';
        /**
         * The type of human readable report, if any, to generate based on the ownership query results.
         * Options are:
         *   - SINGLE-LEVEL-AML: ASIC report
         *   - UBO: UBO report
         */
        generateReport?: 'SINGLE-LEVEL-AML' | 'UBO';
        /**
         * Name of configured preset query parameters to use. Any individual parameters provided in the
         * request will override the same parameter in the configured preset.
         */
        preset?: string;
        /** If set to true, historical ownership data will be requested. */
        includeHistorical?: boolean;
        /**
         * If set to true, a full UBO report will not be requested.
         * Note: This param is deprecated, use ownershipMode instead.
         */
        onlyProfile?: boolean;
        /**
         * Do not load the named result objects from cache, but force them to be retrieved from an approproate service, if and when they are required.
         * Options are:
         * - abr
         * - ownership
         * @uniqueItems true
         */
        noLoad?: string[];
        /**
         * Define the ownership mode you wish to run.
         *
         * Valid ownership modes are:
         *   - full
         *   - onlyProfile
         *   - onlyUBO
         */
        ownershipMode?: 'full' | 'onlyProfile' | 'onlyUBO';
      },
      params: RequestParams = {}
    ) =>
      this.request<OrganisationCheckResponseObject, ErrorObject>({
        path: `/business/ownership/query`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description NOTE: Australian companies ONLY. Create or find and update an ORGANISATION type entity, then run the requested reports. Reports include: - Credit Report - Credit Score - Payment Predictor At a minimum, you just need to supply an ACN and/or ABN and an entity type set to ORGANISATION. Alternatively the entity ID of an existing ORGANISATION entity gan be given in the request body Note: these reports are different to the Ultimate Beneficial Owner and Business Detail requests - these reports are independent data and analysis over and above company information and verification details. You can request multiple reports to be run at once and they will be returned as a group.
     *
     * @tags Business
     * @name RunBusinessReports
     * @summary (AUS Only) Run Report(s) against a new or existing organisation entity.
     * @request POST:/business/reports
     * @secure
     */
    runBusinessReports: (
      query: {
        /**
         * Define the report(s) you wish to run.
         *
         * You can request more than one as a comma separated list.
         * Duplicates will be ignored.
         *
         * Note: These reports are different to the business details and UBO queries and are meant to provide deeper detail and background on a business or organisation.
         *
         * Current valid report types are:
         *   - creditScore
         *   - creditReport
         *   - paymentPredictor
         */
        reportTypes: string;
      },
      data: EntityObject,
      params: RequestParams = {}
    ) =>
      this.request<BusinessReportResponseDetails, ErrorObject>({
        path: `/business/reports`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description NOTE: Australian companies ONLY. Create or find and update an ORGANISATION type entity, then run the requested reports. Reports include: - Credit Report - Credit Score - Payment Predictor At a minimum, you just need to supply an ACN and/or ABN and an entity type set to ORGANISATION. Alternatively the entity ID of an existing ORGANISATION entity gan be given in the request body Note: these reports are different to the Ultimate Beneficial Owner and Business Detail requests - these reports are independent data and analysis over and above company information and verification details. You can request multiple reports to be run at once and they will be returned as a group. If a PDF report is requested then that report will be generated over time, so a temporary response with only the JSON reports will be returned and a webhook notification will be pushed later once the PDF report has been completed.
     *
     * @tags Business
     * @name RunBusinessReportsMulti
     * @summary (AUS Only) Run Report(s) against a new or existing organisation entity and produce a PDF formatted document.
     * @request POST:/business/reports/multi
     * @secure
     */
    runBusinessReportsMulti: (
      query: {
        /**
         * Define the report(s) you wish to run.
         *
         * You can request more than one as a comma separated list.
         * Duplicates will be ignored.
         *
         * Note: These reports are different to the business details and UBO queries and are meant to provide deeper detail and background on a business or organisation.
         *
         * Current valid report types are:
         *   - creditScore
         *   - creditReport
         *   - paymentPredictor
         */
        reportTypes: string;
        /** Should the report(s) also be generated as a PDF document. */
        pdf?: boolean;
      },
      data: EntityObject,
      params: RequestParams = {}
    ) =>
      this.request<BusinessReportResponseDetails, ErrorObject>({
        path: `/business/reports/multi`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create an entity with the provided details, then associated it with a parent organisation. The referenced parent entity must be of type ORGANISATION and an ownership query must have been previously completed. At least the entity name (family name for individuals, registered name for organisations) must be provided in entity. At least one of role or percentage held must be in the request. If either is null or omitted, then any existing details will be retained. If either detail is given, the it will be replaced, not merged.
     *
     * @tags Business
     * @name CreateAssociateEntity
     * @summary (AUS Only) Make a new entity a direct associated entity of a parent organisation.
     * @request POST:/business/{entityId}/associateEntity/new
     * @secure
     */
    createAssociateEntity: (
      entityId: string,
      data: StaticEntityAssociationRequest,
      params: RequestParams = {}
    ) =>
      this.request<StaticEntityAssociationResponse, ErrorObject>({
        path: `/business/${entityId}/associateEntity/new`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update an entity with the provided details, then associated it with a parent organisation, or update any existing association. To use an existing entity, and not update it, either omit the entity field, use null, or just provide an entity object that contains only the entity ID, which must match the one given in the request URL. At least the entity name (family name for individuals, registered name for organisations) must be present in the entity after any update. The referenced parent entity must be of type ORGANISATION and an ownership query must have been previously completed. At least one of role or percentage held must be in the request. If either is null or omitted, then any existing details will be retained. If either detail is given, the it will be replaced, not merged.
     *
     * @tags Business
     * @name UpdateAssociateEntity
     * @summary (AUS Only) Make an existing entity (otherId) a direct associated entity of a parent organisation (entityId), or update an existing association.
     * @request POST:/business/{entityId}/associateEntity/{otherId}
     * @secure
     */
    updateAssociateEntity: (
      entityId: string,
      otherId: string,
      data: StaticEntityAssociationRequest,
      params: RequestParams = {}
    ) =>
      this.request<StaticEntityAssociationResponse, ErrorObject>({
        path: `/business/${entityId}/associateEntity/${otherId}`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Remove the association between the two given entities. If the association doesn't exist an error will be returned.
     *
     * @tags Business
     * @name DeleteEntityAssociation
     * @summary (AUS Only) Remove a previously created association between an entity (otherId) and a parent organisation (entityId).
     * @request DELETE:/business/{entityId}/associateEntity/{otherId}
     * @secure
     */
    deleteEntityAssociation: (
      entityId: string,
      otherId: string,
      params: RequestParams = {}
    ) =>
      this.request<BasicStatusResultObject, ErrorObject>({
        path: `/business/${entityId}/associateEntity/${otherId}`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieve results from a previous UBO query along with the current KYC/AML results (if any) for associated entities. *NOTE:* This will only return check details for an Australian Organisation that has previously called one of the following calls: * Create Business and Query UBO call (https://apidocs.frankiefinancial.com/reference/businessownershipquery) or * Run KYC/AML Checks on Organisation (https://apidocs.frankiefinancial.com/reference/checkorganisation) More details on how to use this API and interpret the results can be found here: https://apidocs.frankiefinancial.com/docs/australian-business-function-overview
     *
     * @tags Business
     * @name QueryOwnershipChecks
     * @summary (AUS Only) Retrieve previous UBO query results
     * @request GET:/business/{entityId}/checks
     * @secure
     */
    queryOwnershipChecks: (entityId: string, params: RequestParams = {}) =>
      this.request<OrganisationCheckResponseObject, ErrorObject>({
        path: `/business/${entityId}/checks`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Lists documents available for order on the entity. This currently only supports entities created through /business/international/profile. (https://apidocs.frankiefinancial.com/reference/internationalbusinessprofile) For further details, see https://apidocs.frankiefinancial.com/docs/getting-a-list-of-documents
     *
     * @tags Business
     * @name BusinessDocumentCatalogue
     * @summary (International) List available documents in catalogue
     * @request GET:/business/{entityId}/list
     * @secure
     */
    businessDocumentCatalogue: (entityId: string, params: RequestParams = {}) =>
      this.request<BusinessReportOrderListResponse, ErrorObject>({
        path: `/business/${entityId}/list`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieve all the parent associations for an Individual or a Business
     *
     * @tags Business
     * @name QueryParentAssociations
     * @summary (AUS Only) Retrieve all the parent associations for an Individual or a Business
     * @request GET:/business/{entityId}/parentAssociations
     * @secure
     */
    queryParentAssociations: (
      entityId: string,
      query?: {
        /** Depth to which we need to retrieve parent entities. Values could be "FULL" or an integer. This param is optional. Default depth is FULL. */
        resultLevel?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<ParentAssociationsQueryResult, ErrorObject>({
        path: `/business/${entityId}/parentAssociations`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get the status of a previously ordered business report for an entity. To fetch the status and details you just provide the requestID and the entityID.
     *
     * @tags Business
     * @name OrderBusinessDocumentStatus
     * @summary (International) Get status of document order
     * @request GET:/business/{entityId}/report
     * @secure
     */
    orderBusinessDocumentStatus: (
      entityId: string,
      query: {
        /**
         * The requestId that was received when ordering a report
         * @format ulid
         */
        requestId: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<BusinessReportOrderStatus, ErrorObject>({
        path: `/business/${entityId}/report`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Orders a document relevant to the entity. To discover what documents are available, you should list document catalogue first. On success, will return a 202 response. Frankie systems will poll the provider in the background for the document and attach it to the entity once it is ready, sending you a push notification on completion (if configured). For further details of this process and document retrieval, see https://apidocs.frankiefinancial.com/docs/order-a-document
     *
     * @tags Business
     * @name OrderBusinessDocument
     * @summary (International) Order document from catalogue
     * @request POST:/business/{entityId}/report
     * @secure
     */
    orderBusinessDocument: (
      entityId: string,
      data: DummyA0110,
      params: RequestParams = {}
    ) =>
      this.request<AcceptedResultObject, ErrorObject>({
        path: `/business/${entityId}/report`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Manage subscription to continuous monitoring of business details and ownership (AUS Only). To subscribe or add an entity to the watch list set the entity flag to “true”. To unsubscribe or remove an entity from the watch list the entity flag needs to be set to “false”. All new entities created are by default added to the watch list with the flag set as true.
     *
     * @tags Business
     * @name BusinessOwnershipSubscription
     * @summary (AUS Only) Subscribe or unsubscribe to continuous monitoring of business details and ownership.
     * @request POST:/business/{entityId}/subscription
     * @secure
     */
    businessOwnershipSubscription: (
      entityId: string,
      query: {
        /** Set the value of an entity flag. */
        set: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<BusinessSubscriptionResponseObject, ErrorObject>({
        path: `/business/${entityId}/subscription`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Run KYC/AML for a selection of entities associated with an organisation and/or the organisation itself based on a previous ownership query. By default AML will be checked for just the organisation itself. If a list of entity categories is given then default checks based on configuration will be run for those categories. If a check type is also provided in the request then that type will be used for entities representing individual entities, and the AML subset of that check will be used for organisations if any. If no ownership query has been run, then this operation will return an error. *NOTE:* This will only return check details for an Australian Organisation that has previously called: * Create Business and Query UBO call (https://apidocs.frankiefinancial.com/reference/businessownershipquery)
     *
     * @tags Business
     * @name CheckOrganisation
     * @summary (AUS Only) Run KYC/AML Checks on Organisation and/or Associated Individuals.
     * @request POST:/business/{entityId}/verify
     * @secure
     */
    checkOrganisation: (
      entityId: string,
      query?: {
        /**
         * When creating a new check, we need to define the checks we wish to run. If this parameter is not supplied then the check will be based on a configured check type for each entity category.
         *
         * The checkType is make up of a comma separated list of the types of check we wish to run.
         *
         * The order is important, and must be of the form:
         *   - Entity Check (if you're running this). Choose one from the available options
         *   - ID Check (If you want this)
         *   - PEP Checks (again if you want this, choose one of the options)
         *
         * Entity Checks - One of:
         *   - "one_plus": Checks name, address and DoB against a minimum of 1 data source. (also known as a 1+1)
         *   - "two_plus": Checks name, address and DoB against a minimum of 2 independent data sources (also known as a 2+2)
         *
         * ID Checks - One of:
         *   - "id": Checks all of the identity documents, but not necessarily the entity itself independently. Use this in conjunction with a one_plus or two_plus for more.
         *
         * Fraud Checks - One or more  of:
         *   - "fraudlist": Checks to see if the identity appears on any known fraud lists. Should be run after KYC/ID checks have passed.
         *   - "fraudid": Checks external ID services to see if details appear in fraud detection services (e.g. EmailAge or FraudNet)
         *
         * PEP Checks - One of:
         *   - "pep": Will only run PEP/Sanctions checks (no identity verification)
         *   - "pep_media": Will run PEP/Sanctions checks, as well as watchlist and adverse media checks. (no identity verification)
         *
         *   * NOTE: These checks will ONLY run if either the KYC/ID checks have been run prior, or it is the only check requested.
         *
         * Pre-defined combinations (deprecated):
         *   - "full": equivalent to "two_plus,id,pep_media" or "pep_media" if the target is an organisation.
         *   - "default": Currently defined as "two_plus,id" or "pep" if the target is an organisation.
         *
         *   * NOTE: These options are now deprecated and support for these options will be eventually halted. Please specify check_types explicitly.
         *
         * Custom:
         *   - By arrangement with Frankie you can define your own KYC check type.
         *
         *   This will allow you to set the minimum number of matches for:
         *     - name
         *     - date of birth
         *     - address
         *     - government id
         *
         *   This allows for alternatives to the "standard" two_plus or one_plus (note, these can be overridden too).
         *
         * Profile:
         *   - "profile": By arrangement with Frankie you can have a "profile" check type that applies checks according to a profile that you assign to the entity from a predefined set of profiles.
         *
         *   The profile to use will be taken from the entity.entityProfile field if set, or be run through a set of configurable rules to determine which one to use.
         *
         *   Profiles act a little like the Pre-defined combinations above in that they can map to a defined list. But they offer a lot more besides, including rules for determining default settings, inbuild data aging and other configurable features.
         *   They also allow for a new result set top be returned that provides a more detailed and useful breakdown of the check/verification process.
         *
         *   Entity Profiles are the future of checks with Frankie Financial.
         * @uniqueItems true
         */
        checkType?: (
          | 'one_plus'
          | 'two_plus'
          | 'id'
          | 'fraudlist'
          | 'fraudcheck'
          | 'pep'
          | 'pep_media'
          | 'profile'
          | 'full'
          | 'default'
        )[];
        /**
         * A comma separated list that specifies the categories of entities associated with the target organisation that will be checked.
         *
         *   - organisation - Just the organisation itself.
         *   - ubos - All ultimate beneficial owners.
         *   - pseudo_ubos - Use an alternative category when an organisation has no actual UBOs. The actual category to use is defined via configuration, default is no alternative category.
         *   - nibos - Non-Individual Beneficial Owners
         *   - bos_associated - Beneficial owners that have been manually associated, rather than retrieved from registry sources
         *   - direct_owners - All direct owners of the company, both organisations and individuals, may include UBOs for for simple ownership.
         *   - officers - All officers of the company
         *   - officers_directors - All directors of the company
         *   - officers_secretaries - All secretaries of the company
         *   - officers_other - All non-director officers of the company
         *   - officers_associated - All officers of the company that were associated manually, rather than retrieved from registry sources
         *   - all - All direct and indirect owners, both organisations and individuals (including UBOs), and officers of all organisations.
         * @uniqueItems true
         */
        entityCategories?: (
          | 'organisation'
          | 'ubos'
          | 'pseudo_ubos'
          | 'nibos'
          | 'bos_associated'
          | 'direct_owners'
          | 'officers'
          | 'officers_directors'
          | 'officers_secretaries'
          | 'officers_other'
          | 'officers_associated'
          | 'all'
        )[];
        /**
         * The result level allows you to specify the level of detail returned for the entity check. You can choose summary or full.
         * @default "summary"
         */
        resultLevel?: 'summary' | 'full';
        /**
         * The type of human readable report, if any, to generate based on the ownership query results.
         * Options are:
         *   - SINGLE-LEVEL-AML: ASIC report
         *   - UBO: UBO report
         */
        generateReport?: 'SINGLE-LEVEL-AML' | 'UBO';
        /**
         * Name of configured preset query parameters to use. Any individual parameters provided in the
         * request will override the same parameter in the configured preset.
         */
        preset?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<AcceptedEntityResultObject, ErrorObject>({
        path: `/business/${entityId}/verify`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  document = {
    /**
     * @description Create a document object. A document object can be used to simply store data around a given identity or similar document. You can attach scans, PDFs, photos, videos, etc to the object if you wish.
     *
     * @tags Document
     * @name CreateDocument
     * @summary Create New Document.
     * @request POST:/document
     * @secure
     */
    createDocument: (
      data: IdentityDocumentObject,
      params: RequestParams = {}
    ) =>
      this.request<DocumentResultObject, ErrorObject>({
        path: `/document`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Send the document to an external service to have the detailed verified. For example, we could send through the details of a drivers licence to be checked against a national database.
     *
     * @tags Document
     * @name VerifyDocument
     * @summary Create and Verify Document.
     * @request POST:/document/new/verify
     * @secure
     */
    verifyDocument: (data: DocumentVerify, params: RequestParams = {}) =>
      this.request<DocumentVerifyResultObject, ErrorObject>({
        path: `/document/new/verify`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Search for an existing document that matches the criteria supplied There are of course limits to what can be searched upon. For a document search to work, you must supply at a minimum: * idType * country * idNumber The service will return a list of matching documents with confidence levels. If you are the "owner" of the document - i.e. the same CustomerID and CustomerChildID (if relevant) - then the full details of the document will be returned, except for the contents of any attached scans. If you are not the owner of the document, then just the ID and confidence level is returned. You can still use this ID to retrieve any check results (see GET /document/{documentId}/checks) Note: At this time, we cannot perform searches on document scans. But, you can supply extraData KVPs if they're known. These will help double check search results with ambiguous results.
     *
     * @tags Document
     * @name SearchDocument
     * @summary Search For a Document !! EXPERIMENTAL !!
     * @request POST:/document/search
     * @secure
     */
    searchDocument: (
      data: IdentityDocumentObject,
      params: RequestParams = {}
    ) =>
      this.request<DocumentSearchResultObject, ErrorObject>({
        path: `/document/search`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Query the current status and details of a given documentId.
     *
     * @tags Document
     * @name QueryDocument
     * @summary Retrieve Document Details
     * @request GET:/document/{documentId}
     * @secure
     */
    queryDocument: (documentId: string, params: RequestParams = {}) =>
      this.request<DocumentResultObject, ErrorObject>({
        path: `/document/${documentId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Using a previously uploaded but incomplete document, you can optionally supply updated details (such as corrections on a previous scan), along with one or more additional ID scans (e.g. additional pages).
     *
     * @tags Document
     * @name UpdateDocument
     * @summary Update Existing Document.
     * @request POST:/document/{documentId}
     * @secure
     */
    updateDocument: (
      documentId: string,
      data: IdentityDocumentObject,
      query?: {
        /** Disable check result invalidation for this update request. */
        noInvalidate?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<DocumentResultObject, ErrorObject>({
        path: `/document/${documentId}`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Mark this document as deleted. It will then become effectively invisible to all queries, but will be available in anonymised form for a past check.
     *
     * @tags Document
     * @name DeleteDocument
     * @summary Delete Document.
     * @request DELETE:/document/{documentId}
     * @secure
     */
    deleteDocument: (documentId: string, params: RequestParams = {}) =>
      this.request<BasicStatusResultObject, ErrorObject>({
        path: `/document/${documentId}`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get the complete list of all checks that have been performed upon a given document, including the checks that have been performed by others (in those cases you just get the id, status and date run, none of the details).
     *
     * @tags Document
     * @name QueryDocumentChecks
     * @summary Retrieve Document Verification Check Details.
     * @request GET:/document/{documentId}/checks
     * @secure
     */
    queryDocumentChecks: (documentId: string, params: RequestParams = {}) =>
      this.request<DocumentChecksResultObject, ErrorObject>({
        path: `/document/${documentId}/checks`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Query the current status and details of a given documentId. Also returns all document file data, not just the metadata.
     *
     * @tags Document
     * @name QueryDocumentFull
     * @summary Retrieve Document and Scan Data
     * @request GET:/document/{documentId}/full
     * @secure
     */
    queryDocumentFull: (documentId: string, params: RequestParams = {}) =>
      this.request<DocumentResultObject, ErrorObject>({
        path: `/document/${documentId}/full`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Using a previously uploaded but potentially incomplete document, you can optionally supply updated details (such as corrections on a previous scan), along with one or more additional ID scans (e.g. additional pages). Includes a follow-on action as well initiating verification procedures immediately. Sends the updated document to an external service to have the detailed verified. For example, we could send through the details of a drivers licence to be checked against a national database.
     *
     * @tags Document
     * @name UpdateVerifyDocument
     * @summary Update and Verify Document.
     * @request POST:/document/{documentId}/verify
     * @secure
     */
    updateVerifyDocument: (
      documentId: string,
      data: DocumentVerify,
      params: RequestParams = {}
    ) =>
      this.request<DocumentVerifyResultObject, ErrorObject>({
        path: `/document/${documentId}/verify`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  entity = {
    /**
     * @description Create an entity object. An entity object can be used to simply store data around a given identity. You can attach ID documents, scans, PDFs, photos, videos, etc to the entity. Entity objects can be used to run a check, using the data held in the records.
     *
     * @tags Entity
     * @name CreateEntity
     * @summary Create New Entity.
     * @request POST:/entity
     * @secure
     */
    createEntity: (data: EntityObject, params: RequestParams = {}) =>
      this.request<EntityResultObject, ErrorObject>({
        path: `/entity`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create an entity object and if successful, obtain a token for use in an ID Validation service SDK (web or native app) At a minimum, you will need to supply: - the entity familyName. - the entity givenName For best results, you should gather the DoB, address, ID document details as well before  calling the initProcess function. SPECIAL NOTE 1: Tokens have a limited lifespan, typically only 1 hour. Make sure you've used it or you will need to create another using update version of this function. SPECIAL NOTE 2: This function will need to be followed up with a call to /entity/{id}/idvalidate/initProcess once you've collected all your data in your app/web capture process.
     *
     * @tags Entity
     * @name CreateEntityGetIdvToken
     * @summary Create Entity and Get IDV Token
     * @request POST:/entity/new/idvalidate/getToken
     * @secure
     */
    createEntityGetIdvToken: (
      data: EntityIDVDetailsObject,
      params: RequestParams = {}
    ) =>
      this.request<EntityIDVResultObject, ErrorObject>({
        path: `/entity/new/idvalidate/getToken`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create an entity object and begin the process of verification after pushing a message to a mobile number. The entity will receive a link on their mobile and will then be guided through a series of steps to capture and OCR scan their ID, and perform a selfie comparison. We'll then attempt to verify the data received and push a notification back to the calling customer. At a minimum, you will need to supply the name and a MOBILE_PHONE document type. SPECIAL NOTE: This will only ever return a 202 response if successfully accepted. You will need to ensure your account is configured for push notifications. Contact developer support to arrange this.
     *
     * @tags Entity
     * @name CreateCheckEntityPushToMobile
     * @summary Create Entity and Push Self-Verification Link
     * @request POST:/entity/new/verify/pushToMobile
     * @secure
     */
    createCheckEntityPushToMobile: (
      data: EntityCheckDetailsObject,
      params: RequestParams = {}
    ) =>
      this.request<AcceptedEntityResultObject, ErrorObject>({
        path: `/entity/new/verify/pushToMobile`,
        method: 'POST',
        body: data,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create an entity object. An entity object can be used to simply store data around a given identity. You can attach ID documents, scans, PDFs, photos, videos, etc to the entity if you wish. If the entity is successfully created, take the details and documents provided, and set about verifying them all. So for example, you might extract: * The name from the entity.name object * The address from the entity.address object * The DoB.. All documents that are attached to the entity will also be verified (if possible). You can also specify the level of detail returned using the resultLevel parameter. You can choose "summary" or "full". For the "profile" check type you can also select "simple" to only get the entity profile result. SPECIAL NOTE: A "Full" response includes details of all checks and how they map against each element, along with all the details of pep/sanctions/etc checks too. Your account also needs to be configured to support a full response too (talk to your account manager for more information). If you're not configured for full responses, we'll only return summary level data regardless.
     *
     * @tags Entity
     * @name CreateCheckEntity
     * @summary Create and Verify Entity
     * @request POST:/entity/new/verify/{checkType}/{resultLevel}
     * @secure
     */
    createCheckEntity: (
      checkType: string,
      resultLevel: 'simple' | 'summary' | 'full',
      data: EntityCheckDetailsObject,
      params: RequestParams = {}
    ) =>
      this.request<CheckEntityCheckResultObject, ErrorObject>({
        path: `/entity/new/verify/${checkType}/${resultLevel}`,
        method: 'POST',
        body: data,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Search for an existing entity that matches the criteria supplied Criteria are supplied in the form of a populated entity object, with the name/address/DoB details supplied. You can also include documents that can be used to further refine your search (see the /document/search function for minimum requirements for a document search) At an absolute minimum, you must supply one of the following combinations: * name.familyName + * name.givenNames or * name.familyName + * one identityDocument object (that meets minimum criteria) Obviously, the more data you provide, the better search results we can provide. The service will return a list of matching entities with confidence levels. If you are the "owner" of the entity - i.e. the same CustomerID and CustomerChildID (if relevant) - then the full details of the entity and any owned documents will be returned, except for the contents of any attached scans. If you are not the owner of the entity (or linked documents), then just the ID and confidence level is returned. You can still use this ID to retrieve any check results (see GET  /entity/{entityId}/checks and GET /document/{documentId}/checks) If you're operating a parent account, you can also optionally include your child accounts in the search by specifying child=true in the query parameters. Note: This functionality must be enabled by Frankie administrators. Please contact your sales representative if you wish to discuss this.
     *
     * @tags Entity
     * @name SearchEntity
     * @summary Search for Entity
     * @request POST:/entity/search
     * @secure
     */
    searchEntity: (
      data: EntityObject,
      query?: {
        /** Optionally include child accounts in your search */
        child?: boolean;
        /**
         * The type of search to score matches for.
         *
         * This parameter should not be specified unless by specific arrangement with Frankie.
         *
         * If the search type "none" is used, then no scoring will be applied and there will be no confidence level for the results.
         * @default "entity_search"
         */
        searchType?: string;
        /** Only include entity IDs in the search results, not whole entities */
        onlyEntityIds?: boolean;
        /** Limit the number of search results returned. Results may also be capped by a hard limit applied by the search service. */
        resultLimit?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<EntitySearchResultObject, ErrorObject>({
        path: `/entity/search`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Query the current status and details of a given entityId.
     *
     * @tags Entity
     * @name QueryEntity
     * @summary Retrieve Entity Details
     * @request GET:/entity/{entityId}
     * @secure
     */
    queryEntity: (
      entityId: string,
      query?: {
        /** Optionally include child accounts in your search */
        child?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<EntityResultObject, ErrorObject>({
        path: `/entity/${entityId}`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Using a previously uploaded but incomplete Entity, you can optionally supply updated details (such as corrections on a previous address), along with one or more additional ID docs/scans (e.g. new documents to parse, etc).
     *
     * @tags Entity
     * @name UpdateEntity
     * @summary Update Existing Entity
     * @request POST:/entity/{entityId}
     * @secure
     */
    updateEntity: (
      entityId: string,
      data: EntityObject,
      query?: {
        /** Disable check result invalidation for this update request. */
        noInvalidate?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<EntityResultObject, ErrorObject>({
        path: `/entity/${entityId}`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Marks the entity as deleted in the system, and no further operations or general queries may be executed against it by the Customer. If another customer is presently relying on this data, it will still be available to them (but only in the partially anonymised form they originally had. An entity and its related data is only completely deleted from the database when either: - a) There are no more references to it (i.e. it has been DELETEd by all Customers relying on the data), and 12 months have passed. - b) The actual consumer who owns the data makes a direct request. If this occurs, then all subscribing Customers will be notified that this entity has been removed and they will need to contact them if needed in order to update their own records again.
     *
     * @tags Entity
     * @name DeleteEntity
     * @summary Delete Entity
     * @request DELETE:/entity/{entityId}
     * @secure
     */
    deleteEntity: (entityId: string, params: RequestParams = {}) =>
      this.request<BasicStatusResultObject, ErrorObject>({
        path: `/entity/${entityId}`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Internal only Update a given set of KYC and/or AML check result statuses in order to force a re-evaluation of the overall check result.
     *
     * @tags Entity
     * @name UpdateCheckClassResults
     * @summary Update Check Result States (Batch)
     * @request POST:/entity/{entityId}/check/{checkId}/{checkClass}
     * @secure
     */
    updateCheckClassResults: (
      entityId: string,
      checkId: string,
      checkClass: 'pro' | 'bcro' | 'fraudlist',
      data: CheckResultUpdateObject,
      params: RequestParams = {}
    ) =>
      this.request<CheckEntityCheckResultObject, ErrorObject>({
        path: `/entity/${entityId}/check/${checkId}/${checkClass}`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Internal only Update a given KYC or AML check result status in order to force a re-evaluation of the overall check result.
     *
     * @tags Entity
     * @name UpdateCheckClassResult
     * @summary Update Check Result State
     * @request POST:/entity/{entityId}/check/{checkId}/{checkClass}/{checkClassId}
     * @secure
     */
    updateCheckClassResult: (
      entityId: string,
      checkId: string,
      checkClass: 'pro' | 'bcro' | 'fraudlist',
      checkClassId: string,
      query: {
        /**
         * Set the new status of the Check Class (PRO/BCRO).
         * Valid values are:
         *   - "unknown"
         *   - "true_positive"
         *   - "true_positive_accept"
         *   - "true_positive_reject"
         *   - "false_positive"
         *   - "stale"
         */
        status: string;
        /** Undo a prior operation. */
        undo?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<CheckEntityCheckResultObject, ErrorObject>({
        path: `/entity/${entityId}/check/${checkId}/${checkClass}/${checkClassId}`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get the complete list of all checks that have been performed upon a given entity and its documents, including the checks that have been performed by others (in those cases you just get the id, status and date run, none of the details).
     *
     * @tags Entity
     * @name QueryEntityChecks
     * @summary Retrieve Entity Verification Check Details
     * @request GET:/entity/{entityId}/checks
     * @secure
     */
    queryEntityChecks: (
      entityId: string,
      query?: {
        /**
         * Requests that all check data (including historic) should be included in the response to a "get checks" request. This is as opposed to a filtered view where expired results are by default not included for entities that have an assigned profile.
         *
         * Note: When allData is set to true the risk and summary data of the entity are excluded as this information does not make sense in the context of a response that can include overridden and ignored check data.
         */
        alldata?: boolean;
        /** Poll for the given result type until a result is found (whether pass or fail) or the timeout (see below) is reached. If timeout is reached, a 404 will be returned. */
        awaitResult?: string;
        /** Timeout in seconds to poll for a result. Ignored if awaitResult parameter is not supplied. Defaults to 30 seconds if not supplied. Minimum of 1 second and maximum of 60 seconds is allowed. */
        timeout?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<CheckEntityCheckResultObject, ErrorObject>({
        path: `/entity/${entityId}/checks`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description This does everything an UpdateCheckEntity operation does, except actually verifying anything new. The entity update details are optional so the request body can be empty. If the body is given, then it must contain an EntityCheckDetailsObject like a normal UpdateCheckEntity operation, and the entity in the body must have the same entity ID as in the URL. The result returned is equivalent to the summary result for the UpdateCheckEntity operation.
     *
     * @tags Entity
     * @name UpdateEvaluateEntity
     * @summary Update Entity and evaluate current results and risk without running any new checks
     * @request POST:/entity/{entityId}/evaluate
     * @secure
     */
    updateEvaluateEntity: (
      entityId: string,
      data: EntityCheckDetailsObject,
      query?: {
        /** Disable check result invalidation for this update request. */
        noInvalidate?: boolean;
        /** Disable notifications for this request. */
        noNotify?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<CheckEntityCheckResultObject, ErrorObject>({
        path: `/entity/${entityId}/evaluate`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Mark the entity as blacklisted or not with the '?set=' query parameter as 'true' or 'false'.
     *
     * @tags Flag
     * @name BlacklistEntity
     * @summary Set Entity Blacklist State.
     * @request POST:/entity/{entityId}/flag/blacklist
     * @secure
     */
    blacklistEntity: (
      entityId: string,
      query: {
        /** Set the value of an entity flag. */
        set: boolean;
        /**
         * Set the reason for blacklisting.
         * Valid values are:
         *   - "NO_REASON_SUPPLIED"
         *   - "FABRICATED_IDENTITY"
         *   - "IDENTITY_TAKEOVER"
         *   - "FALSIFIED_ID_DOCUMENTS"
         *   - "STOLEN_ID_DOCUMENTS"
         *   - "MERCHANT_FRAUD"
         *   - "NEVER_PAY_BUST_OUT"
         *   - "CONFLICTING_DATA_PROVIDED"
         *   - "MONEY_MULE"
         *   - "FALSE_FRAUD_CLAIM"
         *   - "FRAUDULENT_3RD_PARTY"
         *   - "COMPANY_TAKEOVER"
         *   - "FICTITIOUS_EMPLOYER"
         *   - "COLLUSIVE_EMPLOYER"
         *   - "OVER_VALUATION_OF_ASSETS"
         *   - "FALSIFIED_EMPLOYMENT_DETAILS"
         *   - "MANIPULATED_IDENTITY"
         *   - "SYNDICATED_FRAUD"
         *   - "INTERNAL_FRAUD"
         *   - "BANK_FRAUD"
         *   - "UNDISCLOSED_DATA"
         *   - "FALSE_HARDSHIP"
         *   - "SMR_REPORT_LODGED"
         *   - "2X_SMR_REPORTS_LODGED"
         */
        reason?: string;
        /** Specify who is setting the entity as blacklisted. */
        blockedBy?: string;
        /**
         * Specify the blacklisted attribute.
         * Valid values are:
         *   - "ENTIRE_PROFILE"
         *   - "FULL_NAME"
         *   - "EMAIL_ADDRESS"
         *   - "PHONE_NUMBER"
         *   - "ID_DOCUMENT"
         *   - "MAILING_ADDRESS"
         *   - "RESIDENTIAL_ADDRESS"
         */
        attribute?: string;
        /** Specify the Id of the matching blacklisted entity or single data-point. */
        originalId?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<EntityResultObject, ErrorObject>({
        path: `/entity/${entityId}/flag/blacklist`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Resolve the state of a pair of duplicate entities with the '?set=' query parameter as 'true' or 'false'. Setting duplicate to 'true' will make entityId invisible for most purposes and otherId will continue to function as normal. Setting duplicate to 'false' means the two entities are in fact separate but similar and they will both continue to exist independently but will no longer be identified as duplicates of each other.
     *
     * @tags Flag
     * @name FlagDuplicateEntity
     * @summary Resolve Duplicate States.
     * @request POST:/entity/{entityId}/flag/duplicate/{otherId}
     * @secure
     */
    flagDuplicateEntity: (
      entityId: string,
      otherId: string,
      query: {
        /** Set the value of an entity flag. */
        set: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<EntityResultObject, ErrorObject>({
        path: `/entity/${entityId}/flag/duplicate/${otherId}`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Mark the entity as being monitored or not with the '?set=' query parameter as 'true' or 'false'. Setting this parameter to 'true' will disable ongoing monitoring. Setting this parameter to 'false' will enable ongoing monitoring.
     *
     * @tags Flag
     * @name EntityMonitoring
     * @summary Set Entity Ongoing AML Monitoring Status.
     * @request POST:/entity/{entityId}/flag/monitor
     * @secure
     */
    entityMonitoring: (
      entityId: string,
      query: {
        /** Set the value of an entity flag. */
        set: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<EntityResultObject, ErrorObject>({
        path: `/entity/${entityId}/flag/monitor`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Mark the entity as watchlisted or not with the '?set=' query parameter as 'true' or 'false'.
     *
     * @tags Flag
     * @name WatchlistEntity
     * @summary Set Entity Watchlist State.
     * @request POST:/entity/{entityId}/flag/watchlist
     * @secure
     */
    watchlistEntity: (
      entityId: string,
      query: {
        /** Set the value of an entity flag. */
        set: boolean;
        /**
         * Set the reason for watchlisting.
         * Valid values are:
         *  - "WAS_BLACKLISTED"
         */
        reason?: string;
        /** A comment describing the reason for a request. */
        comment?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<EntityResultObject, ErrorObject>({
        path: `/entity/${entityId}/flag/watchlist`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Query the current status and details of a given entityId. Also returns all attached document file data, not just the metadata. Equivalent to a get /document/{documentId}/full)
     *
     * @tags Entity
     * @name QueryEntityFull
     * @summary Retrieve Entity Details and Document Scan Data
     * @request GET:/entity/{entityId}/full
     * @secure
     */
    queryEntityFull: (
      entityId: string,
      query?: {
        /** Optionally include child accounts in your search */
        child?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<EntityResultObject, ErrorObject>({
        path: `/entity/${entityId}/full`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update an entity object and if successful, obtain a token for use in an ID Validation service SDK (web or native app) At a minimum, the entity will need to have a name. For best results, you should gather the DoB, address, ID document details as well before calling the initProcess function. SPECIAL NOTE 1: Tokens have a limited lifespan, typically only 1 hour. Make sure you've used it or you will need to create another using update version of this function. SPECIAL NOTE 2: This function will need to be followed up with a call to /entity/{id}/idvalidate/initProcess once you've collected all your data in your app/web capture process.
     *
     * @tags Entity
     * @name UpdateEntityGetIdvToken
     * @summary Update Entity and Get IDV Token
     * @request POST:/entity/{entityId}/idvalidate/getToken
     * @secure
     */
    updateEntityGetIdvToken: (
      entityId: string,
      data: EntityIDVDetailsObject,
      params: RequestParams = {}
    ) =>
      this.request<EntityIDVResultObject, ErrorObject>({
        path: `/entity/${entityId}/idvalidate/getToken`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update an entity object and if successful, start the process of downloading the captured data and processing the reports and results of the ID validation process. At a minimum, the entity will need to have a name. For best results, you should gather the DoB, address, ID document details as well before calling this initProcess function, or supply the details as part of this update. The IDV process may run various checks against the photos and videos supplied by the applicant. These check types are configured on request and can include: >- ID Validation (Document) - Looks at the picture(s) of the identity document, and does checks about image quality, as well as specific things about the id itself, such as whether it is expired or is for someone under 18. The image is also OCR'd and the OCR results are compared against the data entered for any KYC checks to make sure that it is the same document. >- Facial Photo Comparison - Compares the portrait picture of the identity document, to the “selfie” taken as part of the idv process. The selfie can be either a still photo or a live video (preferred). This checks both that the selfie taken is valid and not manipulated, and that it is a reasonable match to the picture on the identity document. The exact algorithm to determine matches and quality is dependant on the provider chosen. >- Facial Duplicate - Compares the selfie provided with previous selfies for other applicants. This check type is trying to identify based on the selfie whether this applicant has already registered under a different name and potentially with faked identification. If there is a potential match then the applicant is flagged for review.
     *
     * @tags Entity
     * @name UpdateEntityInitIdvProcess
     * @summary Update Entity and Initiate IDV Process
     * @request POST:/entity/{entityId}/idvalidate/initProcess
     * @secure
     */
    updateEntityInitIdvProcess: (
      entityId: string,
      data: EntityCheckDetailsObject,
      params: RequestParams = {}
    ) =>
      this.request<EntityIDVResultObject, ErrorObject>({
        path: `/entity/${entityId}/idvalidate/initProcess`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description ## (**ALPHA**): This endpoint is in alpha. Generate an Individual Verification Report for an entity. The report contains all the latest personal information and the check results ran on the entity. You can generate the report in two ways: Asynchronous: You receive a requestID in the response. Once the PDF is generated, a notification will be sent to your web-hook endpoint. The notification includes a downloadable URL. More info on the web-hook set up here: https://apidocs.frankiefinancial.com/docs/notifications-webhooks. Synchronous: Once the PDF is generated, you will receive a downloadable link in the response. Please note, the link expires after a configurable time. Either way, the generated report is also attached to the entity as a document object under idType “kyc-report”. The scanData is a base64 encoded blob.
     *
     * @tags Entity
     * @name EntityKycReport
     * @summary Generate Individual Verification Report
     * @request POST:/entity/{entityId}/report
     * @secure
     */
    entityKycReport: (entityId: string, params: RequestParams = {}) =>
      this.request<EntityReportResultObject, ErrorObject>({
        path: `/entity/${entityId}/report`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Internal only Add a special internal 'entity result' to superceed any previous real checks until the next one.
     *
     * @tags Entity
     * @name UpdateEntityState
     * @summary Update Entity States
     * @request POST:/entity/{entityId}/status
     * @secure
     */
    updateEntityState: (
      entityId: string,
      query?: {
        /**
         * The status of an entity.
         * Valid values are:
         *   - "wait": Waiting for new details from entity.
         *   - "fail": Manually fail the onboarding process.
         *   - "pass": Manually pass the entity. Only allowed if entity is already actually passed.
         *   - "refer": Set the entity onboarding as needing attention.
         *   - "archived": Hide entity from on onboarding.
         *   - "clear": Remove any of the above manual states as well as any manual risk.
         *   - "inactive": Hide entity and prevent any further operations on it. Cannot be cleared.
         */
        set?:
          | 'wait'
          | 'fail'
          | 'pass'
          | 'refer'
          | 'archived'
          | 'clear'
          | 'inactive';
        /**
         * The risk override setting for an entity. This value will be used until a verify result updates a real risk factor.
         * Valid values are:
         *   - "low"
         *   - "medium"
         *   - "high"
         *   - "unacceptable"
         *   - "significant"
         */
        risk?: 'low' | 'medium' | 'high' | 'unacceptable' | 'significant';
        /** A comment describing the reason for a request. */
        comment?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<CheckEntityCheckResultObject, ErrorObject>({
        path: `/entity/${entityId}/status`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update an existing entity object and begin the process of verification after pushing a message to a mobile number. The entity will receive a link on their mobile and will then be guided through a series of steps to capture and OCR scan their ID, and perform a selfie comparison. We'll then attempt to verify the data received and push a notification back to the calling customer. At a minimum, you will need to supply the name and a MOBILE_PHONE document type. If you wish to skip the detail capture and jump straight to the ID and selfie capture, the append the call with the ?phase=2 parameter. SPECIAL NOTE: This will only ever return a 202 response if successfully accepted. You will need to ensure your account is configured for push notifications. Contact developer supprt to arrange this.
     *
     * @tags Entity
     * @name UpdateCheckEntityPushToMobile
     * @summary Update Entity and Push Self-Verification Link
     * @request POST:/entity/{entityId}/verify/pushToMobile
     * @secure
     */
    updateCheckEntityPushToMobile: (
      entityId: string,
      data: EntityCheckDetailsObject,
      query?: {
        /**
         * Set the Push To Mobile phase.
         *
         * Currently supported values:
         * - 2
         */
        phase?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<AcceptedEntityResultObject, ErrorObject>({
        path: `/entity/${entityId}/verify/pushToMobile`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Take the details and documents provided in the entity, and set about verifying them all. So for example, you might extract: * The name from the entity.name object * The address from the entity.address object * The DoB.. All documents that are presently attached to the entity will also be verified (if requested) You can also specify the level of detail returned using the resultLevel parameter. You can choose "summary" or "full". For the "profile" check type you can also select "simple" to only get the entity profile result. SPECIAL NOTE: A "Full" response includes details of all checks and how they map against each element, along with all the details of pep/sanctions/etc checks too. Your account also needs to be configured to support a full response too (talk to your account manager for more information). If you're not configured for full responses, we'll only return summary level data regardless.
     *
     * @tags Entity
     * @name UpdateCheckEntity
     * @summary Update Entity and Verify Details
     * @request POST:/entity/{entityId}/verify/{checkType}/{resultLevel}
     * @secure
     */
    updateCheckEntity: (
      entityId: string,
      checkType: string,
      resultLevel: 'simple' | 'summary' | 'full',
      data: EntityCheckDetailsObject,
      query?: {
        /** Force the verification to run, overriding any data aging or past check */
        force?: boolean;
        /** Disable check result invalidation for this update request. */
        noInvalidate?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<CheckEntityCheckResultObject, ErrorObject>({
        path: `/entity/${entityId}/verify/${checkType}/${resultLevel}`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  retrieve = {
    /**
     * @description If you've received a notification that you previously backgrounded transaction has completed, or you wish to re-retrive a result from an earlier transaction, then you can simply request the result from our encrypted cache The response will return the original HTTP code, along with the payload that would have been returned in the original request. The data can be re-retrieved for a maximum of 3 days.
     *
     * @tags Retrieve
     * @name RetrieveResult
     * @summary (Re)retrieve Response Result.
     * @request GET:/retrieve/response/{requestId}
     * @secure
     */
    retrieveResult: (
      requestId: string,
      query?: {
        /** Specifies the type of the payload field in the retrieved response. Default is 'string'. */
        payload?: 'string' | 'object';
      },
      params: RequestParams = {}
    ) =>
      this.request<RetrievedResponseObject, ErrorObject>({
        path: `/retrieve/response/${requestId}`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  ruok = {
    /**
     * @description Simple check to see if the service is running smoothly.
     *
     * @tags Status
     * @name StatusCheck
     * @summary Service Status
     * @request GET:/ruok
     */
    statusCheck: (
      query?: {
        /** If set to true, the request is being made politely. */
        askingNicely?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<PuppyObject, ErrorObject>({
        path: `/ruok`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),
  };
  your = {
    /**
     * @description Whenever you request that a transaction be put into the background, there needs to be a mechanism for notifying you that the request has been completed. This notification will push you the high-level details of the result, and you can then query the results at your leisure. The same notification process will also be used to push alerts to your system. This means that RequestIDs may not match your records
     *
     * @tags Push Notification
     * @name NotifyResult
     * @summary Push Notification Payload
     * @request POST:/your/configured/path/{requestId}
     */
    notifyResult: (
      requestId: string,
      data: NotificationResultObject,
      params: RequestParams = {}
    ) =>
      this.request<void, void>({
        path: `/your/configured/path/${requestId}`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
}

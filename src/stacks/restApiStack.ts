import { Stack, StackProps } from 'aws-cdk-lib';
import {
  BasePathMapping,
  DomainName,
  EndpointType,
  RestApi,
  SecurityPolicy,
} from 'aws-cdk-lib/aws-apigateway';
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager';
import { CnameRecord, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

interface RestApiStackProps extends StackProps {
  readonly stage: string;
  readonly restApiDomainName: string;
  readonly zone: IHostedZone;
}
export class RestApiStack extends Stack {
  public readonly restApi: RestApi;
  constructor(scope: Construct, id: string, props: RestApiStackProps) {
    super(scope, id, props);

    const certificate = new Certificate(this, 'ApiCertificate', {
      domainName: props.restApiDomainName,
      validation: CertificateValidation.fromDns(props.zone),
    });

    const restApi = new RestApi(this, 'RestApiGateway', {
      //TODO rename: `${}RestApiGateway`
      description: 'Rest API gateway',
      restApiName: '',
      //domainName: {
      //  domainName: props.restApiDomainName,
      //  certificate,
      //},
      //https://restapi-dev.apptractive.com.au/webhook-stripe
      deployOptions: {
        stageName: props.stage,
      },
    });

    const customDomain = new DomainName(this, 'custom-domain', {
      //TODO rename to TODO: rename to RestAPICustomDomain
      domainName: props.restApiDomainName,
      certificate,
      endpointType: EndpointType.EDGE, // default is REGIONAL
      securityPolicy: SecurityPolicy.TLS_1_2,
    });

    new BasePathMapping(this, 'CustomBasePathMapping', {
      //TODO rename to TODO: rename to RestAPIBasePathMapping
      domainName: customDomain,
      restApi: restApi,
    });

    // cname for custom api domain name
    new CnameRecord(this, 'RestAPICustomDomainCnameRecord', {
      recordName: props.restApiDomainName,
      domainName: customDomain.domainNameAliasDomainName,
      zone: props.zone,
    });

    this.restApi = restApi;
  }
}

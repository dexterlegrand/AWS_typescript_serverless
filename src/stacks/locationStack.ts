import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { CfnPlaceIndex } from 'aws-cdk-lib/aws-location';
import { Construct } from 'constructs';
import {
  Role,
  ServicePrincipal,
  PolicyStatement,
  ManagedPolicy,
  Effect,
  IRole,
} from 'aws-cdk-lib/aws-iam';

interface LocationLambdaStackProps extends StackProps {
  indexName: string;
  readonly authenticatedRole: IRole;
}

export class LocationLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: LocationLambdaStackProps) {
    super(scope, id, props);

    // Define the Amazon Location Service place index resource
    const placeIndex = new CfnPlaceIndex(this, 'PlaceIndex', {
      dataSource: 'Esri', // or 'Here'
      indexName: props.indexName,
    });

    new CfnOutput(this, 'PlaceIndexName', {
      value: placeIndex.indexName, // Exporting the reference of the Place Index
    });

    const locationServiceRole = new Role(this, 'LocationServiceRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'), // Adjust the ServicePrincipal as needed
      // ... other role configurations ...
    });

    locationServiceRole.addToPolicy(
      new PolicyStatement({
        actions: [
          'geo:SearchPlaceIndexByText',
          'geo:SearchPlaceIndexByPlaceId',
          'geo:SearchPlaceIndexForSuggestions',
          'geo:SearchPlaceIndexForPosition',
          'geo:SearchPlaceIndexForText',
          'geo:SearchPlaceIndex',
          'geo:GetPlace',
        ], // Include other actions as needed
        resources: [
          placeIndex.attrArn,
          `arn:aws:geo:${props.env?.region}:${props.env?.account}:place-index/${props.indexName}`,
        ], // Reference the Place Index ARN
      })
    );

    new ManagedPolicy(this, 'mangedPolicyForAmplifyAuth', {
      description: 'managed Policy to allow usage of location service for auth',
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'geo:SearchPlaceIndexByText',
            'geo:SearchPlaceIndexByPlaceId',
            'geo:SearchPlaceIndexForSuggestions',
            'geo:SearchPlaceIndexForPosition',
            'geo:SearchPlaceIndexForText',
            'geo:SearchPlaceIndex',
            'geo:GetPlace',
          ],
          resources: [
            placeIndex.attrArn,
            `arn:aws:geo:${props.env?.region}:${props.env?.account}:place-index/${props.indexName}`,
          ],
        }),
      ],
      roles: [props.authenticatedRole],
    });
  }
}

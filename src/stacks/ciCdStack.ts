import { Stack, StackProps } from 'aws-cdk-lib';
import {
  CodeBuildStep,
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from 'aws-cdk-lib/pipelines';
import { PipelineStage } from './pipelineStage';

interface CiCdStackProps extends StackProps {
  readonly repoPath: string;
  readonly directory: string;
  readonly branch: string;
  readonly stage: string;
  readonly connectionArn: string;
}

export class CiCdStack extends Stack {
  constructor(scope: any, id: string, props: CiCdStackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'CiCdPipeline', {
      pipelineName: 'CiCdPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(props.repoPath, props.branch, {
          connectionArn: props.connectionArn,
        }),
        commands: [
          `cd ${props.directory}`,
          'yarn install --frozen-lockfile',
          'npx cdk synth',
        ],
        primaryOutputDirectory: `${props.directory}/cdk.out`,
      }),
    });

    const stage = pipeline.addStage(
      new PipelineStage(this, `PipelineStage${props.stage}`, {
        stageName: props.stage,
        env: props.env,
      })
    );

    stage.addPre(
      new CodeBuildStep('CiCdUnitTests', {
        commands: [
          `cd ${props.directory}`,
          'yarn install --frozen-lockfile',
          'npx nx test backend',
        ],
      })
    );
  }
}

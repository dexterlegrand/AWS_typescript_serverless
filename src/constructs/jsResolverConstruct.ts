import {
  AppsyncFunction,
  BaseDataSource,
  Code,
  FunctionRuntime,
  IGraphqlApi,
  Resolver,
} from 'aws-cdk-lib/aws-appsync';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { buildSync } from 'esbuild';
import * as path from 'path';
import { externalLibs } from '../helpers';
export interface JsResolverProps {
  api: IGraphqlApi;
  dataSource: BaseDataSource;
  typeName: string;
  fieldName: string;
  pathName: string;
  table?: Table;
}

const getPath = (resolverName: string) =>
  path.join(__dirname, `../appsync/resolvers/${resolverName}.ts`);

export class JsResolverConstruct extends Construct {
  public readonly resolver: Resolver;
  constructor(scope: Construct, id: string, props: JsResolverProps) {
    super(scope, id);

    //transpile to js
    const buildResult = buildSync({
      entryPoints: [getPath(props.pathName)],
      bundle: true,
      write: false,
      external: externalLibs,
      format: 'esm',
      target: 'es2020',
      sourcemap: 'inline',
      sourcesContent: false,
    });

    if (buildResult.errors.length > 0) {
      throw new Error(
        `Failed to build ${props.pathName}: ${buildResult.errors[0].text}`
      );
    }

    if (buildResult.outputFiles.length === 0) {
      throw new Error(`Failed to build ${props.pathName}: no output files`);
    }

    const runtime = FunctionRuntime.JS_1_0_0;
    const func = new AppsyncFunction(this, `Func`, {
      api: props.api,
      dataSource: props.dataSource,
      name: `${props.fieldName}${props.typeName}`,
      code: Code.fromInline(buildResult.outputFiles[0].text),
      runtime,
    });

    this.resolver = new Resolver(this, `PipelineResolver`, {
      api: props.api,
      typeName: props.typeName,
      fieldName: props.fieldName,
      runtime,
      pipelineConfig: [func],
      code: Code.fromInline(
        [
          'export function request(ctx) { return {} }',
          'export function response(ctx) { return ctx.prev.result }',
        ].join('\n')
      ),
    });
  }
}

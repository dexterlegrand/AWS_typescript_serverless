import {
  AppsyncFunction,
  BaseDataSource,
  Code,
  FunctionRuntime,
  GraphqlApi,
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
  dataSources: BaseDataSource[];
  typeName: string;
  fieldName: string;
  pathName: string;
  table?: Table;
}

const tableResolver = (tableName: string) => `
export function request(ctx) {
  ctx.stash.tableName = "${tableName}"
  return {}
}
export function response(ctx) {
  return ctx.prev.result
}
`;

const noTableResolver = `
export function request(ctx) {
  return {}
}
export function response(ctx) {
  return ctx.prev.result
}
`;

const getPath = (resolverName: string) =>
  path.join(__dirname, `../appsync/resolvers/${resolverName}.ts`);

export class JsPipelineResolverConstruct extends Construct {
  public readonly resolver: Resolver;
  constructor(scope: Construct, id: string, props: JsResolverProps) {
    super(scope, id);

    const runtime = FunctionRuntime.JS_1_0_0;
    const pipelineFunctions: AppsyncFunction[] = [];

    //transpile to js
    props.dataSources.forEach((dataSource, index) => {
      const path = `${props.pathName}${index}`;
      const buildResult = buildSync({
        entryPoints: [getPath(path)],
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
          `Failed to build ${path}: ${buildResult.errors[0].text}`
        );
      }

      if (buildResult.outputFiles.length === 0) {
        throw new Error(`Failed to build ${path}: no output files`);
      }

      const func = new AppsyncFunction(this, `Func${index}`, {
        api: props.api,
        dataSource: props.dataSources[index],
        name: `${props.fieldName}${props.typeName}${index}`,
        code: Code.fromInline(buildResult.outputFiles[0].text),
        runtime,
      });

      pipelineFunctions.push(func);
    });

    this.resolver = new Resolver(this, `PipelineResolver`, {
      api: props.api,
      typeName: props.typeName,
      fieldName: props.fieldName,
      runtime,
      pipelineConfig: pipelineFunctions,
      code: Code.fromInline(
        props.table ? tableResolver(props.table.tableName) : noTableResolver
      ),
      //[
      //  'export function request(ctx) { return {} }',
      //  'export function response(ctx) { return ctx.prev.result }',
      //].join('\n')
      //),
    });
  }
}

import {
  AppsyncFunction,
  BaseDataSource,
  Code,
  FunctionRuntime,
  GraphqlApi,
  Resolver,
} from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import { buildSync } from 'esbuild';
import { externalLibs } from '../helpers';
export interface JsResolverProps {
  api: GraphqlApi;
  dataSource: BaseDataSource;
  typeName: string;
  fieldName: string;
  path: string;
}
export class JsResolver extends Construct {
  public readonly resolver: Resolver;
  constructor(scope: Construct, id: string, props: JsResolverProps) {
    super(scope, id);

    //transpile to js
    const buildResult = buildSync({
      entryPoints: [props.path],
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
        `Failed to build ${props.path}: ${buildResult.errors[0].text}`
      );
    }

    if (buildResult.outputFiles.length === 0) {
      throw new Error(`Failed to build ${props.path}: no output files`);
    }

    const runtime = FunctionRuntime.JS_1_0_0;
    const func = new AppsyncFunction(this, `Func`, {
      api: props.api,
      dataSource: props.dataSource,
      //dataSource: api.addNoneDataSource(`${props.fieldName}${props.typeName}DS`),
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

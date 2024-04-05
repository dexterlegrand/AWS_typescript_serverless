import { Context, util } from '@aws-appsync/utils';
import { abrLookupByAbn } from '/opt/abr';

export function request(ctx: Context) {
  const {
    args: { abn },
  } = ctx;
  return abrLookupByAbn(abn);
}

export function response(ctx: Context) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return ctx.result;
}

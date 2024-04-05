// apps/backend/src/appsync/resolvers/getTransaction.ts
import { util as util2 } from "@aws-appsync/utils";

// apps/backend/src/appsync/helpers/dynamodb.ts
import {
  util
} from "@aws-appsync/utils";
var dynamoDBGetItemRequest = (key) => {
  return {
    operation: "GetItem",
    key: util.dynamodb.toMapValues(key)
  };
};

// apps/backend/src/appsync/resolvers/getTransaction.ts
function request(ctx) {
  const {
    args: { id }
  } = ctx;
  return dynamoDBGetItemRequest({ id });
}
function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util2.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvZ2V0VHJhbnNhY3Rpb24udHMiLCAiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL2R5bmFtb2RiLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBLFNBQWtCLFFBQUFBLGFBQW9DOzs7QUNBdEQ7QUFBQSxFQVdFO0FBQUEsT0FDSztBQXNDQSxJQUFNLHlCQUF5QixDQUFDLFFBQXFDO0FBQzFFLFNBQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLEtBQUssS0FBSyxTQUFTLFlBQVksR0FBRztBQUFBLEVBQ3BDO0FBQ0Y7OztBRHBETyxTQUFTLFFBQVEsS0FBc0M7QUFDNUQsUUFBTTtBQUFBLElBQ0osTUFBTSxFQUFFLEdBQUc7QUFBQSxFQUNiLElBQUk7QUFDSixTQUFPLHVCQUF1QixFQUFFLEdBQUcsQ0FBQztBQUN0QztBQUVPLFNBQVMsU0FBUyxLQUFjO0FBQ3JDLFFBQU0sRUFBRSxPQUFPLE9BQU8sSUFBSTtBQUMxQixNQUFJLE9BQU87QUFDVCxXQUFPQyxNQUFLLFlBQVksTUFBTSxTQUFTLE1BQU0sTUFBTSxNQUFNO0FBQUEsRUFDM0Q7QUFDQSxTQUFPLElBQUk7QUFDYjsiLAogICJuYW1lcyI6IFsidXRpbCIsICJ1dGlsIl0KfQo=

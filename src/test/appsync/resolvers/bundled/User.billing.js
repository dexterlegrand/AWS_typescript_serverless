// apps/backend/src/appsync/resolvers/User.billing.ts
import {
  runtime,
  util as util2
} from "@aws-appsync/utils";

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

// apps/backend/src/appsync/resolvers/User.billing.ts
function request(ctx) {
  const { billingId } = ctx.source;
  console.log("User.billing.ctx: ", ctx);
  if (!billingId) {
    runtime.earlyReturn();
  }
  return dynamoDBGetItemRequest({ id: billingId });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvVXNlci5iaWxsaW5nLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvaGVscGVycy9keW5hbW9kYi50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFBQTtBQUFBLEVBR0U7QUFBQSxFQUNBLFFBQUFBO0FBQUEsT0FDSzs7O0FDTFA7QUFBQSxFQVdFO0FBQUEsT0FDSztBQXNDQSxJQUFNLHlCQUF5QixDQUFDLFFBQXFDO0FBQzFFLFNBQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLEtBQUssS0FBSyxTQUFTLFlBQVksR0FBRztBQUFBLEVBQ3BDO0FBQ0Y7OztBRC9DTyxTQUFTLFFBQVEsS0FBc0M7QUFDNUQsUUFBTSxFQUFFLFVBQVUsSUFBSSxJQUFJO0FBQzFCLFVBQVEsSUFBSSxzQkFBc0IsR0FBRztBQUVyQyxNQUFJLENBQUMsV0FBVztBQUNkLFlBQVEsWUFBWTtBQUFBLEVBQ3RCO0FBRUEsU0FBTyx1QkFBdUIsRUFBRSxJQUFJLFVBQVUsQ0FBQztBQUNqRDtBQUVPLFNBQVMsU0FBUyxLQUFjO0FBQ3JDLFFBQU0sRUFBRSxPQUFPLE9BQU8sSUFBSTtBQUMxQixNQUFJLE9BQU87QUFDVCxXQUFPQyxNQUFLLFlBQVksTUFBTSxTQUFTLE1BQU0sTUFBTSxNQUFNO0FBQUEsRUFDM0Q7QUFDQSxTQUFPLElBQUk7QUFDYjsiLAogICJuYW1lcyI6IFsidXRpbCIsICJ1dGlsIl0KfQo=

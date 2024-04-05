// apps/backend/src/appsync/resolvers/EntityUser.entity.ts
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

// apps/backend/src/appsync/resolvers/EntityUser.entity.ts
function request(ctx) {
  console.log("EntityUser.entity request: ", ctx);
  const { entityId } = ctx.source;
  return dynamoDBGetItemRequest({
    id: entityId
  });
}
function response(ctx) {
  console.log("EntityUser.entity response: ", ctx);
  const { error, result } = ctx;
  if (error) {
    return util2.appendError(error.message, error.type, result);
  }
  return result;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvRW50aXR5VXNlci5lbnRpdHkudHMiLCAiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL2R5bmFtb2RiLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQTBDLFFBQUFBLGFBQVk7OztBQ0R0RDtBQUFBLEVBV0U7QUFBQSxPQUNLO0FBc0NBLElBQU0seUJBQXlCLENBQUMsUUFBcUM7QUFDMUUsU0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsS0FBSyxLQUFLLFNBQVMsWUFBWSxHQUFHO0FBQUEsRUFDcEM7QUFDRjs7O0FEbkRPLFNBQVMsUUFBUSxLQUFzQztBQUM1RCxVQUFRLElBQUksK0JBQStCLEdBQUc7QUFDOUMsUUFBTSxFQUFFLFNBQVMsSUFBSSxJQUFJO0FBRXpCLFNBQU8sdUJBQXVCO0FBQUEsSUFDNUIsSUFBSTtBQUFBLEVBQ04sQ0FBQztBQUNIO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsVUFBUSxJQUFJLGdDQUFnQyxHQUFHO0FBQy9DLFFBQU0sRUFBRSxPQUFPLE9BQU8sSUFBSTtBQUMxQixNQUFJLE9BQU87QUFDVCxXQUFPQyxNQUFLLFlBQVksTUFBTSxTQUFTLE1BQU0sTUFBTSxNQUFNO0FBQUEsRUFDM0Q7QUFFQSxTQUFPO0FBQ1Q7IiwKICAibmFtZXMiOiBbInV0aWwiLCAidXRpbCJdCn0K

// apps/backend/src/appsync/resolvers/Mutation.createTask1.ts
import {
  util as util2
} from "@aws-appsync/utils";

// apps/backend/src/appsync/helpers/dynamodb.ts
import {
  util
} from "@aws-appsync/utils";
var dynamodbPutRequest = ({
  key,
  data,
  condition: inCondObj = {}
}) => {
  const condition = JSON.parse(
    util.transform.toDynamoDBConditionExpression(inCondObj)
  );
  if (condition.expressionValues && !Object.keys(condition.expressionValues).length) {
    delete condition.expressionValues;
  }
  return {
    operation: "PutItem",
    key: util.dynamodb.toMapValues(key),
    attributeValues: util.dynamodb.toMapValues(data),
    condition
  };
};

// apps/backend/src/appsync/resolvers/Mutation.createTask1.ts
function request(ctx) {
  console.log("create task1 ctx: ", ctx);
  const { sub } = ctx.identity;
  const { input } = ctx.arguments;
  const entityUser = ctx?.prev?.result;
  const id = util2.autoId();
  const key = { id, entityId: entityUser.entityId };
  const createdAt = util2.time.nowISO8601();
  const data = {
    ...input,
    id,
    entityId: entityUser.entityId,
    entityIdBy: entityUser.entityId,
    status: input.type === "SIGN_PAY" || input.type === "PAY_ONLY" ? "PENDING_PAYMENT" : "PENDING_SIGNATURE",
    signatureStatus: input.type === "SIGN_PAY" || input.type === "SIGN_ONLY" ? "PENDING_SIGNATURE" : "NOT_SIGNABLE",
    paymentStatus: input.type === "SIGN_PAY" || input.type === "PAY_ONLY" ? "PENDING_PAYMENT" : "NOT_PAYABLE",
    createdBy: sub,
    createdAt,
    updatedAt: createdAt
  };
  if (input.direction === "RECEIVING" && input.entityIdTo) {
    data.toSearchStatus = `${input.entityIdTo}#INCOMPLETE`;
  }
  if (input.direction === "SENDING" && input.entityIdFrom) {
    data.fromSearchStatus = `${input.entityIdFrom}#INCOMPLETE`;
  }
  if (input.direction === "ON_BEHALF_OF" && input.entityIdFrom) {
    data.fromSearchStatus = `${input.entityIdFrom}#INCOMPLETE`;
  }
  const condition = { id: { attributeExists: false } };
  return dynamodbPutRequest({ key, data, condition });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvTXV0YXRpb24uY3JlYXRlVGFzazEudHMiLCAiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL2R5bmFtb2RiLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBO0FBQUEsRUFJRSxRQUFBQTtBQUFBLE9BQ0s7OztBQ0xQO0FBQUEsRUFXRTtBQUFBLE9BQ0s7QUE2Q0EsSUFBTSxxQkFBcUIsQ0FBQztBQUFBLEVBQ2pDO0FBQUEsRUFDQTtBQUFBLEVBQ0EsV0FBVyxZQUFZLENBQUM7QUFDMUIsTUFBdUQ7QUFDckQsUUFBTSxZQUFZLEtBQUs7QUFBQSxJQUNyQixLQUFLLFVBQVUsOEJBQThCLFNBQVM7QUFBQSxFQUN4RDtBQUNBLE1BQ0UsVUFBVSxvQkFDVixDQUFDLE9BQU8sS0FBSyxVQUFVLGdCQUFnQixFQUFFLFFBQ3pDO0FBQ0EsV0FBTyxVQUFVO0FBQUEsRUFDbkI7QUFDQSxTQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxLQUFLLEtBQUssU0FBUyxZQUFZLEdBQUc7QUFBQSxJQUNsQyxpQkFBaUIsS0FBSyxTQUFTLFlBQVksSUFBSTtBQUFBLElBQy9DO0FBQUEsRUFDRjtBQUNGOzs7QURyRU8sU0FBUyxRQUFRLEtBQXNDO0FBQzVELFVBQVEsSUFBSSxzQkFBc0IsR0FBRztBQUNyQyxRQUFNLEVBQUUsSUFBSSxJQUFJLElBQUk7QUFDcEIsUUFBTSxFQUFFLE1BQU0sSUFBSSxJQUFJO0FBQ3RCLFFBQU0sYUFBYSxLQUFLLE1BQU07QUFFOUIsUUFBTSxLQUFLQyxNQUFLLE9BQU87QUFDdkIsUUFBTSxNQUFNLEVBQUUsSUFBSSxVQUFVLFdBQVcsU0FBUztBQUNoRCxRQUFNLFlBQVlBLE1BQUssS0FBSyxXQUFXO0FBQ3ZDLFFBQU0sT0FBTztBQUFBLElBQ1gsR0FBRztBQUFBLElBQ0g7QUFBQSxJQUNBLFVBQVUsV0FBVztBQUFBLElBQ3JCLFlBQVksV0FBVztBQUFBLElBQ3ZCLFFBQ0UsTUFBTSxTQUFTLGNBQWMsTUFBTSxTQUFTLGFBQ3hDLG9CQUNBO0FBQUEsSUFDTixpQkFDRSxNQUFNLFNBQVMsY0FBYyxNQUFNLFNBQVMsY0FDeEMsc0JBQ0E7QUFBQSxJQUNOLGVBQ0UsTUFBTSxTQUFTLGNBQWMsTUFBTSxTQUFTLGFBQ3hDLG9CQUNBO0FBQUEsSUFDTixXQUFXO0FBQUEsSUFDWDtBQUFBLElBQ0EsV0FBVztBQUFBLEVBQ2I7QUFFQSxNQUFJLE1BQU0sY0FBYyxlQUFlLE1BQU0sWUFBWTtBQUN2RCxTQUFLLGlCQUFpQixHQUFHLE1BQU07QUFBQSxFQUNqQztBQUVBLE1BQUksTUFBTSxjQUFjLGFBQWEsTUFBTSxjQUFjO0FBQ3ZELFNBQUssbUJBQW1CLEdBQUcsTUFBTTtBQUFBLEVBQ25DO0FBRUEsTUFBSSxNQUFNLGNBQWMsa0JBQWtCLE1BQU0sY0FBYztBQUM1RCxTQUFLLG1CQUFtQixHQUFHLE1BQU07QUFBQSxFQUNuQztBQUVBLFFBQU0sWUFBWSxFQUFFLElBQUksRUFBRSxpQkFBaUIsTUFBTSxFQUFFO0FBQ25ELFNBQU8sbUJBQW1CLEVBQUUsS0FBSyxNQUFNLFVBQVUsQ0FBQztBQUNwRDtBQUVPLFNBQVMsU0FBUyxLQUFjO0FBQ3JDLFFBQU0sRUFBRSxPQUFPLE9BQU8sSUFBSTtBQUMxQixNQUFJLE9BQU87QUFDVCxXQUFPQSxNQUFLLFlBQVksTUFBTSxTQUFTLE1BQU0sTUFBTSxNQUFNO0FBQUEsRUFDM0Q7QUFFQSxTQUFPLElBQUk7QUFDYjsiLAogICJuYW1lcyI6IFsidXRpbCIsICJ1dGlsIl0KfQo=

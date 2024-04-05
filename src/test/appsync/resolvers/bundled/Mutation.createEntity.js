// apps/backend/src/appsync/resolvers/Mutation.createEntity.ts
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

// apps/backend/src/appsync/resolvers/Mutation.createEntity.ts
function request(ctx) {
  const { sub } = ctx.identity;
  const { input } = ctx.arguments;
  const key = { id: util2.autoId() };
  const createdAt = util2.time.nowISO8601();
  const data = {
    ...input,
    owner: sub,
    createdAt,
    updatedAt: createdAt
  };
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvTXV0YXRpb24uY3JlYXRlRW50aXR5LnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvaGVscGVycy9keW5hbW9kYi50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFBQTtBQUFBLEVBSUUsUUFBQUE7QUFBQSxPQUNLOzs7QUNMUDtBQUFBLEVBV0U7QUFBQSxPQUNLO0FBNkNBLElBQU0scUJBQXFCLENBQUM7QUFBQSxFQUNqQztBQUFBLEVBQ0E7QUFBQSxFQUNBLFdBQVcsWUFBWSxDQUFDO0FBQzFCLE1BQXVEO0FBQ3JELFFBQU0sWUFBWSxLQUFLO0FBQUEsSUFDckIsS0FBSyxVQUFVLDhCQUE4QixTQUFTO0FBQUEsRUFDeEQ7QUFDQSxNQUNFLFVBQVUsb0JBQ1YsQ0FBQyxPQUFPLEtBQUssVUFBVSxnQkFBZ0IsRUFBRSxRQUN6QztBQUNBLFdBQU8sVUFBVTtBQUFBLEVBQ25CO0FBQ0EsU0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsS0FBSyxLQUFLLFNBQVMsWUFBWSxHQUFHO0FBQUEsSUFDbEMsaUJBQWlCLEtBQUssU0FBUyxZQUFZLElBQUk7QUFBQSxJQUMvQztBQUFBLEVBQ0Y7QUFDRjs7O0FEckVPLFNBQVMsUUFBUSxLQUFzQztBQUM1RCxRQUFNLEVBQUUsSUFBSSxJQUFJLElBQUk7QUFDcEIsUUFBTSxFQUFFLE1BQU0sSUFBSSxJQUFJO0FBRXRCLFFBQU0sTUFBTSxFQUFFLElBQUlDLE1BQUssT0FBTyxFQUFFO0FBQ2hDLFFBQU0sWUFBWUEsTUFBSyxLQUFLLFdBQVc7QUFDdkMsUUFBTSxPQUFPO0FBQUEsSUFDWCxHQUFHO0FBQUEsSUFDSCxPQUFPO0FBQUEsSUFDUDtBQUFBLElBQ0EsV0FBVztBQUFBLEVBQ2I7QUFDQSxRQUFNLFlBQVksRUFBRSxJQUFJLEVBQUUsaUJBQWlCLE1BQU0sRUFBRTtBQUNuRCxTQUFPLG1CQUFtQixFQUFFLEtBQUssTUFBTSxVQUFVLENBQUM7QUFDcEQ7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxRQUFNLEVBQUUsT0FBTyxPQUFPLElBQUk7QUFDMUIsTUFBSSxPQUFPO0FBQ1QsV0FBT0EsTUFBSyxZQUFZLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTTtBQUFBLEVBQzNEO0FBQ0EsU0FBTyxJQUFJO0FBQ2I7IiwKICAibmFtZXMiOiBbInV0aWwiLCAidXRpbCJdCn0K

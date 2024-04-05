// apps/backend/src/appsync/resolvers/Query.listMessages.ts
import { util as util2 } from "@aws-appsync/utils";

// apps/backend/src/appsync/helpers/dynamodb.ts
import {
  util
} from "@aws-appsync/utils";
var dynamoDBScanRequest = ({
  filter: f,
  limit,
  nextToken
}) => {
  const filter = f ? JSON.parse(util.transform.toDynamoDBFilterExpression(f)) : void 0;
  return { operation: "Scan", filter, limit, nextToken };
};

// apps/backend/src/appsync/resolvers/Query.listMessages.ts
function request(ctx) {
  const { filter, limit = 20, nextToken } = ctx.args;
  return dynamoDBScanRequest({ filter, limit, nextToken });
}
function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util2.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  return { items, nextToken };
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvUXVlcnkubGlzdE1lc3NhZ2VzLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvaGVscGVycy9keW5hbW9kYi50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxTQUFrQixRQUFBQSxhQUFpQzs7O0FDQW5EO0FBQUEsRUFXRTtBQUFBLE9BQ0s7QUFvR0EsSUFBTSxzQkFBc0IsQ0FBQztBQUFBLEVBQ2xDLFFBQVE7QUFBQSxFQUNSO0FBQUEsRUFDQTtBQUNGLE1BQXFEO0FBQ25ELFFBQU0sU0FBUyxJQUNYLEtBQUssTUFBTSxLQUFLLFVBQVUsMkJBQTJCLENBQUMsQ0FBQyxJQUN2RDtBQUVKLFNBQU8sRUFBRSxXQUFXLFFBQVEsUUFBUSxPQUFPLFVBQVU7QUFDdkQ7OztBRHZITyxTQUFTLFFBQVEsS0FBbUM7QUFDekQsUUFBTSxFQUFFLFFBQVEsUUFBUSxJQUFJLFVBQVUsSUFBSSxJQUFJO0FBQzlDLFNBQU8sb0JBQW9CLEVBQUUsUUFBUSxPQUFPLFVBQVUsQ0FBQztBQUN6RDtBQUdPLFNBQVMsU0FBUyxLQUFjO0FBQ3JDLFFBQU0sRUFBRSxPQUFPLE9BQU8sSUFBSTtBQUMxQixNQUFJLE9BQU87QUFDVCxXQUFPQyxNQUFLLFlBQVksTUFBTSxTQUFTLE1BQU0sTUFBTSxNQUFNO0FBQUEsRUFDM0Q7QUFDQSxRQUFNLEVBQUUsUUFBUSxDQUFDLEdBQUcsVUFBVSxJQUFJO0FBQ2xDLFNBQU8sRUFBRSxPQUFPLFVBQVU7QUFDNUI7IiwKICAibmFtZXMiOiBbInV0aWwiLCAidXRpbCJdCn0K

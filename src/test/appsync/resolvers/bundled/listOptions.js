// apps/backend/src/appsync/resolvers/listOptions.ts
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

// apps/backend/src/appsync/resolvers/listOptions.ts
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvbGlzdE9wdGlvbnMudHMiLCAiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL2R5bmFtb2RiLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBLFNBQWtCLFFBQUFBLGFBQWlDOzs7QUNBbkQ7QUFBQSxFQVdFO0FBQUEsT0FDSztBQW9HQSxJQUFNLHNCQUFzQixDQUFDO0FBQUEsRUFDbEMsUUFBUTtBQUFBLEVBQ1I7QUFBQSxFQUNBO0FBQ0YsTUFBcUQ7QUFDbkQsUUFBTSxTQUFTLElBQ1gsS0FBSyxNQUFNLEtBQUssVUFBVSwyQkFBMkIsQ0FBQyxDQUFDLElBQ3ZEO0FBRUosU0FBTyxFQUFFLFdBQVcsUUFBUSxRQUFRLE9BQU8sVUFBVTtBQUN2RDs7O0FEdkhPLFNBQVMsUUFBUSxLQUFtQztBQUN6RCxRQUFNLEVBQUUsUUFBUSxRQUFRLElBQUksVUFBVSxJQUFJLElBQUk7QUFDOUMsU0FBTyxvQkFBb0IsRUFBRSxRQUFRLE9BQU8sVUFBVSxDQUFDO0FBQ3pEO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsUUFBTSxFQUFFLE9BQU8sT0FBTyxJQUFJO0FBQzFCLE1BQUksT0FBTztBQUNULFdBQU9DLE1BQUssWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNLE1BQU07QUFBQSxFQUMzRDtBQUNBLFFBQU0sRUFBRSxRQUFRLENBQUMsR0FBRyxVQUFVLElBQUk7QUFDbEMsU0FBTyxFQUFFLE9BQU8sVUFBVTtBQUM1QjsiLAogICJuYW1lcyI6IFsidXRpbCIsICJ1dGlsIl0KfQo=

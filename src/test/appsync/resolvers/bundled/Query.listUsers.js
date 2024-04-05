// apps/backend/src/appsync/resolvers/Query.listUsers.ts
import {
  util as util3
} from "@aws-appsync/utils";

// apps/backend/src/appsync/helpers/cognito.ts
import { util } from "@aws-appsync/utils";
var USER_GROUPS = {
  SUPER_ADMINS: "SuperAdmins",
  ADMINS: "Admins",
  USERS: "Users"
};
var isAdmin = (groups) => {
  return groups?.includes(USER_GROUPS.SUPER_ADMINS) || groups?.includes(USER_GROUPS.ADMINS);
};

// apps/backend/src/appsync/helpers/dynamodb.ts
import {
  util as util2
} from "@aws-appsync/utils";
var dynamoDBScanRequest = ({
  filter: f,
  limit,
  nextToken
}) => {
  const filter = f ? JSON.parse(util2.transform.toDynamoDBFilterExpression(f)) : void 0;
  return { operation: "Scan", filter, limit, nextToken };
};

// apps/backend/src/appsync/resolvers/Query.listUsers.ts
function request(ctx) {
  const { filter, limit, nextToken } = ctx.args;
  const { groups } = ctx.identity;
  if (!isAdmin(groups)) {
    util3.unauthorized();
  }
  return dynamoDBScanRequest({ filter, limit, nextToken });
}
function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util3.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvUXVlcnkubGlzdFVzZXJzLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvaGVscGVycy9jb2duaXRvLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvaGVscGVycy9keW5hbW9kYi50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFBQTtBQUFBLEVBSUUsUUFBQUE7QUFBQSxPQUNLOzs7QUNMUCxTQUFTLFlBQWlDO0FBQ25DLElBQU0sY0FBYztBQUFBLEVBQ3pCLGNBQWM7QUFBQSxFQUNkLFFBQVE7QUFBQSxFQUNSLE9BQU87QUFDVDtBQVNPLElBQU0sVUFBVSxDQUFDLFdBQTRCO0FBQ2xELFNBQ0UsUUFBUSxTQUFTLFlBQVksWUFBWSxLQUN6QyxRQUFRLFNBQVMsWUFBWSxNQUFNO0FBRXZDOzs7QUNuQkE7QUFBQSxFQVdFLFFBQUFDO0FBQUEsT0FDSztBQW9HQSxJQUFNLHNCQUFzQixDQUFDO0FBQUEsRUFDbEMsUUFBUTtBQUFBLEVBQ1I7QUFBQSxFQUNBO0FBQ0YsTUFBcUQ7QUFDbkQsUUFBTSxTQUFTLElBQ1gsS0FBSyxNQUFNQyxNQUFLLFVBQVUsMkJBQTJCLENBQUMsQ0FBQyxJQUN2RDtBQUVKLFNBQU8sRUFBRSxXQUFXLFFBQVEsUUFBUSxPQUFPLFVBQVU7QUFDdkQ7OztBRmpITyxTQUFTLFFBQVEsS0FBbUM7QUFDekQsUUFBTSxFQUFFLFFBQVEsT0FBTyxVQUFVLElBQUksSUFBSTtBQUN6QyxRQUFNLEVBQUUsT0FBTyxJQUFJLElBQUk7QUFDdkIsTUFBSSxDQUFDLFFBQVEsTUFBTSxHQUFHO0FBQ3BCLElBQUFDLE1BQUssYUFBYTtBQUFBLEVBQ3BCO0FBRUEsU0FBTyxvQkFBb0IsRUFBRSxRQUFRLE9BQU8sVUFBVSxDQUFDO0FBQ3pEO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsUUFBTSxFQUFFLE9BQU8sT0FBTyxJQUFJO0FBQzFCLE1BQUksT0FBTztBQUNULFdBQU9BLE1BQUssWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNLE1BQU07QUFBQSxFQUMzRDtBQUNBLFNBQU8sSUFBSTtBQUNiOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgInV0aWwiLCAidXRpbCIsICJ1dGlsIl0KfQo=

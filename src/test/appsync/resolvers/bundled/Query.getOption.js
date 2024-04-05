// apps/backend/src/appsync/resolvers/Query.getOption.ts
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
var dynamoDBGetItemRequest = (key) => {
  return {
    operation: "GetItem",
    key: util2.dynamodb.toMapValues(key)
  };
};

// apps/backend/src/appsync/resolvers/Query.getOption.ts
var isAuthorised = (ctx) => {
  if (util3.authType() === "User Pool Authorization") {
    const { groups } = ctx.identity;
    if (!isAdmin(groups)) {
      util3.unauthorized();
    }
    return true;
  } else if (util3.authType() === "IAM Authorization") {
    const { userArn } = ctx.identity;
    const adminRoles = [""];
    for (const adminRole in adminRoles) {
      if (userArn.includes(adminRole) && userArn != ctx.stash.authRole && userArn != ctx.stash.unauthRole) {
        return true;
      }
    }
  } else if (util3.authType() === "Open ID Connect Authorization") {
  } else if (util3.authType() === "API Key Authorization") {
  }
  return false;
};
function request(ctx) {
  const {
    args: { id }
  } = ctx;
  if (!isAuthorised(ctx)) {
    util3.unauthorized();
  }
  return dynamoDBGetItemRequest({ id });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvUXVlcnkuZ2V0T3B0aW9uLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvaGVscGVycy9jb2duaXRvLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvaGVscGVycy9keW5hbW9kYi50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFBQTtBQUFBLEVBRUUsUUFBQUE7QUFBQSxPQUlLOzs7QUNOUCxTQUFTLFlBQWlDO0FBQ25DLElBQU0sY0FBYztBQUFBLEVBQ3pCLGNBQWM7QUFBQSxFQUNkLFFBQVE7QUFBQSxFQUNSLE9BQU87QUFDVDtBQVNPLElBQU0sVUFBVSxDQUFDLFdBQTRCO0FBQ2xELFNBQ0UsUUFBUSxTQUFTLFlBQVksWUFBWSxLQUN6QyxRQUFRLFNBQVMsWUFBWSxNQUFNO0FBRXZDOzs7QUNuQkE7QUFBQSxFQVdFLFFBQUFDO0FBQUEsT0FDSztBQXNDQSxJQUFNLHlCQUF5QixDQUFDLFFBQXFDO0FBQzFFLFNBQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLEtBQUtDLE1BQUssU0FBUyxZQUFZLEdBQUc7QUFBQSxFQUNwQztBQUNGOzs7QUY5Q0EsSUFBTSxlQUFlLENBQUMsUUFBaUI7QUFDckMsTUFBSUMsTUFBSyxTQUFTLE1BQU0sMkJBQTJCO0FBQ2pELFVBQU0sRUFBRSxPQUFPLElBQUksSUFBSTtBQUN2QixRQUFJLENBQUMsUUFBUSxNQUFNLEdBQUc7QUFDcEIsTUFBQUEsTUFBSyxhQUFhO0FBQUEsSUFDcEI7QUFFQSxXQUFPO0FBQUEsRUFDVCxXQUFXQSxNQUFLLFNBQVMsTUFBTSxxQkFBcUI7QUFDbEQsVUFBTSxFQUFFLFFBQVEsSUFBSSxJQUFJO0FBQ3hCLFVBQU0sYUFBYSxDQUFDLEVBQUU7QUFHdEIsZUFBVyxhQUFhLFlBQVk7QUFDbEMsVUFDRSxRQUFRLFNBQVMsU0FBUyxLQUMxQixXQUFXLElBQUksTUFBTSxZQUNyQixXQUFXLElBQUksTUFBTSxZQUNyQjtBQUNBLGVBQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLEVBQ0YsV0FBV0EsTUFBSyxTQUFTLE1BQU0saUNBQWlDO0FBQUEsRUFFaEUsV0FBV0EsTUFBSyxTQUFTLE1BQU0seUJBQXlCO0FBQUEsRUFFeEQ7QUFFQSxTQUFPO0FBQ1Q7QUFFTyxTQUFTLFFBQVEsS0FBc0M7QUFDNUQsUUFBTTtBQUFBLElBQ0osTUFBTSxFQUFFLEdBQUc7QUFBQSxFQUNiLElBQUk7QUFFSixNQUFJLENBQUMsYUFBYSxHQUFHLEdBQUc7QUFDdEIsSUFBQUEsTUFBSyxhQUFhO0FBQUEsRUFDcEI7QUFFQSxTQUFPLHVCQUF1QixFQUFFLEdBQUcsQ0FBQztBQUN0QztBQUVPLFNBQVMsU0FBUyxLQUFjO0FBQ3JDLFFBQU0sRUFBRSxPQUFPLE9BQU8sSUFBSTtBQUMxQixNQUFJLE9BQU87QUFDVCxXQUFPQSxNQUFLLFlBQVksTUFBTSxTQUFTLE1BQU0sTUFBTSxNQUFNO0FBQUEsRUFDM0Q7QUFDQSxTQUFPLElBQUk7QUFDYjsiLAogICJuYW1lcyI6IFsidXRpbCIsICJ1dGlsIiwgInV0aWwiLCAidXRpbCJdCn0K

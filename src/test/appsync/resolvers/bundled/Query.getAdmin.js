// apps/backend/src/appsync/resolvers/Query.getAdmin.ts
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

// apps/backend/src/appsync/resolvers/Query.getAdmin.ts
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvUXVlcnkuZ2V0QWRtaW4udHMiLCAiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL2NvZ25pdG8udHMiLCAiLi4vLi4vLi4vLi4vYXBwc3luYy9oZWxwZXJzL2R5bmFtb2RiLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBO0FBQUEsRUFFRSxRQUFBQTtBQUFBLE9BSUs7OztBQ05QLFNBQVMsWUFBaUM7QUFDbkMsSUFBTSxjQUFjO0FBQUEsRUFDekIsY0FBYztBQUFBLEVBQ2QsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUNUO0FBU08sSUFBTSxVQUFVLENBQUMsV0FBNEI7QUFDbEQsU0FDRSxRQUFRLFNBQVMsWUFBWSxZQUFZLEtBQ3pDLFFBQVEsU0FBUyxZQUFZLE1BQU07QUFFdkM7OztBQ25CQTtBQUFBLEVBV0UsUUFBQUM7QUFBQSxPQUNLO0FBc0NBLElBQU0seUJBQXlCLENBQUMsUUFBcUM7QUFDMUUsU0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsS0FBS0MsTUFBSyxTQUFTLFlBQVksR0FBRztBQUFBLEVBQ3BDO0FBQ0Y7OztBRjdDQSxJQUFNLGVBQWUsQ0FBQyxRQUFpQjtBQUNyQyxNQUFJQyxNQUFLLFNBQVMsTUFBTSwyQkFBMkI7QUFDakQsVUFBTSxFQUFFLE9BQU8sSUFBSSxJQUFJO0FBQ3ZCLFFBQUksQ0FBQyxRQUFRLE1BQU0sR0FBRztBQUNwQixNQUFBQSxNQUFLLGFBQWE7QUFBQSxJQUNwQjtBQUVBLFdBQU87QUFBQSxFQUNULFdBQVdBLE1BQUssU0FBUyxNQUFNLHFCQUFxQjtBQUNsRCxVQUFNLEVBQUUsUUFBUSxJQUFJLElBQUk7QUFDeEIsVUFBTSxhQUFhLENBQUMsRUFBRTtBQUd0QixlQUFXLGFBQWEsWUFBWTtBQUNsQyxVQUNFLFFBQVEsU0FBUyxTQUFTLEtBQzFCLFdBQVcsSUFBSSxNQUFNLFlBQ3JCLFdBQVcsSUFBSSxNQUFNLFlBQ3JCO0FBQ0EsZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsRUFDRixXQUFXQSxNQUFLLFNBQVMsTUFBTSxpQ0FBaUM7QUFBQSxFQUVoRSxXQUFXQSxNQUFLLFNBQVMsTUFBTSx5QkFBeUI7QUFBQSxFQUV4RDtBQUVBLFNBQU87QUFDVDtBQUVPLFNBQVMsUUFBUSxLQUFzQztBQUM1RCxRQUFNO0FBQUEsSUFDSixNQUFNLEVBQUUsR0FBRztBQUFBLEVBQ2IsSUFBSTtBQUVKLE1BQUksQ0FBQyxhQUFhLEdBQUcsR0FBRztBQUN0QixJQUFBQSxNQUFLLGFBQWE7QUFBQSxFQUNwQjtBQUVBLFNBQU8sdUJBQXVCLEVBQUUsR0FBRyxDQUFDO0FBQ3RDO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsUUFBTSxFQUFFLE9BQU8sT0FBTyxJQUFJO0FBQzFCLE1BQUksT0FBTztBQUNULFdBQU9BLE1BQUssWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNLE1BQU07QUFBQSxFQUMzRDtBQUNBLFNBQU8sSUFBSTtBQUNiOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgInV0aWwiLCAidXRpbCIsICJ1dGlsIl0KfQo=

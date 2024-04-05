// apps/backend/src/appsync/resolvers/Query.tasksByEntityFrom0.ts
import {
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

// apps/backend/src/appsync/resolvers/Query.tasksByEntityFrom0.ts
function request(ctx) {
  console.log("Query.tasksByEntityFrom0.ts request ctx: ", ctx);
  const { sub } = ctx.identity;
  const { entityId } = ctx.args;
  return dynamoDBGetItemRequest({
    userId: sub,
    entityId
  });
}
function response(ctx) {
  console.log("Query.tasksByEntityFrom0.ts response ctx: ", ctx);
  const { sub } = ctx.identity;
  const { error, result } = ctx;
  if (!result?.userId || result?.userId !== sub) {
    util2.unauthorized();
  }
  if (error) {
    return util2.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvUXVlcnkudGFza3NCeUVudGl0eUZyb20wLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvaGVscGVycy9keW5hbW9kYi50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFBQTtBQUFBLEVBSUUsUUFBQUE7QUFBQSxPQUNLOzs7QUNMUDtBQUFBLEVBV0U7QUFBQSxPQUNLO0FBc0NBLElBQU0seUJBQXlCLENBQUMsUUFBcUM7QUFDMUUsU0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsS0FBSyxLQUFLLFNBQVMsWUFBWSxHQUFHO0FBQUEsRUFDcEM7QUFDRjs7O0FEL0NPLFNBQVMsUUFBUSxLQUFzQztBQUM1RCxVQUFRLElBQUksNkNBQTZDLEdBQUc7QUFDNUQsUUFBTSxFQUFFLElBQUksSUFBSSxJQUFJO0FBQ3BCLFFBQU0sRUFBRSxTQUFTLElBQUksSUFBSTtBQUV6QixTQUFPLHVCQUF1QjtBQUFBLElBQzVCLFFBQVE7QUFBQSxJQUNSO0FBQUEsRUFDRixDQUFDO0FBQ0g7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxVQUFRLElBQUksOENBQThDLEdBQUc7QUFDN0QsUUFBTSxFQUFFLElBQUksSUFBSSxJQUFJO0FBQ3BCLFFBQU0sRUFBRSxPQUFPLE9BQU8sSUFBSTtBQUUxQixNQUFJLENBQUMsUUFBUSxVQUFVLFFBQVEsV0FBVyxLQUFLO0FBQzdDLElBQUFDLE1BQUssYUFBYTtBQUFBLEVBQ3BCO0FBRUEsTUFBSSxPQUFPO0FBQ1QsV0FBT0EsTUFBSyxZQUFZLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTTtBQUFBLEVBQzNEO0FBRUEsU0FBTyxJQUFJO0FBQ2I7IiwKICAibmFtZXMiOiBbInV0aWwiLCAidXRpbCJdCn0K

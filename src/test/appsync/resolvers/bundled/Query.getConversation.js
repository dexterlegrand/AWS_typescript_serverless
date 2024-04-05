// apps/backend/src/appsync/resolvers/Query.getConversation.ts
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

// apps/backend/src/appsync/resolvers/Query.getConversation.ts
function request(ctx) {
  const {
    args: { id }
  } = ctx;
  return dynamoDBGetItemRequest({ id });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXBwc3luYy9yZXNvbHZlcnMvUXVlcnkuZ2V0Q29udmVyc2F0aW9uLnRzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvaGVscGVycy9keW5hbW9kYi50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxTQUFrQixRQUFBQSxhQUFvQzs7O0FDQXREO0FBQUEsRUFXRTtBQUFBLE9BQ0s7QUFzQ0EsSUFBTSx5QkFBeUIsQ0FBQyxRQUFxQztBQUMxRSxTQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxLQUFLLEtBQUssU0FBUyxZQUFZLEdBQUc7QUFBQSxFQUNwQztBQUNGOzs7QURwRE8sU0FBUyxRQUFRLEtBQXNDO0FBQzVELFFBQU07QUFBQSxJQUNKLE1BQU0sRUFBRSxHQUFHO0FBQUEsRUFDYixJQUFJO0FBRUosU0FBTyx1QkFBdUIsRUFBRSxHQUFHLENBQUM7QUFDdEM7QUFJTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxRQUFNLEVBQUUsT0FBTyxPQUFPLElBQUk7QUFDMUIsTUFBSSxPQUFPO0FBQ1QsV0FBT0MsTUFBSyxZQUFZLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTTtBQUFBLEVBQzNEO0FBQ0EsU0FBTyxJQUFJO0FBQ2I7IiwKICAibmFtZXMiOiBbInV0aWwiLCAidXRpbCJdCn0K

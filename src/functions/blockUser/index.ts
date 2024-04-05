const { TABLE_CONVERSATION, TABLE_USER, TABLE_USERCONVERSATION } = process.env;
import { UserConversation } from '/opt/API';
import { DynamoDBClient, ReturnValue } from '@aws-sdk/client-dynamodb';
import {
  QueryCommand,
  UpdateCommand,
  DynamoDBDocumentClient,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';

const DdbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DdbClient);
import { uniqueArrayOfObjects } from '/opt/utils';

import { batchGet } from '/opt/dynamoDB';
import { appSyncRequest } from '/opt/appsync';
import {
  deleteConversation,
  deleteUserConversation,
} from '/opt/graphql/mutations';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { AppSyncResolverHandler } from 'aws-lambda';

/**
 * Query user conversations by the user making request and filter by user being blocked
 * @param userId
 * @param blockUserId
 */
const queryUserConversations = async (
  userId: string,
  blockUserId: string
): Promise<any> => {
  const params = {
    TableName: TABLE_USERCONVERSATION,
    IndexName: 'userConversationsByUser',
    KeyConditionExpression: '#userId = :userId',
    FilterExpression: 'contains(#users, :blockUserId)',
    ExpressionAttributeNames: {
      '#userId': 'userId',
      '#users': 'users',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
      ':blockUserId': blockUserId,
    },
  };
  const command = new QueryCommand(params);
  const userData = await docClient.send(command);
  return userData.Items;
};
/**
 * Update user that is blocking another user
 *
 * @param userId
 * @param blockUserId
 */
const updateUserBlocking = async (
  userId: string,
  blockUserId: string
): Promise<any> => {
  const params: UpdateCommandInput = {
    TableName: TABLE_USER,
    Key: { id: userId },
    UpdateExpression: 'SET #blocked = list_append(#blocked, :blocked)',
    ExpressionAttributeNames: {
      '#blocked': 'blocked',
    },
    ExpressionAttributeValues: {
      ':blocked': [blockUserId],
    },
    ReturnValues: ReturnValue.ALL_NEW,
  };

  const command = new UpdateCommand(params);
  const data = await docClient.send(command);
  return data.Attributes;
};

/**
 * Update user being blocked
 *
 * @param userId
 * @param blockUserId
 * @param reason
 */
const updateBlockedUser = async (
  userId: string,
  blockUserId: string,
  reason: string
) => {
  const params = {
    TableName: TABLE_USER,
    Key: { id: blockUserId },
    UpdateExpression:
      'SET #blockedBy = list_append(#blockedBy, :blockedBy), #reportReasons = list_append(#reportReasons, :reportReasons)',
    ExpressionAttributeNames: {
      '#blockedBy': 'blockedBy',
      '#reportReasons': 'reportReasons',
    },
    ExpressionAttributeValues: {
      ':blockedBy': [userId],
      ':reportReasons': [reason],
    },
  };

  const command = new UpdateCommand(params);
  const data = await docClient.send(command);
  return data.Attributes;
};

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  console.log('EVENT RECEIVED: ', ctx);
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { userId, reason } = ctx.arguments.input;

  let userConversations: UserConversation[] = [];
  try {
    const userConvos: UserConversation[] = await queryUserConversations(
      sub,
      userId
    );
    const blockedUserConvos: UserConversation[] = await queryUserConversations(
      userId,
      sub
    );
    if (userConvos?.length) {
      userConversations = [...userConversations, ...userConvos];
    }

    if (blockedUserConvos?.length) {
      userConversations = [...userConversations, ...blockedUserConvos];
    }

    console.log('userConversations: ', userConversations);
  } catch (err: any) {
    console.log('ERROR scan userConversations: ', err);
  }

  if (userConversations?.length > 0) {
    // get conversation ids
    const uniqueConversations: any[] = uniqueArrayOfObjects(
      userConversations,
      'conversationId'
    );
    console.log('unique conversations: ', uniqueConversations);
    const conversationIds = uniqueConversations.map((userConversation) => ({
      id: userConversation.conversationId,
    }));
    console.log('conversationIds: ', conversationIds);
    let conversations = [];
    try {
      conversations = await batchGet({
        tableName: TABLE_CONVERSATION ?? '',
        keys: conversationIds,
      });
      console.log('conversations: ', conversations);
    } catch (err: any) {
      console.log('ERROR get conversations: ', err);
    }

    // delete conversations
    if (conversations?.length > 0) {
      for (let i = 0; i < conversations.length; i++) {
        const conversation = conversations[i];

        if (conversation?.id) {
          try {
            const body = {
              query: deleteConversation,
              //operationName: 'DeleteConversation',
              variables: {
                input: {
                  id: conversation.id,
                },
              },
            };

            const result = await appSyncRequest(body);
            console.log('DeleteConversation result: ', result);
          } catch (err: any) {
            console.log('ERROR delete conversation: ', err);
          }
        }
      }
    }

    // delete user conversations
    for (let i = 0; i < userConversations.length; i++) {
      const userConversation = userConversations[i];
      if (userConversation?.id) {
        try {
          const body = {
            query: deleteUserConversation,
            //operationName: 'DeleteUserConversation',
            variables: {
              input: {
                id: userConversation.id,
              },
            },
          };

          const result = await appSyncRequest(body);
          console.log('DeleteUserConversation result: ', result);
        } catch (err: any) {
          console.log('ERROR delete user conversation: ', err);
        }
      }
    }
  }

  try {
    await updateBlockedUser(sub, userId, reason);
  } catch (err: any) {
    console.log('ERROR update blocked user: ', err);
  }

  let updatedUser;
  try {
    updatedUser = await updateUserBlocking(sub, userId);
    console.log('updatedUser: ', updatedUser);
    return updatedUser;
  } catch (err: any) {
    console.log('ERROR updating blocking user: ', err);
    throw new Error(err.message);
  }
};

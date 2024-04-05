import {
  PinpointClient,
  SendUsersMessagesCommand,
  SendUsersMessagesCommandInput,
} from '@aws-sdk/client-pinpoint';
import {
  PinpointEmail,
  SendEmailCommand,
} from '@aws-sdk/client-pinpoint-email';

const pinpointEmail = new PinpointEmail({});
const pinpoint = new PinpointClient({});

type SendEmailProps = {
  senderAddress: string;
  toAddresses: string[];
  templateArn: string;
  templateName: null | number;
  templateData: Record<any, any>;
};
export const sendEmail = async ({
  senderAddress,
  toAddresses,
  templateArn,
  templateName,
  templateData,
}: SendEmailProps) => {
  const input = {
    FromEmailAddress: senderAddress,
    Content: {
      Template: {
        TemplateArn: `${templateArn}/${templateName}/EMAIL`,
        TemplateData: JSON.stringify(templateData),
      },
    },
    Destination: {
      ToAddresses: toAddresses,
    },
  };

  const command = new SendEmailCommand(input);
  return pinpointEmail.send(command);
};

interface SendPushNotificationProps {
  pinpointAppId: string;
  userId: string;
  title: string;
  message: string;
  badgeCount?: null | number;
  data?: Record<any, any>;
}

export const sendPushNotification = async ({
  pinpointAppId,
  userId,
  title,
  message,
  badgeCount = null,
  data = {},
}: SendPushNotificationProps) => {
  const input: SendUsersMessagesCommandInput = {
    ApplicationId: pinpointAppId,
    SendUsersMessageRequest: {
      Users: {
        [userId]: {},
      },
      MessageConfiguration: {
        APNSMessage: {
          Action: 'OPEN_APP',
          Title: title,
          SilentPush: false,
          Sound: 'default',
          Body: message,
          Data: data,
        },
        GCMMessage: {
          Action: 'OPEN_APP',
          Title: title,
          SilentPush: false,
          Sound: 'default',
          Body: message,
          Data: data,
        },
      },
    },
  };

  if (
    badgeCount &&
    input?.SendUsersMessageRequest?.MessageConfiguration?.APNSMessage
  ) {
    input.SendUsersMessageRequest.MessageConfiguration.APNSMessage.Badge =
      badgeCount;
  }

  const command = new SendUsersMessagesCommand(input);
  return pinpoint.send(command);
};

interface SendUsersPushNotificationProps {
  pinpointAppId: string;
  userIds: string[];
  title: string;
  message: string;
  badgeCount?: null | number;
  data?: Record<any, any>;
}
export const sendUsersPushNotification = async ({
  pinpointAppId,
  userIds,
  title,
  message,
  badgeCount = null,
  data = {},
}: SendUsersPushNotificationProps) => {
  // map data for sending push notifications to users
  const usersData: Record<string, any> = {};
  userIds.forEach((userId) => {
    usersData[userId] = {};
  });

  const input: SendUsersMessagesCommandInput = {
    ApplicationId: pinpointAppId,
    SendUsersMessageRequest: {
      Users: usersData,
      MessageConfiguration: {
        APNSMessage: {
          Action: 'OPEN_APP',
          Title: title,
          SilentPush: false,
          Sound: 'default',
          Body: message,
          Data: data,
        },
        GCMMessage: {
          Action: 'OPEN_APP',
          Title: title,
          SilentPush: false,
          Sound: 'default',
          Body: message,
          Data: data,
        },
      },
    },
  };

  if (
    badgeCount &&
    input?.SendUsersMessageRequest?.MessageConfiguration?.APNSMessage
  ) {
    input.SendUsersMessageRequest.MessageConfiguration.APNSMessage.Badge =
      badgeCount;
  }

  const command = new SendUsersMessagesCommand(input);
  return pinpoint.send(command);
};

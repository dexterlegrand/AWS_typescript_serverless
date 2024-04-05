import { appSyncRequest } from '/opt/appsync';
import { batchPut } from '/opt/dynamoDB';
import { createNotification } from '/opt/graphql/mutations';
import { getPhoneNumber } from '/opt/phone';
import { REGEX } from '/opt/utils';
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { uuid4 } from '@sentry/utils';
import { SQSEvent } from 'aws-lambda';
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import { ContactStatus, ContactType } from '/opt/API';

const { TABLE_CONTACT } = process.env;

const { REGION, STORAGE_BUCKETNAME } = process.env;

const s3 = new S3Client({ region: REGION, apiVersion: '2012-10-17' });

interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt: string;
  entityId: string | undefined;
  searchName: string;
  updatedAt: string;
  phone?: string; // Optional property
  companyName?: string; // Optional property
  owner: string | undefined;
  status?: ContactStatus;
  type?: ContactType;
}

const createErrorNotification = async ({
  userId,
  entityId,
  message,
}: {
  userId?: string;
  entityId?: string;
  message?: string;
}) => {
  if (userId && entityId) {
    try {
      //const createdAt = new Date().toISOString();
      // notify user contacts imported
      //const notificationParams = {
      //  id: uuid4(),
      //  owner: userId,
      //  entityId,
      //  status: NotificationStatus.UNREAD,
      //  type: 'error',
      //  title: 'ERROR_IMPORTING_CSV',
      //  message,
      //  createdAt,
      //  updatedAt: createdAt,
      //};

      const body = {
        query: createNotification,
        variables: {
          input: {
            title: 'ERROR_IMPORTING_CSV',
            message,
            status: 'UNREAD',
            type: 'error',
            owner: userId,
          },
        },
      };

      const result = await appSyncRequest(body);
      console.log('Create error notification result: ', result);

      //await createRecord(TABLE_NOTIFICATION ?? '', notificationParams);
    } catch (err: any) {
      console.log('ERROR creating notification: ', err);
      //throw new Error(err.message);
    }
  }
};

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    // parse message body
    let messageAttributes;
    try {
      messageAttributes = record.messageAttributes;
    } catch (err) {
      console.log('ERROR parsing message: ', err);
    }

    const entityId = messageAttributes?.entityId.stringValue;
    const userId = messageAttributes?.userId.stringValue;
    const identityId = messageAttributes?.identityId.stringValue;
    const fileKey = messageAttributes?.fileKey.stringValue;
    let fields: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      companyName: string;
    };

    if (messageAttributes?.fields.stringValue) {
      try {
        fields = JSON.parse(messageAttributes?.fields.stringValue);
        console.log('fields: ', fields);
      } catch (err) {
        console.log('ERROR parsing message: ', err);
        continue;
      }

      // query S3 file and parse records json
      const records: Record<any, any>[] = [];
      let csvData;
      try {
        const command = new GetObjectCommand({
          Bucket: STORAGE_BUCKETNAME,
          Key: `private/${identityId}/${fileKey}`,
        });

        csvData = await s3.send(command);
        console.log('S3 get object data: ', csvData);
      } catch (err: any) {
        console.log('ERROR get S3 file: ', err);
        await createErrorNotification({
          userId,
          entityId,
          message: `ERROR get S3 file: ${err?.message || ''}`,
        });
      }

      if (csvData?.Body) {
        const readableCSVStream = Readable.from(csvData.Body as Readable);

        const parseOptions = {
          columns: true, // Assumes first row of CSV are column names
          skip_empty_lines: true,
          relax_column_count: true,
        };
        const parser = readableCSVStream.pipe(parse(parseOptions));

        for await (const record of parser) {
          console.log('record of parser: ', record);
          records.push(record);
        }

        console.log('records: ', records);

        try {
          // filter records that don't have an email or dont have either firstname lastname OR company name
          const filteredRecords = records.filter((record) => {
            const email = record?.[fields.email] ?? '';
            const firstName = record?.[fields.firstName] ?? '';
            const lastName = record?.[fields.lastName] ?? '';
            const companyName = record?.[fields.companyName] ?? '';

            return (
              email &&
              (firstName || lastName || companyName) &&
              REGEX.EMAIL.test(email)
            );
          });

          // map records for dynamodb batch put
          const mappedRecords = filteredRecords.map((record) => {
            const createdAt = new Date().toISOString();
            const firstName = record?.[fields.firstName] ?? '';
            const lastName = record?.[fields.lastName] ?? '';
            const email = record?.[fields.email] ?? '';

            // contact phone
            let phone;
            try {
              phone = getPhoneNumber(record?.[fields.phone] ?? '');
            } catch (err) {
              console.log('WARNING parsing phone number: ', err);
            }
            const companyName = record?.[fields.companyName] ?? '';
            const searchName = `${
              companyName || `${firstName} ${lastName}`
            } ${email}`
              .toLowerCase()
              .trim();

            const newContact: Contact = {
              id: uuid4(),
              createdAt,
              email,
              entityId,
              searchName,
              updatedAt: createdAt,
              owner: userId,
              status: ContactStatus.ACTIVE,
              type: ContactType.NORMAL,
            };

            if (firstName) {
              newContact.firstName = firstName;
            }

            if (lastName) {
              newContact.lastName = lastName;
            }

            if (phone) {
              newContact.phone = phone;
            }

            if (companyName) {
              newContact.companyName = companyName;
            }

            return newContact;
          });
          console.log('mappedRecords: ', mappedRecords);
          const batchResponse = await batchPut({
            tableName: TABLE_CONTACT ?? '',
            items: mappedRecords,
          });

          console.log('batchResponse:  ', batchResponse);
        } catch (err: any) {
          console.log('ERROR batch put contacts: ', err);
          await createErrorNotification({
            userId,
            entityId,
            message: 'ERROR batch put contacts: ',
          });
        }

        // delete s3 file
        try {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: STORAGE_BUCKETNAME,
            Key: `private/${identityId}/${fileKey}`,
          });

          const deleteResponse = await s3.send(deleteCommand);
          console.log('deleteResponse: ', deleteResponse);
        } catch (err: any) {
          console.log('ERROR deleting s3 file: ', err);
          await createErrorNotification({
            userId,
            entityId,
            message: `ERROR deleting s3 file: ${err?.message || ''}`,
          });
        }

        try {
          //const createdAt = new Date().toISOString();
          // notify user contacts imported
          //const notificationParams = {
          //  id: uuid4(),
          //  owner: userId,
          //  entityId,
          //  status: NotificationStatus.UNREAD,
          //  type: 'success',
          //  title: 'Your contacts have been imported',
          //  message: 'Your contacts have been imported successfully',
          //  //message: 'Error processing CSV file. Please try again or contact support.',
          //  createdAt,
          //  updatedAt: createdAt
          //};

          //await createRecord(TABLE_NOTIFICATION ?? '', notificationParams);
          const body = {
            query: createNotification,
            variables: {
              input: {
                title: 'SUCCESS_IMPORTED_CONTACTS',
                status: 'UNREAD',
                type: 'success',
                owner: userId,
              },
            },
          };

          const result = await appSyncRequest(body);
          console.log('Create notification result: ', result);
        } catch (err: any) {
          console.log('ERROR creating notification: ', err);
          await createErrorNotification({
            userId,
            entityId,
            message: 'ERROR creating notification: ',
          });
          //throw new Error(err.message);
        }

        //parser.on('end', async () => {
        //  console.log('end reached & records: ', records);
        //  // Create contact dynamoDB records
        //  try {
        //    const mappedRecords = records.map(record => {
        //      const createdAt = new Date().toISOString();
        //      return {
        //        id: uuid4(),
        //        firstName: record?.[fields.firstName] ?? '',
        //        lastName: record?.[fields.lastName] ?? '',
        //        email: record?.[fields.email] ?? '',
        //        phone: record?.[fields.phone] ?? '',
        //        companyName: record?.[fields.companyName] ?? '',
        //        createdAt,
        //        updatedAt: createdAt
        //      }
        //    });
        //    console.log('mappedRecords: ', mappedRecords);
        //    const batchResponse = await batchPut({
        //      tableName: TABLE_CONTACT ?? '',
        //      items: mappedRecords
        //    });
        //
        //    console.log('batchResponse:  ', batchResponse);
        //  } catch (err: any) {
        //    console.log('ERROR batch put contacts: ', err);
        //    throw new Error(err.message);
        //  }
        //
        //  // delete s3 file
        //  try {
        //    const deleteCommand = new DeleteObjectCommand({
        //      Bucket: STORAGE_BUCKETNAME,
        //      Key: `private/${identityId}/${fileKey}`
        //    });
        //
        //    const deleteResponse = await s3.send(deleteCommand);
        //    console.log('deleteResponse: ', deleteResponse);
        //  } catch (err: any) {
        //    console.log('ERROR deleting s3 file: ', err);
        //    throw new Error(err.message);
        //  }
        //
        //});
        //
        //parser.on('error', async (err) => {
        //  console.error('ERROR with parser: ', err.message);
        //  // create notification notifying user of error
        //  const createdAt = new Date().toISOString();
        //  const notificationParams = {
        //    id: uuid4(),
        //    userId,
        //    entityId,
        //    type: 'error',
        //    title: 'Error processing Contacts CSV file. Please try again or contact support',
        //    // message: 'Error processing Contacts CSV file. Please try again or contact support',
        //    createdAt,
        //    updatedAt: createdAt
        //  };
        //
        //  await createRecord(TABLE_NOTIFICATION ?? '', notificationParams);
        //});
      }
    }
  }
};

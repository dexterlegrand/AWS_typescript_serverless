/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createAdmin = /* GraphQL */ `
  mutation CreateAdmin($input: CreateAdminInput) {
    createAdmin(input: $input) {
      firstName
      lastName
      email
      phone
      role
      hasAccessed
      createdBy
      createdAt
      updatedAt
      id
      owner
    }
  }
`;
export const updateAdmin = /* GraphQL */ `
  mutation UpdateAdmin(
    $input: UpdateAdminInput!
    $condition: ModelAdminConditionInput
  ) {
    updateAdmin(input: $input, condition: $condition) {
      firstName
      lastName
      email
      phone
      role
      hasAccessed
      createdBy
      createdAt
      updatedAt
      id
      owner
    }
  }
`;
export const deleteAdmin = /* GraphQL */ `
  mutation DeleteAdmin($input: DeleteAdminInput) {
    deleteAdmin(input: $input) {
      firstName
      lastName
      email
      phone
      role
      hasAccessed
      createdBy
      createdAt
      updatedAt
      id
      owner
    }
  }
`;
export const createContact = /* GraphQL */ `
  mutation CreateContact($input: CreateContactInput!) {
    createContact(input: $input) {
      id
      entityId
      firstName
      lastName
      email
      phone
      companyName
      searchName
      status
      createdAt
      updatedAt
      contactType
      owner
    }
  }
`;
export const createContactBulkUpload = /* GraphQL */ `
  mutation CreateContactBulkUpload($input: CreateContactBulkImportInput!) {
    createContactBulkUpload(input: $input)
  }
`;
export const updateContact = /* GraphQL */ `
  mutation UpdateContact($input: UpdateContactInput!) {
    updateContact(input: $input) {
      id
      entityId
      firstName
      lastName
      email
      phone
      companyName
      searchName
      status
      createdAt
      updatedAt
      contactType
      owner
    }
  }
`;
export const createConversation = /* GraphQL */ `
  mutation CreateConversation(
    $input: CreateConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    createConversation(input: $input, condition: $condition) {
      title
      image {
        alt
        identityId
        key
        level
        type
      }
      country
      messages {
        items {
          conversationId
          text
          attachments {
            identityId
            key
            level
            type
          }
          users
          receiver
          sender
          createdBy
          readBy
          createdAt
          updatedAt
          id
          conversationMessagesId
        }
        nextToken
      }
      userConversations {
        items {
          conversationId
          conversation {
            title
            image {
              alt
              identityId
              key
              level
              type
            }
            country
            messages {
              nextToken
            }
            userConversations {
              nextToken
            }
            users
            readBy
            createdBy
            createdAt
            updatedAt
            id
          }
          userId
          user {
            id
            identityId
            email
            about
            firstName
            lastName
            phone
            blocked
            blockedBy
            country
            profileImg {
              alt
              identityId
              key
              level
              type
            }
            interests
            locale
            onboardingStatus
            onboardingEntity
            signatures {
              nextToken
            }
            teamId
            team {
              title
              ownerUserId
              createdAt
              updatedAt
              id
              owner
            }
            userType
            rating
            reportReasons
            notificationPreferences {
              email
              push
              sms
            }
            zaiUserId
            zaiUserWalletId
            zaiNppCrn
            ipAddress
            createdAt
            updatedAt
            owner
          }
          users
          createdAt
          updatedAt
          id
          conversationUserConversationsId
        }
        nextToken
      }
      users
      readBy
      createdBy
      createdAt
      updatedAt
      id
    }
  }
`;
export const updateConversation = /* GraphQL */ `
  mutation UpdateConversation(
    $input: UpdateConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    updateConversation(input: $input, condition: $condition) {
      title
      image {
        alt
        identityId
        key
        level
        type
      }
      country
      messages {
        items {
          conversationId
          text
          attachments {
            identityId
            key
            level
            type
          }
          users
          receiver
          sender
          createdBy
          readBy
          createdAt
          updatedAt
          id
          conversationMessagesId
        }
        nextToken
      }
      userConversations {
        items {
          conversationId
          conversation {
            title
            image {
              alt
              identityId
              key
              level
              type
            }
            country
            messages {
              nextToken
            }
            userConversations {
              nextToken
            }
            users
            readBy
            createdBy
            createdAt
            updatedAt
            id
          }
          userId
          user {
            id
            identityId
            email
            about
            firstName
            lastName
            phone
            blocked
            blockedBy
            country
            profileImg {
              alt
              identityId
              key
              level
              type
            }
            interests
            locale
            onboardingStatus
            onboardingEntity
            signatures {
              nextToken
            }
            teamId
            team {
              title
              ownerUserId
              createdAt
              updatedAt
              id
              owner
            }
            userType
            rating
            reportReasons
            notificationPreferences {
              email
              push
              sms
            }
            zaiUserId
            zaiUserWalletId
            zaiNppCrn
            ipAddress
            createdAt
            updatedAt
            owner
          }
          users
          createdAt
          updatedAt
          id
          conversationUserConversationsId
        }
        nextToken
      }
      users
      readBy
      createdBy
      createdAt
      updatedAt
      id
    }
  }
`;
export const deleteConversation = /* GraphQL */ `
  mutation DeleteConversation(
    $input: DeleteConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    deleteConversation(input: $input, condition: $condition) {
      title
      image {
        alt
        identityId
        key
        level
        type
      }
      country
      messages {
        items {
          conversationId
          text
          attachments {
            identityId
            key
            level
            type
          }
          users
          receiver
          sender
          createdBy
          readBy
          createdAt
          updatedAt
          id
          conversationMessagesId
        }
        nextToken
      }
      userConversations {
        items {
          conversationId
          conversation {
            title
            image {
              alt
              identityId
              key
              level
              type
            }
            country
            messages {
              nextToken
            }
            userConversations {
              nextToken
            }
            users
            readBy
            createdBy
            createdAt
            updatedAt
            id
          }
          userId
          user {
            id
            identityId
            email
            about
            firstName
            lastName
            phone
            blocked
            blockedBy
            country
            profileImg {
              alt
              identityId
              key
              level
              type
            }
            interests
            locale
            onboardingStatus
            onboardingEntity
            signatures {
              nextToken
            }
            teamId
            team {
              title
              ownerUserId
              createdAt
              updatedAt
              id
              owner
            }
            userType
            rating
            reportReasons
            notificationPreferences {
              email
              push
              sms
            }
            zaiUserId
            zaiUserWalletId
            zaiNppCrn
            ipAddress
            createdAt
            updatedAt
            owner
          }
          users
          createdAt
          updatedAt
          id
          conversationUserConversationsId
        }
        nextToken
      }
      users
      readBy
      createdBy
      createdAt
      updatedAt
      id
    }
  }
`;
export const createEntity = /* GraphQL */ `
  mutation CreateEntity($input: CreateEntityInput!) {
    createEntity(input: $input) {
      id
      type
      taxNumber
      billerCode
      name
      legalName
      searchName
      address {
        placeId
        contactName
        contactNumber
        address1
        unitNumber
        streetNumber
        streetName
        streetType
        city
        country
        countryCode
        state
        stateCode
        postalCode
      }
      logo {
        alt
        identityId
        key
        level
        type
      }
      beneficialOwners {
        items {
          id
          entityId
          firstName
          lastName
          providerEntityId
          verificationStatus
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      entityUsers {
        items {
          id
          entityId
          userId
          firstName
          lastName
          role
          entitySearchName
          entity {
            id
            type
            taxNumber
            billerCode
            name
            legalName
            searchName
            address {
              placeId
              contactName
              contactNumber
              address1
              unitNumber
              streetNumber
              streetName
              streetType
              city
              country
              countryCode
              state
              stateCode
              postalCode
            }
            logo {
              alt
              identityId
              key
              level
              type
            }
            beneficialOwners {
              nextToken
            }
            entityUsers {
              nextToken
            }
            zaiCompanyId
            zaiBankAccountId
            zaiDigitalWalletId
            zaiBpayCrn
            contact {
              firstName
              lastName
              email
            }
            phone
            paymentMethods {
              nextToken
            }
            paymentMethodId
            disbursementMethodId
            receivingAccounts {
              nextToken
            }
            ocrEmail
            verificationStatus
            createdAt
            updatedAt
            owner
          }
          searchName
          createdBy
          createdAt
          updatedAt
        }
        nextToken
      }
      zaiCompanyId
      zaiBankAccountId
      zaiDigitalWalletId
      zaiBpayCrn
      contact {
        firstName
        lastName
        email
      }
      phone
      paymentMethods {
        items {
          id
          paymentMethodType
          type
          fullName
          number
          expMonth
          expYear
          accountName
          bankName
          accountNumber
          routingNumber
          holderType
          accountType
          status
          accountDirection
          expiresAt
          createdAt
          updatedAt
        }
        nextToken
      }
      paymentMethodId
      disbursementMethodId
      receivingAccounts {
        items {
          id
          paymentMethodType
          type
          fullName
          number
          expMonth
          expYear
          accountName
          bankName
          accountNumber
          routingNumber
          holderType
          accountType
          status
          accountDirection
          expiresAt
          createdAt
          updatedAt
        }
        nextToken
      }
      ocrEmail
      verificationStatus
      createdAt
      updatedAt
      owner
    }
  }
`;
export const updateEntity = /* GraphQL */ `
  mutation UpdateEntity($input: UpdateEntityInput!) {
    updateEntity(input: $input) {
      id
      type
      taxNumber
      billerCode
      name
      legalName
      searchName
      address {
        placeId
        contactName
        contactNumber
        address1
        unitNumber
        streetNumber
        streetName
        streetType
        city
        country
        countryCode
        state
        stateCode
        postalCode
      }
      logo {
        alt
        identityId
        key
        level
        type
      }
      beneficialOwners {
        items {
          id
          entityId
          firstName
          lastName
          providerEntityId
          verificationStatus
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      entityUsers {
        items {
          id
          entityId
          userId
          firstName
          lastName
          role
          entitySearchName
          entity {
            id
            type
            taxNumber
            billerCode
            name
            legalName
            searchName
            address {
              placeId
              contactName
              contactNumber
              address1
              unitNumber
              streetNumber
              streetName
              streetType
              city
              country
              countryCode
              state
              stateCode
              postalCode
            }
            logo {
              alt
              identityId
              key
              level
              type
            }
            beneficialOwners {
              nextToken
            }
            entityUsers {
              nextToken
            }
            zaiCompanyId
            zaiBankAccountId
            zaiDigitalWalletId
            zaiBpayCrn
            contact {
              firstName
              lastName
              email
            }
            phone
            paymentMethods {
              nextToken
            }
            paymentMethodId
            disbursementMethodId
            receivingAccounts {
              nextToken
            }
            ocrEmail
            verificationStatus
            createdAt
            updatedAt
            owner
          }
          searchName
          createdBy
          createdAt
          updatedAt
        }
        nextToken
      }
      zaiCompanyId
      zaiBankAccountId
      zaiDigitalWalletId
      zaiBpayCrn
      contact {
        firstName
        lastName
        email
      }
      phone
      paymentMethods {
        items {
          id
          paymentMethodType
          type
          fullName
          number
          expMonth
          expYear
          accountName
          bankName
          accountNumber
          routingNumber
          holderType
          accountType
          status
          accountDirection
          expiresAt
          createdAt
          updatedAt
        }
        nextToken
      }
      paymentMethodId
      disbursementMethodId
      receivingAccounts {
        items {
          id
          paymentMethodType
          type
          fullName
          number
          expMonth
          expYear
          accountName
          bankName
          accountNumber
          routingNumber
          holderType
          accountType
          status
          accountDirection
          expiresAt
          createdAt
          updatedAt
        }
        nextToken
      }
      ocrEmail
      verificationStatus
      createdAt
      updatedAt
      owner
    }
  }
`;
export const deleteEntity = /* GraphQL */ `
  mutation DeleteEntity(
    $input: DeleteEntityInput!
    $condition: ModelEntityConditionInput
  ) {
    deleteEntity(input: $input, condition: $condition) {
      id
      type
      taxNumber
      billerCode
      name
      legalName
      searchName
      address {
        placeId
        contactName
        contactNumber
        address1
        unitNumber
        streetNumber
        streetName
        streetType
        city
        country
        countryCode
        state
        stateCode
        postalCode
      }
      logo {
        alt
        identityId
        key
        level
        type
      }
      beneficialOwners {
        items {
          id
          entityId
          firstName
          lastName
          providerEntityId
          verificationStatus
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      entityUsers {
        items {
          id
          entityId
          userId
          firstName
          lastName
          role
          entitySearchName
          entity {
            id
            type
            taxNumber
            billerCode
            name
            legalName
            searchName
            address {
              placeId
              contactName
              contactNumber
              address1
              unitNumber
              streetNumber
              streetName
              streetType
              city
              country
              countryCode
              state
              stateCode
              postalCode
            }
            logo {
              alt
              identityId
              key
              level
              type
            }
            beneficialOwners {
              nextToken
            }
            entityUsers {
              nextToken
            }
            zaiCompanyId
            zaiBankAccountId
            zaiDigitalWalletId
            zaiBpayCrn
            contact {
              firstName
              lastName
              email
            }
            phone
            paymentMethods {
              nextToken
            }
            paymentMethodId
            disbursementMethodId
            receivingAccounts {
              nextToken
            }
            ocrEmail
            verificationStatus
            createdAt
            updatedAt
            owner
          }
          searchName
          createdBy
          createdAt
          updatedAt
        }
        nextToken
      }
      zaiCompanyId
      zaiBankAccountId
      zaiDigitalWalletId
      zaiBpayCrn
      contact {
        firstName
        lastName
        email
      }
      phone
      paymentMethods {
        items {
          id
          paymentMethodType
          type
          fullName
          number
          expMonth
          expYear
          accountName
          bankName
          accountNumber
          routingNumber
          holderType
          accountType
          status
          accountDirection
          expiresAt
          createdAt
          updatedAt
        }
        nextToken
      }
      paymentMethodId
      disbursementMethodId
      receivingAccounts {
        items {
          id
          paymentMethodType
          type
          fullName
          number
          expMonth
          expYear
          accountName
          bankName
          accountNumber
          routingNumber
          holderType
          accountType
          status
          accountDirection
          expiresAt
          createdAt
          updatedAt
        }
        nextToken
      }
      ocrEmail
      verificationStatus
      createdAt
      updatedAt
      owner
    }
  }
`;
export const createEntityUser = /* GraphQL */ `
  mutation CreateEntityUser($input: CreateEntityUserInput!) {
    createEntityUser(input: $input) {
      id
      entityId
      userId
      firstName
      lastName
      role
      entitySearchName
      entity {
        id
        type
        taxNumber
        billerCode
        name
        legalName
        searchName
        address {
          placeId
          contactName
          contactNumber
          address1
          unitNumber
          streetNumber
          streetName
          streetType
          city
          country
          countryCode
          state
          stateCode
          postalCode
        }
        logo {
          alt
          identityId
          key
          level
          type
        }
        beneficialOwners {
          items {
            id
            entityId
            firstName
            lastName
            providerEntityId
            verificationStatus
            createdAt
            updatedAt
            owner
          }
          nextToken
        }
        entityUsers {
          items {
            id
            entityId
            userId
            firstName
            lastName
            role
            entitySearchName
            entity {
              id
              type
              taxNumber
              billerCode
              name
              legalName
              searchName
              zaiCompanyId
              zaiBankAccountId
              zaiDigitalWalletId
              zaiBpayCrn
              phone
              paymentMethodId
              disbursementMethodId
              ocrEmail
              verificationStatus
              createdAt
              updatedAt
              owner
            }
            searchName
            createdBy
            createdAt
            updatedAt
          }
          nextToken
        }
        zaiCompanyId
        zaiBankAccountId
        zaiDigitalWalletId
        zaiBpayCrn
        contact {
          firstName
          lastName
          email
        }
        phone
        paymentMethods {
          items {
            id
            paymentMethodType
            type
            fullName
            number
            expMonth
            expYear
            accountName
            bankName
            accountNumber
            routingNumber
            holderType
            accountType
            status
            accountDirection
            expiresAt
            createdAt
            updatedAt
          }
          nextToken
        }
        paymentMethodId
        disbursementMethodId
        receivingAccounts {
          items {
            id
            paymentMethodType
            type
            fullName
            number
            expMonth
            expYear
            accountName
            bankName
            accountNumber
            routingNumber
            holderType
            accountType
            status
            accountDirection
            expiresAt
            createdAt
            updatedAt
          }
          nextToken
        }
        ocrEmail
        verificationStatus
        createdAt
        updatedAt
        owner
      }
      searchName
      createdBy
      createdAt
      updatedAt
    }
  }
`;
export const deleteEntityUser = /* GraphQL */ `
  mutation DeleteEntityUser($input: DeleteEntityUserInput) {
    deleteEntityUser(input: $input) {
      id
      entityId
      userId
      firstName
      lastName
      role
      entitySearchName
      entity {
        id
        type
        taxNumber
        billerCode
        name
        legalName
        searchName
        address {
          placeId
          contactName
          contactNumber
          address1
          unitNumber
          streetNumber
          streetName
          streetType
          city
          country
          countryCode
          state
          stateCode
          postalCode
        }
        logo {
          alt
          identityId
          key
          level
          type
        }
        beneficialOwners {
          items {
            id
            entityId
            firstName
            lastName
            providerEntityId
            verificationStatus
            createdAt
            updatedAt
            owner
          }
          nextToken
        }
        entityUsers {
          items {
            id
            entityId
            userId
            firstName
            lastName
            role
            entitySearchName
            entity {
              id
              type
              taxNumber
              billerCode
              name
              legalName
              searchName
              zaiCompanyId
              zaiBankAccountId
              zaiDigitalWalletId
              zaiBpayCrn
              phone
              paymentMethodId
              disbursementMethodId
              ocrEmail
              verificationStatus
              createdAt
              updatedAt
              owner
            }
            searchName
            createdBy
            createdAt
            updatedAt
          }
          nextToken
        }
        zaiCompanyId
        zaiBankAccountId
        zaiDigitalWalletId
        zaiBpayCrn
        contact {
          firstName
          lastName
          email
        }
        phone
        paymentMethods {
          items {
            id
            paymentMethodType
            type
            fullName
            number
            expMonth
            expYear
            accountName
            bankName
            accountNumber
            routingNumber
            holderType
            accountType
            status
            accountDirection
            expiresAt
            createdAt
            updatedAt
          }
          nextToken
        }
        paymentMethodId
        disbursementMethodId
        receivingAccounts {
          items {
            id
            paymentMethodType
            type
            fullName
            number
            expMonth
            expYear
            accountName
            bankName
            accountNumber
            routingNumber
            holderType
            accountType
            status
            accountDirection
            expiresAt
            createdAt
            updatedAt
          }
          nextToken
        }
        ocrEmail
        verificationStatus
        createdAt
        updatedAt
        owner
      }
      searchName
      createdBy
      createdAt
      updatedAt
    }
  }
`;
export const createVerificationToken = /* GraphQL */ `
  mutation CreateVerificationToken($input: CreateVerificationTokenInput) {
    createVerificationToken(input: $input) {
      token
    }
  }
`;
export const lookupEntityOwnership = /* GraphQL */ `
  mutation LookupEntityOwnership($input: LookupEntityOwnershipInput) {
    lookupEntityOwnership(input: $input)
  }
`;
export const createMessage = /* GraphQL */ `
  mutation CreateMessage(
    $input: CreateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    createMessage(input: $input, condition: $condition) {
      conversationId
      text
      attachments {
        identityId
        key
        level
        type
      }
      users
      receiver
      sender
      createdBy
      readBy
      createdAt
      updatedAt
      id
      conversationMessagesId
    }
  }
`;
export const updateMessage = /* GraphQL */ `
  mutation UpdateMessage(
    $input: UpdateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    updateMessage(input: $input, condition: $condition) {
      conversationId
      text
      attachments {
        identityId
        key
        level
        type
      }
      users
      receiver
      sender
      createdBy
      readBy
      createdAt
      updatedAt
      id
      conversationMessagesId
    }
  }
`;
export const createNotification = /* GraphQL */ `
  mutation CreateNotification($input: CreateNotificationInput) {
    createNotification(input: $input) {
      id
      title
      message
      status
      createdAt
      updatedAt
      type
      owner
    }
  }
`;
export const updateNotification = /* GraphQL */ `
  mutation UpdateNotification($input: UpdateNotificationInput) {
    updateNotification(input: $input) {
      id
      title
      message
      status
      createdAt
      updatedAt
      type
      owner
    }
  }
`;
export const createOption = /* GraphQL */ `
  mutation CreateOption(
    $input: CreateOptionInput!
    $condition: ModelOptionConditionInput
  ) {
    createOption(input: $input, condition: $condition) {
      name
      label
      value
      group
      createdAt
      updatedAt
      id
    }
  }
`;
export const updateOption = /* GraphQL */ `
  mutation UpdateOption(
    $input: UpdateOptionInput!
    $condition: ModelOptionConditionInput
  ) {
    updateOption(input: $input, condition: $condition) {
      name
      label
      value
      group
      createdAt
      updatedAt
      id
    }
  }
`;
export const deleteOption = /* GraphQL */ `
  mutation DeleteOption(
    $input: DeleteOptionInput!
    $condition: ModelOptionConditionInput
  ) {
    deleteOption(input: $input, condition: $condition) {
      name
      label
      value
      group
      createdAt
      updatedAt
      id
    }
  }
`;
export const createPayment = /* GraphQL */ `
  mutation CreatePayment($input: CreatePaymentInput) {
    createPayment(input: $input) {
      id
      paymentGroupId
      providerTransactionId
      paymentProvider
      disbursementId
      fromId
      toId
      toType
      entityIdTo
      amount
      installment
      installments
      feeAmount
      paymentType
      taxAmount
      currency
      feeId
      ipAddress
      status
      scheduledAt
      paidAt
      declinedAt
      createdAt
      zaiUpdatedAt
      updatedAt
      owner
    }
  }
`;
export const retryPayment = /* GraphQL */ `
  mutation RetryPayment($input: RetryPaymentInput) {
    retryPayment(input: $input) {
      id
      paymentGroupId
      providerTransactionId
      paymentProvider
      disbursementId
      fromId
      toId
      toType
      entityIdTo
      amount
      installment
      installments
      feeAmount
      paymentType
      taxAmount
      currency
      feeId
      ipAddress
      status
      scheduledAt
      paidAt
      declinedAt
      createdAt
      zaiUpdatedAt
      updatedAt
      owner
    }
  }
`;
export const createTaskPayment = /* GraphQL */ `
  mutation CreateTaskPayment($input: CreateTaskPaymentInput) {
    createTaskPayment(input: $input) {
      id
      paymentGroupId
      providerTransactionId
      paymentProvider
      disbursementId
      fromId
      toId
      toType
      entityIdTo
      amount
      installment
      installments
      feeAmount
      paymentType
      taxAmount
      currency
      feeId
      ipAddress
      status
      scheduledAt
      paidAt
      declinedAt
      createdAt
      zaiUpdatedAt
      updatedAt
      owner
    }
  }
`;
export const createPaymentMethod = /* GraphQL */ `
  mutation CreatePaymentMethod($input: CreatePaymentMethodInput) {
    createPaymentMethod(input: $input) {
      id
      paymentMethodType
      type
      fullName
      number
      expMonth
      expYear
      accountName
      bankName
      accountNumber
      routingNumber
      holderType
      accountType
      status
      accountDirection
      expiresAt
      createdAt
      updatedAt
    }
  }
`;
export const updatePaymentMethod = /* GraphQL */ `
  mutation UpdatePaymentMethod($input: UpdatePaymentMethodInput) {
    updatePaymentMethod(input: $input) {
      id
      paymentMethodType
      type
      fullName
      number
      expMonth
      expYear
      accountName
      bankName
      accountNumber
      routingNumber
      holderType
      accountType
      status
      accountDirection
      expiresAt
      createdAt
      updatedAt
    }
  }
`;
export const createPushNotification = /* GraphQL */ `
  mutation CreatePushNotification($input: CreatePushNotificationInput) {
    createPushNotification(input: $input)
  }
`;
export const updateRating = /* GraphQL */ `
  mutation UpdateRating($input: UpdateRatingInput) {
    updateRating(input: $input) {
      id
      ratingBy
      owner
      name
      rating
      comment
      status
      createdAt
      updatedAt
    }
  }
`;
export const createSignature = /* GraphQL */ `
  mutation CreateSignature($input: CreateSignatureInput) {
    createSignature(input: $input) {
      id
      userId
      key
      createdAt
      updatedAt
    }
  }
`;
export const deleteSignature = /* GraphQL */ `
  mutation DeleteSignature($input: DeleteSignatureInput) {
    deleteSignature(input: $input) {
      id
      userId
      key
      createdAt
      updatedAt
    }
  }
`;
export const createTask = /* GraphQL */ `
  mutation CreateTask($input: CreateTaskInput) {
    createTask(input: $input) {
      entityId
      id
      activity {
        items {
          id
          compositeId
          userId
          entityId
          type
          message
          createdAt
          updatedAt
        }
        nextToken
      }
      amount
      annotations
      entityIdFrom
      fromId
      toId
      toType
      entityIdTo
      contactIdFrom
      contactIdTo
      contactId
      fromSearchStatus
      toSearchStatus
      searchName
      status
      signatureStatus
      paymentStatus
      type
      documents {
        identityId
        key
        level
        type
      }
      paymentFrequency
      paymentTypes
      reference
      signers {
        id
        entityId
        userId
        firstName
        lastName
        role
        entitySearchName
        entity {
          id
          type
          taxNumber
          billerCode
          name
          legalName
          searchName
          address {
            placeId
            contactName
            contactNumber
            address1
            unitNumber
            streetNumber
            streetName
            streetType
            city
            country
            countryCode
            state
            stateCode
            postalCode
          }
          logo {
            alt
            identityId
            key
            level
            type
          }
          beneficialOwners {
            items {
              id
              entityId
              firstName
              lastName
              providerEntityId
              verificationStatus
              createdAt
              updatedAt
              owner
            }
            nextToken
          }
          entityUsers {
            items {
              id
              entityId
              userId
              firstName
              lastName
              role
              entitySearchName
              searchName
              createdBy
              createdAt
              updatedAt
            }
            nextToken
          }
          zaiCompanyId
          zaiBankAccountId
          zaiDigitalWalletId
          zaiBpayCrn
          contact {
            firstName
            lastName
            email
          }
          phone
          paymentMethods {
            items {
              id
              paymentMethodType
              type
              fullName
              number
              expMonth
              expYear
              accountName
              bankName
              accountNumber
              routingNumber
              holderType
              accountType
              status
              accountDirection
              expiresAt
              createdAt
              updatedAt
            }
            nextToken
          }
          paymentMethodId
          disbursementMethodId
          receivingAccounts {
            items {
              id
              paymentMethodType
              type
              fullName
              number
              expMonth
              expYear
              accountName
              bankName
              accountNumber
              routingNumber
              holderType
              accountType
              status
              accountDirection
              expiresAt
              createdAt
              updatedAt
            }
            nextToken
          }
          ocrEmail
          verificationStatus
          createdAt
          updatedAt
          owner
        }
        searchName
        createdBy
        createdAt
        updatedAt
      }
      payments {
        items {
          id
          paymentGroupId
          providerTransactionId
          paymentProvider
          disbursementId
          fromId
          toId
          toType
          entityIdTo
          amount
          installment
          installments
          feeAmount
          paymentType
          taxAmount
          currency
          feeId
          ipAddress
          status
          scheduledAt
          paidAt
          declinedAt
          createdAt
          zaiUpdatedAt
          updatedAt
          owner
        }
        nextToken
      }
      taskPayments {
        items {
          id
          taskId
          paymentId
          payment {
            id
            paymentGroupId
            providerTransactionId
            paymentProvider
            disbursementId
            fromId
            toId
            toType
            entityIdTo
            amount
            installment
            installments
            feeAmount
            paymentType
            taxAmount
            currency
            feeId
            ipAddress
            status
            scheduledAt
            paidAt
            declinedAt
            createdAt
            zaiUpdatedAt
            updatedAt
            owner
          }
          createdAt
          updatedAt
        }
        nextToken
      }
      createdBy
      entityIdBy
      dueAt
      noteForSelf
      noteForOther
      direction
      readBy
      paymentAt
      lodgementAt
      createdAt
      updatedAt
      readAt
      owner
    }
  }
`;
export const updateTask = /* GraphQL */ `
  mutation UpdateTask($input: UpdateTaskInput) {
    updateTask(input: $input) {
      entityId
      id
      activity {
        items {
          id
          compositeId
          userId
          entityId
          type
          message
          createdAt
          updatedAt
        }
        nextToken
      }
      amount
      annotations
      entityIdFrom
      fromId
      toId
      toType
      entityIdTo
      contactIdFrom
      contactIdTo
      contactId
      fromSearchStatus
      toSearchStatus
      searchName
      status
      signatureStatus
      paymentStatus
      type
      documents {
        identityId
        key
        level
        type
      }
      paymentFrequency
      paymentTypes
      reference
      signers {
        id
        entityId
        userId
        firstName
        lastName
        role
        entitySearchName
        entity {
          id
          type
          taxNumber
          billerCode
          name
          legalName
          searchName
          address {
            placeId
            contactName
            contactNumber
            address1
            unitNumber
            streetNumber
            streetName
            streetType
            city
            country
            countryCode
            state
            stateCode
            postalCode
          }
          logo {
            alt
            identityId
            key
            level
            type
          }
          beneficialOwners {
            items {
              id
              entityId
              firstName
              lastName
              providerEntityId
              verificationStatus
              createdAt
              updatedAt
              owner
            }
            nextToken
          }
          entityUsers {
            items {
              id
              entityId
              userId
              firstName
              lastName
              role
              entitySearchName
              searchName
              createdBy
              createdAt
              updatedAt
            }
            nextToken
          }
          zaiCompanyId
          zaiBankAccountId
          zaiDigitalWalletId
          zaiBpayCrn
          contact {
            firstName
            lastName
            email
          }
          phone
          paymentMethods {
            items {
              id
              paymentMethodType
              type
              fullName
              number
              expMonth
              expYear
              accountName
              bankName
              accountNumber
              routingNumber
              holderType
              accountType
              status
              accountDirection
              expiresAt
              createdAt
              updatedAt
            }
            nextToken
          }
          paymentMethodId
          disbursementMethodId
          receivingAccounts {
            items {
              id
              paymentMethodType
              type
              fullName
              number
              expMonth
              expYear
              accountName
              bankName
              accountNumber
              routingNumber
              holderType
              accountType
              status
              accountDirection
              expiresAt
              createdAt
              updatedAt
            }
            nextToken
          }
          ocrEmail
          verificationStatus
          createdAt
          updatedAt
          owner
        }
        searchName
        createdBy
        createdAt
        updatedAt
      }
      payments {
        items {
          id
          paymentGroupId
          providerTransactionId
          paymentProvider
          disbursementId
          fromId
          toId
          toType
          entityIdTo
          amount
          installment
          installments
          feeAmount
          paymentType
          taxAmount
          currency
          feeId
          ipAddress
          status
          scheduledAt
          paidAt
          declinedAt
          createdAt
          zaiUpdatedAt
          updatedAt
          owner
        }
        nextToken
      }
      taskPayments {
        items {
          id
          taskId
          paymentId
          payment {
            id
            paymentGroupId
            providerTransactionId
            paymentProvider
            disbursementId
            fromId
            toId
            toType
            entityIdTo
            amount
            installment
            installments
            feeAmount
            paymentType
            taxAmount
            currency
            feeId
            ipAddress
            status
            scheduledAt
            paidAt
            declinedAt
            createdAt
            zaiUpdatedAt
            updatedAt
            owner
          }
          createdAt
          updatedAt
        }
        nextToken
      }
      createdBy
      entityIdBy
      dueAt
      noteForSelf
      noteForOther
      direction
      readBy
      paymentAt
      lodgementAt
      createdAt
      updatedAt
      readAt
      owner
    }
  }
`;
export const createTaskDocumentUrl = /* GraphQL */ `
  mutation CreateTaskDocumentUrl($input: CreateTaskDocumentUrlInput) {
    createTaskDocumentUrl(input: $input) {
      url
      expiresAt
    }
  }
`;
export const createTeam = /* GraphQL */ `
  mutation CreateTeam($input: CreateTeamInput) {
    createTeam(input: $input) {
      title
      teamUsers {
        items {
          teamId
          team {
            title
            teamUsers {
              nextToken
            }
            ownerUserId
            createdAt
            updatedAt
            id
            owner
          }
          userId
          user {
            id
            identityId
            email
            about
            firstName
            lastName
            phone
            blocked
            blockedBy
            country
            profileImg {
              alt
              identityId
              key
              level
              type
            }
            interests
            locale
            onboardingStatus
            onboardingEntity
            signatures {
              nextToken
            }
            teamId
            team {
              title
              ownerUserId
              createdAt
              updatedAt
              id
              owner
            }
            userType
            rating
            reportReasons
            notificationPreferences {
              email
              push
              sms
            }
            zaiUserId
            zaiUserWalletId
            zaiNppCrn
            ipAddress
            createdAt
            updatedAt
            owner
          }
          createdAt
          updatedAt
          owners
          id
          teamTeamUsersId
        }
        nextToken
      }
      ownerUserId
      createdAt
      updatedAt
      id
      owner
    }
  }
`;
export const updateTeam = /* GraphQL */ `
  mutation UpdateTeam(
    $input: UpdateTeamInput!
    $condition: ModelTeamConditionInput
  ) {
    updateTeam(input: $input, condition: $condition) {
      title
      teamUsers {
        items {
          teamId
          team {
            title
            teamUsers {
              nextToken
            }
            ownerUserId
            createdAt
            updatedAt
            id
            owner
          }
          userId
          user {
            id
            identityId
            email
            about
            firstName
            lastName
            phone
            blocked
            blockedBy
            country
            profileImg {
              alt
              identityId
              key
              level
              type
            }
            interests
            locale
            onboardingStatus
            onboardingEntity
            signatures {
              nextToken
            }
            teamId
            team {
              title
              ownerUserId
              createdAt
              updatedAt
              id
              owner
            }
            userType
            rating
            reportReasons
            notificationPreferences {
              email
              push
              sms
            }
            zaiUserId
            zaiUserWalletId
            zaiNppCrn
            ipAddress
            createdAt
            updatedAt
            owner
          }
          createdAt
          updatedAt
          owners
          id
          teamTeamUsersId
        }
        nextToken
      }
      ownerUserId
      createdAt
      updatedAt
      id
      owner
    }
  }
`;
export const createTeamUser = /* GraphQL */ `
  mutation CreateTeamUser($input: CreateTeamUserInput) {
    createTeamUser(input: $input) {
      teamId
      team {
        title
        teamUsers {
          items {
            teamId
            team {
              title
              ownerUserId
              createdAt
              updatedAt
              id
              owner
            }
            userId
            user {
              id
              identityId
              email
              about
              firstName
              lastName
              phone
              blocked
              blockedBy
              country
              interests
              locale
              onboardingStatus
              onboardingEntity
              teamId
              userType
              rating
              reportReasons
              zaiUserId
              zaiUserWalletId
              zaiNppCrn
              ipAddress
              createdAt
              updatedAt
              owner
            }
            createdAt
            updatedAt
            owners
            id
            teamTeamUsersId
          }
          nextToken
        }
        ownerUserId
        createdAt
        updatedAt
        id
        owner
      }
      userId
      user {
        id
        identityId
        email
        about
        firstName
        lastName
        phone
        blocked
        blockedBy
        country
        profileImg {
          alt
          identityId
          key
          level
          type
        }
        interests
        locale
        onboardingStatus
        onboardingEntity
        signatures {
          items {
            id
            userId
            key
            createdAt
            updatedAt
          }
          nextToken
        }
        teamId
        team {
          title
          teamUsers {
            items {
              teamId
              userId
              createdAt
              updatedAt
              owners
              id
              teamTeamUsersId
            }
            nextToken
          }
          ownerUserId
          createdAt
          updatedAt
          id
          owner
        }
        userType
        rating
        reportReasons
        notificationPreferences {
          email
          push
          sms
        }
        zaiUserId
        zaiUserWalletId
        zaiNppCrn
        ipAddress
        createdAt
        updatedAt
        owner
      }
      createdAt
      updatedAt
      owners
      id
      teamTeamUsersId
    }
  }
`;
export const deleteTeamUser = /* GraphQL */ `
  mutation DeleteTeamUser($input: DeleteTeamUserInput) {
    deleteTeamUser(input: $input) {
      teamId
      team {
        title
        teamUsers {
          items {
            teamId
            team {
              title
              ownerUserId
              createdAt
              updatedAt
              id
              owner
            }
            userId
            user {
              id
              identityId
              email
              about
              firstName
              lastName
              phone
              blocked
              blockedBy
              country
              interests
              locale
              onboardingStatus
              onboardingEntity
              teamId
              userType
              rating
              reportReasons
              zaiUserId
              zaiUserWalletId
              zaiNppCrn
              ipAddress
              createdAt
              updatedAt
              owner
            }
            createdAt
            updatedAt
            owners
            id
            teamTeamUsersId
          }
          nextToken
        }
        ownerUserId
        createdAt
        updatedAt
        id
        owner
      }
      userId
      user {
        id
        identityId
        email
        about
        firstName
        lastName
        phone
        blocked
        blockedBy
        country
        profileImg {
          alt
          identityId
          key
          level
          type
        }
        interests
        locale
        onboardingStatus
        onboardingEntity
        signatures {
          items {
            id
            userId
            key
            createdAt
            updatedAt
          }
          nextToken
        }
        teamId
        team {
          title
          teamUsers {
            items {
              teamId
              userId
              createdAt
              updatedAt
              owners
              id
              teamTeamUsersId
            }
            nextToken
          }
          ownerUserId
          createdAt
          updatedAt
          id
          owner
        }
        userType
        rating
        reportReasons
        notificationPreferences {
          email
          push
          sms
        }
        zaiUserId
        zaiUserWalletId
        zaiNppCrn
        ipAddress
        createdAt
        updatedAt
        owner
      }
      createdAt
      updatedAt
      owners
      id
      teamTeamUsersId
    }
  }
`;
export const createTranslation = /* GraphQL */ `
  mutation CreateTranslation($input: CreateTranslationInput) {
    createTranslation(input: $input) {
      language
      namespace
      data
    }
  }
`;
export const updateTranslation = /* GraphQL */ `
  mutation UpdateTranslation($input: UpdateTranslationInput) {
    updateTranslation(input: $input) {
      language
      namespace
      data
    }
  }
`;
export const updateUser = /* GraphQL */ `
  mutation UpdateUser($input: UpdateUserInput) {
    updateUser(input: $input) {
      id
      identityId
      email
      about
      firstName
      lastName
      phone
      blocked
      blockedBy
      country
      profileImg {
        alt
        identityId
        key
        level
        type
      }
      interests
      locale
      onboardingStatus
      onboardingEntity
      signatures {
        items {
          id
          userId
          key
          createdAt
          updatedAt
        }
        nextToken
      }
      teamId
      team {
        title
        teamUsers {
          items {
            teamId
            team {
              title
              ownerUserId
              createdAt
              updatedAt
              id
              owner
            }
            userId
            user {
              id
              identityId
              email
              about
              firstName
              lastName
              phone
              blocked
              blockedBy
              country
              interests
              locale
              onboardingStatus
              onboardingEntity
              teamId
              userType
              rating
              reportReasons
              zaiUserId
              zaiUserWalletId
              zaiNppCrn
              ipAddress
              createdAt
              updatedAt
              owner
            }
            createdAt
            updatedAt
            owners
            id
            teamTeamUsersId
          }
          nextToken
        }
        ownerUserId
        createdAt
        updatedAt
        id
        owner
      }
      userType
      rating
      reportReasons
      notificationPreferences {
        email
        push
        sms
      }
      zaiUserId
      zaiUserWalletId
      zaiNppCrn
      ipAddress
      createdAt
      updatedAt
      owner
    }
  }
`;
export const blockUser = /* GraphQL */ `
  mutation BlockUser($input: BlockUserInput) {
    blockUser(input: $input) {
      id
      identityId
      email
      about
      firstName
      lastName
      phone
      blocked
      blockedBy
      country
      profileImg {
        alt
        identityId
        key
        level
        type
      }
      interests
      locale
      onboardingStatus
      onboardingEntity
      signatures {
        items {
          id
          userId
          key
          createdAt
          updatedAt
        }
        nextToken
      }
      teamId
      team {
        title
        teamUsers {
          items {
            teamId
            team {
              title
              ownerUserId
              createdAt
              updatedAt
              id
              owner
            }
            userId
            user {
              id
              identityId
              email
              about
              firstName
              lastName
              phone
              blocked
              blockedBy
              country
              interests
              locale
              onboardingStatus
              onboardingEntity
              teamId
              userType
              rating
              reportReasons
              zaiUserId
              zaiUserWalletId
              zaiNppCrn
              ipAddress
              createdAt
              updatedAt
              owner
            }
            createdAt
            updatedAt
            owners
            id
            teamTeamUsersId
          }
          nextToken
        }
        ownerUserId
        createdAt
        updatedAt
        id
        owner
      }
      userType
      rating
      reportReasons
      notificationPreferences {
        email
        push
        sms
      }
      zaiUserId
      zaiUserWalletId
      zaiNppCrn
      ipAddress
      createdAt
      updatedAt
      owner
    }
  }
`;
export const deleteAccount = /* GraphQL */ `
  mutation DeleteAccount {
    deleteAccount {
      id
      identityId
      email
      about
      firstName
      lastName
      phone
      blocked
      blockedBy
      country
      profileImg {
        alt
        identityId
        key
        level
        type
      }
      interests
      locale
      onboardingStatus
      onboardingEntity
      signatures {
        items {
          id
          userId
          key
          createdAt
          updatedAt
        }
        nextToken
      }
      teamId
      team {
        title
        teamUsers {
          items {
            teamId
            team {
              title
              ownerUserId
              createdAt
              updatedAt
              id
              owner
            }
            userId
            user {
              id
              identityId
              email
              about
              firstName
              lastName
              phone
              blocked
              blockedBy
              country
              interests
              locale
              onboardingStatus
              onboardingEntity
              teamId
              userType
              rating
              reportReasons
              zaiUserId
              zaiUserWalletId
              zaiNppCrn
              ipAddress
              createdAt
              updatedAt
              owner
            }
            createdAt
            updatedAt
            owners
            id
            teamTeamUsersId
          }
          nextToken
        }
        ownerUserId
        createdAt
        updatedAt
        id
        owner
      }
      userType
      rating
      reportReasons
      notificationPreferences {
        email
        push
        sms
      }
      zaiUserId
      zaiUserWalletId
      zaiNppCrn
      ipAddress
      createdAt
      updatedAt
      owner
    }
  }
`;
export const createUserConversation = /* GraphQL */ `
  mutation CreateUserConversation(
    $input: CreateUserConversationInput!
    $condition: ModelUserConversationConditionInput
  ) {
    createUserConversation(input: $input, condition: $condition) {
      conversationId
      conversation {
        title
        image {
          alt
          identityId
          key
          level
          type
        }
        country
        messages {
          items {
            conversationId
            text
            attachments {
              identityId
              key
              level
              type
            }
            users
            receiver
            sender
            createdBy
            readBy
            createdAt
            updatedAt
            id
            conversationMessagesId
          }
          nextToken
        }
        userConversations {
          items {
            conversationId
            conversation {
              title
              country
              users
              readBy
              createdBy
              createdAt
              updatedAt
              id
            }
            userId
            user {
              id
              identityId
              email
              about
              firstName
              lastName
              phone
              blocked
              blockedBy
              country
              interests
              locale
              onboardingStatus
              onboardingEntity
              teamId
              userType
              rating
              reportReasons
              zaiUserId
              zaiUserWalletId
              zaiNppCrn
              ipAddress
              createdAt
              updatedAt
              owner
            }
            users
            createdAt
            updatedAt
            id
            conversationUserConversationsId
          }
          nextToken
        }
        users
        readBy
        createdBy
        createdAt
        updatedAt
        id
      }
      userId
      user {
        id
        identityId
        email
        about
        firstName
        lastName
        phone
        blocked
        blockedBy
        country
        profileImg {
          alt
          identityId
          key
          level
          type
        }
        interests
        locale
        onboardingStatus
        onboardingEntity
        signatures {
          items {
            id
            userId
            key
            createdAt
            updatedAt
          }
          nextToken
        }
        teamId
        team {
          title
          teamUsers {
            items {
              teamId
              userId
              createdAt
              updatedAt
              owners
              id
              teamTeamUsersId
            }
            nextToken
          }
          ownerUserId
          createdAt
          updatedAt
          id
          owner
        }
        userType
        rating
        reportReasons
        notificationPreferences {
          email
          push
          sms
        }
        zaiUserId
        zaiUserWalletId
        zaiNppCrn
        ipAddress
        createdAt
        updatedAt
        owner
      }
      users
      createdAt
      updatedAt
      id
      conversationUserConversationsId
    }
  }
`;
export const updateUserConversation = /* GraphQL */ `
  mutation UpdateUserConversation(
    $input: UpdateUserConversationInput!
    $condition: ModelUserConversationConditionInput
  ) {
    updateUserConversation(input: $input, condition: $condition) {
      conversationId
      conversation {
        title
        image {
          alt
          identityId
          key
          level
          type
        }
        country
        messages {
          items {
            conversationId
            text
            attachments {
              identityId
              key
              level
              type
            }
            users
            receiver
            sender
            createdBy
            readBy
            createdAt
            updatedAt
            id
            conversationMessagesId
          }
          nextToken
        }
        userConversations {
          items {
            conversationId
            conversation {
              title
              country
              users
              readBy
              createdBy
              createdAt
              updatedAt
              id
            }
            userId
            user {
              id
              identityId
              email
              about
              firstName
              lastName
              phone
              blocked
              blockedBy
              country
              interests
              locale
              onboardingStatus
              onboardingEntity
              teamId
              userType
              rating
              reportReasons
              zaiUserId
              zaiUserWalletId
              zaiNppCrn
              ipAddress
              createdAt
              updatedAt
              owner
            }
            users
            createdAt
            updatedAt
            id
            conversationUserConversationsId
          }
          nextToken
        }
        users
        readBy
        createdBy
        createdAt
        updatedAt
        id
      }
      userId
      user {
        id
        identityId
        email
        about
        firstName
        lastName
        phone
        blocked
        blockedBy
        country
        profileImg {
          alt
          identityId
          key
          level
          type
        }
        interests
        locale
        onboardingStatus
        onboardingEntity
        signatures {
          items {
            id
            userId
            key
            createdAt
            updatedAt
          }
          nextToken
        }
        teamId
        team {
          title
          teamUsers {
            items {
              teamId
              userId
              createdAt
              updatedAt
              owners
              id
              teamTeamUsersId
            }
            nextToken
          }
          ownerUserId
          createdAt
          updatedAt
          id
          owner
        }
        userType
        rating
        reportReasons
        notificationPreferences {
          email
          push
          sms
        }
        zaiUserId
        zaiUserWalletId
        zaiNppCrn
        ipAddress
        createdAt
        updatedAt
        owner
      }
      users
      createdAt
      updatedAt
      id
      conversationUserConversationsId
    }
  }
`;
export const deleteUserConversation = /* GraphQL */ `
  mutation DeleteUserConversation(
    $input: DeleteUserConversationInput!
    $condition: ModelUserConversationConditionInput
  ) {
    deleteUserConversation(input: $input, condition: $condition) {
      conversationId
      conversation {
        title
        image {
          alt
          identityId
          key
          level
          type
        }
        country
        messages {
          items {
            conversationId
            text
            attachments {
              identityId
              key
              level
              type
            }
            users
            receiver
            sender
            createdBy
            readBy
            createdAt
            updatedAt
            id
            conversationMessagesId
          }
          nextToken
        }
        userConversations {
          items {
            conversationId
            conversation {
              title
              country
              users
              readBy
              createdBy
              createdAt
              updatedAt
              id
            }
            userId
            user {
              id
              identityId
              email
              about
              firstName
              lastName
              phone
              blocked
              blockedBy
              country
              interests
              locale
              onboardingStatus
              onboardingEntity
              teamId
              userType
              rating
              reportReasons
              zaiUserId
              zaiUserWalletId
              zaiNppCrn
              ipAddress
              createdAt
              updatedAt
              owner
            }
            users
            createdAt
            updatedAt
            id
            conversationUserConversationsId
          }
          nextToken
        }
        users
        readBy
        createdBy
        createdAt
        updatedAt
        id
      }
      userId
      user {
        id
        identityId
        email
        about
        firstName
        lastName
        phone
        blocked
        blockedBy
        country
        profileImg {
          alt
          identityId
          key
          level
          type
        }
        interests
        locale
        onboardingStatus
        onboardingEntity
        signatures {
          items {
            id
            userId
            key
            createdAt
            updatedAt
          }
          nextToken
        }
        teamId
        team {
          title
          teamUsers {
            items {
              teamId
              userId
              createdAt
              updatedAt
              owners
              id
              teamTeamUsersId
            }
            nextToken
          }
          ownerUserId
          createdAt
          updatedAt
          id
          owner
        }
        userType
        rating
        reportReasons
        notificationPreferences {
          email
          push
          sms
        }
        zaiUserId
        zaiUserWalletId
        zaiNppCrn
        ipAddress
        createdAt
        updatedAt
        owner
      }
      users
      createdAt
      updatedAt
      id
      conversationUserConversationsId
    }
  }
`;
export const publishUserMessage = /* GraphQL */ `
  mutation PublishUserMessage($userId: ID!) {
    publishUserMessage(userId: $userId) {
      conversationId
      text
      attachments {
        identityId
        key
        level
        type
      }
      users
      receiver
      sender
      createdBy
      readBy
      createdAt
      updatedAt
      id
      conversationMessagesId
    }
  }
`;
export const xeroCreateConsentUrl = /* GraphQL */ `
  mutation XeroCreateConsentUrl($input: XeroCreateConsentUrlInput) {
    xeroCreateConsentUrl(input: $input)
  }
`;
export const xeroCreateTokenSet = /* GraphQL */ `
  mutation XeroCreateTokenSet($input: XeroCreateTokenSetInput) {
    xeroCreateTokenSet(input: $input)
  }
`;
export const createZaiPaymentMethodToken = /* GraphQL */ `
  mutation CreateZaiPaymentMethodToken(
    $input: CreateZaiPaymentMethodTokenInput
  ) {
    createZaiPaymentMethodToken(input: $input)
  }
`;
export const createPayToAgreement = /* GraphQL */ `
  mutation CreatePayToAgreement($input: CreatePayToAgreementInput) {
    createPayToAgreement(input: $input) {
      agreementUuid
      status
      createdAt
      updatedAt
    }
  }
`;
export const validatePayToAgreement = /* GraphQL */ `
  mutation ValidatePayToAgreement($input: ValidatePayToAgreementInput) {
    validatePayToAgreement(input: $input)
  }
`;

export interface GenerateCognitoWelcomeEmailProps {
  appName: string;
  companyName: string;
  domain: string;
  replyToEmail: string;
  webDomainName: string;
}

export const generateCognitoWelcomeEmail = (
  {
    appName,
    companyName,
    domain,
    replyToEmail,
    webDomainName,
  }: GenerateCognitoWelcomeEmailProps,
  isInvitation: boolean
) => `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${appName}</title> <!--[if gte mso 9]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml> <![endif]--> <!-- Web Font / @font-face : BEGIN --> <!--[if mso]>
  <style> * {
    font-family: 'Poppins', Helvetica, sans-serif;
  } </style> <![endif]--> <!--[if !mso]><!-->
  <!-- insert web font reference, eg: <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet"> -->
  <!--<![endif]--> <!-- Web Font / @font-face : END --> <!-- CSS Reset : BEGIN -->
  <style> html, body {
      margin: 0 auto !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      font-family: 'Poppins', Helvetica, sans-serif !important;
  }

  /* Define button styles */
  .button {
      display: inline-block;
      margin-top: 12px;
      padding: 8px 20px;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      text-decoration: none;
      background-color: #6730DB;
      color: #ffffff;
      border-radius: 12px;
      border: 1px solid #6730DB;
  }

  /* Override button styles for Outlook */
  .button a {
      display: block;
      padding: 8px 20px;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      text-decoration: none;
      background-color: #6730DB;
      color: #ffffff;
      border-radius: 12px;
      border: 1px solid #6730DB;
  }

  * {
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
  }

  div[style*="margin: 16px 0"] {
      margin: 0 !important;
  }

  #MessageViewBody, #MessageWebViewDiv {
      width: 100% !important;
  }

  table, td {
      mso-table-lspace: 0pt !important;
      mso-table-rspace: 0pt !important;
  }

  th {
      font-weight: normal;
  }

  table {
      border-spacing: 0 !important;
      border-collapse: collapse !important;
      table-layout: fixed !important;
      margin: 0 auto !important;
  }

  a {
      text-decoration: none;
  }

  img {
      -ms-interpolation-mode: bicubic;
  }

  a[x-apple-data-detectors], /* iOS */
  .unstyle-auto-detected-links a, .aBn {
      border-bottom: 0 !important;
      cursor: default !important;
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
  }

  .im {
      color: inherit !important;
  }

  .a6S {
      display: none !important;
      opacity: 0.01 !important;
  }

  img.g-img + div {
      display: none !important;
  }

  /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
  @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
      u ~ div .email-container {
          min-width: 320px !important;
      }
  }

  /* iPhone 6, 6S, 7, 8, and X */
  @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
      u ~ div .email-container {
          min-width: 375px !important;
      }
  }

  /* iPhone 6+, 7+, and 8+ */
  @media only screen and (min-device-width: 414px) {
      u ~ div .email-container {
          min-width: 414px !important;
      }
  } </style> <!-- CSS Reset : END --> <!-- Progressive Enhancements : BEGIN -->
  <style> /* What it does: Hover styles for buttons */

  /* Media Queries */
  @media screen and (max-width: 600px) {
      .email-container {
          width: 100% !important;
          margin: auto !important;
      }

      table.center-on-narrow {
          display: inline-block !important;
      }

      .email-container p {
          font-size: 17px !important;
      }

      .widthauto {
          width: 100% !important;
      }
  }

  @media screen and (max-width: 480px) {
      br {
          display: none !important;
      }

      .fontsize {
          font-size: 32px !important;
          line-height: 38px !important;
      }
  } </style> <!-- Progressive Enhancements : END --> </head>
<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #EBF0FC;">
<center role="article" aria-roledescription="email" lang="en" style="width: 100%; background-color: #EBF0FC;">
  <!--[if mso | IE]>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #EBF0FC;">
    <tr>
      <td> <![endif]--> <!-- Email Body : BEGIN -->
  <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: auto;" class="email-container">
    <!-- Email Header : BEGIN -->
    <tr>
      <td bgcolor="#ebf0fc" style="padding: 30px 20px 20px 20px; text-align: center; background:#6730DB;">
        <a href="https://${domain}" target="_blank"><img src="https://apptractive-media.s3.amazonaws.com/logo-white.png" width="100" height="19" alt="${appName}" border="0" style="height: auto; background: #6730DB; font-family: 'Poppins', Helvetica, sans-serif; font-size: 15px; line-height: 15px; color: #555555;"></a>
      </td>
    </tr>
    <tr>
      <td style="padding: 10px 20px 5px 20px; font-family: 'Poppins', Helvetica, sans-serif; font-size: 24px; line-height: 36px; color: #FFFFFF; text-align:center; background:#6730DB;">
        Welcome to ${appName}
      </td>
    </tr>
    <tr>
      <td style="background-color: #6730DB; padding: 20px 0px 60px 0px;">
        <table background="#ffffff" align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="70%" style="background:#FFFFFF;" class="widthauto">
          ${
            isInvitation
              ? `<tr>
            <td style="padding: 30px 20px 20px 20px; font-family: 'Poppins', Helvetica, sans-serif; font-size: 14px; line-height: 20px; color: #394D66; text-align:center; background:#FFFFFF;">
              Email to log in:
            </td>
          </tr> `
              : ``
          }
          ${
            isInvitation
              ? `<tr>
            <td style="padding: 0 20px 20px 20px; font-family: 'Poppins', Helvetica, sans-serif; font-size: 20px; line-height: 30px; color: #6730DB; text-align:center; background:#FFFFFF; font-weight:600;" class="fontsize">
              {username}
            </td>
          </tr> `
              : ``
          }
          ${
            isInvitation
              ? `<tr>
            <td style="padding: 30px 20px 20px 20px; font-family: 'Poppins', Helvetica, sans-serif; font-size: 14px; line-height: 20px; color: #394D66; text-align:center; background:#FFFFFF;">
              Temporary password to log in:
            </td>
          </tr>`
              : ``
          }
          ${
            !isInvitation
              ? `<tr>
            <td style="padding: 30px 20px 20px 20px; font-family: 'Poppins', Helvetica, sans-serif; font-size: 14px; line-height: 20px; color: #394D66; text-align:center; background:#FFFFFF;">
              Verification code to log in:
            </td>
          </tr>`
              : ``
          }
          <tr>
            <td style="padding: 0px 20px 20px 20px; font-family: 'Poppins', Helvetica, sans-serif; font-size: 50px; line-height: 60px; color: #6730DB; text-align:center; background:#FFFFFF; font-weight:600;" class="fontsize">
              {####}
            </td>
          </tr>
        </table>
      </td>
    </tr> <!-- Email Header : END --> <!-- 1 Column Text + Button : BEGIN -->
    ${
      isInvitation
        ? `<tr>
      <td style="background-color: #EEFBFF;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding: 30px 20px 0px 20px; font-family: 'Poppins', Helvetica, sans-serif; font-size: 14px; line-height: 20px; color: #394D66; text-align:center; background:#EEFBFF; font-weight:500;">
              Please click on the button below to log in
            </td>
          </tr>
          <tr>
            <td bgcolor="#eefbff" style="padding: 10px 0; text-align: center; background:#EEFBFF;">
              <div class="button">
                <a href="${webDomainName}/sign-in" target="_blank">LOG IN TO YOUR ACCOUNT</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr> `
        : ``
    } <!-- 1 Column Text + Button : END --> <!-- 1 Column Text + Button : BEGIN -->
    ${
      !isInvitation
        ? `<tr>
      <td style="background-color: #EEFBFF;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding: 30px 20px 0px 20px; font-family: 'Poppins', Helvetica, sans-serif; font-size: 14px; line-height: 20px; color: #394D66; text-align:center; background:#EEFBFF; font-weight:500;">
              Please verify the following email address below that you<br> signed up with, and click on the link
            </td>
          </tr>
          <tr>
            <td bgcolor="#eefbff" style="padding: 10px 0; text-align: center; background:#EEFBFF;">
              <div class="button">
                <a href="{##Verify Email##}" target="_blank">VERIFY EMAIL ADDRESS</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr> `
        : ``
    } <!-- 1 Column Text + Button : END --> <!-- 1 Column Text + Button : BEGIN -->
    <tr>
      <td style="background-color: #FFFFFF;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding: 20px 20px 20px 20px; font-family: 'Poppins', Helvetica, sans-serif; font-size: 12px; line-height: 18px; color: #394D66; text-align:center; background:#FFFFFF; font-weight:500;">
              Contact: <a href="mailto:${replyToEmail}" style="color:#394D66; text-decoration:none;">${replyToEmail}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr> <!-- 1 Column Text + Button : END --> </table> <!-- Email Body : END --> <!-- Email Footer : BEGIN -->
  <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: auto;" class="email-container">
    <tr>
      <td bgcolor="#ebf0fc" style="padding: 30px 20px 30px 20px; font-family: 'Poppins', Helvetica, sans-serif; font-size: 12px; line-height: 18px; color:#394D66; text-align:center; font-weight:400; background:#EBF0FC;">
        This email was sent to you by ${companyName}<br>
        <a href="https://${domain}/terms-conditions" style="color:#394D66; text-decoration:none; font-weight:500;"> Terms of
          Service </a> I
        <a href="https://${domain}/privacy-policy" style="color:#394D66; text-decoration:none; font-weight:500;">Privacy
          Policy</a></td>
    </tr>
  </table> <!-- Email Footer : END --> <!--[if mso | IE]> </td> </tr> </table> <![endif]--> </center>
</body>
</html>`;

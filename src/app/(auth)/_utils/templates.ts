
export const verifyEmailTemplate = (OTP: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />

  <title>Verify your XII account</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #eeeeee;
    font-family: Arial, Helvetica, sans-serif;
    color: #1a1c1c;
  "
>
  <!-- Main wrapper -->
  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="
      width: 100%;
      margin: 0;
      padding: 0;
      background-color: #eeeeee;
    "
  >
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Email container -->
        <table
          role="presentation"
          width="600"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            border: 2px solid #000000;
          "
        >

          <!-- Header -->
          <tr>
            <td
              style="
                padding: 28px 32px;
                background-color: #000000;
                border-bottom: 4px solid #b08d57;
              "
            >
              <div
                style="
                  font-family: Arial, Helvetica, sans-serif;
                  font-size: 30px;
                  line-height: 36px;
                  font-weight: 700;
                  letter-spacing: 5px;
                  color: #ffffff;
                "
              >
                XII
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px 40px 40px;">

              <!-- Label -->
              <div
                style="
                  margin-bottom: 14px;
                  font-size: 12px;
                  line-height: 18px;
                  font-weight: 700;
                  letter-spacing: 2px;
                  text-transform: uppercase;
                  color: #b08d57;
                "
              >
                ACCOUNT VERIFICATION
              </div>

              <!-- Heading -->
              <h1
                style="
                  margin: 0 0 24px 0;
                  padding: 0;
                  font-family: Arial, Helvetica, sans-serif;
                  font-size: 38px;
                  line-height: 44px;
                  font-weight: 700;
                  letter-spacing: -1px;
                  text-transform: uppercase;
                  color: #000000;
                "
              >
                VERIFY YOUR<br />
                EMAIL
              </h1>

              <!-- Divider -->
              <div
                style="
                  width: 100%;
                  height: 2px;
                  margin: 0 0 28px 0;
                  background-color: #000000;
                "
              ></div>

              <!-- Introduction -->
              <p
                style="
                  margin: 0 0 16px 0;
                  font-size: 16px;
                  line-height: 26px;
                  color: #1a1c1c;
                "
              >
                Welcome to XII.
              </p>

              <p
                style="
                  margin: 0 0 32px 0;
                  font-size: 16px;
                  line-height: 26px;
                  color: #4c4546;
                "
              >
                To complete your registration and secure your account,
                enter the verification code below.
              </p>

              <!-- OTP Box -->
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="margin: 0 0 28px 0;"
              >
                <tr>
                  <td
                    align="center"
                    style="
                      padding: 28px 20px;
                      background-color: #000000;
                      border: 2px solid #000000;
                    "
                  >
                    <div
                      style="
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 34px;
                        line-height: 42px;
                        font-weight: 700;
                        letter-spacing: 9px;
                        color: #ffffff;
                      "
                    >
                      ${OTP}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiration -->
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="margin: 0 0 28px 0;"
              >
                <tr>
                  <td
                    style="
                      padding: 16px;
                      background-color: #eeeeee;
                      border-left: 4px solid #b08d57;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        font-size: 12px;
                        line-height: 18px;
                        font-weight: 700;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                        color: #1a1c1c;
                      "
                    >
                      This code expires in 10 minutes.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Instructions -->
              <p
                style="
                  margin: 0 0 12px 0;
                  font-size: 14px;
                  line-height: 22px;
                  color: #4c4546;
                "
              >
                Enter this code on the verification page to continue.
              </p>

              <p
                style="
                  margin: 0;
                  font-size: 14px;
                  line-height: 22px;
                  color: #4c4546;
                "
              >
                If you did not create an account with XII, you can safely
                ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              style="
                padding: 28px 40px;
                background-color: #000000;
                border-top: 4px solid #b08d57;
              "
            >

              <div
                style="
                  margin-bottom: 8px;
                  font-family: Arial, Helvetica, sans-serif;
                  font-size: 18px;
                  line-height: 24px;
                  font-weight: 700;
                  letter-spacing: 3px;
                  color: #ffffff;
                "
              >
                XII
              </div>

              <div
                style="
                  margin-bottom: 20px;
                  font-size: 11px;
                  line-height: 18px;
                  letter-spacing: 1.5px;
                  text-transform: uppercase;
                  color: #b08d57;
                "
              >
                TIMEPIECES — PRECISION — CHARACTER
              </div>

              <div
                style="
                  font-size: 11px;
                  line-height: 18px;
                  color: #a5a5a5;
                "
              >
                © 2026 XII. All rights reserved.
              </div>

            </td>
          </tr>

        </table>

        <!-- Outside footer -->
        <table
          role="presentation"
          width="600"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width: 100%;
            max-width: 600px;
          "
        >
          <tr>
            <td
              align="center"
              style="
                padding: 20px 16px 0 16px;
                font-size: 11px;
                line-height: 18px;
                color: #777777;
              "
            >
              This is an automated message. Please do not reply to this email.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`

}


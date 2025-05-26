const createWelcomeTemplate = (fullName, clientUrl) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Torii Gates</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    "
  >
    <main style="border: 1px solid #333; border-radius: 10px">
      <div
        style="
          background-color: #000000;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        "
      >
        <img
          src="https://res.cloudinary.com/dlb8nbz13/image/upload/v1747040557/logo_fearrd.png"
          alt="Torii Gate"
          style="
            max-width: 50.3px;
            max-height: 43.92px;
            margin-bottom: 20px;
            border-radius: 5px;
          "
        />

        <h1 style="color: white; margin: 0; font-size: 28px">
          Welcome to Torii Gates
        </h1>
      </div>
      <div
        style="
          background-color: #ffffff;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        "
      >
        <p style="font-size: 18px; color: #000">
          <strong>Hello ${fullName},</strong>
        </p>
        <p>We're thrilled to have you join us!</p>

        <div style="text-align: start; margin: 30px 0">
          <a
            href="${clientUrl}"
            target = "_blank"
            style="
              background-color: #000;
              color: white;
              padding: 14px 38px;
              text-decoration: none;
              border-radius: 10px;
              font-weight: bold;
              font-size: 16px;
              transition: background-color 0.3s;
            "
            >Verify your email</a
          >
        </div>
        <p>
          If you have any questions or need assistance, our support team is
          always here to help.
        </p>
        <p>Best regards,<br />Torii Gates</p>
      </div>
    </main>
  </body>
</html>`;
};

const createResetTemplate = (fullName, clientUrl) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset password</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    "
  >
    <div
      style="
        background-color: #000000;
        padding: 30px;
        text-align: center;
        border-radius: 10px 10px 0 0;
      "
    >
      <img
        src="https://res.cloudinary.com/dlb8nbz13/image/upload/v1747040557/logo_fearrd.png"
          alt="Torii Gate"
        style="
          max-width: 50.3px;
          max-height: 43.92px;
          margin-bottom: 20px;
          border-radius: 5px;
        "
      />

      <h1 style="color: white; margin: 0; font-size: 28px">Reset password!</h1>
    </div>
    <div
      style="
        background-color: #ffffff;
        padding: 30px;
        border-radius: 0 0 10px 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      "
    >
      <p style="font-size: 18px; color: #000000">
        <strong>Hello ${fullName},</strong>
      </p>
      <p>Forgot your password?</p>
      <div
        style="
          background-color: #f3f6f8;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        "
      >
        <h1>You have requested for a password reset from Torii Gate</h1>
        <p>Please go to this link to reset password</p>
        <a href="${clientUrl}" clicktracking="off" target="_blank">Click To Reset</a>
      </div>

      <p>
        If you have any questions or need assistance, our support team is always
        here to help.
      </p>
      <p>Best regards,<br />Torii Gate</p>
    </div>
  </body>
</html>
`;
};

module.exports = { createResetTemplate, createWelcomeTemplate };

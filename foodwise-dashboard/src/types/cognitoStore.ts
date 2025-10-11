import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

// Cognito only — uses ap-southeast-5
export const cognitoClient = new CognitoIdentityProviderClient({
  region: "ap-southeast-5",
});

// Cognito App Client ID (change to yours)
export const cognitoClientId = "2ibheor4bc9ef9ckt0q6ro1m5p";

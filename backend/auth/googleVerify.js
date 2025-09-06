import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const p = ticket.getPayload();
  return {
    googleId: p.sub,
    email: p.email,
    emailVerified: p.email_verified,
    name: p.name,
    picture: p.picture,
    hd: p.hd
  };
}

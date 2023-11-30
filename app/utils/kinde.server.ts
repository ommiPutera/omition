import type { SessionManager } from "@kinde-oss/kinde-typescript-sdk";
import { GrantType, createKindeServerClient } from "@kinde-oss/kinde-typescript-sdk";
import { createCookieSessionStorage } from "@remix-run/node";
import { createSession, prisma, sessionExpirationTime } from "./prisma.server.ts";
import type { User } from "@prisma/client";
import bcrypt from 'bcryptjs'

const kindeClient = createKindeServerClient(GrantType.AUTHORIZATION_CODE, {
  authDomain: process.env.KINDE_DOMAIN ?? '',
  clientId: process.env.KINDE_CLIENT_ID ?? '',
  clientSecret: process.env.KINDE_CLIENT_SECRET ?? '',
  redirectURL: process.env.KINDE_REDIRECT_URL ?? '',
  logoutRedirectURL: process.env.KINDE_LOGOUT_REDIRECT_URL ?? '',
});

const sessionIdKey = '__session_id__'
let sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error('Must enviornment variable SESSION_SECRET')
}

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'omition_root_session',
    secure: true,
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: sessionExpirationTime / 1000,
    httpOnly: true,
  },
})

async function getSessionManager(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  const getSessionId = () => session.get(sessionIdKey) as string | undefined
  const unsetSessionId = () => session.unset(sessionIdKey)

  const sessionManager: SessionManager = {
    async getSessionItem(key: string) {
      return session.get(key);
    },
    async setSessionItem(key: string, value: unknown) {
      session.set(key, value)
      sessionStorage.commitSession(session)
    },
    async removeSessionItem(key: string) {
      session.unset(key)
    },
    async destroySession() {
      sessionStorage.destroySession(session)
    }
  };

  return {
    sessionManager,
    session,
    signUp: async ({ fullName, username, kindeId, email  }: Omit<User, "createdAt" | "updatedAt" | "passwordHash" | "role" | "id">) => {
      console.log('SIGN_UP_FORM: =================', { fullName, username, kindeId, email  })
      if (!process.env.PASSWORD) throw (new Error('need a password'))
      const passwordHash = await bcrypt.hash(process.env.PASSWORD, 10)
      const user = await prisma.user.create({
        data: {
          kindeId: kindeId,
          fullName,
          username,
          passwordHash,
          email,
          role: 'BASIC'
        },
      })
      console.log('SIGN_UP: =================', user)
      const userSession = await createSession({ userId: user.id })
      session.set(sessionIdKey, userSession.id)
    },
    signIn: async ({ id }: Pick<User,"id">) => {
      const userSession = await createSession({ userId: id })
      session.set(sessionIdKey, userSession.id)
    },
    signOut: async () => {
      const sessionId = getSessionId()
      if (sessionId) {
        unsetSessionId()
        prisma.session
          .delete({where: {id: sessionId}})
          .catch((error: unknown) => {
            console.error(`Failure deleting user session: `, error)
          })
      }
    }
  }
}

async function findUser(kindeId: string) {
  if (!kindeId) return null
  return prisma.user.findUnique({where: {kindeId: kindeId}})
}

export {
  getSessionManager,
  kindeClient,
  sessionIdKey,
  sessionStorage,
  findUser
};

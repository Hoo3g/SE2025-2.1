import { Provider, Configuration, AccountClaims, KoaContextWithOIDC } from 'oidc-provider';
import { oidcConfig } from '../config/oidc.js';
import { prisma } from '../prisma/client.js';

class CustomAccount {
  accountId: string;
  private profile: any;
  [key: string]: any; // Add index signature

  constructor(id: string, profile: any) {
    this.accountId = id;
    this.profile = profile;
  }

  async claims(_use: string, scope: string): Promise<AccountClaims> {
    if (!this.profile) return { sub: this.accountId };
    
    const { email, emailVerifiedAt } = this.profile;
    const claims = {
      sub: this.accountId,
      ...(scope.includes('email') ? {
        email,
        email_verified: !!emailVerifiedAt
      } : {})
    };

    // Store claims in instance for index access
    Object.entries(claims).forEach(([key, value]) => {
      this[key] = value;
    });

    return claims;
  }

  static async findAccount(ctx: KoaContextWithOIDC, id: string) {
    const userId = Number(id);
    const user = await prisma.user.findUnique({ where: { id_user: userId } });
    if (!user) return undefined;
    return new CustomAccount(id, user);
  }
}

export async function createProvider(issuer: string) {
  const configuration: Configuration = {
    ...oidcConfig,
    findAccount: CustomAccount.findAccount
  };

  const provider = new Provider(issuer, configuration);

  

  return provider;
}
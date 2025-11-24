import { Provider } from 'oidc-provider';
import { oidcConfig } from '../config/oidc.js';
import { prisma } from '../prisma/client.js';
class CustomAccount {
    constructor(id, profile) {
        this.accountId = id;
        this.profile = profile;
    }
    async claims(_use, scope) {
        if (!this.profile)
            return { sub: this.accountId };
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
    static async findAccount(ctx, id) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user)
            return undefined;
        return new CustomAccount(id, user);
    }
}
export async function createProvider(issuer) {
    const configuration = {
        ...oidcConfig,
        findAccount: CustomAccount.findAccount
    };
    const provider = new Provider(issuer, configuration);
    // Thêm các grant types và response types
    provider.registerGrantType('refresh_token', require('oidc-provider/lib/actions/grants/refresh_token'));
    return provider;
}

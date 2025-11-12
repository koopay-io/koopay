// Stellar
export const USDC_TRUSLINE =
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://dev.api.trustlesswork.com";

export const ADMIN_PK =
  process.env.NEXT_PUBLIC_ADMIN_PK ||
  "GDT26YDR47N3AC2RHMXPW65TM754XTMHTSE7RKSOP6W4NTOAFDERMWT3";

export const STELLAR_NETWORK =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";

export const TRUSTLESS_API_KEY = process.env.NEXT_PUBLIC_TRUSTLESS_API_KEY!;

export const TRUSTLESS_PLATFORM_FEE =
  process.env.NEXT_PUBLIC_PLATFORM_FEE || "1.5";

// Supabase
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export const SUPABASE_PUBLISHABLE_OR_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

// External Links
export const NOTION_DOCS_URL = 'https://koopay.notion.site';

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/koopay',
  github: 'https://github.com/koopay-io/koopay',
  linkedin: 'https://www.linkedin.com/company/koopay',
  email: 'mailto:hello@koopay.io',
};

export const EXTERNAL_LINKS = {
  // Product
  howItWorks: `${NOTION_DOCS_URL}/how-it-works`,
  pricing: `${NOTION_DOCS_URL}/pricing`,
  security: `${NOTION_DOCS_URL}/security`,
  api: `${NOTION_DOCS_URL}/api`,
  // Company
  about: `${NOTION_DOCS_URL}/about`,
  blog: `${NOTION_DOCS_URL}/blog`,
  careers: `${NOTION_DOCS_URL}/careers`,
  press: `${NOTION_DOCS_URL}/press`,
  // Resources
  whitepaper: `${NOTION_DOCS_URL}/whitepaper`,
  documentation: `${NOTION_DOCS_URL}/documentation`,
  helpCenter: `${NOTION_DOCS_URL}/help`,
  community: `${NOTION_DOCS_URL}/community`,
  // Legal
  privacy: `${NOTION_DOCS_URL}/privacy-policy`,
  terms: `${NOTION_DOCS_URL}/terms-of-service`,
  cookies: `${NOTION_DOCS_URL}/cookie-policy`,
  compliance: `${NOTION_DOCS_URL}/compliance`,
};

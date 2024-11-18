export const RAND_SEED = 42;
export const CHUNK_SIZE = 8;
export const MAP_SIZE = 400;
// export const ORE_TYPES = 5;
export const BLOCK_SIZE = 64;
export const MAX_WALK_FRAMES_PER_SECOND = 8;
export const SCREEN_WIDTH = 720;
export const SCREEN_HEIGHT = 1280;

export const AEON_TOKEN = "TON";
export const AEON_GATEWAY = "";
export const AEON_REDIRECT_URL = import.meta.env.VITE_AEON_REDIRECT_URL;
export const AEON_SETTLEMENT_CURRENCY = "TON";
export const AEON_SETTLEMENT_ADDRESS = "0QA9P3BNQyKrGmlROCN0_BJpHWcZ843AIiici1qg6kJ7rV5S";
export const AEON_IP_WHITELIST = "178.16.129.177"
export const AEON_DOMAIN_WHITELIST = "machinaflow.kaanaydeniz.com"
export const AEON_PAYMENT_URL = "https://sbx-crypto-payment-api.aeon.xyz/open/api/tg/payment/V2";
export const AEON_APP_ID = import.meta.env.VITE_AEON_APP_ID;
export const AEON_SECRET_KEY = import.meta.env.VITE_AEON_SECRET_KEY;

export const AEON_CONFIG = {
    payCurrency: "USD",
    appId: AEON_APP_ID,
    merchantOrderNo: Math.ceil(1000 * Math.random()),
    orderAmount: 10,
    userId: "kaanayden15@gmail.com",
    paymentTokens: "TON",
    tgModel: "MINIAPP",
}
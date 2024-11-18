import axios from "axios";
import crypto from 'crypto';

export const AEON_TOKEN = "TON";
export const AEON_GATEWAY = "";
export const AEON_REDIRECT_URL = "https://machinaflow.kaanaydeniz.com";
export const AEON_SETTLEMENT_CURRENCY = "TON";
export const AEON_SETTLEMENT_ADDRESS = "0QA9P3BNQyKrGmlROCN0_BJpHWcZ843AIiici1qg6kJ7rV5S";
export const AEON_IP_WHITELIST = "178.16.129.177"
export const AEON_DOMAIN_WHITELIST = "machinaflow.kaanaydeniz.com"
export const AEON_PAYMENT_URL = "https://sbx-crypto-payment-api.aeon.xyz/open/api/payment/V2";
export const AEON_APP_ID = process.env.AEON_APP_ID;
export const AEON_SECRET_KEY = process.env.AEON_SECRET_KEY;


export const AEON_CONFIG = {
    payCurrency: "USD",
    appId: AEON_APP_ID,
    userId: "kaanayden15@gmail.com",
    paymentTokens: "TON",
    tgModel: "MINIAPP",
    redirectURL: `https://machinaflow.kaanaydeniz.com`,
    callbackURL: `https://machinaflow.kaanaydeniz.com`,
}


function sortObjectKeys(obj, secretKey) {
const keysToFilter = ['orderModel', 'sign', 'paymentNetworks','payType','expiredTime','customParam','callbackURL','redirectURL',];

const sortedString = Object.keys(obj)
    .sort()
    .filter(key => obj[key] !== '' && !keysToFilter.includes(key)) 
    .map(key => `${key}=${obj[key]}`) 
    .join('&'); 

return `${sortedString}&key=${secretKey}`; 
}

function hashWithSHA512(aValue ) {
aValue = aValue.trim();

let buffer;
try {
    buffer = Buffer.from(aValue, "UTF-8");
} catch (error) {
    buffer = Buffer.from(aValue); 
}


const hash = crypto.createHash('sha512');
hash.update(buffer);
return toHex(hash.digest());
}

function toHex(input) {
if (!input) return null;
return input.toString('hex').toUpperCase();
}

function verifySignature(data, secret, signature) {
const calculatedSignature = hashWithSHA512(data, secret);
return calculatedSignature === signature.toUpperCase();
}
/*
const jsonData = {"paymentExchange":"","orderAmount":"1600","redirectURL":"","appId":"123456","payCurrency":"EUR","paymentTokens":"","callbackURL":"","merchantOrderNo":"234567543213456","userId":"234232","customParam":"","orderModel":"RECHARGE"};

const data = JSON.parse(jsonData);
const secret = "123456";

signContent = sortObjectKeys(data,secret)
console.log('signContent:', signContent);

const signature = hashWithSHA512(signContent);
console.log('Signature:', signature);
*/
// data.sign = "";
// const isVerified = verifySignature(signContent, secret, data.sign);
// console.log('Verification successful:', isVerified);



export async function payWithAeon(req, res) {

    const orderNo = req.body.orderNo;
    const amount = req.body.amount;

    const finalConfig = {
        ...AEON_CONFIG,
        merchantOrderNo: (Math.floor(Math.random() * 100000000)).toString(),
        orderAmount: (Math.random() * 100).toFixed(2).toString(),
    };

    console.log("Final Config", finalConfig);


    const signContent = sortObjectKeys(finalConfig, process.env.AEON_SECRET_KEY);
    console.log('signContent:', signContent);
    
    const signature = hashWithSHA512(signContent);
    console.log('Signature:', signature);

    const isVerified = verifySignature(signContent, process.env.AEON_SECRET_KEY, signature);
    console.log('Verification successful:', isVerified);

    const testData= {
        appId: "TEST000001",
        callbackURL: "https://90fc-111-10-154.ngrok-free.app/v1/xxxxx",
        expiredTime: "60",
        merchantOrderNo: "17236123450000",
        orderAmount: "100",
        orderModel: "ORDER",
        payCurrency: "USD",
        paymentTokens: "ETH",
        redirectURL: "https://50xxxxx832.vicp.fun/platform/xxxxx",
        sign: "07572BA8F945685E6BB57FC21FDE74E7217A015E00FD56176F3A500465817B33FAC086DA7887AC266BA8518960F0FE208DE1A8E105978B185A8D136DD0F6",
        userId: "xxxxxxxe@aeontech.io"
    }


    try {
    const response = await axios.post(AEON_PAYMENT_URL, {
        ...finalConfig,
        sign: signature
    },
    {
        headers: {
            'Content-Type': 'application/json',
        }
    });


    res.status(200).json({data : response.data, bodyReq: {
        ...finalConfig,
        sign: signature
    }});

} catch (err) {
    console.error("Error paying with Aeon:", err);
    res.status(500).send("Error paying with Aeon", signature);
}

}


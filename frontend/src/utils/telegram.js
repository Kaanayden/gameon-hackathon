

export const verifyTelegramWebAppData = async (telegramInitData) => {
    console.log("test data: ", telegramInitData);    
    const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/telegram/verify-telegram-data`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({telegramInitData: Telegram.WebApp.initData}),
    });
    if (response.ok) {
    } else {
        throw new Error('Failed to verify Telegram Web App data');
    }
  };

export function getUserData() {
    const params = new URLSearchParams(Telegram.WebApp.initData);

const userData = Object.fromEntries(params);
userData.user = JSON.parse(userData.user);
    return userData.user;
}

export function getSessionData() {
    return Telegram.WebApp.initData;
}

export function getUserId() {
    return getUserData().id;
}

export function getUsername() {
    return getUserData().username;
}

export function getUserFullName() {
    const userData = getUserData();
    return userData.first_name + ' ' + userData.last_name;
}
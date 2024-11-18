
import { verifyTelegramWebAppData } from "../utils/telegram.js";

export const verifyTelegramWebAppDataController = (req, res) => {

    const telegramInitData = req.body.telegramInitData;
    const result = verifyTelegramWebAppData(telegramInitData);
    if(result) {
        res.status(200).send("Success");
    } else {
        res.status(400).send("Failed");
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
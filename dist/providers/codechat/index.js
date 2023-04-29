"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationMessage = exports.getTypeMessage = exports.getMessageContent = exports.isMediaMessage = exports.getBase64FromMediaMessage = exports.sendAttachment = exports.sendText = exports.statusInstancia = exports.logoutInstancia = exports.connectInstancia = exports.createInstancia = void 0;
const axios_1 = __importDefault(require("axios"));
const mime_types_1 = __importDefault(require("mime-types"));
const config_1 = require("../../config");
const createInstancia = async (name) => {
    try {
        const url = `${config_1.CODECHAT_BASE_URL}/instance/create`;
        const data = {
            instanceName: name,
        };
        await axios_1.default.post(url, JSON.stringify(data), {
            headers: {
                'apikey': config_1.CODECHAT_API_KEY,
                'Content-Type': 'application/json'
            },
        });
        const connect = await (0, exports.connectInstancia)(name);
        return connect;
    }
    catch (error) {
        throw new Error(error);
    }
};
exports.createInstancia = createInstancia;
const connectInstancia = async (name) => {
    try {
        const url = `${config_1.CODECHAT_BASE_URL}/instance/connect/${name}`;
        const result = await axios_1.default.get(url, {
            headers: {
                'apikey': config_1.CODECHAT_API_KEY,
                'Content-Type': 'application/json'
            },
        });
        return result;
    }
    catch (error) {
        throw new Error(error);
    }
};
exports.connectInstancia = connectInstancia;
const logoutInstancia = async (name) => {
    try {
        const url = `${config_1.CODECHAT_BASE_URL}/instance/logout/${name}`;
        const result = await axios_1.default.delete(url, {
            headers: {
                'apikey': config_1.CODECHAT_API_KEY,
            },
        });
        return result;
    }
    catch (error) {
        throw new Error(error);
    }
};
exports.logoutInstancia = logoutInstancia;
const statusInstancia = async (name) => {
    try {
        const url = `${config_1.CODECHAT_BASE_URL}/instance/connectionState/${name}`;
        const result = await axios_1.default.get(url, {
            headers: {
                'apikey': config_1.CODECHAT_API_KEY,
                'Content-Type': 'application/json'
            },
        });
        return result;
    }
    catch (error) {
        throw new Error(error);
    }
};
exports.statusInstancia = statusInstancia;
const sendText = async (message, number, instancia) => {
    try {
        const url = `${config_1.CODECHAT_BASE_URL}/message/sendText/${instancia}`;
        const data = {
            "number": number,
            "options": {
                "delay": 1200
            },
            "textMessage": {
                "text": message
            }
        };
        const result = await axios_1.default.post(url, JSON.stringify(data), {
            headers: {
                'apikey': config_1.CODECHAT_API_KEY,
                'Content-Type': 'application/json'
            },
        });
        return result;
    }
    catch (error) {
        throw new Error(error);
    }
};
exports.sendText = sendText;
const sendAttachment = async (number, media, instancia, caption) => {
    try {
        const parts = media.split("/");
        const fileName = decodeURIComponent(parts[parts.length - 1]);
        const mimeType = mime_types_1.default.lookup(fileName).toString();
        let type = 'document';
        switch (mimeType.split('/')[0]) {
            case 'image':
                type = 'image';
                break;
            case 'video':
                type = 'video';
                break;
            case 'audio':
                type = 'audio';
                break;
            default:
                type = 'document';
                break;
        }
        const url = type === "audio" ? `${config_1.CODECHAT_BASE_URL}/message/sendWhatsAppAudio/${instancia}` : `${config_1.CODECHAT_BASE_URL}/message/sendMedia/${instancia}`;
        const data = type === "audio" ? {
            "number": number,
            "audioMessage": {
                "audio": media
            }
        } : {
            "number": number,
            "mediaMessage": {
                "mediatype": type,
                "fileName": fileName,
                "media": media
            }
        };
        if (caption && type !== "audio") {
            data.caption = caption;
        }
        const result = await axios_1.default.post(url, JSON.stringify(data), {
            headers: {
                'apikey': config_1.CODECHAT_API_KEY,
                'Content-Type': 'application/json'
            },
        });
        return result;
    }
    catch (error) {
        throw new Error(error);
    }
};
exports.sendAttachment = sendAttachment;
const getBase64FromMediaMessage = async (id, instancia) => {
    try {
        const url = `${config_1.CODECHAT_BASE_URL}/chat/getBase64FromMediaMessage/${instancia}`;
        const data = {
            "key": {
                "id": id
            }
        };
        const result = await axios_1.default.post(url, JSON.stringify(data), {
            headers: {
                'apikey': config_1.CODECHAT_API_KEY,
                'Content-Type': 'application/json'
            },
        });
        return result;
    }
    catch (error) {
        throw new Error(error);
    }
};
exports.getBase64FromMediaMessage = getBase64FromMediaMessage;
const isMediaMessage = (message) => {
    const media = [
        "imageMessage",
        "documentMessage",
        "audioMessage",
        "videoMessage",
        "stickerMessage"
    ];
    const messageKeys = Object.keys(message);
    return messageKeys.some(key => media.includes(key));
};
exports.isMediaMessage = isMediaMessage;
const getMessageContent = (types) => {
    const typeKey = Object.keys(types).find(key => types[key] !== undefined);
    return typeKey ? types[typeKey] : undefined;
};
exports.getMessageContent = getMessageContent;
const getTypeMessage = (msg) => {
    const types = {
        conversation: msg.conversation,
        imageMessage: msg.imageMessage?.caption,
        videoMessage: msg.videoMessage?.caption,
        extendedTextMessage: msg.extendedTextMessage?.text,
        messageContextInfo: msg.messageContextInfo?.stanzaId,
        stickerMessage: msg.stickerMessage?.fileSha256.toString("base64"),
        documentMessage: msg.documentMessage?.caption,
        audioMessage: msg.audioMessage?.caption,
    };
    return types;
};
exports.getTypeMessage = getTypeMessage;
const getConversationMessage = (msg) => {
    const types = (0, exports.getTypeMessage)(msg);
    const messageContent = (0, exports.getMessageContent)(types);
    return messageContent;
};
exports.getConversationMessage = getConversationMessage;

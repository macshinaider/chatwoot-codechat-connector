"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventCodeChat = exports.eventChatWoot = void 0;
const mime_types_1 = __importDefault(require("mime-types"));
const chatwoot_1 = require("../providers/chatwoot");
const codechat_1 = require("../providers/codechat");
const config_1 = require("../config");
const messages_sent = [];
const eventChatWoot = async (body) => {
    if (!body?.conversation)
        return { message: 'bot' };
    if (body.private)
        return { message: 'bot' };
    const chatId = body.conversation.meta.sender.phone_number.replace('+', '');
    const messageReceived = body.content;
    const senderName = body?.sender?.name;
    console.log(`🎉 Evento recebido de ${chatId}`, body);
    if (chatId === '123456' && body.message_type === 'outgoing') {
        const command = messageReceived.replace("/", "");
        if (command === "iniciar") {
            try {
                const status = await (0, codechat_1.statusInstancia)(body.inbox.name);
                if (status.data.state !== "open") {
                    await (0, codechat_1.createInstancia)(body.inbox.name);
                }
                else {
                    await (0, chatwoot_1.createBotMessage)(`🚨 Instância ${body.inbox.name} já está conectada.`, "incoming", body.inbox.name);
                }
            }
            catch (error) {
                await (0, codechat_1.createInstancia)(body.inbox.name);
            }
        }
        if (command === "status") {
            console.log(`Status da instância ${body.inbox.name}: `);
            const status = await (0, codechat_1.statusInstancia)(body.inbox.name);
            await (0, chatwoot_1.createBotMessage)(`⚠️ Status da instância ${body.inbox.name}: *${status.data.state}*`, "incoming", body.inbox.name);
        }
        if (command === "desconectar") {
            console.log(`Desconectando Whatsapp ${body.inbox.name}: `);
            const msgLogout = `🚨 Desconectando Whatsapp da caixa de entrada *${body.inbox.name}*: `;
            await (0, chatwoot_1.createBotMessage)(msgLogout, "incoming", body.inbox.name);
            await (0, codechat_1.logoutInstancia)(body.inbox.name);
        }
    }
    if (body.message_type === 'outgoing' && body?.conversation?.messages?.length && chatId !== '123456') {
        if (config_1.IMPORT_MESSAGES_SENT && messages_sent.includes(body.id)) {
            console.log(`🚨 Não importar mensagens enviadas, ficaria duplicado.`);
            const indexMessage = messages_sent.indexOf(body.id);
            messages_sent.splice(indexMessage, 1);
            return { message: 'bot' };
        }
        let formatText;
        if (senderName === null || senderName === undefined) {
            formatText = messageReceived;
        }
        else {
            formatText = config_1.TOSIGN ? `*${senderName}*: ${messageReceived}` : messageReceived;
        }
        for (const message of body.conversation.messages) {
            if (message.attachments && message.attachments.length > 0) {
                for (const attachment of message.attachments) {
                    console.log(attachment);
                    (0, codechat_1.sendAttachment)(chatId, attachment.data_url, body.inbox.name, formatText);
                }
            }
            else {
                (0, codechat_1.sendText)(formatText, chatId, body.inbox.name);
            }
        }
    }
    return { message: 'bot' };
};
exports.eventChatWoot = eventChatWoot;
const eventCodeChat = async (body) => {
    try {
        const instance = body.instance;
        console.log(`🎉 Evento recebido de ${instance}`, body);
        if (body.event === "messages.upsert") {
            if (body.data.key.fromMe && !config_1.IMPORT_MESSAGES_SENT) {
                return;
            }
            if (body.data.key.remoteJid === 'status@broadcast') {
                console.log(`🚨 Ignorando status do whatsapp.`);
                return;
            }
            const getConversion = await (0, chatwoot_1.createConversation)(body);
            const messageType = body.data.key.fromMe ? 'outgoing' : 'incoming';
            if (!getConversion) {
                console.log("🚨 Erro ao criar conversa");
                return;
            }
            const isMedia = (0, codechat_1.isMediaMessage)(body.data.message);
            const bodyMessage = (0, codechat_1.getConversationMessage)(body.data.message);
            let message;
            if (isMedia) {
                const downloadBase64 = await (0, codechat_1.getBase64FromMediaMessage)(body.data.key.id, instance);
                const random = Math.random().toString(36).substring(7);
                const nameFile = `${random}.${mime_types_1.default.extension(downloadBase64.data.mimetype)}`;
                const attachments = [
                    {
                        content: downloadBase64.data.base64,
                        encoding: "base64",
                        filename: downloadBase64.data?.fileName || nameFile,
                    },
                ];
                message = await (0, chatwoot_1.createMessage)(getConversion, bodyMessage, messageType, attachments);
            }
            else {
                message = await (0, chatwoot_1.createMessage)(getConversion, bodyMessage, messageType);
            }
            messages_sent.push(message.id);
            return message;
        }
        if (body.event === "qrcode.updated") {
            if (body.data.statusCode === 500) {
                const erroQRcode = `🚨 Limite de geração de QRCode atingido, para gerar um novo QRCode, envie a mensagem /iniciar novamente.`;
                return await (0, chatwoot_1.createBotMessage)(erroQRcode, "incoming", instance);
            }
            else {
                const attachments = [
                    {
                        content: body.data?.qrcode.base64.replace("data:image/png;base64,", ""),
                        encoding: "base64",
                        filename: `${instance}.png`,
                    },
                ];
                await (0, chatwoot_1.createBotMessage)("Qrcode", "incoming", instance, attachments);
                const msgQrCode = `⚡️ QRCode gerado com sucesso!\n\nDigitalize este código QR nos próximos 40 segundos:`;
                await (0, chatwoot_1.createBotMessage)(msgQrCode, "incoming", instance);
            }
        }
        if (body.event === "status.instance") {
            const { data } = body;
            const inbox = await (0, chatwoot_1.getInbox)(instance);
            const msgStatus = `⚡️ Status da instância ${inbox.name}: ${data.status}`;
            await (0, chatwoot_1.createBotMessage)(msgStatus, "incoming", instance);
        }
        if (body.event === "connection.update") {
            console.log("connection.update");
            if (body.data.state === "open") {
                const msgConnection = `🚀 Conexão realizada com sucesso!`;
                await (0, chatwoot_1.createBotMessage)(msgConnection, "incoming", instance);
            }
        }
        if (body.event === "contacts.update") {
            const { data } = body;
            if (data.length) {
                for (const item of data) {
                    const number = item.id.split("@")[0];
                    const photo = item.profilePictureUrl || null;
                    const find = await (0, chatwoot_1.findContact)(number);
                    if (find) {
                        await (0, chatwoot_1.updateContact)(find.id, {
                            avatar_url: photo,
                        });
                    }
                }
            }
        }
    }
    catch (error) {
        console.log(error);
    }
};
exports.eventCodeChat = eventCodeChat;

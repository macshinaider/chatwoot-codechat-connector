"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBotMessage = exports.createMessage = exports.getInbox = exports.createConversation = exports.findContact = exports.createContact = exports.updateContact = exports.getContact = void 0;
const chatwoot_sdk_1 = __importDefault(require("@figuro/chatwoot-sdk"));
const config_1 = require("../../config");
const ACCOUNT_ID = config_1.CHATWOOT_ACCOUNT_ID;
const client = new chatwoot_sdk_1.default({
    config: {
        basePath: config_1.CHATWOOT_BASE_URL,
        with_credentials: true,
        credentials: "include",
        token: config_1.CHATWOOT_TOKEN,
    }
});
const getContact = async (id) => {
    const contact = await client.contact.getContactable({
        accountId: +ACCOUNT_ID,
        id
    });
    return contact;
};
exports.getContact = getContact;
const updateContact = async (id, data) => {
    const contact = await client.contacts.update({
        accountId: +ACCOUNT_ID,
        id,
        data
    });
    return contact;
};
exports.updateContact = updateContact;
const createContact = async (phoneNumber, inboxId, name) => {
    const create = await client.contacts.create({
        accountId: +ACCOUNT_ID,
        data: {
            "inbox_id": inboxId,
            "name": name || phoneNumber,
            "phone_number": `+${phoneNumber}`,
        }
    });
    return create;
};
exports.createContact = createContact;
const findContact = async (phoneNumber) => {
    const contact = await client.contacts.search({
        accountId: +ACCOUNT_ID,
        q: `+${phoneNumber}`
    });
    return contact.payload.find((contact) => contact.phone_number === `+${phoneNumber}`);
};
exports.findContact = findContact;
const createConversation = async (body) => {
    try {
        const chatId = body.data.key.remoteJid.split("@")[0];
        const nameContact = !body.data.key.fromMe ? body.data.pushName : chatId;
        const filterInbox = await (0, exports.getInbox)(body.instance);
        const contact = await (0, exports.findContact)(chatId) || await (0, exports.createContact)(chatId, filterInbox.id, nameContact);
        const contactId = contact.id || contact.payload.contact.id;
        if (!body.data.key.fromMe && contact.name === chatId && nameContact !== chatId) {
            await (0, exports.updateContact)(contactId, {
                name: nameContact
            });
        }
        const contactConversations = await client.contacts.listConversations({
            accountId: +ACCOUNT_ID,
            id: contactId
        });
        if (contactConversations) {
            const conversation = contactConversations.payload.find(conversation => conversation.status !== "resolved");
            if (conversation) {
                return conversation.id;
            }
        }
        const conversation = await client.conversations.create({
            accountId: +ACCOUNT_ID,
            data: {
                contact_id: `${contactId}`,
                inbox_id: `${filterInbox.id}`,
            },
        });
        return conversation.id;
    }
    catch (error) {
        console.log(error);
        throw new Error(error);
    }
};
exports.createConversation = createConversation;
const getInbox = async (instance) => {
    const inbox = await client.inboxes.list({
        accountId: +ACCOUNT_ID,
    });
    const findByName = inbox.payload.find((inbox) => inbox.name === instance);
    return findByName;
};
exports.getInbox = getInbox;
const createMessage = async (conversationId, content, messageType, attachments) => {
    const message = await client.messages.create({
        accountId: +ACCOUNT_ID,
        conversationId: conversationId,
        data: {
            content: content,
            message_type: messageType,
            attachments: attachments
        }
    });
    return message;
};
exports.createMessage = createMessage;
const createBotMessage = async (content, messageType, instancia, attachments) => {
    const contact = await (0, exports.findContact)("123456");
    const filterInbox = await (0, exports.getInbox)(instancia);
    const findConversation = await client.conversations.list({
        accountId: +ACCOUNT_ID,
        inboxId: filterInbox.id,
    });
    const conversation = findConversation.data.payload.find((conversation) => conversation?.meta?.sender?.id === contact.id && conversation.status === "open");
    const message = await client.messages.create({
        accountId: +ACCOUNT_ID,
        conversationId: conversation.id,
        data: {
            content: content,
            message_type: messageType,
            attachments: attachments
        }
    });
    return message;
};
exports.createBotMessage = createBotMessage;

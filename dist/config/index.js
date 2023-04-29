"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMPORT_MESSAGES_SENT = exports.TOSIGN = exports.CHATWOOT_BASE_URL = exports.CHATWOOT_TOKEN = exports.CHATWOOT_ACCOUNT_ID = exports.CODECHAT_API_KEY = exports.CODECHAT_BASE_URL = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.CODECHAT_BASE_URL = process.env.CODECHAT_BASE_URL;
exports.CODECHAT_API_KEY = process.env.CODECHAT_API_KEY;
exports.CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID;
exports.CHATWOOT_TOKEN = process.env.CHATWOOT_TOKEN;
exports.CHATWOOT_BASE_URL = process.env.CHATWOOT_BASE_URL;
exports.TOSIGN = process.env.TOSIGN === 'true';
exports.IMPORT_MESSAGES_SENT = process.env.IMPORT_MESSAGES_SENT === 'true';

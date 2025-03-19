"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = __importDefault(require("nodemailer"));
process.env.TINY_SECP256K1_USE_WASM = '0';
const multichainWallet = __importStar(require("multichain-crypto-wallet"));
dotenv_1.default.config();
const sendEmail = (subject, message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const recipients = ((_a = process.env.EMAIL_RECEIVERS) === null || _a === void 0 ? void 0 : _a.split(",")) || [];
    const mailOptions = {
        from: `"Wallet Checker" <${process.env.EMAIL_USER}>`,
        to: recipients.join(","),
        subject: subject,
        text: message
    };
    try {
        yield transporter.sendMail(mailOptions);
        // console.log("📧 Email notification sent!");
    }
    catch (error) {
        // console.error("❌ Failed to send email:", error);
    }
});
let lastBalance = 0;
// Function to perform the scheduled task
const performTask = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[${new Date().toISOString()}] Running scheduled task...`);
    const { balance } = yield multichainWallet.getBalance({
        address: process.env.WALLET_ADDRESS,
        network: 'ethereum',
        rpcUrl: process.env.RPC_URL
    });
    console.log(lastBalance, balance);
    if (balance > lastBalance) {
        yield sendEmail("📈 Wallet Balance Increased!", `Your wallet balance has increased! 🎉\n\nNew Balance: ${balance} ETH`);
    }
    else {
        yield sendEmail("ℹ️ No Wallet Increaement!", `No balance increase detected.\n\nCurrent Balance: ${balance} ETH`);
    }
    lastBalance = balance;
});
performTask();
// Schedule the cron job to run at 08:00 AM and 08:00 PM WAT (West Africa Time)
node_cron_1.default.schedule("0 8,20 * * *", () => {
    console.log("Cron job started...");
    performTask();
}, {
    timezone: "Africa/Lagos"
});

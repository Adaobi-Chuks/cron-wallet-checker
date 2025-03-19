import cron from "node-cron";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import * as multichainWallet from 'multichain-crypto-wallet';

dotenv.config();

const sendEmail = async (subject: string, message: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const recipients = process.env.EMAIL_RECEIVERS?.split(",") || [];
    const mailOptions = {
        from: `"Wallet Checker" <${process.env.EMAIL_USER}>`,
        to: recipients.join(","),
        subject: subject,
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
        // console.log("📧 Email notification sent!");
    } catch (error) {
        // console.error("❌ Failed to send email:", error);
    }
};

let lastBalance = 0;

// Function to perform the scheduled task
const performTask = async () => {
    console.log(`[${new Date().toISOString()}] Running scheduled task...`);

    const { balance } = await multichainWallet.getBalance({
        address: process.env.WALLET_ADDRESS!,
        network: 'ethereum',
        rpcUrl: process.env.RPC_URL
    });

    console.log(lastBalance, balance);

    if (balance > lastBalance) {
        await sendEmail(
            "📈 Wallet Balance Increased!",
            `Your wallet balance has increased! 🎉\n\nNew Balance: ${balance} ETH`
        );
    } else {
        await sendEmail(
            "ℹ️ No Wallet Increaement!",
            `No balance increase detected.\n\nCurrent Balance: ${balance} ETH`
        );
    }

    lastBalance = balance;
};

performTask();

// Schedule the cron job to run at 08:00 AM and 08:00 PM WAT (West Africa Time)
cron.schedule("0 8,20 * * *", () => {
    console.log("Cron job started...");
    performTask();
}, {
    timezone: "Africa/Lagos"
});
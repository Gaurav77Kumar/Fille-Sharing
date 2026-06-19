import { Worker } from "bullmq";
import { emailQueue } from "./EmailQueue.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
    
const processJob = async (job) => {
    const { to, fileName, fileSize, shareUrl, message, isPasswordProtected, subject } = job.data;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: `File shared with you: ${subject}`,
        html: `
        <div style="font-family:sans-serif;max-width:500px">
        <h2>A file has been shared with you</h2>
        <p><strong>File:</strong> ${fileName}</p>
        <p><strong>Size:</strong> ${fileSize}</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
        <a href="${shareUrl}" style="padding:10px 20px;background:#6366f1;color:#fff;
           text-decoration:none;border-radius:6px;display:inline-block;margin-top:12px">
          Download File
        </a>
        ${isPasswordProtected ? "<p><em>This file is password protected</em></p>" : ""}
      </div>",`
    });

    console.log(`Email sent to ${to} for file ${fileName}`);
}

export const emailWorker = new Worker(emailQueue.name, processJob, {
    connection: emailQueue.opts.connection,
    concurrency: 5,
});

emailWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed: ${err.message}`);
});

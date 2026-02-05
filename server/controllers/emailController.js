import asyncHandler from "express-async-handler";
import { sendEmail } from "../utils/emailService.js";

// Test email configuration
export const testEmailConfig = asyncHandler(async (req, res) => {
  const emailSend = req.user.email;
  try {
    const result = await sendEmail({
      to: emailSend,
      subject: "Bacha Bazar - Email Configuration Test",
      message:
        "This is a test email to verify your email configuration is working correctly.",
    });
    res.json({
      success: true,
      message: "Test email sent successfully",
      messageId: result.messageId,
      sentTo: testEmail,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message || "Email configuration test failed");
  }
});

// Send Email
export const sendGeneralEmail = asyncHandler(async (req, res) => {
  const { to, subject, message, html } = req.body;
  if (!to || !subject || !message) {
    res.status(400);
    throw new Error("Missing required fields: to, subject, message");
  }
  try {
    const result = await sendEmail({
      to,
      subject,
      message,
      html,
    });
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
      messageId: result.messageId,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message || "Failed to send email!");
  }
});

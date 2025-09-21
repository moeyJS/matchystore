const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require("../lib/prisma");
const twilio = require('twilio');
const { Vonage } = require('@vonage/server-sdk');

const router = express.Router();


// Initialize OTP services
let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && 
      process.env.TWILIO_ACCOUNT_SID.startsWith('AC') && 
      process.env.TWILIO_AUTH_TOKEN && 
      !process.env.TWILIO_AUTH_TOKEN.startsWith('AC') &&
      process.env.TWILIO_AUTH_TOKEN.length > 20) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
} catch (error) {
  console.log('⚠️  Twilio client initialization failed:', error.message);
  twilioClient = null;
}

const vonage = (process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET) ? new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
}) : null;

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Twilio (WhatsApp)
const sendOTPViaTwilio = async (phone, code) => {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    throw new Error('Twilio not configured');
  }

  // Format phone number for WhatsApp
  const formattedPhone = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;
  
  const message = await twilioClient.messages.create({
    body: `🛍️ *MatchyStore Verification*\n\nYour verification code is: *${code}*\n\nThis code will expire in 10 minutes.\n\nThank you for shopping with MatchyStore! 🧦`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: formattedPhone
  });

  return message.sid;
};

// Send OTP via Vonage
const sendOTPViaVonage = async (phone, code) => {
  if (!vonage) {
    throw new Error('Vonage not configured');
  }

  const response = await vonage.sms.send({
    to: phone,
    from: process.env.VONAGE_BRAND_NAME || 'MatchyStore',
    text: `Your MatchyStore verification code is: ${code}. This code will expire in 10 minutes.`
  });

  return response;
};

// Send OTP
router.post('/send', [
  body('phone').custom((value) => {
    if (!value) {
      throw new Error('Phone number is required');
    }
    // Remove all non-digit characters and check length
    const cleanPhone = value.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      throw new Error('Phone number must be between 10 and 15 digits');
    }
    return true;
  }),
  body('purpose').isIn(['checkout', 'login', 'registration', 'order_lookup'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, purpose } = req.body;

    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clean up old OTPs for this phone
    await prisma.oTP.deleteMany({
      where: {
        phone,
        expiresAt: { lt: new Date() }
      }
    });

    // Create new OTP record
    const otpRecord = await prisma.oTP.create({
      data: {
        phone,
        code,
        expiresAt
      }
    });

    // Send OTP via configured service
    try {
      if (process.env.OTP_PROVIDER === 'twilio' && twilioClient) {
        await sendOTPViaTwilio(phone, code);
        console.log(`✅ OTP sent via Twilio WhatsApp to ${phone}: ${code}`);
      } else if (process.env.OTP_PROVIDER === 'vonage' && vonage) {
        await sendOTPViaVonage(phone, code);
        console.log(`✅ OTP sent via Vonage to ${phone}: ${code}`);
      } else {
        // For development/testing - just log the code
        console.log(`🔧 DEVELOPMENT MODE - OTP for ${phone}: ${code}`);
        console.log(`📱 To enable WhatsApp OTP, configure Twilio credentials in .env file`);
      }

      res.json({
        message: 'OTP sent successfully',
        expiresIn: 600, // 10 minutes in seconds
        developmentMode: !twilioClient && !vonage
      });
    } catch (sendError) {
      console.error('❌ Error sending OTP:', sendError);
      
      // Delete the OTP record if sending failed
      await prisma.oTP.delete({
        where: { id: otpRecord.id }
      });

      res.status(500).json({ 
        error: 'Failed to send OTP. Please check your phone number and try again.',
        details: process.env.NODE_ENV === 'development' ? sendError.message : undefined
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP
router.post('/verify', [
  body('phone').custom((value) => {
    if (!value) {
      throw new Error('Phone number is required');
    }
    const cleanPhone = value.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      throw new Error('Phone number must be between 10 and 15 digits');
    }
    return true;
  }),
  body('code').isLength({ min: 6, max: 6 }),
  body('purpose').isIn(['checkout', 'login', 'registration', 'order_lookup'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, code, purpose } = req.body;

    // Find valid OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        phone,
        code,
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        error: 'Invalid or expired OTP code' 
      });
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { isUsed: true }
    });

    // Clean up expired OTPs for this phone
    await prisma.oTP.deleteMany({
      where: {
        phone,
        expiresAt: { lt: new Date() }
      }
    });

    res.json({
      message: 'OTP verified successfully',
      verified: true
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend OTP
router.post('/resend', [
  body('phone').custom((value) => {
    if (!value) {
      throw new Error('Phone number is required');
    }
    const cleanPhone = value.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      throw new Error('Phone number must be between 10 and 15 digits');
    }
    return true;
  }),
  body('purpose').isIn(['checkout', 'login', 'registration', 'order_lookup'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, purpose } = req.body;

    // Check if there's a recent OTP (within 1 minute)
    const recentOTP = await prisma.oTP.findFirst({
      where: {
        phone,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) } // 1 minute ago
      }
    });

    if (recentOTP) {
      return res.status(429).json({ 
        error: 'Please wait before requesting another OTP' 
      });
    }

    // Generate new OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new OTP record
    const otpRecord = await prisma.oTP.create({
      data: {
        phone,
        code,
        expiresAt
      }
    });

    // Send OTP
    try {
      if (process.env.OTP_PROVIDER === 'twilio' && twilioClient) {
        await sendOTPViaTwilio(phone, code);
        console.log(`✅ OTP resent via Twilio WhatsApp to ${phone}: ${code}`);
      } else if (process.env.OTP_PROVIDER === 'vonage' && vonage) {
        await sendOTPViaVonage(phone, code);
        console.log(`✅ OTP resent via Vonage to ${phone}: ${code}`);
      } else {
        console.log(`🔧 DEVELOPMENT MODE - Resend OTP for ${phone}: ${code}`);
      }

      res.json({
        message: 'OTP resent successfully',
        expiresIn: 600,
        developmentMode: !twilioClient && !vonage
      });
    } catch (sendError) {
      console.error('❌ Error resending OTP:', sendError);
      
      await prisma.oTP.delete({
        where: { id: otpRecord.id }
      });

      res.status(500).json({ 
        error: 'Failed to resend OTP. Please check your phone number and try again.',
        details: process.env.NODE_ENV === 'development' ? sendError.message : undefined
      });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

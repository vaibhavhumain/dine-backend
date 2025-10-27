import transporter from "../config/nodemailer.js";

const otpStorage = {}; 

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const signup = async (req, res) => {
  const { email } = req.body;
  
  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = generateOTP();
  otpStorage[email] = otp; 

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Seamless Dine",
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent to your email!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP", error });
  }
};

import nodemailer from "nodemailer"
import dotenv from "dotenv"
import { from } from "node:stream/iter"

dotenv.config()

let transporter = nodemailer.createTransport({
    host: process.env.GMAIL_HOST as string,
    port: 587,
    service: 'gmail', // This is not needed when the host name and the port number is included
    secure: false,
    auth: {
        user: process.env.GMAIL_USER as string,
        pass: process.env.GMAIL_PASS as string
    }

})

// send the email otp code
const sendEmailOtp = async (email: string, otp: number) => {
    try {
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Your OTP code",
            text: `Your OTP code is ${otp}`,
            html: `
                <h1 style = "#2c3e50">Welcome to Certichain AI!</h1>
                <p>Dear valued user</p>
                <p>Thank you for signing up/signing in with <strong>Certichain AI</strong>. 
                    We are thrilled to have you join our community and look forward to supporting you achieving you goals
                </p>
                <p>Here is your one-time OTP code for verification</p>
                <p style = "font-size: 20px; font-weight: bold; color: #0ea5e9;"></p>
                <p>Please use this code to complete you regsitration/login. If you have any question or need assistance, feel free to reach out to our support team</p>
                <p>We have excited to have you on board and can't see you all the amaizing things you'll will accomplish with Certichain AI</p>
                <p>Warm Regards,</p>
                <p><strong>Certichain AI Team</strong></p>
            `,
        }
        
        return transporter.sendMail(mailOptions, (err, info) => {
            if(err) {
                console.log("Error sending email:", err)
            }else {
                console.log("Email sent:", info.response)
            }
        })
        
    } catch (error) {
        console.error(" Error sending the email")
        throw error
    }
}

// send a welcome message when signing up
const sendWelcomeEmail = async (email: string) => {
    try {
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'welcome Email',
            html: `
                <h1 style = "#2c3e50">Welcome to Certichain AI!</h1>
                <p>Welcome to certichain AI, Your account has been created successfully</p>
                 <p>Thank you for signing up/signing in with <strong>Certichain AI</strong>. 
                    We are thrilled to have you join our community and look forward to supporting you achieving you career goals
                </p>
            `
        }
        return transporter.sendMail(mailOptions, (err, info) => {
            if(err) {
                console.log("Error sending email:", err)
            }else {
                console.log("Email sent:", info.response)
            }
        })
    } catch (error) {
        console.error('Error sending the welcome email', error)
    }

}
export {sendEmailOtp, sendWelcomeEmail};

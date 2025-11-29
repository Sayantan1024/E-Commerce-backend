import { Enquiry } from "../models/enquiry.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import nodemailer from "nodemailer"

export const enquiryFromCustomer = asyncHandler(async (req, res) => {
    const { customerName, customerPhone, productName } = req.body

    if (!customerName || !customerPhone)
        throw new ApiError(400, "Customer details required")

    const existingEnquiry = await Enquiry.findOne({ customerPhone, productName })

    if (existingEnquiry)
        throw new ApiError(409, "Enquiry already exists")

    const createdEnquiry = await Enquiry.create({
        customerName,
        customerPhone,
        productName
    })

    if (!createdEnquiry)
        throw new ApiError(404, "Error in creating enquiry")

    const transporter = nodemailer.createTransport({
        secure: true,
        service: "gmail",
        auth:
        {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    await transporter.sendMail({
        from: `Advance Telecom ${process.env.EMAIL_USER}`,
        to: process.env.CLIENT_EMAIL,
        subject: "Customer-Product Enquiry",
        text: `New Enquiry Received:
               Customer Name: ${customerName}
               Customer Phone: ${customerPhone}
               Interested Product: ${productName}`,
        html: `
                <div style="
                font-family: Arial, sans-serif;
                padding: 20px;
                max-width: 600px;
                margin: auto;
                background: #ffffff;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
                ">

                <!-- Header -->
                <div style="
                    text-align: center;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #e5e7eb;
                ">
                    <h1 style="
                    margin: 0;
                    font-size: 26px;
                    font-weight: bold;
                    background: linear-gradient(to right, #3b82f6, #06b6d4, #10b981);
                    -webkit-background-clip: text;
                    color: transparent;
                    ">
                    Advance Telecom
                    </h1>
                    <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                    New Customer Product Enquiry
                    </p>
                </div>

                <!-- Body Text -->
                <p style="font-size: 16px; color: #374151; margin-top: 20px;">
                    Hello, you have received a new enquiry from a customer on your website.
                </p>

                <!-- Table -->
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                    <td style="padding: 10px; font-weight: bold; background: #f3f4f6; border: 1px solid #e5e7eb;">
                        Customer Name
                    </td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">
                        ${customerName}
                    </td>
                    </tr>

                    <tr>
                    <td style="padding: 10px; font-weight: bold; background: #f3f4f6; border: 1px solid #e5e7eb;">
                        Phone Number
                    </td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">
                        ${customerPhone}
                    </td>
                    </tr>

                    <tr>
                    <td style="padding: 10px; font-weight: bold; background: #f3f4f6; border: 1px solid #e5e7eb;">
                        Product Interested
                    </td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">
                        ${productName}
                    </td>
                    </tr>
                </table>

                <!-- Footer -->
                <p style="margin-top: 25px; font-size: 14px; color: #6b7280;">
                    Thank you,<br>
                    <span style="font-weight: bold; color: #111827;">Advance Telecom Website</span>
                </p>

                <p style="font-size: 12px; color: #9ca3af; margin-top: 10px; text-align: center;">
                    This is an automated email. Please do not reply.
                </p>

                </div>

                <!-- Mobile responsiveness -->
                <style>
                @media only screen and (max-width: 600px) {
                    table td {
                    display: block;
                    width: 100% !important;
                    }
                }
                </style>
              `
    })

    //for testing purposes
    //console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

    return res
        .status(201)
        .json(new ApiResponse(201, createdEnquiry, "Enquiry created successfully"))
})
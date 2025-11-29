import mongoose, {Schema} from "mongoose";

const enquirySchema = new Schema(
    {
        customerName: {
            type: String,
            required: true,
        },
        customerPhone: {
            type: Number,
            required: true,
        },
        productName: {
            type: String,
            required: true,
        }
    }, {timestamps: true}
)

export const Enquiry = mongoose.model("Enquiry", enquirySchema)
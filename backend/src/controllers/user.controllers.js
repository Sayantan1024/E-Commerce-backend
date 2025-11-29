import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js";

const generateAccessAndRefreshToken = async (clientId) => {
    try {
        const client = await User.findById(clientId)
        const accessToken = client.generateAccessToken()
        const refreshToken = client.generateRefreshToken()

        client.refreshToken = refreshToken
        await client.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Error in generating tokens")
    }
}

const loginClient = asyncHandler( async (req, res) => {
    const {username, email, password} = req.body

    if(
        [username, email, password].some((field) => field?.trim() === "")
    )
        throw new ApiError(400, "All fields are required")

    const client = await User.findOne({email})

    if(!client)
        throw new ApiError(404, "Unauthorized access")

    const isPasswordValid = await client.isPasswordCorrect(password)

    if(!isPasswordValid)
        throw new ApiError(401, "Invalid client credentials")

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(client._id)

    const loggedInClient = await User.findById(client._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                client: loggedInClient, accessToken, refreshToken
            },
            "Client logged in successfully"
        )
    )
})

const addInterestedProducts = asyncHandler( async(req, res) => {
    const {sessionToken, productId} = req.body

    const otpSession = await Otp.findOne({sessionToken})
    if(!otpSession)
        throw new ApiError(400, "Invalid session token")

    const user = await User.findOne({email : otpSession.email})
    if(!user)
        throw new ApiError(404, "User not found")

    const updatedUser = await User.findByIdAndUpdate(
        user?._id,
        { 
            $addToSet: {interestedProducts: productId} 
        },
        { new: true }
    ).populate("interestedProducts")

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedUser, "Product added to interested list")
    )
})

const getDashboardForClient = asyncHandler( async (req, res) => {

    //for less customers but more heavy
    // const customers = await User.find().populate("interestedProducts", "name")

    //for more customers, so less heavy
    // const customers = await User.find().select("name email phone interestedProducts").populate("interestedProducts", "name").lean()


    //pipeline for large number of users, group by product 
    const productsWithCustomers = await Product.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "interestedProducts",
                as: "interestedCustomers"
            }
        },
        {
            $project: {
                name: 1,
                interestedCustomers: {
                    $map: {
                        input: "$interestedCustomers",
                        as: "customer",
                        in: {
                            name: "$$customer.name",
                            email: "$$customer.email",
                            phone: "$$customer.phone"
                        }
                    }
                }
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, productsWithCustomers, "Interested products for customers fetched successfully"))
})

export {loginClient, addInterestedProducts, getDashboardForClient}
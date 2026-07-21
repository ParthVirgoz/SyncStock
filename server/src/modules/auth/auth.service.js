import Auth from "./auth.model.js"

const findByEmail=async (email) => {
    try {
        return await Auth.findOne({email});
    } catch (error) {
        throw new Error(error.message||"Error find by email.")
    }
}

export default{
    findByEmail
}
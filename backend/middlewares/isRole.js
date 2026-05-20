import User from "../models/user.model.js"

// Usage: isRole("owner")  or  isRole("user", "owner")
const isRole = (...allowedRoles) => async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select("role")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({
                message: `Access denied. Only ${allowedRoles.join(" or ")} can perform this action.`
            })
        }
        req.userRole = user.role
        next()
    } catch (error) {
        return res.status(500).json({ message: `isRole error ${error}` })
    }
}

export default isRole

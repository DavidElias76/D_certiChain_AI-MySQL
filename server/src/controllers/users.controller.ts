
import type { Request, Response} from "express"
import type { CustomError } from "../types/error.types";
import { getUsersService, getUserByIdService, addUsersService, updateUsersService, deleteUserService } from "../services/users.service";
import { OmitPasswordUser, User, UserRole } from "../types/index.types";
import { UserCreateInput } from "../types/index.types"

// implement caching that will get all the user and we will update the value of the user and everything from it
// learn about caching - using reddis
export const getUsersController = async (
    req: Request<{}, unknown, User, {}>, 
    res: Response<OmitPasswordUser[] | { error: string }>
) => {
    try {
        const users = await getUsersService();
        return res.status(200).json(users)
    } catch (err) {
        const error = err as CustomError
        return res.status(error.statusCode || 500).json({ error: error.message })
    }
}

export const getUserByIdController = async (
    req: Request<{ id: string}, unknown, {}, {}>,
    res: Response<{ message: string; user: OmitPasswordUser} | { error: string}>
) => {
    try {
        const { id } = req.params;
        const user = await getUserByIdService(Number(id))
        if(!user) {
            const error = new Error("User not found") as CustomError
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: "success",
            user
        })
    } catch (err) {
        const error = err as CustomError
        return res.status(error.statusCode || 500).json({ error: error.message })
    }
}

export const addUsersController = async (
    req: Request<{}, unknown, UserCreateInput, {}>,
    res: Response<{ message: string} | { error: string}>
) => {
    try {
        const { username, email, password, role, institution_name} = req.body

        if(!username || !email || !password || !role) {
            return res.status(400).json({ error: "Fill all fields" })
        }

        const validRoles = ["student", "employer", "admin", "systemAdmin"];
        if(!validRoles.includes(role)) {
            return res.status(400).json({
                error: "Invalid role. Must be student, employer, or admin"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const studentEmailRegex = /^[a-zA-Z0-9._-]+@students\.[a-zA-Z0-9-]+\.ac\.ke$/;
        if (role === "student") {
            if (!institution_name) {
                return res.status(400).json({
                    error: "Institution name is required for students"
                });
            }

            if (!studentEmailRegex.test(email)) {
                return res.status(400).json({
                    error: "Student email must be in the format username@students.institution.ac.ke"
                });
            }
        } else {
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    error: "Please provide a valid email address"
                });
            }
        }

        const { user } = await addUsersService(
            username.trim(), 
            email.trim(), 
            password, 
            role as UserRole,
            institution_name?.trim(),
        )

        if(!user) {
            return res.status(500).json({ message: "Failed to create user" });
        }
        
        return res.status(200).json({ message: "User added successfully"});
    } catch (err) {
        const error = err as CustomError
        return res.status(error.statusCode || 500).json({ error: error.message })
    }
}

export const updateUsersController = async (
    req: Request<{ id: string}, unknown, Partial<UserCreateInput>, {}>,
    res: Response<{ message: string } | { error: string }>
) => {
    try {
        const { id } = req.params;
        if(Object.keys(req.body).length === 0) {
           return res.status(400).json({ error: "No data provided for update" }) 
        }
        const { username, email, password, role, institution_name } = req.body
        const userUpdate = {
            ...(username && { username}),
            ...(email && { email }),
            ...(password && { password}),
            ...(role && { role }),
            ...(institution_name && { institution_name })
        }

        await updateUsersService(Number(id), userUpdate)
        return res.status(200).json({ message: "User updated successsfully"})
    } catch (err) {
        const error = err as CustomError
        return res.status(error.statusCode || 500).json({ error: error.message })
    }
}

export const deleteUsersController = async (
    req: Request<{ id: string }>,
    res: Response<{ message: string} | { error: string }>
) => {
    try {
        const { id } = req.params;
        await deleteUserService(Number(id));
        return res.status(200).json({ message: "User deleted successfully"})
    } catch (err) {
        const error = err as CustomError
        return res.status(error.statusCode || 500).json({ error: error.message})
    }
}

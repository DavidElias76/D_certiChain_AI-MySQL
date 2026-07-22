import type { Router } from "express"
import express from "express"
import { 
    getUsersController, 
    getUserByIdController, 
    addUsersController, 
    updateUsersController, 
    deleteUsersController 
} from "../controllers/users.controller";

// import { authMiddleware } from "../middlewares/auth.middleware";
// import { roleMiddleware } from "../middlewares/role.middleware";

const usersRoutes: Router = express.Router()

usersRoutes.get('/', 
    // authMiddleware, 
    // roleMiddleware(["admin"]), 
    getUsersController
); // gets all the users

usersRoutes.get('/:id', 
    // authMiddleware, 
    // roleMiddleware(["admin"]), 
    getUserByIdController
); // gets a user with specific id

usersRoutes.post('/add', 
//     authMiddleware, 
//     roleMiddleware(["admin"]), 
    addUsersController
); // adds a user

usersRoutes.put('/:id', 
//     authMiddleware, 
//     roleMiddleware(["admin"]), 
    updateUsersController
); // updates a user

usersRoutes.delete('/:id', 
//     authMiddleware, 
//     roleMiddleware(["admin"]), 
    deleteUsersController
); // deletes a user

export default usersRoutes;

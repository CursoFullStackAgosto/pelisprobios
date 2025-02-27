import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const getUserCtrl = async (request: Request, response: Response) => {
    const { userId } = request.params;
    const { user: sessionUser } = request.body;
    const user = await prisma.user.findUnique({
        where: {
            id: parseInt(userId),
        },
        select: {
            id: true,
            username: true,
            email: true,
            age: true,
        },
    });
    if (!user) {
        return response.status(404).json({
            message: "Usuario no encontrado",
        });
    }
    if (sessionUser.userId !== user.id) {
        return response.status(401).json({
            message: "Acceso denegado",
        });
    }
    return response.status(200).json({
        user,
    });

}
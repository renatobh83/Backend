import express from "express";
import isAuth from "../middleware/isAuth";
import * as ApiConfirmacaoController from "../controllers/ApiConfirmacaoController"
const apiConfirmacaoRoutes = express.Router();

apiConfirmacaoRoutes.get("/api-confirma", isAuth, ApiConfirmacaoController.index)
apiConfirmacaoRoutes.post("/api-confirma", isAuth, ApiConfirmacaoController.store)


export default apiConfirmacaoRoutes;
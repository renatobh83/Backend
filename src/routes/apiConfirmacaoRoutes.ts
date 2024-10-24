import express from "express";
import isAuth from "../middleware/isAuth";
import * as ApiConfirmacaoController from "../controllers/ApiConfirmacaoController";
const apiConfirmacaoRoutes = express.Router();

apiConfirmacaoRoutes.get(
  "/api-confirma",
  isAuth,
  ApiConfirmacaoController.index
);
apiConfirmacaoRoutes.post(
  "/api-confirma",
  isAuth,
  ApiConfirmacaoController.store
);

apiConfirmacaoRoutes.post(
  "/api-confirma/:id",
  isAuth,
  ApiConfirmacaoController.connect
);
apiConfirmacaoRoutes.delete(
  "/api-confirma/:id",
  isAuth,
  ApiConfirmacaoController.remove
);

apiConfirmacaoRoutes.put(
  "/api-confirma/:id",
  isAuth,
  ApiConfirmacaoController.update
);

apiConfirmacaoRoutes.put(
  "/api-confirma/:id/:status",
  isAuth,
  ApiConfirmacaoController.updateStatus
);
export default apiConfirmacaoRoutes;

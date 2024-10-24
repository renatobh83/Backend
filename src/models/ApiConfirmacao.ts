import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  AutoIncrement,
  AllowNull,
  Default,
  BeforeSave,
} from "sequelize-typescript";

import Tenant from "./Tenant";
@Table({ tableName: "ApiConfirmacao" })
class ApiConfirmacao extends Model<ApiConfirmacao> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Default(null)
  @AllowNull
  @Column
  token: string;

  @Default(null)
  @AllowNull
  @Column
  status: string;

  @Default(null)
  @AllowNull
  @Column
  token2: string;

  @Column
  usuario: string;

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @Column
  senha: string;

  @AllowNull
  @Column(DataType.JSONB)
  action: string[];

  @AllowNull
  @Column
  nomeApi: string;

  @Column(DataType.DATE(6))
  expDate: Date;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  @BeforeSave
  // biome-ignore lint/complexity/noUselessLoneBlockStatements: <explanation>
  static async calcularDataExpira(api: ApiConfirmacao) {
    if (api.token) {
      const payloadBase64 = api.token.split(".")[1];
      const payloadJson = Buffer.from(payloadBase64, "base64").toString(
        "utf-8"
      );
      const payload = JSON.parse(payloadJson);

      const expTimestamp = payload.exp;
      const expDate = new Date(expTimestamp * 1000);
      api.expDate = expDate; // Definindo a data de expiração
    } else {
      api.expDate = null;
    }
  }
}

// Função para calcular dias até a expiração

export default ApiConfirmacao;

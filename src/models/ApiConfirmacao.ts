import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    DataType,
    PrimaryKey,
    ForeignKey,
    AutoIncrement
  } from "sequelize-typescript";

  import Tenant from "./Tenant";
  @Table({ tableName: 'ApiConfirmacao' })
  class ApiConfirmacao extends Model<ApiConfirmacao> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    link: string;

    @Column
    usuario: string;

    @ForeignKey(() => Tenant)
    @Column
    tenantId: number;

    @Column
    senha: string;

    @Column(DataType.JSONB)
    action: string[];

    @CreatedAt
    @Column(DataType.DATE(6))
    createdAt: Date;

    @UpdatedAt
    @Column(DataType.DATE(6))
    updatedAt: Date;

  }

  export default ApiConfirmacao;

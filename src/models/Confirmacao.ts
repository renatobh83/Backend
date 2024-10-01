import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  AutoIncrement,
  Default,
  DataType,


} from "sequelize-typescript";
import Contact from "./Contact";
import Tenant from "./Tenant";

@Table({ tableName: 'Confirmacao' })
class Confirmacao extends Model<Confirmacao> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({ defaultValue: "pending" })
  status: string;

  @Column
  contatoSend: string;

  @Column
  lastMessage: string;

  @Column(DataType.JSONB)
  procedimentos: number[]

  @Column(DataType.JSONB)
  idexterno: number[]

  @Column
  atendimentoData: string

  @Column
  atendimentoHora: string

  @Default(false)
  @Column
  answered: boolean;

  @Column(DataType.BIGINT)
  lastMessageAt: number;


  @Column(DataType.STRING)
  messageResponse: string;

  @Default(false)
  @Column
  preparoEnviado: boolean

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @Column
  preparo!: Buffer

  @Column(DataType.BIGINT)
  closedAt: Date;

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @Column
  channel: string;

  @Column
  enviada: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

}

export default Confirmacao;
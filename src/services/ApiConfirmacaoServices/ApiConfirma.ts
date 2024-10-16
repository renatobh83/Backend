import { logger } from "../../utils/logger";
const fs = require('fs');
const path = require('path');
const axios = require("axios");

class ApiConfirma {
  id: string;
  initialized: any;
  pw: string;
  token: string;
  linkApi: string;
  constructor(id: string, pw: string, link: string) {
    // biome-ignore lint/style/noCommaOperator: <explanation>
    this.id = id;
    this.pw = pw;
    this.token = null;
    this.linkApi = link;
    this.initialized = this.initialize();
  }

  async initialize() {
    try {
      const response = await axios.get(
        `${this.linkApi}/doFuncionarioLogin?id=${this.id}&pw=${this.pw}`
      );

      this.token = response.data[0].ds_token;
      logger.info("api already in server!");
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  }

  async confirmaExame(atendimento) {
    await this.initialized;
    const url = `${this.linkApi}/doAgendaConfirmar?cd_atendimento=${atendimento}`;
    try {
      const response = await axios.post(url, null, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      return response;
    } catch (error) {
      console.error("Erro ao confirmar exame:", error);
      throw error;
    }
  }
  async cancelaExame(atendimento) {
    await this.initialized;
    const url = `${this.linkApi}/doAgendaCancelar?cd_atendimento=${atendimento}`;
    try {
      const response = await axios.post(url, null, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      //   console.log("Exame cancelado com sucesso");
      return response;
    } catch (error) {
      console.error("Erro ao cancelar exame:", error);
      throw error;
    }
  }
  async doGetPreparo(procedimento) {
    await this.initialized;
    const url = `${this.linkApi}/doProcedimentoPreparo?cd_procedimento=${procedimento}`;
    try {
      const response = await axios.post(url, null, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      //   console.log("Exame confirmado com sucesso", response.data);

      const blob = response.data[0].bb_preparo;
      return blob;
    } catch (error) {
      console.error("Erro ao confirmar exame:", error);
      throw error;
    }
  }

  async doGetAgendamentos(codPaciente: number){
    const url = `${this.linkApi}/doListaAgendamento?cd_paciente=${codPaciente}`;

    try {
      const { data } = await axios.post(url, {}, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      //   console.log("Exame confirmado com sucesso", response.data);


      return data
    } catch (error) {
      console.error("Erro ao confirmar exame:", error);
      throw error;
    }
  }

  async doPacienteLogin(login: string, pw: string){
    const url = `${this.linkApi}/doPacienteLogin?id=${login}&pw=${pw}`;

    try {
      const { data } = await axios.post(url, {}, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
         return data
    } catch (error) {
      console.error("Erro ao confirmar exame:", error);
      throw error;
    }
  }
  async doCadatrarPaciente(dataB64: any){
    const url = `${this.linkApi}/doPacienteTabela/?cd_operacao=0`;
    try {
      const { data } = await axios.post(url, { js_paciente: dataB64}, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
         return data
    } catch (error) {
      console.error("Error :", error);
      throw error;
    }
  }
  async doAtualizaPaciente(dataB64: any , codigoPaciente: number){
    const url = `${this.linkApi}/doPacienteTabela/?cd_paciente=${codigoPaciente}&cd_operacao=3`;
    try {
      const { data } = await axios.post(url, { js_paciente: dataB64}, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
         return data
    } catch (error) {
      console.error("Error :", error);
      throw error;
    }
  }
  async doApagarPaciente(dataB64: any, codigoPaciente: number){
    const url = `${this.linkApi}/doPacienteTabela/?cd_paciente=${codigoPaciente}&cd_operacao=2`;
    try {
      const { data } = await axios.post(url, { js_paciente: dataB64}, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
         return data
    } catch (error) {
      console.error("Error :", error);
      throw error;
    }
  }
  async doListaPlano(){
    const url = `${this.linkApi}/doListaPlano/`;
    try {
      const { data } = await axios.post(url, {}, {
        headers: {
          Authorization: `Bearer ${this.token}`,

        },
      });
         return data
    } catch (error) {
      console.error("Error :", error);
      throw error;
    }
  }
  async doListaAtendimentos(codigoPaciente: number){
    const url = `${this.linkApi}/doListaAtendimento?cd_paciente=${codigoPaciente}`;
    try {
      const { data } = await axios.post(url, {}, {
        headers: {
          Authorization: `Bearer ${this.token}`,

        },
      });
         return data
    } catch (error) {
      console.error("Error :", error);
      throw error;
    }
  }
  async doListaMedicos(){
    const url = `${this.linkApi}/doListaMedico`;
    try {
      const { data } = await axios.post(url, {}, {
        headers: {
          Authorization: `Bearer ${this.token}`,

        },
      });
      console.log(data)
         return data
    } catch (error) {
      console.error("Error :", error);
      throw error;
    }
  }
  async doGetLaudo(cdExame: number, cdPaciente: number, cdFuncionario: number, entrega: boolean){
    const url = `${this.linkApi}/doLaudoDownload?cd_exame=${cdExame}&cd_paciente=${cdPaciente}&cd_funcuionario=${cdFuncionario}&sn_entrega=${entrega}`;
    try {
      const response = await axios.post(url, {}, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Accept': 'application/pdf'
        },responseType: 'stream'
      });

      const filePath = path.resolve(__dirname, "..","..","..",'public', `${cdExame}.pdf`)
      const writer = fs.createWriteStream(filePath)
      response.data.pipe(writer);


         return 'PDF salvo com sucesso.'
    } catch (error) {
      console.error("Error :", error);
      throw error;
    }
  }
  async doListaConfirmacao(dataPost){
    const url = `${this.linkApi}/doListaConfirmacao`;
    try {
      const response = await axios.post(url, { dt_de: '2024/10/16', dt_ate: '2024/10/16' }, {
        headers: {
          Authorization: `Bearer ${this.token}`,
             'Content-Type': 'multipart/form-data'
        },
      });


         return response.data
    } catch (error) {
      console.error("Error :", error);
      throw error;
    }
  }
}

export default ApiConfirma;

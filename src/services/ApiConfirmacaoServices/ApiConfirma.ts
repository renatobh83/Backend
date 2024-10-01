const axios = require("axios");

class ApiConfirma {
  id: string;
  initialized: any;
  pw: string;
  token: string;
  linkApi: string;
  constructor(id: string, pw: string, link: string) {
    (this.id = id), (this.pw = pw), (this.token = null);
    this.linkApi = link;
    this.initialized = this.initialize();
  }

  async initialize() {
    try {
      const response = await axios.get(
        `${this.linkApi}/doFuncionarioLogin?id=${this.id}&pw=${this.pw}`
      );

      this.token = response.data[0].ds_token;

    } catch (error) {
      console.error("Error fetching token:", error);
    }
  }
  getToken() {
    return this.token;
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
}

export default ApiConfirma;

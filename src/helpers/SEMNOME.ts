import type ApiConfirma from "../services/ApiConfirmacaoServices/ApiGenesis";

export async function confirmarAtendimentos(atendimentos, instanceApi: ApiConfirma) {

    try {
        // Mapeia cada atendimento para uma promessa
        const promessas = atendimentos.map(async (atendimento) => {
            const response = await instanceApi.confirmaExame(atendimento);
            return response;
        });

        // Aguarda todas as promessas serem resolvidas
        const responses = await Promise.allSettled(promessas);

        // Verifica se todos os status são 200
        const todosSucesso = responses.every(response => response.status === 'fulfilled');

        if (todosSucesso) {
            // A FAZER
                // - ENVIAR MENSAGEM DE EXAME CONFIRMADO
            console.log("Todos os atendimentos foram confirmados com sucesso.");
            //await getPreparos(data.procedimentos)
            return true
        // biome-ignore lint/style/noUselessElse: <explanation>
        } else {
            console.log("Nem todos os atendimentos foram confirmados com sucesso.");
            return false
        }

    } catch (error) {
        console.error("Ocorreu um erro durante a confirmação dos atendimentos:", error);
    }
}

export async function getPreparos(procedimentos: number[], instanceApi: ApiConfirma) {
    const promessas = procedimentos.map(async (procedimento) => {
        const response = await instanceApi.doGetPreparo(procedimento);
        return response;
    });
    const responses = await Promise.all(promessas);

   }
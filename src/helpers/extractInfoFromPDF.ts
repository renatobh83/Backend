import fs from "node:fs";
import pdfParse from "pdf-parse";

export const extractInfoFromPdf = async (pdfPath) => {
  const pdfBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(pdfBuffer);
  const text = data.text;
  // Divide o texto em linhas
  const lines = text.split("\n").map((line) => line.trim());

  // Variáveis para armazenar os resultados
  let validadeSenha = null;
  let isValiditySection = false;
  const procedimentos = [];
  const normalizedLines = [];

  let isProcedimentosSection = false;

  // Passo 1: Normalizar as linhas dentro do bloco de procedimentos
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Início da seção "Dados da Solicitação / Procedimentos e Exames Solicitados"
    if (
      line.includes("Dados da Solicitação / Procedimentos e Exames Solicitados")
    ) {
      isProcedimentosSection = true;
      continue;
    }
    if (
      line.includes("Data da Autorização") &&
      line.includes("Data de Validade da Senha")
    ) {
      isValiditySection = true;
      continue;
    }
    if (isValiditySection && /^\d{2}\/\d{2}\/\d{4}/.test(line)) {
      const dateMatch = line.match(/\d{2}\/\d{2}\/\d{4}/g);
      if (dateMatch && dateMatch.length > 1) {
        validadeSenha = dateMatch[1];
      }
      isValiditySection = false;
    }
    // Fim da seção "Dados do Contratado Executante"
    if (line.includes("Dados do Contratado Executante")) {
      isProcedimentosSection = false;
      break; // Saímos do loop porque não precisamos mais processar
    }

    // Processar apenas as linhas dentro da seção de procedimentos
    if (isProcedimentosSection) {
      // Identifica o início de um procedimento
      if (line.startsWith("22")) {
        let normalizedLine = line;

        // Junta as próximas linhas até encontrar outra linha que começa com "22" ou uma linha vazia
        while (
          i + 1 < lines.length &&
          !lines[i + 1].startsWith("22") &&
          lines[i + 1] !== ""
        ) {
          // Para a normalização antes do cabeçalho da próxima seção
          if (lines[i + 1].includes("Dados do Contratado Executante")) {
            isProcedimentosSection = false;
            break;
          }

          normalizedLine += ` ${lines[++i]}`; // Junta a próxima linha
        }

        // Adiciona a linha normalizada
        normalizedLines.push(normalizedLine);
      } else if (line.match(/^\d+$/)) {
        // Caso a quantidade esteja sozinha, adiciona à última linha normalizada
        if (normalizedLines.length > 0) {
          normalizedLines[normalizedLines.length - 1] += ` ${line}`;
        }
      }
    }
  }

  // Passo 2: Extrair as informações normalizadas
  for (const normalizedLine of normalizedLines) {
    // console.log(`Linha Normalizada: ${normalizedLine}`); // Debug

    // Regex para capturar código, descrição e quantidade
    const match = normalizedLine.match(
      // /^22(\d{8})\s+(.+?)\s+\((\d{8})\)\s+(\d+)$/
      /^22(\d{8})(.+?)\((\d{8})\)\s+(\d+)$/
    );
    if (match) {
      procedimentos.push({
        codigo: match[1],
        descricao: match[2].trim(),
        qt_autorizada: match[4].slice(-1),
      });
    }
  }
  return { validadeSenha, procedimentos };
};

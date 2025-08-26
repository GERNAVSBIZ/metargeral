// Conteúdo do arquivo /api/metar-historico.js

export default async function handler(request, response) {
  // Pega a localidade (ex: SBIZ) e a data (ex: 2025-08-25) que o front-end enviou
  const { localidade, data } = request.query;
  const apiKey = process.env.REDEMET_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ status: false, message: 'Chave da API não configurada no servidor.' });
  }

  if (!localidade || !data) {
    return response.status(400).json({ status: false, message: 'Localidade ou data não fornecida.' });
  }

  // A API da REDEMET espera o formato YYYYMMDDHHMM.
  // Vamos buscar do início ao fim do dia fornecido (em UTC).
  const dataInicio = `${data.replace(/-/g, '')}0000`; // Formato: YYYYMMDD0000
  const dataFim = `${data.replace(/-/g, '')}2359`;    // Formato: YYYYMMDD2359

  // Monta a URL da API da REDEMET para busca por período
  const redemetUrl = `https://api-redemet.decea.mil.br/mensagens/metar/${localidade}/data_ini/${dataInicio}/data_fim/${dataFim}?api_key=${apiKey}`;

  try {
    const apiResponse = await fetch(redemetUrl);
    
    // Se a resposta da API não for bem-sucedida, captura e repassa o erro
    if (!apiResponse.ok) {
        // Tenta extrair uma mensagem de erro do corpo da resposta da REDEMET
        const errorData = await apiResponse.json().catch(() => null); // Evita erro se o corpo não for JSON
        console.error('Erro da API REDEMET:', { status: apiResponse.status, data: errorData });
        const errorMessage = (errorData && errorData.message) ? errorData.message : `A API da REDEMET retornou o status ${apiResponse.status}`;
        throw new Error(errorMessage);
    }

    const responseData = await apiResponse.json();

    // Retorna os dados da REDEMET para o navegador do usuário
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    response.status(200).json(responseData);

  } catch (error) {
    console.error('Falha ao buscar dados históricos:', error);
    // Retorna um erro 502 (Bad Gateway) com uma mensagem clara para o front-end
    response.status(502).json({ status: false, message: `Erro ao contatar o servidor da REDEMET: ${error.message}` });
  }
}

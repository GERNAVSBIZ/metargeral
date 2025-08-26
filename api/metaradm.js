// Conteúdo do novo arquivo /api/metaradm.js

export default async function handler(request, response) {
  // Pega os parâmetros que o front-end enviou na URL
  const { localidade, data_ini, data_fim } = request.query;
  
  // Pega a chave secreta das Variáveis de Ambiente do servidor
  const apiKey = process.env.REDEMET_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ message: 'Chave da API não configurada no servidor.' });
  }
  
  if (!localidade) {
    return response.status(400).json({ message: 'Localidade não fornecida.' });
  }

  // Constrói a URL base
  let redemetUrl = `https://api-redemet.decea.mil.br/mensagens/metar/${localidade}?api_key=${apiKey}`;

  // Adiciona os parâmetros de data se eles foram fornecidos
  if (data_ini) {
    redemetUrl += `&data_ini=${data_ini}`;
  }
  if (data_fim) {
    redemetUrl += `&data_fim=${data_fim}`;
  }

  try {
    const apiResponse = await fetch(redemetUrl);
    
    if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        return response.status(apiResponse.status).json(errorData);
    }
      
    const data = await apiResponse.json();
    
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    response.status(200).json(data);

  } catch (error) {
    response.status(502).json({ message: 'Erro ao contatar o servidor da REDEMET.' });
  }
}
export const batchTranslateText = async (
  texts: string[],
  to: string,
  from = 'en',
  azureTranslatorKey: string,
  azureTranslatorEndpoint: string,
  azureTranslatorRegion: string
): Promise<string[]> => {

  // console.log("azureTranslatorKey in batchTranslateText", azureTranslatorKey);
  // console.log("azureTranslatorEndpoint in batchTranslateText", azureTranslatorEndpoint);
  // console.log("azureTranslatorRegion in batchTranslateText", azureTranslatorRegion);

  try {
    const baseUrl = azureTranslatorEndpoint.replace(/\/+$/, '');
    const url = `${baseUrl}/translate?api-version=3.0&from=${from}&to=${to}`;
    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': azureTranslatorKey,
          'Ocp-Apim-Subscription-Region': azureTranslatorRegion,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(texts.map((text) => ({ Text: text })))
      }
    );

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const data = await response.json();

    return data.map((entry: any) => entry.translations?.[0]?.text || '');
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts; // fallback to original texts
  }
};

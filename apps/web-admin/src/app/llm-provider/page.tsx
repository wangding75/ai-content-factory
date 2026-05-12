type LlmProviderScenario = 'configured' | 'empty';

interface LlmProviderPageProps {
  provider?: LlmProviderScenario;
}

export default function LlmProviderPage({ provider = 'empty' }: LlmProviderPageProps): JSX.Element {
  const apiKeyStatus = provider === 'configured' ? 'sk-***abcd' : 'Not configured';

  return (
    <main>
      <h1>LLM Provider</h1>
      <section aria-label="Provider safe status">API key configured status: {apiKeyStatus}</section>
      <form>
        <label htmlFor="providerName">Provider name</label>
        <input id="providerName" name="providerName" />
        <label htmlFor="model">Model</label>
        <input id="model" name="model" />
        <label htmlFor="baseUrl">Base URL</label>
        <input id="baseUrl" name="baseUrl" />
        <label htmlFor="apiKey">API Key</label>
        <input id="apiKey" name="apiKey" type="password" />
        <button type="submit">Save Provider</button>
      </form>
      <button type="button">Retry</button>
    </main>
  );
}

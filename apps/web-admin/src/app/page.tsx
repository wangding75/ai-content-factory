import Link from 'next/link';

export default function HomePage(): JSX.Element {
  return (
    <main>
      <h1>AI Content Factory</h1>
      <nav aria-label="Admin navigation">
        <ul>
          <li>
            <Link href="/content-projects">Content Projects</Link>
          </li>
          <li>
            <Link href="/prompt-templates">PromptTemplates</Link>
          </li>
          <li>
            <Link href="/llm-provider">LLM Provider</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}

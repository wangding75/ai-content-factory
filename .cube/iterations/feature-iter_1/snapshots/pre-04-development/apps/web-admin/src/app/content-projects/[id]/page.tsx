import Link from 'next/link';

export default function ContentProjectDetailPage(): JSX.Element {
  return (
    <main>
      <h1>Content Project Detail</h1>
      <section aria-label="Project basic information">Project basic information</section>
      <nav aria-label="Project related configuration">
        <Link href="/prompt-templates">PromptTemplate entry</Link>
        <Link href="/llm-provider">Default LLM Provider entry</Link>
      </nav>
      <form>
        <button type="submit">Save</button>
      </form>
      <button type="button">Delete</button>
      <button type="button">Retry</button>
    </main>
  );
}

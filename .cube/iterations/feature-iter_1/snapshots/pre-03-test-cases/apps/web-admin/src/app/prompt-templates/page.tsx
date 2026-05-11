import Link from 'next/link';

export default function PromptTemplatesPage(): JSX.Element {
  return (
    <main>
      <h1>PromptTemplates</h1>
      <form>
        <label htmlFor="templateName">Template name</label>
        <input id="templateName" name="templateName" />
        <label htmlFor="templateContent">Template content</label>
        <textarea id="templateContent" name="templateContent" />
        <button type="submit">Save PromptTemplate</button>
      </form>
      <Link href="/prompt-templates/example">PromptTemplate detail</Link>
      <section aria-label="PromptTemplate empty state">No PromptTemplates yet.</section>
      <button type="button">Retry</button>
    </main>
  );
}

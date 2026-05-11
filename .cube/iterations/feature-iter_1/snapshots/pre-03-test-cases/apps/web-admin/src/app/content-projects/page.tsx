import Link from 'next/link';

export default function ContentProjectsPage(): JSX.Element {
  return (
    <main>
      <h1>Content Projects</h1>
      <Link href="/content-projects/new">Create Content Project</Link>
      <section aria-label="Project list empty state">No content projects yet.</section>
      <button type="button">Retry</button>
    </main>
  );
}

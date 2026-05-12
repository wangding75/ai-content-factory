type ContentTypeScenario = 'available' | 'empty';

interface NewContentProjectPageProps {
  contentTypes?: ContentTypeScenario;
}

export default function NewContentProjectPage({
  contentTypes = 'available',
}: NewContentProjectPageProps): JSX.Element {
  const hasContentTypes = contentTypes === 'available';

  return (
    <main>
      <h1>Create Content Project</h1>
      {hasContentTypes ? (
        <form>
          <label htmlFor="name">Project name</label>
          <input id="name" name="name" />
          <label htmlFor="contentTypeId">Content type</label>
          <select id="contentTypeId" name="contentTypeId">
            <option value="novel">Novel</option>
          </select>
          <label htmlFor="targetPlatform">Target platform</label>
          <input id="targetPlatform" name="targetPlatform" />
          <label htmlFor="targetContentCount">Target content count</label>
          <input id="targetContentCount" name="targetContentCount" type="number" />
          <button type="submit">Create</button>
        </form>
      ) : (
        <section aria-label="No content types">
          <p>No available content types.</p>
          <button type="submit" disabled>
            Create
          </button>
        </section>
      )}
    </main>
  );
}

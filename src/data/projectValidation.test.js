import { baseProjects } from './projectRecords.js';
import { validateBaseProjects } from './projectValidation.js';

describe('project validation', () => {
  it('accepts the current project catalog', () => {
    expect(() => validateBaseProjects(baseProjects)).not.toThrow();
  });

  it('rejects impact content that repeats the outcome text', () => {
    const project = JSON.parse(JSON.stringify(baseProjects[0]));
    project.caseStudySections = [
      {
        title: 'Impact',
        items: [project.outcome],
      },
    ];

    expect(() => validateBaseProjects([project])).toThrow(
      new RegExp(`Impact content for project "${project.slug}" repeats the outcome text\\.`)
    );
  });
});

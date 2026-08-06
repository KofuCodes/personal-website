import React from 'react';
import ExperienceTimeline from '../components/ExperienceTimeline';
import QuietHeader from '../components/QuietHeader';

/** Work: the experience timeline. */
const Work: React.FC = () => (
  <section className="reveal">
    <QuietHeader label="work" />
    <ExperienceTimeline />
  </section>
);

export default Work;

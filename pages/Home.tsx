import React from 'react';
import About from '../components/About';
import QuietHeader from '../components/QuietHeader';

/** Index: the about list. The hero and terrain above it live in the shell. */
const Home: React.FC = () => (
  <section className="reveal">
    <QuietHeader label="about" />
    <About />
  </section>
);

export default Home;

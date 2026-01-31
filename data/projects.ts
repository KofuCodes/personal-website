
import { Project } from '../types';

export const projects: Project[] = [
  {
    slug: 'hackpad-tetripad',
    title: 'TetriPad',
    year: '2025',
    category: 'Embedded/Firmware',
    summary: 'A precision-engineered hackpad designed for competitive Tetris gameplay.',
    description: 'Built for precision and speed, TetriPad features a unique 4-switch pyramid D-pad layout to minimize input errors during fast-paced Tetris sessions.',
    bullets: [
      'Engineered a 4-switch pyramid layout inspired by the classic D-pad for intuitive control.',
      'Programmed custom firmware to handle responsive input and real-time OLED screen feedback.',
      'Integrated hardware and software by combining custom wiring with low-latency microcontroller code.'
    ],
    tags: ['Embedded', 'Firmware', 'Hardware', 'OLED', 'Input Devices'],
    links: {
      github: 'https://github.com/KofuCodes/hackpad'
    },
    featured: true,
    content: {
      problem: 'Standard mechanical keyboards or cheap gamepads often suffer from ghosting or awkward ergonomics for specialized games like Tetris, where directional precision is everything.',
      solution: 'A dedicated, hard-wired macro pad with a layout specifically optimized for the "NES" style of Tetris play, but with modern switches.',
      build: 'The project used an Arduino-based microcontroller (Pro Micro), high-quality mechanical switches, and a 128x32 OLED display. The firmware was written in C++ using the HID-Project library for zero-latency communication.',
      learned: 'This was my first full-cycle hardware project, teaching me the importance of stable debounce logic and efficient wire management in tight spaces.'
    }
  },
  {
    slug: 'gundam-ranger-morpher',
    title: 'Gundam Ranger Morpher',
    year: '2025',
    category: 'Hackathons',
    summary: 'A Gundam-themed Power Rangers morpher using RFID for detection.',
    description: 'Created for a hackathon, this device combines the aesthetic of Gundam with the mechanics of a Power Rangers Morpher, utilizing RFID cards to trigger unique lighting and sound sequences.',
    bullets: [
      'Implemented RFID technology for short-range wireless detection and activation.',
      'Developed a handheld device that lights up upon card insertion.',
      'Incorporated Gundam-inspired wings in the CAD to enhance the visual and mechanical design.'
    ],
    tags: ['RFID', 'Electronics', 'CAD', 'Prototyping', 'Hackathon'],
    links: {
      github: 'https://github.com/KofuCodes/Gundam-Rangers'
    },
    featured: true,
    content: {
      problem: 'As a kid, I always dreamed of having a real Power Rangers morpher that actually worked. I wanted to bring that childhood dream to life with modern technology.',
      solution: 'A 3D-printed enclosure designed in CAD that houses a custom PCB, an MFRC522 RFID reader, and NeoPixel LEDs.',
      build: 'The device reads unique UIDs from RFID cards hidden inside "Transformation Chips." Upon detection, it triggers an animation across the LED array.',
      learned: 'Integrating CAD tolerances with electronic components is difficult. I learned how to design for assembly (DFA) through multiple iterations of the shell.'
    }
  },
  {
    slug: 'hammerhacks-2024',
    title: 'HammerHacks 2024',
    year: '2024',
    category: 'Hackathons',
    summary: 'The first high school hackathon for Hamiltonian students.',
    description: 'Organized and executed the inaugural HammerHacks event, bringing together high school students from Hamilton to collaborate on innovative tech projects over a full day of hacking.',
    bullets: [
      'Organized logistics for 100+ high school participants and mentors.',
      'Coordinated project showcases and judging from industry professionals.',
      'Created an inclusive environment fostering creativity and technical learning.'
    ],
    tags: ['Community', 'Hackathon', 'Event', 'Organization'],
    links: {
      website: 'https://hammerhacks2024.wcagas.com'
    },
    featured: true,
    content: {
      problem: 'High school students in Hamilton had limited access to hackathon opportunities and tech community events.',
      solution: 'Created a full-day hackathon event tailored for high school developers to learn, build, and network.',
      build: 'Coordinated venue, sponsors, judges, and participant experience from start to finish.',
      learned: 'Running a successful event requires meticulous planning, strong team coordination, and a passion for building community.',
      video: '<iframe width="368" height="207" src="https://www.youtube.com/embed/Jb-2RpDonEs" title="The First High School Hackathon for Hamiltonian Students | HammerHacks 2024" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
      buildImage: '/hammerhacks.JPEG'
    }
  }
];


import { Project } from '../types';

export const projects: Project[] = [
  {
    slug: 'patch',
    title: 'Patch',
    year: '2026',
    category: ['Hardware', 'Hackathons'],
    summary: 'A voice-controlled rover that goes and finds your stuff. Top 10% at Hack the North.',
    tags: ['Raspberry Pi', 'Python', 'FastAPI', 'OpenCV', 'YOLO', 'React', 'Motor Control', 'Hackathon'],
    links: {
      github: 'https://github.com/Enginaaron/Patch'
    },
    content: {
      problem: 'You should be able to say "find my white water bottle, I think it\'s beside my backpack" and have a robot go do it. Most voice-controlled robots map a phrase to a fixed motor command and never actually look at the room.',
      solution: 'Patch sends the spoken request and its live camera frame to Huawei\'s OMNI multimodal model together. It rotates in roughly 30 degree steps to scan, asks "is this your bottle?" when it spots a likely match, and only drives over once you say yes.',
      build: 'Raspberry Pi 5, a TB6612FNG motor driver, two gear motors, a USB webcam, and a chassis made of popsicle sticks and hot glue. The camera pokes through the nose of a cardboard raccoon. Backend is FastAPI with OpenCV, plus a local YOLO pass that screens frames before we spend a cloud call. The React frontend runs over an SSH tunnel so the browser will allow the mic. Steering is a proportional controller on the bounding box centre, mixed into left and right PWM. There is no depth sensor, so distance comes from how wide the bottle looks in frame, calibrated off one measurement at 7.5 feet.',
      learned: 'Cloud inference takes seconds, so the rover moves in short pulses and stops before every look. The scary failure is a late model response restarting the motors after someone hits stop. Every stop or cancel now bumps a generation token, and a stale response can\'t command the wheels. Also: below about 30% PWM these motors only twitch, so the controller has a floor.',
      video: '<video src="/patch-drive-test.mp4" controls muted playsinline preload="metadata" style="display:block;width:100%;max-height:70vh;background:#000;"></video>',
      buildImage: '/patch.jpg',
      finishedImage: '/patch-floor-test.jpg'
    }
  },
  {
    slug: 'hackpad-tetripad',
    title: 'TetriPad',
    year: '2025',
    category: 'Embedded/Firmware',
    summary: 'A precision-engineered hackpad designed for competitive Tetris gameplay.',
    tags: ['Embedded', 'Firmware', 'Hardware', 'OLED', 'Input Devices'],
    links: {
      github: 'https://github.com/KofuCodes/hackpad'
    },
    kind: 'hardware',
    content: {
      problem: 'Standard mechanical keyboards or cheap gamepads often suffer from ghosting or awkward ergonomics for specialized games like Tetris, where directional precision is everything.',
      solution: 'A dedicated, hard-wired macro pad with a layout specifically optimized for the "NES" style of Tetris play, but with modern switches.',
      build: 'The project used an Arduino-based microcontroller (Pro Micro), high-quality mechanical switches, and a 128x32 OLED display. The firmware was written in C++ using the HID-Project library for zero-latency communication.',
      learned: 'This was my first full-cycle hardware project, teaching me the importance of stable debounce logic and efficient wire management in tight spaces.',
      buildImage: '/tetripad.jpg'
    }
  },
  {
    slug: 'gundam-ranger-morpher',
    title: 'Gundam Ranger Morpher',
    year: '2025',
    category: ['Hardware', 'Hackathons'],
    summary: 'A Gundam-themed Power Rangers morpher using RFID for detection.',
    tags: ['RFID', 'Electronics', 'CAD', 'Prototyping', 'Hackathon'],
    links: {
      github: 'https://github.com/KofuCodes/Gundam-Rangers'
    },
    kind: 'hardware',
    content: {
      problem: 'As a kid, I always dreamed of having a real Power Rangers morpher that actually worked. I wanted to bring that childhood dream to life with modern technology.',
      solution: 'A 3D-printed enclosure designed in CAD that houses a custom PCB, an MFRC522 RFID reader, and NeoPixel LEDs.',
      build: 'The device reads unique UIDs from RFID cards hidden inside "Transformation Chips." Upon detection, it triggers an animation across the LED array.',
      learned: 'Integrating CAD tolerances with electronic components is difficult. I learned how to design for assembly (DFA) through multiple iterations of the shell.',
      buildImage: '/gundammorpher.jpg'
    }
  },
  {
    slug: 'hammerhacks-2024',
    title: 'HammerHacks 2024',
    year: '2024',
    category: 'Hackathons',
    summary: 'The first high school hackathon for Hamiltonian students.',
    tags: ['Community', 'Hackathon', 'Event', 'Organization'],
    links: {
      website: 'https://hammerhacks2024.wcagas.com'
    },
    kind: 'software',
    content: {
      problem: 'High school students in Hamilton had limited access to hackathon opportunities and tech community events.',
      solution: 'Created a full-day hackathon event tailored for high school developers to learn, build, and network.',
      build: 'Coordinated venue, sponsors, judges, and participant experience from start to finish.',
      learned: 'Running a successful event requires meticulous planning, strong team coordination, and a passion for building community.',
      video: '<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/Jb-2RpDonEs" title="The First High School Hackathon for Hamiltonian Students | HammerHacks 2024" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
      buildImage: '/hammerhacks.JPEG'
    }
  },
  {
    slug: 'coloradio',
    title: 'Coloradio',
    year: '2025',
    category: ['Hackathons', 'Web/App'],
    summary: 'A synesthesia simulator that plays music based on color temperature.',
    tags: ['AI', 'Computer Vision', 'Audio', 'Hackathon', 'Web App'],
    links: {
      github: 'https://github.com/KofuCodes/Coloradio'
    },
    kind: 'software',
    content: {
      problem: 'Most people never experience synesthesia—the neurological phenomenon where one sense triggers another, like seeing colors when hearing music.',
      solution: 'A web application that reverses the synesthesia experience: instead of seeing colors from music, users hear music generated from colors.',
      build: 'The app uses the device camera to capture real-time video, analyzes the dominant color temperature using AI, and dynamically plays warm or cool-toned music based on the visual input.',
      learned: 'Learned how to integrate computer vision with audio systems and create responsive, sensory-driven user experiences.'
    }
  }
];

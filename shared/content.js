/*
  Single source of truth for portfolio content.
  Every design in /designs reads from this file, so the words stay constant
  and only the design changes. Image paths are relative to the site root;
  each design prefixes them with its own ROOT (e.g. '../../').
*/
window.PORTFOLIO = {
  name: 'Alan Pham',
  role: 'HCI Researcher',
  tagline: 'Second-year Pre-Doctoral MPCS student at the University of Chicago & HCI researcher',
  standing: 'Second-year Pre-Doctoral MPCS student',
  status: 'Second-year Pre-Doctoral MPCS student, University of Chicago',
  school: 'The University of Chicago',
  program: 'Pre-Doctoral student, Master’s Program in Computer Science (MPCS), second year',
  undergrad: 'B.S. in Computer Science (HCI specialization) and B.A. in Economics',
  degrees: [
    { id: 'bs', title: 'B.S. in Computer Science', note: 'HCI specialization', short: 'B.S. Computer Science', era: 'Undergrad' },
    { id: 'ba', title: 'B.A. in Economics', note: '', short: 'B.A. Economics', era: 'Undergrad' }
  ],
  // Order of events, in my own words (used by timeline-style designs):
  // Diver Sim (undergrad, CS course) -> PenPal (undergrad, CS class project) -> joined AxLab (undergrad) -> Buoyancé started in AxLab as an undergrad, published during my master's.
  labEra: 'Joined as undergrad',
  labStory: 'I joined AxLab as an undergraduate and began work on Buoyancé there.',
  lab: 'Actuated Experience Lab (AxLab)',
  advisor: 'Professor Ken Nakagaki',

  // 4:5 portrait crop of assets/img/WinterGala.jpg (original kept untouched)
  headshot: {
    src: 'assets/img/headshot.jpg',
    alt: 'Alan Pham smiling at the camera, wearing glasses, a dark suit and a patterned tie, in a warmly lit ballroom.'
  },

  about: [
    'I’m a second-year Pre-Doctoral student in the Master’s Program in Computer Science (MPCS) at the University of Chicago. As an undergraduate I studied Computer Science with a specialization in Human-Computer Interaction (B.S.) and Economics (B.A.).',
    'I conduct research at the Actuated Experience Lab (AxLab) and am advised by Professor Ken Nakagaki.',
    'My design approach centers on crafting experiences that encourage meaningful interaction between people and designed objects, as well as among users themselves. My recent work, Buoyancé, explores balloons as physical interfaces for engaging with environmental spaces, and it was published at ACM UIST 2025.'
  ],

  projects: [
    {
      id: 'buoyance',
      title: 'Buoyancé',
      kicker: 'Published · ACM UIST 2025',
      // `era` is the short timeline label; `story` is one sentence about when it happened. Years are only added when known.
      year: '2025',
      era: 'Published 2025',
      story: 'I began this work as an undergraduate in AxLab, and it was published during my master’s.',
      summary: 'A spatially actuated tangible interface in which compact mobile robots on the ground reel helium-inflated balloons through mid-air, up to high altitudes (20 m or more). The balloons can represent abstract data in 3D space, reconfigure lights and cameras, and assemble into different configurations, controlled through GUI, tangible and gesture-based interfaces.',
      publication: {
        title: 'Buoyancé: Reeling Helium-Inflated Balloons with Mobile Robots on the Ground for Mid-Air Tangible Display, Interaction, and Assembly',
        authors: 'Alan Pham, Yuxiao Li, Miyu Fukuoka, Ken Nakagaki',
        venue: 'ACM UIST 2025'
      },
      links: [
        { label: 'ACM Digital Library', url: 'https://dl.acm.org/doi/10.1145/3746059.3747768' },
        { label: 'AxLab project page', url: 'https://www.axlab.cs.uchicago.edu/projects/buoyanc%C3%A9' },
        { label: 'Paper (PDF)', url: 'https://www.axlab.cs.uchicago.edu/_files/ugd/bef049_716f38437e8a40c0a5e56291ee8ff63a.pdf' }
      ],
      tags: ['Helium-inflated balloons', 'Mobile reeling robots', 'Mid-air tangible display', 'UIST 2025'],
      // w and h are the photo's pixel size, so layouts can balance columns without waiting for images to load.
      images: [
        { src: 'assets/img/buoyance-interaction.jpg', w: 1600, h: 899, alt: 'Two people in a white gallery room among floating black balloons, each balloon paired with a small wheeled robot on the floor.', caption: 'Balloons and robots in the lab space.' },
        { src: 'assets/img/buoyance-circle.jpg', w: 1280, h: 495, alt: 'A person with arms outstretched, surrounded by a ring of floating black balloons between two camera stands.', caption: 'Standing inside a ring of balloons.' },
        { src: 'assets/img/buoyance-light.jpg', w: 1280, h: 1126, alt: 'A person on a ladder in a dark room holding a glowing white balloon next to a ceiling projector.', caption: 'A glowing balloon used in an assistive room-configuration application.' },
        { src: 'assets/img/buoyance-demo.jpg', w: 1280, h: 963, alt: 'Children and adults gathered around a demo table with black balloons and small robots at the South Side Science Festival.', caption: 'Public demo at the 2024 South Side Science Festival.' }
      ]
    },
    {
      id: 'penpal',
      title: 'PenPal',
      kicker: 'Class project',
      summary: 'Actuated user interfaces and technology.',
      era: 'Undergrad · CS course',
      story: 'A class project, done as an undergraduate as part of my Computer Science degree, after the Augmented Diver Simulation and before I joined AxLab.',
      tags: ['Actuated UI'],
      images: []
    },
    {
      id: 'diver',
      title: 'Augmented Diver Simulation',
      shortTitle: 'Diver Sim',
      kicker: 'Course project · Introduction to Human-Computer Interaction',
      summary: 'A virtual reality project for my Introduction to Human-Computer Interaction class.',
      era: 'Undergrad · CS course',
      story: 'The first of these projects, done as an undergraduate as part of my Computer Science degree.',
      tags: ['Virtual reality', 'Course project'],
      images: []
    }
  ],

  // Said by Alan (2026-10-06): where he has exhibited or demoed. Newest first. What was shown at each is not recorded here; ask before adding it.
  exhibitions: [
    { year: '2026', title: 'South Side Science Festival' },
    { year: '2025', title: 'Ars Electronica Digital Art Festival' },
    { year: '2024', title: 'South Side Science Festival', photo: 'assets/img/buoyance-demo.jpg' }
  ],

  // Said by Alan (2026-10-06). Titles, venues and co-authors of the unpublished papers are not given yet; do not invent them.
  // status: published | forthcoming (accepted, appearing within weeks) | under review. 'project' points to the entry in projects.
  publications: [
    { status: 'published', role: 'First author', project: 'buoyance' },
    { status: 'forthcoming', role: 'Second author' },
    { status: 'forthcoming', role: 'Third author' },
    { status: 'under review', role: 'First author', venue: 'CHI 2027' },
    { status: 'under review', role: 'Fourth author', venue: 'CHI 2027' }
  ],

  // Said by Alan (2026-10-06). Add what he actually builds with toio here once he describes it.
  toio: {
    statement: 'I also work with Sony toio.'
  },

  contact: {
    email: 'apham799@uchicago.edu',
    linkedin: 'https://www.linkedin.com/in/alan-pham-7798a3224',
    previousSite: 'https://sites.google.com/view/alanp-ortfolio/home'
  }
};

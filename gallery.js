/*
  The design log. To add a design: build it in /designs/NN-name/, then add one object here.
  Required: n, slug, title, date. Everything else (concept, tried, learned, next, tech) is optional:
  delete a field and its section simply disappears from the page.
  Fields marked (draft) are my first-pass notes; edit them as the story develops.
  Careful with quotes: an apostrophe inside 'single quotes' must be written \' (or use "double quotes").
*/
const TOTAL = 25;

const ENTRIES = [
  {
    n: 1,
    slug: '01-tethered',
    title: 'Tethered',
    date: '2026-10-05',
    concept: 'The page is a gallery focusing on my first main project Buoyancé, a 3-Dimensional shape-changing display through balloons controlled by wheeled robots. Navigation is, hence, five black balloons, each tied to a little wheeled robot on the floor corresponding to different pages on the websit.',
    tried: [
      'Real spring physics: balloons bob, drift away from the cursor and swing back home.',
      'Rope-length constraint, so a balloon can only rise as far as its tether allows.',
      'Robots drive along the floor to stay under their balloons.',
      'A plain text nav along the bottom, so nothing depends on chasing balloons.'
    ],
    learned: 'Making fun interactions can appear very "cool" but become very unpractical for user naviation'
  },
  {
    n: 2,
    slug: '02-system-map',
    title: 'System Map',
    date: '2026-10-05',
    concept: 'My path drawn as a transit system map, a nod to the Chicago CTA map on my T-shirt in some Buoyancé photos. Time runs left to right: my Computer Science and Economics degrees run side by side and merge into the master\'s, my two class projects (Diver Sim, then PenPal) sit on the CS line, and a research line branches off where I join AxLab and runs through the master\'s to Buoyancé and today.',
    tried: [
      'A first version laid the portfolio out as a research paper inside a PDF viewer. It looked clever, but it read as a document, not a webpage, so I dropped it.',
      'A schematic map with 45° lines and interchange stations.',
      'First the trains shuttled back and forth, and Contact sat on the rail, which made the order of events unclear. Now trains only run forward in time, the lines carry direction chevrons, an "Earlier → Later" axis sits under the map, and every stop has a small era label.',
      'Clicking a station opens its details beside the map; "Next stop" buttons walk you along the route.',
      'Clicking my name (in the top bar or on the pass card) turns the side panel into an About Me view, so the landing page needs no separate About page.',
      'On phones the map turns into a vertical route with the same stops and colours.'
    ],
    learned: 'A strong metaphor works best when it is also the navigation. Making the map the interface, instead of decorating a normal page with it, is what made it feel like a webpage.'
  },
  {
    n: 3,
    slug: '03-pin-display',
    title: 'Pin Display',
    date: '2026-10-06',
    concept: 'A dark, tactile page built on a pin display, one kind of shape-changing display my lab works with that my advisor is quite known for. The whole background is a grid of about 16,000 "spring-loaded" pins. My headshot is the relief on the display, and the pins reshape as you scroll.',
    tried: [
      'A fixed grid of pins where every pin is a spring. The pointer presses into them and leaves an impression that slowly heals; a click sends a ripple.',
      'My headshot turned into a "height map", so the pins "rise" to form my face. A Pins / Photo toggle swaps in the real photo.',
      'The display morphs with the section you are in: portrait, then rolling terrain behind my work, then a calm plateau. The page also talks back, so opening a project row sends a ripple through the pins.',
      'A typographic work index with expanding rows instead of cards, so the page does not fall back on a card grid.'
    ],
    learned: 'The first portrait was an unrecognisable blob. A tighter crop, more resolution and a little local contrast made it read more as a face.',
  },
  {
    n: 4,
    slug: '04-reel',
    title: 'The Reel',
    date: '2026-10-06',
    concept: 'The opposite mood of the pin display: warm, daylight and paper and more akin to the bright, artistic nature of Buoyancé. The page is a clothesline. Buoyancé works by reeling tethers, so the content hangs from a rope and a little reel robot on the bottom winds it in as it scrolls.',
    tried: [
      'Scrolling down reels the rope sideways: the drum spins, the rope twists, and the cards naturally move with momentum on the reel.',
      'Paper cards, polaroids and kraft tags make the content feel hung up and handled.',
      'On phones the rope turns vertical, and tabbing to a card with the keyboard reels it into view.'
    ],
    learned: 'A metaphor from the research (reeling a tether) can drive the whole interaction, not just the artwork. Sideways motion from vertical scrolling needs extra care: focus, trackpad swipes and short screens all had to be handled.',
  },
  {
    n: 5,
    slug: '05-toio-mat',
    title: 'The toio Mat',
    date: '2026-10-06',
    concept: 'My portfolio dressed in the interface of Sony toio, the tiny cube robots I also work with. The page is a simulated toio play mat: my sections are printed cards on the mat, and three cubes read them the way a real toio reads its mat. Bold cobalt blue and white, like a toy.',
    tried: [
      'Click a card and a cube turns, drives over and reads it (a nod to the target-position control a real toio has). Or pick a cube up and put it on a card yourself (A slight nod to my most recent in-progress project).',
      'A live readout shows what a toio would report: Position ID (x, y, angle), "position ID missed" when lifted, collision, double-tap, posture and shake level, using the names and ranges from the public toio spec.',
      'A guided tour sends a cube past every card in order. Cubes are keyboard-reachable too (arrow keys nudge, Enter double-taps).'
    ],
    learned: 'A theme works best as the UI around my own content',
  },
  {
    n: 6,
    slug: '06-skyline',
    title: 'Skyline',
    date: '2026-10-06',
    concept: 'The first attempt of a merge of two earlier ideas: the Chicago transit map from design 2 and the balloons-and-robots world of Buoyancé from design 1. The map is printed on the floor of a lab, tilted in 3D (like the theme of the project), and every stop is a black balloon tethered to its spot. The height of each balloon says when that stop happened, so the map becomes a rising skyline.',
    tried: [
      'Balloon height encodes time, the same idea as Buoyancé showing abstract data in 3D space. Selecting a stop reels its balloon higher.',
      'Small RoverC-style robots drive each line one way, forward in time, towing coloured balloons whose tethers are reeled out as they go. They glide along the diagonals without turning, like a mecanum-wheel robot.',
      'Click a stop and the robot whose line serves it drives there and parks on it, while that balloon is reeled higher. Pick another stop (or click the same one again) and the robot goes back to patrolling.',
      'On phones the room goes on top and a plain list of stops sits underneath; there is a pause button for the robots, and with reduced motion they park.'
    ],
    learned: 'Merging two ideas worked best when each kept its job: the map says where and in what order, the balloons say how late. Putting the data in the height created an opportunity to put in another parallel to the Buoyancé project.',
  },
  {
    n: 7,
    slug: '07-golf-hole',
    title: 'Nine Holes',
    date: '2026-10-06',
    concept: 'Golf has been a big part of my life, so this page is one golf hole (Even if the "score" is pretty bad). My path runs down a striped fairway from the tees to the flag, and the scorecard along the bottom is the navigation: nine shots, one for each stop, in the order they happened.',
    tried: [
      'Click a "shot" on the scorecard or a marker on the course and a ball is hit there: it flies in an arc with a dotted tracer, bounces, and settles. Reaching now drops it in the cup.',
      'The yardage book on the right is the details panel, with a Next hole button, and Play the round hits all nine holes in order.',
      'On phones the scorecard becomes a list of nine rows under a smaller course.'
    ],
    learned: 'I used the structure of golf (a hole, a scorecard, a marker, tees) and filled it only with what is already true about my path, so the theme and my work stay one thing.',
  },
  {
    n: 8,
    slug: '08-tapping-task',
    title: 'The Tapping Task',
    date: '2026-10-06',
    concept: 'A portfolio built on the classic pointing test from HCI, Fitts. Seven targets sit on a ring, one for each stop on my path, and the lit target is always the next stop. Tap it to open that stop and the next one lights up across the ring, so tapping through the test walks you through my timeline.',
    tried: [
      'The stops are placed so that the zig-zag order of the tapping test is the order things happened. Tracing it draws a seven-point star, one line per step.',
      'A live readout shows the distance, target width, index of difficulty and, for mouse users, movement time and throughput of each tap.',
      'Any target can also be opened directly or with the keyboard, and Watch the task plays the whole round with a ghost cursor. On phones the ring comes first and the targets are large enough to tap.'
    ],
    learned: 'A piece of my own field can be the navigation. Placing the stops so the test order matches my timeline turned an abstract study task into a story. Though, while the zigzag order does better fit the nature of the Fitts Law test, it is not initially intuitive that the zigzag or is sequential rather than the neighbors on the circle.',
  },
  {
    n: 9,
    slug: '09-card-catalog',
    title: 'Card Catalog',
    date: '2026-10-06',
    concept: 'My portfolio filed in a library card catalog, a nod to Chicago and UChicago libraries and to my field, since a catalog is a classic information interface. Each stop on the path is a typed index card in a drawer, filed in the order it happened, with an oak cabinet of closed drawers above it.',
    tried: [
      'One card is pulled up to be read at a time and the others stay filed as tabbed edges. Each card has a call number, a main entry, a typed title and imprint, notes, and tracings at the bottom (subjects, then added entries such as my co-authors), like a real catalog card.',
      'First the cabinet face had twelve drawers and only two did anything, which was confusing. Now every drawer works: six subject drawers (Computer science, Economics, HCI, Actuated UI, Virtual reality, Balloons and robots) light up the cards filed under that subject and fade the rest, like the subject drawers of a real catalog, and About and Contact open as pulled cards.',
      'The call numbers (HCI 1 to HCI 7) are a design device, not a real library scheme. Numbers and staggered colour tabs show the order, and the photos are pasted onto the card like prints.',
      'Arrow keys, Home and End flip through the drawer, and it becomes a single column on phones.'
    ],
    learned: 'A warm, quiet, text-first design is a useful contrast with the interactive ones. The card format brought its own structure for free, and it needed no invented facts: the tracings and the subject drawers reuse the topics and co-authors I already have. Decoration that looks clickable but is not makes people hesitate, so every drawer should do something.'
  },
  {
    n: 10,
    slug: '10-control-surface',
    title: 'Control Surface',
    date: '2026-10-06',
    concept: 'My portfolio as a classic tangible control surface: a matte instrument panel with a long time fader, seven channel strips, knobs and switches, and a display. It echoes my research on actuated-tangible user interfaces, drawing from a classical example of a tangible interface.',
    tried: [
      'A big time fader runs from Earlier to Later with seven numbered marks, one for each stop on my path. Drag it and the display updates live as the cap passes each channel; let go and it snaps into place. The channel strips below are a second way in, with meters that rise as the stops get later.',
      'The knob changes the text size, the Panel switch flips light and dark, the Motion switch turns the animation off, and the About and Contact buttons open panels on the display.',
      'The controls are built on real form inputs and buttons, so the keyboard works (arrows, Home and End on the fader and knob), and the panel follows the system light or dark setting.',
      'The content stays plain readable text on the display, not a drawing of a device. On phones the display comes first, then the fader, then the channels, then the settings.'
    ],
    learned: 'The agent might be good at coming up with designs but can be poor with small little UI details that can make the interface hard/confusing to operate. There are also some risks of imitating a medium as some require a level of expertise and sometimes there needs to be a compromise between realness and usability.'},
  {
    n: 11,
    slug: '11-zine',
    title: 'Issue 01',
    date: '2026-10-06',
    concept: 'A loud two-ink print zine, the opposite of the interactive pages. My name is set huge across the cover, my headshot is a halftone portrait, and every stop on my path gets its own page with a giant page number, in the order it happened.',
    tried: [
      'A real halftone portrait on the cover: my headshot is drawn as dots on a 45 degree screen, sized by how dark the photo is at that spot. The brightness grid is precomputed, because a browser will not read the pixels of a local image. I first halftoned the Buoyancé photos too, but at that size they became non-distinguishable. So, they are regular photos taped to the page at crooked angles like a portrait book.',
      'The giant numerals count the stops, 01 to 07, so the order of events is the loudest thing on every page. A strip along the bottom shows the page you are on and enables jumps between them.',
      'A Swap inks button trades the two inks, recolouring the headlines, numbers and photos akin to a dark/light mode toggle. Black foil balloons, from Buoyancé, float through the pages as the recurring cut-out shape.'
    ],
    learned: 'A static layout can carry a whole page with type and print effects alone. The orange only reaches 3.2 to 1 against the paper, so it is used for giant numerals and headlines, and all small text stays the deep blue.'
  },
  {
    n: 12,
    slug: '12-dark-room',
    title: 'The Dark Room',
    date: '2026-10-06',
    concept: 'The page is a dark room, like the photo where I hold a glowing balloon under a projector for the assistive room-configuration work. Your cursor becomes a glowing balloon, and the seven stops of my path are objects in the room, earliest on the left, that only show themselves when the light finds them (though there is an option to "turn on the lights" in the top right corner).',
    tried: [
      'The light is a glowing balloon that follows the pointer, and it lifts the darkness in a soft circle. Move it over an object and its number turns amber and its name lights up. A finger drag does the same on a phone.',
      'The number, name and era under every object are always fully readable, because only the drawings are in the dark. A lights on switch removes the darkness completely, and the page starts with the lights on for anyone who needs/wants more contrast.',
      'Before you touch anything, the light drifts once along the objects so you can see what it does. It stops the moment you move, and it never runs for people who ask for less motion.',
      'Clicking an object (or tabbing to it, which also moves the light there) opens that stop on a bright projected screen below the room, with numbered stops, previous and next, and About and Contact.'
    ],
    learned: 'A dark, hidden-until-lit idea is risky for readability because it can be difficult to distinguish which items can be put in dark for the effect and which ones need to remain readble. Thus, the rule I followed was that the darkness may hide decoration but never text. Mixing up the stacking order put the darkness over the labels at first, which I caught by looking at the render.'
  },
  {
    n: 13,
    slug: '13-sketchbook',
    title: 'The Sketchbook',
    date: '2026-10-06',
    concept: 'The page is a research notebook: graph paper, a navy pen, a red pen and a yellow highlighter that my advisor is always telling me to use in every stage of a project. A pen line is drawn down the page from stop to stop as you scroll, every stop gets its own doodle that sketches itself in, and there is a Doodle button in the top-right corner so visitors can scribble on the page too (inspired by a similar effect on a friend`s portfolio).',
    tried: [
      'Seven hand-drawn doodles, one per stop: books, code brackets and a chart for the two degrees, a VR headset for the Diver Sim, a pen for PenPal, a little robot and flask for the lab, a laptop in front of a Chicago skyline, tethered balloons for Buoyancé and a glowing balloon for now.',
      'The winding pen line between the numbered bubbles is drawn as you scroll, with a red pen tip at its head and a dotted pencil guide ahead of it. The cover has the same seven bubbles as a contents list, and each bubble is a link to its page.',
      'The Doodle button turns on a pen, with navy, red and highlighter, Undo, Clear and Done. Strokes are SVG paths in page coordinates, which becomes more relevant with my more recent ongoing project, so they stay put as you scroll, and they live only in memory: nothing is saved and a reload gives a clean page. The pen tray hangs below the bar instead of pushing the page down, which would have slid the page out from under the strokes. Escape stops drawing.'
    ],
    learned: 'A hand-drawn look only works if the font is still easily readable: the handwriting font is for headings and notes, the body text is a normal serif, and the pen line runs in its own gutter so it never touches a word.'
  },
  {
    n: 14,
    slug: '14-affinity-wall',
    title: 'The Affinity Wall',
    date: '2026-10-06',
    concept: 'The page is an affinity wall, the method I use to sort ideas when brainstorming. Every stop on my path is a sticky note on a whiteboard, and four buttons sort the same notes by time, topic or place. Cluster names are printed on black label tape, and the note colour is the topic.',
    tried: [
      'Thirteen notes: the two degrees, the three projects, the lab, the master\u2019s, now, and the four Buoyanc\u00e9 photos, which start as a pile tucked under the Buoyanc\u00e9 note and spread out when you click that note. The two degree notes overlap a little, since it was one double major. The notes start in a messy pile and then sort themselves by time. Time, Topic and Place slide the notes into clusters under label-tape headers, and Scatter throws them back onto the wall.',
      'Notes can be dragged by the strip at the top (or moved with the arrow keys), and only that strip, so a finger on the text still scrolls the page on a phone. Opening a note shows the full text as a big sticky note. A number dot on each note keeps the order things happened visible in every sort.'
    ],
    learned: 'The sorting is the content: putting a note in one cluster forces choices, such as Diver Sim going under virtual reality rather than HCI, so the topic groups are my reading of the tags and need your check. A bug taught me to keep layout widths in one place: a CSS variable redefined on each note silently overrode the width the layout code had measured, and it only showed on phones. However, I am starting to notice that as the UI themes become more scattered, the sense of visual chronological order begins to decrease.'
  },
  {
    n: 15,
    slug: '15-fig-1',
    title: 'Fig. 1',
    date: '2026-10-06',
    concept: 'The page is a schematic-style drawing of a Buoyanc\u00e9 rig: a balloon on a tether, reeled in by a spool on a small wheeled robot. The seven stops are numbered parts of the drawing (10, 12, 14 ... 22, in the order they happened), and a toggle pulls the rig apart from Fig. 1 (assembled) into Fig. 2 (exploded).',
    tried: [
      'Black ink on white with one red hatch for whatever is selected, so the page looks nothing like the colourful ones before it. The drawing is plain SVG: every part is a group, and each group carries its own numeral and leader line, so when the parts are pulled apart in Fig. 2 the numerals travel with them. Dashed lines show the hidden light inside the balloon and where each loose part belongs.',
      'The numbered list beside the drawing is the main way in, and clicking a part or a numeral in the drawing does the same thing. The Buoyanc\u00e9 stop shows the four photos as Fig. 3A to 3D, left plain so they stay legible. The page starts exploded and snaps together, and it starts assembled for anyone who asks for less motion.'
    ],
    learned: 'In a patent the reference numerals are arbitrary labels, so which stop sits on which part of the rig is a visual device and not a claim about the work but can make it mildly confusing. I do a lot of 3D-modelling where a schematic view of the model might appear in a form like this, but it may not immediately make sense or even seen organized to a standard person visiting the website (though I`m not entirely show who outside of my field would visit the website).'
  },
  {
    n: 16,
    slug: '16-study-session',
    title: 'The Study Session',
    date: '2026-10-06',
    concept: 'I tend to run user studies in my projects, a typical HCI method, the portfolio is a study a visitor can take part in: information and consent, seven tasks (one per stop), a one-question interview, a short questionnaire and a debrief. Finishing the tasks means reading through my portfolio and experiences.',
    tried: [
      'The flow is real form behaviour: three consent checkboxes unlock the rest, each task asks you to find something and then shows it, and a 7-point easy-to-difficult rating follows every task, as in a usability test. A step bar lets you jump between steps, and a skip link goes straight to the debrief for anyone who just wants the content.',
      'The debrief turns what you entered into results: tasks completed, time to find each stop, mean ease and the questionnaire answers as bars, plus the About text and my contact details. Everything lives in memory only, nothing is stored or sent, and the page says so on the first screen.'
    ],
    learned: 'Using a method I know well as the interface made the content order easy to keep, but it risks feeling like a wizard that hides the portfolio behind consent, so the skip link and the unlocked step bar were added. Though, I do feel like the inital steps of going through my portofolio website might discourage visitors from visiting the page again in the future.'
  },
  {
    n: 17,
    slug: '17-mid-air-data',
    title: 'Mid-air Data',
    date: '2026-10-06',
    concept: 'Buoyanc\u00e9 can show abstract data in mid-air, so the page is a 3D mid-air display: a 3D chart where every stop on my path is a black balloon tethered to a robot. Left to right is when it happened, front to back is the topic, and height is the setting (in class, in the lab, in the graduate program). You turn the chart, and a table holds the same data.',
    tried: [
      'A small 3D engine on a plain canvas: rotate, project with perspective and draw far to near. You can drag to turn it, use the Turn and Tilt sliders, or jump to a Front, Side or Top view, where the front reads like a timeline and the top shows the topic lanes. It turns slowly on its own until you touch it, and a Spin button stops that.',
      'A table beside the chart lists the same eight points with the values for each axis, and it is the keyboard and screen reader way in. Picking a balloon or a row opens its description, with the Buoyanc\u00e9 photos plain below it. Labels are kept clear of the other balloons and each other.'
    ],

    learned: 'The three axes are my own reading of the work, not facts: the topics follow each project\u2019s tags and the settings are where it happened, so they are worth a check. A 3D scene needs a plain, accessible twin, which is why the table matters. It also overlaps designs 01 and 06 in its balloons, so the display itself (the box, axes and table) has to carry the difference. Though there is a direct reference to my work and is in a form quite common in 3D-Modelling and Printing processes, the interface is a bit difficult to navigate making the information seem disorganized'
  },
  {
    n: 18,
    slug: '18-pins-and-balloons',
    title: 'Pins and Balloons',
    date: '2026-10-06',
    concept: 'A first step towards the convergence designs: one page that changes its whole theme as you scroll, based on what you are reading. The early work (the intro and undergrad) sits on the dark pin display from design 3, then the page lights up into a clean white room of tethered balloons from design 1 for the lab and Buoyanc\u00e9, and ends on a dusk pin display with glowing balloons for now.',
    tried: [
      'The theme belongs to the section you are in: a small observer sets a theme and a pin-display mode on the page, so the colours, the cards and the pin field all fade over a second as you cross a chapter boundary. The pins ripple when the room changes, then fade out entirely in the white room (and stop being drawn) so the balloons own that space.',
      'The balloons are the real links, not decoration: in the lab chapter they open the ACM paper, the lab project page and the PDF, and in the last chapter they are email, LinkedIn and my previous portfolio. They keep design 1\u2019s rules (springs home, pushed away from the hand, a rope of fixed length to a robot) and rise off their robots when you scroll to them. The header shows the four chapters, and PenPal is kept to a short note under undergrad on purpose.'
    ],
    learned: 'Letting scroll position pick the theme makes the page feel like it has chapters, but it only works if every chapter also reads fine without the effect, so all text sits on solid cards. Though the landing page looks similar, I do not think this is how I want to move forward with future convergent designs.'
  },
  {
    n: 19,
    slug: '19-storyboard',
    title: 'The Storyboard',
    date: '2026-10-06',
    concept: 'HCI researchers sketch an interaction as a storyboard before building it, and as a research towards actuated-tangible user interfaces I often storyboard to plan out how the video demonstrating the system`s capabilities will go. Hence, the page is my path as a printed storyboard sheet: a title slate with my photo, then seven numbered panels, each with a drawn scene, a shot type (wide, point of view, insert, medium, establishing, close-up) and one line of caption. It reads left to right and top to bottom, in the order things happened.',
    tried: [
      'Flat marker drawings in grey, black line and one red pen for whatever the eye should follow, the way a storyboard artist works: a person between a code board and a chart for the two degrees, a headset under water for the VR project, a pen for PenPal as a small insert panel, a robot reeling a tether, a laptop in front of a skyline, balloons tethered to robots, and a glowing balloon with an arrow out of the frame for now.',
      'Every panel shows a caption on the sheet and opens as a full scene (picture, full text, and for Buoyanc\u00e9 the paper links and photos) with previous and next buttons to step through them in order. The whole panel is the click target, and the panels draw in as you scroll (all visible at once for reduced motion). PenPal is a small panel, since it was a small class project.'
    ],
    learned: 'With every stop visible on one sheet, navigation is almost free, which is the lesson from the 3D chart where moving around was hard. The risk is the same as the sketchbook: it can read as just illustrations, so each scene is tied to something specific in my content. This method also brings in nods to common HCI practices while also maintaining an easy-to-understand visual chronological order unlike the other HCI practice themes.'
  },
  {
    n: 20,
    slug: '20-fidelity',
    title: 'Fidelity',
    date: '2026-10-06',
    concept: 'A design starts as a sketch, becomes a wireframe and ends polished, so the page does too as you scroll. Along the theme of video-making I have taken the storyboarding prototyping process and combined it with the text and scroll style of Design 11, which I particularly liked other than the loud font that made sense for the print-them but did not necessarily suit my own tastes. The content and layout never change, only the finish, and a show as switch puts the whole page at one level.',
    tried: [
      'Every section carries its own fidelity level. The header shows the version of the section in view (v0.1 sketch, v0.5 wireframe, v1.0 polished), and each chapter has a tag with its level.',
      'Sketch and wireframe photos are grayscale and the polished ones are in colour, but they are always real photos, never placeholders, and all text stays real and readable at every level. PenPal is a single small note in the sketch section. Nothing needs a pointer or a hover: the switch is four plain buttons.'
    ],
    learned: 'Using the design process as the interface turns the transitions into the content, and it is the easiest of the convergence ideas to navigate because the page is a plain scroll. It only works if the layout is identical across levels, which meant writing the components once and styling them three ways. The fonts cannot animate, so they swap at the start of the transition while everything else glides.'
  },
  {
    n: 21,
    slug: '21-lab-hallway',
    title: 'The Lab Hallway',
    date: '2026-10-06',
    concept: 'The page is the hallway of a lab, in first person: scroll (or swipe) and you walk down it, with the earliest door nearest the entrance. Each stop is a numbered door with a hanging sign, the doors swing open as you pass and light spills out onto the floor, the photos from the Buoyanc\u00e9 work hang on the wall, a small robot with a black balloon stands in the middle, and the end of the hall has an exit sign and a front desk for contact.',
    tried: [
      'The hallway is 3D, with no library: walls, floor and ceiling are planes, the doors and signs are placed on them, and scrolling moves the whole hall towards you (smoothed, so it feels like a stride). A directory of seven numbered rooms is always on screen and walks you to a door, arrow keys step from room to room, and a bar at the bottom always says which room is ahead of you with an Enter button.',
      'Going into a room opens its content as a lit room with the same text and photos as the other designs, with previous and next. Hanging signs face you so they read straight on from far away; the doors and signs are clicked by where they are drawn, because the browser would not hit-test small, far-away 3D elements reliably. The mouse also lets you look around a few degrees, but only slightly, so signs stay where you aim.'
    ],
    learned: 'This feels like the most immersive design so far, but it almost trades immersiveness for usability. The 3D effect while fun to interact with detracts from the glanceability and intuitiveness of how to navigate through the page. While this was a cool concept, I do no think it is very practical to move forward with.'
  }
];

/* ---------- render ---------- */
const tracker = document.getElementById('tracker');
const timeline = document.getElementById('timeline');
document.getElementById('count').textContent = `${ENTRIES.length} / ${TOTAL}`;

for (let i = 1; i <= TOTAL; i++) {
  const entry = ENTRIES.find(e => e.n === i);
  const li = document.createElement('li');
  li.className = entry ? 'done' : '';
  if (entry) {
    const a = document.createElement('a');
    a.href = '#design-' + i;
    a.textContent = String(i).padStart(2, '0');
    a.title = entry.title;
    li.appendChild(a);
  } else {
    li.textContent = String(i).padStart(2, '0');
  }
  tracker.appendChild(li);
}

function h(tag, props, ...kids) {
  const n = document.createElement(tag);
  Object.entries(props || {}).forEach(([k, v]) => n.setAttribute(k, v));
  kids.flat().forEach(k => { if (k != null && k !== false) n.append(k); }); // skip missing pieces
  return n;
}

ENTRIES.forEach(e => {
  const url = `designs/${e.slug}/index.html`; // explicit file, so it also works when opened from disk
  const frame = h('iframe', { src: url, title: `Live preview of ${e.title}`, loading: 'lazy', tabindex: '-1', scrolling: 'no' });
  const preview = h('a', { class: 'preview', href: url, 'aria-label': `Open design ${e.n}: ${e.title}` }, frame, h('span', { class: 'open' }, 'Open design →'));

  const card = h('li', { class: 'entry', id: 'design-' + e.n },
    h('div', { class: 'num', 'aria-hidden': 'true' }, String(e.n).padStart(2, '0')),
    h('article', null,
      h('header', null,
        h('h3', null, e.title),
        h('time', { datetime: e.date }, e.date)),
      preview,
      e.concept && h('p', { class: 'concept' }, e.concept),
      (e.tried?.length || e.learned || e.next) && h('div', { class: 'cols' },
        e.tried?.length && h('section', null, h('h4', null, 'What I tried'), h('ul', null, e.tried.map(t => h('li', null, t)))),
        (e.learned || e.next) && h('section', null,
          e.learned && [h('h4', null, 'What I learned'), h('p', null, e.learned)],
          e.next && [h('h4', null, 'Next time'), h('p', null, e.next)])),
      e.tech?.length && h('ul', { class: 'tech', 'aria-label': 'Techniques' }, e.tech.map(t => h('li', null, t)))));
  timeline.appendChild(card);
});

if (ENTRIES.length < TOTAL) {
  timeline.appendChild(h('li', { class: 'entry next' },
    h('div', { class: 'num', 'aria-hidden': 'true' }, String(ENTRIES.length + 1).padStart(2, '0')),
    h('article', null, h('p', { class: 'concept' }, 'Next design in progress…'))));
}

/* ---------- cards view: every design at a glance ---------- */
const cardsEl = document.getElementById('cards');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

ENTRIES.forEach(e => {
  const url = `designs/${e.slug}/index.html`;
  // previews are live pages, so they load only while a card is near the screen (see the observer below)
  const frame = h('iframe', { 'data-src': url, title: `Live preview of ${e.title}`, tabindex: '-1', scrolling: 'no' });
  const preview = h('a', { class: 'preview', href: url, tabindex: '-1', 'aria-label': `Open design ${e.n}: ${e.title}` }, frame, h('span', { class: 'open', 'aria-hidden': 'true' }, 'Open design →'));
  const notes = h('button', { type: 'button', class: 'notes' }, 'Read the notes');
  notes.addEventListener('click', () => {
    setView('timeline');
    document.getElementById('design-' + e.n).scrollIntoView({ block: 'start' });
  });
  cardsEl.appendChild(h('li', { class: 'card', id: 'card-' + e.n },
    preview,
    h('div', { class: 'card-body' },
      h('div', { class: 'card-head' },
        h('span', { class: 'card-num', 'aria-hidden': 'true' }, String(e.n).padStart(2, '0')),
        h('h3', null, e.title),
        h('time', { datetime: e.date }, e.date)),
      e.concept && h('p', { class: 'card-concept' }, e.concept),
      h('div', { class: 'card-actions' }, h('a', { class: 'go', href: url }, 'Open design →'), notes))));
});

if (ENTRIES.length < TOTAL) {
  cardsEl.appendChild(h('li', { class: 'card next' },
    h('span', { class: 'card-num', 'aria-hidden': 'true' }, String(ENTRIES.length + 1).padStart(2, '0')),
    h('p', { class: 'card-concept' }, 'Next design in progress…')));
}

// Keep at most the nearby previews running: load when close, unload when far, so many live pages never run at once.
const mountObserver = new IntersectionObserver(entries => {
  entries.forEach(en => {
    const f = en.target.querySelector('iframe');
    if (en.isIntersecting && f.dataset.live !== '1') { f.src = f.dataset.src; f.dataset.live = '1'; }
    else if (!en.isIntersecting && f.dataset.live === '1') { f.src = 'about:blank'; f.dataset.live = '0'; }
  });
}, { rootMargin: '250px 0px' });
cardsEl.querySelectorAll('.preview').forEach(p => mountObserver.observe(p));

/* ---------- switching views (kept in the URL hash, since nothing may be stored) ---------- */
const segButtons = [...document.querySelectorAll('.seg button')];
const viewNote = document.getElementById('view-note');
const NOTES = {
  timeline: 'The story: what I tried and learned for each design, oldest first.',
  cards: 'Every design at a glance. Click a card to open it live.'
};

function setView(view) {
  view = view === 'cards' ? 'cards' : 'timeline';
  document.body.dataset.view = view;
  timeline.hidden = view !== 'timeline';
  cardsEl.hidden = view !== 'cards';
  segButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
  viewNote.textContent = NOTES[view];
  history.replaceState(null, '', view === 'cards' ? '#cards' : location.pathname + location.search);
  fitPreviews();
}
segButtons.forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));

// in cards view the progress tracker jumps to the card instead of the timeline entry
tracker.addEventListener('click', ev => {
  const a = ev.target.closest('a');
  if (!a || document.body.dataset.view !== 'cards') return;
  ev.preventDefault();
  const card = document.getElementById('card-' + a.getAttribute('href').replace('#design-', ''));
  if (card) card.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
});

/* scale each 1440x900 iframe to fit its card (hidden views have no width yet, so skip them) */
function fitPreviews() {
  document.querySelectorAll('.preview').forEach(p => {
    if (p.clientWidth) p.querySelector('iframe').style.transform = `scale(${p.clientWidth / 1440})`;
  });
}
addEventListener('resize', fitPreviews);

const startView = location.hash === '#cards' || new URLSearchParams(location.search).get('view') === 'cards' ? 'cards' : 'timeline';
if (startView === 'cards') setView('cards'); else fitPreviews();

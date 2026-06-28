# Frontend Contribution - albelope

This document explains my contribution to the frontend of `ft_transcendence`.
My work focused mainly on the visible side of the project:
the interface, navigation flow, responsive layout, 2D game UI, 3D visual hub, settings pages,
language support, reusable components, and the overall user experience.
--
## 1. My role
### Developer: albelope

- **Primary role:** Frontend Developer
- **Additional focus:** UI/UX, 2D game frontend, 3D frontend integration.

### Main responsibilities
- Build and organize the React frontend structure.
- Create and maintain the main route system.
- Design and improve the visual layout of the application.
- Implement responsive pages, menus, and shared layouts.
- Work on the 2D local Pong interface and settings pages.
- Work on the 3D hub experience using Babylon.js.
- Add reusable UI components.
- Add and maintain frontend internationalization.
- Connect frontend pages with the rest of the project when needed.
- Keep the frontend understandable, maintainable, and defendable for evaluation.
---

## 2. What the frontend does

The frontend is the part of the application that the user sees and interacts with.
Its job is to present the project clearly, let the user move through the available sections,
display game interfaces, render the 3D experience, and expose the settings and legal pages.

The frontend is responsible for:
- displaying the application pages;
- managing navigation between routes;
- rendering shared UI such as header, footer, menus, and layouts;
- exposing the login, profile, friends, privacy, and terms pages from the interface side;
- rendering the 2D local game pages and related menus;
- rendering the 3D hub / world visual experience;
- exposing settings pages for interface and game customization;
- switching the displayed language;
- persisting some frontend preferences locally;
- providing access to the remote game page;
- creating a consistent visual identity for the project.

The frontend does **not** own secure backend logic.
For example:
- authentication validation belongs to backend services;
- password hashing belongs to backend services;
- database writes belong to backend services;
- authoritative multiplayer state belongs to backend/game services.
The frontend prepares the user experience and communicates with the rest of the system when needed,
but it is not the source of truth for protected data or security-critical logic.
---

## 3. Complete frontend stack

This section lists the main frontend technologies and why they were used.
| Technology | Purpose in the project |
|---|---|
| React | Main UI library used to build the application through reusable components. |
| TypeScript | Adds type safety and makes code easier to understand, refactor, and defend. |
| Vite | Development server and build tool for fast startup and production bundling. |
| React Router | Controls navigation inside the Single Page Application. |
| Tailwind CSS | Utility-first styling system used for most layout and visual work. |
| CSS | Used together with Tailwind for specific custom visual cases. |
| Zustand | Lightweight global state management for shared frontend/game settings. |
| i18next | Translation engine used for multilingual text management. |
| react-i18next | Connects i18next to React components through hooks and providers. |
| i18next-browser-languagedetector | Detects the preferred browser language and helps persist language choice. |
| Babylon.js | Main 3D engine used to create the visual hub and 3D interactions. |
| @babylonjs/loaders | Enables loading external 3D assets such as `.glb` models. |
| draco3d | Used for compressed 3D model support and optimization. |
| earcut | Utility required for some mesh/geometry operations used by Babylon-related workflows. |
| Canvas 2D API | Used to render the local 2D Pong gameplay efficiently. |
| Framer Motion | Used for interface animations and smoother visual transitions. |
| lucide-react | Icon library used in the frontend UI. |
| clsx | Helps compose conditional class names in React components. |
| tailwind-merge | Prevents conflicting Tailwind classes when combining styles dynamically. |
| localStorage | Persists lightweight frontend preferences such as theme or display settings. |
| ESLint | Helps maintain code quality and catch common mistakes during development. |

---

## 4. External assets, AI-assisted content, and licenses

Besides code libraries, the frontend also uses visual and media resources.
These are not the same thing as core technologies, so they should be documented separately.

### 3D and visual asset sources

- Some `.glb` 3D assets were generated or prepared with the help of external tools such as Meshy.
- Some images or visual materials were assisted by AI tools such as Gemini or ChatGPT.
- Some video content used in the visual experience was prepared as part of the frontend presentation layer.

### Compression / model delivery
- Draco compression was used to reduce the weight of some 3D assets and improve loading.

### Licensed content
- Some character/player assets were taken from resources that allow free non-commercial use.
---

## 5. Why these technologies were useful

### React
React helped divide the frontend into reusable pieces instead of building one giant page.
This was especially useful because the project contains many different kinds of screens:
menus, legal pages, profile-related pages, settings pages, 2D game pages, and a 3D page.
React was useful for:

- reusable components;
- page composition;
- conditional rendering;
- shared layout patterns;
- easier maintenance;
- better separation of responsibilities.

### TypeScript
TypeScript made the frontend safer and easier to reason about.
It helped define what kind of values functions, components, stores, route params, and game systems should receive.
This was useful in:
- component props;
- route parameters;
- Zustand store definitions;
- 2D game entities;
- 3D hook/class interactions;
- translation-related utilities;
- callbacks and event handlers.
It also reduced common bugs such as:
- passing `null` where a value is required;
- assuming a route param always exists;
- forgetting optional values;
- mixing incompatible object shapes.

### Vite
Vite was used to run and build the frontend quickly.
It improves the development workflow because startup and hot updates are fast.
Important scripts:
```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### React Router
React Router is the navigation system of the frontend.
It allows the application to behave like a Single Page Application while still having multiple views.
Main routes include:

- `/`
- `/start`
- `/sections/:section`
- `/menu2D`
- `/home`
- `/game`
- `/settings`
- `/settingsUiPage`
- `/gamesettings`
- `/display`
- `/play1vsgame`
- `/play2vsgame`
- `/playspectator`
- `/login`
- `/profile`
- `/friends`
- `/privacy`
- `/terms`
- `/remote-game`

One important routing detail is that invalid dynamic section routes are redirected to `/start`.
This protects the app from rendering unsupported sections when the URL is wrong.

### Tailwind CSS and CSS
Tailwind CSS was useful because it allowed fast UI iteration.
It helped build layouts, spacing systems, mobile responsiveness, hover states, cards, menus, typography,
and many visual sections without creating too many isolated CSS files.
It was mainly used for:
- spacing;
- layout;
- colors;
- text sizing;
- shadows;
- borders;
- backgrounds;
- responsive breakpoints;
- desktop/mobile adaptation.

Custom CSS was still useful for some specific cases where utility classes alone were not enough,
so the frontend ended up using a hybrid approach:
mostly Tailwind, plus a small amount of targeted CSS customization.

### Zustand
Zustand was used as a lightweight global state solution.
The reason it was useful is that not all state belongs inside a single component.
Some values need to be shared by multiple parts of the frontend and persisted across refreshes.
Examples of frontend/game settings handled through stores:
- 2D display preferences such as ball color, paddle color, ball size, or ball trail;
- 2D game settings;
- loading or UI state used across screens;
- persisted 3D/game preferences such as player-related or camera-related settings.
Zustand was a good fit because it is simpler and lighter than a larger state-management framework,
while still being powerful enough for this project.

### i18next, react-i18next, and language detection
The frontend supports multiple languages through i18next.
Texts are stored through translation keys instead of hardcoding every string directly in every component.
The current frontend language system supports:
- Spanish;
- English;
- French.
This setup is useful because:
- text is centralized;
- components remain cleaner;
- switching languages is easier;
- the chosen language can be remembered;
- browser language can be used as an initial hint;
- fallback behavior can be defined when a translation is missing.

### Babylon.js
Babylon.js was used for the 3D hub because a 3D scene has very different needs from a standard UI page.
React is very good at declarative interface rendering, but a realtime 3D environment needs systems such as:
- scene creation;
- engine creation;
- camera control;
- lights;
- meshes and imported models;
- materials and effects;
- asset loading;
- render loops;
- interaction systems;
- cleanup/disposal.
That is why the 3D area is organized separately from the normal page UI.

### Canvas 2D API
The local Pong game uses a canvas-based render system.
This choice is important because a game loop updates many times per second.
If every ball or paddle movement depended on normal React re-renders,
the game would be less efficient and harder to keep smooth.
The 2D part separates:
- input handling;
- game state;
- physics;
- rendering;
- scoring;
- update loop.
This is a more game-oriented architecture than a standard component-only page.

### Framer Motion
Framer Motion improves the perceived quality of the interface.
It helps with transitions, appearance/disappearance of UI elements, and motion that feels smoother than abrupt changes.
Even if it is not the core of the application, it contributes to user experience and presentation quality.

### clsx and tailwind-merge
These utilities make dynamic styling easier to manage.
When components need conditional styles, `clsx` helps combine classes clearly,
and `tailwind-merge` helps resolve conflicting Tailwind utilities.
This improves:
- code readability;
- cleaner conditional class logic;
- fewer style conflicts.
---
## 6. Main frontend features I worked on

| Area | Contribution |
|---|---|
| Global frontend structure | Organized the app around a main router and shared layouts. |
| Routing | Added the main route map and safe redirects for invalid route sections. |
| Header and navigation | Built responsive desktop/mobile navigation. |
| Language selector | Added frontend language switching. |
| Session display | Displayed login/profile/logout UI according to frontend session information. |
| Shared layout | Worked on footer, page structure, and reusable visual sections. |
| Landing and start flow | Built visual entry pages and section navigation. |
| 2D game menu | Created the local 2D game navigation flow. |
| 2D local game frontend | Worked on the Pong interface, rendering flow, input, loop, and settings integration. |
| 2D settings | Added display and game customization pages for the local Pong experience. |
| 3D hub | Worked on Babylon.js visual integration and scene flow. |
| 3D loading lifecycle | Added loading progress behavior and scene lifecycle handling. |
| Visual assets | Added and organized images, videos, and 3D model resources. |
| Responsive design | Adjusted the frontend for desktop and smaller devices. |
| Privacy / Terms pages | Added required legal frontend pages. |
| Dockerized frontend build | Supported frontend build integration in the project stack. |
---

## 7. Frontend architecture and folder structure

The frontend is organized by responsibility.
This is important because the project mixes classic UI pages, a 2D game frontend, and a 3D world.

```txt
frontend/
|-- public/
|   |-- images/
|   |-- models/
|   `-- videos/
|-- src/
|   |-- assets/
|   |   `-- styles/
|   |-- core/
|   |   |-- i18n/
|   |   `-- router/
|   |-- game/
|   |   |-- config/
|   |   |-- effects/
|   |   |-- engine/
|   |   |-- physics/
|   |   |-- player/
|   |   |-- scenes/
|   |   `-- ui/
|   |-- shared/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- remote_game/
|   |   `-- store/
|   `-- ui2d/
|       |-- components/
|       `-- pages/
```

### `core/router`
Contains the main route configuration.
It centralizes how users move through the application and protects invalid dynamic routes.

### `core/i18n`
Contains the translation system configuration and language resources.
This is where the multilingual behavior is initialized.

### `shared/components`
Contains reusable interface elements such as:
- header;
- footer;
- buttons;
- layouts;
- cards;
- shared UI sections.

### `shared/pages`
Contains page-level frontend views such as:

- start/intro pages;
- section pages;
- settings pages;
- privacy page;
- terms page;
- profile/friends/login-related views.

### `shared/store`
Contains shared frontend state, especially Zustand stores used across multiple pages or features.

### `ui2d`
Contains the local 2D game interface and related frontend/game systems.
This part is separated because it behaves more like a small game engine than a normal page.

### `game`
Contains the Babylon.js 3D hub logic.
It is organized into scene setup, input/camera/game systems, effects, configuration, player logic, and UI integration.
---

## 8. Frontend startup flow
The general startup flow is:

1. The application entry point loads global styles.
2. The translation system is initialized.
3. The saved theme is read from local storage and applied early.
4. React renders the root application.
5. The router decides which page should be shown.
6. Shared layout/UI components render around the active page.

This flow matters because it shows that the frontend is not just "rendering pages":
it is initializing application-wide behavior before the user begins navigating.
---

## 9. Routing and page flow
The application is built as a Single Page Application.
That means page transitions do not require a full browser reload for every screen change.

The router is responsible for:
- defining which component belongs to each route;
- protecting invalid dynamic route values;
- redirecting unsupported paths to a safe screen;
- keeping navigation logic centralized.
The route structure also reflects the functional areas of the frontend:

- entry flow;
- section navigation;
- 2D game area;
- settings area;
- profile/social pages;
- legal pages;
- remote game access;
- 3D hub access.
This is important because navigation is part of the application architecture, not just a visual menu.
---

## 10. 2D game frontend
The local Pong frontend is built around a `canvas` and a custom update loop.
This is one of the clearest examples of why not every frontend feature should be handled like a normal React form/page.

### Why a canvas-based architecture was used
In a realtime game, many values change continuously:
- ball position;
- paddle position;
- collisions;
- score progression;
- animation timing;
- keyboard input state.
If all these updates were pushed through ordinary React state on every frame,
the component tree would re-render too often and performance would suffer.

### Separation of responsibilities
React handles:
- page rendering;
- menu flow;
- top-level game mode selection;
- settings UI;
- start/pause/restart controls;
- visible interface around the game.
The game layer handles:
- input processing;
- physics updates;
- movement;
- collision checks;
- score changes;
- direct drawing to canvas;
- winner / pause visual feedback.

### Why refs are important here
The 2D system uses refs for highly mutable values such as:
- ball position;
- paddle position;
- keyboard state;
- renderer instances;
- animation frame identifiers;
- game-loop related references.
Refs are useful because they allow updates without forcing a React re-render every frame.
---

## 11. 3D frontend with Babylon.js
The Babylon part is one of the most important sections to be able to explain clearly.
### Why the 3D area is separated from normal UI
A 3D world is not just another React page.
It needs:
- an HTML canvas;
- a Babylon engine;
- a Babylon scene;
- lights;
- imported models;
- materials/effects;
- a render loop;
- interaction systems;
- cleanup logic.
For that reason, the 3D area is organized into its own frontend domain.

### High-level Babylon flow
The real flow can be explained like this:
1. React renders the page that contains the 3D canvas.
2. A custom hook manages the Babylon lifecycle.
3. The hook creates or initializes the Babylon engine and scene.
4. Scene setup logic builds the 3D hub and loads assets.
5. Input, camera, collisions, proximity checks, and effects become active.
6. The scene runs through the Babylon render loop.
7. Interactions inside 3D can trigger changes in React UI panels.
8. When the user leaves the page, the scene is disposed to free memory and stop loops.

### Why this flow matters
This explains the relation between React and Babylon:
- React owns the page and surrounding UI.
- Babylon owns the realtime 3D world.
- Shared state and callbacks act as the bridge between both sides.

### Systems involved in the 3D area
The Babylon frontend is not only "one scene".
It includes concepts such as:
- scene configuration;
- camera control;
- input handling;
- player movement;
- collision systems;
- proximity systems;
- object interaction;
- hologram/highlight effects;
- loading progress logic;
- asset/model organization;
- cleanup/disposal.

## 12. Zustand and frontend state management
Zustand was used because the project needed shared state without introducing an unnecessarily heavy solution.
### What kind of state belongs in Zustand
Typical examples include:
- 2D display preferences;
- 2D game options;
- loading-related state;
- some frontend settings that are reused across screens;
- persisted settings that should survive refreshes.
### Why not everything should be local component state
Component state is useful when data only matters inside one component.
But some values need to be:
- shared between pages or systems;
- reused by UI and gameplay layers;
- persisted;
- centralized for easier maintenance.
That is where Zustand is useful.

### Persistence
Some stores persist data through `localStorage`.
This allows the user to keep preferences after refreshing the application.
Examples:
- selected visual preferences;
- display configuration;
- theme-related information;
- some game/hub-related frontend configuration.
---
## 13. Settings and local storage
I worked on settings-related frontend pages and state handling.
This area is important because it affects customization and user comfort.
Examples of frontend-side settings include:
- UI theme;
- ball color;
- paddle color;
- ball size;
- ball trail;
- display-related options;
### Important distinction
Not every setting has the same meaning.
Some settings are **frontend-only preferences**, for example:
- color choices;
- visual display preferences;
- theme;
- interface behavior.
Other values may affect the game experience more directly,
but are still stored from the frontend side as user options.
---

## 14. Internationalization
The frontend supports multiple languages using i18next and its React integration.
### Current supported languages
- `es`
- `en`
- `fr`
### How it works
- the application stores translation text in language files;
- components use translation keys instead of hardcoded text;
- the user can switch language from the UI;
- browser language can be detected automatically;
- fallback behavior is available when a translation is missing;
- the chosen language can be remembered.
---

## 15. Responsive design
Responsive design was an important part of the frontend work.
The project is not only a desktop interface; it must remain understandable on smaller screens as well.
Work in this area included:
- desktop navigation;
- mobile navigation;
- compact header behavior;
- responsive spacing/layout;
- adaptable cards and menus;
- prevention of broken layouts on smaller screens;
- touch-friendly behavior where needed.
---

## 16. Privacy and Terms pages
The frontend includes dedicated pages for:
- Privacy Policy;
- Terms of Service.
---
## 17. Frontend Docker integration
The frontend is also part of the containerized project workflow.
The Dockerized frontend build generally follows this logic:
1. install dependencies;
2. build the production frontend;
3. use the generated build output;
4. serve the built frontend inside the project deployment stack.
---

## 18. Problems and challenges we faced
### 1. Understanding the size of a real frontend project
One early challenge was realizing that the frontend was not "just a few pages".
It contained many layers:
- routes;
- components;
- shared layouts;
- stores;
- translation files;
- 2D game logic;
- 3D rendering logic;
- settings;
- assets;
- responsive behavior.
The solution was to divide the frontend by responsibility and understand what each folder/domain was for.

### 2. Routing and navigation
The app contains many screens and flows.
The challenge was keeping navigation understandable while avoiding broken routes.
The solution was to:
- centralize route definitions;
- validate dynamic route parameters;
- redirect invalid cases to a safe location.

### 3. Responsive header and mobile menu
The header was one of the most delicate UI components because it had to combine:
- navigation;
- language switching;
- session-related display;
- mobile adaptation;
- touch-device behavior.
The challenge was preventing overlapping UI and making menus close correctly during navigation.

### 4. localStorage and session display
The frontend reads lightweight session-related information to decide what to show in the interface,
for example whether profile/logout actions should be visible.

### 5. TypeScript and nullable browser values
Browser and router APIs often return nullable or optional values.
Examples include:
- route parameters;
- `localStorage.getItem`;
- canvas context access;
- DOM element queries;
- optional callbacks.
TypeScript forced safer handling of these cases.

### 6. Separating React state from game engine state
The 2D game made it clear that not everything should live in regular component state.
The challenge was avoiding unnecessary re-renders while keeping the system understandable.

### 7. Cleaning event listeners
Keyboard/game events must not remain active after leaving the game page.
Proper cleanup is necessary to avoid duplicated behavior or side effects.

### 8. Babylon.js lifecycle management
The 3D scene must be created, updated, and disposed in a controlled way.
If this is done poorly, the frontend can accumulate duplicated render loops, stale listeners, or leaked resources.

### 9. Asset loading and organization
The frontend uses images, videos, and `.glb` models.
The challenge was keeping asset paths predictable and the visual resources organized.

### 10. Browser-related visual issues
Some visual or console issues may appear differently across browsers.
One example during development was handling a Firefox-related rendering issue by adjusting the HDRI/environment usage.
This is worth mentioning because browser behavior is not always identical,
especially in graphics-heavy frontend work.
---

## 11. Frontend modules related to my work
| Module | Type | My frontend contribution |
|---|---|---|
| Frontend framework | Part of Web major | React + TypeScript + Vite frontend architecture |
| Custom-made design system / reusable components | Minor | Shared buttons, layouts, header, cards, settings UI, reusable interface sections |
| Multiple languages | Minor | i18next-based translation system with Spanish, English, and French |
| Complete web-based game | Major | Frontend game pages and local 2D game interface |
| Advanced 3D graphics | Major | Babylon.js 3D hub and its integration with the frontend |
| Game customization options | Minor | Frontend settings pages and local customization options |
| Additional browser support | Minor, if validated by the team | Frontend tested/adapted beyond one browser when applicable |
---

```
src/                             # **Source code** directory.
├── app/                         # **NextJS App Routing**. _(Keep this folder minimal)_
│   ├── globals.css              # **Global CSS** file.
│   ├── layout.tsx               # Project global structure. **Motherboard of the project**.
│   ├── page.tsx                 # The "**Scroll Container**". Registered in _layout.tsx_.
|   └── error.tsx                # Handle unexpected runtime errors.
├── components/                  # Place where we keep all the **Global UI components**. _(.tsx files)_
│   ├── layout/                  # **Sub-layouts** which we add in _page.tsx_. (Think of a _mini-motherboard_)
│   │   ├── Header.tsx
│   │   ├── SettingsModal.tsx
│   │   └── Footer.tsx
│   └── ui/                      # All reusable, modular, non-logical - **UI elements**.
│       ├── Countdown.tsx
│       ├── Icon.tsx
│       ├── LocationBadge.tsx
│       ├── Skeleton.tsx
│       ├── StatusScreen.tsx
│       └── Toast.tsx
├── lib/                         # **Global Helpers**.
│    ├── constants.ts
│    ├── date-utils.ts
│    ├── ipProviders.ts
│    ├── locCache.ts
│    └── storage.ts
└── modules/                     # **Segregation of project's section as per business logic**.
   └── prayer/                   # THE CORE MODULE.
       ├── components/           # UI components. (.tsx files) for _prayer_ module only. Mostly each file are **individual page**.
       │   ├── PrayerHero.tsx
       │   ├── PrayerTable.tsx
       │   ├── MakruhCard.tsx
       │   └── DateNav.tsx
       ├── hooks/                # **Business logic** of the _prayer_ module.
       │   ├── useGeolocation.ts
       │   ├── useHijriDate.ts
       │   ├── useOnlineStatus.ts
       │   ├── usePrayerTimes.ts
       │   ├── useSettings.ts
       │   ├── useSettings.ts
       │   └── useTheme.ts
       └── utils.ts              # **Helpers** for _prayer_ module.
```

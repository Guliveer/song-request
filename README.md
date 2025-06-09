![React Badge](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000&style=for-the-badge)
![Next.js Badge](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=fff&style=for-the-badge)
![MUI Badge](https://img.shields.io/badge/MUI-007FFF?logo=mui&logoColor=fff&style=for-the-badge)
![Supabase Badge](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=fff&style=for-the-badge)
![PostgreSQL Badge](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=fff&style=for-the-badge)
![Brevo Badge](https://img.shields.io/badge/Brevo-0B996E?logo=brevo&logoColor=fff&style=for-the-badge)
![Vercel Badge](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=fff&style=for-the-badge)
![Spotify API Badge](https://img.shields.io/badge/Spotify%20API-1ED760?logo=spotify&logoColor=fff&style=for-the-badge)
![YouTube API Badge](https://img.shields.io/badge/YouTube%20API-F00?logo=youtube&logoColor=fff&style=for-the-badge)

# 🎧 Track Drop

**Track Drop** is a modern web app for handling music requests during events, parties, or streams. It offers:

- Simple interface for submitting and browsing songs
- Voting system for requests
- Admin panel for queue management
- Responsive design (MUI)

This project is a semester assignment at university and is an expansion of a personal project.
The original version was built in PHP, followed by an attempt to migrate it to SvelteKit.
Ultimately, as part of this team assignment, we collectively decided to rebuild it using Next.js and Supabase for a more scalable and modern solution.

➡️ Check out our [GitHub Project board](https://github.com/users/Guliveer/projects/2) and see our journey!

## 🛠️ How We Worked

#### IDE

> ![WebStorm Badge](https://img.shields.io/badge/WebStorm-000?logo=webstorm&logoColor=fff&style=flat-square)  
> [JetBrains WebStorm](https://www.jetbrains.com/webstorm/) - Our main development environment, ensuring consistent code style and efficient collaboration, although each and every team member was free to use their preferred IDE.

#### Version Control System

> ![GitHub Badge](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=fff&style=flat-square)  
> [GitHub](https://github.com/about) - All code was managed via GitHub repositories, with regular pull requests, code reviews, and feature branching.

#### Database

> ![Supabase Badge](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=fff&style=flat-square)  
> [Supabase](https://supabase.com) - Used for PostgreSQL database hosting, authentication, and real-time data management.

#### Backlog & Task Management

> ![GitHub Projects Badge](https://img.shields.io/badge/GitHub%20Projects-181717?logo=github&logoColor=fff&style=flat-square)  
> [GitHub Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects) - We tracked tasks, bugs, and progress using project boards and issues.

#### Team Communication

> ![Slack Badge](https://img.shields.io/badge/Slack-4A154B?logo=slack&logoColor=fff&style=flat-square)  
> [Slack](https://slack.com/about) - Daily communication, quick questions, and coordination.

#### Additional Tools

> ![GitKraken Badge](https://img.shields.io/badge/GitKraken-179287?logo=gitkraken&logoColor=fff&style=flat-square)  
> [GitKraken](https://www.gitkraken.com/git-client) - For visualizing git history, resolving merge conflicts, and simplifying complex git operations.

## ⚙️ Tech Overview

- **Frontend:** [React](https://react.dev) + [Next.js](https://nextjs.org)
- **UI:** [MUI](https://mui.com)
- **Animations:** [Framer Motion](https://motion.dev)
- **Database:** [Supabase](https://supabase.com)
- **Auth:** [Supabase Auth](https://supabase.com/auth)
- **External APIs:** [Spotify API](https://developer.spotify.com), [YouTube API](https://developers.google.com/youtube/v3)
- **CI/CD:** [Vercel](https://vercel.com)
- **SMTP:** [Brevo](https://brevo.com)

## 🧠 Our Team

|                                                 Project&nbsp;Lead                                                 |                                                   Backend&nbsp;&amp;&nbsp;Auth Specialist                                                   |                                                     API&nbsp;Integration Engineer                                                      |                                                             UI/UX Designer                                                             |
| :---------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------: |
| [<img src="https://github.com/Guliveer.png?size=512" width="128"><br/>**@Guliveer**](https://github.com/Guliveer) |               [<img src="https://github.com/Deerion.png?size=512" width="128"><br/>**@Deerion**](https://github.com/Deerion)                | [<img src="https://github.com/lukaszgrzecznik.png?size=512" width="128"><br/>**@lukaszgrzecznik**](https://github.com/lukaszgrzecznik) | [<img src="https://github.com/lifeoverthinker.png?size=512" width="128"><br/>**@lifeoverthinker**](https://github.com/lifeoverthinker) |
|       Managed task assignments, supervised the team's work, and introduced many key changes to the project.       | Responsible for database work, implementing authentication processes, 2FA, and password recovery. Took on many smaller but essential tasks. |                            Focused on the most challenging tasks, including integrating with external APIs.                            |                          Made sure the application looks beautiful and provides a&nbsp;great user experience.                          |

## 🚀 Getting Started

Create a `.env.local` file in the root of the project and add your environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_REDIRECT_URL=url_to_redirect_after_authentication

SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
```

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Then open: [http://localhost:3000](http://localhost:3000)

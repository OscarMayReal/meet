# Meet
Meet is an open source video conferencing platform.

## Tech Stack
- Next.js
- LiveKit
- Prisma
- Socket.io
- KeyStone

## Demo
### URL
https://meet.qplus.cloud
### User accounts:
#### Admin
- username: somtesting/admin
- password: test

#### User
- username: somtesting/user
- password: test

## Setup

1. If you don't have a KeyStone Tenant, Create at https://keystone.qplus.cloud/get-started/team if you don't have a domain, or https://keystone.qplus.cloud/get-started if you have a domain (make sure to verify your domain)
2. go to https://meet.qplus.cloud
3. click on "Get Started"
4. Click "Acquire App"
5. Click "Quntem Meet" from the list of apps
6. under "app access", type in your username, (without the tenant), and click "search", then click your username that shows up. repeat this step for each user you want to give access to.
7. sign out and sign back in to KeyStone (this is required for every user you newly added)
8. navigate back to https://meet.qplus.cloud
9. click on "Login"

## Self-hosting

1. Setup an app on keystone
2. Clone the repository
3. run `npm install` in meet-backend
4. create a .env file in meet-backend. the .env.example file can be used as a template
5. run `npm install` in meet-frontend
6. create a .env file in meet-frontend. the .env.example file can be used as a template
7. run `npm run build` in meet-frontend
8. run `npm run start` in meet-frontend (or `npm run start-no-https` in meet-frontend if you are using cloudflare tunnel)
9. run `npm run start` in meet-backend

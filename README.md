# Seasonal Calendar 2

A Calendar with seasonal backgrounds, events, holidays, weather, weathers and ability to upload events from just an image.

## Requirements

- Node.js v20+
- `Gemini API Key`: For reading dates from images (Optional)
- `Mongo DB`: For saving events and login data (Optional)
- `SMTP Server`: For sending events notifications

### Note: 
- Without optional requirements, your calendar will still work but will have a lot less features
- Mail wasn't tested, use it at your own risk

## Installation

To install and run the project locally, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/itzshubhamdev/seasonal-calendar.git
```

2. Navigate to the project directory:

```bash
cd seasonal-calendar
```

3. Install dependencies:

```bash
npm install
```

4. Configure the Environment Variables

5. Start the application:

```bash
npm run dev
```

## Deployment

1. Clone the repository:

```bash
git clone https://github.com/itzshubhamdev/seasonal-calendar.git
```

2. Navigate to the project directory:

```bash
cd seasonal-calendar
```

3. Install dependencies:

```bash
npm install
```

4. Configure the Environment Variables

5. Build the client side code:

```bash
npm run build
```

6. Serve using

```bash
npm start
```

## Environment Variables

- GEMINI_KEY: Gemini Api Key for reading images
- MONGODB_URI:  MongoDB connection string for storing events and user data
- AUTH_SECRET: Random string, you can use https://generate-secret.vercel.app/32
- MAIL_HOST: SMTP Host
- MAIL_PORT: SMTP Port
- MAIL_USER: SMTP User
- MAIL_PASS: SMTP Password

## Country Not Available in date.nager.at

Download holidays using [Abstract API](holidays.abstractapi.com)

1. Configure `index.ts`
2. Run `npx tsx index.ts` to download holidays
3. If anything goes wrong, there should a backup in backups/

## Usage

Once the application is running, you can access the calendar through your web browser at `http://localhost:3000`.

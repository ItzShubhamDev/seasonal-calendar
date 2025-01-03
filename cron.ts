import cron from "node-cron";
import mail from "nodemailer";
import { Event } from "./schemas/Event";
import { User } from "./schemas/User";

const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } = process.env;

let transporter: mail.Transporter | null = null;

if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASS) {
    console.error("Missing mail configuration, Mailing is disabled");
} else {
    transporter = mail.createTransport({
        host: MAIL_HOST,
        port: Number(MAIL_PORT),
        secure: true,
        auth: {
            user: MAIL_USER,
            pass: MAIL_PASS,
        },
    });
}

cron.schedule("0 0 * * *", async () => {
    if (!transporter) return;

    const currentDate = new Date();

    const events = await Event.aggregate([
        {
            $match: {
                date: {
                    $gte: new Date(currentDate.setHours(0, 0, 0, 0)),
                    $lt: new Date(currentDate.setHours(23, 59, 59, 999)),
                },
            },
        },
        {
            $group: {
                _id: "$userId",
                events: { $push: "$event" },
            },
        },
    ]);

    if (events.length === 0) return;

    for (const userEvents of events) {
        const user = await User.findById(userEvents._id);
        if (!user) continue;

        try {
            await transporter.sendMail({
                from: MAIL_USER,
                to: user.email,
                subject: "Today's events",
                text: userEvents.events.join("\n"),
            });
        } catch (error) {
            console.error(error);
        }
    }
});
